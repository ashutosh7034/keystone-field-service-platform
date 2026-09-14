package com.keystone.service;

import com.keystone.domain.*;
import com.keystone.dto.LogTimeRequestDto;
import com.keystone.dto.TimeLogResponseDto;
import com.keystone.exception.BadRequestException;
import com.keystone.exception.ResourceNotFoundException;
import com.keystone.exception.UnauthorizedAccessException;
import com.keystone.mapper.TimeLogMapper;
import com.keystone.repository.TimeLogRepository;
import com.keystone.repository.UserRepository;
import com.keystone.repository.WorkOrderRepository;
import com.keystone.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimeLogService {

    private final TimeLogRepository timeLogRepository;
    private final WorkOrderRepository workOrderRepository;
    private final UserRepository userRepository;
    private final TimeLogMapper timeLogMapper;

    @Transactional
    public TimeLogResponseDto logTime(Long workOrderId, LogTimeRequestDto dto, UserPrincipal currentUser) {
        if (dto.getMinutes() == null || dto.getMinutes() <= 0) {
            throw new BadRequestException("Minutes worked must be greater than zero.");
        }

        WorkOrder workOrder = workOrderRepository.findByIdWithDetails(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found with ID: " + workOrderId));

        if (workOrder.getStatus().isTerminal()) {
            throw new BadRequestException("Cannot log time on a closed or cancelled work order.");
        }

        if (currentUser.getRole() == Role.ROLE_TECHNICIAN) {
            if (workOrder.getAssignedTechnician() == null || !workOrder.getAssignedTechnician().getId().equals(currentUser.getId())) {
                throw new UnauthorizedAccessException("Technicians can only log time on work orders assigned to them.");
            }
        }

        User technician = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found."));

        LocalDateTime loggedAt = dto.getLoggedAt() != null ? dto.getLoggedAt() : LocalDateTime.now();

        TimeLog timeLog = TimeLog.builder()
                .workOrder(workOrder)
                .technician(technician)
                .minutes(dto.getMinutes())
                .note(dto.getNote())
                .loggedAt(loggedAt)
                .build();

        TimeLog saved = timeLogRepository.save(timeLog);

        log.info("Logged {} minutes for technician [{}] on work order [{}]",
                dto.getMinutes(), technician.getFullName(), workOrder.getWorkOrderCode());

        return timeLogMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<TimeLogResponseDto> getTimeLogsForWorkOrder(Long workOrderId) {
        return timeLogRepository.findByWorkOrderIdOrderByLoggedAtDesc(workOrderId).stream()
                .map(timeLogMapper::toDto)
                .collect(Collectors.toList());
    }
}
