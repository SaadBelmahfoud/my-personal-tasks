package com.mypersonaltasks.service;

import com.mypersonaltasks.dto.ChecklistItemDTO;
import com.mypersonaltasks.dto.LabelDTO;
import com.mypersonaltasks.dto.ProjectDTO;
import com.mypersonaltasks.dto.TaskDTO;
import com.mypersonaltasks.dto.UserDTO;
import com.mypersonaltasks.entity.*;
import com.mypersonaltasks.enums.ProjectRole;
import com.mypersonaltasks.enums.TaskPriority;
import com.mypersonaltasks.enums.TaskStatus;
import com.mypersonaltasks.exception.BadRequestException;
import com.mypersonaltasks.exception.ForbiddenException;
import com.mypersonaltasks.exception.ResourceNotFoundException;
import com.mypersonaltasks.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final LabelRepository labelRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final CommentRepository commentRepository;
    private final TaskAttachmentRepository taskAttachmentRepository;
    private final UserService userService;

    public TaskDTO.Response createTask(TaskDTO.CreateRequest request) {
        log.info("Creating new task: {}", request.getTitle());

        User currentUser = getCurrentUser();
        Project project = getProjectAndCheckAccess(request.getProjectId(), currentUser.getId());

        checkProjectPermission(request.getProjectId(), currentUser.getId(), 
                List.of(ProjectRole.OWNER, ProjectRole.ADMIN, ProjectRole.MEMBER));

        Integer position = request.getPosition();
        if (position == null) {
            position = taskRepository.findMaxPositionByProjectId(request.getProjectId())
                    .orElse(0) + 1;
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
                .dueDate(request.getDueDate())
                .startDate(request.getStartDate())
                .estimatedHours(request.getEstimatedHours())
                .position(position)
                .isCompleted(false)
                .project(project)
                .build();

        // Auto-assign to current user if no assignee specified
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssigneeId()));
            task.setAssignee(assignee);
        } else {
            // Auto-assign to the creator
            task.setAssignee(currentUser);
        }

        if (request.getLabelIds() != null && !request.getLabelIds().isEmpty()) {
            List<Label> labels = request.getLabelIds().stream()
                    .map(labelId -> labelRepository.findById(labelId)
                            .orElseThrow(() -> new ResourceNotFoundException("Label", "id", labelId)))
                    .collect(Collectors.toList());
            task.setLabels(labels);
        }

        task = taskRepository.save(task);
        return mapToTaskResponse(task);
    }

    @Transactional(readOnly = true)
    public TaskDTO.ListResponse getTasksByProject(UUID projectId) {
        User currentUser = getCurrentUser();
        getProjectAndCheckAccess(projectId, currentUser.getId());

        List<Task> tasks = taskRepository.findByProjectIdOrderByPositionAsc(projectId);

        return buildTaskListResponse(tasks);
    }

    @Transactional(readOnly = true)
    public TaskDTO.Response getTaskById(UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        User currentUser = getCurrentUser();
        getProjectAndCheckAccess(task.getProject().getId(), currentUser.getId());

        return mapToTaskResponse(task);
    }

    public TaskDTO.Response updateTask(UUID taskId, TaskDTO.UpdateRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        User currentUser = getCurrentUser();
        checkProjectPermission(task.getProject().getId(), currentUser.getId(), 
                List.of(ProjectRole.OWNER, ProjectRole.ADMIN, ProjectRole.MEMBER));

        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
            if (request.getStatus() == TaskStatus.COMPLETED) {
                task.setIsCompleted(true);
                task.setCompletedAt(LocalDateTime.now());
            } else {
                task.setIsCompleted(false);
                task.setCompletedAt(null);
            }
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getStartDate() != null) {
            task.setStartDate(request.getStartDate());
        }
        if (request.getEstimatedHours() != null) {
            task.setEstimatedHours(request.getEstimatedHours());
        }
        if (request.getActualHours() != null) {
            task.setActualHours(request.getActualHours());
        }
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssigneeId()));
            task.setAssignee(assignee);
        }
        if (request.getLabelIds() != null) {
            List<Label> labels = request.getLabelIds().stream()
                    .map(labelId -> labelRepository.findById(labelId)
                            .orElseThrow(() -> new ResourceNotFoundException("Label", "id", labelId)))
                    .collect(Collectors.toList());
            task.setLabels(labels);
        }

        task = taskRepository.save(task);
        return mapToTaskResponse(task);
    }

    public TaskDTO.Response updateTaskStatus(UUID taskId, TaskDTO.StatusUpdateRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        User currentUser = getCurrentUser();
        checkProjectPermission(task.getProject().getId(), currentUser.getId(), 
                List.of(ProjectRole.OWNER, ProjectRole.ADMIN, ProjectRole.MEMBER));

        task.setStatus(request.getStatus());

        if (request.getStatus() == TaskStatus.COMPLETED) {
            task.setIsCompleted(true);
            task.setCompletedAt(LocalDateTime.now());
        } else {
            task.setIsCompleted(false);
            task.setCompletedAt(null);
        }

        task = taskRepository.save(task);
        return mapToTaskResponse(task);
    }

    public void deleteTask(UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        User currentUser = getCurrentUser();
        checkProjectPermission(task.getProject().getId(), currentUser.getId(), 
                List.of(ProjectRole.OWNER, ProjectRole.ADMIN, ProjectRole.MEMBER));

        taskRepository.delete(task);
    }

    public void reorderTasks(UUID projectId, List<TaskDTO.ReorderRequest> reorderRequests) {
        User currentUser = getCurrentUser();
        checkProjectPermission(projectId, currentUser.getId(), 
                List.of(ProjectRole.OWNER, ProjectRole.ADMIN, ProjectRole.MEMBER));

        for (TaskDTO.ReorderRequest request : reorderRequests) {
            Task task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Task", "id", request.getTaskId()));

            if (!task.getProject().getId().equals(projectId)) {
                throw new BadRequestException("Task does not belong to the specified project");
            }

            task.setPosition(request.getNewPosition());
            taskRepository.save(task);
        }
    }

    @Transactional(readOnly = true)
    public TaskDTO.ListResponse getMyTasks() {
        User currentUser = getCurrentUser();

        List<Task> tasks = taskRepository.findByAssigneeId(currentUser.getId());
        return buildTaskListResponse(tasks);
    }

    @Transactional(readOnly = true)
    public TaskDTO.ListResponse getOverdueTasks() {
        User currentUser = getCurrentUser();

        List<Task> tasks = taskRepository.findOverdueTasksByAssigneeId(currentUser.getId(), LocalDate.now());
        return buildTaskListResponse(tasks);
    }

    @Transactional(readOnly = true)
    public TaskDTO.ListResponse getTasksByStatus(TaskStatus status) {
        User currentUser = getCurrentUser();

        List<Task> tasks = taskRepository.findByAssigneeIdAndStatusIn(
                currentUser.getId(), 
                List.of(status)
        );
        return buildTaskListResponse(tasks);
    }

    private Project getProjectAndCheckAccess(UUID projectId, UUID userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        if (!project.getIsPublic() && !projectRepository.isUserMemberOfProject(projectId, userId)) {
            throw new ForbiddenException("You don't have access to this project");
        }

        return project;
    }

    private void checkProjectPermission(UUID projectId, UUID userId, List<ProjectRole> allowedRoles) {
        boolean hasPermission = projectMemberRepository.hasAnyRole(projectId, userId, allowedRoles);
        if (!hasPermission) {
            throw new ForbiddenException("You don't have permission to perform this action");
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ForbiddenException("User not authenticated");
        }

        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    private TaskDTO.ListResponse buildTaskListResponse(List<Task> tasks) {
        List<TaskDTO.Response> taskResponses = tasks.stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());

        long todoCount = tasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();
        long inProgressCount = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long completedCount = tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();

        return TaskDTO.ListResponse.builder()
                .tasks(taskResponses)
                .totalCount((long) tasks.size())
                .todoCount(todoCount)
                .inProgressCount(inProgressCount)
                .completedCount(completedCount)
                .build();
    }

    private TaskDTO.Response mapToTaskResponse(Task task) {
        UserDTO.Summary assigneeSummary = null;
        if (task.getAssignee() != null) {
            assigneeSummary = userService.mapToUserSummary(task.getAssignee());
        }

        ProjectDTO.Summary projectSummary = ProjectDTO.Summary.builder()
                .id(task.getProject().getId())
                .name(task.getProject().getName())
                .color(task.getProject().getColor())
                .icon(task.getProject().getIcon())
                .status(task.getProject().getStatus())
                .build();

        List<LabelDTO.Response> labels = task.getLabels().stream()
                .map(this::mapToLabelResponse)
                .collect(Collectors.toList());

        List<ChecklistItemDTO.Response> checklistItems = checklistItemRepository
                .findByTaskIdOrderByPositionAsc(task.getId())
                .stream()
                .map(this::mapToChecklistItemResponse)
                .collect(Collectors.toList());

        Long commentCount = commentRepository.countByTaskId(task.getId());
        Long attachmentCount = taskAttachmentRepository.countByTaskId(task.getId());

        return TaskDTO.Response.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .startDate(task.getStartDate())
                .estimatedHours(task.getEstimatedHours())
                .actualHours(task.getActualHours())
                .position(task.getPosition())
                .isCompleted(task.getIsCompleted())
                .completedAt(task.getCompletedAt())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .assignee(assigneeSummary)
                .project(projectSummary)
                .labels(labels)
                .checklistItems(checklistItems)
                .commentCount(commentCount.intValue())
                .attachmentCount(attachmentCount.intValue())
                .build();
    }

    private LabelDTO.Response mapToLabelResponse(Label label) {
        return LabelDTO.Response.builder()
                .id(label.getId())
                .name(label.getName())
                .color(label.getColor())
                .description(label.getDescription())
                .build();
    }

    private ChecklistItemDTO.Response mapToChecklistItemResponse(ChecklistItem item) {
        return ChecklistItemDTO.Response.builder()
                .id(item.getId())
                .content(item.getContent())
                .isCompleted(item.getIsCompleted())
                .position(item.getPosition())
                .createdAt(item.getCreatedAt())
                .completedAt(item.getCompletedAt())
                .build();
    }
}
