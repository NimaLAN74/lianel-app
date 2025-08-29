package com.example.financeservice.api;

import com.example.financeservice.config.DbServiceProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriBuilder;

import java.net.URI;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@RestController
@RequestMapping(path = "/finance", produces = MediaType.APPLICATION_JSON_VALUE)
public class FinanceController {

    private final WebClient dbClient;
    private final DbServiceProperties props;

    private static final Duration DB_TIMEOUT = Duration.ofSeconds(8);

    public FinanceController(WebClient dbServiceClient, DbServiceProperties props) {
        this.dbClient = dbServiceClient;
        this.props = props;
    }

    /* ===========================
       Health
       GET /finance/healthz
       =========================== */
    @GetMapping("/healthz")
    public ResponseEntity<Map<String, Object>> healthz() {
        try {
            URI uri = buildDbUri(b -> b.path("/healthz").build());
            Map<String, Object> raw = dbClient.get().uri(uri)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block(DB_TIMEOUT);
            return ResponseEntity.ok(Map.of(
                "ok", true,
                "service", "finance-service",
                "db", Map.of("ok", true, "data", raw),
                "ts", java.time.OffsetDateTime.now().toString()
            ));
        } catch (Exception ex) {
            return ResponseEntity.ok(Map.of(
                "ok", true,
                "service", "finance-service",
                "db", Map.of("ok", false, "error", ex.getClass().getSimpleName(), "message", ex.getMessage()),
                "ts", java.time.OffsetDateTime.now().toString()
            ));
        }
    }

    /* ===========================
       Link a finance account to a profile
       POST /finance/accounts/link
       Body: { profileId, provider, publicToken }
       Forwards to db-service: {financePath}/accounts/link
       =========================== */
    @PostMapping(path = "/accounts/link", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> linkAccount(@Valid @RequestBody LinkAccountRequest body) {
        URI uri = buildDbUri(b -> b
                .path(props.financePath())
                .path("/accounts/link")
                .build());

        Map<String, Object> result = dbClient.post()
                .uri(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block(DB_TIMEOUT);

        return ResponseEntity.ok(result);
    }

    /* ===========================
       Upsert positions for a profile’s account
       POST /finance/positions
       Body: { profileId, accountId, positions: [...] }
       Forwards to db-service: {financePath}/positions
       =========================== */
    @PostMapping(path = "/positions", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> upsertPositions(@Valid @RequestBody PositionsUpsertRequest body) {
        URI uri = buildDbUri(b -> b
                .path(props.financePath())
                .path("/positions")
                .build());

        Map<String, Object> result = dbClient.post()
                .uri(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block(DB_TIMEOUT);

        return ResponseEntity.ok(result);
    }

    /* ===========================
       Get holdings for a profile
       GET /finance/holdings?profileId=...
       Forwards to db-service: {financePath}/holdings?profileId=...
       =========================== */
    @GetMapping("/holdings")
    public ResponseEntity<List<Map<String, Object>>> getHoldings(@RequestParam("profileId") UUID profileId) {
        URI uri = buildDbUri(b -> b
                .path(props.financePath())
                .path("/holdings")
                .queryParam("profileId", profileId)
                .build());

        List<Map<String, Object>> list = dbClient.get()
                .uri(uri)
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {})
                .collectList()
                .block(DB_TIMEOUT);

        return ResponseEntity.ok(list);
    }

    /* ===== Helpers ===== */

    private URI buildDbUri(Function<UriBuilder, URI> fn) {
        return fn.apply(org.springframework.web.util.UriComponentsBuilder.fromUriString(props.baseUrl()));
    }

    /* ===== DTOs ===== */

    public record LinkAccountRequest(
            @NotNull UUID profileId,
            @NotBlank String provider,
            @NotBlank String publicToken
    ) {}

    public record Position(
            @NotBlank String symbol,
            @NotBlank String name,
            @NotBlank String currency,
            @NotNull Double quantity,
            @NotNull Double avgPrice
    ) {}

    public record PositionsUpsertRequest(
            @NotNull UUID profileId,
            @NotNull UUID accountId,
            @NotNull List<@Valid Position> positions
    ) {}
}