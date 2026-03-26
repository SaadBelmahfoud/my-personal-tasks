package com.mypersonaltasks.repository;

import com.mypersonaltasks.entity.ChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, UUID> {

    List<ChecklistItem> findByTaskIdOrderByPositionAsc(UUID taskId);

    Long countByTaskId(UUID taskId);

    @Query("SELECT COUNT(ci) FROM ChecklistItem ci WHERE ci.task.id = :taskId AND ci.isCompleted = true")
    Long countCompletedByTaskId(@Param("taskId") UUID taskId);

    @Modifying
    @Query("UPDATE ChecklistItem ci SET ci.isCompleted = :completed, ci.completedAt = CASE WHEN :completed = true THEN CURRENT_TIMESTAMP ELSE NULL END WHERE ci.id = :id")
    void updateCompletionStatus(@Param("id") UUID id, @Param("completed") boolean completed);
}
