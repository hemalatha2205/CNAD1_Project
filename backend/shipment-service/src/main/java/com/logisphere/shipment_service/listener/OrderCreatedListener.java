package com.logisphere.shipment_service.listener;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.logisphere.shipment_service.event.OrderCreatedEvent;
import com.logisphere.shipment_service.repository.ShipmentRepository;

@Component
public class OrderCreatedListener {

    private final ShipmentRepository shipmentRepository;

    public OrderCreatedListener(ShipmentRepository shipmentRepository) {
        this.shipmentRepository = shipmentRepository;
    }

    @KafkaListener(topics = "order.created", groupId = "shipment-service-group")
    public void handleOrderCreated(String eventStr) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            OrderCreatedEvent event = mapper.readValue(eventStr, OrderCreatedEvent.class);
            if (shipmentRepository.findByOrderId(event.getOrderId()).isEmpty()) {
                System.out.println("Received OrderCreatedEvent for order " + event.getOrderId() + " but no shipment exists. A REST failure may have occurred. We would create the shipment here in a fully async design.");
                // For this requirement: "Do NOT replace existing critical database operations with unsafe asynchronous behavior",
                // we'll just log it. If the REST call worked, findByOrderId is NOT empty, so we safely ignore it.
            } else {
                System.out.println("Received OrderCreatedEvent for order " + event.getOrderId() + ". Shipment already exists (idempotent ignore).");
            }
        } catch (Exception e) {
            System.err.println("Error processing OrderCreatedEvent: " + e.getMessage());
        }
    }
}
