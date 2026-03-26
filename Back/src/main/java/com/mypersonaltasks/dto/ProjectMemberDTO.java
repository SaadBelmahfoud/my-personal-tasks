package com.mypersonaltasks.dto;

import com.mypersonaltasks.enums.ProjectRole;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

public class ProjectMemberDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddRequest {
        @NotNull(message = "User ID is required")
        private UUID userId;

        @Builder.Default
        private ProjectRole role = ProjectRole.MEMBER;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private ProjectRole role;
        private Boolean isFavorite;
        private Boolean notificationEnabled;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private UUID id;
        private UserDTO.Summary user;
        private ProjectRole role;
        private Boolean isFavorite;
        private Boolean notificationEnabled;
        private LocalDateTime joinedAt;
    }
}
