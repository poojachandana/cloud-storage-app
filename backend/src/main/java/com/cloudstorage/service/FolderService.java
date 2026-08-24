package com.cloudstorage.service;

import com.cloudstorage.dto.*;
import com.cloudstorage.exception.AccessDeniedCustomException;
import com.cloudstorage.exception.ResourceNotFoundException;
import com.cloudstorage.model.FileEntity;
import com.cloudstorage.model.Folder;
import com.cloudstorage.model.User;
import com.cloudstorage.repository.FileRepository;
import com.cloudstorage.repository.FolderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FolderService {

    private final FolderRepository folderRepository;
    private final FileRepository fileRepository;

    public FolderResponse createFolder(User owner, FolderRequest request) {
        Folder parent = null;
        if (request.getParentId() != null) {
            parent = getOwnedFolder(owner, request.getParentId());
        }

        Folder folder = Folder.builder()
                .name(request.getName())
                .parent(parent)
                .owner(owner)
                .build();

        return FolderResponse.from(folderRepository.save(folder));
    }

    public FolderResponse getFolder(User owner, Long folderId) {
        return FolderResponse.from(getOwnedFolder(owner, folderId));
    }

    public FolderContentsResponse getContents(User owner, Long folderId) {
        List<Folder> folders;
        List<FileEntity> files;

        if (folderId == null) {
            folders = folderRepository.findByOwnerIdAndParentIsNullAndTrashedFalse(owner.getId());
            files = fileRepository.findByOwnerAndFolderIsNullAndTrashedFalse(owner);
        } else {
            Folder parent = getOwnedFolder(owner, folderId);
            folders = folderRepository.findByOwnerAndParentAndTrashedFalse(owner, parent);
            files = fileRepository.findByOwnerAndFolderAndTrashedFalse(owner, parent);
        }

        return new FolderContentsResponse(
                folders.stream().map(FolderResponse::from).collect(Collectors.toList()),
                files.stream().map(FileResponse::from).collect(Collectors.toList())
        );
    }

    public FolderResponse rename(User owner, Long folderId, String newName) {
        Folder folder = getOwnedFolder(owner, folderId);
        folder.setName(newName);
        return FolderResponse.from(folderRepository.save(folder));
    }

    public FolderResponse move(User owner, Long folderId, Long newParentId) {
        Folder folder = getOwnedFolder(owner, folderId);

        Folder newParent = null;
        if (newParentId != null) {
            newParent = getOwnedFolder(owner, newParentId);
            if (newParentId.equals(folderId)) {
                throw new AccessDeniedCustomException("A folder cannot be moved into itself");
            }
        }

        folder.setParent(newParent);
        return FolderResponse.from(folderRepository.save(folder));
    }

    public void trash(User owner, Long folderId) {
        Folder folder = getOwnedFolder(owner, folderId);
        folder.setTrashed(true);
        folder.setTrashedAt(Instant.now());
        folderRepository.save(folder);
    }

    public void restore(User owner, Long folderId) {
        Folder folder = getOwnedFolder(owner, folderId);
        folder.setTrashed(false);
        folder.setTrashedAt(null);
        folderRepository.save(folder);
    }

    public List<FolderResponse> search(User owner, String query) {
        return folderRepository.findByOwnerAndNameContainingIgnoreCaseAndTrashedFalse(owner, query)
                .stream().map(FolderResponse::from).collect(Collectors.toList());
    }

    public List<FolderResponse> getTrash(User owner) {
        return folderRepository.findByOwnerAndTrashedTrue(owner)
                .stream().map(FolderResponse::from).collect(Collectors.toList());
    }

    // ---- helpers ----

    Folder getOwnedFolder(User owner, Long folderId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found: " + folderId));
        if (!folder.getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedCustomException("You do not have access to this folder");
        }
        return folder;
    }
}
