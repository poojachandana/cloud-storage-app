package com.cloudstorage.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;

@Configuration
public class StorageConfig {

    @Value("${app.storage.base-path}")
    private String basePath;

    @Bean
    public File storageBaseDir() {
        File dir = new File(basePath);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        return dir;
    }
}
