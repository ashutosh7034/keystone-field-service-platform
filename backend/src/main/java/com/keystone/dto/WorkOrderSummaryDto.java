package com.keystone.dto;

import com.keystone.domain.Priority;
import com.keystone.domain.SlaStatus;
import com.keystone.domain.WorkOrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrderSummaryDto {
    private Long id;
    private String workOrderCode;
    private String title;
    private Priority priority;
    private WorkOrderStatus status;
    private Long customerId;
    private String customerName;
    private Long siteId;
    private String siteName;
    private String siteCity;
    private Long assignedTechnicianId;
    private String assignedTechnicianName;
    private LocalDateTime slaDueDate;
    private SlaStatus slaStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
