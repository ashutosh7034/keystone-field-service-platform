package com.keystone.controller;

import com.keystone.domain.Priority;
import com.keystone.domain.SlaStatus;
import com.keystone.domain.WorkOrderStatus;
import com.keystone.dto.*;
import com.keystone.security.UserPrincipal;
import com.keystone.service.PartUsageService;
import com.keystone.service.TimeLogService;
import com.keystone.service.WorkOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin
@Tag(name = "Work Orders", description = "Core work order management, lifecycle transitions, dispatching, and execution")
@SecurityRequirement(name = "bearerAuth")
public class WorkOrderController {

    private final WorkOrderService workOrderService;
    private final PartUsageService partUsageService;
    private final TimeLogService timeLogService;

    @GetMapping("/work-orders")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @Operation(summary = "Search and filter work orders with pagination")
    public ResponseEntity<PageResponse<WorkOrderSummaryDto>> searchWorkOrders(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long siteId,
            @RequestParam(required = false) Long technicianId,
            @RequestParam(required = false) WorkOrderStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) SlaStatus slaStatus,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Sort sort = sortDirection.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(workOrderService.searchWorkOrders(
                customerId, siteId, technicianId, status, priority, slaStatus, query, pageable, currentUser));
    }

    @GetMapping("/technician/work-orders")
    @PreAuthorize("hasRole('TECHNICIAN')")
    @Operation(summary = "Get jobs assigned to current logged-in technician")
    public ResponseEntity<PageResponse<WorkOrderSummaryDto>> getTechnicianWorkOrders(
            @RequestParam(required = false) WorkOrderStatus status,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "slaDueDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Sort sort = sortDirection.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(workOrderService.getTechnicianWorkOrders(status, query, pageable, currentUser));
    }

    @GetMapping("/customer/work-orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get requests belonging to current logged-in customer")
    public ResponseEntity<PageResponse<WorkOrderSummaryDto>> getCustomerWorkOrders(
            @RequestParam(required = false) Long siteId,
            @RequestParam(required = false) WorkOrderStatus status,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Sort sort = sortDirection.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(workOrderService.getCustomerWorkOrders(siteId, status, query, pageable, currentUser));
    }

    @GetMapping("/work-orders/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get work order details by ID (Role & Ownership enforced)")
    public ResponseEntity<Object> getWorkOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(workOrderService.getWorkOrderByIdForRole(id, currentUser));
    }

    @PostMapping("/work-orders")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @Operation(summary = "Create a work order (Dispatcher / Manager)")
    public ResponseEntity<WorkOrderDetailDto> createWorkOrder(
            @Valid @RequestBody CreateWorkOrderRequestDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        WorkOrderDetailDto response = workOrderService.createWorkOrder(dto, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/work-orders/customer-request")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Submit a service request from the Customer Portal")
    public ResponseEntity<WorkOrderDetailDto> createCustomerRequest(
            @Valid @RequestBody CustomerCreateRequestDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        WorkOrderDetailDto response = workOrderService.createCustomerRequest(dto, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/work-orders/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @Operation(summary = "Update work order details (non-terminal states)")
    public ResponseEntity<WorkOrderDetailDto> updateWorkOrder(
            @PathVariable Long id,
            @Valid @RequestBody UpdateWorkOrderRequestDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(workOrderService.updateWorkOrder(id, dto, currentUser));
    }

    @PostMapping("/work-orders/{id}/assign")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @Operation(summary = "Assign or reassign technician to a work order")
    public ResponseEntity<WorkOrderDetailDto> assignTechnician(
            @PathVariable Long id,
            @Valid @RequestBody AssignTechnicianRequestDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(workOrderService.assignTechnician(id, dto, currentUser));
    }

    @RequestMapping(value = "/work-orders/{id}/status", method = {RequestMethod.POST, RequestMethod.PATCH})
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Execute state machine status transition with immutable history")
    public ResponseEntity<WorkOrderDetailDto> transitionStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusTransitionRequestDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(workOrderService.transitionStatus(id, dto, currentUser));
    }

    @PostMapping("/work-orders/{id}/parts")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'MANAGER')")
    @Operation(summary = "Log part usage on work order with transactional inventory lock")
    public ResponseEntity<PartUsageResponseDto> logPartUsage(
            @PathVariable Long id,
            @Valid @RequestBody LogPartUsageRequestDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        PartUsageResponseDto response = partUsageService.logPartUsage(id, dto, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/work-orders/{id}/parts")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get parts used on a work order")
    public ResponseEntity<List<PartUsageResponseDto>> getPartsUsed(@PathVariable Long id) {
        return ResponseEntity.ok(partUsageService.getPartUsagesForWorkOrder(id));
    }

    @RequestMapping(value = {"/work-orders/{id}/time", "/work-orders/{id}/timelogs"}, method = RequestMethod.POST)
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'MANAGER')")
    @Operation(summary = "Log technician labor time on work order")
    public ResponseEntity<TimeLogResponseDto> logTime(
            @PathVariable Long id,
            @Valid @RequestBody LogTimeRequestDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        TimeLogResponseDto response = timeLogService.logTime(id, dto, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @RequestMapping(value = {"/work-orders/{id}/time", "/work-orders/{id}/timelogs"}, method = RequestMethod.GET)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get labor time logs for a work order")
    public ResponseEntity<List<TimeLogResponseDto>> getTimeLogs(@PathVariable Long id) {
        return ResponseEntity.ok(timeLogService.getTimeLogsForWorkOrder(id));
    }
}
