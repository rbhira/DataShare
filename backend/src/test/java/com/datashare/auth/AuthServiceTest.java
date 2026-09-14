package com.datashare.auth;

import com.datashare.auth.dto.LoginRequest;
import com.datashare.auth.dto.LoginResponse;
import com.datashare.auth.dto.RegisterRequest;
import com.datashare.auth.dto.RegisterResponse;
import com.datashare.user.User;
import com.datashare.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                passwordEncoder,
                jwtService
        );
    }

    @Test
    void shouldRegisterUser() {

        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@datashare.fr");
        request.setPassword("MotDePasse123");

        when(userRepository.existsByEmail("test@datashare.fr"))
                .thenReturn(false);

        when(passwordEncoder.encode("MotDePasse123"))
                .thenReturn("hashed-password");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setEmail("test@datashare.fr");
        savedUser.setPasswordHash("hashed-password");
        savedUser.setCreatedAt(LocalDateTime.now());

        when(userRepository.save(any(User.class)))
                .thenReturn(savedUser);

        RegisterResponse response = authService.register(request);

        assertEquals(1L, response.getId());
        assertEquals("test@datashare.fr", response.getEmail());

        verify(passwordEncoder).encode("MotDePasse123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldRejectDuplicateEmail() {

        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@datashare.fr");
        request.setPassword("MotDePasse123");

        when(userRepository.existsByEmail("test@datashare.fr"))
                .thenReturn(true);

        assertThrows(
                EmailAlreadyExistsException.class,
                () -> authService.register(request)
        );

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldLoginUserAndReturnToken() {

        LoginRequest request = new LoginRequest();
        request.setEmail("test@datashare.fr");
        request.setPassword("MotDePasse123");

        User user = new User();
        user.setEmail("test@datashare.fr");
        user.setPasswordHash("hashed-password");

        when(userRepository.findByEmail("test@datashare.fr"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "MotDePasse123",
                "hashed-password"
        )).thenReturn(true);

        when(jwtService.generateToken("test@datashare.fr"))
                .thenReturn("fake-jwt-token");

        LoginResponse response = authService.login(request);

        assertEquals("fake-jwt-token", response.getToken());

        verify(jwtService).generateToken("test@datashare.fr");
    }

    @Test
    void shouldRejectInvalidPassword() {

        LoginRequest request = new LoginRequest();
        request.setEmail("test@datashare.fr");
        request.setPassword("MauvaisMotDePasse");

        User user = new User();
        user.setEmail("test@datashare.fr");
        user.setPasswordHash("hashed-password");

        when(userRepository.findByEmail("test@datashare.fr"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "MauvaisMotDePasse",
                "hashed-password"
        )).thenReturn(false);

        assertThrows(
                InvalidCredentialsException.class,
                () -> authService.login(request)
        );

        verify(jwtService, never()).generateToken(anyString());
    }

    @Test
    void shouldRejectUnknownEmail() {

        LoginRequest request = new LoginRequest();
        request.setEmail("inconnu@datashare.fr");
        request.setPassword("MotDePasse123");

        when(userRepository.findByEmail("inconnu@datashare.fr"))
                .thenReturn(Optional.empty());

        assertThrows(
                InvalidCredentialsException.class,
                () -> authService.login(request)
        );

        verify(passwordEncoder, never())
                .matches(anyString(), anyString());

        verify(jwtService, never())
                .generateToken(anyString());
    }
}