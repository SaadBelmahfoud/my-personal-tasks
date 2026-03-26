package com.mypersonaltasks.service;

import com.mypersonaltasks.dto.LabelDTO;
import com.mypersonaltasks.dto.ProjectDTO;
import com.mypersonaltasks.dto.ProjectMemberDTO;
import com.mypersonaltasks.dto.UserDTO;
import com.mypersonaltasks.entity.Label;
import com.mypersonaltasks.entity.Project;
import com.mypersonaltasks.entity.ProjectMember;
import com.mypersonaltasks.entity.User;
import com.mypersonaltasks.enums.ProjectRole;
import com.mypersonaltasks.enums.ProjectStatus;
import com.mypersonaltasks.exception.BadRequestException;
import com.mypersonaltasks.exception.ForbiddenException;
import com.mypersonaltasks.exception.ResourceNotFoundException;
import com.mypersonaltasks.repository.LabelRepository;
import com.mypersonaltasks.repository.ProjectMemberRepository;
import com.mypersonaltasks.repository.ProjectRepository;
import com.mypersonaltasks.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;
    private final LabelRepository labelRepository;
    private final UserService userService;

    public ProjectDTO.Response createProject(ProjectDTO.CreateRequest request) {
        log.info("Creating new project: {}", request.getName());

        User currentUser = getCurrentUser();

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .color(request.getColor())
                .icon(request.getIcon())
                .status(request.getStatus() != null ? request.getStatus() : ProjectStatus.PLANNING)
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : false)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        project = projectRepository.save(project);

        ProjectMember owner = ProjectMember.builder()
                .user(currentUser)
                .project(project)
                .role(ProjectRole.OWNER)
                .build();
        projectMemberRepository.save(owner);

        return mapToProjectResponse(project, currentUser);
    }

    @Transactional(readOnly = true)
    public ProjectDTO.ListResponse getProjects() {
        User currentUser = getCurrentUser();

        List<Project> projects = projectRepository.findByMemberId(currentUser.getId());

        List<ProjectDTO.Summary> projectSummaries = projects.stream()
                .map(this::mapToProjectSummary)
                .collect(Collectors.toList());

        long total = projects.size();
        long completed = projects.stream()
                .filter(p -> p.getStatus() == ProjectStatus.COMPLETED)
                .count();
        long active = projects.stream()
                .filter(p -> p.getStatus() == ProjectStatus.ACTIVE)
                .count();

        return ProjectDTO.ListResponse.builder()
                .projects(projectSummaries)
                .totalCount(total)
                .completedCount((int) completed)
                .activeCount((int) active)
                .build();
    }

    @Transactional(readOnly = true)
    public ProjectDTO.Response getProjectById(UUID projectId) {
        User currentUser = getCurrentUser();
        Project project = getProjectAndCheckAccess(projectId, currentUser.getId());
        return mapToProjectResponse(project, currentUser);
    }

    public ProjectDTO.Response updateProject(UUID projectId, ProjectDTO.UpdateRequest request) {
        User currentUser = getCurrentUser();
        Project project = getProjectAndCheckAccess(projectId, currentUser.getId());

        checkProjectPermission(projectId, currentUser.getId(), List.of(ProjectRole.OWNER, ProjectRole.ADMIN));

        if (request.getName() != null) {
            project.setName(request.getName());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getColor() != null) {
            project.setColor(request.getColor());
        }
        if (request.getIcon() != null) {
            project.setIcon(request.getIcon());
        }
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
        if (request.getIsPublic() != null) {
            project.setIsPublic(request.getIsPublic());
        }
        if (request.getStartDate() != null) {
            project.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            project.setEndDate(request.getEndDate());
        }

        project = projectRepository.save(project);
        return mapToProjectResponse(project, currentUser);
    }

    public void deleteProject(UUID projectId) {
        User currentUser = getCurrentUser();
        Project project = getProjectAndCheckAccess(projectId, currentUser.getId());

        checkProjectPermission(projectId, currentUser.getId(), List.of(ProjectRole.OWNER));

        projectRepository.delete(project);
    }

    public ProjectDTO.Response archiveProject(UUID projectId) {
        User currentUser = getCurrentUser();
        Project project = getProjectAndCheckAccess(projectId, currentUser.getId());

        checkProjectPermission(projectId, currentUser.getId(), List.of(ProjectRole.OWNER, ProjectRole.ADMIN));

        project.setStatus(ProjectStatus.ARCHIVED);
        project = projectRepository.save(project);

        return mapToProjectResponse(project, currentUser);
    }

    public ProjectMemberDTO.Response addMember(UUID projectId, ProjectMemberDTO.AddRequest request) {
        User currentUser = getCurrentUser();
        Project project = getProjectAndCheckAccess(projectId, currentUser.getId());

        checkProjectPermission(projectId, currentUser.getId(), List.of(ProjectRole.OWNER, ProjectRole.ADMIN));

        User newMember = userService.getUserEntityById(request.getUserId());

        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, newMember.getId())) {
            throw new BadRequestException("User is already a member of this project");
        }

        ProjectMember member = ProjectMember.builder()
                .user(newMember)
                .project(project)
                .role(request.getRole() != null ? request.getRole() : ProjectRole.MEMBER)
                .build();

        member = projectMemberRepository.save(member);

        return mapToProjectMemberResponse(member);
    }

    public void removeMember(UUID projectId, UUID userId) {
        User currentUser = getCurrentUser();
        getProjectAndCheckAccess(projectId, currentUser.getId());

        checkProjectPermission(projectId, currentUser.getId(), List.of(ProjectRole.OWNER, ProjectRole.ADMIN));

        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project member not found"));

        if (member.getRole() == ProjectRole.OWNER) {
            throw new BadRequestException("Cannot remove the project owner");
        }

        projectMemberRepository.delete(member);
    }

    public ProjectMemberDTO.Response updateMemberRole(UUID projectId, UUID userId, ProjectRole newRole) {
        User currentUser = getCurrentUser();
        getProjectAndCheckAccess(projectId, currentUser.getId());

        checkProjectPermission(projectId, currentUser.getId(), List.of(ProjectRole.OWNER));

        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project member not found"));

        if (member.getRole() == ProjectRole.OWNER && newRole != ProjectRole.OWNER) {
            throw new BadRequestException("Cannot change owner's role. Transfer ownership first.");
        }

        member.setRole(newRole);
        member = projectMemberRepository.save(member);

        return mapToProjectMemberResponse(member);
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
        return userService.getUserEntityById(
                userService.getUserEntityById(
                        userService.getCurrentUser().getId()
                ).getId()
        );
    }

    private ProjectDTO.Response mapToProjectResponse(Project project, User currentUser) {
        List<ProjectMemberDTO.Response> members = projectMemberRepository.findByProjectId(project.getId())
                .stream()
                .map(this::mapToProjectMemberResponse)
                .collect(Collectors.toList());

        List<LabelDTO.Response> labels = labelRepository.findByProjectId(project.getId())
                .stream()
                .map(this::mapToLabelResponse)
                .collect(Collectors.toList());

        Long taskCount = taskRepository.countByProjectId(project.getId());

        UserDTO.Summary ownerSummary = null;
        ProjectMember owner = projectMemberRepository.findByProjectIdAndRole(project.getId(), ProjectRole.OWNER)
                .stream()
                .findFirst()
                .orElse(null);
        if (owner != null) {
            ownerSummary = userService.mapToUserSummary(owner.getUser());
        }

        return ProjectDTO.Response.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .color(project.getColor())
                .icon(project.getIcon())
                .status(project.getStatus())
                .isPublic(project.getIsPublic())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .owner(ownerSummary)
                .members(members)
                .labels(labels)
                .taskCount(taskCount.intValue())
                .build();
    }

    private ProjectDTO.Summary mapToProjectSummary(Project project) {
        Long taskCount = taskRepository.countByProjectId(project.getId());
        Long completedCount = taskRepository.countByProjectIdAndStatus(project.getId(), 
                com.mypersonaltasks.enums.TaskStatus.COMPLETED);

        return ProjectDTO.Summary.builder()
                .id(project.getId())
                .name(project.getName())
                .color(project.getColor())
                .icon(project.getIcon())
                .status(project.getStatus())
                .taskCount(taskCount.intValue())
                .completedTaskCount(completedCount.intValue())
                .build();
    }

    private ProjectMemberDTO.Response mapToProjectMemberResponse(ProjectMember member) {
        return ProjectMemberDTO.Response.builder()
                .id(member.getId())
                .user(userService.mapToUserSummary(member.getUser()))
                .role(member.getRole())
                .isFavorite(member.getIsFavorite())
                .notificationEnabled(member.getNotificationEnabled())
                .joinedAt(member.getJoinedAt())
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
}
