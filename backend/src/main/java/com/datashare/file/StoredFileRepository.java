package com.datashare.file;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface StoredFileRepository
        extends JpaRepository<StoredFile, Long> {

    Optional<StoredFile> findByDownloadToken(String downloadToken);

    List<StoredFile> findByOwnerEmailOrderByUploadedAtDesc(
            String email
    );
    Optional<StoredFile> findByIdAndOwnerEmail(
            Long id,
            String email
    );

    List<StoredFile> findByExpiresAtLessThanEqual(
            LocalDateTime dateTime
    );
}
