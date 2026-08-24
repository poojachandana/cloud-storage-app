package com.cloudstorage.controller;

import com.cloudstorage.dto.*;
import com.cloudstorage.security.UserPrincipal;
import com.cloudstorage.service.FolderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
public class FolderController {

    private final FolderService folderService;

    @PostMapping
    public FolderResponse create(@AuthenticationPrincipal UserPrincipal principal,
                                  @Valid @RequestBody FolderRequest request) {
        return folderService.createFolder(principal.getUser(), request);
    }

    @GetMapping("/{id}")
    public FolderResponse get(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return folderService.getFolder(principal.getUser(), id);
    }

    @GetMapping("/{id}/contents")
    public FolderContentsResponse contents(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return folderService.getContents(principal.getUser(), id);
    }

    // root contents ("My Drive")
    @GetMapping("/root/contents")
    public FolderContentsResponse rootContents(@AuthenticationPrincipal UserPrincipal principal) {
        return folderService.getContents(principal.getUser(), null);
    }

    @PutMapping("/{id}/rename")
    public FolderResponse rename(@AuthenticationPrincipal UserPrincipal principal,
                                  @PathVariable Long id, @Valid @RequestBody RenameRequest request) {
        return folderService.rename(principal.getUser(), id, request.getName());
    }

    @PutMapping("/{id}/move")
    public FolderResponse move(@AuthenticationPrincipal UserPrincipal principal,
                                @PathVariable Long id, @RequestBody MoveRequest request) {
        return folderService.move(principal.getUser(), id, request.getFolderId());
    }

    @DeleteMapping("/{id}")
    public void trash(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        folderService.trash(principal.getUser(), id);
    }

    @PutMapping("/{id}/restore")
    public void restore(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        folderService.restore(principal.getUser(), id);
    }

    @GetMapping("/search")
    public List<FolderResponse> search(@AuthenticationPrincipal UserPrincipal principal, @RequestParam String q) {
        return folderService.search(principal.getUser(), q);
    }
}
