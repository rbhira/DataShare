package com.datashare.file;

import com.datashare.file.dto.FileUploadResponse;
import com.datashare.user.User;
import com.datashare.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class FileUploadService {

    private static final long MAX_FILE_SIZE =
            1_000_000_000L;

    private static final Set<String> FORBIDDEN_EXTENSIONS =
            Set.of(
                    ".exe",
                    ".bat",
                    ".cmd",
                    ".com",
                    ".msi",
                    ".ps1",
                    ".vbs",
                    ".scr"
            );

    private final StoredFileRepository storedFileRepository;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;

    public FileUploadService(
            StoredFileRepository storedFileRepository,
            FileStorageService fileStorageService,
            UserRepository userRepository
    ) {
        this.storedFileRepository = storedFileRepository;
        this.fileStorageService = fileStorageService;
        this.userRepository = userRepository;
    }

    public FileUploadResponse upload(
            MultipartFile file,
            String ownerEmail,
            LocalDateTime requestedExpiresAt
    ) throws IOException {

        if (file.isEmpty()) {
            throw new EmptyFileException(
                    "Le fichier est vide"
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileTooLargeException(
                    "Le fichier dépasse la taille maximale de 1 Go"
            );
        }

        String originalName = file.getOriginalFilename();

        if (originalName == null || originalName.isBlank()) {
            throw new InvalidFileTypeException(
                    "Le nom du fichier est invalide"
            );
        }

        validateExtension(originalName);

        User owner = userRepository
                .findByEmail(ownerEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Utilisateur introuvable"
                        )
                );

        LocalDateTime uploadedAt =
                LocalDateTime.now();

        LocalDateTime maximumExpiresAt =
                uploadedAt.plusDays(7);

        LocalDateTime expiresAt;

        if (requestedExpiresAt == null) {
            expiresAt = maximumExpiresAt;
        } else {

            if (!requestedExpiresAt.isAfter(uploadedAt)) {
                throw new InvalidExpirationException(
                        "La date d'expiration doit être dans le futur"
                );
            }

            if (requestedExpiresAt.isAfter(maximumExpiresAt)) {
                throw new InvalidExpirationException(
                        "La date d'expiration ne peut pas dépasser 7 jours"
                );
            }

            expiresAt = requestedExpiresAt;
        }

        StoredFileData storedFileData =
                fileStorageService.store(file);

        StoredFile storedFile = new StoredFile();

        storedFile.setOriginalName(
                storedFileData.getOriginalName()
        );

        storedFile.setStoredName(
                storedFileData.getStoredName()
        );

        storedFile.setMimeType(
                file.getContentType() != null
                        ? file.getContentType()
                        : "application/octet-stream"
        );

        storedFile.setSize(file.getSize());

        storedFile.setStoragePath(
                storedFileData.getStoragePath()
        );

        storedFile.setDownloadToken(
                UUID.randomUUID().toString()
        );

        storedFile.setUploadedAt(uploadedAt);
        storedFile.setExpiresAt(expiresAt);
        storedFile.setOwner(owner);

        StoredFile savedFile =
                storedFileRepository.save(storedFile);

        return new FileUploadResponse(
                savedFile.getId(),
                savedFile.getOriginalName(),
                savedFile.getSize(),
                savedFile.getMimeType(),
                savedFile.getDownloadToken(),
                savedFile.getUploadedAt(),
                savedFile.getExpiresAt()
        );
    }

    private void validateExtension(String fileName) {

        String lowerCaseName =
                fileName.toLowerCase(Locale.ROOT);

        for (String extension : FORBIDDEN_EXTENSIONS) {

            if (lowerCaseName.endsWith(extension)) {
                throw new InvalidFileTypeException(
                        "Ce type de fichier est interdit"
                );
            }
        }
    }
}
