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
import com.arborq.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest req)
            throws Exception {

        return ResponseEntity.ok(authService.login(req));

    }

    /**
     * El registro crea la cuenta como inactiva (enabled=false).
     * No devuelve token: un administrador debe activarla antes de poder
     * usarla (PATCH /api/v1/users/{id}/toggle o directamente en BD).
     */
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));

    }

}
