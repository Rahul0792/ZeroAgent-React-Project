package com.propmanagment.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ServiceCategoryDTO {
    private Long id;
    private String title;
    private String description;
    private String icon;
    private boolean available;
    private double price;
}