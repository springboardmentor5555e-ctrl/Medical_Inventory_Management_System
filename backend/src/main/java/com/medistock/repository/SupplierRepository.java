package com.medistock.repository;

import com.medistock.entity.Supplier;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByGstNumberIgnoreCase(String gstNumber);

    Optional<Supplier> findByEmailIgnoreCase(String email);

    Optional<Supplier> findByGstNumberIgnoreCase(String gstNumber);

    @Query("""
            select s from Supplier s
            where lower(s.supplierName) like lower(concat('%', :search, '%'))
               or lower(s.companyName) like lower(concat('%', :search, '%'))
               or lower(s.email) like lower(concat('%', :search, '%'))
               or lower(coalesce(s.contactPerson, '')) like lower(concat('%', :search, '%'))
               or lower(s.city) like lower(concat('%', :search, '%'))
            """)
    Page<Supplier> search(@Param("search") String search, Pageable pageable);
}
