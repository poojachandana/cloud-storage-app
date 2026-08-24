package com.cloudstorage.controller;

import com.cloudstorage.dto.PublicLinkRequest;
import com.cloudstorage.dto.PublicLinkResponse;
import com.cloudstorage.model.FileEntity;
import com.cloudstorage.security.UserPrincipal;
import com.cloudstorage.service.FileService;
import com.cloudstorage.service.PublicLinkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/public-links")
@RequiredArgsConstructor
public class PublicLinkController {

    private final PublicLinkService publicLinkService;
    private final FileService fileService;

    // Authenticated: create a link for one of your own files
    @PostMapping
    public PublicLinkResponse create(@AuthenticationPrincipal UserPrincipal principal,
                                      @Valid @RequestBody PublicLinkRequest request) {
        return publicLinkService.create(principal.getUser(), request);
    }

    // Public: anyone with the token (and password, if set) can download
    @GetMapping("/{token}/download")
    public ResponseEntity<InputStreamResource> download(@PathVariable String token,
                                                          @RequestParam(required = false) String password) {
        FileEntity file = publicLinkService.resolve(token, password);
        InputStreamResource resource = new InputStreamResource(fileService.loadContent(file));

        String encodedName = URLEncoder.encode(file.getName(), StandardCharsets.UTF_8).replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(file.getContentType() != null
                        ? MediaType.parseMediaType(file.getContentType())
                        : MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedName)
                .contentLength(file.getSize())
                .body(resource);
    }
}
