package com.keystone.dto;

import com.keystone.domain.WorkOrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    private long totalWorkOrders;
    private Map<WorkOrderStatus, Long> statusCounts;
    private long overdueCount;
    private long atRiskCount;
    private double slaCompliancePercentage;
    private List<TechnicianWorkloadDto> technicianWorkloads;
    private List<SiteDistributionDto> siteDistribution;
    private List<WorkOrderSummaryDto> recentActivity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TechnicianWorkloadDto {
        private Long technicianId;
        private String technicianName;
        private long activeJobsCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SiteDistributionDto {
        private Long siteId;
        private String siteName;
        private String customerName;
        private long workOrdersCount;
    }
}
