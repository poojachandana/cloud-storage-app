package com.cloudstorage.service;

import com.cloudstorage.dto.AdminFileResponse;
import com.cloudstorage.dto.AdminStatsResponse;
import com.cloudstorage.dto.AdminUserResponse;
import com.cloudstorage.exception.BadRequestException;
import com.cloudstorage.exception.ResourceNotFoundException;
import com.cloudstorage.model.FileEntity;
import com.cloudstorage.model.GlobalRole;
import com.cloudstorage.model.User;
import com.cloudstorage.repository.FileRepository;
import com.cloudstorage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final FileRepository fileRepository;
    private final StorageService storageService;

    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> AdminUserResponse.from(u, fileRepository.sumSizeByOwner(u)))
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminUserResponse setUserActive(Long adminId, Long targetUserId, boolean active) {
        if (adminId.equals(targetUserId) && !active) {
            throw new BadRequestException("You cannot deactivate your own admin account");
        }

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + targetUserId));

        target.setActive(active);
        User saved = userRepository.save(target);
        return AdminUserResponse.from(saved, fileRepository.sumSizeByOwner(saved));
    }

    public List<AdminFileResponse> getAllFiles() {
        return fileRepository.findAll().stream()
                .map(AdminFileResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteFilePermanently(Long fileId) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found: " + fileId));
        storageService.delete(file.getStoragePath());
        fileRepository.delete(file);
    }

    public AdminStatsResponse getStats() {
        List<User> users = userRepository.findAll();
        long totalUsers = users.size();
        long activeUsers = users.stream().filter(User::isActive).count();
        List<FileEntity> files = fileRepository.findAll();
        long totalFiles = files.size();
        long totalStorage = files.stream().mapToLong(FileEntity::getSize).sum();

        return new AdminStatsResponse(totalUsers, activeUsers, totalFiles, totalStorage);
    }
}