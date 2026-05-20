package com.arborq.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PdfMetaResponse {
    private UUID id;
    private String filename;
    private String contentType;
    private Long fileSize;
    private OffsetDateTime uploadedAt;
}
