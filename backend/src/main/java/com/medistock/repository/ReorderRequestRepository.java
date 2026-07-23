package com.medistock.repository;

import com.medistock.entity.Medicine;
import com.medistock.entity.ReorderRequest;
import com.medistock.enums.ReorderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReorderRequestRepository extends JpaRepository<ReorderRequest, Long> {
    List<ReorderRequest> findByStatus(ReorderStatus status);
    Optional<ReorderRequest> findByMedicineAndStatus(Medicine medicine, ReorderStatus status);
    
    List<ReorderRequest> findByOwnerId(Long ownerId);
    List<ReorderRequest> findBySupplierId(Long supplierId);
    List<ReorderRequest> findByOwnerIdAndStatus(Long ownerId, ReorderStatus status);
    List<ReorderRequest> findBySupplierIdAndStatus(Long supplierId, ReorderStatus status);
    Optional<ReorderRequest> findByMedicineAndStatusAndOwnerId(Medicine medicine, ReorderStatus status, Long ownerId);
}
