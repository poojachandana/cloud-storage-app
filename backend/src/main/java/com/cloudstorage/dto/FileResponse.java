package com.cloudstorage.dto;

import com.cloudstorage.model.FileEntity;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class FileResponse {
    private Long id;
    private String name;
    private Long folderId;
    private long size;
    private String contentType;
    private boolean starred;
    private boolean trashed;
    private Instant createdAt;

    public static FileResponse from(FileEntity f) {
        return new FileResponse(
                f.getId(),
                f.getName(),
                f.getFolder() != null ? f.getFolder().getId() : null,
                f.getSize(),
                f.getContentType(),
                f.isStarred(),
                f.isTrashed(),
                f.getCreatedAt()
        );
    }
}
