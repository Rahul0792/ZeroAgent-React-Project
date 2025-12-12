package com.propmanagment.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.propmanagment.backend.model.ServiceType; // <-- adjust if needed

@Getter
@Setter
@NoArgsConstructor
public class ServiceProviderDTO {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String city;
    private int experience;
    private boolean available;
    private double basePrice;

    // Category info
    private Long categoryId;
    private String categoryTitle;

    // Extra info
    private String serviceType; 
    private String password;

    // OLD constructor (without serviceType)
    public ServiceProviderDTO(
            Long id,
            String name,
            String email,
            String phone,
            String city,
            int experience,
            boolean available,
            double basePrice,
            Long categoryId,
            String categoryTitle
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.city = city;
        this.experience = experience;
        this.available = available;
        this.basePrice = basePrice;
        this.categoryId = categoryId;
        this.categoryTitle = categoryTitle;
    }

    // NEW constructor (String serviceType)
    public ServiceProviderDTO(
            Long id,
            String name,
            String email,
            String phone,
            String city,
            int experience,
            boolean available,
            double basePrice,
            String serviceType,
            Long categoryId,
            String categoryTitle
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.city = city;
        this.experience = experience;
        this.available = available;
        this.basePrice = basePrice;
        this.serviceType = serviceType;
        this.categoryId = categoryId;
        this.categoryTitle = categoryTitle;
    }

    // ✅ NEW constructor to fix your error
    public ServiceProviderDTO(
            Long id,
            String name,
            String email,
            String phone,
            String city,
            int experience,
            boolean available,
            double basePrice,
            ServiceType serviceTypeObj,
            Long categoryId,
            String categoryTitle
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.city = city;
        this.experience = experience;
        this.available = available;
        this.basePrice = basePrice;

        // convert enum/object to string safely
        this.serviceType = serviceTypeObj != null ? serviceTypeObj.toString() : null;

        this.categoryId = categoryId;
        this.categoryTitle = categoryTitle;
    }
}
