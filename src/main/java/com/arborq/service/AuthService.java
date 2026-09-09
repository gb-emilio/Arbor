package com.arborq.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.arborq.dto.AuthRequest;
import com.arborq.dto.AuthResponse;
import com.arborq.dto.RegisterRequest;
import com.arborq.dto.RegisterResponse;
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
        } catch (DisabledException e) {
            // Spring Security ya comprueba UserDetails.isEnabled() automáticamente
            // (DaoAuthenticationProvider → preAuthenticationChecks) antes de validar
            // la contraseña, y lanza esta excepción si enabled=false.
            throw new DisabledException("Tu cuenta está pendiente de activación por un administrador.");
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
    public RegisterResponse register(RegisterRequest req) {

        if (userRepo.existsByUsername(req.getUsername()))
            throw new IllegalArgumentException("El nombre de usuario ya existe.");
        if (userRepo.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("El email ya está registrado.");

        User user = new User();
        user.setUsername(req.getUsername().trim());
        user.setEmail(req.getEmail().trim().toLowerCase());
        user.setPasswordHash(encoder.encode(req.getPassword())); // BCrypt coste 12 — nunca texto plano
        // El registro público nunca puede auto-asignarse ADMIN; siempre USER.
        // Un administrador puede ascender el rol después desde /api/v1/users/{id}/role.
        user.setRole("USER");
        // La cuenta queda inactiva hasta que un administrador la active,
        // ya sea desde la aplicación (PATCH /api/v1/users/{id}/toggle) o directamente en BD.
        user.setEnabled(false);

        userRepo.save(user);
        log.info("Usuario registrado (pendiente de activación): {}", user.getUsername());

        return new RegisterResponse(
                user.getUsername(),
                user.getEmail(),
                "Registro completado. Tu cuenta está pendiente de activación por un administrador."
        );

    }

}

