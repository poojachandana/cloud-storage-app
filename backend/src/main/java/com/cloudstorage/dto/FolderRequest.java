package com.cloudstorage.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FolderRequest {
    @NotBlank
    private String name;

    private Long parentId; // null = root
}
