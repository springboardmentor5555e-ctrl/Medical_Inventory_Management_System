package com.medistock.service;

import com.medistock.dto.CategoryDTO;
import com.medistock.entity.Category;
import com.medistock.entity.User;
import com.medistock.enums.Role;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.CategoryRepository;
import com.medistock.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    private Long getCurrentOwnerId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal) {
            User user = ((UserPrincipal) principal).getUser();
            if (user.getRole() == Role.ADMIN) {
                return null;
            }
            if (user.getRole() == Role.STAFF) {
                return user.getOwnerId();
            }
            return user.getId();
        }
        return null;
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        Long ownerId = getCurrentOwnerId();
        List<Category> list = (ownerId != null) ? categoryRepository.findByOwnerId(ownerId) : categoryRepository.findAll();
        return list.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        Long ownerId = getCurrentOwnerId();
        if (ownerId != null && !ownerId.equals(category.getOwnerId())) {
            throw new AccessDeniedException("You do not have access to this category.");
        }
        return mapToDTO(category);
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO dto) {
        Long ownerId = getCurrentOwnerId();
        if (ownerId != null) {
            if (categoryRepository.existsByNameAndOwnerId(dto.getName(), ownerId)) {
                throw new IllegalArgumentException("Category with name '" + dto.getName() + "' already exists");
            }
        } else {
            if (categoryRepository.existsByName(dto.getName())) {
                throw new IllegalArgumentException("Category with name '" + dto.getName() + "' already exists");
            }
        }

        Category category = Category.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .ownerId(ownerId)
                .build();

        category = categoryRepository.save(category);
        return mapToDTO(category);
    }

    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        Long ownerId = getCurrentOwnerId();
        if (ownerId != null && !ownerId.equals(category.getOwnerId())) {
            throw new AccessDeniedException("You do not have permission to edit this category.");
        }

        if (!category.getName().equalsIgnoreCase(dto.getName())) {
            if (ownerId != null) {
                if (categoryRepository.existsByNameAndOwnerId(dto.getName(), ownerId)) {
                    throw new IllegalArgumentException("Category with name '" + dto.getName() + "' already exists");
                }
            } else {
                if (categoryRepository.existsByName(dto.getName())) {
                    throw new IllegalArgumentException("Category with name '" + dto.getName() + "' already exists");
                }
            }
        }

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category = categoryRepository.save(category);
        return mapToDTO(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        Long ownerId = getCurrentOwnerId();
        if (ownerId != null && !ownerId.equals(category.getOwnerId())) {
            throw new AccessDeniedException("You do not have permission to delete this category.");
        }
        categoryRepository.delete(category);
    }

    private CategoryDTO mapToDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }
}
