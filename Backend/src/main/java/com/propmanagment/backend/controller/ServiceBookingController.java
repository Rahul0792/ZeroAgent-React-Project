package com.propmanagment.backend.controller;

import com.propmanagment.backend.dto.ServiceBookingDTO;
import com.propmanagment.backend.model.ServiceBooking;
import com.propmanagment.backend.service.ServiceBookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin("*")
public class ServiceBookingController {

    @Autowired
    private ServiceBookingService bookingService;

    @PostMapping
    public ServiceBooking createBooking(@RequestBody ServiceBookingDTO dto) {
        return bookingService.createBooking(dto);
    }

    @GetMapping("/user/{userId}")
    public List<ServiceBooking> getUserBookings(@PathVariable Long userId) {
        return bookingService.getUserBookings(userId);
    }

    @GetMapping("/provider/{providerId}")
    public List<ServiceBooking> getProviderBookings(@PathVariable Long providerId) {
        return bookingService.getProviderBookings(providerId);
    }

    @PutMapping("/{id}/status")
    public ServiceBooking updateStatus(@PathVariable Long id, @RequestParam String status) {
        return bookingService.updateStatus(id, status);
    }
    
    // DELETE BOOKING
    @DeleteMapping("/{id}")
    public String deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return "Booking with id " + id + " has been deleted successfully.";
    }
}