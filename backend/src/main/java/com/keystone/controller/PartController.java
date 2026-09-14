package com.keystone.controller;

import com.keystone.dto.PageResponse;
import com.keystone.dto.PartRequestDto;
import com.keystone.dto.PartResponseDto;
import com.keystone.service.PartUsageService;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parts")
@RequiredArgsConstructor
@Tag(name = "Parts & Inventory", description = "Parts inventory catalog, stock tracking, and pricing")
@SecurityRequirement(name = "bearerAuth")
public class PartController {

    private final PartUsageService partUsageService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Search and paginate parts catalog")
    public ResponseEntity<PageResponse<PartResponseDto>> searchParts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {

        Sort sort = sortDirection.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(partUsageService.searchParts(query, category, active, pageable));
    }

    @GetMapping("/active")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get list of all active parts for technician selection")
    public ResponseEntity<List<PartResponseDto>> getActiveParts() {
        return ResponseEntity.ok(partUsageService.getAllActiveParts());
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Get low stock inventory items (<= 5 units)")
    public ResponseEntity<List<PartResponseDto>> getLowStockParts() {
        return ResponseEntity.ok(partUsageService.getLowStockParts());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get part details by ID")
    public ResponseEntity<PartResponseDto> getPartById(@PathVariable Long id) {
        return ResponseEntity.ok(partUsageService.getPartById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Create a new inventory part (Manager only)")
    public ResponseEntity<PartResponseDto> createPart(@Valid @RequestBody PartRequestDto dto) {
        PartResponseDto response = partUsageService.createPart(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Update inventory part details and stock (Manager only)")
    public ResponseEntity<PartResponseDto> updatePart(
            @PathVariable Long id,
            @Valid @RequestBody PartRequestDto dto) {
        return ResponseEntity.ok(partUsageService.updatePart(id, dto));
    }
}
