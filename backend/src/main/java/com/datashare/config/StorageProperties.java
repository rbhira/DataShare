package com.datashare.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class StorageProperties {

    private final String uploadDir;

    public StorageProperties(
            @Value("${storage.upload-dir}") String uploadDir
    ) {
        this.uploadDir = uploadDir;
    }

    public String getUploadDir() {
        return uploadDir;
    }
}
