package com.medistock.service;

import com.medistock.entity.Medicine;
import com.medistock.entity.User;
import com.medistock.entity.Wishlist;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.WishlistRepository;
import com.medistock.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final MedicineRepository medicineRepository;

    public WishlistService(WishlistRepository wishlistRepository, MedicineRepository medicineRepository) {
        this.wishlistRepository = wishlistRepository;
        this.medicineRepository = medicineRepository;
    }

    private Long getCurrentCustomerId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("User not authenticated");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal) {
            User user = ((UserPrincipal) principal).getUser();
            return user.getId();
        }
        throw new AccessDeniedException("User principal not found");
    }

    @Transactional(readOnly = true)
    public List<Medicine> getWishlistMedicines() {
        Long customerId = getCurrentCustomerId();
        List<Wishlist> wishlist = wishlistRepository.findByCustomerId(customerId);
        List<Long> medicineIds = wishlist.stream().map(Wishlist::getMedicineId).collect(Collectors.toList());
        return medicineRepository.findAllById(medicineIds);
    }

    @Transactional
    public Wishlist addToWishlist(Long medicineId) {
        Long customerId = getCurrentCustomerId();
        if (!medicineRepository.existsById(medicineId)) {
            throw new ResourceNotFoundException("Medicine not found with ID: " + medicineId);
        }

        Optional<Wishlist> existing = wishlistRepository.findByCustomerIdAndMedicineId(customerId, medicineId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Wishlist item = Wishlist.builder()
                .customerId(customerId)
                .medicineId(medicineId)
                .build();
        return wishlistRepository.save(item);
    }

    @Transactional
    public void removeFromWishlist(Long medicineId) {
        Long customerId = getCurrentCustomerId();
        wishlistRepository.deleteByCustomerIdAndMedicineId(customerId, medicineId);
    }
}
