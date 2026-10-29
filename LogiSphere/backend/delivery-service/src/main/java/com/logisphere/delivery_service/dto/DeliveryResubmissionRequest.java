package com.logisphere.delivery_service.dto;

import java.time.LocalDate;

public class DeliveryResubmissionRequest {

    private String address;
    private String city;
    private String state;
    private String pinCode;
    private LocalDate dateOfBirth;
    private String identityDocumentType;
    private String identityDocumentNumber;
    private String identityDocumentUrl;
    private String drivingLicenseNumber;
    private String drivingLicenseFrontUrl;
    private String drivingLicenseBackUrl;
    private LocalDate drivingLicenseExpiryDate;
    private String profilePhotoUrl;
    private String vehicleType;
    private String vehicleRegistrationNumber;

    public DeliveryResubmissionRequest() {}

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
        return identityDocumentUrl;
    }

    public void setIdentityDocumentUrl(String identityDocumentUrl) {
        this.identityDocumentUrl = identityDocumentUrl;
    }

    public String getDrivingLicenseNumber() {
        return drivingLicenseNumber;
    }

    public void setDrivingLicenseNumber(String drivingLicenseNumber) {
        this.drivingLicenseNumber = drivingLicenseNumber;
    }

    public String getDrivingLicenseFrontUrl() {
        return drivingLicenseFrontUrl;
    }

    public void setDrivingLicenseFrontUrl(String drivingLicenseFrontUrl) {
        this.drivingLicenseFrontUrl = drivingLicenseFrontUrl;
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
}
