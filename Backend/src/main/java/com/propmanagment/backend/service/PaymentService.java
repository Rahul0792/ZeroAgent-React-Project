package com.propmanagment.backend.service;

import com.propmanagment.backend.model.Payment;
import com.propmanagment.backend.model.Property;
import com.propmanagment.backend.model.User;
import com.propmanagment.backend.model.PaymentStatus;
import com.propmanagment.backend.repository.PaymentRepository;
import com.propmanagment.backend.repository.PropertyRepository;
import com.propmanagment.backend.repository.UserRepository;
import com.propmanagment.backend.service.EmailService;
import com.propmanagment.backend.service.PaymentGatewayService;
import com.propmanagment.backend.dto.PaymentDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class PaymentService {
    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private PropertyRepository propertyRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PaymentGatewayService paymentGatewayService;
    
    // Convert Payment entity to PaymentDTO
    public PaymentDTO convertToDTO(Payment payment) {
        // Create property DTO
        PaymentDTO.PropertyDTO propertyDTO = null;
        if (payment.getProperty() != null) {
            Property property = payment.getProperty();
            propertyDTO = new PaymentDTO.PropertyDTO(
                property.getId(),
                property.getTitle(),
                property.getLocation(),
                property.getRent()
            );
        }
        
        // Create renter DTO
        PaymentDTO.UserDTO renterDTO = null;
        if (payment.getRenter() != null) {
            User renter = payment.getRenter();
            renterDTO = new PaymentDTO.UserDTO(
                renter.getId(),
                renter.getName(),
                renter.getEmail()
            );
        }
        
        // Create owner DTO
        PaymentDTO.UserDTO ownerDTO = null;
        if (payment.getOwner() != null) {
            User owner = payment.getOwner();
            ownerDTO = new PaymentDTO.UserDTO(
                owner.getId(),
                owner.getName(),
                owner.getEmail()
            );
        }
        
        return new PaymentDTO(
            payment.getId(),
            propertyDTO,
            renterDTO,
            ownerDTO,
            payment.getAmount(),
            payment.getPaymentDate(),
            payment.getStatus(),
            payment.getTransactionId(),
            payment.getPaymentMethod(),
            payment.getDescription(),
            payment.getCreatedAt(),
            payment.getUpdatedAt()
        );
    }
    
    public List<PaymentDTO> getPaymentsByRenterDTO(Long renterId) {
        Optional<User> renter = userRepository.findById(renterId);
        if (renter.isPresent()) {
            List<Payment> payments = paymentRepository.findByRenter(renter.get());
            return payments.stream().map(this::convertToDTO).collect(Collectors.toList());
        }
        return List.of();
    }
    
    
    
    public List<Payment> getPaymentsByRenter(Long renterId) {
        Optional<User> renter = userRepository.findById(renterId);
        if (renter.isPresent()) {
            return paymentRepository.findByRenter(renter.get());
        }
        return List.of();
    }
    
    public List<Payment> getPaymentsByOwner(Long ownerId) {
        Optional<User> owner = userRepository.findById(ownerId);
        if (owner.isPresent()) {
            return paymentRepository.findByOwner(owner.get());
        }
        return List.of();
    }
    
    public List<Payment> getPaymentsByProperty(Long propertyId) {
        Optional<Property> property = propertyRepository.findById(propertyId);
        if (property.isPresent()) {
            return paymentRepository.findByProperty(property.get());
        }
        return List.of();
    }
    
    public Payment createPayment(Long propertyId, Long renterId, Double amount, String description) {
        Optional<Property> property = propertyRepository.findById(propertyId);
        Optional<User> renter = userRepository.findById(renterId);
        
        if (property.isPresent() && renter.isPresent()) {
            // Get the property owner
            User owner = property.get().getOwner();
            
            // Create payment
            Payment payment = new Payment(property.get(), renter.get(), owner, amount, description);
            Payment savedPayment = paymentRepository.save(payment);
            
            // Process payment through payment gateway
            boolean paymentSuccess = paymentGatewayService.processPayment(savedPayment);
            
            if (paymentSuccess) {
                // Update payment status to completed
                savedPayment.setStatus(PaymentStatus.COMPLETED);
                savedPayment.setTransactionId(paymentGatewayService.getTransactionId());
                savedPayment.setPaymentDate(LocalDateTime.now());
                savedPayment.setUpdatedAt(LocalDateTime.now());
                Payment updatedPayment = paymentRepository.save(savedPayment);
                
                // Send success emails
                sendPaymentSuccessEmails(updatedPayment);
                
                return updatedPayment;
            } else {
                // Update payment status to failed
                savedPayment.setStatus(PaymentStatus.FAILED);
                savedPayment.setUpdatedAt(LocalDateTime.now());
                Payment updatedPayment = paymentRepository.save(savedPayment);
                
                // Send failure notification
                sendPaymentFailureEmails(updatedPayment);
                
                throw new RuntimeException("Payment processing failed");
            }
        }
        throw new RuntimeException("Property or Renter not found");
    }
    
    public Payment updatePaymentStatus(Long paymentId, PaymentStatus status, String transactionId) {
        Optional<Payment> paymentOptional = paymentRepository.findById(paymentId);
        if (paymentOptional.isPresent()) {
            Payment payment = paymentOptional.get();
            payment.setStatus(status);
            payment.setTransactionId(transactionId);
            payment.setUpdatedAt(LocalDateTime.now());
            
            Payment updatedPayment = paymentRepository.save(payment);
            
            // If payment is completed, send confirmation
            if (status == PaymentStatus.COMPLETED) {
                sendPaymentSuccessEmails(updatedPayment);
            }
            
            return updatedPayment;
        }
        throw new RuntimeException("Payment not found");
    }
    
    public void deletePayment(Long paymentId) {
        paymentRepository.deleteById(paymentId);
    }
    
    // Create a payment that has already been processed by an external gateway (like Razorpay)
    public Payment createProcessedPayment(Long propertyId, Long renterId, Double amount, String description, String transactionId) {
        Optional<Property> property = propertyRepository.findById(propertyId);
        Optional<User> renter = userRepository.findById(renterId);
        
        if (property.isPresent() && renter.isPresent()) {
            // Get the property owner
            User owner = property.get().getOwner();
            
            // Create payment
            Payment payment = new Payment(property.get(), renter.get(), owner, amount, description);
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setTransactionId(transactionId);
            payment.setPaymentDate(LocalDateTime.now());
            Payment savedPayment = paymentRepository.save(payment);
            
            // Send success emails
            sendPaymentSuccessEmails(savedPayment);
            
            return savedPayment;
        }
        throw new RuntimeException("Property or Renter not found");
    }
    
    // Admin methods
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
    
    public Payment getPaymentById(Long paymentId) {
        Optional<Payment> payment = paymentRepository.findById(paymentId);
        return payment.orElse(null);
    }
    
    public boolean refundPayment(Long paymentId) {
        Optional<Payment> paymentOptional = paymentRepository.findById(paymentId);
        if (paymentOptional.isPresent()) {
            Payment payment = paymentOptional.get();
            // In a real implementation, we would call the payment gateway to process the refund
            // For now, we'll just update the status
            payment.setStatus(PaymentStatus.REFUNDED);
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            
            // Send refund notification emails
            sendRefundNotificationEmails(payment);
            
            return true;
        }
        return false;
    }
    
    private void sendRefundNotificationEmails(Payment payment) {
        try {
            // Send email to renter
            String renterSubject = "Payment Refunded for " + payment.getProperty().getTitle();
            String renterMessage = "Hello " + payment.getRenter().getName() + ",\n\n" +
                                 "Your payment of ₹" + payment.getAmount() + " for property \"" + 
                                 payment.getProperty().getTitle() + "\" has been refunded.\n\n" +
                                 "Payment ID: " + payment.getId() + "\n" +
                                 "Refund Amount: ₹" + payment.getAmount() + "\n" +
                                 "Refund Date: " + payment.getUpdatedAt() + "\n\n" +
                                 "The refund will be processed to your original payment method.\n\n" +
                                 "Best regards,\n" +
                                 "Property Management Team";
            
            emailService.sendInquiryReplyEmail(payment.getRenter().getEmail(), renterSubject, renterMessage);
            
            // Send email to owner
            String ownerSubject = "Payment Refunded for " + payment.getProperty().getTitle();
            String ownerMessage = "Hello " + payment.getOwner().getName() + ",\n\n" +
                                "A payment of ₹" + payment.getAmount() + " from " +
                                payment.getRenter().getName() + " for your property \"" + 
                                payment.getProperty().getTitle() + "\" has been refunded.\n\n" +
                                "Payment ID: " + payment.getId() + "\n" +
                                "Refund Amount: ₹" + payment.getAmount() + "\n" +
                                "Refund Date: " + payment.getUpdatedAt() + "\n\n" +
                                "The refund has been processed.\n\n" +
                                "Best regards,\n" +
                                "Property Management Team";
            
            emailService.sendInquiryReplyEmail(payment.getOwner().getEmail(), ownerSubject, ownerMessage);
        } catch (Exception e) {
            logger.error("Failed to send refund notification emails: " + e.getMessage(), e);
        }
    }
    
    private void sendPaymentConfirmationEmails(Payment payment) {
        try {
            // Send email to renter
            String renterSubject = "Payment Confirmation for " + payment.getProperty().getTitle();
            String renterMessage = "Hello " + payment.getRenter().getName() + ",\n\n" +
                                 "Your payment of ₹" + payment.getAmount() + " for property \"" + 
                                 payment.getProperty().getTitle() + "\" has been initiated.\n\n" +
                                 "Payment ID: " + payment.getId() + "\n" +
                                 "Property: " + payment.getProperty().getTitle() + "\n" +
                                 "Amount: ₹" + payment.getAmount() + "\n" +
                                 "Date: " + payment.getCreatedAt() + "\n\n" +
                                 "We will notify you once the payment is processed.\n\n" +
                                 "Best regards,\n" +
                                 "Property Management Team";
            
            emailService.sendInquiryReplyEmail(payment.getRenter().getEmail(), renterSubject, renterMessage);
            
            // Send email to owner
            String ownerSubject = "Payment Initiated for " + payment.getProperty().getTitle();
            String ownerMessage = "Hello " + payment.getOwner().getName() + ",\n\n" +
                                "A payment of ₹" + payment.getAmount() + " has been initiated by " +
                                payment.getRenter().getName() + " for your property \"" + 
                                payment.getProperty().getTitle() + "\".\n\n" +
                                "Payment ID: " + payment.getId() + "\n" +
                                "Renter: " + payment.getRenter().getName() + "\n" +
                                "Amount: ₹" + payment.getAmount() + "\n" +
                                "Date: " + payment.getCreatedAt() + "\n\n" +
                                "We will notify you once the payment is processed.\n\n" +
                                "Best regards,\n" +
                                "Property Management Team";
            
            emailService.sendInquiryReplyEmail(payment.getOwner().getEmail(), ownerSubject, ownerMessage);
        } catch (Exception e) {
            logger.error("Failed to send payment confirmation emails: " + e.getMessage(), e);
        }
    }
    
    private void sendPaymentSuccessEmails(Payment payment) {
        try {
            // Send email to renter
            String renterSubject = "Payment Successful for " + payment.getProperty().getTitle();
            String renterMessage = "Hello " + payment.getRenter().getName() + ",\n\n" +
                                 "Your payment of ₹" + payment.getAmount() + " for property \"" + 
                                 payment.getProperty().getTitle() + "\" has been successfully processed.\n\n" +
                                 "Payment ID: " + payment.getId() + "\n" +
                                 "Transaction ID: " + payment.getTransactionId() + "\n" +
                                 "Property: " + payment.getProperty().getTitle() + "\n" +
                                 "Amount: ₹" + payment.getAmount() + "\n" +
                                 "Date: " + payment.getPaymentDate() + "\n\n" +
                                 "Thank you for your payment!\n\n" +
                                 "Best regards,\n" +
                                 "Property Management Team";
            
            emailService.sendInquiryReplyEmail(payment.getRenter().getEmail(), renterSubject, renterMessage);
            
            // Send email to owner
            String ownerSubject = "Payment Received for " + payment.getProperty().getTitle();
            String ownerMessage = "Hello " + payment.getOwner().getName() + ",\n\n" +
                                "A payment of ₹" + payment.getAmount() + " has been successfully processed from " +
                                payment.getRenter().getName() + " for your property \"" + 
                                payment.getProperty().getTitle() + "\".\n\n" +
                                "Payment ID: " + payment.getId() + "\n" +
                                "Transaction ID: " + payment.getTransactionId() + "\n" +
                                "Renter: " + payment.getRenter().getName() + "\n" +
                                "Amount: ₹" + payment.getAmount() + "\n" +
                                "Date: " + payment.getPaymentDate() + "\n\n" +
                                "The payment has been received successfully.\n\n" +
                                "Best regards,\n" +
                                "Property Management Team";
            
            emailService.sendInquiryReplyEmail(payment.getOwner().getEmail(), ownerSubject, ownerMessage);
        } catch (Exception e) {
            logger.error("Failed to send payment success emails: " + e.getMessage(), e);
        }
    }
    
    private void sendPaymentFailureEmails(Payment payment) {
        try {
            // Send email to renter
            String renterSubject = "Payment Failed for " + payment.getProperty().getTitle();
            String renterMessage = "Hello " + payment.getRenter().getName() + ",\n\n" +
                                 "Your payment of ₹" + payment.getAmount() + " for property \"" + 
                                 payment.getProperty().getTitle() + "\" has failed.\n\n" +
                                 "Payment ID: " + payment.getId() + "\n" +
                                 "Property: " + payment.getProperty().getTitle() + "\n" +
                                 "Amount: ₹" + payment.getAmount() + "\n" +
                                 "Date: " + payment.getCreatedAt() + "\n\n" +
                                 "Please try again or contact support.\n\n" +
                                 "Best regards,\n" +
                                 "Property Management Team";
            
            emailService.sendInquiryReplyEmail(payment.getRenter().getEmail(), renterSubject, renterMessage);
            
            // Send email to owner
            String ownerSubject = "Payment Failed from " + payment.getRenter().getName();
            String ownerMessage = "Hello " + payment.getOwner().getName() + ",\n\n" +
                                "A payment of ₹" + payment.getAmount() + " from " +
                                payment.getRenter().getName() + " for your property \"" + 
                                payment.getProperty().getTitle() + "\" has failed.\n\n" +
                                "Payment ID: " + payment.getId() + "\n" +
                                "Renter: " + payment.getRenter().getName() + "\n" +
                                "Amount: ₹" + payment.getAmount() + "\n" +
                                "Date: " + payment.getCreatedAt() + "\n\n" +
                                "The renter has been notified and may try again.\n\n" +
                                "Best regards,\n" +
                                "Property Management Team";
            
            emailService.sendInquiryReplyEmail(payment.getOwner().getEmail(), ownerSubject, ownerMessage);
        } catch (Exception e) {
            logger.error("Failed to send payment failure emails: " + e.getMessage(), e);
        }
    }
}