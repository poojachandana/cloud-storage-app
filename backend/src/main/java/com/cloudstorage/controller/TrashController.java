package com.cloudstorage.controller;

import com.cloudstorage.dto.FileResponse;
import com.cloudstorage.dto.FolderResponse;
import com.cloudstorage.security.UserPrincipal;
import com.cloudstorage.service.FileService;
import com.cloudstorage.service.FolderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trash")
@RequiredArgsConstructor
public class TrashController {

    private final FileService fileService;
    private final FolderService folderService;

    @GetMapping
    public Map<String, Object> getTrash(@AuthenticationPrincipal UserPrincipal principal) {
        List<FileResponse> files = fileService.getTrash(principal.getUser());
        List<FolderResponse> folders = folderService.getTrash(principal.getUser());
        return Map.of("files", files, "folders", folders);
    }
}
