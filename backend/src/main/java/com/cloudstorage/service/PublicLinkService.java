package com.cloudstorage.service;

import com.cloudstorage.dto.PublicLinkRequest;
import com.cloudstorage.dto.PublicLinkResponse;
import com.cloudstorage.exception.AccessDeniedCustomException;
import com.cloudstorage.exception.BadRequestException;
import com.cloudstorage.exception.ResourceNotFoundException;
import com.cloudstorage.model.FileEntity;
import com.cloudstorage.model.LinkShare;
import com.cloudstorage.model.User;
import com.cloudstorage.repository.FileRepository;
import com.cloudstorage.repository.LinkShareRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PublicLinkService {

    private final LinkShareRepository linkShareRepository;
    private final FileRepository fileRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.public-link.base-url}")
    private String baseUrl;

    public PublicLinkResponse create(User owner, PublicLinkRequest request) {
        FileEntity file = fileRepository.findById(request.getFileId())
                .orElseThrow(() -> new ResourceNotFoundException("File not found: " + request.getFileId()));

        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedCustomException("Only the owner can create a share link for this file");
        }

        String token = UUID.randomUUID().toString().replace("-", "");

        Instant expiresAt = null;
        if (request.getExpiryHours() != null) {
            expiresAt = Instant.now().plus(request.getExpiryHours(), ChronoUnit.HOURS);
        }

        String passwordHash = null;
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            passwordHash = passwordEncoder.encode(request.getPassword());
        }

        LinkShare linkShare = LinkShare.builder()
                .file(file)
                .token(token)
                .expiresAt(expiresAt)
                .passwordHash(passwordHash)
                .createdBy(owner)
                .build();

        linkShareRepository.save(linkShare);

        return new PublicLinkResponse(token, baseUrl + "/" + token, expiresAt, passwordHash != null);
    }

    public FileEntity resolve(String token, String password) {
        LinkShare linkShare = linkShareRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("This link is invalid or has been removed"));

        if (linkShare.getExpiresAt() != null && linkShare.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("This link has expired");
        }

        if (linkShare.getPasswordHash() != null) {
            if (password == null || !passwordEncoder.matches(password, linkShare.getPasswordHash())) {
                throw new AccessDeniedCustomException("Incorrect or missing password for this link");
            }
        }

        return linkShare.getFile();
    }
}
