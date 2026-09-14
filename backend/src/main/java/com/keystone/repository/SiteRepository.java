package com.keystone.repository;

import com.keystone.domain.Site;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SiteRepository extends JpaRepository<Site, Long> {
    List<Site> findByCustomerIdAndActiveTrue(Long customerId);
    List<Site> findByCustomerId(Long customerId);

    @Query("SELECT s FROM Site s WHERE " +
           "(:customerId IS NULL OR s.customer.id = :customerId) AND " +
           "(:query IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.city) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:active IS NULL OR s.active = :active)")
    Page<Site> searchSites(@Param("customerId") Long customerId, @Param("query") String query, @Param("active") Boolean active, Pageable pageable);
}
