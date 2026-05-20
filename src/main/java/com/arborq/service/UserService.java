package com.arborq.service;

import com.arborq.dto.UserResponse;
import com.arborq.model.User;
import com.arborq.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

    public List<UserResponse> listAll() {
        return userRepo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public UserResponse getById(UUID id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public UserResponse toggleEnabled(UUID id) {
        User u = findOrThrow(id);
        u.setEnabled(!u.isEnabled());
        return toResponse(userRepo.save(u));
    }

    @Transactional
    public UserResponse changeRole(UUID id, String role) {
        if (!role.equals("ADMIN") && !role.equals("USER"))
            throw new IllegalArgumentException("Rol inválido: " + role);
        User u = findOrThrow(id);
        u.setRole(role);
        return toResponse(userRepo.save(u));
    }

    @Transactional
    public void resetPassword(UUID id, String newPassword) {
        if (newPassword == null || newPassword.length() < 8)
            throw new IllegalArgumentException("La contraseña debe tener al menos 8 caracteres.");
        User u = findOrThrow(id);
        u.setPasswordHash(encoder.encode(newPassword));
        userRepo.save(u);
    }

    @Transactional
    public void delete(UUID id) {
        userRepo.delete(findOrThrow(id));
    }

    private User findOrThrow(UUID id) {
        return userRepo.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + id));
    }

    public UserResponse toResponse(User u) {
        UserResponse r = new UserResponse();
        r.setId(u.getId());
        r.setUsername(u.getUsername());
        r.setEmail(u.getEmail());
        r.setRole(u.getRole());
        r.setEnabled(u.isEnabled());
        r.setCreatedAt(u.getCreatedAt());
        return r;
    }
}
