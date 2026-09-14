package com.keystone.service;

import com.keystone.domain.Customer;
import com.keystone.domain.CustomerStatus;
import com.keystone.domain.Role;
import com.keystone.dto.CustomerRequestDto;
import com.keystone.dto.CustomerResponseDto;
import com.keystone.dto.PageResponse;
import com.keystone.exception.ResourceNotFoundException;
import com.keystone.exception.UnauthorizedAccessException;
import com.keystone.mapper.CustomerMapper;
import com.keystone.repository.CustomerRepository;
import com.keystone.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    @Transactional(readOnly = true)
    public PageResponse<CustomerResponseDto> searchCustomers(String query, CustomerStatus status, Pageable pageable) {
        Page<Customer> page = customerRepository.searchCustomers(query, status, pageable);
        return PageResponse.fromPage(page.map(customerMapper::toDto));
    }

    @Transactional(readOnly = true)
    public List<CustomerResponseDto> getAllActiveCustomers() {
        return customerRepository.findByStatus(CustomerStatus.ACTIVE).stream()
                .map(customerMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomerResponseDto getCustomerById(Long id, UserPrincipal currentUser) {
        if (currentUser.getRole() == Role.ROLE_CUSTOMER && !id.equals(currentUser.getCustomerId())) {
            throw new UnauthorizedAccessException("You can only view your own organization's profile.");
        }

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));

        return customerMapper.toDto(customer);
    }

    @Transactional
    public CustomerResponseDto createCustomer(CustomerRequestDto dto) {
        Customer customer = customerMapper.toEntity(dto);
        Customer saved = customerRepository.save(customer);
        return customerMapper.toDto(saved);
    }

    @Transactional
    public CustomerResponseDto updateCustomer(Long id, CustomerRequestDto dto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));

        customerMapper.updateEntityFromDto(dto, customer);
        Customer updated = customerRepository.save(customer);
        return customerMapper.toDto(updated);
    }
}
