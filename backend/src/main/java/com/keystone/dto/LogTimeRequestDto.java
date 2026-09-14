package com.keystone.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogTimeRequestDto {

    @NotNull(message = "Minutes worked is required")
    @Min(value = 1, message = "Minutes must be at least 1")
    private Integer minutes;

    private String note;

    private LocalDateTime loggedAt;
}
