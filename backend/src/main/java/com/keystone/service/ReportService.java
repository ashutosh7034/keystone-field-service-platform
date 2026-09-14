package com.keystone.service;

import com.keystone.domain.SlaStatus;
import com.keystone.domain.WorkOrderStatus;
import com.keystone.dto.ReportSummaryDto;
import com.keystone.repository.PartUsageRepository;
import com.keystone.repository.TimeLogRepository;
import com.keystone.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final WorkOrderRepository workOrderRepository;
    private final PartUsageRepository partUsageRepository;
    private final TimeLogRepository timeLogRepository;

    @Transactional(readOnly = true)
    public ReportSummaryDto getReportSummary() {
        long total = workOrderRepository.count();
        long completed = workOrderRepository.countByStatus(WorkOrderStatus.COMPLETED);
        long closed = workOrderRepository.countByStatus(WorkOrderStatus.CLOSED);
        long resolved = completed + closed;

        List<WorkOrderStatus> terminal = List.of(WorkOrderStatus.CLOSED, WorkOrderStatus.CANCELLED);
        long breached = workOrderRepository.countBySlaStatusAndStatusNotIn(SlaStatus.BREACHED, List.of(WorkOrderStatus.CANCELLED));

        long compliant = workOrderRepository.countSlaCompliantWorkOrders();
        double complianceRate = resolved > 0 ? ((double) compliant / resolved) * 100.0 : 100.0;
        complianceRate = Math.round(complianceRate * 10.0) / 10.0;

        // Parts Stats
        List<Object[]> topPartsRows = partUsageRepository.getMostUsedParts();
        List<ReportSummaryDto.TopPartDto> topParts = new ArrayList<>();
        BigDecimal totalPartsCost = BigDecimal.ZERO;

        for (Object[] row : topPartsRows) {
            Long partId = ((Number) row[0]).longValue();
            String sku = (String) row[1];
            String name = (String) row[2];
            long qty = ((Number) row[3]).longValue();
            BigDecimal cost = (BigDecimal) row[4];
            totalPartsCost = totalPartsCost.add(cost);

            if (topParts.size() < 10) {
                topParts.add(ReportSummaryDto.TopPartDto.builder()
                        .partId(partId)
                        .sku(sku)
                        .name(name)
                        .totalQuantity(qty)
                        .totalCost(cost)
                        .build());
            }
        }

        // Time Stats
        List<Object[]> techTimeRows = timeLogRepository.getTotalTimeByTechnicians();
        List<ReportSummaryDto.TechnicianTimeDto> techTimeStats = new ArrayList<>();
        long totalMinutes = 0;

        for (Object[] row : techTimeRows) {
            Long techId = ((Number) row[0]).longValue();
            String techName = (String) row[1];
            long minutes = ((Number) row[2]).longValue();
            totalMinutes += minutes;

            techTimeStats.add(ReportSummaryDto.TechnicianTimeDto.builder()
                    .technicianId(techId)
                    .technicianName(techName)
                    .totalMinutes(minutes)
                    .totalHours(Math.round((minutes / 60.0) * 10.0) / 10.0)
                    .build());
        }

        return ReportSummaryDto.builder()
                .totalWorkOrders(total)
                .completedWorkOrders(completed)
                .closedWorkOrders(closed)
                .slaBreachedWorkOrders(breached)
                .slaComplianceRate(complianceRate)
                .totalPartsCost(totalPartsCost)
                .totalLabourMinutes(totalMinutes)
                .topUsedParts(topParts)
                .technicianTimeStats(techTimeStats)
                .build();
    }
}
