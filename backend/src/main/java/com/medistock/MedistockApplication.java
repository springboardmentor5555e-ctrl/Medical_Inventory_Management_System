package com.medistock;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MedistockApplication {
    public static void main(String[] args) {
        SpringApplication.run(MedistockApplication.class, args);
    }
}
