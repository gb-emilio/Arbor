package com.arborq.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.arborq.dto.AuthRequest;
import com.arborq.dto.AuthResponse;
import com.arborq.dto.RegisterRequest;
import com.arborq.model.User;
import com.arborq.repository.UserRepository;
import com.arborq.security.JwtService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepo;

    private final PasswordEncoder encoder;

    private final JwtService jwtService;

    /*
     * FIX REFERENCIA CIRCULAR:
     *
     * ANTES (problema):
     * AuthService → AuthenticationManager (bean)
     * AuthenticationManager bean → DaoAuthenticationProvider → PasswordEncoder
     * PasswordEncoder bean está en SecurityConfig
     * SecurityConfig también expone AuthenticationManager
     * → Spring no puede determinar el orden de inicialización → ciclo
     *
     * AHORA (solución):
     * AuthService → AuthenticationConfiguration (objeto de configuración, no un bean circular)
     * AuthenticationConfiguration.getAuthenticationManager() se llama EN TIEMPO DE USO,
     * no durante la construcción del contexto → ciclo roto.
     */
    private final AuthenticationConfiguration authConfig;

    public AuthResponse login(AuthRequest req)
            throws Exception {

        try {
            AuthenticationManager manager = authConfig.getAuthenticationManager();
            manager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Usuario o contraseña incorrectos");
        }

        User user = userRepo.findByUsername(req.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException(req.getUsername()));

        log.info("Login exitoso: {}", user.getUsername());
        return new AuthResponse(
                jwtService.generateToken(user),
                user.getUsername(), user.getEmail(), user.getRole());

    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {

        if (userRepo.existsByUsername(req.getUsername()))
            throw new IllegalArgumentException("El nombre de usuario ya existe.");
        if (userRepo.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("El email ya está registrado.");

        User user = new User();
        user.setUsername(req.getUsername().trim());
        user.setEmail(req.getEmail().trim().toLowerCase());
        user.setPasswordHash(encoder.encode(req.getPassword())); // BCrypt coste 12 — nunca texto plano
        user.setRole("ADMIN".equals(req.getRole()) ? "ADMIN" : "USER");

        userRepo.save(user);
        log.info("Usuario registrado: {}", user.getUsername());
        return new AuthResponse(
                jwtService.generateToken(user),
                user.getUsername(), user.getEmail(), user.getRole());

    }

}
