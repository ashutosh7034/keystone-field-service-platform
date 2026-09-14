package com.keystone.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignTechnicianRequestDto {

    @NotNull(message = "Technician ID is required")
    private Long technicianId;

    private String note;
}
