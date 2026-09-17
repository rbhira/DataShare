package com.datashare.file;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

class FileDownloadServiceTest {

    @Mock
    private StoredFileRepository storedFileRepository;

    private FileDownloadService fileDownloadService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        fileDownloadService =
                new FileDownloadService(storedFileRepository);
    }

    @Test
    void shouldReturnFileWhenTokenIsValid() {
        StoredFile storedFile = new StoredFile();
        storedFile.setDownloadToken("valid-token");
        storedFile.setExpiresAt(
                LocalDateTime.now().plusDays(1)
        );

        when(
                storedFileRepository.findByDownloadToken(
                        "valid-token"
                )
        ).thenReturn(Optional.of(storedFile));

        StoredFile result =
                fileDownloadService.getValidFile(
                        "valid-token"
                );

        assertSame(storedFile, result);
    }

    @Test
    void shouldThrowExceptionWhenTokenDoesNotExist() {
        when(
                storedFileRepository.findByDownloadToken(
                        "unknown-token"
                )
        ).thenReturn(Optional.empty());

        assertThrows(
                DownloadNotFoundException.class,
                () -> fileDownloadService.getValidFile(
                        "unknown-token"
                )
        );
    }

    @Test
    void shouldThrowExceptionWhenFileIsExpired() {
        StoredFile storedFile = new StoredFile();
        storedFile.setDownloadToken("expired-token");
        storedFile.setExpiresAt(
                LocalDateTime.now().minusMinutes(1)
        );

        when(
                storedFileRepository.findByDownloadToken(
                        "expired-token"
                )
        ).thenReturn(Optional.of(storedFile));

        assertThrows(
                FileExpiredException.class,
                () -> fileDownloadService.getValidFile(
                        "expired-token"
                )
        );
    }
}