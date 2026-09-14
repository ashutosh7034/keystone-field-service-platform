package com.keystone.service;

import com.keystone.domain.*;
import com.keystone.exception.InvalidLifecycleTransitionException;
import com.keystone.exception.UnauthorizedAccessException;
import com.keystone.repository.*;
import com.keystone.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class WorkOrderLifecycleTest {

    @Autowired
    private WorkOrderLifecycleStateMachine stateMachine;

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SiteRepository siteRepository;

    @Autowired
    private WorkOrderStatusHistoryRepository historyRepository;

    private User manager;
    private User dispatcher;
    private User technician;
    private User otherTechnician;
    private Customer customer;
    private Site site;
    private WorkOrder workOrder;

    @BeforeEach
    void setUp() {
        manager = userRepository.save(User.builder()
                .email("mgr@test.com")
                .passwordHash("hash")
                .fullName("Manager One")
                .role(Role.ROLE_MANAGER)
                .active(true)
                .build());

        dispatcher = userRepository.save(User.builder()
                .email("disp@test.com")
                .passwordHash("hash")
                .fullName("Dispatcher One")
                .role(Role.ROLE_DISPATCHER)
                .active(true)
                .build());

        technician = userRepository.save(User.builder()
                .email("tech1@test.com")
                .passwordHash("hash")
                .fullName("Technician Alex")
                .role(Role.ROLE_TECHNICIAN)
                .active(true)
                .build());

        otherTechnician = userRepository.save(User.builder()
                .email("tech2@test.com")
                .passwordHash("hash")
                .fullName("Technician Sarah")
                .role(Role.ROLE_TECHNICIAN)
                .active(true)
                .build());

        customer = customerRepository.save(Customer.builder()
                .name("Acme Corp")
                .email("contact@acme.com")
                .phone("123456")
                .status(CustomerStatus.ACTIVE)
                .build());

        site = siteRepository.save(Site.builder()
                .customer(customer)
                .name("Acme HQ")
                .address("123 Main St")
                .city("Metro")
                .state("NY")
                .postalCode("10001")
                .active(true)
                .build());

        workOrder = workOrderRepository.save(WorkOrder.builder()
                .workOrderCode("WO-2026-TEST01")
                .title("AC Repair")
                .description("AC unit broken")
                .priority(Priority.HIGH)
                .status(WorkOrderStatus.NEW)
                .customer(customer)
                .site(site)
                .createdByUser(dispatcher)
                .slaDueDate(LocalDateTime.now().plusHours(12))
                .slaStatus(SlaStatus.ON_TRACK)
                .build());
    }

    @Test
    @DisplayName("Complete valid lifecycle path: NEW -> ASSIGNED -> IN_PROGRESS -> ON_HOLD -> IN_PROGRESS -> COMPLETED -> CLOSED")
    void shouldExecuteFullValidLifecycle() {
        UserPrincipal dispatcherPrincipal = UserPrincipal.create(dispatcher);
        UserPrincipal techPrincipal = UserPrincipal.create(technician);
        UserPrincipal managerPrincipal = UserPrincipal.create(manager);

        // 1. Assign technician: NEW -> ASSIGNED
        workOrder.setAssignedTechnician(technician);
        stateMachine.validateAndExecuteTransition(
                workOrder, WorkOrderStatus.ASSIGNED, dispatcher, dispatcherPrincipal, "Assigned to Alex", null);
        assertEquals(WorkOrderStatus.ASSIGNED, workOrder.getStatus());

        // 2. Tech starts work: ASSIGNED -> IN_PROGRESS
        stateMachine.validateAndExecuteTransition(
                workOrder, WorkOrderStatus.IN_PROGRESS, technician, techPrincipal, "Started diagnostic", null);
        assertEquals(WorkOrderStatus.IN_PROGRESS, workOrder.getStatus());

        // 3. Tech puts on hold: IN_PROGRESS -> ON_HOLD
        stateMachine.validateAndExecuteTransition(
                workOrder, WorkOrderStatus.ON_HOLD, technician, techPrincipal, "Waiting for part", null);
        assertEquals(WorkOrderStatus.ON_HOLD, workOrder.getStatus());

        // 4. Tech resumes work: ON_HOLD -> IN_PROGRESS
        stateMachine.validateAndExecuteTransition(
                workOrder, WorkOrderStatus.IN_PROGRESS, technician, techPrincipal, "Part arrived, resumed", null);
        assertEquals(WorkOrderStatus.IN_PROGRESS, workOrder.getStatus());

        // 5. Tech completes work: IN_PROGRESS -> COMPLETED
        stateMachine.validateAndExecuteTransition(
                workOrder, WorkOrderStatus.COMPLETED, technician, techPrincipal, "Fixed and tested", null);
        assertEquals(WorkOrderStatus.COMPLETED, workOrder.getStatus());
        assertNotNull(workOrder.getCompletedAt());

        // 6. Manager closes job: COMPLETED -> CLOSED
        stateMachine.validateAndExecuteTransition(
                workOrder, WorkOrderStatus.CLOSED, manager, managerPrincipal, "Inspection approved", null);
        assertEquals(WorkOrderStatus.CLOSED, workOrder.getStatus());
        assertNotNull(workOrder.getClosedAt());

        // Verify immutable history count
        var histories = historyRepository.findByWorkOrderIdOrderByChangedAtAsc(workOrder.getId());
        assertEquals(6, histories.size());
    }

    @Test
    @DisplayName("Illegal transition directly from NEW to CLOSED should be rejected with 409 Conflict")
    void shouldRejectDirectNewToClosed() {
        UserPrincipal managerPrincipal = UserPrincipal.create(manager);

        assertThrows(InvalidLifecycleTransitionException.class, () ->
                stateMachine.validateAndExecuteTransition(
                        workOrder, WorkOrderStatus.CLOSED, manager, managerPrincipal, "Trying to close directly", null));
    }

    @Test
    @DisplayName("Illegal transition directly from ASSIGNED to CLOSED should be rejected")
    void shouldRejectDirectAssignedToClosed() {
        workOrder.setStatus(WorkOrderStatus.ASSIGNED);
        workOrder.setAssignedTechnician(technician);
        UserPrincipal managerPrincipal = UserPrincipal.create(manager);

        assertThrows(InvalidLifecycleTransitionException.class, () ->
                stateMachine.validateAndExecuteTransition(
                        workOrder, WorkOrderStatus.CLOSED, manager, managerPrincipal, "Illegal close", null));
    }

    @Test
    @DisplayName("Technician cannot close a COMPLETED work order (Rule 5 & 6)")
    void shouldPreventTechnicianFromClosingWorkOrder() {
        workOrder.setStatus(WorkOrderStatus.COMPLETED);
        workOrder.setAssignedTechnician(technician);
        UserPrincipal techPrincipal = UserPrincipal.create(technician);

        assertThrows(UnauthorizedAccessException.class, () ->
                stateMachine.validateAndExecuteTransition(
                        workOrder, WorkOrderStatus.CLOSED, technician, techPrincipal, "Tech trying to close", null));
    }

    @Test
    @DisplayName("Technician cannot operate on another technician's assigned work order")
    void shouldPreventUnauthorizedTechnicianFromTransitioning() {
        workOrder.setStatus(WorkOrderStatus.ASSIGNED);
        workOrder.setAssignedTechnician(technician);
        UserPrincipal otherTechPrincipal = UserPrincipal.create(otherTechnician);

        assertThrows(UnauthorizedAccessException.class, () ->
                stateMachine.validateAndExecuteTransition(
                        workOrder, WorkOrderStatus.IN_PROGRESS, otherTechnician, otherTechPrincipal, "Unauthorized start", null));
    }

    @Test
    @DisplayName("Closed work order is terminal and cannot transition to any other status")
    void shouldPreventTransitionFromTerminalClosedState() {
        workOrder.setStatus(WorkOrderStatus.CLOSED);
        UserPrincipal managerPrincipal = UserPrincipal.create(manager);

        assertThrows(InvalidLifecycleTransitionException.class, () ->
                stateMachine.validateAndExecuteTransition(
                        workOrder, WorkOrderStatus.IN_PROGRESS, manager, managerPrincipal, "Try reopen closed", null));
    }

    @Test
    @DisplayName("Cancelled work order is terminal and cannot transition to any other status")
    void shouldPreventTransitionFromTerminalCancelledState() {
        workOrder.setStatus(WorkOrderStatus.CANCELLED);
        UserPrincipal managerPrincipal = UserPrincipal.create(manager);

        assertThrows(InvalidLifecycleTransitionException.class, () ->
                stateMachine.validateAndExecuteTransition(
                        workOrder, WorkOrderStatus.ASSIGNED, manager, managerPrincipal, "Try assign cancelled", null));
    }
}
