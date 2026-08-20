package com.medistock.api.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medistock.api.dto.UpdateUserRequest;
import com.medistock.api.dto.UserDTO;
import com.medistock.api.models.UserRole;
import com.medistock.api.services.UserService;
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
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    private UserDTO buildUserDTO() {
        UserDTO dto = new UserDTO();
        dto.setId(1L);
        dto.setUsername("johndoe");
        dto.setEmail("john@example.com");
        dto.setRole(UserRole.PHARMACIST);
        return dto;
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllUsers_asAdmin_returns200() throws Exception {
        when(userService.getAllUsers()).thenReturn(List.of(buildUserDTO()));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("johndoe"))
                .andExpect(jsonPath("$[0].role").value("PHARMACIST"));
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void getAllUsers_asStaff_returns403() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PHARMACIST")
    void getAllUsers_asPharmacist_returns403() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getUserById_asAdmin_returns200() throws Exception {
        when(userService.getUserById(1L)).thenReturn(buildUserDTO());

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("john@example.com"));
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void updateUser_asAdmin_returns200() throws Exception {
        UpdateUserRequest req = new UpdateUserRequest();
        req.setEmail("newemail@example.com");

        UserDTO updated = buildUserDTO();
        updated.setEmail("newemail@example.com");

        when(userService.updateUser(eq(1L), any(UpdateUserRequest.class), eq("admin")))
                .thenReturn(updated);

        mockMvc.perform(put("/api/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("newemail@example.com"));
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void deleteUser_asAdmin_returns200() throws Exception {
        doNothing().when(userService).deleteUser(eq(1L), eq("admin"));

        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "johndoe", roles = "PHARMACIST")
    void getProfile_returnsOwnProfile() throws Exception {
        when(userService.getProfile("johndoe")).thenReturn(buildUserDTO());

        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("johndoe"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getUserById_notFound_returns400() throws Exception {
        when(userService.getUserById(99L)).thenThrow(new RuntimeException("User not found"));

        mockMvc.perform(get("/api/users/99"))
                .andExpect(status().isBadRequest());
    }
}
