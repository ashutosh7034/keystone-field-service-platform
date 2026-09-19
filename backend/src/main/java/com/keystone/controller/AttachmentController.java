package com.keystone.controller;

import com.keystone.domain.WorkOrderAttachment;
import com.keystone.dto.AttachmentResponseDto;
import com.keystone.security.UserPrincipal;
import com.keystone.service.AttachmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin
@Tag(name = "Attachments", description = "Job photos and file attachment uploads")
@SecurityRequirement(name = "bearerAuth")
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping(value = "/work-orders/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload job photo or attachment for a work order")
    public ResponseEntity<AttachmentResponseDto> uploadAttachment(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        AttachmentResponseDto response = attachmentService.uploadAttachment(id, file, caption, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/work-orders/{id}/attachments")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get list of attachments for a work order")
    public ResponseEntity<List<AttachmentResponseDto>> getWorkOrderAttachments(@PathVariable Long id) {
        return ResponseEntity.ok(attachmentService.getAttachmentsForWorkOrder(id));
    }

    @GetMapping("/attachments/{id}/download")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Download or view attachment file")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Resource resource = attachmentService.loadAttachmentAsResource(id, currentUser);
        WorkOrderAttachment metadata = attachmentService.getAttachmentMetadata(id);

        String contentType = metadata.getFileType();
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + metadata.getOriginalFileName() + "\"")
                .body(resource);
    }
}
