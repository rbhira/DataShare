package com.datashare.file;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExpiredFileCleanupService {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    ExpiredFileCleanupService.class
            );

    private final StoredFileRepository storedFileRepository;
    private final FileStorageService fileStorageService;

    public ExpiredFileCleanupService(
            StoredFileRepository storedFileRepository,
            FileStorageService fileStorageService
    ) {
        this.storedFileRepository = storedFileRepository;
        this.fileStorageService = fileStorageService;
    }

    public void cleanupExpiredFiles(
            LocalDateTime now
    ) {
        List<StoredFile> expiredFiles =
                storedFileRepository
                        .findByExpiresAtLessThanEqual(now);

        for (StoredFile storedFile : expiredFiles) {
            try {
                fileStorageService.delete(
                        storedFile.getStoredName()
                );

                storedFileRepository.delete(storedFile);

                LOGGER.info(
                        "Expired file deleted: id={}",
                        storedFile.getId()
                );
            } catch (IOException exception) {
                LOGGER.error(
                        "Unable to delete expired file: id={}",
                        storedFile.getId(),
                        exception
                );
            }
        }
    }
}