package com.mypersonaltasks.controller;

import com.mypersonaltasks.dto.ApiResponse;
import com.mypersonaltasks.dto.TaskDTO;
import com.mypersonaltasks.enums.TaskStatus;
import com.mypersonaltasks.service.TaskService;
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
@RequestMapping("/tasks")
@RequiredArgsConstructor
@Tag(name = "Task", description = "Task management APIs")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @Operation(summary = "Create task", description = "Creates a new task")
    public ResponseEntity<ApiResponse<TaskDTO.Response>> createTask(
            @Valid @RequestBody TaskDTO.CreateRequest request) {
        TaskDTO.Response response = taskService.createTask(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Task created successfully"));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get tasks by project", description = "Returns all tasks for a specific project")
    public ResponseEntity<ApiResponse<TaskDTO.ListResponse>> getTasksByProject(
            @PathVariable UUID projectId) {
        TaskDTO.ListResponse response = taskService.getTasksByProject(projectId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{taskId}")
    @Operation(summary = "Get task by ID", description = "Returns a task by its ID")
    public ResponseEntity<ApiResponse<TaskDTO.Response>> getTaskById(
            @PathVariable UUID taskId) {
        TaskDTO.Response response = taskService.getTaskById(taskId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{taskId}")
    @Operation(summary = "Update task", description = "Updates a task")
    public ResponseEntity<ApiResponse<TaskDTO.Response>> updateTask(
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskDTO.UpdateRequest request) {
        TaskDTO.Response response = taskService.updateTask(taskId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Task updated successfully"));
    }

    @DeleteMapping("/{taskId}")
    @Operation(summary = "Delete task", description = "Deletes a task")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable UUID taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.ok(ApiResponse.success(null, "Task deleted successfully"));
    }

    @PatchMapping("/{taskId}/status")
    @Operation(summary = "Update task status", description = "Updates only the status of a task")
    public ResponseEntity<ApiResponse<TaskDTO.Response>> updateTaskStatus(
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskDTO.StatusUpdateRequest request) {
        TaskDTO.Response response = taskService.updateTaskStatus(taskId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Task status updated successfully"));
    }

    @PostMapping("/project/{projectId}/reorder")
    @Operation(summary = "Reorder tasks", description = "Reorders tasks within a project")
    public ResponseEntity<ApiResponse<Void>> reorderTasks(
            @PathVariable UUID projectId,
            @RequestBody List<TaskDTO.ReorderRequest> reorderRequests) {
        taskService.reorderTasks(projectId, reorderRequests);
        return ResponseEntity.ok(ApiResponse.success(null, "Tasks reordered successfully"));
    }

    @GetMapping("/my-tasks")
    @Operation(summary = "Get my tasks", description = "Returns all tasks assigned to the current user")
    public ResponseEntity<ApiResponse<TaskDTO.ListResponse>> getMyTasks() {
        TaskDTO.ListResponse response = taskService.getMyTasks();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/overdue")
    @Operation(summary = "Get overdue tasks", description = "Returns all overdue tasks for the current user")
    public ResponseEntity<ApiResponse<TaskDTO.ListResponse>> getOverdueTasks() {
        TaskDTO.ListResponse response = taskService.getOverdueTasks();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get tasks by status", description = "Returns tasks filtered by status for the current user")
    public ResponseEntity<ApiResponse<TaskDTO.ListResponse>> getTasksByStatus(
            @PathVariable TaskStatus status) {
        TaskDTO.ListResponse response = taskService.getTasksByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
