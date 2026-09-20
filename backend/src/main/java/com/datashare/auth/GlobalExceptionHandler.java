package com.datashare.auth;

import com.datashare.file.EmptyFileException;
import com.datashare.file.FileTooLargeException;
import com.datashare.file.InvalidFileTypeException;
import com.datashare.file.InvalidExpirationException;
import com.datashare.file.DownloadNotFoundException;
import com.datashare.file.FileExpiredException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.datashare.file.FileDeleteNotFoundException;
import com.datashare.file.FileDeletionException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleEmailAlreadyExists(
            EmailAlreadyExistsException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleInvalidCredentials(
            InvalidCredentialsException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(
            MethodArgumentNotValidException exception
    ) {
        String message = exception
                .getBindingResult()
                .getFieldErrors()
                .get(0)
                .getDefaultMessage();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", message));
    }

    @ExceptionHandler(EmptyFileException.class)
    public ResponseEntity<Map<String, String>> handleEmptyFile(
            EmptyFileException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(FileTooLargeException.class)
    public ResponseEntity<Map<String, String>> handleFileTooLarge(
            FileTooLargeException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(InvalidFileTypeException.class)
    public ResponseEntity<Map<String, String>> handleInvalidFileType(
            InvalidFileTypeException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(InvalidExpirationException.class)
    public ResponseEntity<Map<String, String>> handleInvalidExpiration(
            InvalidExpirationException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", exception.getMessage()));
    }
    @ExceptionHandler(DownloadNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleDownloadNotFound(
            DownloadNotFoundException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(FileExpiredException.class)
    public ResponseEntity<Map<String, String>> handleFileExpired(
            FileExpiredException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.GONE)
                .body(Map.of("message", exception.getMessage()));
    }
    @ExceptionHandler(FileDeleteNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleFileDeleteNotFound(
            FileDeleteNotFoundException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(FileDeletionException.class)
    public ResponseEntity<Map<String, String>> handleFileDeletion(
            FileDeletionException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", exception.getMessage()));
    }
}
