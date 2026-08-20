package com.medistock.api.controllers;

import com.medistock.api.dto.AnalyticsDTO;
import com.medistock.api.services.AnalyticsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnalyticsService analyticsService;

    private AnalyticsDTO buildAnalyticsDTO() {
        AnalyticsDTO dto = new AnalyticsDTO();
        dto.setTotalMedicines(100L);
        dto.setLowStockCount(5L);
        dto.setExpiringCount(3L);
        dto.setExpiredCount(1L);
        dto.setTotalInventoryValue(150000.0);
        dto.setTotalStockIn(500L);
        dto.setTotalStockOut(200L);
        dto.setTotalPurchaseOrders(30L);
        dto.setPendingOrders(5L);
        dto.setReceivedOrders(25L);
        dto.setTotalPurchaseSpend(200000.0);
        dto.setCategoryBreakdown(Collections.emptyList());
        dto.setSupplierBreakdown(Collections.emptyList());
        dto.setTopLowStockItems(Collections.emptyList());
        dto.setDailyMovements(Collections.emptyList());
        return dto;
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAnalytics_asAdmin_returns200() throws Exception {
        when(analyticsService.getInventoryAnalytics()).thenReturn(buildAnalyticsDTO());

        mockMvc.perform(get("/api/analytics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalMedicines").value(100))
                .andExpect(jsonPath("$.lowStockCount").value(5))
                .andExpect(jsonPath("$.totalInventoryValue").value(150000.0))
                .andExpect(jsonPath("$.totalPurchaseOrders").value(30));
    }

    @Test
    @WithMockUser(roles = "PHARMACIST")
    void getAnalytics_asPharmacist_returns200() throws Exception {
        when(analyticsService.getInventoryAnalytics()).thenReturn(buildAnalyticsDTO());

        mockMvc.perform(get("/api/analytics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.expiringCount").value(3));
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void getAnalytics_asStaff_returns200() throws Exception {
        when(analyticsService.getInventoryAnalytics()).thenReturn(buildAnalyticsDTO());

        mockMvc.perform(get("/api/analytics"))
                .andExpect(status().isOk());
    }

    @Test
    void getAnalytics_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/analytics"))
                .andExpect(status().isUnauthorized());
    }
}
