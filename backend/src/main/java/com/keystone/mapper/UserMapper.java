package com.keystone.mapper;

import com.keystone.domain.User;
import com.keystone.dto.UserResponseDto;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponseDto toDto(User user) {
        if (user == null) return null;
        return UserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .customerId(user.getCustomerId())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
