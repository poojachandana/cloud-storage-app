package com.cloudstorage.dto;

import com.cloudstorage.model.Folder;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class FolderResponse {
    private Long id;
    private String name;
    private Long parentId;
    private boolean trashed;
    private Instant createdAt;

    public static FolderResponse from(Folder f) {
        return new FolderResponse(
                f.getId(),
                f.getName(),
                f.getParent() != null ? f.getParent().getId() : null,
                f.isTrashed(),
                f.getCreatedAt()
        );
    }
}
