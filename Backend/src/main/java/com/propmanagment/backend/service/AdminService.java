package com.propmanagment.backend.service;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.propmanagment.backend.dto.AdminPropertyDTO;
import com.propmanagment.backend.dto.AdminUserDTO;
import com.propmanagment.backend.model.Property;
import com.propmanagment.backend.model.User;
import com.propmanagment.backend.repository.PaymentRepository;
import com.propmanagment.backend.repository.PropertyRepository;
import com.propmanagment.backend.repository.UserRepository;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PropertyRepository propertyRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;

    /**
     * Get all users in the system
     * @return List of all users
     */
    public List<AdminUserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a user by their ID
     * @param id the user ID
     * @return the user if found, null otherwise
     */
    public AdminUserDTO getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToUserDTO)
                .orElse(null);
    }

    /**
     * Update a user's information
     * @param id the user ID
     * @param userDetails the updated user details
     * @return the updated user
     */
    public AdminUserDTO updateUser(Long id, AdminUserDTO userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());
        user.setPhone(userDetails.getPhone());
        user.setRole(userDetails.getRole());
        
        User updatedUser = userRepository.save(user);
        return convertToUserDTO(updatedUser);
    }

    /**
     * Delete a user by their ID
     * @param id the user ID
     */
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        userRepository.delete(user);
    }
    
    /**
     * Get all properties in the system
     * @return List of all properties
     */
    public List<AdminPropertyDTO> getAllProperties() {
        return propertyRepository.findAll().stream()
                .map(this::convertToPropertyDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all pending properties in the system
     * @return List of all pending properties
     */
    public List<AdminPropertyDTO> getPendingProperties() {
        return propertyRepository.findByApprovedFalse().stream()
                .map(this::convertToPropertyDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all flagged properties in the system
     * @return List of all flagged properties
     */
    public List<AdminPropertyDTO> getFlaggedProperties() {
        // For now, we'll return all properties as flagged properties
        // In a real implementation, this would filter by a flagged status
        return propertyRepository.findAll().stream()
                .map(this::convertToPropertyDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get a property by its ID
     * @param id the property ID
     * @return the property if found, null otherwise
     */
    public AdminPropertyDTO getPropertyById(Long id) {
        return propertyRepository.findById(id)
                .map(this::convertToPropertyDTO)
                .orElse(null);
    }
    
    /**
     * Update a property's information
     * @param id the property ID
     * @param propertyDetails the updated property details
     * @return the updated property
     */
    public AdminPropertyDTO updateProperty(Long id, AdminPropertyDTO propertyDetails) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));
        
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
        property.setApproved(propertyDetails.getApproved());
        
        Property updatedProperty = propertyRepository.save(property);
        return convertToPropertyDTO(updatedProperty);
    }
    
    /**
     * Delete a property by its ID
     * @param id the property ID
     */
    public void deleteProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));
        
        propertyRepository.delete(property);
    }
    
    /**
     * Approve a property
     * @param id the property ID
     * @return the approved property
     */
    public AdminPropertyDTO approveProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));
        
        property.setApproved(true);
        Property updatedProperty = propertyRepository.save(property);
        return convertToPropertyDTO(updatedProperty);
    }
    
    /**
     * Reject a property
     * @param id the property ID
     * @return the rejected property
     */
    public AdminPropertyDTO rejectProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));
        
        property.setApproved(false);
        Property updatedProperty = propertyRepository.save(property);
        return convertToPropertyDTO(updatedProperty);
    }
    
    /**
     * Convert User entity to AdminUserDTO
     * @param user the User entity
     * @return the AdminUserDTO
     */
    private AdminUserDTO convertToUserDTO(User user) {
        return new AdminUserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
    
    /**
     * Convert Property entity to AdminPropertyDTO
     * @param property the Property entity
     * @return the AdminPropertyDTO
     */
    private AdminPropertyDTO convertToPropertyDTO(Property property) {
        return new AdminPropertyDTO(
                property.getId(),
                property.getTitle(),
                property.getDescription(),
                property.getLocation(),
                property.getRent(),
                property.getBhk(),
                property.getBath(),
                property.getSize(),
                property.getPropertyType(),
                property.getFurnishing(),
                property.getAmenities(),
                property.getImageUrls(),
                property.getOwnerId(),
                property.getOwner() != null ? property.getOwner().getName() : null,
                property.getCreatedAt(),
                property.getUpdatedAt(),
                property.getApproved()
        );
    }
    
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Total revenue
        Double totalRevenue = paymentRepository.getTotalRevenue();
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0);

        // Total transactions
        Long totalTransactions = paymentRepository.getTotalTransactions();
        stats.put("totalTransactions", totalTransactions != null ? totalTransactions : 0);

        // Monthly revenue
        List<Object[]> monthlyData = paymentRepository.getMonthlyRevenue();
        Map<Integer, Double> monthlyRevenue = new LinkedHashMap<>();

        for (Object[] row : monthlyData) {
            Number monthNum = (Number) row[0];  // safe casting
            Number revenueNum = (Number) row[1]; // safe casting

            Integer month = monthNum.intValue();
            Double revenue = revenueNum != null ? revenueNum.doubleValue() : 0.0;

            monthlyRevenue.put(month, revenue);
        }

        
        stats.put("monthlyRevenue", monthlyRevenue);

        // Users and properties
        stats.put("totalUsers", userRepository.count());
        stats.put("activeListings", propertyRepository.countByApprovedTrue());

        return stats;
    }

}
