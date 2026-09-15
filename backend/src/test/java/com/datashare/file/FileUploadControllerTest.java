package com.datashare.file;

import com.datashare.auth.GlobalExceptionHandler;
import com.datashare.file.dto.FileUploadResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class FileUploadControllerTest {

    @Mock
    private FileUploadService fileUploadService;

    private MockMvc mockMvc;

    private Authentication authentication;

    @BeforeEach
    void setUp() {

        FileUploadController controller =
                new FileUploadController(fileUploadService);

        mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setControllerAdvice(
                        new GlobalExceptionHandler()
                )
                .build();

        authentication =
                new UsernamePasswordAuthenticationToken(
                        "test@datashare.fr",
                        null,
                        Collections.emptyList()
                );
    }

    private MockMultipartFile createFile() {

        return new MockMultipartFile(
                "file",
                "test-upload.txt",
                "text/plain",
                "Test upload DataShare".getBytes()
        );
    }

    @Test
    void shouldUploadFileAndReturn201()
            throws Exception {

        LocalDateTime uploadedAt =
                LocalDateTime.now();

        FileUploadResponse response =
                new FileUploadResponse(
                        1L,
                        "test-upload.txt",
                        21L,
                        "text/plain",
                        "download-token",
                        uploadedAt,
                        uploadedAt.plusDays(7)
                );

        when(fileUploadService.upload(
                any(),
                eq("test@datashare.fr"),
                isNull()
        )).thenReturn(response);

        mockMvc.perform(
                        multipart("/api/files")
                                .file(createFile())
                                .principal(authentication)
                )
                .andExpect(status().isCreated())
                .andExpect(
                        jsonPath("$.id").value(1)
                )
                .andExpect(
                        jsonPath("$.originalName")
                                .value("test-upload.txt")
                );
    }

    @Test
    void shouldAcceptCustomExpiration()
            throws Exception {

        LocalDateTime expiration =
                LocalDateTime.of(
                        2026,
                        9,
                        18,
                        12,
                        0
                );

        FileUploadResponse response =
                new FileUploadResponse(
                        1L,
                        "test-upload.txt",
                        21L,
                        "text/plain",
                        "download-token",
                        LocalDateTime.now(),
                        expiration
                );

        when(fileUploadService.upload(
                any(),
                eq("test@datashare.fr"),
                eq(expiration)
        )).thenReturn(response);

        mockMvc.perform(
                        multipart("/api/files")
                                .file(createFile())
                                .param(
                                        "expiresAt",
                                        "2026-09-18T12:00:00"
                                )
                                .principal(authentication)
                )
                .andExpect(status().isCreated())
                .andExpect(
                        jsonPath("$.expiresAt")
                                .value("2026-09-18T12:00:00")
                );
    }

    @Test
    void shouldReturn400ForEmptyFile()
            throws Exception {

        when(fileUploadService.upload(
                any(),
                anyString(),
                isNull()
        )).thenThrow(
                new EmptyFileException(
                        "Le fichier est vide"
                )
        );

        mockMvc.perform(
                        multipart("/api/files")
                                .file(createFile())
                                .principal(authentication)
                )
                .andExpect(status().isBadRequest())
                .andExpect(
                        jsonPath("$.message")
                                .value("Le fichier est vide")
                );
    }

    @Test
    void shouldReturn413ForLargeFile()
            throws Exception {

        when(fileUploadService.upload(
                any(),
                anyString(),
                isNull()
        )).thenThrow(
                new FileTooLargeException(
                        "Le fichier dépasse la taille maximale de 1 Go"
                )
        );

        mockMvc.perform(
                        multipart("/api/files")
                                .file(createFile())
                                .principal(authentication)
                )
                .andExpect(
                        status().isPayloadTooLarge()
                );
    }

    @Test
    void shouldReturn415ForForbiddenType()
            throws Exception {

        when(fileUploadService.upload(
                any(),
                anyString(),
                isNull()
        )).thenThrow(
                new InvalidFileTypeException(
                        "Ce type de fichier est interdit"
                )
        );

        mockMvc.perform(
                        multipart("/api/files")
                                .file(createFile())
                                .principal(authentication)
                )
                .andExpect(
                        status().isUnsupportedMediaType()
                )
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "Ce type de fichier est interdit"
                                )
                );
    }
}