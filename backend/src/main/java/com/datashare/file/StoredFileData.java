package com.datashare.file;

public class StoredFileData {

    private final String originalName;
    private final String storedName;
    private final String storagePath;

    public StoredFileData(
            String originalName,
            String storedName,
            String storagePath
    ) {
        this.originalName = originalName;
        this.storedName = storedName;
        this.storagePath = storagePath;
    }

    public String getOriginalName() {
        return originalName;
    }

    public String getStoredName() {
        return storedName;
    }

    public String getStoragePath() {
        return storagePath;
    }
}