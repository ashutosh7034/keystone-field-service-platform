package com.keystone.service;

import com.keystone.domain.*;
import com.keystone.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlaService {

    private final WorkOrderRepository workOrderRepository;
    private final NotificationService notificationService;

    @Value("${keystone.sla.emergency-hours:4}")
    private int emergencyHours;

    @Value("${keystone.sla.high-hours:12}")
    private int highHours;

    @Value("${keystone.sla.medium-hours:24}")
    private int mediumHours;

    @Value("${keystone.sla.low-hours:48}")
    private int lowHours;

    @Value("${keystone.sla.at-risk-warning-hours:2}")
    private int atRiskWarningHours;

    public LocalDateTime calculateSlaDueDate(Priority priority, LocalDateTime referenceTime) {
        LocalDateTime baseTime = referenceTime != null ? referenceTime : LocalDateTime.now();
        int hoursToAdd = switch (priority) {
            case EMERGENCY -> emergencyHours;
            case HIGH -> highHours;
            case MEDIUM -> mediumHours;
            case LOW -> lowHours;
        };
        return baseTime.plusHours(hoursToAdd);
    }

    public SlaStatus evaluateSlaStatus(LocalDateTime slaDueDate, LocalDateTime now) {
        if (slaDueDate == null) return SlaStatus.ON_TRACK;
        if (now.isAfter(slaDueDate)) {
            return SlaStatus.BREACHED;
        }
        long minutesRemaining = ChronoUnit.MINUTES.between(now, slaDueDate);
        if (minutesRemaining <= (atRiskWarningHours * 60L)) {
            return SlaStatus.AT_RISK;
        }
        return SlaStatus.ON_TRACK;
    }

    @Scheduled(fixedRateString = "${keystone.sla.check-rate-ms:60000}")
    @Transactional
    public void processSlaMonitoring() {
        LocalDateTime now = LocalDateTime.now();
        List<WorkOrder> openOrders = workOrderRepository.findOpenWorkOrdersForSlaCheck();

        for (WorkOrder wo : openOrders) {
            SlaStatus evaluated = evaluateSlaStatus(wo.getSlaDueDate(), now);

            if (evaluated != wo.getSlaStatus()) {
                SlaStatus oldStatus = wo.getSlaStatus();
                wo.setSlaStatus(evaluated);
                workOrderRepository.save(wo);

                log.warn("SLA status for WO [{}] updated from {} to {}", wo.getWorkOrderCode(), oldStatus, evaluated);

                if (evaluated == SlaStatus.BREACHED && oldStatus != SlaStatus.BREACHED) {
                    notificationService.notifyAllStaff(
                            "SLA Breached: " + wo.getWorkOrderCode(),
                            "Work order '" + wo.getTitle() + "' at site " + wo.getSite().getName() + " has breached its SLA deadline.",
                            NotificationType.SLA_BREACH,
                            wo
                    );
                    if (wo.getAssignedTechnician() != null) {
                        notificationService.sendNotification(
                                wo.getAssignedTechnician(),
                                "SLA Breached: " + wo.getWorkOrderCode(),
                                "Your assigned job '" + wo.getTitle() + "' has exceeded its resolution SLA target.",
                                NotificationType.SLA_BREACH,
                                wo
                        );
                    }
                } else if (evaluated == SlaStatus.AT_RISK && oldStatus == SlaStatus.ON_TRACK) {
                    notificationService.notifyAllStaff(
                            "SLA At Risk: " + wo.getWorkOrderCode(),
                            "Work order '" + wo.getTitle() + "' is approaching SLA deadline within 2 hours.",
                            NotificationType.SLA_AT_RISK,
                            wo
                    );
                    if (wo.getAssignedTechnician() != null) {
                        notificationService.sendNotification(
                                wo.getAssignedTechnician(),
                                "SLA At Risk: " + wo.getWorkOrderCode(),
                                "Your assigned job '" + wo.getTitle() + "' has less than 2 hours remaining before SLA breach.",
                                NotificationType.SLA_AT_RISK,
                                wo
                        );
                    }
                }
            }
        }
    }
}
