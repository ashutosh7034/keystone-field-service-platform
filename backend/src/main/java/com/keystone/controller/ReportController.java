package com.keystone.controller;

import com.keystone.dto.ReportSummaryDto;
import com.keystone.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Performance reports, SLA compliance analytics, parts consumption, and labour hours")
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Get management performance and operational report summary")
    public ResponseEntity<ReportSummaryDto> getReportSummary() {
        return ResponseEntity.ok(reportService.getReportSummary());
    }
}
