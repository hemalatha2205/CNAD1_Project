package com.logisphere.delivery_service.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_persons")
public class DeliveryPerson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true)
    private Long userId;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phone;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    private String address;

    private String city;

    private String state;

    private String pinCode;

    // Date of birth & working age verification
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    // Identity Document (Aadhaar / Passport / PAN / Voter ID)
    @Column(name = "identity_document_type", length = 50)
    private String identityDocumentType;

    @Column(name = "identity_document_number", length = 100)
    private String identityDocumentNumber;

    @Column(name = "identity_document_url", columnDefinition = "LONGTEXT")
    private String identityDocumentUrl;

    // Legacy fields for backward compatibility
    private String aadhaarDocumentUrl;
    private String panDocumentUrl;
    private String drivingLicenseDocumentUrl;

    // Driving Licence Details
    @Column(name = "driving_license_number", length = 100)
    private String drivingLicenseNumber;

    @Column(name = "driving_license_front_url", columnDefinition = "LONGTEXT")
    private String drivingLicenseFrontUrl;

    @Column(name = "driving_license_back_url", columnDefinition = "LONGTEXT")
    private String drivingLicenseBackUrl;

    @Column(name = "driving_license_expiry_date")
    private LocalDate drivingLicenseExpiryDate;

    // Profile Photo
    @Column(name = "profile_photo_url", columnDefinition = "LONGTEXT")
    private String profilePhotoUrl;

    // Vehicle Details
    @Column(name = "vehicle_type", length = 50)
    private String vehicleType;

    @Column(name = "vehicle_registration_number", length = 100)
    private String vehicleRegistrationNumber;

    // Admin Review & Transparency Fields
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 50)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING_VERIFICATION;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "reviewed_by", length = 100)
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "review_target_days")
    private Integer reviewTargetDays = 3;

    @Column(name = "resubmitted_at")
    private LocalDateTime resubmittedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public DeliveryPerson() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPinCode() {
        return pinCode;
    }

    public void setPinCode(String pinCode) {
        this.pinCode = pinCode;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getIdentityDocumentType() {
        return identityDocumentType;
    }

    public void setIdentityDocumentType(String identityDocumentType) {
        this.identityDocumentType = identityDocumentType;
    }

    public String getIdentityDocumentNumber() {
        return identityDocumentNumber;
    }

    public void setIdentityDocumentNumber(String identityDocumentNumber) {
        this.identityDocumentNumber = identityDocumentNumber;
    }

    public String getIdentityDocumentUrl() {
        return identityDocumentUrl != null ? identityDocumentUrl : aadhaarDocumentUrl;
    }

    public void setIdentityDocumentUrl(String identityDocumentUrl) {
        this.identityDocumentUrl = identityDocumentUrl;
        if (this.aadhaarDocumentUrl == null) {
            this.aadhaarDocumentUrl = identityDocumentUrl;
        }
    }

    public String getAadhaarDocumentUrl() {
        return aadhaarDocumentUrl != null ? aadhaarDocumentUrl : identityDocumentUrl;
    }

    public void setAadhaarDocumentUrl(String aadhaarDocumentUrl) {
        this.aadhaarDocumentUrl = aadhaarDocumentUrl;
        if (this.identityDocumentUrl == null) {
            this.identityDocumentUrl = aadhaarDocumentUrl;
        }
    }

    public String getPanDocumentUrl() {
        return panDocumentUrl;
    }

    public void setPanDocumentUrl(String panDocumentUrl) {
        this.panDocumentUrl = panDocumentUrl;
    }

    public String getDrivingLicenseDocumentUrl() {
        return drivingLicenseDocumentUrl != null ? drivingLicenseDocumentUrl : drivingLicenseFrontUrl;
    }

    public void setDrivingLicenseDocumentUrl(String drivingLicenseDocumentUrl) {
        this.drivingLicenseDocumentUrl = drivingLicenseDocumentUrl;
        if (this.drivingLicenseFrontUrl == null) {
            this.drivingLicenseFrontUrl = drivingLicenseDocumentUrl;
        }
    }

    public String getDrivingLicenseNumber() {
        return drivingLicenseNumber;
    }

    public void setDrivingLicenseNumber(String drivingLicenseNumber) {
        this.drivingLicenseNumber = drivingLicenseNumber;
    }

    public String getDrivingLicenseFrontUrl() {
        return drivingLicenseFrontUrl != null ? drivingLicenseFrontUrl : drivingLicenseDocumentUrl;
    }

    public void setDrivingLicenseFrontUrl(String drivingLicenseFrontUrl) {
        this.drivingLicenseFrontUrl = drivingLicenseFrontUrl;
        if (this.drivingLicenseDocumentUrl == null) {
            this.drivingLicenseDocumentUrl = drivingLicenseFrontUrl;
        }
    }

    public String getDrivingLicenseBackUrl() {
        return drivingLicenseBackUrl;
    }

    public void setDrivingLicenseBackUrl(String drivingLicenseBackUrl) {
        this.drivingLicenseBackUrl = drivingLicenseBackUrl;
    }

    public LocalDate getDrivingLicenseExpiryDate() {
        return drivingLicenseExpiryDate;
    }

    public void setDrivingLicenseExpiryDate(LocalDate drivingLicenseExpiryDate) {
        this.drivingLicenseExpiryDate = drivingLicenseExpiryDate;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getVehicleRegistrationNumber() {
        return vehicleRegistrationNumber;
    }

    public void setVehicleRegistrationNumber(String vehicleRegistrationNumber) {
        this.vehicleRegistrationNumber = vehicleRegistrationNumber;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public String getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(String reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public Integer getReviewTargetDays() {
        return reviewTargetDays;
    }

    public void setReviewTargetDays(Integer reviewTargetDays) {
        this.reviewTargetDays = reviewTargetDays;
    }

    public LocalDateTime getResubmittedAt() {
        return resubmittedAt;
    }

    public void setResubmittedAt(LocalDateTime resubmittedAt) {
        this.resubmittedAt = resubmittedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
