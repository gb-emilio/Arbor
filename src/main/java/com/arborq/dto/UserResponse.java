package com.arborq.dto;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class UserResponse {
    private UUID   id;
    private String username;
    private String email;
    private String role;
    private boolean enabled;
    private OffsetDateTime createdAt;
}
