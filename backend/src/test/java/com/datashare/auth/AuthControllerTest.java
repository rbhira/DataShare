package com.datashare.auth;

import com.datashare.auth.dto.LoginRequest;
import com.datashare.auth.dto.LoginResponse;
import com.datashare.auth.dto.RegisterRequest;
import com.datashare.auth.dto.RegisterResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {

        LocalValidatorFactoryBean validator =
                new LocalValidatorFactoryBean();

        validator.afterPropertiesSet();

        AuthController authController =
                new AuthController(authService);

        mockMvc = MockMvcBuilders
                .standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .build();
    }

    @Test
    void shouldRegisterUserAndReturn201() throws Exception {

        RegisterResponse response = new RegisterResponse(
                1L,
                "test@datashare.fr",
                LocalDateTime.of(2026, 9, 14, 18, 0)
        );

        when(authService.register(any(RegisterRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                          "email": "test@datashare.fr",
                                          "password": "MotDePasse123"
                                        }
                                        """)
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(
                        jsonPath("$.email")
                                .value("test@datashare.fr")
                );
    }

    @Test
    void shouldReturn409WhenEmailAlreadyExists()
            throws Exception {

        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(
                        new EmailAlreadyExistsException(
                                "Un compte existe déjà avec cette adresse email"
                        )
                );

        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                          "email": "test@datashare.fr",
                                          "password": "MotDePasse123"
                                        }
                                        """)
                )
                .andExpect(status().isConflict())
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "Un compte existe déjà avec cette adresse email"
                                )
                );
    }

    @Test
    void shouldReturn400WhenPasswordIsTooShort()
            throws Exception {

        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                          "email": "test@datashare.fr",
                                          "password": "1234"
                                        }
                                        """)
                )
                .andExpect(status().isBadRequest())
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "Le mot de passe doit contenir au moins 8 caractères"
                                )
                );
    }

    @Test
    void shouldReturn400WhenEmailIsInvalid()
            throws Exception {

        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                          "email": "pas-un-email",
                                          "password": "MotDePasse123"
                                        }
                                        """)
                )
                .andExpect(status().isBadRequest())
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "L'adresse email n'est pas valide"
                                )
                );
    }

    @Test
    void shouldLoginAndReturnToken() throws Exception {

        when(authService.login(any(LoginRequest.class)))
                .thenReturn(
                        new LoginResponse("fake-jwt-token")
                );

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                          "email": "test@datashare.fr",
                                          "password": "MotDePasse123"
                                        }
                                        """)
                )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.token")
                                .value("fake-jwt-token")
                );
    }

    @Test
    void shouldReturn401WhenCredentialsAreInvalid()
            throws Exception {

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(
                        new InvalidCredentialsException(
                                "Email ou mot de passe incorrect"
                        )
                );

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                          "email": "test@datashare.fr",
                                          "password": "MauvaisMotDePasse"
                                        }
                                        """)
                )
                .andExpect(status().isUnauthorized())
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "Email ou mot de passe incorrect"
                                )
                );
    }
}