package com.cloudstorage.dto;

import com.cloudstorage.model.FileEntity;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class AdminFileResponse {
    private Long id;
    private String name;
    private String ownerName;
    private String ownerEmail;
    private long size;
    private String contentType;
    private boolean trashed;
    private Instant createdAt;

    public static AdminFileResponse from(FileEntity f) {
        return new AdminFileResponse(
                f.getId(),
                f.getName(),
                f.getOwner().getName(),
                f.getOwner().getEmail(),
                f.getSize(),
                f.getContentType(),
                f.isTrashed(),
                f.getCreatedAt()
        );
    }
}
