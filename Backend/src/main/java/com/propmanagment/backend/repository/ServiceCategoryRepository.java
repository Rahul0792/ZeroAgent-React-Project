package com.propmanagment.backend.repository;

import com.propmanagment.backend.model.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {

    // 🔍 Used to map "Plumber" → the Plumber category row
    Optional<ServiceCategory> findByTitleIgnoreCase(String title);
}