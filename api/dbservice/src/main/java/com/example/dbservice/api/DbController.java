package com.example.dbservice.api;

import com.example.dbservice.api.dto.CreateProfileRequest;
import com.example.dbservice.model.Profile;
import com.example.dbservice.repo.ProfileRepository;
import com.example.dbservice.migration.MigrationService;
import com.example.dbservice.migration.MigrationService.ApplyResult;
import com.example.dbservice.migration.MigrationService.MigrationConflictException;
import org.bson.Document;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/db", produces = MediaType.APPLICATION_JSON_VALUE)
public class DbController {

  private final ProfileRepository repo;
  private final MigrationService migrationService;

  public DbController(ProfileRepository repo, MigrationService migrationService) {
    this.repo = repo;
    this.migrationService = migrationService;
  }

  // ---- health ----
  @GetMapping("/healthz")
  public Map<String, Object> healthz() {
    return Map.of("ok", true, "ts", Instant.now().toString());
  }

  // ---- profiles ----
  @GetMapping("/profiles")
  public List<Profile> profiles() {
    return repo.findAll();
  }

  @PostMapping(value = "/profiles", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> create(@RequestBody CreateProfileRequest req) {
    // basic validation
    if (req.username == null || req.username.isBlank()) {
      return ResponseEntity.badRequest().body(Map.of("error", "username is required"));
    }
    if (req.email == null || req.email.isBlank()) {
      return ResponseEntity.badRequest().body(Map.of("error", "email is required"));
    }
    if (req.password == null || req.password.isBlank()) {
      return ResponseEntity.badRequest().body(Map.of("error", "password is required"));
    }

    String salt = BCrypt.gensalt(12);
    String hash = BCrypt.hashpw(req.password, salt);

    Profile p = new Profile();
    p.setUsername(req.username);
    p.setFirstName(req.firstName);
    p.setLastName(req.lastName);
    p.setBirthday(req.birthday);
    p.setCountry(req.country);
    p.setMobile(req.mobile);
    p.setEmail(req.email);
    p.setPasswordHash(hash);
    p.setCreatedAt(Instant.now());
    p.setUpdatedAt(p.getCreatedAt());

    Profile saved = repo.save(p);
    return ResponseEntity.status(201).body(saved);
  }

  // ---- migrations ----
  @PostMapping("/migrations/apply")
  public ResponseEntity<?> applyMigrations() {
    try {
      ApplyResult res = migrationService.applyAll();
      return ResponseEntity.ok(Map.of(
          "applied", res.applied,
          "skipped", res.skipped,
          "message", res.message
      ));
    } catch (MigrationConflictException mce) {
      return ResponseEntity.status(409).body(Map.of("error", mce.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.status(500).body(Map.of(
          "error", e.getClass().getSimpleName(),
          "message", e.getMessage()
      ));
    }
  }

  // Accept BOTH GET and POST for /db/migrations/status
  @RequestMapping(value = "/migrations/status", method = {RequestMethod.GET, RequestMethod.POST})
  public ResponseEntity<?> migrationStatus() {
    List<Document> docs = migrationService.status();
    return ResponseEntity.ok(Map.of("applied", docs));
  }
}