package com.datashare.file;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class FileDownloadService {

    private final StoredFileRepository storedFileRepository;

    public FileDownloadService(
            StoredFileRepository storedFileRepository
    ) {
        this.storedFileRepository = storedFileRepository;
    }

    public StoredFile getValidFile(String downloadToken) {

        StoredFile storedFile = storedFileRepository
                .findByDownloadToken(downloadToken)
                .orElseThrow(() ->
                        new DownloadNotFoundException(
                                "Lien de téléchargement introuvable"
                        )
                );

        if (!storedFile.getExpiresAt()
                .isAfter(LocalDateTime.now())) {

            throw new FileExpiredException(
                    "Ce lien de téléchargement a expiré"
            );
        }

        return storedFile;
    }
}