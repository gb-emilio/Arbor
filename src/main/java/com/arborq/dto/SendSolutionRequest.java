package com.arborq.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SendSolutionRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "Los apellidos son obligatorios")
    private String apellidos;

    @NotBlank(message = "La nacionalidad es obligatoria")
    private String nacionalidad;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^\\+?\\d{6,15}$", message = "El teléfono debe contener solo dígitos, con un '+' opcional al principio")
    private String telefono;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no es válido")
    private String email;

    @AssertTrue(message = "Debes aceptar la política de privacidad")
    private boolean aceptaPrivacidad;

    @AssertTrue(message = "Debes aceptar el tratamiento de datos")
    private boolean aceptaTratamiento;
}
