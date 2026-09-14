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
public class PartResponseDto {
    private Long id;
    private String sku;
    private String name;
    private String description;
    private String category;
    private BigDecimal unitCost;
    private Integer stockQuantity;
    private Integer leadTimeDays;
    private boolean active;
    private boolean lowStock;
    private Long version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
