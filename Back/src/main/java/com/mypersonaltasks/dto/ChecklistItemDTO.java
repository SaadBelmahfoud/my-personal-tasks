package com.mypersonaltasks.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

public class ChecklistItemDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotBlank(message = "Content is required")
        @Size(max = 500, message = "Content cannot exceed 500 characters")
        private String content;

        private Integer position;

        @NotBlank(message = "Task ID is required")
        private UUID taskId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        @Size(max = 500, message = "Content cannot exceed 500 characters")
        private String content;

        private Boolean isCompleted;
        private Integer position;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private UUID id;
        private String content;
        private Boolean isCompleted;
        private Integer position;
        private LocalDateTime createdAt;
        private LocalDateTime completedAt;
    }
}
