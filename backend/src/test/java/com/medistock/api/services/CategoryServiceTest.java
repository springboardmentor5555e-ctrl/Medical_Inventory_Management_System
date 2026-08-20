package com.medistock.api.services;

import com.medistock.api.dto.CategoryRequest;
import com.medistock.api.models.Category;
import com.medistock.api.repositories.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category testCategory;

    @BeforeEach
    void setUp() {
        testCategory = new Category("Painkillers", "Pain relief medications");
        testCategory.setId(1L);
    }

    @Test
    void getAllCategories_returnsList() {
        when(categoryRepository.findAll()).thenReturn(List.of(testCategory));

        List<Category> result = categoryService.getAllCategories();

        assertEquals(1, result.size());
        assertEquals("Painkillers", result.get(0).getName());
    }

    @Test
    void getCategoryById_found() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));

        Category result = categoryService.getCategoryById(1L);

        assertEquals("Painkillers", result.getName());
    }

    @Test
    void getCategoryById_notFound_throwsException() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> categoryService.getCategoryById(99L));
    }

    @Test
    void createCategory_success() {
        CategoryRequest req = new CategoryRequest();
        req.setName("Antibiotics");
        req.setDescription("Antibiotic medications");

        when(categoryRepository.existsByName("Antibiotics")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);

        Category result = categoryService.createCategory(req);

        assertNotNull(result);
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    void createCategory_duplicateName_throwsException() {
        CategoryRequest req = new CategoryRequest();
        req.setName("Painkillers");

        when(categoryRepository.existsByName("Painkillers")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> categoryService.createCategory(req));
        verify(categoryRepository, never()).save(any());
    }

    @Test
    void updateCategory_success() {
        CategoryRequest req = new CategoryRequest();
        req.setName("Pain Relief");
        req.setDescription("Updated description");

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.existsByNameAndIdNot("Pain Relief", 1L)).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);

        Category result = categoryService.updateCategory(1L, req);

        assertEquals("Pain Relief", testCategory.getName());
        assertEquals("Updated description", testCategory.getDescription());
        verify(categoryRepository).save(testCategory);
    }

    @Test
    void updateCategory_duplicateName_throwsException() {
        CategoryRequest req = new CategoryRequest();
        req.setName("Antibiotics");

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.existsByNameAndIdNot("Antibiotics", 1L)).thenReturn(true);

        assertThrows(RuntimeException.class, () -> categoryService.updateCategory(1L, req));
        verify(categoryRepository, never()).save(any());
    }

    @Test
    void deleteCategory_success() {
        when(categoryRepository.existsById(1L)).thenReturn(true);

        categoryService.deleteCategory(1L);

        verify(categoryRepository).deleteById(1L);
    }

    @Test
    void deleteCategory_notFound_throwsException() {
        when(categoryRepository.existsById(99L)).thenReturn(false);

        assertThrows(RuntimeException.class, () -> categoryService.deleteCategory(99L));
        verify(categoryRepository, never()).deleteById(any());
    }
}
