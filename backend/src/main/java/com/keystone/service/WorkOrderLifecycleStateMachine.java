package com.keystone.service;

import com.keystone.domain.*;
import com.keystone.exception.InvalidLifecycleTransitionException;
import com.keystone.exception.UnauthorizedAccessException;
import com.keystone.repository.WorkOrderStatusHistoryRepository;
import com.keystone.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class WorkOrderLifecycleStateMachine {

    private final WorkOrderStatusHistoryRepository statusHistoryRepository;

    public void validateAndExecuteTransition(
            WorkOrder workOrder,
            WorkOrderStatus targetStatus,
            User user,
            UserPrincipal principal,
            String note,
            String cancellationReason) {

        WorkOrderStatus currentStatus = workOrder.getStatus();

        // 1. Terminal states are immutable
        if (currentStatus.isTerminal()) {
            throw new InvalidLifecycleTransitionException(
                    String.format("Cannot transition from terminal state '%s'. Work order %s is closed or cancelled.",
                            currentStatus, workOrder.getWorkOrderCode()));
        }

        // 2. Validate requested transition according to the state machine matrix
        validateTransitionMatrix(currentStatus, targetStatus, principal, workOrder);

        // 3. Update work order state & timestamps
        workOrder.setStatus(targetStatus);
        LocalDateTime now = LocalDateTime.now();

        if (targetStatus == WorkOrderStatus.COMPLETED) {
            workOrder.setCompletedAt(now);
        } else if (targetStatus == WorkOrderStatus.CLOSED) {
            workOrder.setClosedAt(now);
        } else if (targetStatus == WorkOrderStatus.CANCELLED) {
            workOrder.setCancelledAt(now);
            if (cancellationReason != null && !cancellationReason.isBlank()) {
                workOrder.setCancellationReason(cancellationReason);
            }
        }

        // 4. Create and persist immutable Status History entry
        WorkOrderStatusHistory history = WorkOrderStatusHistory.builder()
                .workOrder(workOrder)
                .fromStatus(currentStatus)
                .toStatus(targetStatus)
                .changedByUser(user)
                .note(note != null && !note.isBlank() ? note : "Status transitioned from " + currentStatus + " to " + targetStatus)
                .changedAt(now)
                .build();

        statusHistoryRepository.save(history);

        log.info("Work order [{}] lifecycle transition committed: {} -> {} by user [{}] (Role: {})",
                workOrder.getWorkOrderCode(), currentStatus, targetStatus, user.getEmail(), user.getRole());
    }

    private void validateTransitionMatrix(
            WorkOrderStatus from,
            WorkOrderStatus to,
            UserPrincipal principal,
            WorkOrder workOrder) {

        Role role = principal.getRole();
        Long userId = principal.getId();

        // Check assigned technician ownership for technician operations
        if (role == Role.ROLE_TECHNICIAN) {
            if (workOrder.getAssignedTechnician() == null || !workOrder.getAssignedTechnician().getId().equals(userId)) {
                throw new UnauthorizedAccessException("Technicians can only update status for work orders assigned to them.");
            }
        }

        switch (from) {
            case NEW -> {
                if (to == WorkOrderStatus.ASSIGNED) {
                    if (role != Role.ROLE_DISPATCHER && role != Role.ROLE_MANAGER) {
                        throw new UnauthorizedAccessException("Only dispatchers and managers can assign work orders.");
                    }
                } else if (to == WorkOrderStatus.CANCELLED) {
                    if (role == Role.ROLE_CUSTOMER) {
                        if (!workOrder.getCustomer().getId().equals(principal.getCustomerId())) {
                            throw new UnauthorizedAccessException("Customers can only cancel their own work orders.");
                        }
                    } else if (role != Role.ROLE_DISPATCHER && role != Role.ROLE_MANAGER) {
                        throw new UnauthorizedAccessException("Unauthorized to cancel this work order.");
                    }
                } else {
                    throw new InvalidLifecycleTransitionException(
                            String.format("Illegal transition: %s -> %s. A NEW work order can only be ASSIGNED or CANCELLED.", from, to));
                }
            }
            case ASSIGNED -> {
                if (to == WorkOrderStatus.IN_PROGRESS) {
                    if (role != Role.ROLE_TECHNICIAN && role != Role.ROLE_MANAGER) {
                        throw new UnauthorizedAccessException("Only the assigned technician or a manager can start work.");
                    }
                } else if (to == WorkOrderStatus.ASSIGNED) {
                    // Reassignment
                    if (role != Role.ROLE_DISPATCHER && role != Role.ROLE_MANAGER) {
                        throw new UnauthorizedAccessException("Only dispatchers and managers can reassign work orders.");
                    }
                } else if (to == WorkOrderStatus.CANCELLED) {
                    if (role != Role.ROLE_DISPATCHER && role != Role.ROLE_MANAGER) {
                        throw new UnauthorizedAccessException("Only dispatchers and managers can cancel an assigned work order.");
                    }
                } else {
                    throw new InvalidLifecycleTransitionException(
                            String.format("Illegal transition: %s -> %s. An ASSIGNED work order can only move to IN_PROGRESS or CANCELLED.", from, to));
                }
            }
            case IN_PROGRESS -> {
                if (to == WorkOrderStatus.ON_HOLD) {
                    if (role != Role.ROLE_TECHNICIAN && role != Role.ROLE_MANAGER) {
                        throw new UnauthorizedAccessException("Only the assigned technician or a manager can place a job on hold.");
                    }
                } else if (to == WorkOrderStatus.COMPLETED) {
                    if (role != Role.ROLE_TECHNICIAN && role != Role.ROLE_MANAGER) {
                        throw new UnauthorizedAccessException("Only the assigned technician or a manager can mark work as completed.");
                    }
                } else if (to == WorkOrderStatus.CANCELLED) {
                    if (role != Role.ROLE_DISPATCHER && role != Role.ROLE_MANAGER) {
                        throw new UnauthorizedAccessException("Only dispatchers and managers can cancel an in-progress work order.");
                    }
                } else {
                    throw new InvalidLifecycleTransitionException(
                            String.format("Illegal transition: %s -> %s. An IN_PROGRESS work order can only move to ON_HOLD, COMPLETED, or CANCELLED.", from, to));
                }
            }
            case ON_HOLD -> {
                if (to == WorkOrderStatus.IN_PROGRESS) {
                    if (role != Role.ROLE_TECHNICIAN && role != Role.ROLE_MANAGER) {
                        throw new UnauthorizedAccessException("Only the assigned technician or a manager can resume work.");
                    }
                } else if (to == WorkOrderStatus.CANCELLED) {
                    if (role != Role.ROLE_DISPATCHER && role != Role.ROLE_MANAGER) {
                        throw new UnauthorizedAccessException("Only dispatchers and managers can cancel a work order on hold.");
                    }
                } else {
                    throw new InvalidLifecycleTransitionException(
                            String.format("Illegal transition: %s -> %s. An ON_HOLD work order can only move to IN_PROGRESS or CANCELLED.", from, to));
                }
            }
            case COMPLETED -> {
                if (to == WorkOrderStatus.CLOSED) {
                    // Critical Business Rule: Only Manager/Admin can close completed work orders
                    if (role != Role.ROLE_MANAGER) {
                        throw new UnauthorizedAccessException("Only Managers/Admins are authorized to close completed work orders.");
                    }
                } else if (to == WorkOrderStatus.IN_PROGRESS) {
                    // Reopening for corrections
                    if (role != Role.ROLE_MANAGER) {
                        throw new UnauthorizedAccessException("Only Managers can reopen completed work orders.");
                    }
                } else {
                    throw new InvalidLifecycleTransitionException(
                            String.format("Illegal transition: %s -> %s. A COMPLETED work order can only be CLOSED or reopened to IN_PROGRESS.", from, to));
                }
            }
            case CLOSED, CANCELLED -> throw new InvalidLifecycleTransitionException(
                    String.format("Terminal state %s cannot be transitioned.", from));
        }
    }
}
