package com.medistock.service;

import com.medistock.dto.SupplierDtos.SupplierRequest;
import com.medistock.entity.Medicine;
import com.medistock.entity.Supplier;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;

    public List<Supplier> getAll(String search) {
        if (search != null && !search.isBlank()) {
            return supplierRepository.findByNameContainingIgnoreCase(search);
        }
        return supplierRepository.findAll();
    }

    public Supplier getById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + id));
    }

    public Supplier create(SupplierRequest request) {
        Supplier supplier = Supplier.builder()
                .name(request.getName())
                .contactNumber(request.getContactNumber())
                .email(request.getEmail())
                .address(request.getAddress())
                .build();
        return supplierRepository.save(supplier);
    }

    public Supplier update(Long id, SupplierRequest request) {
        Supplier existing = getById(id);
        existing.setName(request.getName());
        existing.setContactNumber(request.getContactNumber());
        existing.setEmail(request.getEmail());
        existing.setAddress(request.getAddress());
        return supplierRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Supplier not found: " + id);
        }
        // Detach this supplier from any medicines using it first — deleting a
        // supplier must never delete or corrupt medicine records. Medicines
        // keep all their data, they just lose the supplier link.
        List<Medicine> affected = medicineRepository.findBySupplierId(id);
        for (Medicine medicine : affected) {
            medicine.setSupplier(null);
        }
        medicineRepository.saveAll(affected);

        supplierRepository.deleteById(id);
    }
}
