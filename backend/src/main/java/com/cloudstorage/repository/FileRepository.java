package com.cloudstorage.repository;

import com.cloudstorage.model.FileEntity;
import com.cloudstorage.model.Folder;
import com.cloudstorage.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FileRepository extends JpaRepository<FileEntity, Long> {
    List<FileEntity> findByOwnerAndFolderAndTrashedFalse(User owner, Folder folder);
    List<FileEntity> findByOwnerAndFolderIsNullAndTrashedFalse(User owner);
    List<FileEntity> findByOwnerAndTrashedTrue(User owner);
    List<FileEntity> findByOwnerAndStarredTrueAndTrashedFalse(User owner);
    List<FileEntity> findByOwnerAndNameContainingIgnoreCaseAndTrashedFalse(User owner, String name);

    @Query("select coalesce(sum(f.size), 0) from FileEntity f where f.owner = ?1")
    long sumSizeByOwner(User owner);
}
