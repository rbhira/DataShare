package com.datashare.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        String secret =
                "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";

        jwtService = new JwtService(secret, 3600000);
    }

    @Test
    void shouldGenerateValidToken() {

        String token = jwtService.generateToken("test@datashare.fr");

        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token));
    }

    @Test
    void shouldExtractEmailFromToken() {

        String token = jwtService.generateToken("test@datashare.fr");

        String email = jwtService.extractEmail(token);

        assertEquals("test@datashare.fr", email);
    }

    @Test
    void shouldRejectInvalidToken() {

        assertFalse(
                jwtService.isTokenValid("faux.jwt.token")
        );
    }
}