package com.mypersonaltasks.repository;

import com.mypersonaltasks.entity.Task;
import com.mypersonaltasks.enums.TaskPriority;
import com.mypersonaltasks.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByProjectIdOrderByPositionAsc(UUID projectId);

    List<Task> findByProjectIdAndStatusOrderByPositionAsc(UUID projectId, TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId ORDER BY t.position ASC")
    List<Task> findByProjectIdOrdered(@Param("projectId") UUID projectId);

    @Query("SELECT MAX(t.position) FROM Task t WHERE t.project.id = :projectId")
    Optional<Integer> findMaxPositionByProjectId(@Param("projectId") UUID projectId);

    @Query("SELECT t FROM Task t WHERE t.assignee.id = :userId ORDER BY t.dueDate ASC, t.priority DESC")
    List<Task> findByAssigneeId(@Param("userId") UUID userId);

    @Query("SELECT t FROM Task t WHERE t.assignee.id = :userId AND t.status IN :statuses ORDER BY t.dueDate ASC, t.priority DESC")
    List<Task> findByAssigneeIdAndStatusIn(@Param("userId") UUID userId, @Param("statuses") List<TaskStatus> statuses);

    @Query("SELECT t FROM Task t WHERE t.assignee.id = :userId AND t.dueDate < :date AND t.isCompleted = false ORDER BY t.dueDate ASC")
    List<Task> findOverdueTasksByAssigneeId(@Param("userId") UUID userId, @Param("date") LocalDate date);

    @Query("SELECT t FROM Task t JOIN t.project.members m WHERE m.user.id = :userId AND t.isCompleted = false ORDER BY t.dueDate ASC, t.priority DESC")
    List<Task> findIncompleteTasksByUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId")
    Long countByProjectId(@Param("projectId") UUID projectId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.status = :status")
    Long countByProjectIdAndStatus(@Param("projectId") UUID projectId, @Param("status") TaskStatus status);

    @Modifying
    @Query("UPDATE Task t SET t.position = t.position + 1 WHERE t.project.id = :projectId AND t.position >= :position")
    void incrementPositions(@Param("projectId") UUID projectId, @Param("position") Integer position);

    @Modifying
    @Query("UPDATE Task t SET t.position = t.position - 1 WHERE t.project.id = :projectId AND t.position > :position")
    void decrementPositions(@Param("projectId") UUID projectId, @Param("position") Integer position);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND t.priority = :priority ORDER BY t.position ASC")
    List<Task> findByProjectIdAndPriority(@Param("projectId") UUID projectId, @Param("priority") TaskPriority priority);

    @Query("SELECT t FROM Task t JOIN t.project.members m WHERE m.user.id = :userId AND t.dueDate BETWEEN :startDate AND :endDate ORDER BY t.dueDate ASC")
    List<Task> findTasksByUserIdAndDueDateBetween(@Param("userId") UUID userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee.id = :userId")
    Long countByAssigneeId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee.id = :userId AND t.isCompleted = true")
    Long countCompletedByAssigneeId(@Param("userId") UUID userId);
}
