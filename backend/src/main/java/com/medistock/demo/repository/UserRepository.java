package com.medistock.demo.repository;

import com.medistock.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    boolean existsByEmail(String email);
    List<User> findByApprovedFalseAndRoleIn(
        List<String> roles
);
}