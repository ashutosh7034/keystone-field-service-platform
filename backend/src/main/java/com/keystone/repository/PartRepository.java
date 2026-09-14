package com.keystone.repository;

import com.keystone.domain.Part;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartRepository extends JpaRepository<Part, Long> {

    Optional<Part> findBySku(String sku);
    boolean existsBySku(String sku);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Part p WHERE p.id = :id")
    Optional<Part> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT p FROM Part p WHERE " +
           "(:query IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:category IS NULL OR p.category = :category) AND " +
           "(:active IS NULL OR p.active = :active)")
    Page<Part> searchParts(@Param("query") String query, @Param("category") String category, @Param("active") Boolean active, Pageable pageable);

    List<Part> findByActiveTrueOrderByCategoryAscNameAsc();

    @Query("SELECT p FROM Part p WHERE p.active = true AND p.stockQuantity <= 5")
    List<Part> findLowStockParts();
}
