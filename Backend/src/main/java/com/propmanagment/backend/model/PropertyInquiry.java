package com.propmanagment.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "property_inquiries")
public class PropertyInquiry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "renter_id", nullable = false)
    private User renter;
    
    @Column(length = 1000, nullable = false)
    private String message;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InquiryStatus status;
    
    @Column(name = "reply_message", length = 1000)
    private String replyMessage;
    
    @Column(name = "replied_at")
    private LocalDateTime repliedAt;
    
    // Constructors
    public PropertyInquiry() {
        this.createdAt = LocalDateTime.now();
        this.status = InquiryStatus.PENDING;
    }
    
    public PropertyInquiry(Property property, User renter, String message) {
        this.property = property;
        this.renter = renter;
        this.message = message;
        this.createdAt = LocalDateTime.now();
        this.status = InquiryStatus.PENDING;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Property getProperty() {
        return property;
    }
    
    public void setProperty(Property property) {
        this.property = property;
    }
    
    public User getRenter() {
        return renter;
    }
    
    public void setRenter(User renter) {
        this.renter = renter;
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