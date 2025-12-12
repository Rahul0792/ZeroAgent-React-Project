package com.propmanagment.backend.controller;

import com.propmanagment.backend.service.RazorpayService;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/razorpay")
@CrossOrigin(origins = {"*"})
public class RazorpayController {
    
    private static final Logger logger = LoggerFactory.getLogger(RazorpayController.class);
    
    @Autowired
    private RazorpayService razorpayService;
    
    // Create a Razorpay order
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestParam Double amount, @RequestParam String currency) {
        logger.info("Received request to create Razorpay order for amount: {} currency: {}", amount, currency);
        
        // Validate parameters
        if (amount == null || amount <= 0) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid amount");
            errorResponse.put("message", "Amount must be greater than zero");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        if (currency == null || currency.trim().isEmpty()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid currency");
            errorResponse.put("message", "Currency is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        // Validate currency is supported
        if (!"INR".equals(currency)) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Unsupported currency");
            errorResponse.put("message", "Only INR currency is supported");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        // Additional validation for test environment
        if (amount > 10000) { // Limit for test environment
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Amount too high");
            errorResponse.put("message", "For testing, amount must be less than ₹10,000");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        try {
            String orderId = razorpayService.createOrder(amount, currency);
            
            Map<String, String> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("amount", String.valueOf(amount * 100)); // Amount in paise
            response.put("currency", currency);
            response.put("receipt", "receipt_" + System.currentTimeMillis());
            
            logger.info("Successfully created Razorpay order with ID: {} and amount: {}", orderId, amount * 100);
            return ResponseEntity.ok(response);
        } catch (RazorpayException e) {
            logger.error("Failed to create Razorpay order", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create Razorpay order");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Verify a Razorpay payment
    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(
        @RequestParam String paymentId,
        @RequestParam String orderId,
        @RequestParam String signature) {
        logger.info("Received request to verify Razorpay payment with paymentId: {} orderId: {} signature: {}", paymentId, orderId, signature != null ? "provided" : "null");
        
        // Validate parameters
        if (paymentId == null || paymentId.trim().isEmpty()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid paymentId");
            errorResponse.put("message", "Payment ID is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        if (orderId == null || orderId.trim().isEmpty()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid orderId");
            errorResponse.put("message", "Order ID is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        if (signature == null || signature.trim().isEmpty()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid signature");
            errorResponse.put("message", "Signature is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        try {
            boolean isVerified = razorpayService.verifyPayment(paymentId, orderId, signature);
            
            Map<String, Object> response = new HashMap<>();
            response.put("verified", isVerified);
            if (isVerified) {
                response.put("message", "Payment verified successfully");
            } else {
                response.put("message", "Payment verification failed");
            }
            
            logger.info("Payment verification result: {}", isVerified);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to verify Razorpay payment", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to verify payment");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Handle preflight requests
    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }
}