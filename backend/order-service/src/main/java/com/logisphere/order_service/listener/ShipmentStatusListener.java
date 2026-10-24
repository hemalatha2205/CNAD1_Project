package com.logisphere.order_service.listener;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.logisphere.order_service.entity.Order;
import com.logisphere.order_service.entity.OrderStatus;
import com.logisphere.order_service.event.ShipmentStatusUpdatedEvent;
import com.logisphere.order_service.repository.OrderRepository;

@Component
public class ShipmentStatusListener {

    private final OrderRepository orderRepository;

    public ShipmentStatusListener(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @KafkaListener(topics = "shipment.status.updated", groupId = "order-service-group")
    public void handleShipmentStatusUpdated(String eventStr) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            ShipmentStatusUpdatedEvent event = mapper.readValue(eventStr, ShipmentStatusUpdatedEvent.class);
            Order order = orderRepository.findById(event.getOrderId()).orElse(null);
            if (order != null) {
                // Map shipment status to order status
                OrderStatus newStatus = null;
                switch (event.getStatus()) {
                    case "PACKED":
                        newStatus = OrderStatus.PACKED;
                        break;
                    case "SHIPPED":
                    case "IN_TRANSIT":
                    case "OUT_FOR_DELIVERY":
                        newStatus = OrderStatus.SHIPPED;
                        break;
                    case "DELIVERED":
                        newStatus = OrderStatus.DELIVERED;
                        break;
                }

                if (newStatus != null && order.getStatus() != newStatus) {
                    order.setStatus(newStatus);
                    orderRepository.save(order);
                    System.out.println("Order " + order.getId() + " status updated to " + newStatus + " from Kafka event.");
                }
            }
        } catch (Exception e) {
            System.err.println("Error processing ShipmentStatusUpdatedEvent: " + e.getMessage());
        }
    }
}
