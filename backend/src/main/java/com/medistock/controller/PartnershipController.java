package com.medistock.controller;

import com.medistock.entity.Partnership;
import com.medistock.service.PartnershipService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partnerships")
public class PartnershipController {

    private final PartnershipService partnershipService;

    public PartnershipController(PartnershipService partnershipService) {
        this.partnershipService = partnershipService;
    }

    @GetMapping
    public ResponseEntity<List<Partnership>> getPartnerships() {
        return ResponseEntity.ok(partnershipService.getPartnerships());
    }

    @PostMapping("/request")
    public ResponseEntity<Partnership> sendRequest(@RequestParam String email) {
        return ResponseEntity.ok(partnershipService.sendPartnershipRequest(email));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<Partnership> acceptRequest(@PathVariable Long id) {
        return ResponseEntity.ok(partnershipService.acceptPartnershipRequest(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Partnership> rejectRequest(@PathVariable Long id) {
        return ResponseEntity.ok(partnershipService.rejectPartnershipRequest(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Partnership> cancelPartnership(@PathVariable Long id) {
        return ResponseEntity.ok(partnershipService.cancelPartnership(id));
    }
}
