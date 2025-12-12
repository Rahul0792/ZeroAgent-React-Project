package com.propmanagment.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rent_agreements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class RentAgreement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tenantName;
    private String tenantMobile;
    private String tenantEmail;
    private Integer tenantAge;
    private String tenantAadharNumber;
    private String tenantPanNumber;

    private String landlordName;
    private String landlordMobile;
    private String landlordEmail;
    private String landlordAadharNumber;

    private String propertyAddress;
    private String propertyType;
    private String agreementPeriod;
    private String startDate;
    private String endDate;
    private Double monthlyRent;
    private Double securityDeposit;
    private String city;
    private String state;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String tenantSignatureBase64;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String landlordSignatureBase64;
}
