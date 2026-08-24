package com.cloudstorage.dto;

import com.cloudstorage.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ShareRequest {
    @NotNull
    private Long fileId;

    @NotBlank
    private String email; // email of user to share with

    @NotNull
    private Role role; // VIEWER or EDITOR
}
