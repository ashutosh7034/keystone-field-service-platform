package com.keystone.controller;

import com.keystone.dto.PageResponse;
import com.keystone.dto.SiteRequestDto;
import com.keystone.dto.SiteResponseDto;
import com.keystone.security.UserPrincipal;
import com.keystone.service.SiteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
@Tag(name = "Sites", description = "Customer site and facility management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class SiteController {

    private final SiteService siteService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Search and paginate sites")
    public ResponseEntity<PageResponse<SiteResponseDto>> searchSites(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Sort sort = sortDirection.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(siteService.searchSites(customerId, query, active, pageable, currentUser));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get all active sites for a given customer")
    public ResponseEntity<List<SiteResponseDto>> getSitesForCustomer(
            @PathVariable Long customerId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(siteService.getSitesForCustomer(customerId, currentUser));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get site details by ID")
    public ResponseEntity<SiteResponseDto> getSiteById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(siteService.getSiteById(id, currentUser));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @Operation(summary = "Create a new facility site for a customer")
    public ResponseEntity<SiteResponseDto> createSite(@Valid @RequestBody SiteRequestDto dto) {
        SiteResponseDto response = siteService.createSite(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @Operation(summary = "Update facility site details")
    public ResponseEntity<SiteResponseDto> updateSite(
            @PathVariable Long id,
            @Valid @RequestBody SiteRequestDto dto) {
        return ResponseEntity.ok(siteService.updateSite(id, dto));
    }
}
