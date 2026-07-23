package com.medistock.security;

import com.medistock.security.oauth2.CustomOAuth2UserService;
import com.medistock.security.oauth2.OAuth2AuthenticationSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            CustomOAuth2UserService customOAuth2UserService,
            OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.customOAuth2UserService = customOAuth2UserService;
        this.oAuth2AuthenticationSuccessHandler = oAuth2AuthenticationSuccessHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public auth endpoints
                .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                .requestMatchers("/ws/**", "/ws-chat/**").permitAll()
                
                // Admin API
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // Customer API
                .requestMatchers("/api/customer/**").hasAnyRole("CUSTOMER", "ADMIN")

                // Chat API
                .requestMatchers("/api/chat/**").hasAnyRole("ADMIN", "PHARMACIST", "STAFF", "SUPPLIER", "CUSTOMER")

                // Partnerships
                .requestMatchers("/api/partnerships/**").hasAnyRole("ADMIN", "PHARMACIST", "SUPPLIER")

                // Coupons
                .requestMatchers(HttpMethod.GET, "/api/coupons/**").hasAnyRole("ADMIN", "PHARMACIST", "STAFF", "CUSTOMER")
                .requestMatchers("/api/coupons/**").hasAnyRole("ADMIN", "PHARMACIST")

                // Categories
                .requestMatchers(HttpMethod.GET, "/api/categories/**").hasAnyRole("ADMIN", "PHARMACIST", "STAFF", "CUSTOMER")
                .requestMatchers("/api/categories/**").hasAnyRole("ADMIN", "PHARMACIST")
                
                // Suppliers
                .requestMatchers(HttpMethod.GET, "/api/suppliers/**").hasAnyRole("ADMIN", "PHARMACIST", "STAFF", "SUPPLIER")
                .requestMatchers("/api/suppliers/**").hasAnyRole("ADMIN", "PHARMACIST")

                // Medicines
                .requestMatchers(HttpMethod.GET, "/api/medicines/**").hasAnyRole("ADMIN", "PHARMACIST", "STAFF", "CUSTOMER", "SUPPLIER")
                .requestMatchers("/api/medicines/**").hasAnyRole("ADMIN", "PHARMACIST")

                // Sales
                .requestMatchers(HttpMethod.POST, "/api/sales").hasAnyRole("ADMIN", "PHARMACIST", "STAFF", "CUSTOMER")
                .requestMatchers("/api/sales/**").hasAnyRole("ADMIN", "PHARMACIST", "STAFF", "CUSTOMER")

                // Reorder Requests
                .requestMatchers(HttpMethod.GET, "/api/reorders/**").hasAnyRole("ADMIN", "PHARMACIST", "STAFF", "SUPPLIER")
                .requestMatchers("/api/reorders/**").hasAnyRole("ADMIN", "PHARMACIST", "SUPPLIER")

                // Notifications
                .requestMatchers("/api/notifications/**").hasAnyRole("ADMIN", "PHARMACIST", "STAFF", "SUPPLIER", "CUSTOMER")

                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                .successHandler(oAuth2AuthenticationSuccessHandler)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:5173", "http://localhost:8080"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control", "X-Requested-With"));
        configuration.setExposedHeaders(Collections.singletonList("Authorization"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
