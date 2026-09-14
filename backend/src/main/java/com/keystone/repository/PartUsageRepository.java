package com.keystone.repository;

import com.keystone.domain.PartUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PartUsageRepository extends JpaRepository<PartUsage, Long> {

    List<PartUsage> findByWorkOrderIdOrderByCreatedAtAsc(Long workOrderId);

    @Query("SELECT COALESCE(SUM(pu.quantity * pu.unitCostAtUsage), 0) FROM PartUsage pu WHERE pu.workOrder.id = :workOrderId")
    BigDecimal calculateTotalPartsCostForWorkOrder(@Param("workOrderId") Long workOrderId);

    @Query("SELECT pu.part.id, pu.part.sku, pu.part.name, SUM(pu.quantity), SUM(pu.quantity * pu.unitCostAtUsage) " +
           "FROM PartUsage pu GROUP BY pu.part.id, pu.part.sku, pu.part.name ORDER BY SUM(pu.quantity) DESC")
    List<Object[]> getMostUsedParts();
}
