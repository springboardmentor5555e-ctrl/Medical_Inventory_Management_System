package com.medistock.config;

import com.medistock.entity.User;
import com.medistock.constant.RoleName;
import com.medistock.repository.UserRepository;
import com.medistock.service.EmailNotificationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Optional;


@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final EmailNotificationService emailService;

    @Value("${medistock.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();

        String email    = oidcUser.getEmail();
        String fullName = oidcUser.getFullName();
        String googleId = oidcUser.getSubject();

        log.info("Google OAuth2 success for: {} ({})", email, fullName);

        // Find existing user or auto-register
        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            log.info("Existing MediStock user found: {}", user.getUsername());
        } else {
            // Auto-register as STAFF
            String username = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "_");
            // Ensure unique username
            String finalUsername = username;
            int attempt = 1;
            while (userRepository.existsByUsername(finalUsername)) {
                finalUsername = username + attempt++;
            }

            user = User.builder()
                    .username(finalUsername)
                    .password("OAUTH2_NO_PASSWORD_" + googleId) // Not usable for local login
                    .fullName(fullName != null ? fullName : finalUsername)
                    .email(email)
                    .role(RoleName.STAFF)
                    .status("ACTIVE")
                    .joinedDate(LocalDate.now())
                    .build();

            userRepository.save(user);
            log.info("New MediStock user auto-registered via Google OAuth2: {}", finalUsername);

            // Send welcome email
            try {
                emailService.sendWelcomeEmail(user.getFullName(), user.getUsername(), "STAFF", email);
            } catch (Exception e) {
                log.warn("Could not send welcome email: {}", e.getMessage());
            }
        }

        // Build a simple JWT-like token (same format as the existing AuthService)
        String mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIiICsgdXNlci5nZXRVc2VybmFtZSgpICsgIlwifQ==";

        // Redirect to frontend with token as URL param — frontend will store it
        String redirectUrl = frontendUrl + "/oauth2/callback"
                + "?token=" + mockToken
                + "&id=" + user.getId()
                + "&username=" + user.getUsername()
                + "&email=" + user.getEmail()
                + "&fullName=" + java.net.URLEncoder.encode(user.getFullName(), "UTF-8")
                + "&role=" + user.getRole().name()
                + "&status=" + user.getStatus();

        log.info("Redirecting OAuth2 user to frontend: {}", frontendUrl + "/oauth2/callback");
        response.sendRedirect(redirectUrl);
    }
}
