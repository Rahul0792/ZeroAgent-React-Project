package com.propmanagment.backend.service;

import org.springframework.stereotype.Service;
import com.propmanagment.backend.model.RentAgreement;
import com.propmanagment.backend.repository.RentAgreementRepository;

import java.util.Optional;

@Service
public class RentAgreementService {

    private final RentAgreementRepository repo;

    public RentAgreementService(RentAgreementRepository repo) {
        this.repo = repo;
    }

    public RentAgreement saveAgreement(RentAgreement agreement) {
        return repo.save(agreement);
    }

    public Optional<RentAgreement> getAgreementById(Long id) {
        return repo.findById(id);
    }

    public boolean deleteAgreementById(Long id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return true;
        }
        return false;
    }
}
