package com.datashare.file;

import com.datashare.config.StorageProperties;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadPath;

    public FileStorageService(StorageProperties storageProperties)
            throws IOException {

        this.uploadPath = Paths
                .get(storageProperties.getUploadDir())
                .toAbsolutePath()
                .normalize();

        Files.createDirectories(this.uploadPath);
    }

    public StoredFileData store(MultipartFile file)
            throws IOException {

        String originalName = file.getOriginalFilename();

        if (originalName == null || originalName.isBlank()) {
            throw new IllegalArgumentException(
                    "Le nom du fichier est invalide"
            );
        }

        String storedName =
                UUID.randomUUID() + "_" + originalName;

        Path targetPath = uploadPath
                .resolve(storedName)
                .normalize();

        if (!targetPath.startsWith(uploadPath)) {
            throw new IllegalArgumentException(
                    "Chemin de fichier invalide"
            );
        }

        Files.copy(
                file.getInputStream(),
                targetPath,
                StandardCopyOption.REPLACE_EXISTING
        );

        return new StoredFileData(
                originalName,
                storedName,
                targetPath.toString()
        );
    }
}
