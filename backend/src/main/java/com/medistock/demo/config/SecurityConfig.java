package com.medistock.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

        // ==================================================
        // CSRF
        // ==================================================

        .csrf(
                csrf -> csrf.disable()
        )

        // ==================================================
        // CORS
        // ==================================================

        .cors(
                Customizer.withDefaults()
        )

        // ==================================================
        // SESSION
        // ==================================================

        .sessionManagement(
                session -> session.sessionCreationPolicy(
                        SessionCreationPolicy.STATELESS
                )
        )

        // ==================================================
        // AUTHORIZATION
        // ==================================================

        .authorizeHttpRequests(auth -> auth

                // ==================================================
                // CORS OPTIONS
                // ==================================================

                .requestMatchers(
                        HttpMethod.OPTIONS,
                        "/**"
                )
                .permitAll()

                // ==================================================
                // PUBLIC
                // ==================================================

                .requestMatchers(
                        "/",
                        "/error",
                        "/favicon.ico",
                        "/api/auth/**"
                )
                .permitAll()

                // ==================================================
                // VIEW MEDICINES
                // ==================================================

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/medicines/**"
                )
                .permitAll()

                // ==================================================
                // ADD MEDICINES
                // ==================================================

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/medicines/**"
                )
                .permitAll()

                // ==================================================
                // EDIT MEDICINES
                // ==================================================

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/medicines/**"
                )
                .hasRole("ADMIN")

                // ==================================================
                // DELETE MEDICINES
                // ==================================================

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/medicines/**"
                )
                .hasRole("ADMIN")

                // ==================================================
                // USER PROFILE
                // ==================================================

                .requestMatchers(
                        "/api/users/profile",
                        "/api/users/change-password",
                        "/api/users/update-profile"
                )
                .authenticated()

                // ==================================================
                // ADMIN USER MANAGEMENT
                // ==================================================

                .requestMatchers(
                        "/api/users",
                        "/api/users/**"
                )
                .hasRole("ADMIN")

                // ==================================================
                // DASHBOARD
                // ==================================================

                .requestMatchers(
                        "/api/dashboard/**"
                )
                .hasAnyRole(
                        "ADMIN",
                        "PHARMACIST",
                        "STAFF"
                )

                // ==================================================
                // NOTIFICATIONS
                // ==================================================

                .requestMatchers(
                        "/api/notifications/**"
                )
                .hasAnyRole(
                        "ADMIN",
                        "PHARMACIST",
                        "STAFF"
                )

                // ==================================================
                // ADMIN MODULES
                // ==================================================
/// ==================================================
// SUPPLIERS
// ==================================================

.requestMatchers(
        HttpMethod.GET,
        "/api/suppliers/**"
)
.permitAll()

.requestMatchers(
        HttpMethod.POST,
        "/api/suppliers/**"
)
.permitAll()

.requestMatchers(
        HttpMethod.PUT,
        "/api/suppliers/**"
)
.permitAll()

.requestMatchers(
        HttpMethod.DELETE,
        "/api/suppliers/**"
)
.permitAll()
// ==================================================
// OTHER ADMIN MODULES
// ==================================================

.requestMatchers(
        "/api/stock-logs/**",
        "/api/stock-alerts/**",
        "/api/expiry/**",
        "/api/analytics/**",
        "/api/reports/**",
        "/api/purchase-orders/**"
)
.hasRole("ADMIN")
                // ==================================================
                // SALES
                // ==================================================

                .requestMatchers(
                        "/api/sales/**"
                )
                .hasAnyRole(
                        "ADMIN",
                        "PHARMACIST"
                )

                // ==================================================
                // PHARMACIST MODULES
                // ==================================================

                .requestMatchers(
                        "/api/pharmacist/**"
                )
                .hasRole("PHARMACIST")

                // ==================================================
                // ADMIN STOCK UPDATE
                // ==================================================

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/staff/stock/update/**"
                )
                .hasRole("ADMIN")

                // ==================================================
                // STAFF MODULES
                // ==================================================

                .requestMatchers(
                        "/api/staff/**"
                )
                .hasRole("STAFF")
// ==================================================
// ADMIN REGISTRATION REQUESTS
// ==================================================

.requestMatchers(
        "/api/admin/registration-requests/**"
)
.hasRole("ADMIN")
                // ==================================================
                // EVERYTHING ELSE
                // ==================================================
                
                .anyRequest()
                .authenticated()
        )

        // ==================================================
        // DISABLE DEFAULT LOGIN
        // ==================================================

        .formLogin(
                form -> form.disable()
        )

        .httpBasic(
                basic -> basic.disable()
        );

        // ==================================================
        // JWT FILTER
        // ==================================================

        http.addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }

    // ==================================================
    // PASSWORD ENCODER
    // ==================================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }
}