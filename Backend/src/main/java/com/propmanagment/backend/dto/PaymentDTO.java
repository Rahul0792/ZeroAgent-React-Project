package com.propmanagment.backend.dto;

import com.propmanagment.backend.model.PaymentStatus;
import java.time.LocalDateTime;

public class PaymentDTO {
    private Long id;
    private PropertyDTO property;
    private UserDTO renter;
    private UserDTO owner;
    private Double amount;
    private LocalDateTime paymentDate;
    private PaymentStatus status;
    private String transactionId;
    private String paymentMethod;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public PaymentDTO() {}

    public PaymentDTO(Long id, PropertyDTO property, UserDTO renter, UserDTO owner, Double amount,
                     LocalDateTime paymentDate, PaymentStatus status, String transactionId,
                     String paymentMethod, String description, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.property = property;
        this.renter = renter;
        this.owner = owner;
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.status = status;
        this.transactionId = transactionId;
        this.paymentMethod = paymentMethod;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PropertyDTO getProperty() {
        return property;
    }

    public void setProperty(PropertyDTO property) {
        this.property = property;
    }

    public UserDTO getRenter() {
        return renter;
    }

    public void setRenter(UserDTO renter) {
        this.renter = renter;
    }

    public UserDTO getOwner() {
        return owner;
    }

    public void setOwner(UserDTO owner) {
        this.owner = owner;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Inner classes for related entities
    public static class PropertyDTO {
        private Long id;
        private String title;
        private String location;
        private Double rent;

        public PropertyDTO() {}

        public PropertyDTO(Long id, String title, String location, Double rent) {
            this.id = id;
            this.title = title;
            this.location = location;
            this.rent = rent;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public Double getRent() {
            return rent;
        }

        public void setRent(Double rent) {
            this.rent = rent;
        }
    }

    public static class UserDTO {
        private Long id;
        private String name;
        private String email;

        public UserDTO() {}

        public UserDTO(Long id, String name, String email) {
            this.id = id;
            this.name = name;
            this.email = email;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }
}