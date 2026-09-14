package com.keystone.service;

import com.keystone.domain.*;
import com.keystone.dto.*;
import com.keystone.exception.BadRequestException;
import com.keystone.exception.ResourceNotFoundException;
import com.keystone.exception.UnauthorizedAccessException;
import com.keystone.mapper.WorkOrderMapper;
import com.keystone.repository.*;
import com.keystone.security.UserPrincipal;
import com.keystone.util.WorkOrderCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;
    private final UserRepository userRepository;
    private final PartUsageRepository partUsageRepository;
    private final TimeLogRepository timeLogRepository;
    private final WorkOrderCodeGenerator codeGenerator;
    private final WorkOrderLifecycleStateMachine stateMachine;
    private final SlaService slaService;
    private final NotificationService notificationService;
    private final WorkOrderMapper workOrderMapper;

    @Transactional
    public WorkOrderDetailDto createWorkOrder(CreateWorkOrderRequestDto dto, UserPrincipal currentUser) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + dto.getCustomerId()));

        Site site = siteRepository.findById(dto.getSiteId())
                .orElseThrow(() -> new ResourceNotFoundException("Site not found with ID: " + dto.getSiteId()));

        // Business Rule: Site must belong to customer
        if (!site.getCustomer().getId().equals(customer.getId())) {
            throw new BadRequestException("The specified site does not belong to the selected customer.");
        }

        User creator = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUser.getId()));

        User technician = null;
        WorkOrderStatus initialStatus = WorkOrderStatus.NEW;

        if (dto.getAssignedTechnicianId() != null) {
            technician = userRepository.findById(dto.getAssignedTechnicianId())
                    .orElseThrow(() -> new ResourceNotFoundException("Technician not found with ID: " + dto.getAssignedTechnicianId()));
            if (technician.getRole() != Role.ROLE_TECHNICIAN) {
                throw new BadRequestException("Assigned user must have the ROLE_TECHNICIAN role.");
            }
            initialStatus = WorkOrderStatus.ASSIGNED;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime slaDue = slaService.calculateSlaDueDate(dto.getPriority(), now);
        String code = codeGenerator.generateNextCode();

        WorkOrder workOrder = WorkOrder.builder()
                .workOrderCode(code)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .priority(dto.getPriority())
                .status(initialStatus)
                .customer(customer)
                .site(site)
                .assignedTechnician(technician)
                .createdByUser(creator)
                .slaDueDate(slaDue)
                .slaStatus(SlaStatus.ON_TRACK)
                .internalNotes(dto.getInternalNotes())
                .build();

        WorkOrder saved = workOrderRepository.save(workOrder);

        // Record initial history
        WorkOrderStatusHistory history = WorkOrderStatusHistory.builder()
                .workOrder(saved)
                .fromStatus(WorkOrderStatus.NEW)
                .toStatus(initialStatus)
                .changedByUser(creator)
                .note("Work order created with code " + code + (technician != null ? " and assigned to " + technician.getFullName() : ""))
                .changedAt(now)
                .build();
        saved.getStatusHistory().add(history);

        // Notify technician if assigned
        if (technician != null) {
            notificationService.sendNotification(
                    technician,
                    "New Job Assigned: " + code,
                    "You have been assigned to work order '" + saved.getTitle() + "' at " + site.getName(),
                    NotificationType.ASSIGNMENT,
                    saved
            );
        }

        log.info("Created work order [{}] with status {} by user [{}]", code, initialStatus, currentUser.getUsername());
        return getWorkOrderDetail(saved.getId());
    }

    @Transactional
    public WorkOrderDetailDto createCustomerRequest(CustomerCreateRequestDto dto, UserPrincipal currentUser) {
        if (currentUser.getCustomerId() == null) {
            throw new UnauthorizedAccessException("Only customer users can create portal service requests.");
        }

        Customer customer = customerRepository.findById(currentUser.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer account not found."));

        Site site = siteRepository.findById(dto.getSiteId())
                .orElseThrow(() -> new ResourceNotFoundException("Site not found with ID: " + dto.getSiteId()));

        if (!site.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedAccessException("You can only create service requests for sites belonging to your organization.");
        }

        User creator = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUser.getId()));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime slaDue = slaService.calculateSlaDueDate(dto.getPriority(), now);
        String code = codeGenerator.generateNextCode();

        WorkOrder workOrder = WorkOrder.builder()
                .workOrderCode(code)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .priority(dto.getPriority())
                .status(WorkOrderStatus.NEW)
                .customer(customer)
                .site(site)
                .assignedTechnician(null)
                .createdByUser(creator)
                .slaDueDate(slaDue)
                .slaStatus(SlaStatus.ON_TRACK)
                .build();

        WorkOrder saved = workOrderRepository.save(workOrder);

        WorkOrderStatusHistory history = WorkOrderStatusHistory.builder()
                .workOrder(saved)
                .fromStatus(WorkOrderStatus.NEW)
                .toStatus(WorkOrderStatus.NEW)
                .changedByUser(creator)
                .note("Service request submitted by customer via portal.")
                .changedAt(now)
                .build();
        saved.getStatusHistory().add(history);

        // Notify dispatchers and managers
        notificationService.notifyAllStaff(
                "New Customer Request: " + code,
                "Customer " + customer.getName() + " created service request '" + saved.getTitle() + "' for site " + site.getName(),
                NotificationType.STATUS_CHANGE,
                saved
        );

        return getWorkOrderDetail(saved.getId());
    }

    @Transactional(readOnly = true)
    public WorkOrderDetailDto getWorkOrderDetail(Long id) {
        WorkOrder wo = workOrderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found with ID: " + id));

        BigDecimal partsCost = partUsageRepository.calculateTotalPartsCostForWorkOrder(id);
        Integer minutes = timeLogRepository.calculateTotalMinutesForWorkOrder(id);

        return workOrderMapper.toDetailDto(wo, partsCost, minutes);
    }

    @Transactional(readOnly = true)
    public Object getWorkOrderByIdForRole(Long id, UserPrincipal currentUser) {
        WorkOrder wo = workOrderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found with ID: " + id));

        // Customer Isolation Rule
        if (currentUser.getRole() == Role.ROLE_CUSTOMER) {
            if (!wo.getCustomer().getId().equals(currentUser.getCustomerId())) {
                throw new UnauthorizedAccessException("Access denied: You cannot view work orders belonging to another customer.");
            }
            return workOrderMapper.toCustomerDetailDto(wo);
        }

        // Technician Ownership Rule
        if (currentUser.getRole() == Role.ROLE_TECHNICIAN) {
            if (wo.getAssignedTechnician() == null || !wo.getAssignedTechnician().getId().equals(currentUser.getId())) {
                throw new UnauthorizedAccessException("Access denied: You can only view work orders assigned to you.");
            }
        }

        BigDecimal partsCost = partUsageRepository.calculateTotalPartsCostForWorkOrder(id);
        Integer minutes = timeLogRepository.calculateTotalMinutesForWorkOrder(id);
        return workOrderMapper.toDetailDto(wo, partsCost, minutes);
    }

    @Transactional(readOnly = true)
    public PageResponse<WorkOrderSummaryDto> searchWorkOrders(
            Long customerId,
            Long siteId,
            Long technicianId,
            WorkOrderStatus status,
            Priority priority,
            SlaStatus slaStatus,
            String query,
            Pageable pageable,
            UserPrincipal currentUser) {

        // Enforce customer tenant filter
        if (currentUser.getRole() == Role.ROLE_CUSTOMER) {
            customerId = currentUser.getCustomerId();
        } else if (currentUser.getRole() == Role.ROLE_TECHNICIAN) {
            technicianId = currentUser.getId();
        }

        Page<WorkOrder> page = workOrderRepository.searchWorkOrders(
                customerId, siteId, technicianId, status, priority, slaStatus, query, pageable);

        return PageResponse.fromPage(page.map(workOrderMapper::toSummaryDto));
    }

    @Transactional(readOnly = true)
    public PageResponse<WorkOrderSummaryDto> getTechnicianWorkOrders(
            WorkOrderStatus status,
            String query,
            Pageable pageable,
            UserPrincipal currentUser) {

        Page<WorkOrder> page = workOrderRepository.findByTechnician(currentUser.getId(), status, query, pageable);
        return PageResponse.fromPage(page.map(workOrderMapper::toSummaryDto));
    }

    @Transactional(readOnly = true)
    public PageResponse<WorkOrderSummaryDto> getCustomerWorkOrders(
            Long siteId,
            WorkOrderStatus status,
            String query,
            Pageable pageable,
            UserPrincipal currentUser) {

        if (currentUser.getCustomerId() == null) {
            throw new UnauthorizedAccessException("User is not associated with a customer account.");
        }

        Page<WorkOrder> page = workOrderRepository.findByCustomer(currentUser.getCustomerId(), siteId, status, query, pageable);
        return PageResponse.fromPage(page.map(workOrderMapper::toSummaryDto));
    }

    @Transactional
    public WorkOrderDetailDto assignTechnician(Long workOrderId, AssignTechnicianRequestDto dto, UserPrincipal currentUser) {
        WorkOrder wo = workOrderRepository.findByIdWithDetails(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found with ID: " + workOrderId));

        if (wo.getStatus().isTerminal()) {
            throw new BadRequestException("Cannot assign or reassign a closed or cancelled work order.");
        }

        User technician = userRepository.findById(dto.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with ID: " + dto.getTechnicianId()));

        if (technician.getRole() != Role.ROLE_TECHNICIAN) {
            throw new BadRequestException("Assigned user must have ROLE_TECHNICIAN.");
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        User previousTechnician = wo.getAssignedTechnician();
        wo.setAssignedTechnician(technician);

        WorkOrderStatus previousStatus = wo.getStatus();
        if (previousStatus == WorkOrderStatus.NEW) {
            stateMachine.validateAndExecuteTransition(
                    wo,
                    WorkOrderStatus.ASSIGNED,
                    user,
                    currentUser,
                    dto.getNote() != null ? dto.getNote() : "Assigned to " + technician.getFullName(),
                    null
            );
        } else {
            // Reassignment in ASSIGNED / IN_PROGRESS / ON_HOLD
            String note = "Technician reassigned from " +
                    (previousTechnician != null ? previousTechnician.getFullName() : "None") +
                    " to " + technician.getFullName() + (dto.getNote() != null ? ". " + dto.getNote() : "");

            WorkOrderStatusHistory history = WorkOrderStatusHistory.builder()
                    .workOrder(wo)
                    .fromStatus(wo.getStatus())
                    .toStatus(wo.getStatus())
                    .changedByUser(user)
                    .note(note)
                    .changedAt(LocalDateTime.now())
                    .build();
            wo.getStatusHistory().add(history);
        }

        workOrderRepository.save(wo);

        // Send notification to assigned technician
        notificationService.sendNotification(
                technician,
                "Job Assigned: " + wo.getWorkOrderCode(),
                "You have been assigned to work order '" + wo.getTitle() + "' at site " + wo.getSite().getName(),
                NotificationType.ASSIGNMENT,
                wo
        );

        return getWorkOrderDetail(wo.getId());
    }

    @Transactional
    public WorkOrderDetailDto transitionStatus(Long workOrderId, StatusTransitionRequestDto dto, UserPrincipal currentUser) {
        WorkOrder wo = workOrderRepository.findByIdWithDetails(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found with ID: " + workOrderId));

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        stateMachine.validateAndExecuteTransition(
                wo,
                dto.getTargetStatus(),
                user,
                currentUser,
                dto.getNote(),
                dto.getCancellationReason()
        );

        WorkOrder updated = workOrderRepository.save(wo);

        // Notify relevant parties
        if (dto.getTargetStatus() == WorkOrderStatus.COMPLETED) {
            notificationService.notifyAllStaff(
                    "Job Completed: " + wo.getWorkOrderCode(),
                    "Technician " + user.getFullName() + " marked work order '" + wo.getTitle() + "' as completed. Ready for manager sign-off.",
                    NotificationType.STATUS_CHANGE,
                    wo
            );
        }

        return getWorkOrderDetail(updated.getId());
    }

    @Transactional
    public WorkOrderDetailDto updateWorkOrder(Long workOrderId, UpdateWorkOrderRequestDto dto, UserPrincipal currentUser) {
        WorkOrder wo = workOrderRepository.findByIdWithDetails(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found with ID: " + workOrderId));

        if (wo.getStatus().isTerminal()) {
            throw new BadRequestException("Closed or cancelled work orders cannot be edited.");
        }

        Site site = siteRepository.findById(dto.getSiteId())
                .orElseThrow(() -> new ResourceNotFoundException("Site not found with ID: " + dto.getSiteId()));

        if (!site.getCustomer().getId().equals(wo.getCustomer().getId())) {
            throw new BadRequestException("The specified site does not belong to this work order's customer.");
        }

        wo.setTitle(dto.getTitle());
        wo.setDescription(dto.getDescription());
        wo.setPriority(dto.getPriority());
        wo.setSite(site);
        if (dto.getInternalNotes() != null) {
            wo.setInternalNotes(dto.getInternalNotes());
        }

        WorkOrder saved = workOrderRepository.save(wo);
        return getWorkOrderDetail(saved.getId());
    }
}
