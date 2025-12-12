package com.propmanagment.backend.repository;

import com.propmanagment.backend.model.ServiceBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceBookingRepository extends JpaRepository<ServiceBooking, Long> {

    List<ServiceBooking> findByUserId(Long userId);

    List<ServiceBooking> findByProviderId(Long providerId);
}