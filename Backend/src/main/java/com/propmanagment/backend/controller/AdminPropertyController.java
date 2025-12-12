package com.propmanagment.backend.controller;

import com.propmanagment.backend.dto.AdminPropertyDTO;
import com.propmanagment.backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/properties")
@CrossOrigin(origins = "*")
public class AdminPropertyController {

    @Autowired
    private AdminService adminService;

    // Endpoint to get all properties (admin only)
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProperties() {
        try {
            List<AdminPropertyDTO> properties = adminService.getAllProperties();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("properties", properties);
            response.put("count", properties.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch properties: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // Endpoint to get pending properties (admin only)
    @GetMapping("/pending")
    public ResponseEntity<Map<String, Object>> getPendingProperties() {
        try {
            List<AdminPropertyDTO> properties = adminService.getPendingProperties();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("properties", properties);
            response.put("count", properties.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch pending properties: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // Endpoint to get flagged properties (admin only)
    @GetMapping("/flagged")
    public ResponseEntity<Map<String, Object>> getFlaggedProperties() {
        try {
            List<AdminPropertyDTO> properties = adminService.getFlaggedProperties();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("properties", properties);
            response.put("count", properties.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch flagged properties: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Endpoint to get property by ID (admin only)
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPropertyById(@PathVariable Long id) {
        try {
            AdminPropertyDTO property = adminService.getPropertyById(id);
            
            if (property != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("property", property);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Property not found");
                return ResponseEntity.status(404).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch property: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Endpoint to update property (admin only)
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateProperty(@PathVariable Long id, @RequestBody AdminPropertyDTO propertyDetails) {
        try {
            AdminPropertyDTO updatedProperty = adminService.updateProperty(id, propertyDetails);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Property updated successfully");
            response.put("property", updatedProperty);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update property: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Endpoint to delete property (admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteProperty(@PathVariable Long id) {
        try {
            adminService.deleteProperty(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Property deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to delete property: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // Endpoint to approve property (admin only)
    @PostMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveProperty(@PathVariable Long id) {
        try {
            AdminPropertyDTO property = adminService.approveProperty(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Property approved successfully");
            response.put("property", property);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to approve property: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // Endpoint to reject property (admin only)
    @PostMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectProperty(@PathVariable Long id) {
        try {
            AdminPropertyDTO property = adminService.rejectProperty(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Property rejected successfully");
            response.put("property", property);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to reject property: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
