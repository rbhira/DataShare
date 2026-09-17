package com.datashare.file;

public class DownloadNotFoundException extends RuntimeException {

    public DownloadNotFoundException(String message) {
        super(message);
    }
}