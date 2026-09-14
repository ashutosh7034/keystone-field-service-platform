package com.keystone.mapper;

import com.keystone.domain.Part;
import com.keystone.domain.PartUsage;
import com.keystone.dto.PartRequestDto;
import com.keystone.dto.PartResponseDto;
import com.keystone.dto.PartUsageResponseDto;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class PartMapper {

    public PartResponseDto toDto(Part part) {
        if (part == null) return null;
        return PartResponseDto.builder()
                .id(part.getId())
                .sku(part.getSku())
                .name(part.getName())
                .description(part.getDescription())
                .category(part.getCategory())
                .unitCost(part.getUnitCost())
                .stockQuantity(part.getStockQuantity())
                .leadTimeDays(part.getLeadTimeDays())
                .active(part.isActive())
                .lowStock(part.getStockQuantity() <= 5)
                .version(part.getVersion())
                .createdAt(part.getCreatedAt())
                .updatedAt(part.getUpdatedAt())
                .build();
    }

    public Part toEntity(PartRequestDto dto) {
        if (dto == null) return null;
        return Part.builder()
                .sku(dto.getSku())
                .name(dto.getName())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .unitCost(dto.getUnitCost())
                .stockQuantity(dto.getStockQuantity() != null ? dto.getStockQuantity() : 0)
                .leadTimeDays(dto.getLeadTimeDays() != null ? dto.getLeadTimeDays() : 0)
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();
    }

    public void updateEntityFromDto(PartRequestDto dto, Part part) {
        part.setSku(dto.getSku());
        part.setName(dto.getName());
        part.setDescription(dto.getDescription());
        part.setCategory(dto.getCategory());
        part.setUnitCost(dto.getUnitCost());
        part.setStockQuantity(dto.getStockQuantity());
        part.setLeadTimeDays(dto.getLeadTimeDays());
        if (dto.getActive() != null) {
            part.setActive(dto.getActive());
        }
    }

    public PartUsageResponseDto toUsageDto(PartUsage usage) {
        if (usage == null) return null;
        BigDecimal total = usage.getUnitCostAtUsage().multiply(BigDecimal.valueOf(usage.getQuantity()));
        return PartUsageResponseDto.builder()
                .id(usage.getId())
                .workOrderId(usage.getWorkOrder() != null ? usage.getWorkOrder().getId() : null)
                .partId(usage.getPart() != null ? usage.getPart().getId() : null)
                .partSku(usage.getPart() != null ? usage.getPart().getSku() : null)
                .partName(usage.getPart() != null ? usage.getPart().getName() : null)
                .partCategory(usage.getPart() != null ? usage.getPart().getCategory() : null)
                .quantity(usage.getQuantity())
                .unitCostAtUsage(usage.getUnitCostAtUsage())
                .totalCost(total)
                .recordedByUserId(usage.getRecordedByUser() != null ? usage.getRecordedByUser().getId() : null)
                .recordedByUserName(usage.getRecordedByUser() != null ? usage.getRecordedByUser().getFullName() : null)
                .createdAt(usage.getCreatedAt())
                .build();
    }
}
