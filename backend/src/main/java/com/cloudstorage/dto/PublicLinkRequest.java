package com.cloudstorage.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PublicLinkRequest {
    @NotNull
    private Long fileId;

    private Integer expiryHours; // null = never expires
    private String password;     // null = no password
}
