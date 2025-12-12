package com.propmanagment.backend.repository;

import com.propmanagment.backend.model.RentAgreement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RentAgreementRepository extends JpaRepository<RentAgreement, Long> {
}
