package com.medistock.service;

import com.medistock.dto.CategoryResponse;
import com.medistock.dto.MedicineResponse;
import com.medistock.dto.StockLogResponse;
import com.medistock.dto.SupplierResponse;
import com.medistock.entity.Category;
import com.medistock.entity.Medicine;
import com.medistock.entity.StockLog;
import com.medistock.entity.Supplier;
import java.time.LocalDate;
import org.springframework.stereotype.Component;

@Component
public class InventoryMapper {

    public MedicineResponse toMedicineResponse(Medicine medicine) {
        return MedicineResponse.builder()
                .id(medicine.getId())
                .medicineName(medicine.getMedicineName())
                .genericName(medicine.getGenericName())
                .brand(medicine.getBrand())
                .category(toCategoryResponse(medicine.getCategory()))
                .supplier(toSupplierResponse(medicine.getSupplier(), 0, 0))
                .batchNumber(medicine.getBatchNumber())
                .barcode(medicine.getBarcode())
                .manufacturingDate(medicine.getManufacturingDate())
                .expiryDate(medicine.getExpiryDate())
                .purchasePrice(medicine.getPurchasePrice())
                .sellingPrice(medicine.getSellingPrice())
                .quantity(medicine.getQuantity())
                .availableQuantity(availableQuantity(medicine))
                .reservedQuantity(medicine.getReservedQuantity())
                .damagedQuantity(medicine.getDamagedQuantity())
                .minimumStock(medicine.getMinimumStock())
                .storageLocation(medicine.getStorageLocation())
                .description(medicine.getDescription())
                .imageUrl(medicine.getImageUrl())
                .status(resolveStatus(medicine))
                .createdAt(medicine.getCreatedAt())
                .updatedAt(medicine.getUpdatedAt())
                .build();
    }

    public SupplierResponse toSupplierResponse(Supplier supplier, long activeMedicines, long totalOrders) {
        return SupplierResponse.builder()
                .id(supplier.getId())
                .supplierName(supplier.getSupplierName())
                .companyName(supplier.getCompanyName())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .contactPerson(supplier.getContactPerson())
                .address(supplier.getAddress())
                .city(supplier.getCity())
                .state(supplier.getState())
                .country(supplier.getCountry())
                .gstNumber(supplier.getGstNumber())
                .activeMedicines(activeMedicines)
                .totalOrders(totalOrders)
                .performance(activeMedicines > 0 ? "Active" : "New")
                .createdAt(supplier.getCreatedAt())
                .updatedAt(supplier.getUpdatedAt())
                .build();
    }

    public CategoryResponse toCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .build();
    }

    public StockLogResponse toStockLogResponse(StockLog log) {
        return StockLogResponse.builder()
                .id(log.getId())
                .medicineId(log.getMedicine().getId())
                .medicineName(log.getMedicine().getMedicineName())
                .batchNumber(log.getMedicine().getBatchNumber())
                .type(log.getType())
                .quantity(log.getQuantity())
                .previousQuantity(log.getPreviousQuantity())
                .newQuantity(log.getNewQuantity())
                .reason(log.getReason())
                .createdAt(log.getCreatedAt())
                .build();
    }

    public String resolveStatus(Medicine medicine) {
        LocalDate today = LocalDate.now();
        if (medicine.getExpiryDate().isBefore(today)) {
            return "EXPIRED";
        }
        if (availableQuantity(medicine) == 0) {
            return "OUT_OF_STOCK";
        }
        if (availableQuantity(medicine) <= medicine.getMinimumStock()) {
            return "LOW_STOCK";
        }
        if (!medicine.getExpiryDate().isAfter(today.plusDays(45))) {
            return "NEAR_EXPIRY";
        }
        return "AVAILABLE";
    }

    public int availableQuantity(Medicine medicine) {
        int reserved = medicine.getReservedQuantity() == null ? 0 : medicine.getReservedQuantity();
        int damaged = medicine.getDamagedQuantity() == null ? 0 : medicine.getDamagedQuantity();
        return Math.max(0, medicine.getQuantity() - reserved - damaged);
    }
}
