package com.logisphere.shipment_service.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.logisphere.shipment_service.client.DeliveryClient;
import com.logisphere.shipment_service.entity.Shipment;
import com.logisphere.shipment_service.entity.ShipmentStatus;
import com.logisphere.shipment_service.repository.ShipmentRepository;

@Service
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final DeliveryClient deliveryClient;
    private final org.springframework.kafka.core.KafkaTemplate<String, String> kafkaTemplate;

    public ShipmentService(
            ShipmentRepository shipmentRepository,
            DeliveryClient deliveryClient,
            org.springframework.kafka.core.KafkaTemplate<String, String> kafkaTemplate) {

        this.shipmentRepository = shipmentRepository;
        this.deliveryClient = deliveryClient;
        this.kafkaTemplate = kafkaTemplate;
    }

    public Shipment createShipment(
            Long orderId,
            Long customerId,
            String customerName,
            String deliveryAddress) {

        if (shipmentRepository.findByOrderId(orderId).isPresent()) {

            throw new RuntimeException(
                    "Shipment already exists for order ID: "
                            + orderId
            );
        }

        Shipment shipment = new Shipment();

        shipment.setOrderId(orderId);
        shipment.setCustomerId(customerId);
        shipment.setCustomerName(customerName);
        shipment.setDeliveryAddress(deliveryAddress);

        shipment.setStatus(ShipmentStatus.CREATED);

        shipment.setTrackingNumber(
                "LOGI-" +
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase()
        );

        shipment.setCreatedAt(LocalDateTime.now());
        shipment.setUpdatedAt(LocalDateTime.now());

        Shipment savedShipment = shipmentRepository.save(shipment);

        try {
            com.logisphere.shipment_service.event.ShipmentStatusUpdatedEvent event = new com.logisphere.shipment_service.event.ShipmentStatusUpdatedEvent();
            event.setEventId(java.util.UUID.randomUUID().toString());
            event.setShipmentId(savedShipment.getId());
            event.setOrderId(savedShipment.getOrderId());
            event.setStatus(savedShipment.getStatus().name());
            event.setTimestamp(java.time.Instant.now().toString());

            try { com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper(); kafkaTemplate.send("shipment.status.updated", String.valueOf(savedShipment.getId()), mapper.writeValueAsString(event)); } catch (Exception e) { e.printStackTrace(); }
        } catch (Exception e) {
            System.err.println("Failed to publish ShipmentStatusUpdatedEvent: " + e.getMessage());
        }

        return savedShipment;
    }

    public Shipment getShipment(Long id) {

        return shipmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Shipment not found with ID: " + id
                        )
                );
    }

    public Shipment getShipmentByOrderId(Long orderId) {

        return shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Shipment not found for order ID: " + orderId
                        )
                );
    }

    public Shipment updateStatus(
            Long id,
            ShipmentStatus newStatus) {

        Shipment shipment = getShipment(id);

        ShipmentStatus currentStatus =
                shipment.getStatus();

        /*
         * Check whether the requested status
         * is the next valid status.
         */
        if (!isValidNextStatus(
                currentStatus,
                newStatus)) {

            throw new RuntimeException(
                    "Invalid shipment status transition: "
                            + currentStatus
                            + " → "
                            + newStatus
                            + ". Valid next status: "
                            + getNextStatus(currentStatus)
            );
        }

        shipment.setStatus(newStatus);
        shipment.setUpdatedAt(LocalDateTime.now());

        Shipment savedShipment = shipmentRepository.save(shipment);

        try {
            com.logisphere.shipment_service.event.ShipmentStatusUpdatedEvent event = new com.logisphere.shipment_service.event.ShipmentStatusUpdatedEvent();
            event.setEventId(java.util.UUID.randomUUID().toString());
            event.setShipmentId(savedShipment.getId());
            event.setOrderId(savedShipment.getOrderId());
            event.setStatus(savedShipment.getStatus().name());
            event.setTimestamp(java.time.Instant.now().toString());

            try { com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper(); kafkaTemplate.send("shipment.status.updated", String.valueOf(savedShipment.getId()), mapper.writeValueAsString(event)); } catch (Exception e) { e.printStackTrace(); }
        } catch (Exception e) {
            System.err.println("Failed to publish ShipmentStatusUpdatedEvent: " + e.getMessage());
        }

        return savedShipment;
    }

    private boolean isValidNextStatus(
            ShipmentStatus current,
            ShipmentStatus next) {

        switch (current) {

            case CREATED:
                return next == ShipmentStatus.PACKED;

            case PACKED:
                return next == ShipmentStatus.SHIPPED;

            case SHIPPED:
                return next == ShipmentStatus.IN_TRANSIT;

            case IN_TRANSIT:
                return next == ShipmentStatus.OUT_FOR_DELIVERY;

            case OUT_FOR_DELIVERY:
                return next == ShipmentStatus.DELIVERED;

            case DELIVERED:
                return false;

            default:
                return false;
        }
    }

    private ShipmentStatus getNextStatus(
            ShipmentStatus current) {

        switch (current) {

            case CREATED:
                return ShipmentStatus.PACKED;

            case PACKED:
                return ShipmentStatus.SHIPPED;

            case SHIPPED:
                return ShipmentStatus.IN_TRANSIT;

            case IN_TRANSIT:
                return ShipmentStatus.OUT_FOR_DELIVERY;

            case OUT_FOR_DELIVERY:
                return ShipmentStatus.DELIVERED;

            case DELIVERED:
                return null;

            default:
                return null;
        }
    }
    public java.util.List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }
}
