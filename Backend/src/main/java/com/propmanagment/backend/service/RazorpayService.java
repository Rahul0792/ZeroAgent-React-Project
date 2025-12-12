package com.propmanagment.backend.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Order;
import com.razorpay.Payment;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.annotation.PostConstruct;

@Service
public class RazorpayService {
    
    private static final Logger logger = LoggerFactory.getLogger(RazorpayService.class);
    
    private RazorpayClient razorpayClient;
    
    // Initialize Razorpay client with credentials from application.properties
    @Value("${razorpay.key}")
    private String razorpayKey;
    
    @Value("${razorpay.secret}")
    private String razorpaySecret;
    
    @PostConstruct
    public void initRazorpayClient() throws RazorpayException {
        logger.info("Initializing Razorpay client with key: {}", razorpayKey);
        this.razorpayClient = new RazorpayClient(razorpayKey, razorpaySecret);
        logger.info("Razorpay client initialized successfully");
    }
    
    // Create a Razorpay order
    public String createOrder(double amount, String currency) throws RazorpayException {
        logger.info("Creating Razorpay order for amount: {} currency: {}", amount, currency);
        
        // Validate amount
        if (amount <= 0) {
            throw new RazorpayException("Invalid amount: " + amount);
        }
        
        JSONObject orderRequest = new JSONObject();
        int amountInPaise = (int)(amount * 100);
        logger.info("Amount in paise: {}", amountInPaise);
        orderRequest.put("amount", amountInPaise); // Convert to paise
        orderRequest.put("currency", currency);
        orderRequest.put("receipt", "receipt_" + System.currentTimeMillis());
        
        Order order = razorpayClient.orders.create(orderRequest);
        String orderId = order.get("id");
        logger.info("Razorpay order created successfully with ID: {}", orderId);
        return orderId;
    }
    
    // Verify a Razorpay payment
    public boolean verifyPayment(String paymentId, String orderId, String signature) {
        logger.info("Verifying Razorpay payment with paymentId: {} orderId: {}", paymentId, orderId);
        
        // Validate parameters
        if (paymentId == null || paymentId.trim().isEmpty()) {
            logger.error("Payment verification failed: paymentId is null or empty");
            return false;
        }
        
        if (orderId == null || orderId.trim().isEmpty()) {
            logger.error("Payment verification failed: orderId is null or empty");
            return false;
        }
        
        if (signature == null || signature.trim().isEmpty()) {
            logger.error("Payment verification failed: signature is null or empty");
            return false;
        }
        
        try {
            // Create a JSON object with the payment details
            JSONObject paymentResponse = new JSONObject();
            paymentResponse.put("razorpay_payment_id", paymentId);
            paymentResponse.put("razorpay_order_id", orderId);
            paymentResponse.put("razorpay_signature", signature);
            
            // Verify the payment signature using the secret key
            Utils.verifyPaymentSignature(paymentResponse, razorpaySecret);
            logger.info("Razorpay payment verified successfully");
            return true;
        } catch (Exception e) {
            logger.error("Failed to verify Razorpay payment", e);
            return false;
        }
    }
}