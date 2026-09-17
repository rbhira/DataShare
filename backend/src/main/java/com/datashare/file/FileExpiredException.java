package com.datashare.file;

public class FileExpiredException extends RuntimeException {

    public FileExpiredException(String message) {
        super(message);
    }
}
