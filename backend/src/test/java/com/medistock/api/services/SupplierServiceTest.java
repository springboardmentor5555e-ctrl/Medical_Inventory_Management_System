package com.medistock.api.services;

import com.medistock.api.dto.SupplierRequest;
import com.medistock.api.models.Supplier;
import com.medistock.api.repositories.MedicineRepository;
import com.medistock.api.repositories.SupplierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupplierServiceTest {

    @Mock private SupplierRepository supplierRepository;
    @Mock private MedicineRepository medicineRepository;

    @InjectMocks
    private SupplierService supplierService;

    private Supplier testSupplier;

    @BeforeEach
    void setUp() {
        testSupplier = new Supplier("PharmaCo", "9999999999", "pharmaco@test.com", "123 Health St");
        testSupplier.setId(1L);
    }

    @Test
    void getAllSuppliers_returnsList() {
        when(supplierRepository.findAll()).thenReturn(List.of(testSupplier));

        List<Supplier> result = supplierService.getAllSuppliers();

        assertEquals(1, result.size());
        assertEquals("PharmaCo", result.get(0).getName());
    }

    @Test
    void getSupplierById_found() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(testSupplier));

        Supplier result = supplierService.getSupplierById(1L);

        assertEquals("PharmaCo", result.getName());
    }

    @Test
    void getSupplierById_notFound_throwsException() {
        when(supplierRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> supplierService.getSupplierById(99L));
    }

    @Test
    void createSupplier_success() {
        SupplierRequest req = new SupplierRequest();
        req.setName("MediPlus");
        req.setEmail("mediplus@test.com");
        req.setContactNumber("8888888888");
        req.setAddress("456 Pharma Ave");

        when(supplierRepository.existsByEmail("mediplus@test.com")).thenReturn(false);
        when(supplierRepository.save(any(Supplier.class))).thenReturn(testSupplier);

        Supplier result = supplierService.createSupplier(req);

        assertNotNull(result);
        verify(supplierRepository).save(any(Supplier.class));
    }

    @Test
    void createSupplier_duplicateEmail_throwsException() {
        SupplierRequest req = new SupplierRequest();
        req.setName("MediPlus");
        req.setEmail("pharmaco@test.com");

        when(supplierRepository.existsByEmail("pharmaco@test.com")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> supplierService.createSupplier(req));
        verify(supplierRepository, never()).save(any());
    }

    @Test
    void updateSupplier_success() {
        SupplierRequest req = new SupplierRequest();
        req.setName("PharmaCo Updated");
        req.setEmail("pharmaco@test.com");
        req.setContactNumber("7777777777");
        req.setAddress("New Address");

        when(supplierRepository.findById(1L)).thenReturn(Optional.of(testSupplier));
        when(supplierRepository.existsByEmailAndIdNot("pharmaco@test.com", 1L)).thenReturn(false);
        when(supplierRepository.save(any(Supplier.class))).thenReturn(testSupplier);

        Supplier result = supplierService.updateSupplier(1L, req);

        assertEquals("PharmaCo Updated", testSupplier.getName());
        verify(supplierRepository).save(testSupplier);
    }

    @Test
    void deleteSupplier_success() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(testSupplier));
        when(medicineRepository.findAll()).thenReturn(Collections.emptyList());

        supplierService.deleteSupplier(1L);

        verify(supplierRepository).deleteById(1L);
    }

    @Test
    void deleteSupplier_notFound_throwsException() {
        when(supplierRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> supplierService.deleteSupplier(99L));
        verify(supplierRepository, never()).deleteById(any());
    }
}
