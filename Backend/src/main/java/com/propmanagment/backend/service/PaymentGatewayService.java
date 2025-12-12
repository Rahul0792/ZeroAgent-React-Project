package com.propmanagment.backend.service;

import com.propmanagment.backend.model.Payment;

public interface PaymentGatewayService {
    /**
     * Process a payment through the payment gateway
     * @param payment The payment to process
     * @return true if payment was successful, false otherwise
     */
    boolean processPayment(Payment payment);
    
    /**
     * Refund a payment through the payment gateway
     * @param payment The payment to refund
     * @return true if refund was successful, false otherwise
     */
    boolean refundPayment(Payment payment);
    
    /**
     * Get the transaction ID from the payment gateway
     * @return The transaction ID
     */
    String getTransactionId();
}
