package com.datashare.file;

import com.datashare.config.StorageProperties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class FileStorageServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void shouldStoreFileOnDisk()
            throws Exception {

        StorageProperties properties =
                new StorageProperties(
                        tempDir.toString()
                );

        FileStorageService service =
                new FileStorageService(properties);

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "test.txt",
                        "text/plain",
                        "Bonjour DataShare".getBytes()
                );

        StoredFileData data =
                service.store(file);

        Path storedPath =
                Path.of(data.getStoragePath());

        assertTrue(Files.exists(storedPath));

        assertEquals(
                "Bonjour DataShare",
                Files.readString(storedPath)
        );

        assertEquals(
                "test.txt",
                data.getOriginalName()
        );

        assertTrue(
                data.getStoredName()
                        .endsWith("_test.txt")
        );
    }

    @Test
    void shouldRejectBlankFilename()
            throws Exception {

        StorageProperties properties =
                new StorageProperties(
                        tempDir.toString()
                );

        FileStorageService service =
                new FileStorageService(properties);

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "",
                        "text/plain",
                        "test".getBytes()
                );

        assertThrows(
                IllegalArgumentException.class,
                () -> service.store(file)
        );
    }
    @Test
    void shouldDeleteStoredFile()
            throws Exception {

        StorageProperties properties =
                new StorageProperties(
                        tempDir.toString()
                );

        FileStorageService service =
                new FileStorageService(properties);

        Path storedFile =
                tempDir.resolve("uuid-test.txt");

        Files.writeString(
                storedFile,
                "Bonjour DataShare"
        );

        assertTrue(Files.exists(storedFile));

        service.delete("uuid-test.txt");

        assertFalse(Files.exists(storedFile));
    }

    @Test
    void shouldRejectDeletionOutsideUploadDirectory()
            throws Exception {

        StorageProperties properties =
                new StorageProperties(
                        tempDir.toString()
                );

        FileStorageService service =
                new FileStorageService(properties);

        assertThrows(
                IllegalArgumentException.class,
                () -> service.delete("../outside.txt")
        );
    }
}