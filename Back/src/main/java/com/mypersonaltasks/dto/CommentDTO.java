package com.mypersonaltasks.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

public class CommentDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotBlank(message = "Comment content is required")
        @Size(max = 5000, message = "Comment cannot exceed 5000 characters")
        private String content;

        @NotBlank(message = "Task ID is required")
        private UUID taskId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        @Size(max = 5000, message = "Comment cannot exceed 5000 characters")
        private String content;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private UUID id;
        private String content;
        private UserDTO.Summary user;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
