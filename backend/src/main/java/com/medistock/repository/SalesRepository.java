package com.medistock.repository;

import com.medistock.entity.Sales;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SalesRepository extends JpaRepository<Sales, Long> {
    List<Sales> findBySaleDateBetween(LocalDateTime start, LocalDateTime end);
    List<Sales> findByOwnerId(Long ownerId);
    List<Sales> findByCustomerId(Long customerId);
    List<Sales> findByOwnerIdAndSaleDateBetween(Long ownerId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sales s")
    Double calculateTotalRevenue();

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sales s WHERE s.saleDate >= :startDate")
    Double calculateRevenueSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sales s WHERE s.ownerId = :ownerId")
    Double calculateTotalRevenueByOwner(@Param("ownerId") Long ownerId);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sales s WHERE s.ownerId = :ownerId AND s.saleDate >= :startDate")
    Double calculateRevenueSinceByOwner(@Param("ownerId") Long ownerId, @Param("startDate") LocalDateTime startDate);
}
