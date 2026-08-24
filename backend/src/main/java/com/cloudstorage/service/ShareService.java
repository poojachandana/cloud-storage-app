package com.cloudstorage.service;

import com.cloudstorage.dto.ShareRequest;
import com.cloudstorage.dto.ShareResponse;
import com.cloudstorage.exception.AccessDeniedCustomException;
import com.cloudstorage.exception.BadRequestException;
import com.cloudstorage.exception.ResourceNotFoundException;
import com.cloudstorage.model.FileEntity;
import com.cloudstorage.model.Share;
import com.cloudstorage.model.User;
import com.cloudstorage.repository.FileRepository;
import com.cloudstorage.repository.ShareRepository;
import com.cloudstorage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShareService {

    private final ShareRepository shareRepository;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;

    public ShareResponse shareFile(User owner, ShareRequest request) {
        FileEntity file = fileRepository.findById(request.getFileId())
                .orElseThrow(() -> new ResourceNotFoundException("File not found: " + request.getFileId()));

        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedCustomException("Only the owner can share this file");
        }

        User target = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email: " + request.getEmail()));

        if (target.getId().equals(owner.getId())) {
            throw new BadRequestException("You cannot share a file with yourself");
        }

        Share share = shareRepository.findByFileAndSharedWith(file, target)
                .orElse(Share.builder().file(file).sharedWith(target).sharedBy(owner).build());

        share.setRole(request.getRole());

        return ShareResponse.from(shareRepository.save(share));
    }

    public List<ShareResponse> getSharedWithMe(User user) {
        return shareRepository.findBySharedWith(user)
                .stream().map(ShareResponse::from).collect(Collectors.toList());
    }

    public List<ShareResponse> getSharesForFile(User owner, Long fileId) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found: " + fileId));

        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedCustomException("Only the owner can view this file's shares");
        }

        return shareRepository.findByFile(file)
                .stream().map(ShareResponse::from).collect(Collectors.toList());
    }

    public void revoke(User owner, Long shareId) {
        Share share = shareRepository.findById(shareId)
                .orElseThrow(() -> new ResourceNotFoundException("Share not found: " + shareId));

        if (!share.getSharedBy().getId().equals(owner.getId())) {
            throw new AccessDeniedCustomException("Only the sharer can revoke this share");
        }

        shareRepository.delete(share);
    }
}
