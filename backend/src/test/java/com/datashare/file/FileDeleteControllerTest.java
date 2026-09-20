package com.datashare.file;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileDeleteControllerTest {

    @Mock
    private FileDeleteService fileDeleteService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private FileDeleteController fileDeleteController;

    @Test
    void shouldDeleteFileForAuthenticatedUser() {

        Long fileId = 13L;
        String email = "claire@example.com";

        when(authentication.getName())
                .thenReturn(email);

        ResponseEntity<Void> response =
                fileDeleteController.deleteFile(
                        fileId,
                        authentication
                );

        assertEquals(
                HttpStatus.NO_CONTENT,
                response.getStatusCode()
        );

        assertNull(response.getBody());

        verify(authentication).getName();

        verify(fileDeleteService)
                .deleteFile(
                        fileId,
                        email
                );
    }
}