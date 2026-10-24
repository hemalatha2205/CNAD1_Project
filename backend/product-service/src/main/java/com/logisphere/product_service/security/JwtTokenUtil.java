package com.logisphere.product_service.security;

import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Lightweight JWT claim extractor for product-service.
 * Uses the same secret and claim names as auth-service.
 * Supports configurable secret via JWT_SECRET environment variable
 * or jwt.secret system property, falling back to local default.
 */
public final class JwtTokenUtil {
private static String resolveSecret() {
        String env = System.getenv("JWT_SECRET");
        if (env != null && !env.isBlank()) {
            return env;
        }
        String prop = System.getProperty("jwt.secret");
        if (prop != null && !prop.isBlank()) {
            return prop;
        }
        throw new IllegalStateException("JWT_SECRET or jwt.secret must be configured");
    }

    private static final SecretKey SECRET_KEY =
            Keys.hmacShaKeyFor(resolveSecret().getBytes(StandardCharsets.UTF_8));

    private JwtTokenUtil() {}

    private static Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** Returns the userId claim embedded in the JWT, or null on any error. */
    public static Long extractUserId(String bearerHeader) {
        if (bearerHeader == null || !bearerHeader.startsWith("Bearer ")) {
            return null;
        }
        try {
            String token = bearerHeader.substring(7);
            Number userId = getClaims(token).get("userId", Number.class);
            return userId == null ? null : userId.longValue();
        } catch (Exception e) {
            return null;
        }
    }

    /** Returns the role claim ("CUSTOMER", "ADMIN", etc.) or null on any error. */
    public static String extractRole(String bearerHeader) {
        if (bearerHeader == null || !bearerHeader.startsWith("Bearer ")) {
            return null;
        }
        try {
            String token = bearerHeader.substring(7);
            return getClaims(token).get("role", String.class);
        } catch (Exception e) {
            return null;
        }
    }
}
