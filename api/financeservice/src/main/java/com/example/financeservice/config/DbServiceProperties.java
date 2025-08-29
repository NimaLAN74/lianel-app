package com.example.financeservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "dbservice")
public record DbServiceProperties(
        String baseUrl,
        String financePath
) {}