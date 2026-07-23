package com.medistock.controller;

import com.medistock.entity.Medicine;
import com.medistock.entity.Wishlist;
import com.medistock.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<List<Medicine>> getWishlist() {
        return ResponseEntity.ok(wishlistService.getWishlistMedicines());
    }

    @PostMapping("/{medicineId}")
    public ResponseEntity<Wishlist> addToWishlist(@PathVariable Long medicineId) {
        return ResponseEntity.ok(wishlistService.addToWishlist(medicineId));
    }

    @DeleteMapping("/{medicineId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long medicineId) {
        wishlistService.removeFromWishlist(medicineId);
        return ResponseEntity.noContent().build();
    }
}
