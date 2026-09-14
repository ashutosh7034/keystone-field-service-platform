package com.keystone.service;

import com.keystone.domain.*;
import com.keystone.dto.LogPartUsageRequestDto;
import com.keystone.dto.PartUsageResponseDto;
import com.keystone.exception.InsufficientStockException;
import com.keystone.repository.*;
import com.keystone.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class PartUsageTransactionTest {

    @Autowired
    private PartUsageService partUsageService;

    @Autowired
    private PartRepository partRepository;

    @Autowired
    private PartUsageRepository partUsageRepository;

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SiteRepository siteRepository;

    private User technician;
    private Part part;
    private WorkOrder workOrder;

    @BeforeEach
    void setUp() {
        technician = userRepository.save(User.builder()
                .email("tech@test.com")
                .passwordHash("hash")
                .fullName("Alex Tech")
                .role(Role.ROLE_TECHNICIAN)
                .active(true)
                .build());

        Customer customer = customerRepository.save(Customer.builder()
                .name("Acme Corp")
                .email("acme@test.com")
                .phone("123")
                .status(CustomerStatus.ACTIVE)
                .build());

        Site site = siteRepository.save(Site.builder()
                .customer(customer)
                .name("HQ")
                .address("Street 1")
                .city("Metro")
                .state("NY")
                .postalCode("10001")
                .active(true)
                .build());

        part = partRepository.save(Part.builder()
                .sku("TEST-VALVE-01")
                .name("2-Inch Brass Valve")
                .category("PLUMBING")
                .unitCost(BigDecimal.valueOf(50.00))
                .stockQuantity(10)
                .leadTimeDays(2)
                .active(true)
                .build());

        workOrder = workOrderRepository.save(WorkOrder.builder()
                .workOrderCode("WO-2026-TEST02")
                .title("Pipe Leak")
                .description("Leak in basement")
                .priority(Priority.MEDIUM)
                .status(WorkOrderStatus.IN_PROGRESS)
                .customer(customer)
                .site(site)
                .assignedTechnician(technician)
                .createdByUser(technician)
                .slaDueDate(LocalDateTime.now().plusHours(24))
                .slaStatus(SlaStatus.ON_TRACK)
                .build());
    }

    @Test
    @DisplayName("Should decrement stock quantity and record part usage successfully")
    void shouldLogPartUsageAndDecrementStock() {
        UserPrincipal principal = UserPrincipal.create(technician);

        LogPartUsageRequestDto request = LogPartUsageRequestDto.builder()
                .partId(part.getId())
                .quantity(3)
                .build();

        PartUsageResponseDto response = partUsageService.logPartUsage(workOrder.getId(), request, principal);

        assertNotNull(response);
        assertEquals(3, response.getQuantity());
        assertEquals(0, new BigDecimal("50.00").compareTo(response.getUnitCostAtUsage()));
        assertEquals(0, new BigDecimal("150.00").compareTo(response.getTotalCost()));

        // Verify database stock decrement
        Part updatedPart = partRepository.findById(part.getId()).orElseThrow();
        assertEquals(7, updatedPart.getStockQuantity());
    }

    @Test
    @DisplayName("Should reject part logging when requested quantity exceeds stock (Stock cannot become negative)")
    void shouldRejectWhenQuantityExceedsStock() {
        UserPrincipal principal = UserPrincipal.create(technician);

        LogPartUsageRequestDto request = LogPartUsageRequestDto.builder()
                .partId(part.getId())
                .quantity(15) // available is 10
                .build();

        assertThrows(InsufficientStockException.class, () ->
                partUsageService.logPartUsage(workOrder.getId(), request, principal));

        // Ensure stock was not changed
        Part untouchedPart = partRepository.findById(part.getId()).orElseThrow();
        assertEquals(10, untouchedPart.getStockQuantity());
    }
}
