package com.propmanagment.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.propmanagment.backend.model.Role;
import com.propmanagment.backend.model.User;
import com.propmanagment.backend.repository.UserRepository;

@Configuration
public class AdminUserSetup {

    @Bean
    CommandLineRunner init(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "snehaltikole14@gmail.com"; // the email you want for admin

            // Check if admin user already exists by email
            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = new User();
                admin.setName("Admin");
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("admin123")); // hashed password
                admin.setRole(Role.ADMIN);
                admin.setPhone("9999999999");
                
                // set other NOT NULL fields if required by your User entity
                // e.g., admin.setUserType("ADMIN");

                userRepository.save(admin);
                System.out.println("Admin user created: " + adminEmail);
            } else {
                System.out.println("Admin user already exists: " + adminEmail);
            }
        };
    }
}
