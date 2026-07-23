package com.medistock.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleItemResponse {
    private Long medicineId;
    private String medicineName;
    private Integer quantity;
    private Double unitPrice;
    private Double subtotal;
}
