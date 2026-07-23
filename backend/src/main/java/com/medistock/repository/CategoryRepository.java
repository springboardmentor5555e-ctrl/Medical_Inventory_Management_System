package com.medistock.repository;

import com.medistock.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
    Boolean existsByName(String name);
    java.util.List<Category> findByOwnerId(Long ownerId);
    Optional<Category> findByNameAndOwnerId(String name, Long ownerId);
    Boolean existsByNameAndOwnerId(String name, Long ownerId);
}
