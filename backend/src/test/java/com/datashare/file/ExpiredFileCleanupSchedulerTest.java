package com.datashare.file;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ExpiredFileCleanupSchedulerTest {

    @Mock
    private ExpiredFileCleanupService expiredFileCleanupService;

    @InjectMocks
    private ExpiredFileCleanupScheduler expiredFileCleanupScheduler;

    @Test
    void shouldLaunchExpiredFileCleanup() {

        expiredFileCleanupScheduler
                .cleanupExpiredFilesDaily();

        verify(expiredFileCleanupService)
                .cleanupExpiredFiles(
                        any(LocalDateTime.class)
                );
    }
}
