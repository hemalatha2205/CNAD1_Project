package com.logisphere.delivery_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.logisphere.delivery_service.entity.DeliveryAssignment;
import com.logisphere.delivery_service.service.DeliveryAssignmentService;

@RestController
@RequestMapping("/assignments")
public class DeliveryAssignmentController {

    private final DeliveryAssignmentService service;

    public DeliveryAssignmentController(
            DeliveryAssignmentService service) {

        this.service = service;
    }
    @PostMapping("/auto-assign")
    public ResponseEntity<DeliveryAssignment>
    autoAssignShipment(
            @RequestParam Long shipmentId,
            @RequestParam String trackingNumber) {

        return ResponseEntity.ok(
                service.autoAssignShipment(
                        shipmentId,
                        trackingNumber
                )
        );
    }

    @PostMapping
    public ResponseEntity<DeliveryAssignment>
    assignShipment(
            @RequestParam Long shipmentId,
            @RequestParam Long deliveryPersonId,
            @RequestParam String trackingNumber) {

        return ResponseEntity.ok(
                service.assignShipment(
                        shipmentId,
                        deliveryPersonId,
                        trackingNumber
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryAssignment>
    getAssignment(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                service.getAssignment(id)
        );
    }

    @GetMapping("/shipment/{shipmentId}")
    public ResponseEntity<DeliveryAssignment>
    getByShipment(
            @PathVariable Long shipmentId) {

        return ResponseEntity.ok(
                service.getByShipmentId(shipmentId)
        );
    }
    @GetMapping("/delivery-person/{deliveryPersonId}/workload")
    public ResponseEntity<Long> getWorkload(
            @PathVariable Long deliveryPersonId) {

        return ResponseEntity.ok(
                service.getActiveWorkload(
                        deliveryPersonId
                )
        );
    }
}
