package com.datashare.file;

import com.datashare.file.dto.FileHistoryResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/files")
public class FileHistoryController {

    private final FileHistoryService fileHistoryService;

    public FileHistoryController(
            FileHistoryService fileHistoryService
    ) {
        this.fileHistoryService = fileHistoryService;
    }

    @GetMapping
    public ResponseEntity<List<FileHistoryResponse>> getHistory(
            Authentication authentication
    ) {
        String email = authentication.getName();

        return ResponseEntity.ok(
                fileHistoryService.getHistory(email)
        );
    }
}
