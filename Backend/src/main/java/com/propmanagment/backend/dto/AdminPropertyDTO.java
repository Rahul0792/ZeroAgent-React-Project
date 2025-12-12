package com.propmanagment.backend.dto;

import com.propmanagment.backend.model.PropertyType;
import com.propmanagment.backend.model.FurnishingType;

import java.time.LocalDateTime;
import java.util.List;

public class AdminPropertyDTO {
    private Long id;
    private String title;
    private String description;
    private String location;
    private Double rent;
    private Integer bhk;
    private Integer bath;
    private Double size;
    private PropertyType propertyType;
    private FurnishingType furnishing;
    private List<String> amenities;
    private List<String> imageUrls;
    private Long ownerId;
    private String ownerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean approved;

    // Constructors
    public AdminPropertyDTO() {}

    public AdminPropertyDTO(Long id, String title, String description, String location, Double rent,
                           Integer bhk, Integer bath, Double size, PropertyType propertyType,
                           FurnishingType furnishing, List<String> amenities, List<String> imageUrls,
                           Long ownerId, String ownerName, LocalDateTime createdAt, LocalDateTime updatedAt,
                           Boolean approved) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.location = location;
        this.rent = rent;
        this.bhk = bhk;
        this.bath = bath;
        this.size = size;
        this.propertyType = propertyType;
        this.furnishing = furnishing;
        this.amenities = amenities;
        this.imageUrls = imageUrls;
        this.ownerId = ownerId;
        this.ownerName = ownerName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.approved = approved;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getRent() {
        return rent;
    }

    public void setRent(Double rent) {
        this.rent = rent;
    }

    public Integer getBhk() {
        return bhk;
    }

    public void setBhk(Integer bhk) {
        this.bhk = bhk;
    }

    public Integer getBath() {
        return bath;
    }

    public void setBath(Integer bath) {
        this.bath = bath;
    }

    public Double getSize() {
        return size;
    }

    public void setSize(Double size) {
        this.size = size;
    }

    public PropertyType getPropertyType() {
        return propertyType;
    }

    public void setPropertyType(PropertyType propertyType) {
        this.propertyType = propertyType;
    }

    public FurnishingType getFurnishing() {
        return furnishing;
    }

    public void setFurnishing(FurnishingType furnishing) {
        this.furnishing = furnishing;
    }

    public List<String> getAmenities() {
        return amenities;
    }

    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getApproved() {
        return approved;
    }

    public void setApproved(Boolean approved) {
        this.approved = approved;
    }
}
