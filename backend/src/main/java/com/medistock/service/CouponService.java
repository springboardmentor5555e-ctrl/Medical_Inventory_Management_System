package com.medistock.service;

import com.medistock.entity.Coupon;
import com.medistock.entity.User;
import com.medistock.enums.Role;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.CouponRepository;
import com.medistock.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    private Long getCurrentOwnerId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal) {
            User user = ((UserPrincipal) principal).getUser();
            if (user.getRole() == Role.ADMIN) {
                return null;
            }
            if (user.getRole() == Role.STAFF) {
                return user.getOwnerId();
            }
            return user.getId();
        }
        return null;
    }

    @Transactional(readOnly = true)
    public List<Coupon> getAllCoupons() {
        Long ownerId = getCurrentOwnerId();
        if (ownerId != null) {
            return couponRepository.findByOwnerId(ownerId);
        }
        return couponRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Coupon getCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with ID: " + id));
        Long ownerId = getCurrentOwnerId();
        if (ownerId != null && !ownerId.equals(coupon.getOwnerId())) {
            throw new AccessDeniedException("Access denied to this coupon");
        }
        return coupon;
    }

    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        if (couponRepository.findByCode(coupon.getCode()).isPresent()) {
            throw new IllegalArgumentException("Coupon code already exists.");
        }
        coupon.setOwnerId(getCurrentOwnerId());
        coupon.setUsedCount(0);
        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon updateCoupon(Long id, Coupon details) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with ID: " + id));
        Long ownerId = getCurrentOwnerId();
        if (ownerId != null && !ownerId.equals(coupon.getOwnerId())) {
            throw new AccessDeniedException("Access denied to this coupon");
        }

        if (!coupon.getCode().equals(details.getCode()) && couponRepository.findByCode(details.getCode()).isPresent()) {
            throw new IllegalArgumentException("Coupon code already exists.");
        }

        coupon.setCode(details.getCode());
        coupon.setType(details.getType());
        coupon.setValue(details.getValue());
        coupon.setMinimumAmount(details.getMinimumAmount());
        coupon.setExpiryDate(details.getExpiryDate());
        coupon.setMaxUsage(details.getMaxUsage());
        coupon.setMaxUsers(details.getMaxUsers());
        coupon.setActive(details.isActive());

        return couponRepository.save(coupon);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with ID: " + id));
        Long ownerId = getCurrentOwnerId();
        if (ownerId != null && !ownerId.equals(coupon.getOwnerId())) {
            throw new AccessDeniedException("Access denied to this coupon");
        }
        couponRepository.delete(coupon);
    }

    @Transactional(readOnly = true)
    public Coupon validateCoupon(String code, Double purchaseAmount) {
        Coupon coupon = couponRepository.findByCode(code.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Coupon code not found."));

        if (!coupon.isActive()) {
            throw new IllegalArgumentException("Coupon is inactive.");
        }
        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Coupon has expired.");
        }
        if (coupon.getMinimumAmount() != null && purchaseAmount < coupon.getMinimumAmount()) {
            throw new IllegalArgumentException("Minimum purchase amount of $" + coupon.getMinimumAmount() + " required.");
        }
        if (coupon.getMaxUsage() != null && coupon.getUsedCount() >= coupon.getMaxUsage()) {
            throw new IllegalArgumentException("Coupon usage limit reached.");
        }

        return coupon;
    }
}
