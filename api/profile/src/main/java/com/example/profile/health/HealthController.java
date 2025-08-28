package com.example.api.profile.src.health;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

  @GetMapping(value = "/profile/healthz", produces = MediaType.APPLICATION_JSON_VALUE)
  public Map<String, String> healthz() {
    return Map.of("service", "profile", "status", "ok");
  }
}