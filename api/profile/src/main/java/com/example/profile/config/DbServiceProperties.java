package com.example.profile.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Binds properties with prefix "dbservice".
 * application.properties key: dbservice.base-url
 * env override: DBSERVICE_BASE_URL
 */
@ConfigurationProperties(prefix = "dbservice")
public record DbServiceProperties(String baseUrl) { }