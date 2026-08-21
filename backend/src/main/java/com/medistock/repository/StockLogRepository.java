package com.medistock.repository;

import com.medistock.entity.StockLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface StockLogRepository extends JpaRepository<StockLog, Long> {

    Page<StockLog> findByMedicineId(Long medicineId, Pageable pageable);

    @Modifying
    @Query("delete from StockLog s where s.medicine.id = :medicineId")
    void deleteByMedicineId(Long medicineId);
}
