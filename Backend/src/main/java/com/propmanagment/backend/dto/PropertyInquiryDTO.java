package com.propmanagment.backend.dto;

import com.propmanagment.backend.model.InquiryStatus;
import java.time.LocalDateTime;

public class PropertyInquiryDTO {
    private Long id;
    private Long propertyId;
    private String propertyTitle;
    private Long renterId;
    private String renterName;
    private String renterEmail;
    private String renterPhone;
    private String message;
    private LocalDateTime createdAt;
    private InquiryStatus status;
    private String replyMessage;
    private LocalDateTime repliedAt;
    
    // Constructors
    public PropertyInquiryDTO() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getPropertyId() {
        return propertyId;
    }
    
    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }
    
    public String getPropertyTitle() {
        return propertyTitle;
    }
    
    public void setPropertyTitle(String propertyTitle) {
        this.propertyTitle = propertyTitle;
    }
    
    public Long getRenterId() {
        return renterId;
    }
    
    public void setRenterId(Long renterId) {
        this.renterId = renterId;
    }
    
    public String getRenterName() {
        return renterName;
    }
    
    public void setRenterName(String renterName) {
        this.renterName = renterName;
    }
    
    public String getRenterEmail() {
        return renterEmail;
    }
    
    public void setRenterEmail(String renterEmail) {
        this.renterEmail = renterEmail;
    }
    
    public String getRenterPhone() {
        return renterPhone;
    }
    
    public void setRenterPhone(String renterPhone) {
        this.renterPhone = renterPhone;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public InquiryStatus getStatus() {
        return status;
    }
    
    public void setStatus(InquiryStatus status) {
        this.status = status;
    }
    
    public String getReplyMessage() {
        return replyMessage;
    }
    
    public void setReplyMessage(String replyMessage) {
        this.replyMessage = replyMessage;
    }
    
    public LocalDateTime getRepliedAt() {
        return repliedAt;
    }
    
    public void setRepliedAt(LocalDateTime repliedAt) {
        this.repliedAt = repliedAt;
    }
}