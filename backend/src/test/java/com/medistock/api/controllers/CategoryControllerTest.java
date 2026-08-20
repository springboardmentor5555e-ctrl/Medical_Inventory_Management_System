package com.medistock.api.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medistock.api.dto.CategoryRequest;
import com.medistock.api.models.Category;
import com.medistock.api.services.CategoryService;
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
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CategoryService categoryService;

    private CategoryRequest buildRequest() {
        CategoryRequest req = new CategoryRequest();
        req.setName("Antibiotics");
        return req;
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void getAllCategories_anyRole_returns200() throws Exception {
        Category cat = new Category();
        cat.setId(1L);
        cat.setName("Antibiotics");

        when(categoryService.getAllCategories()).thenReturn(List.of(cat));

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Antibiotics"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createCategory_asAdmin_returns200() throws Exception {
        Category cat = new Category();
        cat.setId(1L);
        cat.setName("Antibiotics");

        when(categoryService.createCategory(any(CategoryRequest.class))).thenReturn(cat);

        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Antibiotics"));
    }

    @Test
    @WithMockUser(roles = "PHARMACIST")
    void createCategory_asPharmacist_returns403() throws Exception {
        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildRequest())))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void createCategory_asStaff_returns403() throws Exception {
        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildRequest())))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateCategory_asAdmin_returns200() throws Exception {
        Category updated = new Category();
        updated.setId(1L);
        updated.setName("Painkillers");

        when(categoryService.updateCategory(eq(1L), any(CategoryRequest.class))).thenReturn(updated);

        CategoryRequest req = new CategoryRequest();
        req.setName("Painkillers");

        mockMvc.perform(put("/api/categories/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Painkillers"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteCategory_asAdmin_returns200() throws Exception {
        doNothing().when(categoryService).deleteCategory(1L);

        mockMvc.perform(delete("/api/categories/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Category deleted successfully"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getCategoryById_notFound_returns404() throws Exception {
        when(categoryService.getCategoryById(99L)).thenThrow(new RuntimeException("Not found"));

        mockMvc.perform(get("/api/categories/99"))
                .andExpect(status().isNotFound());
    }
}
