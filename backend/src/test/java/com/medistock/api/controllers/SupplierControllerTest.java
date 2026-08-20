package com.medistock.api.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medistock.api.dto.SupplierRequest;
import com.medistock.api.models.Supplier;
import com.medistock.api.services.SupplierService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class SupplierControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SupplierService supplierService;

    private SupplierRequest buildRequest() {
        SupplierRequest req = new SupplierRequest();
        req.setName("PharmaCo");
        req.setContactNumber("9876543210");
        req.setEmail("pharma@example.com");
        req.setAddress("123 Medical Street");
        return req;
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void getAllSuppliers_asStaff_returns200() throws Exception {
        Supplier s = new Supplier();
        s.setId(1L);
        s.setName("PharmaCo");

        when(supplierService.getAllSuppliers()).thenReturn(List.of(s));

        mockMvc.perform(get("/api/suppliers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("PharmaCo"));
    }

    @Test
    @WithMockUser(roles = "PHARMACIST")
    void createSupplier_asPharmacist_returns200() throws Exception {
        Supplier s = new Supplier();
        s.setId(1L);
        s.setName("PharmaCo");

        when(supplierService.createSupplier(any(SupplierRequest.class))).thenReturn(s);

        mockMvc.perform(post("/api/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("PharmaCo"));
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void createSupplier_asStaff_returns403() throws Exception {
        mockMvc.perform(post("/api/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildRequest())))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateSupplier_asAdmin_returns200() throws Exception {
        Supplier updated = new Supplier();
        updated.setId(1L);
        updated.setName("PharmaCo Updated");

        when(supplierService.updateSupplier(eq(1L), any(SupplierRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/suppliers/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("PharmaCo Updated"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteSupplier_asAdmin_returns200() throws Exception {
        doNothing().when(supplierService).deleteSupplier(1L);

        mockMvc.perform(delete("/api/suppliers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Supplier deleted successfully"));
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void deleteSupplier_asStaff_returns403() throws Exception {
        mockMvc.perform(delete("/api/suppliers/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getSupplierById_notFound_returns404() throws Exception {
        when(supplierService.getSupplierById(99L)).thenThrow(new RuntimeException("Not found"));

        mockMvc.perform(get("/api/suppliers/99"))
                .andExpect(status().isNotFound());
    }
}
