package com.keystone.service;

import com.keystone.domain.*;
import com.keystone.dto.LogPartUsageRequestDto;
import com.keystone.dto.PageResponse;
import com.keystone.dto.PartRequestDto;
import com.keystone.dto.PartResponseDto;
import com.keystone.dto.PartUsageResponseDto;
import com.keystone.exception.BadRequestException;
import com.keystone.exception.InsufficientStockException;
import com.keystone.exception.ResourceNotFoundException;
import com.keystone.exception.UnauthorizedAccessException;
import com.keystone.mapper.PartMapper;
import com.keystone.repository.PartRepository;
import com.keystone.repository.PartUsageRepository;
import com.keystone.repository.UserRepository;
import com.keystone.repository.WorkOrderRepository;
import com.keystone.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PartUsageService {

    private final PartRepository partRepository;
    private final PartUsageRepository partUsageRepository;
    private final WorkOrderRepository workOrderRepository;
    private final UserRepository userRepository;
    private final PartMapper partMapper;

    /**
     * CRITICAL TRANSACTIONAL REQUIREMENT:
     * Pessimistically locks the inventory Part row to prevent race conditions.
     * Decrements stock and records PartUsage in the same database transaction.
     */
    @Transactional
    public PartUsageResponseDto logPartUsage(Long workOrderId, LogPartUsageRequestDto dto, UserPrincipal currentUser) {
        if (dto.getQuantity() == null || dto.getQuantity() <= 0) {
            throw new BadRequestException("Quantity must be greater than zero.");
        }

        WorkOrder workOrder = workOrderRepository.findByIdWithDetails(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found with ID: " + workOrderId));

        if (workOrder.getStatus().isTerminal()) {
            throw new BadRequestException("Cannot log parts on a closed or cancelled work order.");
        }

        // Ownership rule: Assigned technician or manager
        if (currentUser.getRole() == Role.ROLE_TECHNICIAN) {
            if (workOrder.getAssignedTechnician() == null || !workOrder.getAssignedTechnician().getId().equals(currentUser.getId())) {
                throw new UnauthorizedAccessException("Technicians can only log parts on work orders assigned to them.");
            }
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        // Pessimistic Lock on Part row for concurrency control
        Part part = partRepository.findByIdWithLock(dto.getPartId())
                .orElseThrow(() -> new ResourceNotFoundException("Part not found with ID: " + dto.getPartId()));

        if (!part.isActive()) {
            throw new BadRequestException("Part '" + part.getName() + "' is inactive and cannot be used.");
        }

        if (part.getStockQuantity() < dto.getQuantity()) {
            throw new InsufficientStockException(String.format(
                    "Insufficient stock for part '%s' (SKU: %s). Requested: %d, Available: %d",
                    part.getName(), part.getSku(), dto.getQuantity(), part.getStockQuantity()
            ));
        }

        // 1. Decrement Stock
        int remainingStock = part.getStockQuantity() - dto.getQuantity();
        part.setStockQuantity(remainingStock);
        partRepository.save(part);

        // 2. Record Part Usage
        PartUsage usage = PartUsage.builder()
                .workOrder(workOrder)
                .part(part)
                .quantity(dto.getQuantity())
                .unitCostAtUsage(part.getUnitCost())
                .recordedByUser(user)
                .build();

        PartUsage saved = partUsageRepository.save(usage);

        log.info("Logged {} units of part [{}] (SKU: {}) for WO [{}]. Remaining stock: {}. Recorded by user [{}]",
                dto.getQuantity(), part.getName(), part.getSku(), workOrder.getWorkOrderCode(), remainingStock, user.getEmail());

        return partMapper.toUsageDto(saved);
    }

    @Transactional(readOnly = true)
    public List<PartUsageResponseDto> getPartUsagesForWorkOrder(Long workOrderId) {
        return partUsageRepository.findByWorkOrderIdOrderByCreatedAtAsc(workOrderId).stream()
                .map(partMapper::toUsageDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<PartResponseDto> searchParts(String query, String category, Boolean active, Pageable pageable) {
        Page<Part> page = partRepository.searchParts(query, category, active, pageable);
        return PageResponse.fromPage(page.map(partMapper::toDto));
    }

    @Transactional(readOnly = true)
    public List<PartResponseDto> getAllActiveParts() {
        return partRepository.findByActiveTrueOrderByCategoryAscNameAsc().stream()
                .map(partMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PartResponseDto> getLowStockParts() {
        return partRepository.findLowStockParts().stream()
                .map(partMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PartResponseDto getPartById(Long id) {
        Part part = partRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Part not found with ID: " + id));
        return partMapper.toDto(part);
    }

    @Transactional
    public PartResponseDto createPart(PartRequestDto dto) {
        if (partRepository.existsBySku(dto.getSku())) {
            throw new BadRequestException("A part with SKU '" + dto.getSku() + "' already exists.");
        }
        Part part = partMapper.toEntity(dto);
        Part saved = partRepository.save(part);
        return partMapper.toDto(saved);
    }

    @Transactional
    public PartResponseDto updatePart(Long id, PartRequestDto dto) {
        Part part = partRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Part not found with ID: " + id));

        if (!part.getSku().equals(dto.getSku()) && partRepository.existsBySku(dto.getSku())) {
            throw new BadRequestException("A part with SKU '" + dto.getSku() + "' already exists.");
        }

        partMapper.updateEntityFromDto(dto, part);
        Part updated = partRepository.save(part);
        return partMapper.toDto(updated);
    }
}
