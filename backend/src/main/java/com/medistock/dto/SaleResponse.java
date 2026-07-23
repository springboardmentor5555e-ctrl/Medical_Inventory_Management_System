package com.medistock.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleResponse {
    private Long id;
    private String invoiceNumber;
    private Double totalAmount;
    private Double discountAmount;
    private Double taxAmount;
    private String paymentMethod;
    private String customerName;
    private String couponCode;
    private String cashierName;
    private LocalDateTime saleDate;
    private List<SaleItemResponse> items;
}
