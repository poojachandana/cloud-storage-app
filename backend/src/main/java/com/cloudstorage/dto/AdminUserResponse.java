package com.cloudstorage.dto;

import com.cloudstorage.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class AdminUserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private boolean active;
    private long storageUsedBytes;
    private Instant createdAt;

    public static AdminUserResponse from(User user, long storageUsedBytes) {
        return new AdminUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.isActive(),
                storageUsedBytes,
                user.getCreatedAt()
        );
    }
}
