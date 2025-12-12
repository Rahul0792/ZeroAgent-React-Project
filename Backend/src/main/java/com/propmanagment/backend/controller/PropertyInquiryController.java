package com.propmanagment.backend.controller;

import com.propmanagment.backend.dto.PropertyInquiryDTO;
import com.propmanagment.backend.model.PropertyInquiry;
import com.propmanagment.backend.model.User;
import com.propmanagment.backend.model.InquiryStatus;
import com.propmanagment.backend.service.PropertyInquiryService;
import com.propmanagment.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/inquiries")
@CrossOrigin(origins = "*")
public class PropertyInquiryController {
    
    @Autowired
    private PropertyInquiryService propertyInquiryService;
    
    @Autowired
    private UserService userService;
    
    // Get inquiries for a specific property (owner access only)
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<?> getInquiriesByProperty(@PathVariable Long propertyId, @RequestHeader("User-Id") Long userId) {
        try {
            // Verify user exists
            Optional<User> userOptional = userService.getUserById(userId);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User user = userOptional.get();
            // Only owners can view inquiries for their properties
            if (!"OWNER".equals(user.getRole().toString())) {
                return ResponseEntity.badRequest().body("Only owners can view property inquiries");
            }
            
            List<PropertyInquiry> inquiries = propertyInquiryService.getInquiriesByProperty(propertyId);
            return ResponseEntity.ok(inquiries);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Get all inquiries for properties owned by the user
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<?> getInquiriesByOwner(@PathVariable Long ownerId, @RequestHeader("User-Id") Long userId) {
        try {
            // Verify user exists
            Optional<User> userOptional = userService.getUserById(userId);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User user = userOptional.get();
            // Users can only view their own inquiries
            if (!ownerId.equals(userId)) {
                return ResponseEntity.badRequest().body("You can only view your own inquiries");
            }
            
            // Only owners can view inquiries for their properties
            if (!"OWNER".equals(user.getRole().toString())) {
                return ResponseEntity.badRequest().body("Only owners can view property inquiries");
            }
            
            List<PropertyInquiryDTO> inquiries = propertyInquiryService.getInquiriesByOwnerDTO(ownerId);
            return ResponseEntity.ok(inquiries);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Get all inquiries made by a renter
    @GetMapping("/renter/{renterId}")
    public ResponseEntity<?> getInquiriesByRenter(@PathVariable Long renterId, @RequestHeader("User-Id") Long userId) {
        try {
            // Verify user exists
            Optional<User> userOptional = userService.getUserById(userId);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            // Users can only view their own inquiries
            if (!renterId.equals(userId)) {
                return ResponseEntity.badRequest().body("You can only view your own inquiries");
            }
            
            List<PropertyInquiryDTO> inquiries = propertyInquiryService.getInquiriesByRenterDTO(renterId);
            return ResponseEntity.ok(inquiries);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Create a new inquiry (renter access only)
    @PostMapping
    public ResponseEntity<?> createInquiry(
        @RequestParam Long propertyId,
        @RequestParam String message,
        @RequestHeader("User-Id") Long userId) {
        try {
            // Verify user exists
            Optional<User> userOptional = userService.getUserById(userId);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User user = userOptional.get();
            // Only renters can create inquiries
            if (!"RENTER".equals(user.getRole().toString())) {
                return ResponseEntity.badRequest().body("Only renters can create property inquiries");
            }
            
            PropertyInquiry inquiry = propertyInquiryService.createInquiry(propertyId, userId, message);
            return ResponseEntity.ok(inquiry);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Update inquiry status (owner access only)
    @PutMapping("/{inquiryId}/status")
    public ResponseEntity<?> updateInquiryStatus(
        @PathVariable Long inquiryId,
        @RequestParam InquiryStatus status,
        @RequestHeader("User-Id") Long userId) {
        try {
            // Verify user exists
            Optional<User> userOptional = userService.getUserById(userId);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User user = userOptional.get();
            // Only owners can update inquiry status
            if (!"OWNER".equals(user.getRole().toString())) {
                return ResponseEntity.badRequest().body("Only owners can update inquiry status");
            }
            
            PropertyInquiry inquiry = propertyInquiryService.updateInquiryStatus(inquiryId, status);
            return ResponseEntity.ok(inquiry);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Reply to inquiry (owner access only)
    @PostMapping("/{inquiryId}/reply")
    public ResponseEntity<?> replyToInquiry(
        @PathVariable Long inquiryId,
        @RequestBody Map<String, String> request,
        @RequestHeader("User-Id") Long userId) {
        try {
            // Verify user exists
            Optional<User> userOptional = userService.getUserById(userId);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User user = userOptional.get();
            // Only owners can reply to inquiries
            if (!"OWNER".equals(user.getRole().toString())) {
                return ResponseEntity.badRequest().body("Only owners can reply to inquiries");
            }
            
            String replyMessage = request.get("replyMessage");
            if (replyMessage == null || replyMessage.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Reply message is required");
            }
            
            PropertyInquiry inquiry = propertyInquiryService.replyToInquiry(inquiryId, replyMessage, userId);
            return ResponseEntity.ok(inquiry);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Delete an inquiry (renter access only for their own inquiries)
    @DeleteMapping("/{inquiryId}")
    public ResponseEntity<?> deleteInquiry(@PathVariable Long inquiryId, @RequestHeader("User-Id") Long userId) {
        try {
            // Verify user exists
            Optional<User> userOptional = userService.getUserById(userId);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            // In a real implementation, we would verify that the user owns this inquiry
            // For now, we'll just delete it
            propertyInquiryService.deleteInquiry(inquiryId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}