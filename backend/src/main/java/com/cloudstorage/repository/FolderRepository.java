package com.cloudstorage.repository;

import com.cloudstorage.model.Folder;
import com.cloudstorage.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findByOwnerAndParentAndTrashedFalse(User owner, Folder parent);
    List<Folder> findByOwnerIdAndParentIsNullAndTrashedFalse(Long ownerId);
    List<Folder> findByOwnerAndTrashedTrue(User owner);
    List<Folder> findByOwnerAndNameContainingIgnoreCaseAndTrashedFalse(User owner, String name);
}
