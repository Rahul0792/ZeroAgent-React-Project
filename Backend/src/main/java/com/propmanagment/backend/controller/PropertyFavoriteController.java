package com.propmanagment.backend.controller;

import com.propmanagment.backend.dto.PropertyFavoriteDTO;
import com.propmanagment.backend.model.User;
import com.propmanagment.backend.service.PropertyFavoriteService;
import com.propmanagment.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "*")
public class PropertyFavoriteController {
    
    @Autowired
    private PropertyFavoriteService propertyFavoriteService;
    
    @Autowired
    private UserService userService;
    
    // Get all favorites for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getFavoritesByUser(@PathVariable Long userId, @RequestHeader("User-Id") Long requesterId) {
        try {
            // Verify user exists
            Optional<User> userOptional = userService.getUserById(requesterId);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            // Users can only view their own favorites
            if (!userId.equals(requesterId)) {
                return ResponseEntity.badRequest().body("You can only view your own favorites");
            }
            
            List<PropertyFavoriteDTO> favorites = propertyFavoriteService.getFavoritesByUser(userId);
            return ResponseEntity.ok(favorites);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Check if a property is favorited by the user
    @GetMapping("/check")
    public ResponseEntity<?> isPropertyFavorited(
            @RequestParam Long propertyId,
            @RequestHeader("User-Id") Long userId) {
        try {
            // Verify user exists
            Optional<User> userOptional = userService.getUserById(userId);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            boolean isFavorited = propertyFavoriteService.isPropertyFavorited(userId, propertyId);
            return ResponseEntity.ok(isFavorited);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Add a property to favorites
    @PostMapping
    public ResponseEntity<?> addFavorite(
            @RequestParam Long propertyId,
            @RequestHeader("User-Id") Long userId) {
        try {
            // Verify user exists
            Optional<User> userOptional = userService.getUserById(userId);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User user = userOptional.get();
            // Only renters can add favorites
            if (!"RENTER".equals(user.getRole().toString())) {
                return ResponseEntity.badRequest().body("Only renters can add favorites");
            }
            
            PropertyFavoriteDTO favorite = propertyFavoriteService.addFavorite(userId, propertyId);
            return ResponseEntity.ok(favorite);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Remove a property from favorites
    @DeleteMapping
    public ResponseEntity<?> removeFavorite(
            @RequestParam Long propertyId,
            @RequestHeader("User-Id") Long userId) {
        try {
            // Verify user exists
            Optional<User> userOptional = userService.getUserById(userId);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            propertyFavoriteService.removeFavorite(userId, propertyId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}