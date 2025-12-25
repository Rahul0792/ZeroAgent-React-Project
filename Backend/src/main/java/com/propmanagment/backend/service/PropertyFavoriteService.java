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

import jakarta.transaction.Transactional;

@Service
public class PropertyFavoriteService {

    @Autowired
    private PropertyFavoriteRepository propertyFavoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    // -------------------------------------------
    // GET ALL FAVORITES BY USER
    // -------------------------------------------
    public List<PropertyFavoriteDTO> getFavoritesByUser(Long userId) {
        return userRepository.findById(userId)
                .map(user -> propertyFavoriteRepository.findByUser(user)
                        .stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList()))
                .orElse(List.of());
    }

    // -------------------------------------------
    // CHECK IF FAVORITED
    // -------------------------------------------
    public boolean isPropertyFavorited(Long userId, Long propertyId) {
        return userRepository.findById(userId)
                .flatMap(user -> propertyRepository.findById(propertyId)
                        .flatMap(property -> propertyFavoriteRepository.findByUserAndProperty(user, property)))
                .isPresent();
    }

    // -------------------------------------------
    // ADD FAVORITE
    // -------------------------------------------
    public PropertyFavoriteDTO addFavorite(Long userId, Long propertyId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        // Check if already exists → return existing
        Optional<PropertyFavorite> existing = propertyFavoriteRepository.findByUserAndProperty(user, property);
        if (existing.isPresent()) {
            return convertToDTO(existing.get());
        }

        PropertyFavorite favorite = new PropertyFavorite(user, property);
        PropertyFavorite saved = propertyFavoriteRepository.save(favorite);
        return convertToDTO(saved);
    }

    // -------------------------------------------
    // REMOVE FAVORITE
    // -------------------------------------------
    @Transactional
    public void removeFavorite(Long userId, Long propertyId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        // If already not favorited → do nothing silently
        propertyFavoriteRepository.deleteByUserAndProperty(user, property);
    }

    // -------------------------------------------
    // MAPPER
    // -------------------------------------------
    private PropertyFavoriteDTO convertToDTO(PropertyFavorite entity) {
        PropertyFavoriteDTO dto = new PropertyFavoriteDTO();

        dto.setId(entity.getId());
        dto.setUserId(entity.getUser().getId());
        dto.setProperty(entity.getProperty());
        dto.setCreatedAt(entity.getCreatedAt());

        return dto;
    }
}
