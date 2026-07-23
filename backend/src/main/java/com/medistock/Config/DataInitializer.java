package com.medistock.config;

import com.medistock.entity.User;
import com.medistock.enums.Role;
import com.medistock.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@medistock.com").isEmpty()) {

            User admin = User.builder()
                    .name("Admin")
                    .email("admin@medistock.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .status("APPROVED")
                    .provider("local")
                    .build();

            userRepository.save(admin);

            System.out.println("Default Admin Created Successfully!");
        }
    }
}