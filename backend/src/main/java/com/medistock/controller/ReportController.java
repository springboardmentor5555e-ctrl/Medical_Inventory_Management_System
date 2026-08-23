package com.medistock.controller;

import com.medistock.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000"
})
public class ReportController {

    private final ReportService reportService;


    // ============================================================
    // INVENTORY
    // ============================================================

    @GetMapping("/inventory/pdf")
    public ResponseEntity<byte[]> inventoryPdf() {

        byte[] pdf =
                reportService.generateInventoryPdf();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=medistock-inventory-report.pdf"
                )
                .contentType(
                        MediaType.APPLICATION_PDF
                )
                .body(pdf);
    }


    @GetMapping("/inventory/excel")
    public ResponseEntity<byte[]> inventoryExcel() {

        byte[] excel =
                reportService.generateInventoryExcel();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=medistock-inventory-report.xlsx"
                )
                .contentType(
                        MediaType.parseMediaType(
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        )
                )
                .body(excel);
    }


    // ============================================================
    // LOW STOCK
    // ============================================================

    @GetMapping("/low-stock/pdf")
    public ResponseEntity<byte[]> lowStockPdf() {

        byte[] pdf =
                reportService.generateLowStockPdf();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=medistock-low-stock-report.pdf"
                )
                .contentType(
                        MediaType.APPLICATION_PDF
                )
                .body(pdf);
    }


    // ============================================================
    // EXPIRING SOON
    // ============================================================

    @GetMapping("/expiring-soon/pdf")
    public ResponseEntity<byte[]> expiringSoonPdf() {

        byte[] pdf =
                reportService.generateExpiringSoonPdf();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=medistock-expiring-soon-report.pdf"
                )
                .contentType(
                        MediaType.APPLICATION_PDF
                )
                .body(pdf);
    }


    // ============================================================
    // EXPIRED
    // ============================================================

    @GetMapping("/expired/pdf")
    public ResponseEntity<byte[]> expiredPdf() {

        byte[] pdf =
                reportService.generateExpiredPdf();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=medistock-expired-report.pdf"
                )
                .contentType(
                        MediaType.APPLICATION_PDF
                )
                .body(pdf);
    }
}