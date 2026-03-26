package com.mypersonaltasks.controller;

import com.mypersonaltasks.dto.ApiResponse;
import com.mypersonaltasks.dto.UserDTO;
import com.mypersonaltasks.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "User management APIs")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns the currently authenticated user's profile")
    public ResponseEntity<ApiResponse<UserDTO.Response>> getCurrentUser() {
        UserDTO.Response response = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    @Operation(summary = "Update profile", description = "Updates the current user's profile")
    public ResponseEntity<ApiResponse<UserDTO.Response>> updateProfile(
            @Valid @RequestBody UserDTO.UpdateRequest request) {
        UserDTO.Response response = userService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Profile updated successfully"));
    }

    @PutMapping("/me/password")
    @Operation(summary = "Change password", description = "Changes the current user's password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody UserDTO.ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
    }

    @GetMapping("/me/stats")
    @Operation(summary = "Get user statistics", description = "Returns statistics for the current user")
    public ResponseEntity<ApiResponse<UserDTO.UserStats>> getUserStats() {
        UserDTO.UserStats stats = userService.getUserStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
