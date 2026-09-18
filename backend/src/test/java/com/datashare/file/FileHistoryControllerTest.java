package com.datashare.file;

import com.datashare.file.dto.FileHistoryResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileHistoryControllerTest {

    @Mock
    private FileHistoryService fileHistoryService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private FileHistoryController fileHistoryController;

    @Test
    void shouldReturnHistoryForAuthenticatedUser() {
        String email = "claire@example.com";

        FileHistoryResponse file = new FileHistoryResponse(
                1L,
                "photo.jpg",
                2500L,
                LocalDateTime.now().minusHours(1),
                LocalDateTime.now().plusDays(2),
                "token-123",
                false
        );

        when(authentication.getName()).thenReturn(email);
        when(fileHistoryService.getHistory(email))
                .thenReturn(List.of(file));

        ResponseEntity<List<FileHistoryResponse>> response =
                fileHistoryController.getHistory(authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(
                "photo.jpg",
                response.getBody().getFirst().getOriginalName()
        );

        verify(authentication).getName();
        verify(fileHistoryService).getHistory(email);
    }

    @Test
    void shouldReturnEmptyHistoryForAuthenticatedUserWithoutFiles() {
        String email = "claire@example.com";

        when(authentication.getName()).thenReturn(email);
        when(fileHistoryService.getHistory(email))
                .thenReturn(List.of());

        ResponseEntity<List<FileHistoryResponse>> response =
                fileHistoryController.getHistory(authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());

        verify(fileHistoryService).getHistory(email);
    }
}