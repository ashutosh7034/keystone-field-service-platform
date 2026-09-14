package com.keystone.service;

import com.keystone.domain.Role;
import com.keystone.domain.User;
import com.keystone.dto.AuthResponse;
import com.keystone.dto.LoginRequest;
import com.keystone.dto.RegisterUserRequest;
import com.keystone.dto.UserResponseDto;
import com.keystone.exception.BadRequestException;
import com.keystone.repository.UserRepository;
import com.keystone.security.JwtTokenProvider;
import com.keystone.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        User manager = User.builder()
                .email("manager@test.com")
                .passwordHash(passwordEncoder.encode("secretPassword123"))
                .fullName("Test Manager")
                .role(Role.ROLE_MANAGER)
                .active(true)
                .build();
        userRepository.save(manager);
    }

    @Test
    @DisplayName("Should successfully authenticate user and generate valid JWT token")
    void shouldAuthenticateUserSuccessfully() {
        LoginRequest request = LoginRequest.builder()
                .email("manager@test.com")
                .password("secretPassword123")
                .build();

        AuthResponse response = authService.authenticateUser(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals("manager@test.com", response.getEmail());
        assertEquals(Role.ROLE_MANAGER, response.getRole());
        assertTrue(jwtTokenProvider.validateToken(response.getToken()));
        assertEquals("manager@test.com", jwtTokenProvider.getUsernameFromJWT(response.getToken()));
    }

    @Test
    @DisplayName("Should reject authentication with invalid password")
    void shouldRejectInvalidPassword() {
        LoginRequest request = LoginRequest.builder()
                .email("manager@test.com")
                .password("wrongPassword")
                .build();

        assertThrows(BadCredentialsException.class, () -> authService.authenticateUser(request));
    }

    @Test
    @DisplayName("Should register new user and encode password with BCrypt")
    void shouldRegisterNewUser() {
        RegisterUserRequest request = RegisterUserRequest.builder()
                .email("tech@test.com")
                .password("techPassword123")
                .fullName("Alex Tech")
                .role(Role.ROLE_TECHNICIAN)
                .build();

        UserResponseDto dto = authService.registerUser(request);

        assertNotNull(dto);
        assertEquals("tech@test.com", dto.getEmail());
        assertEquals(Role.ROLE_TECHNICIAN, dto.getRole());

        User user = userRepository.findByEmail("tech@test.com").orElseThrow();
        assertNotEquals("techPassword123", user.getPasswordHash());
        assertTrue(passwordEncoder.matches("techPassword123", user.getPasswordHash()));
    }

    @Test
    @DisplayName("Should reject registration with duplicate email")
    void shouldRejectDuplicateEmailRegistration() {
        RegisterUserRequest request = RegisterUserRequest.builder()
                .email("manager@test.com")
                .password("newPassword123")
                .fullName("Another Manager")
                .role(Role.ROLE_MANAGER)
                .build();

        assertThrows(BadRequestException.class, () -> authService.registerUser(request));
    }
}
