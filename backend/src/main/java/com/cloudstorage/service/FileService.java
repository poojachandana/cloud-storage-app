package com.cloudstorage.service;

import com.cloudstorage.dto.FileResponse;
import com.cloudstorage.exception.AccessDeniedCustomException;
import com.cloudstorage.exception.BadRequestException;
import com.cloudstorage.exception.ResourceNotFoundException;
import com.cloudstorage.model.FileEntity;
import com.cloudstorage.model.Folder;
import com.cloudstorage.model.Role;
import com.cloudstorage.model.User;
import com.cloudstorage.repository.FileRepository;
import com.cloudstorage.repository.ShareRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileService {

    private final FileRepository fileRepository;
    private final ShareRepository shareRepository;
    private final StorageService storageService;
    private final FolderService folderService;

    public FileResponse upload(User owner, MultipartFile file, Long folderId) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file provided");
        }

        Folder folder = null;
        if (folderId != null) {
            folder = folderService.getOwnedFolder(owner, folderId);
        }

        String storagePath = storageService.store(owner.getId(), file);

        FileEntity entity = FileEntity.builder()
                .name(file.getOriginalFilename())
                .folder(folder)
                .owner(owner)
                .size(file.getSize())
                .contentType(file.getContentType())
                .storagePath(storagePath)
                .build();

        return FileResponse.from(fileRepository.save(entity));
    }

    public FileResponse get(User requester, Long fileId) {
        FileEntity file = getAccessibleFile(requester, fileId, Role.VIEWER);
        return FileResponse.from(file);
    }

    public FileEntity getForDownload(User requester, Long fileId) {
        return getAccessibleFile(requester, fileId, Role.VIEWER);
    }

    public InputStream loadContent(FileEntity file) {
        return storageService.load(file.getStoragePath());
    }

    public FileResponse rename(User owner, Long fileId, String newName) {
        FileEntity file = getAccessibleFile(owner, fileId, Role.EDITOR);
        file.setName(newName);
        return FileResponse.from(fileRepository.save(file));
    }

    public FileResponse move(User owner, Long fileId, Long newFolderId) {
        FileEntity file = getOwnedFile(owner, fileId);
        Folder newFolder = null;
        if (newFolderId != null) {
            newFolder = folderService.getOwnedFolder(owner, newFolderId);
        }
        file.setFolder(newFolder);
        return FileResponse.from(fileRepository.save(file));
    }

    /** Owner OR an Editor the file is shared with can trash it (matches "Editor: modify, delete"). */
    public void trash(User requester, Long fileId) {
        FileEntity file = getAccessibleFile(requester, fileId, Role.EDITOR);
        file.setTrashed(true);
        file.setTrashedAt(Instant.now());
        fileRepository.save(file);
    }

    /** Owner OR an Editor can replace the file's content (matches "Editor: upload, modify"). */
    public FileResponse replaceContent(User requester, Long fileId, MultipartFile newFile) {
        if (newFile == null || newFile.isEmpty()) {
            throw new BadRequestException("No file provided");
        }
        FileEntity file = getAccessibleFile(requester, fileId, Role.EDITOR);

        String oldStoragePath = file.getStoragePath();
        String newStoragePath = storageService.store(file.getOwner().getId(), newFile);

        file.setStoragePath(newStoragePath);
        file.setSize(newFile.getSize());
        file.setContentType(newFile.getContentType());
        FileEntity saved = fileRepository.save(file);

        storageService.delete(oldStoragePath);
        return FileResponse.from(saved);
    }

    public void restore(User owner, Long fileId) {
        FileEntity file = getOwnedFile(owner, fileId);
        file.setTrashed(false);
        file.setTrashedAt(null);
        fileRepository.save(file);
    }

    public void deletePermanently(User owner, Long fileId) {
        FileEntity file = getOwnedFile(owner, fileId);
        storageService.delete(file.getStoragePath());
        fileRepository.delete(file);
    }

    public FileResponse star(User owner, Long fileId, boolean starred) {
        FileEntity file = getOwnedFile(owner, fileId);
        file.setStarred(starred);
        return FileResponse.from(fileRepository.save(file));
    }

    public List<FileResponse> getStarred(User owner) {
        return fileRepository.findByOwnerAndStarredTrueAndTrashedFalse(owner)
                .stream().map(FileResponse::from).collect(Collectors.toList());
    }

    public List<FileResponse> getTrash(User owner) {
        return fileRepository.findByOwnerAndTrashedTrue(owner)
                .stream().map(FileResponse::from).collect(Collectors.toList());
    }

    public List<FileResponse> search(User owner, String query, String type, String dateFrom, String dateTo) {
        List<FileEntity> results = fileRepository.findByOwnerAndNameContainingIgnoreCaseAndTrashedFalse(owner, query);

        if (type != null && !type.isBlank() && !type.equalsIgnoreCase("all")) {
            results = results.stream().filter(f -> matchesType(f, type)).collect(Collectors.toList());
        }

        if (dateFrom != null && !dateFrom.isBlank()) {
            Instant from = java.time.LocalDate.parse(dateFrom).atStartOfDay(java.time.ZoneOffset.UTC).toInstant();
            results = results.stream().filter(f -> !f.getCreatedAt().isBefore(from)).collect(Collectors.toList());
        }

        if (dateTo != null && !dateTo.isBlank()) {
            Instant to = java.time.LocalDate.parse(dateTo).plusDays(1).atStartOfDay(java.time.ZoneOffset.UTC).toInstant();
            results = results.stream().filter(f -> f.getCreatedAt().isBefore(to)).collect(Collectors.toList());
        }

        return results.stream().map(FileResponse::from).collect(Collectors.toList());
    }

    private boolean matchesType(FileEntity file, String type) {
        String contentType = file.getContentType() != null ? file.getContentType() : "";
        String ext = file.getName() != null && file.getName().contains(".")
                ? file.getName().substring(file.getName().lastIndexOf('.') + 1).toLowerCase()
                : "";

        return switch (type.toLowerCase()) {
            case "image" -> contentType.startsWith("image/");
            case "video" -> contentType.startsWith("video/");
            case "audio" -> contentType.startsWith("audio/");
            case "document" -> contentType.equals("application/pdf")
                    || List.of("doc", "docx", "txt", "md", "rtf").contains(ext);
            case "spreadsheet" -> List.of("xls", "xlsx", "csv").contains(ext);
            case "archive" -> List.of("zip", "rar", "7z", "tar", "gz").contains(ext);
            default -> true;
        };
    }

    // ---- helpers ----

    /** Returns the file if owned by requester, or if shared with requester at >= requiredRole. */
    FileEntity getAccessibleFile(User requester, Long fileId, Role requiredRole) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found: " + fileId));

        if (file.getOwner().getId().equals(requester.getId())) {
            return file;
        }

        boolean hasAccess = shareRepository.findByFileAndSharedWith(file, requester)
                .map(share -> requiredRole == Role.VIEWER || share.getRole() == Role.EDITOR)
                .orElse(false);

        if (!hasAccess) {
            throw new AccessDeniedCustomException("You do not have access to this file");
        }
        return file;
    }

    FileEntity getOwnedFile(User owner, Long fileId) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found: " + fileId));
        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedCustomException("You do not have access to this file");
        }
        return file;
    }
}
