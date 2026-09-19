package com.keystone.controller;

import com.keystone.dto.AuthResponse;
import com.keystone.dto.LoginRequest;
import com.keystone.dto.RegisterUserRequest;
import com.keystone.dto.UserResponseDto;
import com.keystone.security.UserPrincipal;
import com.keystone.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication, JWT token generation, and account management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and receive JWT", description = "Validates credentials and returns JWT bearer token along with user profile and role")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Register new staff/customer user (Manager only)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<UserResponseDto> registerUser(@Valid @RequestBody RegisterUserRequest request) {
        UserResponseDto response = authService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current authenticated user profile", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<UserResponseDto> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        UserResponseDto response = authService.getCurrentUserDto(principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/technicians")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @Operation(summary = "List all active technicians for dispatch assignment", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserResponseDto>> getTechnicians() {
        return ResponseEntity.ok(authService.getTechnicians());
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "List all active system users (Manager only)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllActiveUsers());
    }
}
