package com.keystone.mapper;

import com.keystone.domain.Notification;
import com.keystone.dto.NotificationResponseDto;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationResponseDto toDto(Notification notification) {
        if (notification == null) return null;
        return NotificationResponseDto.builder()
                .id(notification.getId())
                .recipientId(notification.getRecipient() != null ? notification.getRecipient().getId() : null)
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .read(notification.isRead())
                .workOrderId(notification.getWorkOrder() != null ? notification.getWorkOrder().getId() : null)
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
