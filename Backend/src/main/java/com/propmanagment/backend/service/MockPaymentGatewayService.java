package com.propmanagment.backend.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.propmanagment.backend.model.Payment;

@Service
public class MockPaymentGatewayService implements PaymentGatewayService {
    
    // In a real implementation, this would be replaced with actual payment gateway integration
    // For example, with Stripe, PayPal, or Razorpay
    
    @Override
    public boolean processPayment(Payment payment) {
        // Simulate payment processing
        // In a real implementation, this would call the payment gateway API
        
        // For demo purposes, we'll simulate a successful payment 90% of the time
        // and a failed payment 10% of the time
        double random = Math.random();
        return random > 0.1; // 90% success rate
    }
    
    @Override
    public boolean refundPayment(Payment payment) {
        // Simulate refund processing
        // In a real implementation, this would call the payment gateway API
        
        // For demo purposes, we'll simulate a successful refund
        return true;
    }
    
    @Override
    public String getTransactionId() {
        // Generate a mock transaction ID
        return "txn_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}
