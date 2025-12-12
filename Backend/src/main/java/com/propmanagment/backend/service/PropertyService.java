package com.propmanagment.backend.service;

import com.propmanagment.backend.dto.PropertyDTO;
import com.propmanagment.backend.model.Property;
import com.propmanagment.backend.model.User;
import com.propmanagment.backend.model.PropertyType;
import com.propmanagment.backend.model.FurnishingType;
import com.propmanagment.backend.repository.PropertyRepository;
import com.propmanagment.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class PropertyService {

    @Autowired
    private PropertyRepository propertyRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }
    
    public Optional<Property> getPropertyById(Long id) {
        return propertyRepository.findById(id);
    }
    
    public List<Property> getPropertiesByOwner(Long ownerId) {
        return userRepository.findById(ownerId)
                .map(propertyRepository::findByOwner)
                .orElse(List.of());
    }
    
    public Property createProperty(Property property) {
        return propertyRepository.save(property);
    }
    
    // ✅ Helper: Validate image data
    private void validateImageUrls(List<String> imageUrls) {
        if (imageUrls == null) return;

        if (imageUrls.size() > 10) {
            throw new RuntimeException("Maximum of 10 images allowed per property.");
        }

        for (String imageUrl : imageUrls) {
            if (imageUrl != null && !imageUrl.isEmpty()) {
                if (!(imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("data:image/"))) {
                    throw new RuntimeException("Invalid image format. Only image URLs or base64 images are allowed.");
                }
            }
        }
    }

    public Property createPropertyFromDTO(PropertyDTO propertyDTO) {
        log.info("Creating property from DTO: {}", propertyDTO);
        
        if (propertyDTO.getOwnerId() == null) {
            log.warn("Property must have an owner ID");
            throw new RuntimeException("Property must have an owner ID");
        }
        
        Optional<User> owner = userRepository.findById(propertyDTO.getOwnerId());
        if (owner.isEmpty()) {
            log.warn("Owner not found with id: {}", propertyDTO.getOwnerId());
            throw new RuntimeException("Owner not found with id: " + propertyDTO.getOwnerId());
        }
        
        try {
            validateImageUrls(propertyDTO.getImageUrls());
        } catch (RuntimeException e) {
            log.warn("Image validation failed: {}", e.getMessage());
            throw e;
        }
        
        Property property = new Property();
        property.setTitle(propertyDTO.getTitle());
        property.setDescription(propertyDTO.getDescription());
        property.setLocation(propertyDTO.getLocation());
        property.setRent(propertyDTO.getRent());
        property.setBhk(propertyDTO.getBhk());
        property.setBath(propertyDTO.getBath());
        property.setSize(propertyDTO.getSize());
        property.setPropertyType(propertyDTO.getPropertyType());
        property.setFurnishing(propertyDTO.getFurnishing());
        property.setAmenities(propertyDTO.getAmenities());
        property.setImageUrls(propertyDTO.getImageUrls());
        property.setOwner(owner.get());
        
        log.info("Saving property to database");
        Property savedProperty = propertyRepository.save(property);
        log.info("Property saved with ID: {}", savedProperty.getId());
        
        return savedProperty;
    }
    
    public List<Property> getPropertiesByOwnerWithApprovalStatus(Long ownerId, boolean approvedOnly) {
        Optional<User> owner = userRepository.findById(ownerId);
        if (owner.isPresent()) {
            if (approvedOnly) {
                return propertyRepository.findByOwnerAndApprovedTrue(owner.get());
            } else {
                return propertyRepository.findByOwner(owner.get());
            }
        }
        return List.of();
    }
    
    public Property updateProperty(Long id, Property propertyDetails) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));
        
        try {
            validateImageUrls(propertyDetails.getImageUrls());
        } catch (RuntimeException e) {
            log.warn("Image validation failed: {}", e.getMessage());
            throw e;
        }
        
        property.setTitle(propertyDetails.getTitle());
        property.setDescription(propertyDetails.getDescription());
        property.setLocation(propertyDetails.getLocation());
        property.setRent(propertyDetails.getRent());
        property.setBhk(propertyDetails.getBhk());
        property.setBath(propertyDetails.getBath());
        property.setSize(propertyDetails.getSize());
        property.setPropertyType(propertyDetails.getPropertyType());
        property.setFurnishing(propertyDetails.getFurnishing());
        property.setAmenities(propertyDetails.getAmenities());
        property.setImageUrls(propertyDetails.getImageUrls());
        
        if (propertyDetails.getOwner() != null && propertyDetails.getOwner().getId() != null) {
            userRepository.findById(propertyDetails.getOwner().getId())
                    .ifPresent(property::setOwner);
        }
        
        return propertyRepository.save(property);
    }
    
    public Property updatePropertyFromDTO(Long id, PropertyDTO propertyDTO) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));
        
        try {
            validateImageUrls(propertyDTO.getImageUrls());
        } catch (RuntimeException e) {
            log.warn("Image validation failed: {}", e.getMessage());
            throw e;
        }
        
        property.setTitle(propertyDTO.getTitle());
        property.setDescription(propertyDTO.getDescription());
        property.setLocation(propertyDTO.getLocation());
        property.setRent(propertyDTO.getRent());
        property.setBhk(propertyDTO.getBhk());
        property.setBath(propertyDTO.getBath());
        property.setSize(propertyDTO.getSize());
        property.setPropertyType(propertyDTO.getPropertyType());
        property.setFurnishing(propertyDTO.getFurnishing());
        property.setAmenities(propertyDTO.getAmenities());
        property.setImageUrls(propertyDTO.getImageUrls());
        
        if (propertyDTO.getOwnerId() != null) {
            userRepository.findById(propertyDTO.getOwnerId())
                    .ifPresent(property::setOwner);
        }
        
        return propertyRepository.save(property);
    }
    
    public void deleteProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));
        propertyRepository.delete(property);
    }
    
    public List<Property> searchProperties(String location, Integer bhk, Double minRent, Double maxRent, String propertyType, String furnishing) {
        PropertyType propertyTypeEnum = propertyType != null ? PropertyType.valueOf(propertyType.toUpperCase()) : null;
        FurnishingType furnishingEnum = furnishing != null ? FurnishingType.valueOf(furnishing.toUpperCase()) : null;
        return propertyRepository.searchProperties(location, bhk, minRent, maxRent, propertyTypeEnum, furnishingEnum);
    }
}
