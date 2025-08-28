package com.example.profile.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping(value = "/profile", produces = MediaType.APPLICATION_JSON_VALUE)
public class ProfileController {

  private static final Logger log = LoggerFactory.getLogger(ProfileController.class);
  private final WebClient dbClient;

  public ProfileController(WebClient dbServiceClient) {
    this.dbClient = dbServiceClient;
  }

  /** Quick liveness (does NOT call db-service). */
  @GetMapping("/ping")
  public Map<String, Object> ping() {
    return Map.of("ok", true, "service", "profile-api", "ts", Instant.now().toString());
  }

  /** Health that pings db-service but still returns 200 with a status payload. */
  @GetMapping("/healthz")
  public Mono<ResponseEntity<Map<String, Object>>> healthz() {
    return dbClient.get()
        .uri("/db/healthz")
        .retrieve()
        .bodyToMono(String.class)
        .map(_ok -> ResponseEntity.ok(Map.of(
            "ok", true,
            "service", "profile-api",
            "db", Map.of("ok", true),
            "ts", Instant.now().toString()
        )))
        .onErrorResume(err -> {
          log.warn("db-service health probe failed: {}", err.toString());
          return Mono.just(ResponseEntity.ok(Map.of(
              "ok", true,
              "service", "profile-api",
              "db", Map.of("ok", false, "error", err.getClass().getSimpleName(), "message", err.getMessage()),
              "ts", Instant.now().toString()
          )));
        });
  }

  @GetMapping("/getProfiles")
  public Mono<ResponseEntity<String>> getProfiles() {
    return dbClient.get()
        .uri("/db/profiles")
        .retrieve()
        .toEntity(String.class)
        .map(up -> ResponseEntity
            .status(up.getStatusCode())
            .headers(filterHeaders(up.getHeaders()))
            .body(up.getBody()))
        .onErrorResume(err -> {
          log.error("Failed calling db-service GET /db/profiles", err);
          String msg = (err instanceof WebClientResponseException we)
              ? we.getStatusCode() + " " + safe(we.getResponseBodyAsString())
              : err.getClass().getSimpleName() + ": " + String.valueOf(err.getMessage());
          return Mono.just(ResponseEntity.status(502)
              .contentType(MediaType.APPLICATION_JSON)
              .body("{\"error\":\"db-service unreachable\",\"detail\":\"" + escapeJson(msg) + "\"}"));
        });
  }

  @PostMapping(value = "/createProfile", consumes = MediaType.APPLICATION_JSON_VALUE)
  public Mono<ResponseEntity<String>> createProfile(@RequestBody Map<String, Object> body) {
    return dbClient.post()
        .uri("/db/profiles")
        .contentType(MediaType.APPLICATION_JSON)
        .bodyValue(body)
        .retrieve()
        .toEntity(String.class)
        .map(up -> ResponseEntity
            .status(up.getStatusCode())
            .headers(filterHeaders(up.getHeaders()))
            .body(up.getBody()))
        .onErrorResume(err -> {
          log.error("Failed calling db-service POST /db/profiles", err);
          String msg = (err instanceof WebClientResponseException we)
              ? we.getStatusCode() + " " + safe(we.getResponseBodyAsString())
              : err.getClass().getSimpleName() + ": " + String.valueOf(err.getMessage());
          return Mono.just(ResponseEntity.status(502)
              .contentType(MediaType.APPLICATION_JSON)
              .body("{\"error\":\"db-service unreachable\",\"detail\":\"" + escapeJson(msg) + "\"}"));
        });
  }

  /** Remove hop-by-hop headers that must not be forwarded. */
  private static HttpHeaders filterHeaders(HttpHeaders in) {
    HttpHeaders out = new HttpHeaders();
    // Copy everything except hop-by-hop headers
    in.forEach((k, v) -> {
      String key = k.toLowerCase(Locale.ROOT);
      if (!HOP_BY_HOP.contains(key)) {
        out.put(k, v);
      }
    });
    // Let Spring compute body framing; don't forward CL/TE at all
    out.remove(HttpHeaders.CONTENT_LENGTH);
    out.remove(HttpHeaders.TRANSFER_ENCODING);
    return out;
  }

  private static final List<String> HOP_BY_HOP = List.of(
      "connection",
      "keep-alive",
      "proxy-authenticate",
      "proxy-authorization",
      "te",
      "trailer",
      "transfer-encoding",
      "upgrade",
      "proxy-connection" // non-standard but seen in wild
  );

  private static String escapeJson(String s) {
    if (s == null) return "";
    return s.replace("\\", "\\\\").replace("\"", "\\\"");
  }
  private static String safe(String s) { return s == null ? "" : s; }
}