package com.keystone.service;

import com.keystone.domain.Customer;
import com.keystone.domain.Role;
import com.keystone.domain.Site;
import com.keystone.dto.PageResponse;
import com.keystone.dto.SiteRequestDto;
import com.keystone.dto.SiteResponseDto;
import com.keystone.exception.ResourceNotFoundException;
import com.keystone.exception.UnauthorizedAccessException;
import com.keystone.mapper.SiteMapper;
import com.keystone.repository.CustomerRepository;
import com.keystone.repository.SiteRepository;
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
public class SiteService {

    private final SiteRepository siteRepository;
    private final CustomerRepository customerRepository;
    private final SiteMapper siteMapper;

    @Transactional(readOnly = true)
    public PageResponse<SiteResponseDto> searchSites(Long customerId, String query, Boolean active, Pageable pageable, UserPrincipal currentUser) {
        if (currentUser.getRole() == Role.ROLE_CUSTOMER) {
            customerId = currentUser.getCustomerId();
        }

        Page<Site> page = siteRepository.searchSites(customerId, query, active, pageable);
        return PageResponse.fromPage(page.map(siteMapper::toDto));
    }

    @Transactional(readOnly = true)
    public List<SiteResponseDto> getSitesForCustomer(Long customerId, UserPrincipal currentUser) {
        if (currentUser.getRole() == Role.ROLE_CUSTOMER && !customerId.equals(currentUser.getCustomerId())) {
            throw new UnauthorizedAccessException("You can only view sites belonging to your organization.");
        }

        return siteRepository.findByCustomerIdAndActiveTrue(customerId).stream()
                .map(siteMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SiteResponseDto getSiteById(Long id, UserPrincipal currentUser) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Site not found with ID: " + id));

        if (currentUser.getRole() == Role.ROLE_CUSTOMER && !site.getCustomer().getId().equals(currentUser.getCustomerId())) {
            throw new UnauthorizedAccessException("You can only view sites belonging to your organization.");
        }

        return siteMapper.toDto(site);
    }

    @Transactional
    public SiteResponseDto createSite(SiteRequestDto dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + dto.getCustomerId()));

        Site site = siteMapper.toEntity(dto, customer);
        Site saved = siteRepository.save(site);
        return siteMapper.toDto(saved);
    }

    @Transactional
    public SiteResponseDto updateSite(Long id, SiteRequestDto dto) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Site not found with ID: " + id));

        siteMapper.updateEntityFromDto(dto, site);
        Site updated = siteRepository.save(site);
        return siteMapper.toDto(updated);
    }
}
