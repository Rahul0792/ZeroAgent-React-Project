package com.propmanagment.backend.repository;

import com.propmanagment.backend.model.Payment;
import com.propmanagment.backend.model.Property;
import com.propmanagment.backend.model.User;
import com.propmanagment.backend.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByRenter(User renter);

    List<Payment> findByOwner(User owner);

    List<Payment> findByProperty(Property property);

    List<Payment> findByStatus(PaymentStatus status);

    List<Payment> findByPropertyAndRenter(Property property, User renter);

    // Total revenue from completed payments
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'COMPLETED'")
    Double getTotalRevenue();

    // Total number of completed transactions
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'COMPLETED'")
    Long getTotalTransactions();

    // Monthly revenue for last 6 months (PostgreSQL compatible)
    @Query("SELECT EXTRACT(MONTH FROM p.createdAt) AS month, SUM(p.amount) " +
           "FROM Payment p WHERE p.status = 'COMPLETED' " +
           "GROUP BY EXTRACT(MONTH FROM p.createdAt) " +
           "ORDER BY month")
    List<Object[]> getMonthlyRevenue();
}
