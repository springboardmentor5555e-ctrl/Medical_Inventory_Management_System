package com.medistock.api.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medistock.api.dto.PurchaseOrderDTO;
import com.medistock.api.dto.PurchaseOrderItemRequest;
import com.medistock.api.dto.PurchaseOrderRequest;
import com.medistock.api.models.PurchaseOrderStatus;
import com.medistock.api.services.PurchaseOrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class PurchaseOrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PurchaseOrderService purchaseOrderService;

    private PurchaseOrderDTO buildDTO() {
        PurchaseOrderDTO dto = new PurchaseOrderDTO();
        dto.setId(1L);
        dto.setSupplierName("PharmaCo");
        dto.setStatus(PurchaseOrderStatus.PENDING);
        dto.setTotalAmount(500.0);
        return dto;
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void getAllOrders_asStaff_returns403() throws Exception {
        mockMvc.perform(get("/api/purchase-orders"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PHARMACIST")
    void getAllOrders_asPharmacist_returns200() throws Exception {
        when(purchaseOrderService.getAllOrders(any()))
                .thenReturn(new PageImpl<>(List.of(buildDTO())));

        mockMvc.perform(get("/api/purchase-orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].supplierName").value("PharmaCo"));
    }

    @Test
    @WithMockUser(roles = "PHARMACIST")
    void getOrderById_returns200() throws Exception {
        when(purchaseOrderService.getOrderById(1L)).thenReturn(buildDTO());

        mockMvc.perform(get("/api/purchase-orders/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAmount").value(500.0));
    }

    @Test
    @WithMockUser(roles = "PHARMACIST")
    void createOrder_asPharmacist_returns200() throws Exception {
        PurchaseOrderItemRequest itemReq = new PurchaseOrderItemRequest();
        itemReq.setMedicineName("Aspirin");
        itemReq.setQuantity(10);
        itemReq.setUnitPrice(25.0);

        PurchaseOrderRequest req = new PurchaseOrderRequest();
        req.setSupplierId(1L);
        req.setItems(List.of(itemReq));

        when(purchaseOrderService.createOrder(any(PurchaseOrderRequest.class))).thenReturn(buildDTO());

        mockMvc.perform(post("/api/purchase-orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void updateOrderStatus_asAdmin_returns200() throws Exception {
        PurchaseOrderDTO received = buildDTO();
        received.setStatus(PurchaseOrderStatus.RECEIVED);

        when(purchaseOrderService.updateOrderStatus(eq(1L), eq(PurchaseOrderStatus.RECEIVED), eq("admin")))
                .thenReturn(received);

        mockMvc.perform(put("/api/purchase-orders/1/status")
                        .param("status", "RECEIVED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RECEIVED"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteOrder_asAdmin_returns200() throws Exception {
        doNothing().when(purchaseOrderService).deleteOrder(1L);

        mockMvc.perform(delete("/api/purchase-orders/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Purchase order deleted successfully"));
    }

    @Test
    @WithMockUser(roles = "PHARMACIST")
    void deleteOrder_asPharmacist_returns403() throws Exception {
        mockMvc.perform(delete("/api/purchase-orders/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PHARMACIST")
    void createOrder_supplierNotFound_returns400() throws Exception {
        PurchaseOrderRequest req = new PurchaseOrderRequest();
        req.setSupplierId(99L);
        req.setItems(Collections.emptyList());

        when(purchaseOrderService.createOrder(any(PurchaseOrderRequest.class)))
                .thenThrow(new RuntimeException("Supplier not found"));

        mockMvc.perform(post("/api/purchase-orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }
}
