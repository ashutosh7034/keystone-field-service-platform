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
public class SiteResponseDto {
    private Long id;
    private Long customerId;
    private String customerName;
    private String name;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String contactPerson;
    private String contactPhone;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
