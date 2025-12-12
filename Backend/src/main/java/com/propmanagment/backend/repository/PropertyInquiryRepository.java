package com.propmanagment.backend.repository;

import com.propmanagment.backend.model.PropertyInquiry;
import com.propmanagment.backend.model.Property;
import com.propmanagment.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PropertyInquiryRepository extends JpaRepository<PropertyInquiry, Long> {
    List<PropertyInquiry> findByProperty(Property property);
    List<PropertyInquiry> findByPropertyOwner(User owner);
    List<PropertyInquiry> findByRenter(User renter);
    List<PropertyInquiry> findByPropertyAndRenter(Property property, User renter);
}