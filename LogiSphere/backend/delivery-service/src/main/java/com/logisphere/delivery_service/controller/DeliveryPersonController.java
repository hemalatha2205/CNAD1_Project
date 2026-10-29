package com.logisphere.delivery_service.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.logisphere.delivery_service.dto.DeliveryResubmissionRequest;
import com.logisphere.delivery_service.dto.KycDecisionRequest;
import com.logisphere.delivery_service.entity.AssignmentStatus;
import com.logisphere.delivery_service.entity.DeliveryAssignment;
import com.logisphere.delivery_service.entity.DeliveryKycAuditLog;
import com.logisphere.delivery_service.entity.DeliveryPerson;
import com.logisphere.delivery_service.entity.VerificationStatus;
import com.logisphere.delivery_service.repository.DeliveryAssignmentRepository;
import com.logisphere.delivery_service.repository.DeliveryPersonRepository;
import com.logisphere.delivery_service.security.JwtTokenUtil;
import com.logisphere.delivery_service.service.DeliveryPersonService;

@RestController
@RequestMapping("/delivery-persons")
public class DeliveryPersonController {

    private final DeliveryPersonService deliveryPersonService;
    private final DeliveryPersonRepository deliveryPersonRepository;
    private final DeliveryAssignmentRepository assignmentRepository;

    public DeliveryPersonController(
            DeliveryPersonService deliveryPersonService,
            DeliveryPersonRepository deliveryPersonRepository,
            DeliveryAssignmentRepository assignmentRepository) {

        this.deliveryPersonService = deliveryPersonService;
        this.deliveryPersonRepository = deliveryPersonRepository;
        this.assignmentRepository = assignmentRepository;
    }

    @PostMapping
    public ResponseEntity<?> register(@RequestBody DeliveryPerson deliveryPerson) {
        try {
            return ResponseEntity.ok(deliveryPersonService.register(deliveryPerson));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/provision")
    public ResponseEntity<?> provision(@RequestBody DeliveryPerson deliveryPerson) {
        try {
            return ResponseEntity.ok(deliveryPersonService.provision(deliveryPerson));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<DeliveryPerson>> getAll(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String role = JwtTokenUtil.extractRole(authHeader);
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(deliveryPersonRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        DeliveryPerson person = deliveryPersonService.getById(id);
        String role = JwtTokenUtil.extractRole(authHeader);
        Long jwtUserId = JwtTokenUtil.extractUserId(authHeader);

        // Security check: only ADMIN or profile owner can read sensitive KYC details
        if (!"ADMIN".equals(role) && (jwtUserId == null || !jwtUserId.equals(person.getUserId()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied to delivery person KYC details."));
        }

        return ResponseEntity.ok(person);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getByUserId(
            @PathVariable Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String role = JwtTokenUtil.extractRole(authHeader);
        Long jwtUserId = JwtTokenUtil.extractUserId(authHeader);

        if (!"ADMIN".equals(role) && (jwtUserId == null || !jwtUserId.equals(userId))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied to delivery person details."));
        }

        return deliveryPersonService.getByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ADMIN KYC DECISION & STATUS UPDATE
    @PutMapping("/{id}/verify")
    public ResponseEntity<?> updateVerification(
            @PathVariable Long id,
            @RequestParam(required = false) VerificationStatus status,
            @RequestBody(required = false) KycDecisionRequest body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String role = JwtTokenUtil.extractRole(authHeader);
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only administrators can perform KYC verification."));
        }

        Long adminId = JwtTokenUtil.extractUserId(authHeader);
        String adminEmail = JwtTokenUtil.extractEmail(authHeader);

        KycDecisionRequest decision = body != null ? body : new KycDecisionRequest();
        if (decision.getStatus() == null && status != null) {
            decision.setStatus(status);
        }

        try {
            DeliveryPerson updated = deliveryPersonService.applyKycDecision(id, decision, adminId, adminEmail);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/review-decision")
    public ResponseEntity<?> reviewDecision(
            @PathVariable Long id,
            @RequestBody KycDecisionRequest decision,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String role = JwtTokenUtil.extractRole(authHeader);
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only administrators can perform KYC verification."));
        }

        Long adminId = JwtTokenUtil.extractUserId(authHeader);
        String adminEmail = JwtTokenUtil.extractEmail(authHeader);

        try {
            DeliveryPerson updated = deliveryPersonService.applyKycDecision(id, decision, adminId, adminEmail);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // APPLICANT KYC RESUBMISSION
    @PutMapping("/{id}/resubmit")
    public ResponseEntity<?> resubmitKyc(
            @PathVariable Long id,
            @RequestBody DeliveryResubmissionRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Long jwtUserId = JwtTokenUtil.extractUserId(authHeader);
        String jwtEmail = JwtTokenUtil.extractEmail(authHeader);
        String role = JwtTokenUtil.extractRole(authHeader);

        if (jwtUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required."));
        }

        try {
            DeliveryPerson updated = deliveryPersonService.resubmitKyc(id, request, jwtUserId, jwtEmail);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // AUDIT LOGS FOR APPLICANT AND ADMIN
    @GetMapping("/{id}/audit-logs")
    public ResponseEntity<?> getAuditLogs(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String role = JwtTokenUtil.extractRole(authHeader);
        Long jwtUserId = JwtTokenUtil.extractUserId(authHeader);
        DeliveryPerson person = deliveryPersonService.getById(id);

        if (!"ADMIN".equals(role) && (jwtUserId == null || !jwtUserId.equals(person.getUserId()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied to audit trail."));
        }

        return ResponseEntity.ok(deliveryPersonService.getAuditLogs(id));
    }

    @GetMapping("/{id}/assignments")
    public ResponseEntity<List<DeliveryAssignment>> getAssignments(@PathVariable Long id) {
        DeliveryPerson person = deliveryPersonService.getById(id);
        if (person.getVerificationStatus() != VerificationStatus.APPROVED) {
            // Unverified or suspended drivers cannot access active assignment workload
            return ResponseEntity.ok(
                    assignmentRepository.findByDeliveryPersonId(id).stream()
                            .filter(a -> a.getStatus() == AssignmentStatus.COMPLETED)
                            .toList()
            );
        }
        return ResponseEntity.ok(assignmentRepository.findByDeliveryPersonId(id));
    }

    @GetMapping("/user/{userId}/assignments")
    public ResponseEntity<List<DeliveryAssignment>> getAssignmentsByUserId(@PathVariable Long userId) {
        return deliveryPersonRepository.findByUserId(userId)
                .map(person -> {
                    List<DeliveryAssignment> all = assignmentRepository.findByDeliveryPersonId(person.getId());
                    if (person.getVerificationStatus() != VerificationStatus.APPROVED) {
                        return ResponseEntity.ok(
                                all.stream().filter(a -> a.getStatus() == AssignmentStatus.COMPLETED).toList()
                        );
                    }
                    return ResponseEntity.ok(all);
                })
                .orElseGet(() -> ResponseEntity.ok(List.of()));
    }
}
