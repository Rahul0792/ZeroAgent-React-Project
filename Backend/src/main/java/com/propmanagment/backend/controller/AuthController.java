package com.propmanagment.backend.controller;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.propmanagment.backend.model.OtpCode;
import com.propmanagment.backend.model.PasswordResetToken;
import com.propmanagment.backend.model.User;
import com.propmanagment.backend.security.JwtUtil;
import com.propmanagment.backend.service.UserService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        Map<String, Object> response = new HashMap<>();

        if (email == null || password == null) {
            response.put("success", false);
            response.put("message", "Email and password are required");
            return ResponseEntity.badRequest().body(response);
        }

        Optional<User> userOptional = userService.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            boolean isHashed = user.getPassword().startsWith("$2a$") || user.getPassword().startsWith("$2y$")
                    || user.getPassword().startsWith("$2b$");
            boolean passwordValid = isHashed ? userService.verifyPassword(password, user.getPassword())
                    : password.equals(user.getPassword());

            if (passwordValid) {
                // Generate JWT
                String token = jwtUtil.generateToken(
                        user.getEmail(),
                        user.getName(),
                        user.getRole().name());

                response.put("success", true);
                response.put("message", "Login successful");
                response.put("token", token);
                response.put("user", Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole().name()));

                log.info("User {} logged in successfully", email);
                return ResponseEntity.ok(response);
            }
        }

        log.warn("Invalid login attempt for email: {}", email);
        response.put("success", false);
        response.put("message", "Invalid email or password");
        return ResponseEntity.status(401).body(response);
    }

    @PostMapping("/forgot-password")
    @Transactional
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        log.info("Forgot password request received for email: {}", email);

        Map<String, Object> response = new HashMap<>();

        if (email == null || email.isEmpty()) {
            response.put("success", false);
            response.put("message", "Email is required");
            return ResponseEntity.badRequest().body(response);
        }

        Optional<User> userOptional = userService.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            log.info("User found for email: {}", email);

            userService.createOtpCode(user);
            log.info("OTP code created and email sent for: {}", email);
        } else {
            log.warn("No user found for email: {}", email);
        }

        response.put("success", true);
        response.put("message",
                "If your email exists in our system, you will receive a 4-digit OTP code shortly.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otpCode = request.get("otp");
        
        Map<String, Object> response = new HashMap<>();
        
        if (email == null || email.isEmpty()) {
            response.put("success", false);
            response.put("message", "Email is required");
            return ResponseEntity.badRequest().body(response);
        }
        
        if (otpCode == null || otpCode.isEmpty()) {
            response.put("success", false);
            response.put("message", "OTP code is required");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Validate OTP
        Optional<OtpCode> otpOptional = userService.validateOtpCode(email, otpCode);
        
        if (otpOptional.isPresent()) {
            OtpCode otp = otpOptional.get();
            
            // Mark OTP as used
            userService.markOtpAsUsed(otp);
            
            response.put("success", true);
            response.put("message", "OTP verified successfully. You can now reset your password.");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Invalid or expired OTP code");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String confirmPassword = request.get("confirmPassword");
        
        Map<String, Object> response = new HashMap<>();
        
        // Validate input
        if (email == null || email.isEmpty()) {
            response.put("success", false);
            response.put("message", "Email is required");
            return ResponseEntity.badRequest().body(response);
        }
        
        if (password == null || password.isEmpty()) {
            response.put("success", false);
            response.put("message", "Password is required");
            return ResponseEntity.badRequest().body(response);
        }
        
        if (password.length() < 8) {
            response.put("success", false);
            response.put("message", "Password must be at least 8 characters long");
            return ResponseEntity.badRequest().body(response);
        }
        
        if (!password.equals(confirmPassword)) {
            response.put("success", false);
            response.put("message", "Passwords do not match");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Find user by email
        Optional<User> userOptional = userService.findByEmail(email);
        
        if (userOptional.isEmpty()) {
            response.put("success", false);
            response.put("message", "User not found");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Change password
        User user = userOptional.get();
        userService.changeUserPassword(user, password);
        
        response.put("success", true);
        response.put("message", "Password successfully reset. You can now login with your new password.");
        return ResponseEntity.ok(response);
    }
    
    // Keep the old endpoint for backward compatibility
    @PostMapping("/reset-password-old")
    public ResponseEntity<Map<String, Object>> resetPasswordOld(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String password = request.get("password");
        String confirmPassword = request.get("confirmPassword");
        
        Map<String, Object> response = new HashMap<>();
        
        // Validate input
        if (token == null || token.isEmpty()) {
            response.put("success", false);
            response.put("message", "Token is required");
            return ResponseEntity.badRequest().body(response);
        }
        
        if (password == null || password.isEmpty()) {
            response.put("success", false);
            response.put("message", "Password is required");
            return ResponseEntity.badRequest().body(response);
        }
        
        if (password.length() < 8) {
            response.put("success", false);
            response.put("message", "Password must be at least 8 characters long");
            return ResponseEntity.badRequest().body(response);
        }
        
        if (!password.equals(confirmPassword)) {
            response.put("success", false);
            response.put("message", "Passwords do not match");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Validate token
        Optional<PasswordResetToken> resetTokenOptional = userService.validatePasswordResetToken(token);
        
        if (resetTokenOptional.isEmpty()) {
            response.put("success", false);
            response.put("message", "Invalid or expired token");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Change password
        PasswordResetToken resetToken = resetTokenOptional.get();
        userService.changeUserPassword(resetToken.getUser(), password);
        
        response.put("success", true);
        response.put("message", "Password successfully reset. You can now login with your new password.");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/validate-token")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestParam String token) {
        Map<String, Object> response = new HashMap<>();
        
        if (token == null || token.isEmpty()) {
            response.put("success", false);
            response.put("message", "Token is required");
            return ResponseEntity.badRequest().body(response);
        }
        
        Optional<PasswordResetToken> resetTokenOptional = userService.validatePasswordResetToken(token);
        
        if (resetTokenOptional.isPresent()) {
            response.put("success", true);
            response.put("message", "Token is valid");
            response.put("email", resetTokenOptional.get().getUser().getEmail());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Invalid or expired token");
            return ResponseEntity.badRequest().body(response);
        }
    }
}