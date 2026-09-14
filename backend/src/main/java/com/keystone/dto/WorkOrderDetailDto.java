package com.keystone.dto;

import com.keystone.domain.Priority;
import com.keystone.domain.SlaStatus;
import com.keystone.domain.WorkOrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrderDetailDto {
    private Long id;
    private String workOrderCode;
    private String title;
    private String description;
    private Priority priority;
    private WorkOrderStatus status;
    private Long customerId;
    private String customerName;
    private Long siteId;
    private String siteName;
    private String siteAddress;
    private String siteCity;
    private String siteState;
    private String sitePostalCode;
    private String siteContactPerson;
    private String siteContactPhone;
    private Long assignedTechnicianId;
    private String assignedTechnicianName;
    private String assignedTechnicianEmail;
    private String assignedTechnicianPhone;
    private Long createdByUserId;
    private String createdByUserName;
    private LocalDateTime slaDueDate;
    private SlaStatus slaStatus;
    private String internalNotes;
    private String cancellationReason;
    private LocalDateTime completedAt;
    private LocalDateTime closedAt;
    private LocalDateTime cancelledAt;
    private Long version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Aggregates and collections
    private BigDecimal totalPartsCost;
    private Integer totalLabourMinutes;
    private BigDecimal totalCost;
    private List<StatusHistoryResponseDto> statusHistory;
    private List<PartUsageResponseDto> partsUsed;
    private List<TimeLogResponseDto> timeLogs;
    private List<AttachmentResponseDto> attachments;
}
