package com.keystone.service;

import com.keystone.domain.*;
import com.keystone.dto.AttachmentResponseDto;
import com.keystone.exception.BadRequestException;
import com.keystone.exception.ResourceNotFoundException;
import com.keystone.exception.UnauthorizedAccessException;
import com.keystone.mapper.AttachmentMapper;
import com.keystone.repository.UserRepository;
import com.keystone.repository.WorkOrderAttachmentRepository;
import com.keystone.repository.WorkOrderRepository;
import com.keystone.security.UserPrincipal;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttachmentService {

    private final WorkOrderAttachmentRepository attachmentRepository;
    private final WorkOrderRepository workOrderRepository;
    private final UserRepository userRepository;
    private final AttachmentMapper attachmentMapper;

    @Value("${keystone.storage.upload-dir:uploads}")
    private String uploadDir;

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"
    );

    @PostConstruct
    public void init() {
        try {
            Path path = Paths.get(uploadDir);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
        } catch (IOException e) {
            log.error("Could not create upload directory", e);
        }
    }

    @Transactional
    public AttachmentResponseDto uploadAttachment(
            Long workOrderId,
            MultipartFile file,
            String caption,
            UserPrincipal currentUser) {

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid file type. Allowed types: JPEG, PNG, WEBP, GIF, PDF.");
        }

        WorkOrder workOrder = workOrderRepository.findByIdWithDetails(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found with ID: " + workOrderId));

        if (currentUser.getRole() == Role.ROLE_TECHNICIAN) {
            if (workOrder.getAssignedTechnician() == null || !workOrder.getAssignedTechnician().getId().equals(currentUser.getId())) {
                throw new UnauthorizedAccessException("Technicians can only upload attachments to assigned work orders.");
            }
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "attachment");
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex);
        }

        String storedFileName = UUID.randomUUID().toString() + extension;
        Path targetLocation = Paths.get(uploadDir).resolve(storedFileName);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Could not store file. Please try again.", e);
        }

        WorkOrderAttachment attachment = WorkOrderAttachment.builder()
                .workOrder(workOrder)
                .fileName(storedFileName)
                .originalFileName(originalFilename)
                .fileType(contentType)
                .fileSize(file.getSize())
                .storagePath(targetLocation.toString())
                .caption(caption)
                .uploadedByUser(user)
                .build();

        WorkOrderAttachment saved = attachmentRepository.save(attachment);
        log.info("Saved attachment [{}] for work order [{}] by user [{}]",
                saved.getId(), workOrder.getWorkOrderCode(), user.getEmail());

        return attachmentMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponseDto> getAttachmentsForWorkOrder(Long workOrderId) {
        return attachmentRepository.findByWorkOrderIdOrderByCreatedAtDesc(workOrderId).stream()
                .map(attachmentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Resource loadAttachmentAsResource(Long attachmentId, UserPrincipal currentUser) {
        WorkOrderAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with ID: " + attachmentId));

        WorkOrder workOrder = attachment.getWorkOrder();

        // Customer Isolation check
        if (currentUser.getRole() == Role.ROLE_CUSTOMER) {
            if (!workOrder.getCustomer().getId().equals(currentUser.getCustomerId())) {
                throw new UnauthorizedAccessException("Access denied to this attachment.");
            }
        }

        try {
            Path filePath = Paths.get(attachment.getStoragePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found on server disk.");
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File path is invalid.");
        }
    }

    @Transactional(readOnly = true)
    public WorkOrderAttachment getAttachmentMetadata(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with ID: " + attachmentId));
    }
}
