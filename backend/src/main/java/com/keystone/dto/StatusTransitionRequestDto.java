package com.keystone.dto;

import com.keystone.domain.WorkOrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusTransitionRequestDto {

    @NotNull(message = "Target status is required")
    private WorkOrderStatus targetStatus;

    private String note;

    private String cancellationReason;
}
