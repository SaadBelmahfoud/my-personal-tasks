package com.mypersonaltasks.dto;

import com.mypersonaltasks.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegisterRequest {
        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        private String username;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
        private String password;

        private String firstName;
        private String lastName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginRequest {
        @NotBlank(message = "Username or email is required")
        private String usernameOrEmail;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        private String username;

        @Email(message = "Invalid email format")
        private String email;

        @Size(max = 50, message = "First name cannot exceed 50 characters")
        private String firstName;

        @Size(max = 50, message = "Last name cannot exceed 50 characters")
        private String lastName;

        @Size(max = 500, message = "Bio cannot exceed 500 characters")
        private String bio;

        @Size(max = 500, message = "Avatar URL cannot exceed 500 characters")
        private String avatarUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChangePasswordRequest {
        @NotBlank(message = "Current password is required")
        private String currentPassword;

        @NotBlank(message = "New password is required")
        @Size(min = 6, max = 100, message = "New password must be between 6 and 100 characters")
        private String newPassword;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private UUID id;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String fullName;
        private String bio;
        private String avatarUrl;
        private UserRole role;
        private Boolean isEnabled;
        private Boolean isVerified;
        private LocalDateTime createdAt;
        private LocalDateTime lastLoginAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Summary {
        private UUID id;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String avatarUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType;
        private Long expiresIn;
        private Response user;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserStats {
        private Long projectsCount;
        private Long tasksCount;
        private Long completedCount;
    }
}
