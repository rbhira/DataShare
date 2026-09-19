package com.datashare.file;

public class FileDeleteNotFoundException
        extends RuntimeException {

    public FileDeleteNotFoundException(String message) {
        super(message);
    }
}