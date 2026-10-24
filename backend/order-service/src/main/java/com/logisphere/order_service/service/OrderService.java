package com.logisphere.order_service.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import com.logisphere.order_service.client.InventoryClient;
import com.logisphere.order_service.client.ShipmentClient;
import com.logisphere.order_service.dto.InventoryResponse;
import com.logisphere.order_service.dto.OrderItemRequest;
import com.logisphere.order_service.dto.OrderRequest;
import com.logisphere.order_service.entity.Order;
import com.logisphere.order_service.entity.OrderItem;
import com.logisphere.order_service.entity.OrderStatus;
import com.logisphere.order_service.repository.OrderRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryClient inventoryClient;
    private final ShipmentClient shipmentClient;
    private final org.springframework.kafka.core.KafkaTemplate<String, String> kafkaTemplate;

    public OrderService(
            OrderRepository orderRepository,
            InventoryClient inventoryClient,
            ShipmentClient shipmentClient,
            org.springframework.kafka.core.KafkaTemplate<String, String> kafkaTemplate) {

        this.orderRepository = orderRepository;
        this.inventoryClient = inventoryClient;
        this.shipmentClient = shipmentClient;
        this.kafkaTemplate = kafkaTemplate;
    }

    public Order createOrder(OrderRequest request) {

        if (request.getItems() == null ||
                request.getItems().isEmpty()) {

            throw new RuntimeException(
                    "Order must contain at least one product"
            );
        }

        for (OrderItemRequest itemRequest : request.getItems()) {

            if (itemRequest.getProductId() == null) {
                throw new RuntimeException("Product ID is required");
            }

            if (itemRequest.getQuantity() == null ||
                    itemRequest.getQuantity() <= 0) {

                throw new RuntimeException(
                        "Product quantity must be greater than 0"
                );
            }

            if (itemRequest.getPrice() == null ||
                    itemRequest.getPrice().compareTo(BigDecimal.ZERO) < 0) {

                throw new RuntimeException(
                        "Product price cannot be negative"
                );
            }
        }

        /*
         * Check ALL inventory before removing anything.
         */
        for (OrderItemRequest itemRequest : request.getItems()) {

            InventoryResponse inventory =
                    inventoryClient.getInventory(
                            itemRequest.getProductId()
                    );

            if (inventory == null) {
                throw new RuntimeException(
                        "Inventory not found for product ID: "
                                + itemRequest.getProductId()
                );
            }

            if (inventory.getQuantity() <
                    itemRequest.getQuantity()) {

                throw new RuntimeException(
                        "Insufficient stock for product ID: "
                                + itemRequest.getProductId()
                                + ". Available: "
                                + inventory.getQuantity()
                                + ", Requested: "
                                + itemRequest.getQuantity()
                );
            }
        }

        /*
         * Deduct inventory.
         */
        for (OrderItemRequest itemRequest : request.getItems()) {

            inventoryClient.removeStock(
                    itemRequest.getProductId(),
                    itemRequest.getQuantity()
            );
        }

        /*
         * Create order.
         */
        Order order = new Order();

        order.setCustomerId(request.getCustomerId());
        order.setCustomerName(request.getCustomerName());
        order.setDeliveryAddress(request.getDeliveryAddress() != null ? request.getDeliveryAddress() : "Default Delivery Address");
        order.setStatus(OrderStatus.PLACED);

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {

            OrderItem item = new OrderItem();

            item.setProductId(itemRequest.getProductId());
            item.setQuantity(itemRequest.getQuantity());
            item.setPrice(itemRequest.getPrice());
            item.setOrder(order);

            order.getItems().add(item);

            BigDecimal itemTotal =
                    itemRequest.getPrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            itemRequest.getQuantity()
                                    )
                            );

            total = total.add(itemTotal);
        }

        order.setTotalAmount(total);

        /*
         * Save order.
         */
        Order savedOrder = orderRepository.save(order);

        /*
         * Automatically create shipment.
         */
        try {
            shipmentClient.createShipment(
                    savedOrder.getId(),
                    savedOrder.getCustomerId(),
                    savedOrder.getCustomerName(),
                    order.getDeliveryAddress()
            );
        } catch (Exception e) {
            // In a real system, you might not want the entire order to fail if shipment fails,
            // but the original logic propagated the error. We will keep it but log.
            throw new RuntimeException("Failed to create shipment synchronously: " + e.getMessage(), e);
        }

        try {
            com.logisphere.order_service.event.OrderCreatedEvent event = new com.logisphere.order_service.event.OrderCreatedEvent(
                java.util.UUID.randomUUID().toString(),
                savedOrder.getId(),
                savedOrder.getCustomerId(),
                java.time.Instant.now().toString()
            );
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            kafkaTemplate.send("order.created", String.valueOf(savedOrder.getId()), mapper.writeValueAsString(event));
        } catch (Exception e) {
            // Fire-and-forget: do not break the transaction if Kafka is down!
            System.err.println("Failed to publish OrderCreated event: " + e.getMessage());
        }

        return savedOrder;
    }

    public Order getOrder(Long id) {

        return orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found with ID: " + id
                        )
                );
    }
}
