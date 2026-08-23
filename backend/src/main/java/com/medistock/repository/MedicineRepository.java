package com.medistock.repository;

import com.medistock.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long>, JpaSpecificationExecutor<Medicine> {

    boolean existsByBatchNumber(String batchNumber);

    List<Medicine> findByQuantityLessThanEqual(Integer threshold);

    List<Medicine> findByExpiryDateBefore(LocalDate date);

    List<Medicine> findByExpiryDateBetween(LocalDate start, LocalDate end);

    List<Medicine> findByNameContainingIgnoreCase(String name);

    List<Medicine> findByCategoryId(Long categoryId);

    List<Medicine> findBySupplierId(Long supplierId);

    long countByQuantityLessThanEqual(Integer threshold);

    long countByExpiryDateBefore(LocalDate date);
}
