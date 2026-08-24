package com.cloudstorage.service;

import com.cloudstorage.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Local disk storage implementation.
 *
 * To swap this for AWS S3 later: implement the same method signatures using
 * the AWS SDK (PutObjectRequest / GetObject / DeleteObject), inject an S3Client
 * bean instead of the base path, and generate presigned URLs for direct
 * upload/download instead of streaming through this server.
 */
@Service
public class StorageService {

    @Value("${app.storage.base-path}")
    private String basePath;

    public String store(Long ownerId, MultipartFile file) {
        try {
            Path userDir = Paths.get(basePath, String.valueOf(ownerId));
            Files.createDirectories(userDir);

            String storedFileName = UUID.randomUUID() + "_" + sanitize(file.getOriginalFilename());
            Path target = userDir.resolve(storedFileName);

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            return target.toString();
        } catch (IOException e) {
            throw new BadRequestException("Failed to store file: " + e.getMessage());
        }
    }

    public InputStream load(String storagePath) {
        try {
            return Files.newInputStream(Paths.get(storagePath));
        } catch (IOException e) {
            throw new BadRequestException("Failed to read file: " + e.getMessage());
        }
    }

    public void delete(String storagePath) {
        try {
            Files.deleteIfExists(Paths.get(storagePath));
        } catch (IOException e) {
            // Log and continue - a missing file on disk shouldn't block metadata cleanup
        }
    }

    private String sanitize(String name) {
        if (name == null) return "file";
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
