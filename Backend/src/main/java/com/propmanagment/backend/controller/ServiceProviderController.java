package com.propmanagment.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.propmanagment.backend.dto.ProviderSignupRequest;
import com.propmanagment.backend.dto.ServiceProviderDTO;
import com.propmanagment.backend.model.ServiceProvider;
import com.propmanagment.backend.service.ServiceProviderService;

@RestController
@RequestMapping("/api/providers")   // 👈 BASE PATH is now /api/providers
@CrossOrigin(origins = "*")
public class ServiceProviderController {

    @Autowired
    private ServiceProviderService providerService;

    // ========= SIGNUP =========
    // POST /api/providers
    @PostMapping
    public ResponseEntity<?> signup(@RequestBody ProviderSignupRequest req) {
        try {
            ServiceProvider saved = providerService.register(req);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "email", saved.getEmail()
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(400).body(Map.of(
                    "success", false,
                    "message", ex.getMessage()
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Internal server error"
            ));
        }
    }

    // ========= LOGIN =========
    // POST /api/providers/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            ServiceProvider provider = providerService.login(
                    request.get("email"),
                    request.get("password")
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "provider", provider
            ));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", ex.getMessage()
            ));
        }
    }

    // ========= GET PROVIDERS BY CATEGORY =========
    // GET /api/providers/category/{categoryId}?city=Pune
    @GetMapping("/category/{categoryId}")
    public List<ServiceProviderDTO> getProviders(
            @PathVariable Long categoryId,
            @RequestParam(required = false) String city
    ) {
        return providerService.getProvidersByCategory(categoryId, city);
    }
    
 // ========= UPDATE PROVIDER =========
 // PUT /api/providers/{id}
 @PutMapping("/{id}")
 public ResponseEntity<?> updateProvider(
         @PathVariable Long id,
         @RequestBody ServiceProviderDTO dto
 ) {
     try {
         ServiceProvider updated = providerService.updateProvider(id, dto);
         return ResponseEntity.ok(Map.of(
                 "success", true,
                 "provider", updated
         ));
     } catch (IllegalArgumentException ex) {
         return ResponseEntity.status(400).body(Map.of(
                 "success", false,
                 "message", ex.getMessage()
         ));
     } catch (Exception ex) {
         return ResponseEntity.status(500).body(Map.of(
                 "success", false,
                 "message", "Internal server error"
         ));
     }
 }
 
 @GetMapping
 public List<ServiceProviderDTO> getAllProviders() {
     return providerService.getAllProviders();
 }
 
 @DeleteMapping("/{id}")
 public ResponseEntity<?> deleteProvider(@PathVariable Long id) {
     providerService.deleteProvider(id);
     return ResponseEntity.ok("Provider deleted successfully");
 }



}