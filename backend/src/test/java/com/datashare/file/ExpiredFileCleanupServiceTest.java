package com.datashare.file;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExpiredFileCleanupServiceTest {

    @Mock
    private StoredFileRepository storedFileRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private ExpiredFileCleanupService expiredFileCleanupService;

    @Test
    void shouldDeletePhysicalFileBeforeDatabaseEntry()
            throws IOException {

        LocalDateTime now =
                LocalDateTime.of(
                        2026,
                        9,
                        23,
                        15,
                        0
                );

        StoredFile storedFile = mock(StoredFile.class);

        when(storedFile.getStoredName())
                .thenReturn("uuid-expired.txt");

        when(storedFileRepository
                .findByExpiresAtLessThanEqual(now))
                .thenReturn(List.of(storedFile));

        expiredFileCleanupService
                .cleanupExpiredFiles(now);

        InOrder inOrder = inOrder(
                storedFileRepository,
                fileStorageService
        );

        inOrder.verify(storedFileRepository)
                .findByExpiresAtLessThanEqual(now);

        inOrder.verify(fileStorageService)
                .delete("uuid-expired.txt");

        inOrder.verify(storedFileRepository)
                .delete(storedFile);
    }

    @Test
    void shouldKeepDatabaseEntryWhenPhysicalDeletionFails()
            throws IOException {

        LocalDateTime now =
                LocalDateTime.of(
                        2026,
                        9,
                        23,
                        15,
                        0
                );

        StoredFile storedFile = mock(StoredFile.class);

        when(storedFile.getStoredName())
                .thenReturn("uuid-expired.txt");

        when(storedFileRepository
                .findByExpiresAtLessThanEqual(now))
                .thenReturn(List.of(storedFile));

        doThrow(new IOException("Suppression impossible"))
                .when(fileStorageService)
                .delete("uuid-expired.txt");

        expiredFileCleanupService
                .cleanupExpiredFiles(now);

        verify(storedFileRepository, never())
                .delete(storedFile);
    }

    @Test
    void shouldContinueCleanupWhenOnePhysicalDeletionFails()
            throws IOException {

        LocalDateTime now =
                LocalDateTime.of(
                        2026,
                        9,
                        23,
                        15,
                        0
                );

        StoredFile firstFile = mock(StoredFile.class);
        StoredFile secondFile = mock(StoredFile.class);

        when(firstFile.getStoredName())
                .thenReturn("first-expired.txt");

        when(secondFile.getStoredName())
                .thenReturn("second-expired.txt");

        when(storedFileRepository
                .findByExpiresAtLessThanEqual(now))
                .thenReturn(
                        List.of(
                                firstFile,
                                secondFile
                        )
                );

        doThrow(new IOException("Suppression impossible"))
                .when(fileStorageService)
                .delete("first-expired.txt");

        expiredFileCleanupService
                .cleanupExpiredFiles(now);

        verify(fileStorageService)
                .delete("first-expired.txt");

        verify(fileStorageService)
                .delete("second-expired.txt");

        verify(storedFileRepository, never())
                .delete(firstFile);

        verify(storedFileRepository)
                .delete(secondFile);
    }
}