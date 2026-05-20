package com.arborq.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data @NoArgsConstructor @AllArgsConstructor
public class ReorderRequest {
    private List<UUID> orderedChildIds;
}
