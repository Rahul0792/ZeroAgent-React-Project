package com.propmanagment.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

// Add these imports for the new collections
import com.propmanagment.backend.model.PropertyInquiry;
import com.propmanagment.backend.model.PropertyFavorite;

@Entity
@Table(name = "properties")
public class Property {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    @Column(nullable = false)
    private String location;
    
    @Column(nullable = false)
    private Double rent;
    
    @Column(nullable = false)
    private Integer bhk;
    
    @Column(nullable = false)
    private Integer bath;
    
    @Column(nullable = false)
    private Double size;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyType propertyType;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FurnishingType furnishing;
    
    @ElementCollection
    @CollectionTable(name = "property_amenities", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "amenity")
    private List<String> amenities;
    
    @ElementCollection
    @CollectionTable(name = "property_images", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "image_url", columnDefinition = "TEXT")
    private List<String> imageUrls;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnore
    private User owner;
    
    // Add cascading delete for property inquiries
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<PropertyInquiry> inquiries;
    
    // Add cascading delete for property favorites
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<PropertyFavorite> favorites;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "approved")
    private Boolean approved = false;
    
    @Column(name = "flagged")
    private Boolean flagged = false;
    
    // Constructors
    public Property() {}
    
    public Property(String title, String description, String location, Double rent, 
                   Integer bhk, Integer bath, Double size, PropertyType propertyType, 
                   FurnishingType furnishing, User owner) {
        this.title = title;
        this.description = description;
        this.location = location;
        this.rent = rent;
        this.bhk = bhk;
        this.bath = bath;
        this.size = size;
        this.propertyType = propertyType;
        this.furnishing = furnishing;
        this.owner = owner;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
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
    
    public List<PropertyInquiry> getInquiries() {
        return inquiries;
    }
    
    public void setInquiries(List<PropertyInquiry> inquiries) {
        this.inquiries = inquiries;
    }
    
    public List<PropertyFavorite> getFavorites() {
        return favorites;
    }
    
    public void setFavorites(List<PropertyFavorite> favorites) {
        this.favorites = favorites;
    }

    // Expose owner ID in JSON response
    @JsonProperty("ownerId")
    public Long getOwnerId() {
        return owner != null ? owner.getId() : null;
    }
    
    public User getOwner() {
        return owner;
    }
    
    public void setOwner(User owner) {
        this.owner = owner;
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
    
    public Boolean getFlagged() {
        return flagged;
    }
    
    public void setFlagged(Boolean flagged) {
        this.flagged = flagged;
    }
}