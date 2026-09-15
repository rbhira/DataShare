package com.datashare.file;

import com.datashare.file.dto.FileUploadResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private final FileUploadService fileUploadService;

    public FileUploadController(
            FileUploadService fileUploadService
    ) {
        this.fileUploadService = fileUploadService;
    }

    @PostMapping
    public ResponseEntity<FileUploadResponse> uploadFile(
            @RequestParam("file") MultipartFile file,

            @RequestParam(
                    value = "expiresAt",
                    required = false
            )
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime expiresAt,

            Authentication authentication
    ) throws IOException {

        String ownerEmail = authentication.getName();

        FileUploadResponse response =
                fileUploadService.upload(
                        file,
                        ownerEmail,
                        expiresAt
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}
