package com.arborq.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Respuesta al registrar un usuario nuevo.
 * No incluye token: la cuenta queda inactiva (enabled=false) hasta que
 * un administrador la active, por lo que no tiene sentido emitir un JWT
 * utilizable todavía.
 */
@Data
@AllArgsConstructor
public class RegisterResponse {
    private String username;
    private String email;
    private String message;
}
