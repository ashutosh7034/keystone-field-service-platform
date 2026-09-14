package com.keystone.service;

import com.keystone.domain.SlaStatus;
import com.keystone.domain.WorkOrderStatus;
import com.keystone.dto.DashboardSummaryDto;
import com.keystone.dto.WorkOrderSummaryDto;
import com.keystone.mapper.WorkOrderMapper;
import com.keystone.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderMapper workOrderMapper;

    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary() {
        long total = workOrderRepository.count();

        // 1. Status Counts
        Map<WorkOrderStatus, Long> statusCounts = new EnumMap<>(WorkOrderStatus.class);
        for (WorkOrderStatus status : WorkOrderStatus.values()) {
            statusCounts.put(status, 0L);
        }

        List<Object[]> statusRows = workOrderRepository.countGroupedByStatus();
        for (Object[] row : statusRows) {
            WorkOrderStatus status = (WorkOrderStatus) row[0];
            Long count = ((Number) row[1]).longValue();
            statusCounts.put(status, count);
        }

        // 2. Overdue and At-Risk Counts for non-terminal work orders
        List<WorkOrderStatus> terminal = List.of(WorkOrderStatus.CLOSED, WorkOrderStatus.CANCELLED);
        long overdue = workOrderRepository.countBySlaStatusAndStatusNotIn(SlaStatus.BREACHED, terminal);
        long atRisk = workOrderRepository.countBySlaStatusAndStatusNotIn(SlaStatus.AT_RISK, terminal);

        // 3. SLA Compliance Percentage
        long resolved = workOrderRepository.countResolvedWorkOrders();
        long compliant = workOrderRepository.countSlaCompliantWorkOrders();
        double compliancePercentage = resolved > 0 ? ((double) compliant / resolved) * 100.0 : 100.0;
        compliancePercentage = Math.round(compliancePercentage * 10.0) / 10.0;

        // 4. Technician Workload
        List<DashboardSummaryDto.TechnicianWorkloadDto> workloads = new ArrayList<>();
        List<Object[]> workloadRows = workOrderRepository.countActiveJobsByTechnician();
        for (Object[] row : workloadRows) {
            workloads.add(DashboardSummaryDto.TechnicianWorkloadDto.builder()
                    .technicianId(((Number) row[0]).longValue())
                    .technicianName((String) row[1])
                    .activeJobsCount(((Number) row[2]).longValue())
                    .build());
        }

        // 5. Site Distribution
        List<DashboardSummaryDto.SiteDistributionDto> siteDistribution = new ArrayList<>();
        List<Object[]> siteRows = workOrderRepository.countWorkOrdersBySite();
        for (Object[] row : siteRows) {
            siteDistribution.add(DashboardSummaryDto.SiteDistributionDto.builder()
                    .siteId(((Number) row[0]).longValue())
                    .siteName((String) row[1])
                    .customerName((String) row[2])
                    .workOrdersCount(((Number) row[3]).longValue())
                    .build());
        }

        // 6. Recent Activity
        List<WorkOrderSummaryDto> recent = workOrderRepository.findRecentActivity(PageRequest.of(0, 8)).stream()
                .map(workOrderMapper::toSummaryDto)
                .collect(Collectors.toList());

        return DashboardSummaryDto.builder()
                .totalWorkOrders(total)
                .statusCounts(statusCounts)
                .overdueCount(overdue)
                .atRiskCount(atRisk)
                .slaCompliancePercentage(compliancePercentage)
                .technicianWorkloads(workloads)
                .siteDistribution(siteDistribution)
                .recentActivity(recent)
                .build();
    }
}
