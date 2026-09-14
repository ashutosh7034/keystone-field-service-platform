package com.keystone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportSummaryDto {
    private long totalWorkOrders;
    private long completedWorkOrders;
    private long closedWorkOrders;
    private long slaBreachedWorkOrders;
    private double slaComplianceRate;
    private BigDecimal totalPartsCost;
    private long totalLabourMinutes;
    private List<TopPartDto> topUsedParts;
    private List<TechnicianTimeDto> technicianTimeStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopPartDto {
        private Long partId;
        private String sku;
        private String name;
        private long totalQuantity;
        private BigDecimal totalCost;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TechnicianTimeDto {
        private Long technicianId;
        private String technicianName;
        private long totalMinutes;
        private double totalHours;
    }
}
