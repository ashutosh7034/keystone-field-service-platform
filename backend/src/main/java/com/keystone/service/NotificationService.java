package com.keystone.service;

import com.keystone.domain.Notification;
import com.keystone.domain.NotificationType;
import com.keystone.domain.User;
import com.keystone.domain.WorkOrder;
import com.keystone.dto.NotificationResponseDto;
import com.keystone.dto.PageResponse;
import com.keystone.exception.ResourceNotFoundException;
import com.keystone.mapper.NotificationMapper;
import com.keystone.repository.NotificationRepository;
import com.keystone.repository.UserRepository;
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
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Transactional
    public void sendNotification(User recipient, String title, String message, NotificationType type, WorkOrder workOrder) {
        if (recipient == null) return;

        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(title)
                .message(message)
                .type(type)
                .workOrder(workOrder)
                .read(false)
                .build();

        notificationRepository.save(notification);
        log.info("Sent {} notification to user ID {}: {}", type, recipient.getId(), title);
    }

    @Transactional
    public void notifyAllStaff(String title, String message, NotificationType type, WorkOrder workOrder) {
        List<User> staff = userRepository.findByRoleInAndActiveTrue(
                List.of(com.keystone.domain.Role.ROLE_MANAGER, com.keystone.domain.Role.ROLE_DISPATCHER)
        );
        for (User user : staff) {
            sendNotification(user, title, message, type, workOrder);
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponseDto> getUserNotifications(Long userId, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, pageable);
        return PageResponse.fromPage(page.map(notificationMapper::toDto));
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getRecentUserNotifications(Long userId) {
        return notificationRepository.findTop10ByRecipientIdOrderByCreatedAtDesc(userId).stream()
                .map(notificationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));

        if (notification.getRecipient().getId().equals(userId)) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }
}
