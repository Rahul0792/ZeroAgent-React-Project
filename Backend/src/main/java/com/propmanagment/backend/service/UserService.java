package com.propmanagment.backend.service;

import com.propmanagment.backend.dto.LoginRequest;
import com.propmanagment.backend.model.User;
import com.propmanagment.backend.model.Role;
import com.propmanagment.backend.model.PasswordResetToken;
import com.propmanagment.backend.model.OtpCode;
import com.propmanagment.backend.repository.UserRepository;
import com.propmanagment.backend.repository.PasswordResetTokenRepository;
import com.propmanagment.backend.repository.OtpCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordResetTokenRepository tokenRepository;
    
    @Autowired
    private OtpCodeRepository otpCodeRepository;
    
    @Autowired
    private EmailService emailService;
    
    // Add BCryptPasswordEncoder
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
    // Remove the old registerUser method as it's now handled in AuthController
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Remove the old loginUser method as it's now handled in AuthController
    
    public User createUser(User user) {
        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        // Ensure the user has a valid role
        if (user.getRole() == null) {
            // Set role based on userType if provided
            if (user.getUserType() != null && !user.getUserType().isEmpty()) {
                try {
                    user.setRole(Role.valueOf(user.getUserType().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    user.setRole(Role.RENTER); // Default to RENTER
                }
            } else {
                user.setRole(Role.RENTER); // Default to RENTER if no role is specified
            }
        }
        
        // Hash the password before saving
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);
        return userRepository.save(user);
    }
    
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());
        user.setPhone(userDetails.getPhone());
        user.setRole(userDetails.getRole());
        
        // Hash the password if it's being updated
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            String hashedPassword = passwordEncoder.encode(userDetails.getPassword());
            user.setPassword(hashedPassword);
        }
        
        return userRepository.save(user);
    }
    
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        userRepository.delete(user);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    public Boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    // Add method to verify password
    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
    
    // Add method to encode password
    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
    
    // Password reset methods
    @Transactional
    public PasswordResetToken createPasswordResetToken(User user) {
        logger.info("Creating password reset token for user: {}", user.getEmail());
        
        // Delete any existing tokens for this user
        tokenRepository.deleteByUser(user);
        logger.info("Deleted existing tokens for user: {}", user.getEmail());
        
        // Create new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user, 24); // 24 hours expiry
        PasswordResetToken savedToken = tokenRepository.save(resetToken);
        logger.info("Saved new token for user: {}, token: {}", user.getEmail(), token);
        
        // Send email with reset link
        logger.info("Attempting to send email to: {}", user.getEmail());
        emailService.sendPasswordResetEmail(user.getEmail(), token);
        
        return savedToken;
    }
    
    public Optional<PasswordResetToken> validatePasswordResetToken(String token) {
        Optional<PasswordResetToken> resetToken = tokenRepository.findByToken(token);
        
        if (resetToken.isPresent() && !resetToken.get().isExpired()) {
            return resetToken;
        }
        
        return Optional.empty();
    }
    
    @Transactional
    public void changeUserPassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Delete the used token
        tokenRepository.deleteByUser(user);
    }
    
    // OTP methods
    @Transactional
    public OtpCode createOtpCode(User user) {
        logger.info("Creating OTP code for user: {}", user.getEmail());
        
        // Mark any existing unused OTP codes as used
        Optional<OtpCode> existingOtp = otpCodeRepository.findByEmailAndIsUsedFalseOrderByCreatedAtDesc(user.getEmail());
        if (existingOtp.isPresent()) {
            OtpCode otp = existingOtp.get();
            otp.setUsed(true);
            otpCodeRepository.save(otp);
            logger.info("Marked existing OTP as used for user: {}", user.getEmail());
        }
        
        // Generate a 4-digit numeric OTP
        String otpCode = String.format("%04d", (int) (Math.random() * 10000));
        
        // Create new OTP code (expires in 10 minutes)
        OtpCode otp = new OtpCode(user.getEmail(), otpCode, 10);
        OtpCode savedOtp = otpCodeRepository.save(otp);
        logger.info("Saved new OTP for user: {}, OTP: {}", user.getEmail(), otpCode);
        
        // Send email with OTP code
        logger.info("Attempting to send OTP email to: {}", user.getEmail());
        emailService.sendOtpEmail(user.getEmail(), otpCode);
        
        return savedOtp;
    }
    
    public Optional<OtpCode> validateOtpCode(String email, String otpCode) {
        Optional<OtpCode> otp = otpCodeRepository.findByEmailAndOtpCode(email, otpCode);
        
        if (otp.isPresent() && otp.get().isValid()) {
            return otp;
        }
        
        return Optional.empty();
    }
    
    @Transactional
    public void markOtpAsUsed(OtpCode otp) {
        otp.setUsed(true);
        otpCodeRepository.save(otp);
    }
}