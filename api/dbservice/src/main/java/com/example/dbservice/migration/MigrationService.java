package com.example.dbservice.migration;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.IndexOptions;
import org.bson.BsonType;
import org.bson.Document;
import org.bson.codecs.DecoderContext;
import org.bson.codecs.DocumentCodec;
import org.bson.json.JsonReader;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MigrationService {

    private final MongoDatabase database;
    private final MongoCollection<Document> meta;
    private final Path migrationsDir;

    public MigrationService(com.mongodb.client.MongoClient mongoClient,
                            @Value("${SPRING_DATA_MONGODB_DATABASE:mini}") String dbName,
                            @Value("${MIGRATIONS_DIR:/migrations}") String migrationsDir) {
        this.database = mongoClient.getDatabase(dbName);
        this.meta = database.getCollection("migrations");
        this.migrationsDir = Paths.get(migrationsDir);

        // Ensure unique index on filename
        try {
            meta.createIndex(new Document("filename", 1), new IndexOptions().unique(true));
        } catch (Exception ignored) {
            // index may already exist or be incompatible—safe to ignore
        }
    }

    /** Apply all JSON migrations in lexicographic order. */
    public ApplyResult applyAll() throws IOException {
        if (!Files.exists(migrationsDir)) {
            return new ApplyResult(List.of(), List.of(), "migrations dir not found: " + migrationsDir);
        }
        List<Path> files = Files.list(migrationsDir)
                .filter(Files::isRegularFile)
                .filter(p -> p.getFileName().toString().toLowerCase(Locale.ROOT).endsWith(".json"))
                .sorted(Comparator.comparing(p -> p.getFileName().toString()))
                .collect(Collectors.toList());

        List<String> applied = new ArrayList<>();
        List<String> skipped = new ArrayList<>();

        for (Path file : files) {
            String name = file.getFileName().toString();
            String json = Files.readString(file, StandardCharsets.UTF_8).trim();
            String checksum = sha256(json);

            Document existing = meta.find(new Document("filename", name)).first();
            if (existing != null) {
                String prev = existing.getString("checksum");
                if (Objects.equals(prev, checksum)) {
                    skipped.add(name);
                    continue;
                } else {
                    throw new MigrationConflictException("Migration file modified after apply: " + name);
                }
            }

            try {
                // NOTE: Migration JSON must be Mongo Extended JSON (no JS regex literals like /abc.*/i).
                // Use {"$regex":"abc.*","$options":"i"} or {"$regularExpression":{"pattern":"abc.*","options":"i"}}.

                // Parse & execute commands
                List<Document> commands = parseCommands(json);
                for (Document cmd : commands) {
                    Document toRun = cmd;
                    if (cmd.containsKey("runCommand") && cmd.get("runCommand") instanceof Document) {
                        toRun = (Document) cmd.get("runCommand");
                    }
                    database.runCommand(toRun);
                }
            } catch (Exception e) {
                // Wrap with the filename to make debugging easy
                throw new RuntimeException("Failed in migration file: " + name + " -> " + e.getMessage(), e);
            }

            // Record application
            Document record = new Document("filename", name)
                    .append("checksum", checksum)
                    .append("appliedAt", Date.from(Instant.now()));
            meta.insertOne(record);

            applied.add(name);
        }

        return new ApplyResult(applied, skipped, "ok");
    }

    /** List applied migrations (ascending by appliedAt). */
    public List<Document> status() {
        List<Document> out = new ArrayList<>();
        meta.find().sort(new Document("appliedAt", 1)).into(out);
        return out;
    }

    // ---- helpers ----

    private static String sha256(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] h = md.digest(s.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(h.length * 2);
            for (byte b : h) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("checksum error", e);
        }
    }

    /**
     * Parse JSON that is either:
     *  - a single object (Document)
     *  - an array of objects ([Document, ...])
     *
     * Supports forms like:
     * { "runCommand": { "createIndexes": "profiles", ... } }
     * { "createIndexes": "profiles", ... }
     * [ {...}, {...} ]
     */
    private static List<Document> parseCommands(String json) {
        if (!StringUtils.hasText(json)) return List.of();
        String t = json.trim();
        if (t.startsWith("[")) {
            JsonReader reader = new JsonReader(t);
            DocumentCodec codec = new DocumentCodec();
            List<Document> list = new ArrayList<>();
            reader.readStartArray();
            while (reader.readBsonType() != BsonType.END_OF_DOCUMENT) {
                Document d = codec.decode(reader, DecoderContext.builder().build());
                list.add(d);
            }
            reader.readEndArray();
            return list;
        } else if (t.startsWith("{")) {
            return List.of(Document.parse(t));
        } else {
            throw new IllegalArgumentException("Unsupported JSON in migration (must be object or array of objects)");
        }
    }

    // ---- result & error types ----

    public static class ApplyResult {
        public final List<String> applied;
        public final List<String> skipped;
        public final String message;

        public ApplyResult(List<String> applied, List<String> skipped, String message) {
            this.applied = applied;
            this.skipped = skipped;
            this.message = message;
        }
    }

    public static class MigrationConflictException extends RuntimeException {
        public MigrationConflictException(String msg) { super(msg); }
    }
}