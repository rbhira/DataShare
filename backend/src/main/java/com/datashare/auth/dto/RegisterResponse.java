package com.datashare.auth.dto;

import java.time.LocalDateTime;

public class RegisterResponse {

    private Long id;
    private String email;
    private LocalDateTime createdAt;

    public RegisterResponse(Long id, String email, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
