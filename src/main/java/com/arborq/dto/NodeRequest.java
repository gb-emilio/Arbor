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
    private UUID parentId;
    private Integer position;
    private List<OptionRequest> options;

    // Campos de servicios (solo para type=leaf)
    private String serviceLinkUrl;
    private String serviceLinkLabel;
    private String paypalButtonId;
    private String calendlyUrl;

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class OptionRequest {
        private String label;
        private UUID targetNodeId;
    }
}
