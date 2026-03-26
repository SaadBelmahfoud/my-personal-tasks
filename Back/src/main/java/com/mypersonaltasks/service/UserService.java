package com.mypersonaltasks.service;

import com.mypersonaltasks.dto.UserDTO;
import com.mypersonaltasks.entity.RefreshToken;
import com.mypersonaltasks.entity.User;
import com.mypersonaltasks.enums.UserRole;
import com.mypersonaltasks.exception.BadRequestException;
import com.mypersonaltasks.exception.ResourceAlreadyExistsException;
import com.mypersonaltasks.exception.ResourceNotFoundException;
import com.mypersonaltasks.exception.UnauthorizedException;
import com.mypersonaltasks.repository.RefreshTokenRepository;
import com.mypersonaltasks.repository.TaskRepository;
import com.mypersonaltasks.repository.UserRepository;
import com.mypersonaltasks.repository.ProjectRepository;
import com.mypersonaltasks.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public UserDTO.AuthResponse register(UserDTO.RegisterRequest request) {
        log.info("Registering new user with username: {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            throw ResourceAlreadyExistsException.create("User", "username", request.getUsername());
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw ResourceAlreadyExistsException.create("User", "email", request.getEmail());
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(UserRole.USER)
                .isEnabled(true)
                .isVerified(false)
                .build();

        user = userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername());

        saveRefreshToken(user, refreshToken);

        return UserDTO.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .user(mapToUserResponse(user))
                .build();
    }

    public UserDTO.AuthResponse login(UserDTO.LoginRequest request) {
        log.info("Login attempt for: {}", request.getUsernameOrEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmailOrUsername(request.getUsernameOrEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername());

        saveRefreshToken(user, refreshToken);

        return UserDTO.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .user(mapToUserResponse(user))
                .build();
    }

    public UserDTO.AuthResponse refreshToken(String refreshToken) {
        log.info("Refreshing token");

        if (!jwtService.validateToken(refreshToken) || !jwtService.isRefreshToken(refreshToken)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new UnauthorizedException("Refresh token not found"));

        if (!storedToken.isValid()) {
            throw new UnauthorizedException("Refresh token has been revoked or expired");
        }

        storedToken.setIsRevoked(true);
        refreshTokenRepository.save(storedToken);

        User user = storedToken.getUser();
        String newAccessToken = jwtService.generateAccessToken(user.getUsername());
        String newRefreshToken = jwtService.generateRefreshToken(user.getUsername());

        saveRefreshToken(user, newRefreshToken);

        return UserDTO.AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .user(mapToUserResponse(user))
                .build();
    }

    public void logout(String refreshToken) {
        log.info("Logging out user");

        if (refreshToken != null) {
            refreshTokenRepository.revokeToken(refreshToken);
        }
    }

    @Transactional(readOnly = true)
    public UserDTO.Response getCurrentUser() {
        User user = getAuthenticatedUser();
        return mapToUserResponse(user);
    }

    @Transactional(readOnly = true)
    public UserDTO.UserStats getUserStats() {
        User user = getAuthenticatedUser();
        
        Long projectsCount = projectRepository.countByMemberId(user.getId());
        Long tasksCount = taskRepository.countByAssigneeId(user.getId());
        Long completedCount = taskRepository.countCompletedByAssigneeId(user.getId());
        
        return UserDTO.UserStats.builder()
                .projectsCount(projectsCount != null ? projectsCount : 0L)
                .tasksCount(tasksCount != null ? tasksCount : 0L)
                .completedCount(completedCount != null ? completedCount : 0L)
                .build();
    }

    public UserDTO.Response updateProfile(UserDTO.UpdateRequest request) {
        User user = getAuthenticatedUser();

        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsernameAndIdNot(request.getUsername(), user.getId())) {
                throw ResourceAlreadyExistsException.create("User", "username", request.getUsername());
            }
            user.setUsername(request.getUsername());
        }

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmailAndIdNot(request.getEmail(), user.getId())) {
                throw ResourceAlreadyExistsException.create("User", "email", request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        user = userRepository.save(user);
        return mapToUserResponse(user);
    }

    public void changePassword(UserDTO.ChangePasswordRequest request) {
        User user = getAuthenticatedUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        refreshTokenRepository.revokeAllByUserId(user.getId());
    }

    private void saveRefreshToken(User user, String token) {
        LocalDateTime expiresAt = LocalDateTime.now()
                .plusNanos(jwtService.getRefreshTokenExpiration() * 1_000_000);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .user(user)
                .expiresAt(expiresAt)
                .build();

        refreshTokenRepository.save(refreshToken);
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }

        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    private UserDTO.Response mapToUserResponse(User user) {
        String fullName = null;
        if (user.getFirstName() != null || user.getLastName() != null) {
            fullName = String.join(" ", 
                user.getFirstName() != null ? user.getFirstName() : "",
                user.getLastName() != null ? user.getLastName() : ""
            ).trim();
        }
        if (fullName == null || fullName.isEmpty()) {
            fullName = user.getUsername();
        }
        
        return UserDTO.Response.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(fullName)
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .isEnabled(user.getIsEnabled())
                .isVerified(user.getIsVerified())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    @Transactional(readOnly = true)
    public UserDTO.Summary mapToUserSummary(User user) {
        return UserDTO.Summary.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    @Transactional(readOnly = true)
    public User getUserEntityById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }
}
