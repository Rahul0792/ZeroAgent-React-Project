package com.propmanagment.backend.service;

import com.propmanagment.backend.model.PropertyInquiry;
import com.propmanagment.backend.model.Property;
import com.propmanagment.backend.model.User;
import com.propmanagment.backend.model.InquiryStatus;
import com.propmanagment.backend.repository.PropertyInquiryRepository;
import com.propmanagment.backend.repository.PropertyRepository;
import com.propmanagment.backend.repository.UserRepository;
import com.propmanagment.backend.dto.PropertyInquiryDTO;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PropertyInquiryService {
    
    @Autowired
    private PropertyInquiryRepository propertyInquiryRepository;
    
    @Autowired
    private PropertyRepository propertyRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
    
    public List<PropertyInquiry> getInquiriesByProperty(Long propertyId) {
        Optional<Property> property = propertyRepository.findById(propertyId);
        if (property.isPresent()) {
            return propertyInquiryRepository.findByProperty(property.get());
        }
        return List.of();
    }
    
    public List<PropertyInquiryDTO> getInquiriesByOwnerDTO(Long ownerId) {
        Optional<User> owner = userRepository.findById(ownerId);
        if (owner.isPresent()) {
            List<PropertyInquiry> inquiries = propertyInquiryRepository.findByPropertyOwner(owner.get());
            return inquiries.stream().map(this::convertToDTO).collect(Collectors.toList());
        }
        return List.of();
    }
    
    public List<PropertyInquiryDTO> getInquiriesByRenterDTO(Long renterId) {
        Optional<User> renter = userRepository.findById(renterId);
        if (renter.isPresent()) {
            List<PropertyInquiry> inquiries = propertyInquiryRepository.findByRenter(renter.get());
            return inquiries.stream().map(this::convertToDTO).collect(Collectors.toList());
        }
        return List.of();
    }
    
    public PropertyInquiry createInquiry(Long propertyId, Long renterId, String message) {
        Optional<Property> property = propertyRepository.findById(propertyId);
        Optional<User> renter = userRepository.findById(renterId);
        
        if (property.isPresent() && renter.isPresent()) {
            PropertyInquiry inquiry = new PropertyInquiry(property.get(), renter.get(), message);
            return propertyInquiryRepository.save(inquiry);
        }
        throw new RuntimeException("Property or Renter not found");
    }
    
    public PropertyInquiry replyToInquiry(Long inquiryId, String replyMessage, Long ownerId) {
        Optional<PropertyInquiry> inquiryOptional = propertyInquiryRepository.findById(inquiryId);
        if (inquiryOptional.isPresent()) {
            PropertyInquiry inquiry = inquiryOptional.get();
            
            // Verify that the owner owns this property
            if (!inquiry.getProperty().getOwner().getId().equals(ownerId)) {
                throw new RuntimeException("You can only reply to inquiries for your own properties");
            }
            
            // Update inquiry with reply details
            inquiry.setStatus(InquiryStatus.REPLIED);
            inquiry.setReplyMessage(replyMessage);
            inquiry.setRepliedAt(LocalDateTime.now());
            PropertyInquiry updatedInquiry = propertyInquiryRepository.save(inquiry);
            
            // Send email to renter
            String subject = "Response to your inquiry about " + inquiry.getProperty().getTitle();
            String message = "Hello " + inquiry.getRenter().getName() + ",\n\n" +
                           "Thank you for your interest in our property: " + inquiry.getProperty().getTitle() + ".\n\n" +
                           "Here is our response to your inquiry:\n" + replyMessage + "\n\n" +
                           "Best regards,\n" +
                           inquiry.getProperty().getOwner().getName();
            
            emailService.sendInquiryReplyEmail(inquiry.getRenter().getEmail(), subject, message);
            
            return updatedInquiry;
        }
        throw new RuntimeException("Inquiry not found");
    }
    
    public PropertyInquiry updateInquiryStatus(Long inquiryId, InquiryStatus status) {
        Optional<PropertyInquiry> inquiryOptional = propertyInquiryRepository.findById(inquiryId);
        if (inquiryOptional.isPresent()) {
            PropertyInquiry inquiry = inquiryOptional.get();
            inquiry.setStatus(status);
            return propertyInquiryRepository.save(inquiry);
        }
        throw new RuntimeException("Inquiry not found");
    }
    
    public void deleteInquiry(Long inquiryId) {
        propertyInquiryRepository.deleteById(inquiryId);
    }
    
    private PropertyInquiryDTO convertToDTO(PropertyInquiry inquiry) {
        PropertyInquiryDTO dto = new PropertyInquiryDTO();
        dto.setId(inquiry.getId());
        dto.setPropertyId(inquiry.getProperty().getId());
        dto.setPropertyTitle(inquiry.getProperty().getTitle());
        dto.setRenterId(inquiry.getRenter().getId());
        dto.setRenterName(inquiry.getRenter().getName());
        dto.setRenterEmail(inquiry.getRenter().getEmail());
        dto.setRenterPhone(inquiry.getRenter().getPhone());
        dto.setMessage(inquiry.getMessage());
        dto.setCreatedAt(inquiry.getCreatedAt());
        dto.setStatus(inquiry.getStatus());
        dto.setReplyMessage(inquiry.getReplyMessage());
        dto.setRepliedAt(inquiry.getRepliedAt());
        return dto;
    }
}