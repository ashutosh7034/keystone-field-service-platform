package com.keystone.repository;

import com.keystone.domain.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {

    List<TimeLog> findByWorkOrderIdOrderByLoggedAtDesc(Long workOrderId);

    @Query("SELECT COALESCE(SUM(tl.minutes), 0) FROM TimeLog tl WHERE tl.workOrder.id = :workOrderId")
    Integer calculateTotalMinutesForWorkOrder(@Param("workOrderId") Long workOrderId);

    @Query("SELECT tl.technician.id, tl.technician.fullName, SUM(tl.minutes) " +
           "FROM TimeLog tl GROUP BY tl.technician.id, tl.technician.fullName ORDER BY SUM(tl.minutes) DESC")
    List<Object[]> getTotalTimeByTechnicians();
}
