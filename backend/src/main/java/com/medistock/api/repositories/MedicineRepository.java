package com.medistock.api.repositories;

import com.medistock.api.models.Medicine;
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

    Optional<Medicine> findFirstByNameIgnoreCase(String name);

    Page<Medicine> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Medicine> findByCategoryId(Long categoryId, Pageable pageable);

    List<Medicine> findBySupplierId(Long supplierId);

    @Query("SELECT m FROM Medicine m WHERE " +
           "(:name = '' OR LOWER(m.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:categoryId = -1L OR m.category.id = :categoryId)")
    Page<Medicine> findByFilters(@Param("name") String name,
                                  @Param("categoryId") Long categoryId,
                                  Pageable pageable);

    List<Medicine> findByExpiryDateBefore(LocalDate date);

    @Query("SELECT m FROM Medicine m WHERE m.expiryDate BETWEEN :today AND :endDate ORDER BY m.expiryDate ASC")
    List<Medicine> findExpiringBetween(@Param("today") LocalDate today, @Param("endDate") LocalDate endDate);

    List<Medicine> findByQuantityLessThanEqual(int threshold);

    long countByQuantityLessThanEqual(int threshold);

    long countByExpiryDateBefore(LocalDate date);

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.expiryDate BETWEEN :today AND :endDate")
    long countExpiringBetween(@Param("today") LocalDate today, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(m.category.name, 'Uncategorized'), COUNT(m) FROM Medicine m GROUP BY m.category.name ORDER BY COUNT(m) DESC")
    List<Object[]> countByCategory();

    @Query("SELECT COALESCE(SUM(m.price * m.quantity), 0) FROM Medicine m")
    Double sumInventoryValue();

    @Query("SELECT m FROM Medicine m WHERE m.quantity <= :threshold ORDER BY m.quantity ASC")
    List<Medicine> findTopLowStock(@Param("threshold") int threshold, Pageable pageable);

    @Query("SELECT COALESCE(m.supplier.name, 'No Supplier'), COUNT(m) FROM Medicine m GROUP BY m.supplier.name ORDER BY COUNT(m) DESC")
    List<Object[]> countBySupplier();
}

