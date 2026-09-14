package com.keystone.repository;

import com.keystone.domain.WorkOrderAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkOrderAttachmentRepository extends JpaRepository<WorkOrderAttachment, Long> {
    List<WorkOrderAttachment> findByWorkOrderIdOrderByCreatedAtDesc(Long workOrderId);
}
