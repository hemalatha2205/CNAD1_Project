package com.logisphere.delivery_service.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.logisphere.delivery_service.entity.AssignmentStatus;
import com.logisphere.delivery_service.entity.DeliveryAssignment;
import com.logisphere.delivery_service.repository.DeliveryAssignmentRepository;
import com.logisphere.delivery_service.repository.DeliveryPersonRepository;

@ExtendWith(MockitoExtension.class)
class DeliveryAssignmentServiceTest {

    @Mock
    private DeliveryAssignmentRepository assignmentRepository;

    @Mock
    private DeliveryPersonService deliveryPersonService;

    @Mock
    private DeliveryPersonRepository deliveryPersonRepository;

    private DeliveryAssignmentService service;

    @BeforeEach
    void setUp() {
        service = new DeliveryAssignmentService(
                assignmentRepository,
                deliveryPersonService,
                deliveryPersonRepository
        );
    }

    @Test
    void testCompleteAssignmentForShipment_Success() {
        Long shipmentId = 3L;
        DeliveryAssignment assignment = new DeliveryAssignment();
        assignment.setId(1L);
        assignment.setShipmentId(shipmentId);
        assignment.setStatus(AssignmentStatus.ASSIGNED);
        assignment.setAssignedAt(LocalDateTime.now().minusHours(1));

        when(assignmentRepository.findByShipmentId(shipmentId)).thenReturn(Optional.of(assignment));
        when(assignmentRepository.save(any(DeliveryAssignment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DeliveryAssignment result = service.completeAssignmentForShipment(shipmentId);

        assertNotNull(result);
        assertEquals(AssignmentStatus.COMPLETED, result.getStatus());
        assertNotNull(result.getUpdatedAt());
        verify(assignmentRepository, times(1)).save(assignment);
    }

    @Test
    void testCompleteAssignmentForShipment_AlreadyCompleted_Idempotent() {
        Long shipmentId = 3L;
        DeliveryAssignment assignment = new DeliveryAssignment();
        assignment.setId(1L);
        assignment.setShipmentId(shipmentId);
        assignment.setStatus(AssignmentStatus.COMPLETED);
        LocalDateTime originalUpdatedAt = LocalDateTime.now().minusMinutes(30);
        assignment.setUpdatedAt(originalUpdatedAt);

        when(assignmentRepository.findByShipmentId(shipmentId)).thenReturn(Optional.of(assignment));

        DeliveryAssignment result = service.completeAssignmentForShipment(shipmentId);

        assertNotNull(result);
        assertEquals(AssignmentStatus.COMPLETED, result.getStatus());
        assertEquals(originalUpdatedAt, result.getUpdatedAt());
        // Verify save was not called redundantly
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    void testCompleteAssignmentForShipment_NoMatchingAssignment_ReturnsNull() {
        Long shipmentId = 999L;
        when(assignmentRepository.findByShipmentId(shipmentId)).thenReturn(Optional.empty());

        DeliveryAssignment result = service.completeAssignmentForShipment(shipmentId);

        assertNull(result);
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    void testCompleteAssignmentForShipment_NullShipmentId_ReturnsNull() {
        DeliveryAssignment result = service.completeAssignmentForShipment(null);

        assertNull(result);
        verify(assignmentRepository, never()).findByShipmentId(any());
    }
}
