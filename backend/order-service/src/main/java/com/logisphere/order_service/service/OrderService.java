package com.logisphere.order_service.service;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.logisphere.order_service.client.InventoryClient;
import com.logisphere.order_service.client.ProductClient;
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
    private final ProductClient productClient;
    private final org.springframework.kafka.core.KafkaTemplate<String, String> kafkaTemplate;

    public OrderService(
            OrderRepository orderRepository,
            InventoryClient inventoryClient,
            ShipmentClient shipmentClient,
            ProductClient productClient,
            org.springframework.kafka.core.KafkaTemplate<String, String> kafkaTemplate) {

        this.orderRepository = orderRepository;
        this.inventoryClient = inventoryClient;
        this.shipmentClient = shipmentClient;
        this.productClient = productClient;
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

            String prodName = itemRequest.getProductName();
            String imgUrl = itemRequest.getImageUrl();

            if (prodName == null || prodName.isBlank()) {
                try {
                    Map<String, Object> prod = productClient.getProduct(itemRequest.getProductId());
                    if (prod != null) {
                        if (prod.get("name") != null) {
                            prodName = prod.get("name").toString();
                        }
                        if (prod.get("imageUrl") != null) {
                            imgUrl = prod.get("imageUrl").toString();
                        }
                    }
                } catch (Exception ignored) {
                }
            }

            item.setProductName(prodName != null && !prodName.isBlank() ? prodName : ("Product #" + itemRequest.getProductId()));
            item.setImageUrl(imgUrl);
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
                    savedOrder.getDeliveryAddress()
            );
        } catch (Exception e) {
            System.err.println("Could not synchronously create shipment: " + e.getMessage());
        }

        /*
         * Publish OrderCreatedEvent to Kafka.
         */
        try {
            String eventJson = String.format(
                    "{\"orderId\":%d,\"customerId\":%d,\"customerName\":\"%s\",\"deliveryAddress\":\"%s\",\"status\":\"%s\"}",
                    savedOrder.getId(),
                    savedOrder.getCustomerId(),
                    savedOrder.getCustomerName(),
                    savedOrder.getDeliveryAddress(),
                    savedOrder.getStatus().name()
            );
            kafkaTemplate.send("order.created", String.valueOf(savedOrder.getId()), eventJson);
        } catch (Exception e) {
            System.err.println("Failed to publish OrderCreatedEvent to Kafka: " + e.getMessage());
        }

        return savedOrder;
    }

    public Order getOrder(Long id) {

        return orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found with id: " + id));
    }

    public java.util.List<Order> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    public java.util.List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
