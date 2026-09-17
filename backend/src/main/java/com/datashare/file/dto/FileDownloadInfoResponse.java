package com.datashare.file.dto;

import java.time.LocalDateTime;

public class FileDownloadInfoResponse {

    private final String originalName;
    private final String mimeType;
    private final Long size;
    private final LocalDateTime expiresAt;

    public FileDownloadInfoResponse(
            String originalName,
            String mimeType,
            Long size,
            LocalDateTime expiresAt
    ) {
        this.originalName = originalName;
        this.mimeType = mimeType;
        this.size = size;
        this.expiresAt = expiresAt;
    }

    public String getOriginalName() {
        return originalName;
    }

    public String getMimeType() {
        return mimeType;
    }

    public Long getSize() {
        return size;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
}