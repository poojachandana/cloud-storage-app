package com.cloudstorage.dto;

import com.cloudstorage.model.Share;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ShareResponse {
    private Long id;
    private Long fileId;
    private String fileName;
    private String sharedWithEmail;
    private String role;

    public static ShareResponse from(Share s) {
        return new ShareResponse(
                s.getId(),
                s.getFile() != null ? s.getFile().getId() : null,
                s.getFile() != null ? s.getFile().getName() : null,
                s.getSharedWith().getEmail(),
                s.getRole().name()
        );
    }
}
