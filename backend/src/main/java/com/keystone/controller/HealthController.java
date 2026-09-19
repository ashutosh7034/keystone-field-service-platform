package com.keystone.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health", description = "Deployment verification & system health check endpoints")
public class HealthController {

    @GetMapping
    @Operation(summary = "System health check", description = "Returns operational status of the Keystone backend application")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Keystone Field Service Management Backend",
                "version", "1.0.0",
                "timestamp", LocalDateTime.now()
        ));
    }
}
