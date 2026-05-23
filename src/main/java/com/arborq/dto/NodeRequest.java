package com.arborq.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class NodeRequest {

    @NotBlank(message = "El tipo es obligatorio")
    @Pattern(regexp = "question|leaf", message = "El tipo debe ser 'question' o 'leaf'")
    private String type;

    @NotBlank(message = "El texto es obligatorio")
    private String text;

    private String description;

    /** null = nodo raíz */
    private UUID parentId;

    private Integer position;

    /** Lista de opciones con label y, opcionalmente, targetNodeId */
    private List<OptionRequest> options;

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class OptionRequest {
        private String label;
        /** ID del nodo hijo al que lleva esta opción (null = sin enlazar) */
        private UUID targetNodeId;
    }
}
