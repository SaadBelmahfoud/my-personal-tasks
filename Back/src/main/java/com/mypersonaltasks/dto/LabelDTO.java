package com.mypersonaltasks.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

public class LabelDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotBlank(message = "Label name is required")
        @Size(max = 50, message = "Label name cannot exceed 50 characters")
        private String name;

        @Size(max = 7, message = "Color must be a valid hex color")
        private String color;

        @Size(max = 200, message = "Description cannot exceed 200 characters")
        private String description;

        @NotBlank(message = "Project ID is required")
        private UUID projectId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        @Size(max = 50, message = "Label name cannot exceed 50 characters")
        private String name;

        @Size(max = 7, message = "Color must be a valid hex color")
        private String color;

        @Size(max = 200, message = "Description cannot exceed 200 characters")
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private UUID id;
        private String name;
        private String color;
        private String description;
    }
}
