package com.arborq.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.util.UUID;

/**
 * Representa una opción de respuesta con su etiqueta y,
 * opcionalmente, el ID del nodo al que navega el usuario
 * si elige esta respuesta.
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OptionResponse {
    private UUID   id;
    private String label;
    private int    position;
    /** null → opción sin nodo destino enlazado */
    private UUID   targetNodeId;
    /** Texto del nodo destino (para mostrar en UI sin cargar el nodo completo) */
    private String targetNodeText;
}
