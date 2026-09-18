package com.datashare.file;

import com.datashare.file.dto.FileHistoryResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileHistoryServiceTest {

    @Mock
    private StoredFileRepository storedFileRepository;

    @InjectMocks
    private FileHistoryService fileHistoryService;

    @Test
    void shouldReturnActiveFileInUserHistory() {
        String email = "claire@example.com";
        LocalDateTime uploadedAt = LocalDateTime.now().minusHours(1);
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(2);

        StoredFile storedFile = mock(StoredFile.class);

        when(storedFile.getId()).thenReturn(1L);
        when(storedFile.getOriginalName()).thenReturn("photo.jpg");
        when(storedFile.getSize()).thenReturn(2500L);
        when(storedFile.getUploadedAt()).thenReturn(uploadedAt);
        when(storedFile.getExpiresAt()).thenReturn(expiresAt);
        when(storedFile.getDownloadToken()).thenReturn("token-123");

        when(storedFileRepository.findByOwnerEmailOrderByUploadedAtDesc(email))
                .thenReturn(List.of(storedFile));

        List<FileHistoryResponse> result =
                fileHistoryService.getHistory(email);

        assertEquals(1, result.size());

        FileHistoryResponse response = result.getFirst();

        assertEquals(1L, response.getId());
        assertEquals("photo.jpg", response.getOriginalName());
        assertEquals(2500L, response.getSize());
        assertEquals(uploadedAt, response.getUploadedAt());
        assertEquals(expiresAt, response.getExpiresAt());
        assertEquals("token-123", response.getDownloadToken());
        assertFalse(response.isExpired());

        verify(storedFileRepository)
                .findByOwnerEmailOrderByUploadedAtDesc(email);
    }

    @Test
    void shouldMarkExpiredFileAsExpired() {
        String email = "claire@example.com";

        StoredFile storedFile = mock(StoredFile.class);

        when(storedFile.getExpiresAt())
                .thenReturn(LocalDateTime.now().minusHours(1));

        when(storedFileRepository.findByOwnerEmailOrderByUploadedAtDesc(email))
                .thenReturn(List.of(storedFile));

        List<FileHistoryResponse> result =
                fileHistoryService.getHistory(email);

        assertEquals(1, result.size());
        assertTrue(result.getFirst().isExpired());
    }

    @Test
    void shouldReturnEmptyHistoryWhenUserHasNoFiles() {
        String email = "claire@example.com";

        when(storedFileRepository.findByOwnerEmailOrderByUploadedAtDesc(email))
                .thenReturn(List.of());

        List<FileHistoryResponse> result =
                fileHistoryService.getHistory(email);

        assertTrue(result.isEmpty());

        verify(storedFileRepository)
                .findByOwnerEmailOrderByUploadedAtDesc(email);
    }
}