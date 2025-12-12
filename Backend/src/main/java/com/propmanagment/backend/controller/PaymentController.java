package com.propmanagment.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.propmanagment.backend.dto.PaymentDTO;
import com.propmanagment.backend.dto.ProcessedPaymentDTO;
import com.propmanagment.backend.model.Payment;
import com.propmanagment.backend.model.PaymentStatus;
import com.propmanagment.backend.model.Role;
import com.propmanagment.backend.model.User;
import com.propmanagment.backend.security.SecurityUtil;
import com.propmanagment.backend.service.PaymentService;
import com.propmanagment.backend.service.UserService;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private SecurityUtil securityUtil;
    
    // Get all payments made by a renter
    @GetMapping("/renter/{renterId}")
    public ResponseEntity<?> getPaymentsByRenter(@PathVariable Long renterId) {
        try {
            // Get current user from security context
            Optional<User> userOptional = securityUtil.getCurrentUser();
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User currentUser = userOptional.get();
            // Users can only view their own payments
            // Fix: Allow the request if the current user is the renter whose payments are being requested
            // OR if the current user is an admin
            if (!renterId.equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
                return ResponseEntity.badRequest().body("You can only view your own payments");
            }
            
            List<PaymentDTO> payments = paymentService.getPaymentsByRenterDTO(renterId);
            return ResponseEntity.ok(payments);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Get all payments received by an owner
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<?> getPaymentsByOwner(@PathVariable Long ownerId) {
        try {
            // Get current user from security context
            Optional<User> userOptional = securityUtil.getCurrentUser();
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User currentUser = userOptional.get();
            // Users can only view their own payments
            if (!ownerId.equals(currentUser.getId())) {
                return ResponseEntity.badRequest().body("You can only view your own payments");
            }
            
            List<Payment> payments = paymentService.getPaymentsByOwner(ownerId);
            return ResponseEntity.ok(payments);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Get all payments for a specific property
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<?> getPaymentsByProperty(@PathVariable Long propertyId) {
        try {
            // Get current user from security context
            Optional<User> userOptional = securityUtil.getCurrentUser();
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            List<Payment> payments = paymentService.getPaymentsByProperty(propertyId);
            return ResponseEntity.ok(payments);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
 // Get all payments (admin only)
    @GetMapping
    public ResponseEntity<?> getAllPayments() {
        try {
            Optional<User> userOptional = securityUtil.getCurrentUser();
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }

            User user = userOptional.get();
            if (user.getRole() != Role.ADMIN) {
                return ResponseEntity.badRequest().body("Only admins can view all payments");
            }

            List<Payment> payments = paymentService.getAllPayments();
            return ResponseEntity.ok(payments);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    
    // Create a new payment (renter access only)
    @PostMapping
    public ResponseEntity<?> createPayment(
        @RequestParam Long propertyId,
        @RequestParam Double amount,
        @RequestParam String description) {
        try {
            // Get current user from security context
            Optional<User> userOptional = securityUtil.getCurrentUser();
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User user = userOptional.get();
            // Only renters can create payments
            if (user.getRole() != Role.RENTER) {
                return ResponseEntity.badRequest().body("Only renters can make payments");
            }
            
            Payment payment = paymentService.createPayment(propertyId, user.getId(), amount, description);
            return ResponseEntity.ok(payment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Create a payment that has already been processed by an external gateway (renter access only)
    @PostMapping("/processed")
    public ResponseEntity<?> createProcessedPayment(@RequestBody ProcessedPaymentDTO dto) {
        Optional<User> userOptional = securityUtil.getCurrentUser();
        if (!userOptional.isPresent()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        User user = userOptional.get();
        if (user.getRole() != Role.RENTER) {
            return ResponseEntity.badRequest().body("Only renters can make payments");
        }

        Payment payment = paymentService.createProcessedPayment(
            dto.getPropertyId(),
            user.getId(),
            dto.getAmount(),
            dto.getDescription(),
            dto.getTransactionId()
        );

        return ResponseEntity.ok(payment);
    }

    
    // Update payment status (used by payment gateway integration)
    @PutMapping("/{paymentId}/status")
    public ResponseEntity<?> updatePaymentStatus(
        @PathVariable Long paymentId,
        @RequestParam PaymentStatus status,
        @RequestParam(required = false) String transactionId) {
        try {
            // Get current user from security context
            Optional<User> userOptional = securityUtil.getCurrentUser();
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            // In a real implementation, this would be called by the payment gateway
            // For now, we'll allow it for testing
            Payment payment = paymentService.updatePaymentStatus(paymentId, status, transactionId);
            return ResponseEntity.ok(payment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Delete a payment (admin access only)
    @DeleteMapping("/{paymentId}")
    public ResponseEntity<?> deletePayment(@PathVariable Long paymentId) {
        try {
            // Get current user from security context
            Optional<User> userOptional = securityUtil.getCurrentUser();
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User user = userOptional.get();
            // Only admins can delete payments
            if (user.getRole() != Role.ADMIN) {
                return ResponseEntity.badRequest().body("Only admins can delete payments");
            }
            
            paymentService.deletePayment(paymentId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}