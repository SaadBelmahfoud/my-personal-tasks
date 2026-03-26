package com.mypersonaltasks.repository;

import com.mypersonaltasks.entity.TaskAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskAttachmentRepository extends JpaRepository<TaskAttachment, UUID> {

    List<TaskAttachment> findByTaskId(UUID taskId);

    Long countByTaskId(UUID taskId);

    void deleteByIdAndTaskId(UUID id, UUID taskId);
}
