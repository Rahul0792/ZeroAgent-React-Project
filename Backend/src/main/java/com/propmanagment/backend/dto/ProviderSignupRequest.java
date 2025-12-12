package com.propmanagment.backend.dto;

import lombok.*;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProviderSignupRequest {
    private String name;
    private String email;
    private String phone;
    private String city;
    private int experience;
    private double basePrice;
    private String serviceType; // "Plumber", "Electrician", ...
    private String password;
}
