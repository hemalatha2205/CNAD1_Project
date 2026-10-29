package com.logisphere.delivery_service.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.logisphere.delivery_service.entity.AssignmentStatus;
import com.logisphere.delivery_service.entity.DeliveryAssignment;
import com.logisphere.delivery_service.entity.DeliveryPerson;
import com.logisphere.delivery_service.entity.VerificationStatus;
import com.logisphere.delivery_service.repository.DeliveryAssignmentRepository;
import com.logisphere.delivery_service.repository.DeliveryPersonRepository;

@Service
public class DeliveryAssignmentService {

    private final DeliveryAssignmentRepository assignmentRepository;
    private final DeliveryPersonService deliveryPersonService;
    private final DeliveryPersonRepository deliveryPersonRepository;

    public DeliveryAssignmentService(
            DeliveryAssignmentRepository assignmentRepository,
            DeliveryPersonService deliveryPersonService,
            DeliveryPersonRepository deliveryPersonRepository) {

        this.assignmentRepository = assignmentRepository;
        this.deliveryPersonService = deliveryPersonService;
        this.deliveryPersonRepository = deliveryPersonRepository;
    }

    public DeliveryAssignment assignShipment(
            Long shipmentId,
            Long deliveryPersonId,
            String trackingNumber) {

        if (assignmentRepository
                .findByShipmentId(shipmentId)
                .isPresent()) {

            throw new RuntimeException(
                    "Shipment is already assigned"
            );
        }

        DeliveryPerson person =
                deliveryPersonService.getById(
                        deliveryPersonId
                );

        if (person.getVerificationStatus()
                != VerificationStatus.APPROVED) {

            throw new RuntimeException(
                    "Delivery person is not approved"
            );
        }

        DeliveryAssignment assignment =
                new DeliveryAssignment();

        assignment.setShipmentId(shipmentId);

        assignment.setDeliveryPersonId(
                deliveryPersonId
        );

        assignment.setDeliveryPersonName(
                person.getFullName()
        );

        assignment.setTrackingNumber(
                trackingNumber
        );

        assignment.setStatus(
                AssignmentStatus.ASSIGNED
        );

        assignment.setAssignedAt(
                LocalDateTime.now()
        );

        assignment.setUpdatedAt(
                LocalDateTime.now()
        );

        return assignmentRepository.save(
                assignment
        );
    }

    public DeliveryAssignment getAssignment(
            Long id) {

        return assignmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Assignment not found with ID: "
                                        + id
                        )
                );
    }

    public DeliveryAssignment getByShipmentId(
            Long shipmentId) {

        return assignmentRepository
                .findByShipmentId(shipmentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "No assignment found for shipment ID: "
                                        + shipmentId
                        )
                );
    }
    public long getActiveWorkload(
            Long deliveryPersonId) {

        return assignmentRepository
                .countByDeliveryPersonIdAndStatus(
                        deliveryPersonId,
                        AssignmentStatus.ASSIGNED
                );
    }
    public DeliveryAssignment autoAssignShipment(
        Long shipmentId,
        String trackingNumber) {

        if (assignmentRepository
                .findByShipmentId(shipmentId)
                .isPresent()) {

            throw new RuntimeException(
                    "Shipment is already assigned"
            );
        }

        /*
        * Find all approved delivery persons.
        */
        var approvedPersons =
                deliveryPersonRepository
                        .findByVerificationStatus(
                                VerificationStatus.APPROVED
                        );

        if (approvedPersons.isEmpty()) {

            throw new RuntimeException(
                    "No approved delivery persons available"
            );
        }

        /*
        * Select the approved delivery person
        * with the lowest active workload.
        */
        DeliveryPerson selectedPerson =
                approvedPersons.get(0);

        long lowestWorkload =
                getActiveWorkload(
                        selectedPerson.getId()
                );

        for (DeliveryPerson person :
                approvedPersons) {

            long workload =
                    getActiveWorkload(
                            person.getId()
                    );

            if (workload < lowestWorkload) {

                selectedPerson = person;
                lowestWorkload = workload;
            }
        }

        /*
        * Create assignment.
        */
        DeliveryAssignment assignment =
                new DeliveryAssignment();

        assignment.setShipmentId(shipmentId);

        assignment.setDeliveryPersonId(
                selectedPerson.getId()
        );

        assignment.setDeliveryPersonName(
                selectedPerson.getFullName()
        );

        assignment.setTrackingNumber(
                trackingNumber
        );

        assignment.setStatus(
                AssignmentStatus.ASSIGNED
        );

        assignment.setAssignedAt(
                LocalDateTime.now()
        );

        assignment.setUpdatedAt(
                LocalDateTime.now()
        );

        return assignmentRepository.save(
                assignment
        );
    }

    @Transactional
    public DeliveryAssignment completeAssignmentForShipment(Long shipmentId) {
        if (shipmentId == null) {
            return null;
        }

        java.util.Optional<DeliveryAssignment> opt =
                assignmentRepository.findByShipmentId(shipmentId);

        if (opt.isEmpty()) {
            return null;
        }

        DeliveryAssignment assignment = opt.get();

        // Idempotent: If already COMPLETED, do not reset or duplicate
        if (assignment.getStatus() == AssignmentStatus.COMPLETED) {
            return assignment;
        }

        assignment.setStatus(AssignmentStatus.COMPLETED);
        assignment.setUpdatedAt(LocalDateTime.now());

        return assignmentRepository.save(assignment);
    }
}
