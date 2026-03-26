package com.mypersonaltasks.controller;

import com.mypersonaltasks.dto.ApiResponse;
import com.mypersonaltasks.dto.ProjectDTO;
import com.mypersonaltasks.dto.ProjectMemberDTO;
import com.mypersonaltasks.enums.ProjectRole;
import com.mypersonaltasks.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
@Tag(name = "Project", description = "Project management APIs")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @Operation(summary = "Create project", description = "Creates a new project")
    public ResponseEntity<ApiResponse<ProjectDTO.Response>> createProject(
            @Valid @RequestBody ProjectDTO.CreateRequest request) {
        ProjectDTO.Response response = projectService.createProject(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Project created successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all projects", description = "Returns all projects for the current user")
    public ResponseEntity<ApiResponse<ProjectDTO.ListResponse>> getProjects() {
        ProjectDTO.ListResponse response = projectService.getProjects();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "Get project by ID", description = "Returns a project by its ID")
    public ResponseEntity<ApiResponse<ProjectDTO.Response>> getProjectById(
            @PathVariable UUID projectId) {
        ProjectDTO.Response response = projectService.getProjectById(projectId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{projectId}")
    @Operation(summary = "Update project", description = "Updates a project")
    public ResponseEntity<ApiResponse<ProjectDTO.Response>> updateProject(
            @PathVariable UUID projectId,
            @Valid @RequestBody ProjectDTO.UpdateRequest request) {
        ProjectDTO.Response response = projectService.updateProject(projectId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Project updated successfully"));
    }

    @DeleteMapping("/{projectId}")
    @Operation(summary = "Delete project", description = "Deletes a project")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable UUID projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.ok(ApiResponse.success(null, "Project deleted successfully"));
    }

    @PutMapping("/{projectId}/archive")
    @Operation(summary = "Archive project", description = "Archives a project")
    public ResponseEntity<ApiResponse<ProjectDTO.Response>> archiveProject(
            @PathVariable UUID projectId) {
        ProjectDTO.Response response = projectService.archiveProject(projectId);
        return ResponseEntity.ok(ApiResponse.success(response, "Project archived successfully"));
    }

    @PostMapping("/{projectId}/members")
    @Operation(summary = "Add member", description = "Adds a member to a project")
    public ResponseEntity<ApiResponse<ProjectMemberDTO.Response>> addMember(
            @PathVariable UUID projectId,
            @Valid @RequestBody ProjectMemberDTO.AddRequest request) {
        ProjectMemberDTO.Response response = projectService.addMember(projectId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Member added successfully"));
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    @Operation(summary = "Remove member", description = "Removes a member from a project")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable UUID projectId,
            @PathVariable UUID userId) {
        projectService.removeMember(projectId, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Member removed successfully"));
    }

    @PutMapping("/{projectId}/members/{userId}/role")
    @Operation(summary = "Update member role", description = "Updates a member's role in a project")
    public ResponseEntity<ApiResponse<ProjectMemberDTO.Response>> updateMemberRole(
            @PathVariable UUID projectId,
            @PathVariable UUID userId,
            @RequestParam ProjectRole role) {
        ProjectMemberDTO.Response response = projectService.updateMemberRole(projectId, userId, role);
        return ResponseEntity.ok(ApiResponse.success(response, "Member role updated successfully"));
    }
}
