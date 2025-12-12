package com.propmanagment.backend.dto;

import com.propmanagment.backend.model.FurnishingType;
import com.propmanagment.backend.model.PropertyType;
import java.util.List;

public class PropertyDTO {
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

    // Constructors
    public PropertyDTO() {}

    // Getters and Setters
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
}