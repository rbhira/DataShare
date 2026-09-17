package com.datashare.file;

import com.datashare.file.dto.FileDownloadInfoResponse;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/download")
public class FileDownloadController {

    private final FileDownloadService fileDownloadService;

    public FileDownloadController(
            FileDownloadService fileDownloadService
    ) {
        this.fileDownloadService = fileDownloadService;
    }

    @GetMapping("/{token}")
    public ResponseEntity<FileDownloadInfoResponse> getFileInfo(
            @PathVariable String token
    ) {

        StoredFile storedFile =
                fileDownloadService.getValidFile(token);

        FileDownloadInfoResponse response =
                new FileDownloadInfoResponse(
                        storedFile.getOriginalName(),
                        storedFile.getMimeType(),
                        storedFile.getSize(),
                        storedFile.getExpiresAt()
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{token}/file")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String token
    ) {

        StoredFile storedFile =
                fileDownloadService.getValidFile(token);

        Path path =
                Path.of(storedFile.getStoragePath());

        if (!Files.exists(path)) {
            throw new DownloadNotFoundException(
                    "Fichier introuvable"
            );
        }

        Resource resource =
                new FileSystemResource(path);

        MediaType mediaType;

        try {
            mediaType =
                    MediaType.parseMediaType(
                            storedFile.getMimeType()
                    );
        } catch (Exception exception) {
            mediaType =
                    MediaType.APPLICATION_OCTET_STREAM;
        }

        ContentDisposition disposition =
                ContentDisposition
                        .attachment()
                        .filename(
                                storedFile.getOriginalName(),
                                StandardCharsets.UTF_8
                        )
                        .build();

        return ResponseEntity
                .ok()
                .contentType(mediaType)
                .contentLength(storedFile.getSize())
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        disposition.toString()
                )
                .body(resource);
    }
}