package com.datashare.file;

public class FileDeletionException
        extends RuntimeException {

    public FileDeletionException(
            String message,
            Throwable cause
    ) {
        super(message, cause);
    }
}
