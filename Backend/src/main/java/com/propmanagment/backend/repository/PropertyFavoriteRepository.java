package com.propmanagment.backend.repository;

import com.propmanagment.backend.model.PropertyFavorite;
import com.propmanagment.backend.model.User;
import com.propmanagment.backend.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyFavoriteRepository extends JpaRepository<PropertyFavorite, Long> {

    // Get all favorites of a user
    List<PropertyFavorite> findByUser(User user);

    // Check one favorite
    Optional<PropertyFavorite> findByUserAndProperty(User user, Property property);

    // Remove favorite
    void deleteByUserAndProperty(User user, Property property);

    long countByUser(User user);

   
    boolean existsByUserAndProperty(User user, Property property);
}
