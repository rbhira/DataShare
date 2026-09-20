package com.datashare.file;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;

@Service
public class FileDeleteService {

    private final StoredFileRepository storedFileRepository;
    private final FileStorageService fileStorageService;

    public FileDeleteService(
            StoredFileRepository storedFileRepository,
            FileStorageService fileStorageService
    ) {
        this.storedFileRepository = storedFileRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public void deleteFile(
            Long fileId,
            String email
    ) {
        StoredFile storedFile = storedFileRepository
                .findByIdAndOwnerEmail(fileId, email)
                .orElseThrow(() ->
                        new FileDeleteNotFoundException(
                                "Fichier introuvable"
                        )
                );

        try {
            fileStorageService.delete(
                    storedFile.getStoredName()
            );
        } catch (IOException exception) {
            throw new FileDeletionException(
                    "Impossible de supprimer le fichier",
                    exception
            );
        }

        storedFileRepository.delete(storedFile);
    }
}