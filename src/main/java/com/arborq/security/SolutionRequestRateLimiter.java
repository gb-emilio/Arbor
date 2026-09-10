package com.arborq.security;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Limita el envío de emails de solución a 1 por IP cada {@link #WINDOW_MS}.
 * Es un endpoint público que dispara un envío de correo real, así que sin
 * límite sería un vector de spam/abuso trivial.
 */
@Component
public class SolutionRequestRateLimiter {

    private static final long WINDOW_MS = 20_000; // 20 segundos

    private final Map<String, Long> lastAttempt = new ConcurrentHashMap<>();

    public long secondsUntilAllowed(String ip) {
        long now = Instant.now().toEpochMilli();
        cleanupOldEntries(now);

        Long previous = lastAttempt.get(ip);
        if (previous != null) {
            long elapsed = now - previous;
            if (elapsed < WINDOW_MS) {
                return (WINDOW_MS - elapsed + 999) / 1000;
            }
        }
        lastAttempt.put(ip, now);
        return 0;
    }

    private void cleanupOldEntries(long now) {
        if (lastAttempt.size() < 500) return;
        lastAttempt.entrySet().removeIf(e -> now - e.getValue() > WINDOW_MS * 10);
    }
}
