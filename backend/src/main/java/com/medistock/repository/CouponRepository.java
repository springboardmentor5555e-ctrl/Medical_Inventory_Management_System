package com.medistock.repository;

import com.medistock.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCode(String code);
    List<Coupon> findByOwnerId(Long ownerId);
    List<Coupon> findByOwnerIdAndActiveTrue(Long ownerId);
    List<Coupon> findByActiveTrue();
}
