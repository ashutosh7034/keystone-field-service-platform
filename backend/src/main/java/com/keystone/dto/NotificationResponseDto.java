package com.keystone.dto;

import com.keystone.domain.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDto {
    private Long id;
    private Long recipientId;
    private String title;
    private String message;
    private NotificationType type;
    private boolean read;
    private Long workOrderId;
    private LocalDateTime createdAt;
}
