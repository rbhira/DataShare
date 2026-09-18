package com.datashare.file;

import com.datashare.file.dto.FileHistoryResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FileHistoryService {

    private final StoredFileRepository storedFileRepository;

    public FileHistoryService(
            StoredFileRepository storedFileRepository
    ) {
        this.storedFileRepository = storedFileRepository;
    }

    public List<FileHistoryResponse> getHistory(
            String email
    ) {
        LocalDateTime now = LocalDateTime.now();

        return storedFileRepository
                .findByOwnerEmailOrderByUploadedAtDesc(email)
                .stream()
                .map(storedFile ->
                        new FileHistoryResponse(
                                storedFile.getId(),
                                storedFile.getOriginalName(),
                                storedFile.getSize(),
                                storedFile.getUploadedAt(),
                                storedFile.getExpiresAt(),
                                storedFile.getDownloadToken(),
                                !storedFile
                                        .getExpiresAt()
                                        .isAfter(now)
                        )
                )
                .toList();
    }
}