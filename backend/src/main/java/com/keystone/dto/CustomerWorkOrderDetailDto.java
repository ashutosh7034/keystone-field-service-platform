package com.keystone.dto;

import com.keystone.domain.Priority;
import com.keystone.domain.SlaStatus;
import com.keystone.domain.WorkOrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerWorkOrderDetailDto {
    private Long id;
    private String workOrderCode;
    private String title;
    private String description;
    private Priority priority;
    private WorkOrderStatus status;
    private Long siteId;
    private String siteName;
    private String siteAddress;
    private String siteCity;
    private String siteState;
    private Long assignedTechnicianId;
    private String assignedTechnicianName;
    private LocalDateTime slaDueDate;
    private SlaStatus slaStatus;
    private LocalDateTime completedAt;
    private LocalDateTime closedAt;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<StatusHistoryResponseDto> statusHistory;
    private List<AttachmentResponseDto> attachments;
}
