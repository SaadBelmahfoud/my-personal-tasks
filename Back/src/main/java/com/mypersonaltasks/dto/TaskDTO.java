package com.mypersonaltasks.dto;

import com.mypersonaltasks.enums.TaskPriority;
import com.mypersonaltasks.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class TaskDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotBlank(message = "Task title is required")
        @Size(max = 200, message = "Task title cannot exceed 200 characters")
        private String title;

        @Size(max = 5000, message = "Description cannot exceed 5000 characters")
        private String description;

        @Builder.Default
        private TaskStatus status = TaskStatus.TODO;

        @Builder.Default
        private TaskPriority priority = TaskPriority.MEDIUM;

        private LocalDate dueDate;
        private LocalDate startDate;
        private Integer estimatedHours;
        private Integer position;

        @NotNull(message = "Project ID is required")
        private UUID projectId;

        private UUID assigneeId;

        private List<UUID> labelIds = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        @Size(max = 200, message = "Task title cannot exceed 200 characters")
        private String title;

        @Size(max = 5000, message = "Description cannot exceed 5000 characters")
        private String description;

        private TaskStatus status;
        private TaskPriority priority;
        private LocalDate dueDate;
        private LocalDate startDate;
        private Integer estimatedHours;
        private Integer actualHours;
        private UUID assigneeId;

        private List<UUID> labelIds;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private UUID id;
        private String title;
        private String description;
        private TaskStatus status;
        private TaskPriority priority;
        private LocalDate dueDate;
        private LocalDate startDate;
        private Integer estimatedHours;
        private Integer actualHours;
        private Integer position;
        private Boolean isCompleted;
        private LocalDateTime completedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private UserDTO.Summary assignee;
        private ProjectDTO.Summary project;
        private List<LabelDTO.Response> labels = new ArrayList<>();
        private List<ChecklistItemDTO.Response> checklistItems = new ArrayList<>();
        private Integer commentCount;
        private Integer attachmentCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Summary {
        private UUID id;
        private String title;
        private TaskStatus status;
        private TaskPriority priority;
        private LocalDate dueDate;
        private Boolean isCompleted;
        private String projectName;
        private String projectColor;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ListResponse {
        private List<Response> tasks;
        private Long totalCount;
        private Long todoCount;
        private Long inProgressCount;
        private Long completedCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatusUpdateRequest {
        @NotNull(message = "Status is required")
        private TaskStatus status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReorderRequest {
        @NotNull(message = "Task ID is required")
        private UUID taskId;

        @NotNull(message = "New position is required")
        private Integer newPosition;
    }
}
