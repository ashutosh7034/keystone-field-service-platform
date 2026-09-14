package com.keystone.mapper;

import com.keystone.domain.TimeLog;
import com.keystone.dto.TimeLogResponseDto;
import org.springframework.stereotype.Component;

@Component
public class TimeLogMapper {

    public TimeLogResponseDto toDto(TimeLog timeLog) {
        if (timeLog == null) return null;
        return TimeLogResponseDto.builder()
                .id(timeLog.getId())
                .workOrderId(timeLog.getWorkOrder() != null ? timeLog.getWorkOrder().getId() : null)
                .technicianId(timeLog.getTechnician() != null ? timeLog.getTechnician().getId() : null)
                .technicianName(timeLog.getTechnician() != null ? timeLog.getTechnician().getFullName() : null)
                .minutes(timeLog.getMinutes())
                .note(timeLog.getNote())
                .loggedAt(timeLog.getLoggedAt())
                .createdAt(timeLog.getCreatedAt())
                .build();
    }
}
