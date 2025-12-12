package com.propmanagment.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.propmanagment.backend.model.Role;
import com.propmanagment.backend.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
    long countByRole(Role role);
    List<User> findByCreatedAtAfter(LocalDateTime dateTime);
}