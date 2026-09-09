package com.arborq.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank @Size(min=3, max=50)   private String username;
    @NotBlank @Email                  private String email;
    @NotBlank @Size(min=8, max=100)  private String password;
    // No hay campo "role": el registro público siempre crea usuarios USER.
    // Solo un ADMIN puede ascender el rol después, vía PATCH /api/v1/users/{id}/role.
}
