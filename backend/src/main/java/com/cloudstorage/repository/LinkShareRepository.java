package com.cloudstorage.repository;

import com.cloudstorage.model.LinkShare;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LinkShareRepository extends JpaRepository<LinkShare, Long> {
    Optional<LinkShare> findByToken(String token);
}
