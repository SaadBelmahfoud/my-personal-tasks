package com.mypersonaltasks.dto;

import com.mypersonaltasks.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
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

public class ProjectDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotBlank(message = "Project name is required")
        @Size(max = 100, message = "Project name cannot exceed 100 characters")
        private String name;

        @Size(max = 2000, message = "Description cannot exceed 2000 characters")
        private String description;

        @Size(max = 7, message = "Color must be a valid hex color")
        private String color;

        @Size(max = 50, message = "Icon name cannot exceed 50 characters")
        private String icon;

        @Builder.Default
        private ProjectStatus status = ProjectStatus.PLANNING;

        @Builder.Default
        private Boolean isPublic = false;

        private LocalDate startDate;
        private LocalDate endDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        @Size(max = 100, message = "Project name cannot exceed 100 characters")
        private String name;

        @Size(max = 2000, message = "Description cannot exceed 2000 characters")
        private String description;

        @Size(max = 7, message = "Color must be a valid hex color")
        private String color;

        @Size(max = 50, message = "Icon name cannot exceed 50 characters")
        private String icon;

        private ProjectStatus status;

        private Boolean isPublic;

        private LocalDate startDate;
        private LocalDate endDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private UUID id;
        private String name;
        private String description;
        private String color;
        private String icon;
        private ProjectStatus status;
        private Boolean isPublic;
        private LocalDate startDate;
        private LocalDate endDate;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private UserDTO.Summary owner;
        private List<ProjectMemberDTO.Response> members = new ArrayList<>();
        private List<LabelDTO.Response> labels = new ArrayList<>();
        private Integer taskCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Summary {
        private UUID id;
        private String name;
        private String color;
        private String icon;
        private ProjectStatus status;
        private Integer taskCount;
        private Integer completedTaskCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ListResponse {
        private List<Summary> projects;
        private Long totalCount;
        private Integer completedCount;
        private Integer activeCount;
    }
}
