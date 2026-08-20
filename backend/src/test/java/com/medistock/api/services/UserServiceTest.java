package com.medistock.api.services;

import com.medistock.api.config.JWTUtil;
import com.medistock.api.dto.*;
import com.medistock.api.models.User;
import com.medistock.api.models.UserRole;
import com.medistock.api.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JWTUtil jwtUtil;

    @InjectMocks
    private UserService userService;

    private User adminUser;
    private User staffUser;

    @BeforeEach
    void setUp() {
        adminUser = new User("admin", "encoded_pass", "admin@test.com", UserRole.ADMIN);
        adminUser.setId(1L);

        staffUser = new User("staff1", "encoded_pass2", "staff@test.com", UserRole.STAFF);
        staffUser.setId(2L);
    }

    // ── Register ──────────────────────────────────────────────────────────────

    @Test
    void register_success() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("newuser");
        req.setEmail("new@test.com");
        req.setPassword("password");
        req.setRole(UserRole.STAFF);

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenReturn(staffUser);

        User result = userService.register(req);
        assertNotNull(result);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_duplicateUsername_throwsException() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("admin");
        req.setEmail("other@test.com");
        req.setPassword("pass");
        req.setRole(UserRole.STAFF);

        when(userRepository.existsByUsername("admin")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> userService.register(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_duplicateEmail_throwsException() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("newuser");
        req.setEmail("admin@test.com");
        req.setPassword("pass");
        req.setRole(UserRole.STAFF);

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("admin@test.com")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> userService.register(req));
        verify(userRepository, never()).save(any());
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    @Test
    void getAllUsers_returnsList() {
        when(userRepository.findAll()).thenReturn(List.of(adminUser, staffUser));

        List<UserDTO> result = userService.getAllUsers();

        assertEquals(2, result.size());
        assertEquals("admin", result.get(0).getUsername());
    }

    @Test
    void getUserById_found() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));

        UserDTO dto = userService.getUserById(1L);

        assertEquals("admin", dto.getUsername());
        assertEquals(UserRole.ADMIN, dto.getRole());
    }

    @Test
    void getUserById_notFound_throwsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> userService.getUserById(99L));
    }

    @Test
    void updateUser_roleChange_success() {
        UpdateUserRequest req = new UpdateUserRequest();
        req.setRole(UserRole.PHARMACIST);

        when(userRepository.findById(2L)).thenReturn(Optional.of(staffUser));
        when(userRepository.save(any(User.class))).thenReturn(staffUser);

        UserDTO dto = userService.updateUser(2L, req, "admin");

        verify(userRepository).save(staffUser);
    }

    @Test
    void deleteUser_selfDeletion_throwsException() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));

        assertThrows(RuntimeException.class, () -> userService.deleteUser(1L, "admin"));
        verify(userRepository, never()).delete(any());
    }

    @Test
    void deleteUser_otherUser_success() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(staffUser));

        userService.deleteUser(2L, "admin");

        verify(userRepository).delete(staffUser);
    }

    // ── Change Password ───────────────────────────────────────────────────────

    @Test
    void changePassword_correctCurrentPassword_success() {
        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setCurrentPassword("rawpass");
        req.setNewPassword("newpass123");

        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        when(passwordEncoder.matches("rawpass", "encoded_pass")).thenReturn(true);
        when(passwordEncoder.encode("newpass123")).thenReturn("new_encoded");
        when(userRepository.save(any(User.class))).thenReturn(adminUser);

        userService.changePassword("admin", req);

        assertEquals("new_encoded", adminUser.getPassword());
        verify(userRepository).save(adminUser);
    }

    @Test
    void changePassword_wrongCurrentPassword_throwsException() {
        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setCurrentPassword("wrongpass");
        req.setNewPassword("newpass123");

        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        when(passwordEncoder.matches("wrongpass", "encoded_pass")).thenReturn(false);

        assertThrows(RuntimeException.class, () -> userService.changePassword("admin", req));
        verify(userRepository, never()).save(any());
    }
}
