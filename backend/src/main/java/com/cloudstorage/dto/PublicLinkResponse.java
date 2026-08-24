package com.cloudstorage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class PublicLinkResponse {
    private String token;
    private String url;
    private Instant expiresAt;
    private boolean passwordProtected;
}
