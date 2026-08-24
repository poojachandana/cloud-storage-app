package com.cloudstorage.controller;

import com.cloudstorage.dto.AdminFileResponse;
import com.cloudstorage.dto.AdminStatsResponse;
import com.cloudstorage.dto.AdminUserResponse;
import com.cloudstorage.dto.UserStatusRequest;
import com.cloudstorage.security.UserPrincipal;
import com.cloudstorage.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * All endpoints here require ROLE_ADMIN (enforced in SecurityConfig via
 * .requestMatchers("/api/admin/**").hasRole("ADMIN")).
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public List<AdminUserResponse> getUsers() {
        return adminService.getAllUsers();
    }

    @PutMapping("/users/{id}/status")
    public AdminUserResponse setUserStatus(@AuthenticationPrincipal UserPrincipal principal,
                                            @PathVariable Long id,
                                            @RequestBody UserStatusRequest request) {
        return adminService.setUserActive(principal.getId(), id, request.isActive());
    }

    @GetMapping("/files")
    public List<AdminFileResponse> getFiles() {
        return adminService.getAllFiles();
    }

    @DeleteMapping("/files/{id}")
    public void deleteFile(@PathVariable Long id) {
        adminService.deleteFilePermanently(id);
    }

    @GetMapping("/stats")
    public AdminStatsResponse getStats() {
        return adminService.getStats();
    }
}
