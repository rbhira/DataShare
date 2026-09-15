package com.datashare.file;

import com.datashare.file.dto.FileUploadResponse;
import com.datashare.user.User;
import com.datashare.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FileUploadServiceTest {

    @Mock
    private StoredFileRepository storedFileRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MultipartFile file;

    private FileUploadService fileUploadService;

    private User owner;

    @BeforeEach
    void setUp() {

        fileUploadService = new FileUploadService(
                storedFileRepository,
                fileStorageService,
                userRepository
        );

        owner = new User();
        owner.setId(1L);
        owner.setEmail("test@datashare.fr");
    }

    private void prepareValidFile() throws Exception {

        when(file.isEmpty()).thenReturn(false);
        when(file.getSize()).thenReturn(21L);
        when(file.getOriginalFilename())
                .thenReturn("test-upload.txt");
        when(file.getContentType())
                .thenReturn("text/plain");

        when(userRepository.findByEmail("test@datashare.fr"))
                .thenReturn(Optional.of(owner));

        when(fileStorageService.store(file))
                .thenReturn(
                        new StoredFileData(
                                "test-upload.txt",
                                "stored-test-upload.txt",
                                "/uploads/stored-test-upload.txt"
                        )
                );

        when(storedFileRepository.save(any(StoredFile.class)))
                .thenAnswer(invocation -> {

                    StoredFile storedFile =
                            invocation.getArgument(0);

                    storedFile.setId(1L);

                    return storedFile;
                });
    }

    @Test
    void shouldUploadFileWithDefaultExpiration()
            throws Exception {

        prepareValidFile();

        LocalDateTime before = LocalDateTime.now();

        FileUploadResponse response =
                fileUploadService.upload(
                        file,
                        "test@datashare.fr",
                        null
                );

        LocalDateTime after = LocalDateTime.now();

        assertEquals(1L, response.getId());
        assertEquals(
                "test-upload.txt",
                response.getOriginalName()
        );
        assertEquals(21L, response.getSize());

        assertFalse(
                response.getExpiresAt()
                        .isBefore(before.plusDays(7))
        );

        assertFalse(
                response.getExpiresAt()
                        .isAfter(after.plusDays(7))
        );
    }

    @Test
    void shouldUseRequestedExpiration()
            throws Exception {

        prepareValidFile();

        LocalDateTime requestedExpiration =
                LocalDateTime.now().plusDays(3);

        FileUploadResponse response =
                fileUploadService.upload(
                        file,
                        "test@datashare.fr",
                        requestedExpiration
                );

        assertEquals(
                requestedExpiration,
                response.getExpiresAt()
        );
    }

    @Test
    void shouldAssociateFileWithOwner()
            throws Exception {

        prepareValidFile();

        fileUploadService.upload(
                file,
                "test@datashare.fr",
                null
        );

        ArgumentCaptor<StoredFile> captor =
                ArgumentCaptor.forClass(StoredFile.class);

        verify(storedFileRepository).save(captor.capture());

        assertEquals(
                "test@datashare.fr",
                captor.getValue().getOwner().getEmail()
        );
    }

    @Test
    void shouldRejectEmptyFile() {

        when(file.isEmpty()).thenReturn(true);

        assertThrows(
                EmptyFileException.class,
                () -> fileUploadService.upload(
                        file,
                        "test@datashare.fr",
                        null
                )
        );

        verifyNoInteractions(fileStorageService);
    }

    @Test
    void shouldRejectFileLargerThanOneGb() {

        when(file.isEmpty()).thenReturn(false);

        when(file.getSize())
                .thenReturn(1_000_000_001L);

        assertThrows(
                FileTooLargeException.class,
                () -> fileUploadService.upload(
                        file,
                        "test@datashare.fr",
                        null
                )
        );

        verifyNoInteractions(fileStorageService);
    }

    @Test
    void shouldRejectForbiddenExtension() {

        when(file.isEmpty()).thenReturn(false);
        when(file.getSize()).thenReturn(100L);

        when(file.getOriginalFilename())
                .thenReturn("virus.EXE");

        assertThrows(
                InvalidFileTypeException.class,
                () -> fileUploadService.upload(
                        file,
                        "test@datashare.fr",
                        null
                )
        );

        verifyNoInteractions(fileStorageService);
    }

    @Test
    void shouldRejectPastExpiration()
            throws Exception {

        when(file.isEmpty()).thenReturn(false);
        when(file.getSize()).thenReturn(21L);
        when(file.getOriginalFilename())
                .thenReturn("test-upload.txt");

        when(userRepository.findByEmail("test@datashare.fr"))
                .thenReturn(Optional.of(owner));

        LocalDateTime past =
                LocalDateTime.now().minusDays(1);

        assertThrows(
                InvalidExpirationException.class,
                () -> fileUploadService.upload(
                        file,
                        "test@datashare.fr",
                        past
                )
        );

        verify(fileStorageService, never())
                .store(any());
    }

    @Test
    void shouldRejectExpirationBeyondSevenDays()
            throws Exception {

        when(file.isEmpty()).thenReturn(false);
        when(file.getSize()).thenReturn(21L);
        when(file.getOriginalFilename())
                .thenReturn("test-upload.txt");

        when(userRepository.findByEmail("test@datashare.fr"))
                .thenReturn(Optional.of(owner));

        LocalDateTime tooLate =
                LocalDateTime.now().plusDays(8);

        assertThrows(
                InvalidExpirationException.class,
                () -> fileUploadService.upload(
                        file,
                        "test@datashare.fr",
                        tooLate
                )
        );

        verify(fileStorageService, never())
                .store(any());
    }
}
