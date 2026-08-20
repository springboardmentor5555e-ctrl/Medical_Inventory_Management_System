package com.medistock.api.dto;

import java.util.List;

/**
 * SupplierPerformanceDTO — aggregated performance metrics for a single supplier.
 * Returned by the advanced analytics supplier performance endpoint.
 */
public class SupplierPerformanceDTO {

    private Long supplierId;
    private String supplierName;
    private String contactNumber;
    private String email;

    /** Total number of purchase orders placed with this supplier. */
    private long totalOrders;

    /** Number of orders with RECEIVED status. */
    private long receivedOrders;

    /** Number of orders with PENDING status. */
    private long pendingOrders;

    /** Number of orders with CANCELLED status. */
    private long cancelledOrders;

    /** Percentage of orders that have been RECEIVED (fulfilment rate). */
    private double fulfilmentRate;

    /** Total spend across all orders (sum of totalAmount). */
    private double totalSpend;

    /** Average order value. */
    private double avgOrderValue;

    /** List of top-5 medicines supplied by this supplier (by quantity). */
    private List<String> topMedicinesSupplied;

    public SupplierPerformanceDTO() {}

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

    public long getReceivedOrders() { return receivedOrders; }
    public void setReceivedOrders(long receivedOrders) { this.receivedOrders = receivedOrders; }

    public long getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; }

    public long getCancelledOrders() { return cancelledOrders; }
    public void setCancelledOrders(long cancelledOrders) { this.cancelledOrders = cancelledOrders; }

    public double getFulfilmentRate() { return fulfilmentRate; }
    public void setFulfilmentRate(double fulfilmentRate) { this.fulfilmentRate = fulfilmentRate; }

    public double getTotalSpend() { return totalSpend; }
    public void setTotalSpend(double totalSpend) { this.totalSpend = totalSpend; }

    public double getAvgOrderValue() { return avgOrderValue; }
    public void setAvgOrderValue(double avgOrderValue) { this.avgOrderValue = avgOrderValue; }

    public List<String> getTopMedicinesSupplied() { return topMedicinesSupplied; }
    public void setTopMedicinesSupplied(List<String> topMedicinesSupplied) {
        this.topMedicinesSupplied = topMedicinesSupplied;
    }
}
