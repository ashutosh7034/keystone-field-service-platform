package com.keystone.service;

import com.keystone.domain.*;
import com.keystone.dto.CustomerCreateRequestDto;
import com.keystone.dto.CustomerWorkOrderDetailDto;
import com.keystone.exception.UnauthorizedAccessException;
import com.keystone.repository.CustomerRepository;
import com.keystone.repository.SiteRepository;
import com.keystone.repository.UserRepository;
import com.keystone.repository.WorkOrderRepository;
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
public class CustomerIsolationTest {

    @Autowired
    private WorkOrderService workOrderService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SiteRepository siteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkOrderRepository workOrderRepository;

    private Customer customer1;
    private Customer customer2;
    private Site site1;
    private Site site2;
    private User customer1User;
    private User customer2User;
    private WorkOrder workOrderCustomer1;

    @BeforeEach
    void setUp() {
        customer1 = customerRepository.save(Customer.builder()
                .name("Customer One Corp")
                .email("c1@test.com")
                .phone("111")
                .status(CustomerStatus.ACTIVE)
                .build());

        customer2 = customerRepository.save(Customer.builder()
                .name("Customer Two Corp")
                .email("c2@test.com")
                .phone("222")
                .status(CustomerStatus.ACTIVE)
                .build());

        site1 = siteRepository.save(Site.builder()
                .customer(customer1)
                .name("Site 1")
                .address("Avenue 1")
                .city("City A")
                .state("ST")
                .postalCode("12345")
                .active(true)
                .build());

        site2 = siteRepository.save(Site.builder()
                .customer(customer2)
                .name("Site 2")
                .address("Avenue 2")
                .city("City B")
                .state("ST")
                .postalCode("67890")
                .active(true)
                .build());

        customer1User = userRepository.save(User.builder()
                .email("user1@customer1.com")
                .passwordHash("hash")
                .fullName("Alice Customer 1")
                .role(Role.ROLE_CUSTOMER)
                .customerId(customer1.getId())
                .active(true)
                .build());

        customer2User = userRepository.save(User.builder()
                .email("user2@customer2.com")
                .passwordHash("hash")
                .fullName("Bob Customer 2")
                .role(Role.ROLE_CUSTOMER)
                .customerId(customer2.getId())
                .active(true)
                .build());

        workOrderCustomer1 = workOrderRepository.save(WorkOrder.builder()
                .workOrderCode("WO-2026-CUST01")
                .title("Elevator Service")
                .description("Elevator maintenance")
                .priority(Priority.MEDIUM)
                .status(WorkOrderStatus.NEW)
                .customer(customer1)
                .site(site1)
                .createdByUser(customer1User)
                .slaDueDate(LocalDateTime.now().plusHours(24))
                .slaStatus(SlaStatus.ON_TRACK)
                .build());
    }

    @Test
    @DisplayName("Customer 1 can view their own work order in sanitized customer DTO format")
    void shouldAllowCustomerToViewOwnWorkOrder() {
        UserPrincipal principal = UserPrincipal.create(customer1User);

        Object response = workOrderService.getWorkOrderByIdForRole(workOrderCustomer1.getId(), principal);

        assertTrue(response instanceof CustomerWorkOrderDetailDto);
        CustomerWorkOrderDetailDto detail = (CustomerWorkOrderDetailDto) response;
        assertEquals("WO-2026-CUST01", detail.getWorkOrderCode());
        assertEquals("Elevator Service", detail.getTitle());
        assertNotNull(detail.getAttachments());
    }

    @Test
    @DisplayName("Customer 2 cannot view Customer 1's work order (Strict Tenant Isolation)")
    void shouldRejectCustomerViewingOtherCustomerWorkOrder() {
        UserPrincipal principal2 = UserPrincipal.create(customer2User);

        assertThrows(UnauthorizedAccessException.class, () ->
                workOrderService.getWorkOrderByIdForRole(workOrderCustomer1.getId(), principal2));
    }

    @Test
    @DisplayName("Customer 1 cannot create service request for Customer 2's site")
    void shouldRejectCustomerCreatingRequestForOtherCustomerSite() {
        UserPrincipal principal = UserPrincipal.create(customer1User);

        CustomerCreateRequestDto request = CustomerCreateRequestDto.builder()
                .title("Illegitimate Request")
                .description("Trying to request service for site 2")
                .priority(Priority.HIGH)
                .siteId(site2.getId()) // Belongs to customer 2!
                .build();

        assertThrows(UnauthorizedAccessException.class, () ->
                workOrderService.createCustomerRequest(request, principal));
    }
}
