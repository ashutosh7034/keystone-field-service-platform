package com.keystone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeLogResponseDto {
    private Long id;
    private Long workOrderId;
    private Long technicianId;
    private String technicianName;
    private Integer minutes;
    private String note;
    private LocalDateTime loggedAt;
    private LocalDateTime createdAt;
}
