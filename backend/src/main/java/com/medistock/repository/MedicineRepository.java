package com.medistock.repository;

import com.medistock.entity.Medicine;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface MedicineRepository extends JpaRepository<Medicine, Long>, JpaSpecificationExecutor<Medicine> {

    boolean existsByBatchNumberIgnoreCase(String batchNumber);

    boolean existsByBarcodeIgnoreCase(String barcode);

    long countByQuantityLessThanEqualAndQuantityGreaterThan(Integer minimumStock, Integer zero);

    long countByQuantity(Integer quantity);

    long countByExpiryDateBetween(LocalDate start, LocalDate end);

    long countByExpiryDateBefore(LocalDate date);

    long countBySupplierId(Long supplierId);

    @Query("select coalesce(sum(m.quantity * m.purchasePrice), 0) from Medicine m")
    java.math.BigDecimal inventoryValue();
}
