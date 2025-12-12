package com.propmanagment.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ServiceBookingDTO {

    private Long userId;
    private Long providerId;
    private Long categoryId;

    private LocalDateTime scheduledDate;
    private String address;
    private Double amount;
    
  
}