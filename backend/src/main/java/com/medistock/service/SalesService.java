package com.medistock.service;

import com.medistock.dto.SaleItemRequest;
import com.medistock.dto.SaleItemResponse;
import com.medistock.dto.SaleRequest;
import com.medistock.dto.SaleResponse;
import com.medistock.entity.*;
import com.medistock.enums.Role;
import com.medistock.exception.InsufficientStockException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.*;
import com.medistock.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SalesService {

    private final SalesRepository salesRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final CouponRepository couponRepository;
    private final TwilioService twilioService;

    public SalesService(
            SalesRepository salesRepository,
            MedicineRepository medicineRepository,
            UserRepository userRepository,
            NotificationRepository notificationRepository,
            CouponRepository couponRepository,
            TwilioService twilioService
    ) {
        this.salesRepository = salesRepository;
        this.medicineRepository = medicineRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.couponRepository = couponRepository;
        this.twilioService = twilioService;
    }

    private Long getCurrentOwnerId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal) {
            User user = ((UserPrincipal) principal).getUser();
            if (user.getRole() == Role.ADMIN) {
                return null;
            }
            if (user.getRole() == Role.STAFF) {
                return user.getOwnerId();
            }
            return user.getId();
        }
        return null;
    }

    @Transactional(readOnly = true)
    public List<SaleResponse> getAllSales() {
        Long ownerId = getCurrentOwnerId();
        List<Sales> list;
        if (ownerId != null) {
            list = salesRepository.findByOwnerId(ownerId);
        } else {
            // Admin sees all sales or Customer sees their own orders
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserPrincipal) {
                User user = ((UserPrincipal) auth.getPrincipal()).getUser();
                if (user.getRole() == Role.CUSTOMER) {
                    list = salesRepository.findByCustomerId(user.getId());
                } else {
                    list = salesRepository.findAll();
                }
            } else {
                list = salesRepository.findAll();
            }
        }
        return list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SaleResponse getSaleById(Long id) {
        Sales sale = salesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with ID: " + id));
        Long ownerId = getCurrentOwnerId();
        if (ownerId != null && !ownerId.equals(sale.getOwnerId())) {
            throw new AccessDeniedException("You do not have access to this sale.");
        }
        return mapToResponse(sale);
    }

    @Transactional
    public SaleResponse createSale(SaleRequest request, String userEmail) {
        User cashier = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Long ownerId = getCurrentOwnerId();
        if (ownerId == null) {
            // If checkout is performed by a CUSTOMER, use the pharmacy ownerId specified in the request
            if (cashier.getRole() == Role.CUSTOMER) {
                ownerId = request.getOwnerId();
                if (ownerId == null) {
                    throw new IllegalArgumentException("Pharmacy Owner ID is required for customer checkout");
                }
            } else {
                // Admin or fallback
                ownerId = request.getOwnerId();
            }
        }

        Sales sale = Sales.builder()
                .invoiceNumber("INV-" + System.currentTimeMillis())
                .user(cashier)
                .ownerId(ownerId)
                .salesItems(new ArrayList<>())
                .totalAmount(0.0)
                .discountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : 0.0)
                .taxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : 0.0)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH")
                .couponCode(request.getCouponCode())
                .build();

        if (request.getCustomerId() != null) {
            User customer = userRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + request.getCustomerId()));
            sale.setCustomerId(customer.getId());
        } else if (cashier.getRole() == Role.CUSTOMER) {
            sale.setCustomerId(cashier.getId());
        }

        // Apply Coupon Validation if provided
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            Optional<Coupon> couponOpt = couponRepository.findByCode(request.getCouponCode().trim());
            if (couponOpt.isPresent()) {
                Coupon coupon = couponOpt.get();
                if (!coupon.isActive()) {
                    throw new IllegalArgumentException("Coupon is inactive.");
                }
                if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDate.now())) {
                    throw new IllegalArgumentException("Coupon has expired.");
                }
                if (coupon.getMaxUsage() != null && coupon.getUsedCount() >= coupon.getMaxUsage()) {
                    throw new IllegalArgumentException("Coupon maximum usage limit reached.");
                }
                // Coupon is valid, increment used count
                coupon.setUsedCount(coupon.getUsedCount() + 1);
                couponRepository.save(coupon);
            } else {
                throw new IllegalArgumentException("Invalid coupon code.");
            }
        }

        double subtotalSum = 0.0;

        for (SaleItemRequest itemReq : request.getItems()) {
            Medicine medicine = medicineRepository.findById(itemReq.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + itemReq.getMedicineId()));

            // Validate inventory owner context match
            if (ownerId != null && !ownerId.equals(medicine.getOwnerId())) {
                throw new AccessDeniedException("Selected medicine does not belong to this pharmacy inventory");
            }

            if (medicine.getQuantity() < itemReq.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for medicine: " + medicine.getName()
                        + ". Available: " + medicine.getQuantity() + ", Requested: " + itemReq.getQuantity());
            }

            // Deduct stock
            medicine.setQuantity(medicine.getQuantity() - itemReq.getQuantity());
            medicineRepository.save(medicine);

            double subtotal = itemReq.getQuantity() * medicine.getPrice();
            subtotalSum += subtotal;

            SalesItem salesItem = SalesItem.builder()
                    .sale(sale)
                    .medicine(medicine)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(medicine.getPrice())
                    .subtotal(subtotal)
                    .build();

            sale.getSalesItems().add(salesItem);

            // Check if stock dropped below reorder level
            if (medicine.getQuantity() <= medicine.getReorderLevel()) {
                triggerLowStockAlert(medicine, ownerId);
            }
        }

        // Calculation: Total = Subtotal - Discount + Tax
        double total = subtotalSum - sale.getDiscountAmount() + sale.getTaxAmount();
        sale.setTotalAmount(total < 0.0 ? 0.0 : total);

        sale = salesRepository.save(sale);
        return mapToResponse(sale);
    }

    private void triggerLowStockAlert(Medicine medicine, Long ownerId) {
        String alertMsg = String.format("LOW STOCK WARNING: %s (Barcode: %s) has dropped to %d units, which is below the reorder level of %d.",
                medicine.getName(),
                medicine.getBarcode() != null ? medicine.getBarcode() : "N/A",
                medicine.getQuantity(),
                medicine.getReorderLevel()
        );

        // Save to DB notification
        Notification notification = Notification.builder()
                .message(alertMsg)
                .type("LOW_STOCK")
                .isRead(false)
                .userId(ownerId) // Recipient is the pharmacy owner
                .build();
        notificationRepository.save(notification);

        // Send Twilio alert
        try {
            twilioService.sendWhatsAppMessage(alertMsg);
        } catch (Exception e) {
            System.err.println("Twilio alert failed to send: " + e.getMessage());
        }
    }

    private SaleResponse mapToResponse(Sales sale) {
        List<SaleItemResponse> items = sale.getSalesItems().stream()
                .map(item -> SaleItemResponse.builder()
                        .medicineId(item.getMedicine().getId())
                        .medicineName(item.getMedicine().getName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        String customerName = "Walk-in Customer";
        if (sale.getCustomerId() != null) {
            Optional<User> custOpt = userRepository.findById(sale.getCustomerId());
            if (custOpt.isPresent()) {
                customerName = custOpt.get().getName();
            }
        }

        return SaleResponse.builder()
                .id(sale.getId())
                .invoiceNumber(sale.getInvoiceNumber())
                .totalAmount(sale.getTotalAmount())
                .discountAmount(sale.getDiscountAmount())
                .taxAmount(sale.getTaxAmount())
                .paymentMethod(sale.getPaymentMethod())
                .customerName(customerName)
                .couponCode(sale.getCouponCode())
                .cashierName(sale.getUser() != null ? sale.getUser().getName() : "Unknown")
                .saleDate(sale.getSaleDate())
                .items(items)
                .build();
    }
}
