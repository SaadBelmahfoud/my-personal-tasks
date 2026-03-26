package com.mypersonaltasks.repository;

import com.mypersonaltasks.entity.ProjectMember;
import com.mypersonaltasks.enums.ProjectRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, UUID> {

    List<ProjectMember> findByProjectId(UUID projectId);

    List<ProjectMember> findByUserId(UUID userId);

    Optional<ProjectMember> findByProjectIdAndUserId(UUID projectId, UUID userId);

    boolean existsByProjectIdAndUserId(UUID projectId, UUID userId);

    void deleteByProjectIdAndUserId(UUID projectId, UUID userId);

    @Query("SELECT pm FROM ProjectMember pm WHERE pm.project.id = :projectId AND pm.role = :role")
    List<ProjectMember> findByProjectIdAndRole(@Param("projectId") UUID projectId, @Param("role") ProjectRole role);

    @Modifying
    @Query("UPDATE ProjectMember pm SET pm.isFavorite = :isFavorite WHERE pm.project.id = :projectId AND pm.user.id = :userId")
    void updateFavoriteStatus(@Param("projectId") UUID projectId, @Param("userId") UUID userId, @Param("isFavorite") boolean isFavorite);

    @Modifying
    @Query("UPDATE ProjectMember pm SET pm.notificationEnabled = :enabled WHERE pm.project.id = :projectId AND pm.user.id = :userId")
    void updateNotificationEnabled(@Param("projectId") UUID projectId, @Param("userId") UUID userId, @Param("enabled") boolean enabled);

    @Query("SELECT CASE WHEN COUNT(pm) > 0 THEN true ELSE false END FROM ProjectMember pm WHERE pm.project.id = :projectId AND pm.user.id = :userId AND pm.role IN :roles")
    boolean hasAnyRole(@Param("projectId") UUID projectId, @Param("userId") UUID userId, @Param("roles") List<ProjectRole> roles);

    @Query("SELECT COUNT(pm) FROM ProjectMember pm WHERE pm.project.id = :projectId")
    Long countByProjectId(@Param("projectId") UUID projectId);
}
