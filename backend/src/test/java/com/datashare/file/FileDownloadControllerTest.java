package com.datashare.file;

import com.datashare.auth.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class FileDownloadControllerTest {

    @Mock
    private FileDownloadService fileDownloadService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        FileDownloadController controller =
                new FileDownloadController(fileDownloadService);

        mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void shouldReturnFileInfoWhenTokenIsValid() throws Exception {
        StoredFile storedFile = new StoredFile();
        storedFile.setOriginalName("test.txt");
        storedFile.setMimeType("text/plain");
        storedFile.setSize(21L);
        storedFile.setExpiresAt(
                LocalDateTime.now().plusDays(1)
        );

        when(
                fileDownloadService.getValidFile("valid-token")
        ).thenReturn(storedFile);

        mockMvc.perform(
                        get("/api/download/valid-token")
                )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.originalName")
                                .value("test.txt")
                )
                .andExpect(
                        jsonPath("$.mimeType")
                                .value("text/plain")
                )
                .andExpect(
                        jsonPath("$.size")
                                .value(21)
                )
                .andExpect(
                        jsonPath("$.expiresAt")
                                .exists()
                );
    }

    @Test
    void shouldReturn404WhenTokenDoesNotExist() throws Exception {
        when(
                fileDownloadService.getValidFile(
                        "unknown-token"
                )
        ).thenThrow(
                new DownloadNotFoundException(
                        "Lien de téléchargement introuvable"
                )
        );

        mockMvc.perform(
                        get("/api/download/unknown-token")
                )
                .andExpect(status().isNotFound())
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "Lien de téléchargement introuvable"
                                )
                );
    }

    @Test
    void shouldReturn410WhenFileIsExpired() throws Exception {
        when(
                fileDownloadService.getValidFile(
                        "expired-token"
                )
        ).thenThrow(
                new FileExpiredException(
                        "Ce lien de téléchargement a expiré"
                )
        );

        mockMvc.perform(
                        get("/api/download/expired-token")
                )
                .andExpect(status().isGone())
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "Ce lien de téléchargement a expiré"
                                )
                );
    }

    @Test
    void shouldDownloadFileWhenTokenIsValid() throws Exception {
        Path temporaryFile =
                Files.createTempFile(
                        "datashare-download-",
                        ".txt"
                );

        Files.writeString(
                temporaryFile,
                "contenu test"
        );

        try {
            StoredFile storedFile = new StoredFile();
            storedFile.setOriginalName("test.txt");
            storedFile.setMimeType("text/plain");
            storedFile.setSize(
                    Files.size(temporaryFile)
            );
            storedFile.setStoragePath(
                    temporaryFile.toString()
            );
            storedFile.setExpiresAt(
                    LocalDateTime.now().plusDays(1)
            );

            when(
                    fileDownloadService.getValidFile(
                            "valid-token"
                    )
            ).thenReturn(storedFile);

            mockMvc.perform(
                            get(
                                    "/api/download/valid-token/file"
                            )
                    )
                    .andExpect(status().isOk())
                    .andExpect(
                            content()
                                    .contentType("text/plain")
                    )
                    .andExpect(
                            header().string(
                                    HttpHeaders.CONTENT_DISPOSITION,
                                    containsString("attachment")
                            )
                    )
                    .andExpect(
                            content()
                                    .string("contenu test")
                    );

        } finally {
            Files.deleteIfExists(temporaryFile);
        }
    }

    @Test
    void shouldReturn404WhenPhysicalFileDoesNotExist()
            throws Exception {

        StoredFile storedFile = new StoredFile();
        storedFile.setOriginalName("missing.txt");
        storedFile.setMimeType("text/plain");
        storedFile.setSize(10L);
        storedFile.setStoragePath(
                "missing-file-that-does-not-exist.txt"
        );
        storedFile.setExpiresAt(
                LocalDateTime.now().plusDays(1)
        );

        when(
                fileDownloadService.getValidFile(
                        "valid-token"
                )
        ).thenReturn(storedFile);

        mockMvc.perform(
                        get(
                                "/api/download/valid-token/file"
                        )
                )
                .andExpect(status().isNotFound())
                .andExpect(
                        jsonPath("$.message")
                                .value("Fichier introuvable")
                );
    }
}