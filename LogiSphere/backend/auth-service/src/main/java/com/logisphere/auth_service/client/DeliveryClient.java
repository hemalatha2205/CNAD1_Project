package com.logisphere.auth_service.client;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.logisphere.auth_service.dto.DeliveryRegistrationRequest;

@Service
public class DeliveryClient {

    private static final Logger log = LoggerFactory.getLogger(DeliveryClient.class);
    private final RestClient deliveryRestClient;

    public DeliveryClient(RestClient deliveryRestClient) {
        this.deliveryRestClient = deliveryRestClient;
    }

    public void provisionDeliveryProfile(Long userId, String fullName, String email, String phone) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", userId);
            payload.put("fullName", fullName);
            payload.put("email", email);
            payload.put("phone", phone != null ? phone : "");
            payload.put("password", "AUTH_MANAGED");

            deliveryRestClient.post()
                    .uri("/delivery-persons/provision")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();

            log.info("Successfully provisioned delivery profile for userId: {}, email: {}", userId, email);
        } catch (Exception e) {
            log.error("Failed to provision delivery profile for userId: {}, email: {}. Error: {}",
                    userId, email, e.getMessage());
        }
    }

    public void provisionFullDeliveryProfile(Long userId, DeliveryRegistrationRequest req) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", userId);
            payload.put("fullName", req.getFullName());
            payload.put("email", req.getEmail());
            payload.put("phone", req.getPhone() != null ? req.getPhone() : "");
            payload.put("password", "AUTH_MANAGED");
            payload.put("address", req.getAddress());
            payload.put("city", req.getCity());
            payload.put("state", req.getState());
            payload.put("pinCode", req.getPinCode());
            payload.put("dateOfBirth", req.getDateOfBirth());
            payload.put("identityDocumentType", req.getIdentityDocumentType());
            payload.put("identityDocumentNumber", req.getIdentityDocumentNumber());
            payload.put("identityDocumentUrl", req.getIdentityDocumentUrl());
            payload.put("drivingLicenseNumber", req.getDrivingLicenseNumber());
            payload.put("drivingLicenseFrontUrl", req.getDrivingLicenseFrontUrl());
            payload.put("drivingLicenseBackUrl", req.getDrivingLicenseBackUrl());
            payload.put("drivingLicenseExpiryDate", req.getDrivingLicenseExpiryDate());
            payload.put("profilePhotoUrl", req.getProfilePhotoUrl());
            payload.put("vehicleType", req.getVehicleType());
            payload.put("vehicleRegistrationNumber", req.getVehicleRegistrationNumber());

            deliveryRestClient.post()
                    .uri("/delivery-persons/provision")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();

            log.info("Successfully provisioned full KYC delivery profile for userId: {}, email: {}", userId, req.getEmail());
        } catch (Exception e) {
            log.error("Failed to provision full KYC delivery profile for userId: {}, email: {}. Error: {}",
                    userId, req.getEmail(), e.getMessage());
        }
    }
}
