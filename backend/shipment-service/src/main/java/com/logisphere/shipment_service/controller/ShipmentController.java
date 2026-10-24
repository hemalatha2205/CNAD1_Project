package com.logisphere.shipment_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.logisphere.shipment_service.entity.Shipment;
import com.logisphere.shipment_service.entity.ShipmentStatus;
import com.logisphere.shipment_service.service.ShipmentService;

@RestController
@RequestMapping("/shipments")
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(
            ShipmentService shipmentService) {

        this.shipmentService = shipmentService;
    }

    @PostMapping
    public ResponseEntity<Shipment> createShipment(
            @RequestParam Long orderId,
            @RequestParam Long customerId,
            @RequestParam String customerName,
            @RequestParam(required = false)
            String deliveryAddress) {

        return ResponseEntity.ok(
                shipmentService.createShipment(
                        orderId,
                        customerId,
                        customerName,
                        deliveryAddress
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Shipment> getShipment(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                shipmentService.getShipment(id)
        );
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Shipment> getShipmentByOrderId(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                shipmentService.getShipmentByOrderId(orderId)
        );
    }

    @GetMapping
    public ResponseEntity<java.util.List<Shipment>> getAllShipments(
            @org.springframework.web.bind.annotation.RequestHeader(value = "Authorization", required = false) String authHeader) {
        String role = com.logisphere.shipment_service.security.JwtTokenUtil.extractRole(authHeader);
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(shipmentService.getAllShipments());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Shipment> updateStatus(
            @PathVariable Long id,
            @RequestParam ShipmentStatus status) {

        return ResponseEntity.ok(
                shipmentService.updateStatus(
                        id,
                        status
                )
        );
    }
}
