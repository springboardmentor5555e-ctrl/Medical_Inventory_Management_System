package com.medistock.controller;

import com.medistock.dto.ReorderRequestDTO;
import com.medistock.enums.ReorderStatus;
import com.medistock.service.ReorderRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reorders")
public class ReorderController {

    private final ReorderRequestService reorderRequestService;

    public ReorderController(ReorderRequestService reorderRequestService) {
        this.reorderRequestService = reorderRequestService;
    }

    @GetMapping
    public ResponseEntity<List<ReorderRequestDTO>> getAllReorders() {
        return ResponseEntity.ok(reorderRequestService.getAllReorders());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ReorderRequestDTO>> getReordersByStatus(@PathVariable ReorderStatus status) {
        return ResponseEntity.ok(reorderRequestService.getReordersByStatus(status));
    }

    @PostMapping
    public ResponseEntity<ReorderRequestDTO> createReorder(@Valid @RequestBody ReorderRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reorderRequestService.createReorder(dto));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ReorderRequestDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam ReorderStatus status
    ) {
        return ResponseEntity.ok(reorderRequestService.updateStatus(id, status));
    }
}
