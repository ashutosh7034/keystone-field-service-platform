package com.keystone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartUsageResponseDto {
    private Long id;
    private Long workOrderId;
    private Long partId;
    private String partSku;
    private String partName;
    private String partCategory;
    private Integer quantity;
    private BigDecimal unitCostAtUsage;
    private BigDecimal totalCost;
    private Long recordedByUserId;
    private String recordedByUserName;
    private LocalDateTime createdAt;
}
