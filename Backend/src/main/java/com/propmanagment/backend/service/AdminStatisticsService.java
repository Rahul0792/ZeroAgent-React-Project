package com.propmanagment.backend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.propmanagment.backend.model.Property;
import com.propmanagment.backend.model.User;
import com.propmanagment.backend.repository.PropertyRepository;
import com.propmanagment.backend.repository.UserRepository;

@Service
public class AdminStatisticsService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PropertyRepository propertyRepository;

    /**
     * Get statistics for the admin dashboard
     * @return Map containing various statistics
     */
    public Map<String, Object> getDashboardStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        
        // Get total counts
        long totalUsers = userRepository.count();
        long totalProperties = propertyRepository.count();
        long approvedProperties = propertyRepository.countByApprovedTrue();
        long pendingProperties = totalProperties - approvedProperties;
        
        statistics.put("totalUsers", totalUsers);
        statistics.put("totalProperties", totalProperties);
        statistics.put("approvedProperties", approvedProperties);
        statistics.put("pendingProperties", pendingProperties);
        
        // Get user role distribution
        Map<String, Long> userRoleDistribution = new HashMap<>();
        userRoleDistribution.put("RENTER", userRepository.countByRole(com.propmanagment.backend.model.Role.RENTER));
        userRoleDistribution.put("OWNER", userRepository.countByRole(com.propmanagment.backend.model.Role.OWNER));
        userRoleDistribution.put("ADMIN", userRepository.countByRole(com.propmanagment.backend.model.Role.ADMIN));
        statistics.put("userRoleDistribution", userRoleDistribution);
        
        // Get recent users (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<User> recentUsers = userRepository.findByCreatedAtAfter(thirtyDaysAgo);
        statistics.put("recentUsersCount", recentUsers.size());
        
        // Get recent properties (last 30 days)
        List<Property> recentProperties = propertyRepository.findByCreatedAtAfter(thirtyDaysAgo);
        statistics.put("recentPropertiesCount", recentProperties.size());
        
        return statistics;
    }
}