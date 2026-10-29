package com.logisphere.delivery_service.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.logisphere.delivery_service.event.ShipmentStatusUpdatedEvent;
import com.logisphere.delivery_service.service.DeliveryAssignmentService;

@Component
public class ShipmentStatusListener {

    private static final Logger log = LoggerFactory.getLogger(ShipmentStatusListener.class);
    private final DeliveryAssignmentService assignmentService;
    private final ObjectMapper objectMapper;

    public ShipmentStatusListener(DeliveryAssignmentService assignmentService) {
        this.assignmentService = assignmentService;
        this.objectMapper = new ObjectMapper();
    }

    @KafkaListener(topics = "shipment.status.updated", groupId = "delivery-service-group")
    public void handleShipmentStatusUpdated(String eventStr) {
        try {
            log.info("Received shipment.status.updated event: {}", eventStr);
            if (eventStr == null || eventStr.isBlank()) {
                return;
            }

            if (eventStr.startsWith("\uFEFF")) {
                eventStr = eventStr.substring(1);
            }
            eventStr = eventStr.trim();

            ShipmentStatusUpdatedEvent event = objectMapper.readValue(eventStr, ShipmentStatusUpdatedEvent.class);
            if (event == null || event.getShipmentId() == null) {
                log.warn("Event missing shipmentId, ignoring: {}", eventStr);
                return;
            }

            if ("DELIVERED".equalsIgnoreCase(event.getStatus())) {
                assignmentService.completeAssignmentForShipment(event.getShipmentId());
                log.info("Handled DELIVERED event for shipment ID: {}", event.getShipmentId());
            }
        } catch (Exception e) {
            log.error("Error processing ShipmentStatusUpdatedEvent: {}", e.getMessage(), e);
        }
    }
}
