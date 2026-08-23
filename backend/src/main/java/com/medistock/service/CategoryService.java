package com.medistock.service;

import com.medistock.entity.Category;
import com.medistock.entity.Medicine;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.CategoryRepository;
import com.medistock.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final MedicineRepository medicineRepository;

    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    public Category create(Category category) {
        if (categoryRepository.existsByNameIgnoreCase(category.getName())) {
            throw new BadRequestException("Category already exists: " + category.getName());
        }
        return categoryRepository.save(category);
    }

    public Category update(Long id, Category updated) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        return categoryRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found: " + id);
        }
        // Detach this category from any medicines using it first, so deletion
        // never fails with a raw foreign-key constraint error — medicines keep
        // their data, they just lose this category tag.
        List<Medicine> affected = medicineRepository.findByCategoryId(id);
        for (Medicine medicine : affected) {
            medicine.setCategory(null);
        }
        medicineRepository.saveAll(affected);

        categoryRepository.deleteById(id);
    }
}
