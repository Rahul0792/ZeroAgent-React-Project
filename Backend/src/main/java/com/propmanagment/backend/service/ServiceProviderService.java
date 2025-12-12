package com.propmanagment.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.propmanagment.backend.dto.ProviderSignupRequest;
import com.propmanagment.backend.dto.ServiceProviderDTO;
import com.propmanagment.backend.model.ServiceCategory;
import com.propmanagment.backend.model.ServiceProvider;
import com.propmanagment.backend.model.ServiceType;
import com.propmanagment.backend.repository.ServiceCategoryRepository;
import com.propmanagment.backend.repository.ServiceProviderRepository;

@Service
public class ServiceProviderService {

    @Autowired
    private ServiceProviderRepository providerRepo;

    @Autowired
    private ServiceCategoryRepository categoryRepo;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // ========= REGISTER PROVIDER =========
    public ServiceProvider register(ProviderSignupRequest req) {

        if (providerRepo.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        ServiceProvider provider = new ServiceProvider();
        provider.setName(req.getName());
        provider.setEmail(req.getEmail());
        provider.setPhone(req.getPhone());
        provider.setCity(req.getCity());
        provider.setExperience(req.getExperience());
        provider.setBasePrice(req.getBasePrice());
        provider.setAvailable(true);

        // 1) Map String -> enum (ServiceType)
        ServiceType type;
        try {
            type = ServiceType.valueOf(req.getServiceType());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid service type: " + req.getServiceType());
        }
        provider.setServiceType(type);

        // 2) Link provider to ServiceCategory by title ("Plumber", "Electrician", etc.)
        ServiceCategory category = categoryRepo.findByTitleIgnoreCase(req.getServiceType())
                .orElseGet(() -> {
                    ServiceCategory newCat = new ServiceCategory();
                    newCat.setTitle(req.getServiceType());
                    return categoryRepo.save(newCat);
                });

               
        provider.setCategory(category);

        // 3) Hash password
        provider.setPassword(passwordEncoder.encode(req.getPassword()));

        try {
            return providerRepo.save(provider);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException("Invalid data. Please check fields.");
        }
    }

    // ========= LOGIN =========
    public ServiceProvider login(String email, String password) {
        ServiceProvider provider = providerRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email not found"));

        if (!passwordEncoder.matches(password, provider.getPassword())) {
            throw new IllegalArgumentException("Incorrect password");
        }

        return provider;
    }

    // ========= GET PROVIDERS BY CATEGORY =========
    public List<ServiceProviderDTO> getProvidersByCategory(Long categoryId, String city) {

        List<ServiceProvider> providers;

        if (city != null && !city.isBlank()) {
            providers = providerRepo.findByCategoryIdAndCityIgnoreCase(categoryId, city);
        } else {
            providers = providerRepo.findByCategoryId(categoryId);
        }

        return providers.stream()
                .map(sp -> new ServiceProviderDTO(
                        sp.getId(),
                        sp.getName(),
                        sp.getEmail(),
                        sp.getPhone(),
                        sp.getCity(),
                        sp.getExperience(),
                        sp.isAvailable(),
                        sp.getBasePrice(),
                        sp.getServiceType() != null ? sp.getServiceType().name() : null,
                        sp.getCategory() != null ? sp.getCategory().getId() : null,
                        sp.getCategory() != null ? sp.getCategory().getTitle() : null
                ))
                .collect(Collectors.toList());
    }

    public void deleteProvider(Long id) {
        providerRepo.deleteById(id);
    }
    public ServiceProvider updateProvider(Long id, ServiceProviderDTO dto) {
        ServiceProvider provider = providerRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Provider not found"));

        if (dto.getName() != null) provider.setName(dto.getName());
        if (dto.getEmail() != null) provider.setEmail(dto.getEmail());
        if (dto.getPhone() != null) provider.setPhone(dto.getPhone());
        if (dto.getCity() != null) provider.setCity(dto.getCity());
        if (dto.getPassword() != null) provider.setPassword(dto.getPassword()); // optionally hash it

        return providerRepo.save(provider);
    }
    public List<ServiceProviderDTO> getAllProviders() {
        return providerRepo.findAll()
                .stream()
                .map(p -> new ServiceProviderDTO(
                        p.getId(),
                        p.getName(),
                        p.getEmail(),
                        p.getPhone(),
                        p.getCity(),
                        p.getExperience(),
                        p.isAvailable(),
                        p.getBasePrice(),
                        p.getServiceType(),  // NEW
                        p.getCategory().getId(),
                        p.getCategory().getTitle()
                ))
                .toList();
    }
    
  



}