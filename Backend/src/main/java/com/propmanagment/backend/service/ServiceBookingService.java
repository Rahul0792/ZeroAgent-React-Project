package com.propmanagment.backend.service;

import com.propmanagment.backend.dto.ServiceBookingDTO;
import com.propmanagment.backend.model.ServiceBooking;
import com.propmanagment.backend.repository.ServiceBookingRepository;
import com.propmanagment.backend.repository.ServiceCategoryRepository;
import com.propmanagment.backend.repository.ServiceProviderRepository;
import com.propmanagment.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.*;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ServiceBookingService {

    @Autowired
    private ServiceBookingRepository bookingRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ServiceProviderRepository providerRepo;

    @Autowired
    private ServiceCategoryRepository categoryRepo;

    public ServiceBooking createBooking(ServiceBookingDTO dto) {
        ServiceBooking booking = new ServiceBooking();

        booking.setUser(userRepo.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found")));
        booking.setProvider(providerRepo.findById(dto.getProviderId())
                .orElseThrow(() -> new RuntimeException("Provider not found")));
        booking.setCategory(categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found")));

        booking.setBookingDate(LocalDateTime.now());
        booking.setScheduledDate(dto.getScheduledDate());
        booking.setAddress(dto.getAddress());
        booking.setAmount(dto.getAmount());
        booking.setStatus("PENDING");

        return bookingRepo.save(booking);
    }

    public List<ServiceBooking> getUserBookings(Long userId) {
        return bookingRepo.findByUserId(userId);
    }

    public List<ServiceBooking> getProviderBookings(Long providerId) {
        return bookingRepo.findByProviderId(providerId);
    }

    public ServiceBooking updateStatus(Long id, String status) {
        ServiceBooking booking = bookingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(status.toUpperCase());
        return bookingRepo.save(booking);
    }
    
    public void deleteBooking(Long id) {
        if (!bookingRepo.existsById(id)) {
            throw new RuntimeException("Booking not found with id: " + id);
        }
        bookingRepo.deleteById(id);
    }
}