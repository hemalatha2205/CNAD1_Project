package com.logisphere.delivery_service.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.logisphere.delivery_service.dto.KycDecisionRequest;
import com.logisphere.delivery_service.entity.DeliveryKycAuditLog;
import com.logisphere.delivery_service.entity.DeliveryPerson;
import com.logisphere.delivery_service.entity.VerificationStatus;
import com.logisphere.delivery_service.repository.DeliveryKycAuditLogRepository;
import com.logisphere.delivery_service.repository.DeliveryPersonRepository;

@ExtendWith(MockitoExtension.class)
class DeliveryPersonServiceTest {

    @Mock
    private DeliveryPersonRepository repository;

    @Mock
    private DeliveryKycAuditLogRepository auditLogRepository;

    private DeliveryPersonService service;

    @BeforeEach
    void setUp() {
        service = new DeliveryPersonService(repository, auditLogRepository);
    }

    @Test
    void testProvision_NewPerson_SetsPendingVerification() {
        DeliveryPerson newPerson = new DeliveryPerson();
        newPerson.setUserId(10L);
        newPerson.setFullName("Delivery Test");
        newPerson.setEmail("delivery1@test.com");
        newPerson.setPhone("9876543210");
        newPerson.setDateOfBirth(LocalDate.now().minusYears(22));
        newPerson.setDrivingLicenseExpiryDate(LocalDate.now().plusYears(3));

        when(repository.findByUserId(10L)).thenReturn(Optional.empty());
        when(repository.findByEmail("delivery1@test.com")).thenReturn(Optional.empty());
        when(repository.save(any(DeliveryPerson.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DeliveryPerson result = service.provision(newPerson);

        assertNotNull(result);
        assertEquals(10L, result.getUserId());
        assertEquals("Delivery Test", result.getFullName());
        assertEquals("delivery1@test.com", result.getEmail());
        assertEquals(VerificationStatus.PENDING_VERIFICATION, result.getVerificationStatus());
        assertEquals("AUTH_MANAGED", result.getPassword());
        assertNotNull(result.getCreatedAt());
        verify(auditLogRepository, times(1)).save(any(DeliveryKycAuditLog.class));
    }

    @Test
    void testProvision_AgeUnder18_ThrowsException() {
        DeliveryPerson underage = new DeliveryPerson();
        underage.setFullName("Minor Driver");
        underage.setEmail("minor@test.com");
        underage.setDateOfBirth(LocalDate.now().minusYears(16));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.provision(underage));
        assertTrue(ex.getMessage().contains("at least 18 years of age"));
    }

    @Test
    void testProvision_ExpiredLicence_ThrowsException() {
        DeliveryPerson expired = new DeliveryPerson();
        expired.setFullName("Expired Licence Driver");
        expired.setEmail("expired@test.com");
        expired.setDateOfBirth(LocalDate.now().minusYears(25));
        expired.setDrivingLicenseExpiryDate(LocalDate.now().minusDays(10));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.provision(expired));
        assertTrue(ex.getMessage().contains("Driving licence has expired"));
    }

    @Test
    void testApplyKycDecision_RejectWithoutReason_ThrowsException() {
        DeliveryPerson person = new DeliveryPerson();
        person.setId(1L);
        person.setVerificationStatus(VerificationStatus.PENDING_VERIFICATION);
        when(repository.findById(1L)).thenReturn(Optional.of(person));

        KycDecisionRequest decision = new KycDecisionRequest();
        decision.setStatus(VerificationStatus.REJECTED);
        decision.setReason(""); // empty reason

        assertThrows(IllegalArgumentException.class, () -> service.applyKycDecision(1L, decision, 7L, "admin@test.com"));
    }

    @Test
    void testApplyKycDecision_Approve_SuccessAndAuditLogged() {
        DeliveryPerson person = new DeliveryPerson();
        person.setId(1L);
        person.setVerificationStatus(VerificationStatus.UNDER_REVIEW);
        when(repository.findById(1L)).thenReturn(Optional.of(person));
        when(repository.save(any(DeliveryPerson.class))).thenAnswer(invocation -> invocation.getArgument(0));

        KycDecisionRequest decision = new KycDecisionRequest();
        decision.setStatus(VerificationStatus.APPROVED);
        decision.setNotes("All documents verified and valid.");

        DeliveryPerson updated = service.applyKycDecision(1L, decision, 7L, "admin@test.com");

        assertEquals(VerificationStatus.APPROVED, updated.getVerificationStatus());
        assertEquals("admin@test.com", updated.getReviewedBy());
        assertNotNull(updated.getReviewedAt());
        verify(auditLogRepository, times(1)).save(any(DeliveryKycAuditLog.class));
    }

    @Test
    void testApplyKycDecision_SuspendUnapprovedDriver_ThrowsException() {
        DeliveryPerson person = new DeliveryPerson();
        person.setId(1L);
        person.setVerificationStatus(VerificationStatus.PENDING_VERIFICATION);
        when(repository.findById(1L)).thenReturn(Optional.of(person));

        KycDecisionRequest decision = new KycDecisionRequest();
        decision.setStatus(VerificationStatus.SUSPENDED);
        decision.setReason("Violation reported");

        assertThrows(IllegalArgumentException.class, () -> service.applyKycDecision(1L, decision, 7L, "admin@test.com"));
    }
}
