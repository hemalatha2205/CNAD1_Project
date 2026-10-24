package com.logisphere.delivery_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.logisphere.delivery_service.entity.AssignmentStatus;
import com.logisphere.delivery_service.entity.DeliveryAssignment;

public interface DeliveryAssignmentRepository
        extends JpaRepository<DeliveryAssignment, Long> {

    Optional<DeliveryAssignment> findByShipmentId(
            Long shipmentId);

    List<DeliveryAssignment> findByDeliveryPersonId(
            Long deliveryPersonId);

    long countByDeliveryPersonIdAndStatus(
            Long deliveryPersonId,
            AssignmentStatus status);
}
