package com.datashare.file.dto;

import java.time.LocalDateTime;

public class FileHistoryResponse {

    private final Long id;
    private final String originalName;
    private final Long size;
    private final LocalDateTime uploadedAt;
    private final LocalDateTime expiresAt;
    private final String downloadToken;
    private final boolean expired;

    public FileHistoryResponse(
            Long id,
            String originalName,
            Long size,
            LocalDateTime uploadedAt,
            LocalDateTime expiresAt,
            String downloadToken,
            boolean expired
    ) {
        this.id = id;
        this.originalName = originalName;
        this.size = size;
        this.uploadedAt = uploadedAt;
        this.expiresAt = expiresAt;
        this.downloadToken = downloadToken;
        this.expired = expired;
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

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public String getDownloadToken() {
        return downloadToken;
    }

    public boolean isExpired() {
        return expired;
    }
}