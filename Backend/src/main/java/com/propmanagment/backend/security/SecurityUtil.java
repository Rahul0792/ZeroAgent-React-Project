package com.propmanagment.backend.security;

import com.propmanagment.backend.model.User;
import com.propmanagment.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class SecurityUtil {

    @Autowired
    private UserService userService;

    /**
     * Get the currently authenticated user from the security context
     * @return Optional containing the current user, or empty if not authenticated
     */
    public Optional<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return Optional.empty();
        }

        // The principal in authentication should be the email for our setup
        String email = authentication.getName();
        return userService.findByEmail(email);
    }

    /**
     * Get the ID of the currently authenticated user
     * @return Optional containing the current user ID, or empty if not authenticated
     */
    public Optional<Long> getCurrentUserId() {
        return getCurrentUser().map(User::getId);
    }
}