package com.datashare.auth;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        filter = new JwtAuthenticationFilter(jwtService);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldAuthenticateUserWithValidToken()
            throws Exception {

        MockHttpServletRequest request =
                new MockHttpServletRequest();

        request.addHeader(
                "Authorization",
                "Bearer valid-token"
        );

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        MockFilterChain chain = new MockFilterChain();

        when(jwtService.isTokenValid("valid-token"))
                .thenReturn(true);

        when(jwtService.extractEmail("valid-token"))
                .thenReturn("test@datashare.fr");

        filter.doFilterInternal(
                request,
                response,
                chain
        );

        assertNotNull(
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
        );

        assertTrue(
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .isAuthenticated()
        );

        assertEquals(
                "test@datashare.fr",
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName()
        );
    }

    @Test
    void shouldNotAuthenticateWithInvalidToken()
            throws Exception {

        MockHttpServletRequest request =
                new MockHttpServletRequest();

        request.addHeader(
                "Authorization",
                "Bearer invalid-token"
        );

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        MockFilterChain chain = new MockFilterChain();

        when(jwtService.isTokenValid("invalid-token"))
                .thenReturn(false);

        filter.doFilterInternal(
                request,
                response,
                chain
        );

        assertNull(
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
        );

        verify(jwtService, never())
                .extractEmail(anyString());
    }

    @Test
    void shouldContinueWithoutAuthenticationHeader()
            throws Exception {

        MockHttpServletRequest request =
                new MockHttpServletRequest();

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        MockFilterChain chain = new MockFilterChain();

        filter.doFilterInternal(
                request,
                response,
                chain
        );

        assertNull(
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
        );

        verifyNoInteractions(jwtService);
    }
}
