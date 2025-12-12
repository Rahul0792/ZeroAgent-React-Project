package com.propmanagment.backend.dto;

import java.time.LocalDateTime;

import com.propmanagment.backend.model.Property;

import lombok.Data;

@Data
public class PropertyFavoriteDTO {
	private Long id;
	 private Long userId;
	    private Long propertyId;
	    private Property property;
	    private LocalDateTime createdAt;
}
