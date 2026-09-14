package com.keystone.mapper;

import com.keystone.domain.WorkOrder;
import com.keystone.domain.WorkOrderStatusHistory;
import com.keystone.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class WorkOrderMapper {

    private final PartMapper partMapper;
    private final TimeLogMapper timeLogMapper;
    private final AttachmentMapper attachmentMapper;

    public WorkOrderSummaryDto toSummaryDto(WorkOrder wo) {
        if (wo == null) return null;
        return WorkOrderSummaryDto.builder()
                .id(wo.getId())
                .workOrderCode(wo.getWorkOrderCode())
                .title(wo.getTitle())
                .priority(wo.getPriority())
                .status(wo.getStatus())
                .customerId(wo.getCustomer() != null ? wo.getCustomer().getId() : null)
                .customerName(wo.getCustomer() != null ? wo.getCustomer().getName() : null)
                .siteId(wo.getSite() != null ? wo.getSite().getId() : null)
                .siteName(wo.getSite() != null ? wo.getSite().getName() : null)
                .siteCity(wo.getSite() != null ? wo.getSite().getCity() : null)
                .assignedTechnicianId(wo.getAssignedTechnician() != null ? wo.getAssignedTechnician().getId() : null)
                .assignedTechnicianName(wo.getAssignedTechnician() != null ? wo.getAssignedTechnician().getFullName() : null)
                .slaDueDate(wo.getSlaDueDate())
                .slaStatus(wo.getSlaStatus())
                .createdAt(wo.getCreatedAt())
                .updatedAt(wo.getUpdatedAt())
                .build();
    }

    public StatusHistoryResponseDto toStatusHistoryDto(WorkOrderStatusHistory h) {
        if (h == null) return null;
        return StatusHistoryResponseDto.builder()
                .id(h.getId())
                .workOrderId(h.getWorkOrder() != null ? h.getWorkOrder().getId() : null)
                .fromStatus(h.getFromStatus())
                .toStatus(h.getToStatus())
                .changedByUserId(h.getChangedByUser() != null ? h.getChangedByUser().getId() : null)
                .changedByUserName(h.getChangedByUser() != null ? h.getChangedByUser().getFullName() : null)
                .changedByUserRole(h.getChangedByUser() != null ? h.getChangedByUser().getRole().name() : null)
                .note(h.getNote())
                .changedAt(h.getChangedAt())
                .build();
    }

    public WorkOrderDetailDto toDetailDto(
            WorkOrder wo,
            BigDecimal totalPartsCost,
            Integer totalLabourMinutes) {
        if (wo == null) return null;

        BigDecimal safePartsCost = totalPartsCost != null ? totalPartsCost : BigDecimal.ZERO;
        int safeMinutes = totalLabourMinutes != null ? totalLabourMinutes : 0;
        // Standard labor rate calculation ($75/hr = $1.25/min) for combined totalCost estimation
        BigDecimal labourCost = BigDecimal.valueOf(safeMinutes).multiply(BigDecimal.valueOf(1.25));
        BigDecimal totalCost = safePartsCost.add(labourCost);

        List<StatusHistoryResponseDto> historyDtos = wo.getStatusHistory() != null
                ? wo.getStatusHistory().stream().map(this::toStatusHistoryDto).collect(Collectors.toList())
                : Collections.emptyList();

        List<PartUsageResponseDto> partDtos = wo.getPartsUsed() != null
                ? wo.getPartsUsed().stream().map(partMapper::toUsageDto).collect(Collectors.toList())
                : Collections.emptyList();

        List<TimeLogResponseDto> timeDtos = wo.getTimeLogs() != null
                ? wo.getTimeLogs().stream().map(timeLogMapper::toDto).collect(Collectors.toList())
                : Collections.emptyList();

        List<AttachmentResponseDto> attachmentDtos = wo.getAttachments() != null
                ? wo.getAttachments().stream().map(attachmentMapper::toDto).collect(Collectors.toList())
                : Collections.emptyList();

        return WorkOrderDetailDto.builder()
                .id(wo.getId())
                .workOrderCode(wo.getWorkOrderCode())
                .title(wo.getTitle())
                .description(wo.getDescription())
                .priority(wo.getPriority())
                .status(wo.getStatus())
                .customerId(wo.getCustomer() != null ? wo.getCustomer().getId() : null)
                .customerName(wo.getCustomer() != null ? wo.getCustomer().getName() : null)
                .siteId(wo.getSite() != null ? wo.getSite().getId() : null)
                .siteName(wo.getSite() != null ? wo.getSite().getName() : null)
                .siteAddress(wo.getSite() != null ? wo.getSite().getAddress() : null)
                .siteCity(wo.getSite() != null ? wo.getSite().getCity() : null)
                .siteState(wo.getSite() != null ? wo.getSite().getState() : null)
                .sitePostalCode(wo.getSite() != null ? wo.getSite().getPostalCode() : null)
                .siteContactPerson(wo.getSite() != null ? wo.getSite().getContactPerson() : null)
                .siteContactPhone(wo.getSite() != null ? wo.getSite().getContactPhone() : null)
                .assignedTechnicianId(wo.getAssignedTechnician() != null ? wo.getAssignedTechnician().getId() : null)
                .assignedTechnicianName(wo.getAssignedTechnician() != null ? wo.getAssignedTechnician().getFullName() : null)
                .assignedTechnicianEmail(wo.getAssignedTechnician() != null ? wo.getAssignedTechnician().getEmail() : null)
                .assignedTechnicianPhone(wo.getAssignedTechnician() != null ? wo.getAssignedTechnician().getPhone() : null)
                .createdByUserId(wo.getCreatedByUser() != null ? wo.getCreatedByUser().getId() : null)
                .createdByUserName(wo.getCreatedByUser() != null ? wo.getCreatedByUser().getFullName() : null)
                .slaDueDate(wo.getSlaDueDate())
                .slaStatus(wo.getSlaStatus())
                .internalNotes(wo.getInternalNotes())
                .cancellationReason(wo.getCancellationReason())
                .completedAt(wo.getCompletedAt())
                .closedAt(wo.getClosedAt())
                .cancelledAt(wo.getCancelledAt())
                .version(wo.getVersion())
                .createdAt(wo.getCreatedAt())
                .updatedAt(wo.getUpdatedAt())
                .totalPartsCost(safePartsCost)
                .totalLabourMinutes(safeMinutes)
                .totalCost(totalCost)
                .statusHistory(historyDtos)
                .partsUsed(partDtos)
                .timeLogs(timeDtos)
                .attachments(attachmentDtos)
                .build();
    }

    public CustomerWorkOrderDetailDto toCustomerDetailDto(WorkOrder wo) {
        if (wo == null) return null;

        List<StatusHistoryResponseDto> historyDtos = wo.getStatusHistory() != null
                ? wo.getStatusHistory().stream().map(this::toStatusHistoryDto).collect(Collectors.toList())
                : Collections.emptyList();

        return CustomerWorkOrderDetailDto.builder()
                .id(wo.getId())
                .workOrderCode(wo.getWorkOrderCode())
                .title(wo.getTitle())
                .description(wo.getDescription())
                .priority(wo.getPriority())
                .status(wo.getStatus())
                .siteId(wo.getSite() != null ? wo.getSite().getId() : null)
                .siteName(wo.getSite() != null ? wo.getSite().getName() : null)
                .siteAddress(wo.getSite() != null ? wo.getSite().getAddress() : null)
                .siteCity(wo.getSite() != null ? wo.getSite().getCity() : null)
                .siteState(wo.getSite() != null ? wo.getSite().getState() : null)
                .slaDueDate(wo.getSlaDueDate())
                .slaStatus(wo.getSlaStatus())
                .completedAt(wo.getCompletedAt())
                .closedAt(wo.getClosedAt())
                .cancelledAt(wo.getCancelledAt())
                .cancellationReason(wo.getCancellationReason())
                .createdAt(wo.getCreatedAt())
                .updatedAt(wo.getUpdatedAt())
                .statusHistory(historyDtos)
                .build();
    }
}
