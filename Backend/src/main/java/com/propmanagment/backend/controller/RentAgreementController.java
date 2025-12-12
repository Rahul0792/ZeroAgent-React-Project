package com.propmanagment.backend.controller;

import java.util.Base64;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.propmanagment.backend.model.RentAgreement;
import com.propmanagment.backend.service.PdfService;
import com.propmanagment.backend.service.RentAgreementService;

@RestController
@RequestMapping("/api/rent-agreement")
@CrossOrigin(origins = "*")
public class RentAgreementController {

    private final RentAgreementService service;
    private final PdfService pdfService;

    public RentAgreementController(RentAgreementService service, PdfService pdfService) {
        this.service = service;
        this.pdfService = pdfService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createAgreement(@RequestBody RentAgreement agreement) {

        System.out.println("🖋 Tenant Signature Received: " +
                (agreement.getTenantSignatureBase64() != null
                        ? agreement.getTenantSignatureBase64().substring(0, 30) + "..."
                        : "NULL"));

        System.out.println("🖋 Landlord Signature Received: " +
                (agreement.getLandlordSignatureBase64() != null
                        ? agreement.getLandlordSignatureBase64().substring(0, 30) + "..."
                        : "NULL"));

        RentAgreement saved = service.saveAgreement(agreement);

        byte[] pdfBytes = pdfService.generatePdf(saved);
        String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);

        return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "pdfBase64", pdfBase64
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAgreement(@PathVariable Long id) {

        Optional<RentAgreement> optionalAgreement = service.getAgreementById(id);

        if (optionalAgreement.isPresent()) {
            return ResponseEntity.ok(optionalAgreement.get());
        } else {
            return ResponseEntity.status(404).body(
                    Map.of("message", "Agreement not found")
            );
        }
    }





    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAgreement(@PathVariable Long id) {
        boolean deleted = service.deleteAgreementById(id);

        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Agreement deleted successfully"));
        } else {
            return ResponseEntity.status(404).body(Map.of("message", "Agreement not found"));
        }
    }
}
