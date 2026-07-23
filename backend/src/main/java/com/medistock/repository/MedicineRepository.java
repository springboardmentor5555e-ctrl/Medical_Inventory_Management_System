package com.medistock.repository;

import com.medistock.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    Optional<Medicine> findByBarcode(String barcode);
    Boolean existsByBarcode(String barcode);
    Optional<Medicine> findByBarcodeAndOwnerId(String barcode, Long ownerId);
    Boolean existsByBarcodeAndOwnerId(String barcode, Long ownerId);

    Page<Medicine> findByOwnerId(Long ownerId, Pageable pageable);

    @Query("SELECT m FROM Medicine m WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.barcode) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.category.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Medicine> searchMedicines(@Param("search") String search, Pageable pageable);

    @Query("SELECT m FROM Medicine m WHERE m.ownerId = :ownerId AND (LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.barcode) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.category.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Medicine> searchMedicinesAndOwner(@Param("search") String search, @Param("ownerId") Long ownerId, Pageable pageable);

    @Query("SELECT m FROM Medicine m WHERE m.quantity <= m.reorderLevel")
    List<Medicine> findLowStockMedicines();

    @Query("SELECT m FROM Medicine m WHERE m.ownerId = :ownerId AND m.quantity <= m.reorderLevel")
    List<Medicine> findLowStockMedicinesByOwner(@Param("ownerId") Long ownerId);

    @Query("SELECT m FROM Medicine m WHERE m.expiryDate <= :date")
    List<Medicine> findExpiringMedicines(@Param("date") LocalDate date);

    @Query("SELECT m FROM Medicine m WHERE m.ownerId = :ownerId AND m.expiryDate <= :date")
    List<Medicine> findExpiringMedicinesByOwner(@Param("ownerId") Long ownerId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.quantity <= m.reorderLevel")
    long countLowStock();

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.ownerId = :ownerId AND m.quantity <= m.reorderLevel")
    long countLowStockByOwner(@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.expiryDate <= :date")
    long countExpiringSoon(@Param("date") LocalDate date);

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.ownerId = :ownerId AND m.expiryDate <= :date")
    long countExpiringSoonByOwner(@Param("ownerId") Long ownerId, @Param("date") LocalDate date);
}
