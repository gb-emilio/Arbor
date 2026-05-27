package com.arborq.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NodeResponse {
    private UUID id;
    private String type;
    private String text;
    private String description;
    private UUID parentId;
    private int position;
    private List<OptionResponse> options;
    private PdfMetaResponse pdf;
    private List<NodeResponse> children;
    // Campos de servicios para hojas
    private String serviceLinkUrl;
    private String serviceLinkLabel;
    private String paypalButtonId;
    private String calendlyUrl;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
