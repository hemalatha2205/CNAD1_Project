package com.logisphere.delivery_service.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.logisphere.delivery_service.dto.DeliveryResubmissionRequest;
import com.logisphere.delivery_service.dto.KycDecisionRequest;
import com.logisphere.delivery_service.entity.DeliveryKycAuditLog;
import com.logisphere.delivery_service.entity.DeliveryPerson;
import com.logisphere.delivery_service.entity.VerificationStatus;
import com.logisphere.delivery_service.repository.DeliveryKycAuditLogRepository;
import com.logisphere.delivery_service.repository.DeliveryPersonRepository;

@Service
public class DeliveryPersonService {

    private final DeliveryPersonRepository repository;
    private final DeliveryKycAuditLogRepository auditLogRepository;

    public DeliveryPersonService(
            DeliveryPersonRepository repository,
            DeliveryKycAuditLogRepository auditLogRepository) {

        this.repository = repository;
        this.auditLogRepository = auditLogRepository;
    }

    public void validateAge(LocalDate dob) {
        if (dob == null) {
            return;
        }
        if (dob.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Date of birth cannot be in the future.");
        }
        int age = Period.between(dob, LocalDate.now()).getYears();
        if (age < 18) {
            throw new IllegalArgumentException(
                    "Applicant must be at least 18 years of age to register as a delivery partner (Current calculated age: " + age + ")."
            );
        }
    }

    public void validateLicenceExpiry(LocalDate expiryDate) {
        if (expiryDate == null) {
            return;
        }
        if (expiryDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Driving licence has expired (" + expiryDate + "). A valid, unexpired licence is required."
            );
        }
    }

    @Transactional
    public DeliveryPerson provision(DeliveryPerson deliveryPerson) {
        // Validate age and licence expiry
        validateAge(deliveryPerson.getDateOfBirth());
        validateLicenceExpiry(deliveryPerson.getDrivingLicenseExpiryDate());

        if (deliveryPerson.getUserId() != null) {
            Optional<DeliveryPerson> byUser = repository.findByUserId(deliveryPerson.getUserId());
            if (byUser.isPresent()) {
                DeliveryPerson existing = byUser.get();
                copyNonNullFields(deliveryPerson, existing);
                existing.setUpdatedAt(LocalDateTime.now());
                return repository.save(existing);
            }
        }

        if (deliveryPerson.getEmail() != null) {
            Optional<DeliveryPerson> byEmail = repository.findByEmail(deliveryPerson.getEmail());
            if (byEmail.isPresent()) {
                DeliveryPerson existing = byEmail.get();
                if (deliveryPerson.getUserId() != null && existing.getUserId() == null) {
                    existing.setUserId(deliveryPerson.getUserId());
                }
                copyNonNullFields(deliveryPerson, existing);
                existing.setUpdatedAt(LocalDateTime.now());
                return repository.save(existing);
            }
        }

        if (deliveryPerson.getVerificationStatus() == null) {
            deliveryPerson.setVerificationStatus(VerificationStatus.PENDING_VERIFICATION);
        }

        if (deliveryPerson.getPassword() == null || deliveryPerson.getPassword().isBlank()) {
            deliveryPerson.setPassword("AUTH_MANAGED");
        }

        if (deliveryPerson.getReviewTargetDays() == null) {
            deliveryPerson.setReviewTargetDays(3);
        }

        deliveryPerson.setCreatedAt(LocalDateTime.now());
        deliveryPerson.setUpdatedAt(LocalDateTime.now());

        DeliveryPerson saved = repository.save(deliveryPerson);

        // Record initial submission audit log
        auditLogRepository.save(new DeliveryKycAuditLog(
                saved.getId(),
                "SUBMITTED",
                null,
                saved.getVerificationStatus().name(),
                saved.getUserId(),
                saved.getEmail(),
                "Initial delivery partner registration and KYC documents submitted."
        ));

        return saved;
    }

    private void copyNonNullFields(DeliveryPerson src, DeliveryPerson target) {
        if (src.getFullName() != null) target.setFullName(src.getFullName());
        if (src.getPhone() != null) target.setPhone(src.getPhone());
        if (src.getAddress() != null) target.setAddress(src.getAddress());
        if (src.getCity() != null) target.setCity(src.getCity());
        if (src.getState() != null) target.setState(src.getState());
        if (src.getPinCode() != null) target.setPinCode(src.getPinCode());
        if (src.getDateOfBirth() != null) target.setDateOfBirth(src.getDateOfBirth());
        if (src.getIdentityDocumentType() != null) target.setIdentityDocumentType(src.getIdentityDocumentType());
        if (src.getIdentityDocumentNumber() != null) target.setIdentityDocumentNumber(src.getIdentityDocumentNumber());
        if (src.getIdentityDocumentUrl() != null) target.setIdentityDocumentUrl(src.getIdentityDocumentUrl());
        if (src.getDrivingLicenseNumber() != null) target.setDrivingLicenseNumber(src.getDrivingLicenseNumber());
        if (src.getDrivingLicenseFrontUrl() != null) target.setDrivingLicenseFrontUrl(src.getDrivingLicenseFrontUrl());
        if (src.getDrivingLicenseBackUrl() != null) target.setDrivingLicenseBackUrl(src.getDrivingLicenseBackUrl());
        if (src.getDrivingLicenseExpiryDate() != null) target.setDrivingLicenseExpiryDate(src.getDrivingLicenseExpiryDate());
        if (src.getProfilePhotoUrl() != null) target.setProfilePhotoUrl(src.getProfilePhotoUrl());
        if (src.getVehicleType() != null) target.setVehicleType(src.getVehicleType());
        if (src.getVehicleRegistrationNumber() != null) target.setVehicleRegistrationNumber(src.getVehicleRegistrationNumber());
    }

    public DeliveryPerson register(DeliveryPerson deliveryPerson) {
        return provision(deliveryPerson);
    }

    public Optional<DeliveryPerson> getByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    public DeliveryPerson getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery person not found with ID: " + id));
    }

    @Transactional
    public DeliveryPerson applyKycDecision(Long id, KycDecisionRequest decision, Long adminId, String adminEmail) {
        DeliveryPerson person = getById(id);
        VerificationStatus prevStatus = person.getVerificationStatus();
        VerificationStatus newStatus = decision.getStatus();

        if (newStatus == null) {
            throw new IllegalArgumentException("Decision verification status cannot be null.");
        }

        String notes = decision.getReason() != null ? decision.getReason().trim() :
                      (decision.getNotes() != null ? decision.getNotes().trim() : "");

        String action;

        switch (newStatus) {
            case REJECTED -> {
                if (notes.isEmpty()) {
                    throw new IllegalArgumentException("A mandatory rejection reason must be recorded.");
                }
                action = "REJECTED";
            }
            case ADDITIONAL_INFORMATION_REQUIRED -> {
                if (notes.isEmpty()) {
                    throw new IllegalArgumentException("Please specify what additional information or documents are required from the applicant.");
                }
                action = "ADDITIONAL_INFO_REQUESTED";
            }
            case SUSPENDED -> {
                if (prevStatus != VerificationStatus.APPROVED) {
                    throw new IllegalArgumentException("Only currently APPROVED delivery partners can be suspended.");
                }
                if (notes.isEmpty()) {
                    throw new IllegalArgumentException("A mandatory suspension reason must be recorded.");
                }
                action = "SUSPENDED";
            }
            case APPROVED -> {
                if (prevStatus == VerificationStatus.SUSPENDED) {
                    action = "REINSTATED";
                } else {
                    action = "APPROVED";
                }
            }
            case UNDER_REVIEW -> action = "UNDER_REVIEW";
            default -> action = newStatus.name();
        }

        person.setVerificationStatus(newStatus);
        person.setAdminNotes(notes);
        person.setReviewedBy(adminEmail != null ? adminEmail : "Admin#" + adminId);
        person.setReviewedAt(LocalDateTime.now());
        person.setUpdatedAt(LocalDateTime.now());

        DeliveryPerson saved = repository.save(person);

        // Record audit entry
        auditLogRepository.save(new DeliveryKycAuditLog(
                saved.getId(),
                action,
                prevStatus != null ? prevStatus.name() : null,
                newStatus.name(),
                adminId,
                adminEmail,
                notes
        ));

        return saved;
    }

    @Transactional
    public DeliveryPerson updateVerificationStatus(Long id, VerificationStatus status) {
        KycDecisionRequest decision = new KycDecisionRequest();
        decision.setStatus(status);
        decision.setNotes("Updated verification status to " + status);
        return applyKycDecision(id, decision, null, "SYSTEM");
    }

    @Transactional
    public DeliveryPerson resubmitKyc(Long id, DeliveryResubmissionRequest req, Long userId, String userEmail) {
        DeliveryPerson person = getById(id);

        if (userId != null && person.getUserId() != null && !person.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to modify this delivery profile.");
        }

        validateAge(req.getDateOfBirth());
        validateLicenceExpiry(req.getDrivingLicenseExpiryDate());

        VerificationStatus prevStatus = person.getVerificationStatus();

        if (req.getAddress() != null) person.setAddress(req.getAddress());
        if (req.getCity() != null) person.setCity(req.getCity());
        if (req.getState() != null) person.setState(req.getState());
        if (req.getPinCode() != null) person.setPinCode(req.getPinCode());
        if (req.getDateOfBirth() != null) person.setDateOfBirth(req.getDateOfBirth());
        if (req.getIdentityDocumentType() != null) person.setIdentityDocumentType(req.getIdentityDocumentType());
        if (req.getIdentityDocumentNumber() != null) person.setIdentityDocumentNumber(req.getIdentityDocumentNumber());
        if (req.getIdentityDocumentUrl() != null) person.setIdentityDocumentUrl(req.getIdentityDocumentUrl());
        if (req.getDrivingLicenseNumber() != null) person.setDrivingLicenseNumber(req.getDrivingLicenseNumber());
        if (req.getDrivingLicenseFrontUrl() != null) person.setDrivingLicenseFrontUrl(req.getDrivingLicenseFrontUrl());
        if (req.getDrivingLicenseBackUrl() != null) person.setDrivingLicenseBackUrl(req.getDrivingLicenseBackUrl());
        if (req.getDrivingLicenseExpiryDate() != null) person.setDrivingLicenseExpiryDate(req.getDrivingLicenseExpiryDate());
        if (req.getProfilePhotoUrl() != null) person.setProfilePhotoUrl(req.getProfilePhotoUrl());
        if (req.getVehicleType() != null) person.setVehicleType(req.getVehicleType());
        if (req.getVehicleRegistrationNumber() != null) person.setVehicleRegistrationNumber(req.getVehicleRegistrationNumber());

        // Return to PENDING_VERIFICATION for admin review
        person.setVerificationStatus(VerificationStatus.PENDING_VERIFICATION);
        person.setResubmittedAt(LocalDateTime.now());
        person.setUpdatedAt(LocalDateTime.now());

        DeliveryPerson saved = repository.save(person);

        auditLogRepository.save(new DeliveryKycAuditLog(
                saved.getId(),
                "RESUBMITTED",
                prevStatus != null ? prevStatus.name() : null,
                VerificationStatus.PENDING_VERIFICATION.name(),
                userId,
                userEmail,
                "Applicant resubmitted updated identity and licence documents for review."
        ));

        return saved;
    }

    public List<DeliveryKycAuditLog> getAuditLogs(Long deliveryPersonId) {
        return auditLogRepository.findByDeliveryPersonIdOrderByCreatedAtDesc(deliveryPersonId);
    }
}
