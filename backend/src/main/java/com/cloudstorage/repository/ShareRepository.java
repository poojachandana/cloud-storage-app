package com.cloudstorage.repository;

import com.cloudstorage.model.FileEntity;
import com.cloudstorage.model.Share;
import com.cloudstorage.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShareRepository extends JpaRepository<Share, Long> {
    List<Share> findBySharedWith(User sharedWith);
    List<Share> findByFile(FileEntity file);
    Optional<Share> findByFileAndSharedWith(FileEntity file, User sharedWith);
}
