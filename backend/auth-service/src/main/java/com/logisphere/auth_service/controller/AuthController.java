package com.logisphere.auth_service.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.logisphere.auth_service.dto.ChangePasswordRequest;
import com.logisphere.auth_service.dto.DeactivateAccountRequest;
import com.logisphere.auth_service.dto.DeliveryRegistrationRequest;
import com.logisphere.auth_service.dto.LoginRequest;
import com.logisphere.auth_service.dto.LoginResponse;
import com.logisphere.auth_service.dto.ProfileUpdateRequest;
import com.logisphere.auth_service.dto.PublicSupplierProfileResponse;
import com.logisphere.auth_service.dto.SupplierRegistrationRequest;
import com.logisphere.auth_service.entity.Role;
import com.logisphere.auth_service.entity.SupplierProfile;
import com.logisphere.auth_service.entity.User;
import com.logisphere.auth_service.security.JwtService;
import com.logisphere.auth_service.service.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // CUSTOMER / NORMAL USER REGISTRATION
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {
        try {
            User user = authService.register(
                    request.getFullName(),
                    request.getEmail(),
                    request.getPassword(),
                    request.getPhone(),
                    request.getRole()
            );
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(
                    request.getEmail(),
                    request.getPassword()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    // SUPPLIER REGISTRATION
    @PostMapping("/register/supplier")
    public ResponseEntity<?> registerSupplier(
            @RequestBody SupplierRegistrationRequest request) {
        try {
            SupplierProfile profile = authService.registerSupplier(request);
            return ResponseEntity.ok(profile);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    // DELIVERY PERSON REGISTRATION
    @PostMapping("/register/delivery")
    public ResponseEntity<?> registerDelivery(
            @RequestBody DeliveryRegistrationRequest request) {
        try {
            User user = authService.registerDeliveryPerson(request);
            return ResponseEntity.ok(Map.of(
                    "message", "Delivery partner registered successfully. Verification is pending review.",
                    "userId", user.getId(),
                    "email", user.getEmail(),
                    "role", user.getRole().name()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    // USER PROFILE (ACCOUNT SETTINGS)
    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = JwtService.extractUserIdFromStaticHeader(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access"));
        }
        try {
            Map<String, Object> profile = authService.getUserProfile(userId);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateCurrentProfile(
            @RequestBody ProfileUpdateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = JwtService.extractUserIdFromStaticHeader(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access"));
        }
        try {
            Map<String, Object> updated = authService.updateUserProfile(userId, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // CHANGE PASSWORD
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = JwtService.extractUserIdFromStaticHeader(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access"));
        }
        try {
            authService.changePassword(userId, request);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // ACCOUNT DEACTIVATION / SAFE REMOVAL
    @PostMapping("/account/deactivate")
    public ResponseEntity<?> deactivateAccount(
            @RequestBody DeactivateAccountRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = JwtService.extractUserIdFromStaticHeader(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access"));
        }
        try {
            authService.deactivateAccount(userId, request);
            return ResponseEntity.ok(Map.of("message", "Account successfully deactivated. You have been signed out."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // PUBLIC STORE PROFILE (FOR CUSTOMERS)
    @GetMapping("/suppliers/public/{id}")
    public ResponseEntity<?> getPublicSupplierProfile(@PathVariable Long id) {
        try {
            PublicSupplierProfileResponse resp = authService.getPublicSupplierProfile(id);
            return ResponseEntity.ok(resp);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // INTERNAL/RESTRICTED SUPPLIER PROFILE
    @GetMapping("/supplier/{id}")
    public ResponseEntity<SupplierProfile> getSupplierProfile(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String role = JwtService.extractRoleFromStaticHeader(authHeader);
        if ("SUPPLIER".equals(role)) {
            Long jwtUserId = JwtService.extractUserIdFromStaticHeader(authHeader);
            if (jwtUserId == null || !jwtUserId.equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        return authService.getSupplierProfile(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ADMIN ENDPOINTS
    @GetMapping("/users")
    public ResponseEntity<java.util.List<User>> getAllUsers(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String role = JwtService.extractRoleFromStaticHeader(authHeader);
        if (!"ADMIN".equals(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @GetMapping("/suppliers")
    public ResponseEntity<java.util.List<SupplierProfile>> getAllSuppliers(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String role = JwtService.extractRoleFromStaticHeader(authHeader);
        if (!"ADMIN".equals(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(authService.getAllSuppliers());
    }

    @GetMapping("/suppliers/approved")
    public ResponseEntity<java.util.List<SupplierProfile>> getApprovedSuppliers() {
        return ResponseEntity.ok(authService.getApprovedSuppliers());
    }

    @PutMapping("/suppliers/{id}/verify")
    public ResponseEntity<SupplierProfile> verifySupplier(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String role = JwtService.extractRoleFromStaticHeader(authHeader);
        if (!"ADMIN".equals(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(authService.updateSupplierStatus(id, status));
    }

    // NORMAL USER REGISTRATION REQUEST
    public static class RegisterRequest {
        private String fullName;
        private String email;
        private String password;
        private String phone;
        private Role role;

        public RegisterRequest() {}

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

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public Role getRole() {
            return role;
        }

        public void setRole(Role role) {
            this.role = role;
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> testProtectedEndpoint() {
        return ResponseEntity.ok("JWT authentication successful");
    }
}
