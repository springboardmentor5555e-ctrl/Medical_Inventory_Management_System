package com.medistock.controller;

import com.medistock.entity.StockLog;
import com.medistock.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stock-logs")
@RequiredArgsConstructor
public class StockLogController {

    private final MedicineService medicineService;

    @GetMapping("/recent")
    public ResponseEntity<List<StockLog>> recent(@RequestParam(defaultValue = "15") int limit) {
        return ResponseEntity.ok(medicineService.getRecentStockActivity(limit));
    }
}
