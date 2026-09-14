package com.keystone.repository;

import com.keystone.domain.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

    Optional<WorkOrder> findByWorkOrderCode(String workOrderCode);

    @Query("SELECT wo FROM WorkOrder wo " +
           "LEFT JOIN FETCH wo.customer c " +
           "LEFT JOIN FETCH wo.site s " +
           "LEFT JOIN FETCH wo.assignedTechnician t " +
           "WHERE wo.id = :id")
    Optional<WorkOrder> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT wo FROM WorkOrder wo WHERE " +
           "(:customerId IS NULL OR wo.customer.id = :customerId) AND " +
           "(:siteId IS NULL OR wo.site.id = :siteId) AND " +
           "(:technicianId IS NULL OR (wo.assignedTechnician IS NOT NULL AND wo.assignedTechnician.id = :technicianId)) AND " +
           "(:status IS NULL OR wo.status = :status) AND " +
           "(:priority IS NULL OR wo.priority = :priority) AND " +
           "(:slaStatus IS NULL OR wo.slaStatus = :slaStatus) AND " +
           "(:query IS NULL OR (" +
           "  LOWER(wo.workOrderCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "  LOWER(wo.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "  LOWER(wo.customer.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "  LOWER(wo.site.name) LIKE LOWER(CONCAT('%', :query, '%'))" +
           "))")
    Page<WorkOrder> searchWorkOrders(
            @Param("customerId") Long customerId,
            @Param("siteId") Long siteId,
            @Param("technicianId") Long technicianId,
            @Param("status") WorkOrderStatus status,
            @Param("priority") Priority priority,
            @Param("slaStatus") SlaStatus slaStatus,
            @Param("query") String query,
            Pageable pageable
    );

    // Technician query
    @Query("SELECT wo FROM WorkOrder wo WHERE wo.assignedTechnician.id = :technicianId AND " +
           "(:status IS NULL OR wo.status = :status) AND " +
           "(:query IS NULL OR (" +
           "  LOWER(wo.workOrderCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "  LOWER(wo.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "  LOWER(wo.customer.name) LIKE LOWER(CONCAT('%', :query, '%'))" +
           "))")
    Page<WorkOrder> findByTechnician(
            @Param("technicianId") Long technicianId,
            @Param("status") WorkOrderStatus status,
            @Param("query") String query,
            Pageable pageable
    );

    List<WorkOrder> findByAssignedTechnicianIdAndStatusIn(Long technicianId, List<WorkOrderStatus> statuses);

    // Customer query
    @Query("SELECT wo FROM WorkOrder wo WHERE wo.customer.id = :customerId AND " +
           "(:siteId IS NULL OR wo.site.id = :siteId) AND " +
           "(:status IS NULL OR wo.status = :status) AND " +
           "(:query IS NULL OR (" +
           "  LOWER(wo.workOrderCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "  LOWER(wo.title) LIKE LOWER(CONCAT('%', :query, '%'))" +
           "))")
    Page<WorkOrder> findByCustomer(
            @Param("customerId") Long customerId,
            @Param("siteId") Long siteId,
            @Param("status") WorkOrderStatus status,
            @Param("query") String query,
            Pageable pageable
    );

    // Open work orders for SLA checking
    @Query("SELECT wo FROM WorkOrder wo WHERE wo.status IN ('NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD')")
    List<WorkOrder> findOpenWorkOrdersForSlaCheck();

    // Dashboard counts
    long countByStatus(WorkOrderStatus status);
    long countBySlaStatusAndStatusNotIn(SlaStatus slaStatus, List<WorkOrderStatus> terminalStatuses);

    @Query("SELECT wo.status, COUNT(wo) FROM WorkOrder wo GROUP BY wo.status")
    List<Object[]> countGroupedByStatus();

    @Query("SELECT wo.assignedTechnician.id, wo.assignedTechnician.fullName, COUNT(wo) " +
           "FROM WorkOrder wo " +
           "WHERE wo.assignedTechnician IS NOT NULL AND wo.status IN ('ASSIGNED', 'IN_PROGRESS', 'ON_HOLD') " +
           "GROUP BY wo.assignedTechnician.id, wo.assignedTechnician.fullName")
    List<Object[]> countActiveJobsByTechnician();

    @Query("SELECT wo.site.id, wo.site.name, wo.customer.name, COUNT(wo) " +
           "FROM WorkOrder wo " +
           "GROUP BY wo.site.id, wo.site.name, wo.customer.name " +
           "ORDER BY COUNT(wo) DESC")
    List<Object[]> countWorkOrdersBySite();

    @Query("SELECT COUNT(wo) FROM WorkOrder wo WHERE wo.status = 'COMPLETED' OR wo.status = 'CLOSED'")
    long countResolvedWorkOrders();

    @Query("SELECT COUNT(wo) FROM WorkOrder wo WHERE (wo.status = 'COMPLETED' OR wo.status = 'CLOSED') AND wo.slaStatus != 'BREACHED'")
    long countSlaCompliantWorkOrders();

    @Query("SELECT wo FROM WorkOrder wo ORDER BY wo.updatedAt DESC")
    List<WorkOrder> findRecentActivity(Pageable pageable);
}
