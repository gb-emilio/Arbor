package com.arborq.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.arborq.dto.AuthRequest;
import com.arborq.dto.AuthResponse;
import com.arborq.dto.RegisterRequest;
import com.arborq.dto.RegisterResponse;
import com.arborq.security.RateLimitException;
import com.arborq.security.RegistrationRateLimiter;
import com.arborq.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RegistrationRateLimiter rateLimiter;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest req)
            throws Exception {

        return ResponseEntity.ok(authService.login(req));

    }

    /**
     * El registro crea la cuenta como inactiva (enabled=false).
     * No devuelve token: un administrador debe activarla antes de poder
     * usarla (PATCH /api/v1/users/{id}/toggle o directamente en BD).
     *
     * Limitado a un registro por IP cada minuto (ver RegistrationRateLimiter).
     */
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest req,
            HttpServletRequest request) {

        String ip = clientIp(request);
        long waitSeconds = rateLimiter.secondsUntilAllowed(ip);
        if (waitSeconds > 0) {
            throw new RateLimitException(
                    "Demasiados registros desde esta conexión. Espera " + waitSeconds + " segundos e inténtalo de nuevo.");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));

    }

    /**
     * Extrae la IP real del cliente. Si la aplicación está detrás de un
     * proxy/balanceador (Railway, Nginx, Cloudflare...) la IP real viaja
     * en X-Forwarded-For; sin proxy, se usa la IP de conexión directa.
     */
    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            // Puede contener una cadena "cliente, proxy1, proxy2" — el primero es el cliente real
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

}
