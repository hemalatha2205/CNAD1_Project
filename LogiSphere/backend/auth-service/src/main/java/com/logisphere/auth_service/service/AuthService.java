package com.logisphere.auth_service.service;

import com.logisphere.auth_service.dto.ChangePasswordRequest;
import com.logisphere.auth_service.dto.DeactivateAccountRequest;
import com.logisphere.auth_service.dto.DeliveryRegistrationRequest;
import com.logisphere.auth_service.dto.LoginResponse;
import com.logisphere.auth_service.dto.ProfileUpdateRequest;
import com.logisphere.auth_service.dto.PublicSupplierProfileResponse;
import com.logisphere.auth_service.dto.SupplierRegistrationRequest;
import com.logisphere.auth_service.entity.Role;
import com.logisphere.auth_service.entity.SupplierProfile;
import com.logisphere.auth_service.entity.User;
import com.logisphere.auth_service.repository.SupplierProfileRepository;
import com.logisphere.auth_service.repository.UserRepository;
import com.logisphere.auth_service.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class AuthService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SupplierProfileRepository supplierProfileRepository;
    private final JwtService jwtService;
    private final com.logisphere.auth_service.client.DeliveryClient deliveryClient;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            SupplierProfileRepository supplierProfileRepository,
            JwtService jwtService,
            com.logisphere.auth_service.client.DeliveryClient deliveryClient) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.supplierProfileRepository = supplierProfileRepository;
        this.jwtService = jwtService;
        this.deliveryClient = deliveryClient;
    }

    public static void validatePasswordPolicy(String password) {
        if (password == null || password.length() < 12) {
            throw new IllegalArgumentException("Password must be at least 12 characters long.");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter (A-Z).");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new IllegalArgumentException("Password must contain at least one lowercase letter (a-z).");
        }
        if (!password.matches(".*[0-9].*")) {
            throw new IllegalArgumentException("Password must contain at least one number (0-9).");
        }
        if (!password.matches(".*[^A-Za-z0-9].*")) {
            throw new IllegalArgumentException("Password must contain at least one special character (!@#$%^&* etc.).");
        }
    }

    public static String normalizeEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email address is required.");
        }
        String normalized = email.trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(normalized).matches()) {
            throw new IllegalArgumentException("Invalid email format.");
        }
        return normalized;
    }

    public User register(
            String fullName,
            String email,
            String password,
            String phone,
            Role role) {

        String normalizedEmail = normalizeEmail(email);
        validatePasswordPolicy(password);

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setFullName(fullName != null ? fullName.trim() : "");
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(password));
        user.setPhone(phone != null ? phone.trim() : "");
        user.setRole(role != null ? role : Role.CUSTOMER);
        user.setActive(true);

        User savedUser = userRepository.save(user);

        if (role == Role.DELIVERY_PERSON) {
            deliveryClient.provisionDeliveryProfile(
                    savedUser.getId(),
                    savedUser.getFullName(),
                    savedUser.getEmail(),
                    savedUser.getPhone()
            );
        }

        return savedUser;
    }

    public LoginResponse login(String email, String password) {
        String normalizedEmail = email != null ? email.trim().toLowerCase() : "";

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .or(() -> userRepository.findByEmail(email))
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password"));

        if (!user.isActive()) {
            throw new RuntimeException("Account is deactivated. Please contact support.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (user.getRole() == Role.DELIVERY_PERSON) {
            deliveryClient.provisionDeliveryProfile(
                    user.getId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getPhone()
            );
        }

        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );

        return new LoginResponse(
                "Login successful",
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                token
        );
    }

    public SupplierProfile registerSupplier(
            SupplierRegistrationRequest request) {

        String normalizedEmail = normalizeEmail(request.getEmail());
        validatePasswordPolicy(request.getPassword());

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setFullName(request.getFullName() != null ? request.getFullName().trim() : "");
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : "");
        user.setRole(Role.SUPPLIER);
        user.setActive(true);

        User savedUser = userRepository.save(user);

        SupplierProfile profile = new SupplierProfile();
        profile.setUser(savedUser);
        profile.setBusinessName(request.getBusinessName());
        profile.setOwnerName(request.getOwnerName() != null ? request.getOwnerName() : request.getFullName());
        profile.setBusinessPhone(request.getBusinessPhone() != null ? request.getBusinessPhone() : request.getPhone());
        profile.setBusinessEmail(request.getBusinessEmail() != null ? request.getBusinessEmail().trim().toLowerCase() : normalizedEmail);
        profile.setAddress(request.getAddress());
        profile.setCity(request.getCity());
        profile.setState(request.getState());
        profile.setPinCode(request.getPinCode());
        profile.setBusinessType(request.getBusinessType());
        profile.setProductsSupplied(request.getProductsSupplied());
        profile.setRegistrationNumber(request.getRegistrationNumber());
        profile.setLicenseDetails(request.getLicenseDetails());
        profile.setWarehouseLocation(request.getWarehouseLocation());
        profile.setLatitude(request.getLatitude());
        profile.setLongitude(request.getLongitude());
        profile.setTaxCertificateUrl(request.getTaxCertificateUrl());
        profile.setBusinessLicenseUrl(request.getBusinessLicenseUrl());
        profile.setShopPhotoUrl(request.getShopPhotoUrl());
        profile.setVerificationStatus("PENDING");

        return supplierProfileRepository.save(profile);
    }

    public User registerDeliveryPerson(DeliveryRegistrationRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Registration request cannot be null");
        }

        if (request.getFullName() == null || request.getFullName().trim().isEmpty() ||
            request.getEmail() == null || request.getEmail().trim().isEmpty() ||
            request.getPassword() == null || request.getPassword().trim().isEmpty() ||
            request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Full name, email, password, and phone number are required.");
        }

        if (request.getDateOfBirth() != null) {
            if (request.getDateOfBirth().isAfter(java.time.LocalDate.now())) {
                throw new IllegalArgumentException("Date of birth cannot be in the future.");
            }
            int age = java.time.Period.between(request.getDateOfBirth(), java.time.LocalDate.now()).getYears();
            if (age < 18) {
                throw new IllegalArgumentException(
                        "Applicant must be at least 18 years of age to register as a delivery partner (Current calculated age: " + age + ")."
                );
            }
        }

        if (request.getDrivingLicenseExpiryDate() != null && request.getDrivingLicenseExpiryDate().isBefore(java.time.LocalDate.now())) {
            throw new IllegalArgumentException("Driving licence has expired (" + request.getDrivingLicenseExpiryDate() + "). A valid, unexpired licence is required.");
        }

        validatePasswordPolicy(request.getPassword());
        String normalizedEmail = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new RuntimeException("Email is already registered: " + normalizedEmail);
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone().trim());
        user.setRole(Role.DELIVERY_PERSON);
        user.setActive(true);

        User savedUser = userRepository.save(user);

        // Provision complete KYC profile in delivery-service
        deliveryClient.provisionFullDeliveryProfile(savedUser.getId(), request);

        return savedUser;
    }

    public Map<String, Object> getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("fullName", user.getFullName());
        data.put("email", user.getEmail());
        data.put("phone", user.getPhone());
        data.put("role", user.getRole().name());
        data.put("active", user.isActive());

        if (user.getRole() == Role.SUPPLIER) {
            supplierProfileRepository.findByUserId(userId).ifPresent(p -> {
                data.put("supplierProfileId", p.getId());
                data.put("businessName", p.getBusinessName());
                data.put("businessType", p.getBusinessType());
                data.put("businessPhone", p.getBusinessPhone());
                data.put("businessEmail", p.getBusinessEmail());
                data.put("address", p.getAddress());
                data.put("city", p.getCity());
                data.put("state", p.getState());
                data.put("pinCode", p.getPinCode());
                data.put("warehouseLocation", p.getWarehouseLocation());
                data.put("latitude", p.getLatitude());
                data.put("longitude", p.getLongitude());
                data.put("verificationStatus", p.getVerificationStatus());
                data.put("taxCertificateUrl", p.getTaxCertificateUrl());
                data.put("businessLicenseUrl", p.getBusinessLicenseUrl());
                data.put("shopPhotoUrl", p.getShopPhotoUrl());
                data.put("registrationNumber", p.getRegistrationNumber());
                data.put("licenseDetails", p.getLicenseDetails());
            });
        }
        return data;
    }

    public Map<String, Object> updateUserProfile(Long userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            user.setPhone(request.getPhone().trim());
        }
        userRepository.save(user);

        if (user.getRole() == Role.SUPPLIER) {
            supplierProfileRepository.findByUserId(userId).ifPresent(profile -> {
                if (request.getBusinessName() != null) profile.setBusinessName(request.getBusinessName());
                if (request.getBusinessPhone() != null) profile.setBusinessPhone(request.getBusinessPhone());
                if (request.getAddress() != null) profile.setAddress(request.getAddress());
                if (request.getCity() != null) profile.setCity(request.getCity());
                if (request.getState() != null) profile.setState(request.getState());
                if (request.getPinCode() != null) profile.setPinCode(request.getPinCode());
                if (request.getWarehouseLocation() != null) profile.setWarehouseLocation(request.getWarehouseLocation());
                if (request.getLatitude() != null) profile.setLatitude(request.getLatitude());
                if (request.getLongitude() != null) profile.setLongitude(request.getLongitude());
                if (request.getTaxCertificateUrl() != null) profile.setTaxCertificateUrl(request.getTaxCertificateUrl());
                if (request.getBusinessLicenseUrl() != null) profile.setBusinessLicenseUrl(request.getBusinessLicenseUrl());
                if (request.getShopPhotoUrl() != null) profile.setShopPhotoUrl(request.getShopPhotoUrl());
                if (request.getRegistrationNumber() != null) profile.setRegistrationNumber(request.getRegistrationNumber());
                if (request.getLicenseDetails() != null) profile.setLicenseDetails(request.getLicenseDetails());

                // Allow supplier to resubmit when REJECTED or requested
                if (Boolean.TRUE.equals(request.getResubmitForApproval()) || "REJECTED".equals(profile.getVerificationStatus())) {
                    profile.setVerificationStatus("PENDING");
                }
                supplierProfileRepository.save(profile);
            });
        }

        return getUserProfile(userId);
    }

    public void changePassword(Long userId, ChangePasswordRequest req) {
        if (req.getNewPassword() == null || req.getConfirmPassword() == null) {
            throw new IllegalArgumentException("New password and confirmation are required.");
        }
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirm password do not match.");
        }

        validatePasswordPolicy(req.getNewPassword());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    public void deactivateAccount(Long userId, DeactivateAccountRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Incorrect password for account deactivation.");
        }

        if (req.getConfirmationText() == null ||
                (!req.getConfirmationText().equalsIgnoreCase("DEACTIVATE") &&
                 !req.getConfirmationText().equalsIgnoreCase("DELETE"))) {
            throw new IllegalArgumentException("Please type 'DEACTIVATE' to confirm account deactivation.");
        }

        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.countByRoleAndActiveTrue(Role.ADMIN);
            if (adminCount <= 1) {
                throw new IllegalStateException("Cannot deactivate the last active platform administrator.");
            }
        }

        user.setActive(false);
        userRepository.save(user);
    }

    public PublicSupplierProfileResponse getPublicSupplierProfile(Long id) {
        SupplierProfile profile = supplierProfileRepository.findById(id)
                .or(() -> supplierProfileRepository.findByUserId(id))
                .orElseThrow(() -> new RuntimeException("Store profile not found"));

        PublicSupplierProfileResponse resp = new PublicSupplierProfileResponse();
        resp.setId(profile.getId());
        resp.setUserId(profile.getUserId());
        resp.setBusinessName(profile.getBusinessName());
        resp.setBusinessType(profile.getBusinessType());
        resp.setAddress(profile.getAddress());
        resp.setCity(profile.getCity());
        resp.setState(profile.getState());
        resp.setLatitude(profile.getLatitude());
        resp.setLongitude(profile.getLongitude());
        resp.setShopPhotoUrl(profile.getShopPhotoUrl());
        resp.setVerificationStatus(profile.getVerificationStatus());
        return resp;
    }

    public Optional<SupplierProfile> getSupplierProfile(Long userId) {
        return supplierProfileRepository.findByUserId(userId);
    }

    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public java.util.List<SupplierProfile> getAllSuppliers() {
        return supplierProfileRepository.findAll();
    }

    public java.util.List<SupplierProfile> getApprovedSuppliers() {
        return supplierProfileRepository.findByVerificationStatus("APPROVED");
    }

    public SupplierProfile updateSupplierStatus(Long id, String status) {
        SupplierProfile profile = supplierProfileRepository.findByUserId(id)
                .or(() -> supplierProfileRepository.findById(id))
                .orElseThrow(() -> new RuntimeException("Supplier profile not found with ID: " + id));
        profile.setVerificationStatus(status);
        return supplierProfileRepository.save(profile);
    }
}
