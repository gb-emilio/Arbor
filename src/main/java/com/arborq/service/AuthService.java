package com.arborq.service;

import com.arborq.dto.*;
import com.arborq.model.User;
import com.arborq.repository.UserRepository;
import com.arborq.security.JwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository        userRepo;
    private final PasswordEncoder       encoder;
    private final JwtService            jwtService;
    private final AuthenticationManager authManager;

    /** Login: devuelve JWT si las credenciales son válidas */
    public AuthResponse login(AuthRequest req) {
        // Lanza BadCredentialsException si falla
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));

        User user = userRepo.findByUsername(req.getUsername())
            .orElseThrow(() -> new UsernameNotFoundException(req.getUsername()));

        String token = jwtService.generateToken(user);
        log.info("Login exitoso: {}", user.getUsername());
        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole());
    }

    /** Registro de nuevo usuario */
    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByUsername(req.getUsername()))
            throw new IllegalArgumentException("El nombre de usuario ya existe.");
        if (userRepo.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("El email ya está registrado.");

        User user = new User();
        user.setUsername(req.getUsername().trim());
        user.setEmail(req.getEmail().trim().toLowerCase());
        // BCrypt con coste 12 — nunca texto plano
        user.setPasswordHash(encoder.encode(req.getPassword()));
        user.setRole(req.getRole() != null && req.getRole().equals("ADMIN") ? "ADMIN" : "USER");

        userRepo.save(user);
        log.info("Usuario registrado: {}", user.getUsername());
        return new AuthResponse(jwtService.generateToken(user),
            user.getUsername(), user.getEmail(), user.getRole());
    }
}
