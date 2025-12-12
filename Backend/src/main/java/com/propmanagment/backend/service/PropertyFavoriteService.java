package com.propmanagment.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.propmanagment.backend.dto.PropertyFavoriteDTO;
import com.propmanagment.backend.model.Property;
import com.propmanagment.backend.model.PropertyFavorite;
import com.propmanagment.backend.model.User;
import com.propmanagment.backend.repository.PropertyFavoriteRepository;
import com.propmanagment.backend.repository.PropertyRepository;
import com.propmanagment.backend.repository.UserRepository;

@Service
public class PropertyFavoriteService {
    
    @Autowired
    private PropertyFavoriteRepository propertyFavoriteRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PropertyRepository propertyRepository;
    
    public List<PropertyFavoriteDTO> getFavoritesByUser(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            List<PropertyFavorite> favorites = propertyFavoriteRepository.findByUser(user.get());
            return favorites.stream().map(this::convertToDTO).collect(Collectors.toList());
        }
        return List.of();
    }
    
    public boolean isPropertyFavorited(Long userId, Long propertyId) {
        Optional<User> user = userRepository.findById(userId);
        Optional<Property> property = propertyRepository.findById(propertyId);
        
        if (user.isPresent() && property.isPresent()) {
            Optional<PropertyFavorite> favorite = propertyFavoriteRepository.findByUserAndProperty(user.get(), property.get());
            return favorite.isPresent();
        }
        return false;
    }
    
    public PropertyFavoriteDTO addFavorite(Long userId, Long propertyId) {
        Optional<User> user = userRepository.findById(userId);
        Optional<Property> property = propertyRepository.findById(propertyId);
        
        if (user.isPresent() && property.isPresent()) {
            // Check if already favorited - if so, just return the existing favorite
            Optional<PropertyFavorite> existingFavorite = propertyFavoriteRepository.findByUserAndProperty(user.get(), property.get());
            if (existingFavorite.isPresent()) {
                return convertToDTO(existingFavorite.get());
            }
            
            PropertyFavorite favorite = new PropertyFavorite(user.get(), property.get());
            PropertyFavorite savedFavorite = propertyFavoriteRepository.save(favorite);
            return convertToDTO(savedFavorite);
        }
        throw new RuntimeException("User or Property not found");
    }
    
    public void removeFavorite(Long userId, Long propertyId) {
        Optional<User> user = userRepository.findById(userId);
        Optional<Property> property = propertyRepository.findById(propertyId);
        
        if (user.isPresent() && property.isPresent()) {
            // Simply try to delete - if it doesn't exist, nothing happens
            propertyFavoriteRepository.deleteByUserAndProperty(user.get(), property.get());
        } else {
            throw new RuntimeException("User or Property not found");
        }
    }
    
    private PropertyFavoriteDTO convertToDTO(PropertyFavorite favorite) {
        PropertyFavoriteDTO dto = new PropertyFavoriteDTO();
        dto.setId(favorite.getId());
        dto.setUserId(favorite.getUser().getId());
        dto.setProperty(favorite.getProperty());
        dto.setCreatedAt(favorite.getCreatedAt());
        return dto;
    }
}