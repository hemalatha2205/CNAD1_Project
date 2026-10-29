package com.logisphere.auth_service.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Service
public class JwtService {
@Value("${jwt.secret}")
    private String configuredSecret;

    private SecretKey secretKey;

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

    @PostConstruct
    public void init() {
        String keySource = (configuredSecret != null && !configuredSecret.isBlank())
                ? configuredSecret
                : resolveSecret();
        this.secretKey = Keys.hmacShaKeyFor(keySource.getBytes(StandardCharsets.UTF_8));
    }

    private SecretKey getSecretKey() {
        if (this.secretKey == null) {
            init();
        }
        return this.secretKey;
    }

    public String generateToken(
            Long userId,
            String email,
            String role) {

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(
                        new Date(System.currentTimeMillis() + 86400000)
                )
                .signWith(getSecretKey())
                .compact();
    }

    public String extractEmail(String token) {

        return getClaims(token).getSubject();
    }

    public String extractRole(String token) {

        return getClaims(token).get("role", String.class);
    }

    private Claims getClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public static Long extractUserIdFromStaticHeader(String bearerHeader) {
        if (bearerHeader == null || !bearerHeader.startsWith("Bearer ")) return null;
        try {
            String token = bearerHeader.substring(7);
            SecretKey sk = Keys.hmacShaKeyFor(resolveSecret().getBytes(StandardCharsets.UTF_8));
            Number userId = Jwts.parser().verifyWith(sk).build().parseSignedClaims(token).getPayload().get("userId", Number.class);
            return userId == null ? null : userId.longValue();
        } catch (Exception e) { return null; }
    }

    public static String extractRoleFromStaticHeader(String bearerHeader) {
        if (bearerHeader == null || !bearerHeader.startsWith("Bearer ")) return null;
        try {
            String token = bearerHeader.substring(7);
            SecretKey sk = Keys.hmacShaKeyFor(resolveSecret().getBytes(StandardCharsets.UTF_8));
            return Jwts.parser().verifyWith(sk).build().parseSignedClaims(token).getPayload().get("role", String.class);
        } catch (Exception e) { return null; }
    }
}
