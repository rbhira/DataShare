package com.datashare.file.dto;

import java.time.LocalDateTime;

public class FileUploadResponse {

    private Long id;
    private String originalName;
    private Long size;
    private String mimeType;
    private String downloadToken;
    private LocalDateTime uploadedAt;
    private LocalDateTime expiresAt;

    public FileUploadResponse(
            Long id,
            String originalName,
            Long size,
            String mimeType,
            String downloadToken,
            LocalDateTime uploadedAt,
            LocalDateTime expiresAt
    ) {
        this.id = id;
        this.originalName = originalName;
        this.size = size;
        this.mimeType = mimeType;
        this.downloadToken = downloadToken;
        this.uploadedAt = uploadedAt;
        this.expiresAt = expiresAt;
    }

    public Long getId() {
        return id;
    }

    public String getOriginalName() {
        return originalName;
    }

    public Long getSize() {
        return size;
    }

    public String getMimeType() {
        return mimeType;
    }

    public String getDownloadToken() {
        return downloadToken;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
}
