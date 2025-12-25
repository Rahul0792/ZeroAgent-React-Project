package com.propmanagment.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import com.propmanagment.backend.model.Role;
import com.propmanagment.backend.model.User;

@SpringBootTest
class BackendApplicationTests {

    @Test
    void contextLoads() {
    }

    @Test
    void testUserCreation() {
        // Create a new user
        User user = new User("John Doe", "john@example.com", "1234567890", "password123", Role.RENTER);
        
        // Test that the user was created with correct values
        assertEquals("John Doe", user.getName());
        assertEquals("john@example.com", user.getEmail());
        assertEquals("1234567890", user.getPhone());
        assertEquals("password123", user.getPassword());
        assertEquals(Role.RENTER, user.getRole());
        assertNotNull(user.getCreatedAt());
        assertNotNull(user.getUpdatedAt());
    }

    @Test
    void testUserRoleEnum() {
        // Test that all roles exist
        assertNotNull(Role.RENTER);
        assertNotNull(Role.OWNER);
        assertNotNull(Role.ADMIN);
    }

    @Test
    void testPropertyTypeEnum() {
        // Test that all property types exist
        assertNotNull(com.propmanagment.backend.model.PropertyType.APARTMENT);
        assertNotNull(com.propmanagment.backend.model.PropertyType.VILLA);
        assertNotNull(com.propmanagment.backend.model.PropertyType.STUDIO);
        assertNotNull(com.propmanagment.backend.model.PropertyType.PENTHOUSE);
    }

    @Test
    void testFurnishingTypeEnum() {
        // Test that all furnishing types exist
        assertNotNull(com.propmanagment.backend.model.FurnishingType.UNFURNISHED);
        assertNotNull(com.propmanagment.backend.model.FurnishingType.SEMI_FURNISHED);
        assertNotNull(com.propmanagment.backend.model.FurnishingType.FURNISHED);
    }
}