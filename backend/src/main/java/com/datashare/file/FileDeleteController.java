package com.datashare.file;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/files")
public class FileDeleteController {

    private final FileDeleteService fileDeleteService;

    public FileDeleteController(
            FileDeleteService fileDeleteService
    ) {
        this.fileDeleteService = fileDeleteService;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email = authentication.getName();

        fileDeleteService.deleteFile(
                id,
                email
        );

        return ResponseEntity.noContent().build();
    }
}
