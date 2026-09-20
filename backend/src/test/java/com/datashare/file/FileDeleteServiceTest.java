package com.datashare.file;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileDeleteServiceTest {

    @Mock
    private StoredFileRepository storedFileRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private FileDeleteService fileDeleteService;

    @Test
    void shouldDeletePhysicalFileBeforeDatabaseEntry()
            throws IOException {

        Long fileId = 13L;
        String email = "claire@example.com";

        StoredFile storedFile = mock(StoredFile.class);

        when(storedFile.getStoredName())
                .thenReturn("uuid-photo.jpg");

        when(storedFileRepository.findByIdAndOwnerEmail(
                fileId,
                email
        )).thenReturn(Optional.of(storedFile));

        fileDeleteService.deleteFile(
                fileId,
                email
        );

        InOrder inOrder = inOrder(
                fileStorageService,
                storedFileRepository
        );

        inOrder.verify(fileStorageService)
                .delete("uuid-photo.jpg");

        inOrder.verify(storedFileRepository)
                .delete(storedFile);
    }

    @Test
    void shouldReturnNotFoundWhenFileIsNotOwnedByUser() {

        Long fileId = 13L;
        String email = "claire@example.com";

        when(storedFileRepository.findByIdAndOwnerEmail(
                fileId,
                email
        )).thenReturn(Optional.empty());

        assertThrows(
                FileDeleteNotFoundException.class,
                () -> fileDeleteService.deleteFile(
                        fileId,
                        email
                )
        );

        verifyNoInteractions(fileStorageService);

        verify(storedFileRepository, never())
                .delete(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void shouldNotDeleteDatabaseEntryWhenPhysicalDeletionFails()
            throws IOException {

        Long fileId = 13L;
        String email = "claire@example.com";

        StoredFile storedFile = mock(StoredFile.class);

        when(storedFile.getStoredName())
                .thenReturn("uuid-photo.jpg");

        when(storedFileRepository.findByIdAndOwnerEmail(
                fileId,
                email
        )).thenReturn(Optional.of(storedFile));

        doThrow(new IOException("Suppression impossible"))
                .when(fileStorageService)
                .delete("uuid-photo.jpg");

        assertThrows(
                FileDeletionException.class,
                () -> fileDeleteService.deleteFile(
                        fileId,
                        email
                )
        );

        verify(storedFileRepository, never())
                .delete(storedFile);
    }
}
