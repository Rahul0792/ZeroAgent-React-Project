package com.propmanagment.backend.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Paths;
import com.propmanagment.backend.dto.PropertyDTO;
import com.propmanagment.backend.model.Property;
import com.propmanagment.backend.model.User;
import com.propmanagment.backend.service.PropertyService;
import com.propmanagment.backend.service.UserService;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "*")
public class PropertyController {
    private static final Logger logger = LoggerFactory.getLogger(PropertyController.class);
    
    @Autowired
    private PropertyService propertyService;
    
    @Autowired
    private UserService userService;
    
    // Allow all users (renters and owners) to view approved properties only
    @GetMapping
    public List<Property> getAllProperties() {
        return propertyService.getAllProperties();
    }
    
    // Allow all users (renters and owners) to view a specific approved property
    @GetMapping("/{id}")
    public ResponseEntity<Property> getPropertyById(@PathVariable Long id) {
        return propertyService.getPropertyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Allow all users (renters and owners) to search approved properties
    @GetMapping("/search")
    public List<Property> searchProperties(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer bhk,
            @RequestParam(required = false) Double minRent,
            @RequestParam(required = false) Double maxRent,
            @RequestParam(required = false) String propertyType,
            @RequestParam(required = false) String furnishing) {
        return propertyService.searchProperties(location, bhk, minRent, maxRent, propertyType, furnishing);
    }
    
    // Only owners can list properties, and they can only list properties for themselves
    @PostMapping
    public ResponseEntity<?> createProperty(@RequestBody PropertyDTO propertyDTO, @RequestHeader("User-Id") Long userId) {
        try {
            logger.info("Received property creation request, User ID from header: {}, Property DTO: {}", userId, propertyDTO);
            
            // Verify user exists and is an owner
            Optional<User> userOptional = userService.getUserById(userId);
            if (!userOptional.isPresent()) {
                logger.warn("User not found with ID: {}", userId);
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User user = userOptional.get();
            logger.info("User found: {} with role: {}", user.getName(), user.getRole());
            
            if (!"OWNER".equals(user.getRole().toString())) {
                logger.warn("User is not an owner. Role: {}", user.getRole());
                return ResponseEntity.badRequest().body("Only owners can list properties");
            }
            
            // Set the owner ID to the authenticated user
            propertyDTO.setOwnerId(userId);
            
            logger.info("Creating property with DTO: {}", propertyDTO);
            Property createdProperty = propertyService.createPropertyFromDTO(propertyDTO);
            logger.info("Property created successfully with ID: {}", createdProperty.getId());
            
            return ResponseEntity.ok(createdProperty);
        } catch (Exception e) {
            logger.error("Exception occurred: {}", e.getMessage(), e);
            // Return a proper JSON error response
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    // Only owners can update their own properties
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProperty(@PathVariable Long id, @RequestBody PropertyDTO propertyDTO, @RequestHeader("User-Id") Long userId) {
        try {
            // Verify user exists and is an owner
            Optional<User> userOptional = userService.getUserById(userId);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User user = userOptional.get();
            if (!"OWNER".equals(user.getRole().toString())) {
                return ResponseEntity.badRequest().body("Only owners can update properties");
            }
            
            // Verify the property belongs to this owner
            Optional<Property> propertyOptional = propertyService.getPropertyById(id);
            if (!propertyOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Property property = propertyOptional.get();
            if (!property.getOwnerId().equals(userId)) {
                return ResponseEntity.badRequest().body("You can only update your own properties");
            }
            
            Property updatedProperty = propertyService.updatePropertyFromDTO(id, propertyDTO);
            return ResponseEntity.ok(updatedProperty);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    // Only owners can delete their own properties
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProperty(@PathVariable Long id, @RequestHeader("User-Id") Long userId) {
        try {
            // Verify user exists and is an owner
            Optional<User> userOptional = userService.getUserById(userId);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User user = userOptional.get();
            if (!"OWNER".equals(user.getRole().toString())) {
                return ResponseEntity.badRequest().body("Only owners can delete properties");
            }
            
            // Verify the property belongs to this owner
            Optional<Property> propertyOptional = propertyService.getPropertyById(id);
            if (!propertyOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Property property = propertyOptional.get();
            if (!property.getOwnerId().equals(userId)) {
                return ResponseEntity.badRequest().body("You can only delete your own properties");
            }
            
            propertyService.deleteProperty(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    // Allow owners to get their own properties (regardless of approval status)
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<?> getPropertiesByOwner(@PathVariable Long ownerId, @RequestHeader("User-Id") Long userId) {
        try {
            // Verify user exists
            Optional<User> userOptional = userService.getUserById(userId);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            // Users can only view their own properties
            if (!ownerId.equals(userId)) {
                return ResponseEntity.badRequest().body("You can only view your own properties");
            }
            
            List<Property> properties = propertyService.getPropertiesByOwnerWithApprovalStatus(ownerId, false);
            return ResponseEntity.ok(properties);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    // Endpoint for owners to get their approved properties only
    @GetMapping("/owner/{ownerId}/approved")
    public ResponseEntity<?> getApprovedPropertiesByOwner(@PathVariable Long ownerId, @RequestHeader("User-Id") Long userId) {
        try {
            // Verify user exists
            Optional<User> userOptional = userService.getUserById(userId);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            // Users can only view their own properties
            if (!ownerId.equals(userId)) {
                return ResponseEntity.badRequest().body("You can only view your own properties");
            }
            
            List<Property> properties = propertyService.getPropertiesByOwnerWithApprovalStatus(ownerId, true);
            return ResponseEntity.ok(properties);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    
    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("image") MultipartFile file) {
        try {
            // ✅ Create an "uploads" folder inside your project directory (if not exists)
            String uploadDir = System.getProperty("user.dir") + "/uploads/";
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // ✅ Create a unique filename
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

            // ✅ Save the file
            Path filePath = Paths.get(uploadDir, fileName);
            Files.write(filePath, file.getBytes());

            // ✅ Return public URL
            String fileUrl = "http://192.168.31.224:8080/uploads/" + fileName;
            return ResponseEntity.ok(fileUrl);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Image upload failed: " + e.getMessage());
        }
    }
}