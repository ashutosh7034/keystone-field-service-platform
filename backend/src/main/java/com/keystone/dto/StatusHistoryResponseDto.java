package com.keystone.dto;

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
public class StatusHistoryResponseDto {
    private Long id;
    private Long workOrderId;
    private WorkOrderStatus fromStatus;
    private WorkOrderStatus toStatus;
    private Long changedByUserId;
    private String changedByUserName;
    private String changedByUserRole;
    private String note;
    private LocalDateTime changedAt;
}
