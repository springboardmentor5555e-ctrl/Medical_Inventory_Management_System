package com.medistock.repository;

import com.medistock.entity.Partnership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PartnershipRepository extends JpaRepository<Partnership, Long> {
    List<Partnership> findByPharmacyOwnerId(Long pharmacyOwnerId);
    List<Partnership> findBySupplierId(Long supplierId);
    Optional<Partnership> findByPharmacyOwnerIdAndSupplierId(Long pharmacyOwnerId, Long supplierId);
    List<Partnership> findByPharmacyOwnerIdAndStatus(Long pharmacyOwnerId, String status);
    List<Partnership> findBySupplierIdAndStatus(Long supplierId, String status);
}
