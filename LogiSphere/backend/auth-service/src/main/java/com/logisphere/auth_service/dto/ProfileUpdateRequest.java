package com.logisphere.auth_service.dto;

public class ProfileUpdateRequest {
    private String fullName;
    private String phone;

    // Supplier specific
    private String businessName;
    private String businessPhone;
    private String address;
    private String city;
    private String state;
    private String pinCode;
    private String warehouseLocation;
    private Double latitude;
    private Double longitude;
    private String taxCertificateUrl;
    private String businessLicenseUrl;
    private String shopPhotoUrl;
    private String registrationNumber;
    private String licenseDetails;
    private Boolean resubmitForApproval;

    public ProfileUpdateRequest() {}

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getBusinessPhone() {
        return businessPhone;
    }

    public void setBusinessPhone(String businessPhone) {
        this.businessPhone = businessPhone;
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

    public String getWarehouseLocation() {
        return warehouseLocation;
    }

    public void setWarehouseLocation(String warehouseLocation) {
        this.warehouseLocation = warehouseLocation;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getTaxCertificateUrl() {
        return taxCertificateUrl;
    }

    public void setTaxCertificateUrl(String taxCertificateUrl) {
        this.taxCertificateUrl = taxCertificateUrl;
    }

    public String getBusinessLicenseUrl() {
        return businessLicenseUrl;
    }

    public void setBusinessLicenseUrl(String businessLicenseUrl) {
        this.businessLicenseUrl = businessLicenseUrl;
    }

    public String getShopPhotoUrl() {
        return shopPhotoUrl;
    }

    public void setShopPhotoUrl(String shopPhotoUrl) {
        this.shopPhotoUrl = shopPhotoUrl;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getLicenseDetails() {
        return licenseDetails;
    }

    public void setLicenseDetails(String licenseDetails) {
        this.licenseDetails = licenseDetails;
    }

    public Boolean getResubmitForApproval() {
        return resubmitForApproval;
    }

    public void setResubmitForApproval(Boolean resubmitForApproval) {
        this.resubmitForApproval = resubmitForApproval;
    }
}
