package com.keystone.service;

import com.keystone.domain.Priority;
import com.keystone.domain.SlaStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@ActiveProfiles("test")
public class SlaServiceTest {

    @Autowired
    private SlaService slaService;

    @Test
    @DisplayName("Should correctly calculate SLA due date by priority (Emergency: 4h, High: 12h, Medium: 24h, Low: 48h)")
    void shouldCalculateSlaDueDateByPriority() {
        LocalDateTime base = LocalDateTime.of(2026, 9, 14, 10, 0, 0);

        LocalDateTime emergencyDue = slaService.calculateSlaDueDate(Priority.EMERGENCY, base);
        assertEquals(base.plusHours(4), emergencyDue);

        LocalDateTime highDue = slaService.calculateSlaDueDate(Priority.HIGH, base);
        assertEquals(base.plusHours(12), highDue);

        LocalDateTime mediumDue = slaService.calculateSlaDueDate(Priority.MEDIUM, base);
        assertEquals(base.plusHours(24), mediumDue);

        LocalDateTime lowDue = slaService.calculateSlaDueDate(Priority.LOW, base);
        assertEquals(base.plusHours(48), lowDue);
    }

    @Test
    @DisplayName("Should correctly evaluate SLA status (ON_TRACK, AT_RISK, BREACHED)")
    void shouldEvaluateSlaStatus() {
        LocalDateTime now = LocalDateTime.now();

        // 1. More than 2 hours remaining -> ON_TRACK
        LocalDateTime futureDue = now.plusHours(5);
        assertEquals(SlaStatus.ON_TRACK, slaService.evaluateSlaStatus(futureDue, now));

        // 2. Less than 2 hours remaining -> AT_RISK
        LocalDateTime atRiskDue = now.plusMinutes(90);
        assertEquals(SlaStatus.AT_RISK, slaService.evaluateSlaStatus(atRiskDue, now));

        // 3. Past due date -> BREACHED
        LocalDateTime pastDue = now.minusMinutes(10);
        assertEquals(SlaStatus.BREACHED, slaService.evaluateSlaStatus(pastDue, now));
    }
}
