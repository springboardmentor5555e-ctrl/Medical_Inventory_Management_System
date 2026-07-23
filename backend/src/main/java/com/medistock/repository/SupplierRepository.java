package com.medistock.repository;

import com.medistock.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    List<Supplier> findByOwnerId(Long ownerId);
    Optional<Supplier> findByEmail(String email);
    Optional<Supplier> findByUserId(Long userId);
    Optional<Supplier> findByEmailAndOwnerId(String email, Long ownerId);
    List<Supplier> findByStatus(String status);
    List<Supplier> findByOwnerIdAndStatus(Long ownerId, String status);
}
