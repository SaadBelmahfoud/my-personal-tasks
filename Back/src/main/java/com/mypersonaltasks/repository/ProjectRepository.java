package com.mypersonaltasks.repository;

import com.mypersonaltasks.entity.Project;
import com.mypersonaltasks.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    @Query("SELECT p FROM Project p JOIN p.members m WHERE m.user.id = :userId ORDER BY p.createdAt DESC")
    List<Project> findByMemberId(@Param("userId") UUID userId);

    @Query("SELECT p FROM Project p JOIN p.members m WHERE m.user.id = :userId AND p.status = :status ORDER BY p.createdAt DESC")
    List<Project> findByMemberIdAndStatus(@Param("userId") UUID userId, @Param("status") ProjectStatus status);

    @Query("SELECT p FROM Project p WHERE p.isPublic = true ORDER BY p.createdAt DESC")
    List<Project> findByIsPublicTrue();

    @Query("SELECT p FROM Project p JOIN p.members m WHERE m.user.id = :userId AND m.isFavorite = true ORDER BY p.createdAt DESC")
    List<Project> findFavoriteProjectsByUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId")
    Long countTasksByProjectId(@Param("projectId") UUID projectId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.isCompleted = true")
    Long countCompletedTasksByProjectId(@Param("projectId") UUID projectId);

    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM ProjectMember m WHERE m.project.id = :projectId AND m.user.id = :userId")
    boolean isUserMemberOfProject(@Param("projectId") UUID projectId, @Param("userId") UUID userId);

    @Query("SELECT COUNT(DISTINCT p) FROM Project p JOIN p.members m WHERE m.user.id = :userId")
    Long countByMemberId(@Param("userId") UUID userId);
}
