package com.keystone.dto;

import com.keystone.domain.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private Role role;
    private Long customerId;
    private String customerName;
    private boolean active;
    private LocalDateTime createdAt;
}
