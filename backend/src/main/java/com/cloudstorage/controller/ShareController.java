package com.cloudstorage.controller;

import com.cloudstorage.dto.ShareRequest;
import com.cloudstorage.dto.ShareResponse;
import com.cloudstorage.security.UserPrincipal;
import com.cloudstorage.service.ShareService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shares")
@RequiredArgsConstructor
public class ShareController {

    private final ShareService shareService;

    @PostMapping
    public ShareResponse share(@AuthenticationPrincipal UserPrincipal principal,
                                @Valid @RequestBody ShareRequest request) {
        return shareService.shareFile(principal.getUser(), request);
    }

    @GetMapping("/shared-with-me")
    public List<ShareResponse> sharedWithMe(@AuthenticationPrincipal UserPrincipal principal) {
        return shareService.getSharedWithMe(principal.getUser());
    }

    @GetMapping("/file/{fileId}")
    public List<ShareResponse> sharesForFile(@AuthenticationPrincipal UserPrincipal principal,
                                              @PathVariable Long fileId) {
        return shareService.getSharesForFile(principal.getUser(), fileId);
    }

    @DeleteMapping("/{shareId}")
    public void revoke(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long shareId) {
        shareService.revoke(principal.getUser(), shareId);
    }
}
