package com.keystone.mapper;

import com.keystone.domain.Customer;
import com.keystone.dto.CustomerRequestDto;
import com.keystone.dto.CustomerResponseDto;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    public CustomerResponseDto toDto(Customer customer) {
        if (customer == null) return null;
        return CustomerResponseDto.builder()
                .id(customer.getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .city(customer.getCity())
                .state(customer.getState())
                .postalCode(customer.getPostalCode())
                .status(customer.getStatus())
                .sitesCount(customer.getSites() != null ? customer.getSites().size() : 0)
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }

    public Customer toEntity(CustomerRequestDto dto) {
        if (dto == null) return null;
        return Customer.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .city(dto.getCity())
                .state(dto.getState())
                .postalCode(dto.getPostalCode())
                .status(dto.getStatus() != null ? dto.getStatus() : com.keystone.domain.CustomerStatus.ACTIVE)
                .build();
    }

    public void updateEntityFromDto(CustomerRequestDto dto, Customer customer) {
        customer.setName(dto.getName());
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setAddress(dto.getAddress());
        customer.setCity(dto.getCity());
        customer.setState(dto.getState());
        customer.setPostalCode(dto.getPostalCode());
        if (dto.getStatus() != null) {
            customer.setStatus(dto.getStatus());
        }
    }
}
