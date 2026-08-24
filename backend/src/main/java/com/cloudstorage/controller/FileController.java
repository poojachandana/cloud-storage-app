package com.cloudstorage.controller;

import com.cloudstorage.dto.*;
import com.cloudstorage.model.FileEntity;
import com.cloudstorage.security.UserPrincipal;
import com.cloudstorage.service.FileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public FileResponse upload(@AuthenticationPrincipal UserPrincipal principal,
                                @RequestParam("file") MultipartFile file,
                                @RequestParam(value = "folderId", required = false) Long folderId) {
        return fileService.upload(principal.getUser(), file, folderId);
    }

    @GetMapping("/{id}")
    public FileResponse get(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return fileService.get(principal.getUser(), id);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<InputStreamResource> download(@AuthenticationPrincipal UserPrincipal principal,
                                                          @PathVariable Long id) {
        FileEntity file = fileService.getForDownload(principal.getUser(), id);
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

    @PutMapping("/{id}/rename")
    public FileResponse rename(@AuthenticationPrincipal UserPrincipal principal,
                                @PathVariable Long id, @Valid @RequestBody RenameRequest request) {
        return fileService.rename(principal.getUser(), id, request.getName());
    }

    @PutMapping("/{id}/move")
    public FileResponse move(@AuthenticationPrincipal UserPrincipal principal,
                              @PathVariable Long id, @RequestBody MoveRequest request) {
        return fileService.move(principal.getUser(), id, request.getFolderId());
    }

    @DeleteMapping("/{id}")
    public void trash(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        fileService.trash(principal.getUser(), id);
    }

    @PutMapping("/{id}/restore")
    public void restore(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        fileService.restore(principal.getUser(), id);
    }

    @DeleteMapping("/{id}/permanent")
    public void deletePermanently(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        fileService.deletePermanently(principal.getUser(), id);
    }

    @PutMapping("/{id}/star")
    public FileResponse star(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return fileService.star(principal.getUser(), id, true);
    }

    @PutMapping("/{id}/unstar")
    public FileResponse unstar(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return fileService.star(principal.getUser(), id, false);
    }

    @GetMapping("/starred")
    public List<FileResponse> starred(@AuthenticationPrincipal UserPrincipal principal) {
        return fileService.getStarred(principal.getUser());
    }

    @PutMapping(value = "/{id}/replace", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public FileResponse replace(@AuthenticationPrincipal UserPrincipal principal,
                                 @PathVariable Long id,
                                 @RequestParam("file") MultipartFile file) {
        return fileService.replaceContent(principal.getUser(), id, file);
    }

    @GetMapping("/search")
    public List<FileResponse> search(@AuthenticationPrincipal UserPrincipal principal,
                                      @RequestParam String q,
                                      @RequestParam(required = false) String type,
                                      @RequestParam(required = false) String dateFrom,
                                      @RequestParam(required = false) String dateTo) {
        return fileService.search(principal.getUser(), q, type, dateFrom, dateTo);
    }
}
