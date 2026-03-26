package com.mypersonaltasks.controller;

import com.mypersonaltasks.dto.ApiResponse;
import com.mypersonaltasks.dto.UserDTO;
import com.mypersonaltasks.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account and returns authentication tokens")
    public ResponseEntity<ApiResponse<UserDTO.AuthResponse>> register(
            @Valid @RequestBody UserDTO.RegisterRequest request) {
        UserDTO.AuthResponse response = userService.register(request);
        return ResponseEntity.ok(ApiResponse.success(response, "User registered successfully"));
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticates a user and returns access tokens")
    public ResponseEntity<ApiResponse<UserDTO.AuthResponse>> login(
            @Valid @RequestBody UserDTO.LoginRequest request) {
        UserDTO.AuthResponse response = userService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Refreshes the access token using a valid refresh token")
    public ResponseEntity<ApiResponse<UserDTO.AuthResponse>> refreshToken(
            @RequestBody RefreshTokenRequest request) {
        UserDTO.AuthResponse response = userService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Logs out the user by revoking the refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody(required = false) RefreshTokenRequest request) {
        String refreshToken = request != null ? request.getRefreshToken() : null;
        userService.logout(refreshToken);
        return ResponseEntity.ok(ApiResponse.success(null, "Logout successful"));
    }

    public static class RefreshTokenRequest {
        private String refreshToken;

        public String getRefreshToken() {
            return refreshToken;
        }

        public void setRefreshToken(String refreshToken) {
            this.refreshToken = refreshToken;
        }
    }
}
