package com.keystone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentResponseDto {
    private Long id;
    private Long workOrderId;
    private String fileName;
    private String originalFileName;
    private String fileType;
    private Long fileSize;
    private String caption;
    private Long uploadedByUserId;
    private String uploadedByUserName;
    private String downloadUrl;
    private LocalDateTime createdAt;
}
