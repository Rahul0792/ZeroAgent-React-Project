package com.propmanagment.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.propmanagment.backend.dto.PropertyFavoriteDTO;
import com.propmanagment.backend.model.User;
import com.propmanagment.backend.service.PropertyFavoriteService;
import com.propmanagment.backend.service.UserService;

import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "*")
public class PropertyFavoriteController {

    @Autowired
    private PropertyFavoriteService propertyFavoriteService;

    @Autowired
    private UserService userService;

    // -----------------------------------------------------
    // GET all favorites for a user
    // -----------------------------------------------------
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getFavoritesByUser(
            @PathVariable Long userId,
            @RequestHeader("User-Id") Long requesterId
    ) {
        try {

            Optional<User> reqUser = userService.getUserById(requesterId);
            if (reqUser.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }

            // Prevent viewing other user's favorites
            if (!userId.equals(requesterId)) {
                return ResponseEntity.badRequest().body("You can only view your own favorites");
            }

            List<PropertyFavoriteDTO> favorites = propertyFavoriteService.getFavoritesByUser(userId);
            return ResponseEntity.ok(favorites);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -----------------------------------------------------
    // CHECK if property favorited
    // -----------------------------------------------------
    @GetMapping("/check")
    public ResponseEntity<?> isPropertyFavorited(
            @RequestParam Long propertyId,
            @RequestHeader("User-Id") Long userId
    ) {
        try {
            Optional<User> user = userService.getUserById(userId);

            if (user.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }

            boolean favorited = propertyFavoriteService.isPropertyFavorited(userId, propertyId);
            return ResponseEntity.ok(favorited);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -----------------------------------------------------
    // ADD favorite
    // -----------------------------------------------------
    @PostMapping
    public ResponseEntity<?> addFavorite(
            @RequestParam Long propertyId,
            @RequestHeader("User-Id") Long userId
    ) {
        try {
            Optional<User> userOpt = userService.getUserById(userId);

            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }

            User user = userOpt.get();

            // Only Renters allowed
            if (!"RENTER".equalsIgnoreCase(user.getRole().toString())) {
                return ResponseEntity.badRequest().body("Only renters can add favorites");
            }

            PropertyFavoriteDTO favorite = propertyFavoriteService.addFavorite(userId, propertyId);
            return ResponseEntity.ok(favorite);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -----------------------------------------------------
    // DELETE favorite
    // -----------------------------------------------------
    @DeleteMapping
    @Transactional
    public ResponseEntity<?> removeFavorite(
            @RequestParam Long propertyId,
            @RequestHeader("User-Id") Long userId
    ) {
        try {
            Optional<User> userOpt = userService.getUserById(userId);

            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }

            propertyFavoriteService.removeFavorite(userId, propertyId);
            return ResponseEntity.ok("Favorite removed");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
