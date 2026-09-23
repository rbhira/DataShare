package com.datashare.file;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ExpiredFileCleanupScheduler {

    private final ExpiredFileCleanupService expiredFileCleanupService;

    public ExpiredFileCleanupScheduler(
            ExpiredFileCleanupService expiredFileCleanupService
    ) {
        this.expiredFileCleanupService =
                expiredFileCleanupService;
    }

    @Scheduled(
            cron = "${datashare.cleanup.cron:0 0 3 * * *}"
    )
    public void cleanupExpiredFilesDaily() {
        expiredFileCleanupService.cleanupExpiredFiles(
                LocalDateTime.now()
        );
    }
}