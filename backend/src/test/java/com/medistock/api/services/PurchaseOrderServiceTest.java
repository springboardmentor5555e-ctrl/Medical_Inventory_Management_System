package com.medistock.api.services;

import com.medistock.api.dto.PurchaseOrderDTO;
import com.medistock.api.dto.PurchaseOrderItemRequest;
import com.medistock.api.dto.PurchaseOrderRequest;
import com.medistock.api.models.*;
import com.medistock.api.repositories.PurchaseOrderRepository;
import com.medistock.api.repositories.SupplierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PurchaseOrderServiceTest {

    @Mock private PurchaseOrderRepository purchaseOrderRepository;
    @Mock private SupplierRepository supplierRepository;
    @Mock private MedicineService medicineService;

    @InjectMocks
    private PurchaseOrderService purchaseOrderService;

    private Supplier testSupplier;
    private PurchaseOrder testOrder;

    @BeforeEach
    void setUp() {
        testSupplier = new Supplier();
        testSupplier.setId(1L);
        testSupplier.setName("PharmaCo");

        testOrder = new PurchaseOrder();
        testOrder.setId(1L);
        testOrder.setSupplier(testSupplier);
        testOrder.setStatus(PurchaseOrderStatus.PENDING);
        testOrder.setTotalAmount(500.0);
    }

    @Test
    void createOrder_success() {
        PurchaseOrderItemRequest itemReq = new PurchaseOrderItemRequest();
        itemReq.setMedicineName("Aspirin");
        itemReq.setQuantity(10);
        itemReq.setUnitPrice(25.0);

        PurchaseOrderRequest req = new PurchaseOrderRequest();
        req.setSupplierId(1L);
        req.setItems(List.of(itemReq));

        when(supplierRepository.findById(1L)).thenReturn(Optional.of(testSupplier));
        when(purchaseOrderRepository.save(any(PurchaseOrder.class))).thenReturn(testOrder);

        PurchaseOrderDTO dto = purchaseOrderService.createOrder(req);

        assertNotNull(dto);
        verify(purchaseOrderRepository).save(any(PurchaseOrder.class));
    }

    @Test
    void createOrder_supplierNotFound_throwsException() {
        PurchaseOrderRequest req = new PurchaseOrderRequest();
        req.setSupplierId(99L);
        req.setItems(List.of());

        when(supplierRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> purchaseOrderService.createOrder(req));
    }

    @Test
    void updateOrderStatus_pendingToReceived_success() {
        when(purchaseOrderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(purchaseOrderRepository.save(any(PurchaseOrder.class))).thenReturn(testOrder);

        PurchaseOrderDTO dto = purchaseOrderService.updateOrderStatus(1L, PurchaseOrderStatus.RECEIVED, "admin");

        assertEquals(PurchaseOrderStatus.RECEIVED, testOrder.getStatus());
        verify(purchaseOrderRepository).save(testOrder);
    }

    @Test
    void updateOrderStatus_alreadyReceived_throwsException() {
        testOrder.setStatus(PurchaseOrderStatus.RECEIVED);
        when(purchaseOrderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        assertThrows(RuntimeException.class,
                () -> purchaseOrderService.updateOrderStatus(1L, PurchaseOrderStatus.CANCELLED, "admin"));
    }

    @Test
    void deleteOrder_pendingOrder_success() {
        when(purchaseOrderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        purchaseOrderService.deleteOrder(1L);

        verify(purchaseOrderRepository).delete(testOrder);
    }

    @Test
    void deleteOrder_receivedOrder_throwsException() {
        testOrder.setStatus(PurchaseOrderStatus.RECEIVED);
        when(purchaseOrderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        assertThrows(RuntimeException.class, () -> purchaseOrderService.deleteOrder(1L));
        verify(purchaseOrderRepository, never()).delete(any());
    }

    @Test
    void getOrderById_notFound_throwsException() {
        when(purchaseOrderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> purchaseOrderService.getOrderById(99L));
    }
}
