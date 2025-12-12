package com.propmanagment.backend.repository;

import com.propmanagment.backend.model.Property;
import com.propmanagment.backend.model.User;
import com.propmanagment.backend.model.PropertyType;
import com.propmanagment.backend.model.FurnishingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByOwner(User owner);
    List<Property> findByLocationContainingIgnoreCase(String location);
    List<Property> findByBhk(Integer bhk);
    List<Property> findByRentBetween(Double minRent, Double maxRent);
    List<Property> findByApprovedFalse();
    List<Property> findByApprovedTrue();
    List<Property> findByFlaggedTrue();
    List<Property> findByCreatedAtAfter(LocalDateTime dateTime);
    long countByApprovedTrue();
    
    // New methods for property approval workflow
    Optional<Property> findByIdAndApprovedTrue(Long id);
    List<Property> findByOwnerAndApprovedTrue(User owner);
    
    @Query("SELECT p FROM Property p WHERE " +
           "(:location IS NULL OR LOWER(p.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:bhk IS NULL OR p.bhk = :bhk) AND " +
           "(:minRent IS NULL OR p.rent >= :minRent) AND " +
           "(:maxRent IS NULL OR p.rent <= :maxRent) AND " +
           "(:propertyType IS NULL OR p.propertyType = :propertyType) AND " +
           "(:furnishing IS NULL OR p.furnishing = :furnishing) AND " +
           "p.approved = true")
    List<Property> searchProperties(
        @Param("location") String location,
        @Param("bhk") Integer bhk,
        @Param("minRent") Double minRent,
        @Param("maxRent") Double maxRent,
        @Param("propertyType") PropertyType propertyType,
        @Param("furnishing") FurnishingType furnishing
    );
    
    // Additional search methods
    List<Property> findByPropertyType(PropertyType propertyType);
    List<Property> findByFurnishing(FurnishingType furnishing);
    List<Property> findBySizeBetween(Double minSize, Double maxSize);
}