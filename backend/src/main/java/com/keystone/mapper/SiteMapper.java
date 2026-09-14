package com.keystone.mapper;

import com.keystone.domain.Customer;
import com.keystone.domain.Site;
import com.keystone.dto.SiteRequestDto;
import com.keystone.dto.SiteResponseDto;
import org.springframework.stereotype.Component;

@Component
public class SiteMapper {

    public SiteResponseDto toDto(Site site) {
        if (site == null) return null;
        return SiteResponseDto.builder()
                .id(site.getId())
                .customerId(site.getCustomer() != null ? site.getCustomer().getId() : null)
                .customerName(site.getCustomer() != null ? site.getCustomer().getName() : null)
                .name(site.getName())
                .address(site.getAddress())
                .city(site.getCity())
                .state(site.getState())
                .postalCode(site.getPostalCode())
                .contactPerson(site.getContactPerson())
                .contactPhone(site.getContactPhone())
                .active(site.isActive())
                .createdAt(site.getCreatedAt())
                .updatedAt(site.getUpdatedAt())
                .build();
    }

    public Site toEntity(SiteRequestDto dto, Customer customer) {
        if (dto == null) return null;
        return Site.builder()
                .customer(customer)
                .name(dto.getName())
                .address(dto.getAddress())
                .city(dto.getCity())
                .state(dto.getState())
                .postalCode(dto.getPostalCode())
                .contactPerson(dto.getContactPerson())
                .contactPhone(dto.getContactPhone())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();
    }

    public void updateEntityFromDto(SiteRequestDto dto, Site site) {
        site.setName(dto.getName());
        site.setAddress(dto.getAddress());
        site.setCity(dto.getCity());
        site.setState(dto.getState());
        site.setPostalCode(dto.getPostalCode());
        site.setContactPerson(dto.getContactPerson());
        site.setContactPhone(dto.getContactPhone());
        if (dto.getActive() != null) {
            site.setActive(dto.getActive());
        }
    }
}
