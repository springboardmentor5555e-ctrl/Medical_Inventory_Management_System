package com.medistock.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleRequest {
    @NotEmpty(message = "Sales transaction must contain at least one item")
    private List<SaleItemRequest> items;

    private Double discountAmount;
    private Double taxAmount;
    private String paymentMethod; // CASH, UPI, CARD, PHONEPE, PAYTM, GPAY, QR
    private Long customerId;
    private String couponCode;
    private Long ownerId; // Specific pharmacy owner ID (optional for local cashier POS, required for customer checkout)
}
