package com.arborq.security;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Limita a una petición de registro por IP cada {@link #WINDOW_MS}.
 *
 * Implementación en memoria (ConcurrentHashMap) — suficiente para el
 * volumen de este servicio; si en el futuro se despliega en varias
 * instancias detrás de un balanceador, habría que mover esto a un
 * almacén compartido (Redis) para que el límite se respete entre nodos.
 */
@Component
public class RegistrationRateLimiter {

    private static final long WINDOW_MS = 60_000; // 1 minuto

    /** ip → instante del último registro aceptado */
    private final Map<String, Long> lastAttempt = new ConcurrentHashMap<>();

    /**
     * Comprueba si la IP puede registrar una cuenta ahora mismo.
     * Si puede, registra el intento inmediatamente (evita condiciones de
     * carrera entre la comprobación y el registro real).
     *
     * @return segundos que quedan de espera; 0 si la petición está permitida
     */
    public long secondsUntilAllowed(String ip) {
        long now = Instant.now().toEpochMilli();
        cleanupOldEntries(now);

        Long previous = lastAttempt.get(ip);
        if (previous != null) {
            long elapsed = now - previous;
            if (elapsed < WINDOW_MS) {
                return (WINDOW_MS - elapsed + 999) / 1000; // redondeo hacia arriba a segundos
            }
        }
        lastAttempt.put(ip, now);
        return 0;
    }

    /** Limpieza perezosa: evita que el mapa crezca sin límite. */
    private void cleanupOldEntries(long now) {
        // Solo limpiamos ocasionalmente para no penalizar cada petición
        if (lastAttempt.size() < 500) return;
        lastAttempt.entrySet().removeIf(e -> now - e.getValue() > WINDOW_MS * 10);
    }
}
