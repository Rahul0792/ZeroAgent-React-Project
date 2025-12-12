package com.propmanagment.backend.repository;

import com.propmanagment.backend.model.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {
    Optional<OtpCode> findByEmailAndOtpCode(String email, String otpCode);
    Optional<OtpCode> findByEmailAndIsUsedFalseOrderByCreatedAtDesc(String email);
}