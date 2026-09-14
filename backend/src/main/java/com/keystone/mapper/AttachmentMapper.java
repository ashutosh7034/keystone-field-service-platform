package com.keystone.mapper;

import com.keystone.domain.WorkOrderAttachment;
import com.keystone.dto.AttachmentResponseDto;
import org.springframework.stereotype.Component;

@Component
public class AttachmentMapper {

    public AttachmentResponseDto toDto(WorkOrderAttachment attachment) {
        if (attachment == null) return null;
        return AttachmentResponseDto.builder()
                .id(attachment.getId())
                .workOrderId(attachment.getWorkOrder() != null ? attachment.getWorkOrder().getId() : null)
                .fileName(attachment.getFileName())
                .originalFileName(attachment.getOriginalFileName())
                .fileType(attachment.getFileType())
                .fileSize(attachment.getFileSize())
                .caption(attachment.getCaption())
                .uploadedByUserId(attachment.getUploadedByUser() != null ? attachment.getUploadedByUser().getId() : null)
                .uploadedByUserName(attachment.getUploadedByUser() != null ? attachment.getUploadedByUser().getFullName() : null)
                .downloadUrl("/api/attachments/" + attachment.getId() + "/download")
                .createdAt(attachment.getCreatedAt())
                .build();
    }
}
