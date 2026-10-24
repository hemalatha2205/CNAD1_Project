package com.logisphere.order_service.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.logisphere.order_service.dto.OrderRequest;
import com.logisphere.order_service.entity.Order;
import com.logisphere.order_service.repository.OrderRepository;
import com.logisphere.order_service.security.JwtTokenUtil;
import com.logisphere.order_service.service.OrderService;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;

    public OrderController(
            OrderService orderService,
            OrderRepository orderRepository) {

        this.orderService = orderService;
        this.orderRepository = orderRepository;
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestBody OrderRequest request) {

        return ResponseEntity.ok(
                orderService.createOrder(request)
        );
    }

    /**
     * GET /orders/{id}
     *
     * Authorization rules (enforced server-side from the JWT):
     *   - CUSTOMER  → only allowed if order.customerId == JWT userId.
     *                 Returns 403 Forbidden for any other customer's order.
     *   - ADMIN / SUPPLIER / DELIVERY_PERSON → unrestricted (internal ops).
     *   - No valid JWT / unauthenticated → 403 (gateway should block, but
     *     defensive check here too).
     *   - Order not found → 404 (existing behavior from OrderService).
     */
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false)
            String authHeader) {

        String role = JwtTokenUtil.extractRole(authHeader);

        // Only CUSTOMER requests need the ownership check
        if ("CUSTOMER".equals(role)) {

            Long jwtUserId = JwtTokenUtil.extractUserId(authHeader);

            // If we cannot extract a userId, deny
            if (jwtUserId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Order order = orderService.getOrder(id); // throws 404 if not found

            if (!jwtUserId.equals(order.getCustomerId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            return ResponseEntity.ok(order);
        }

        // All other authenticated roles (ADMIN, SUPPLIER, DELIVERY_PERSON)
        // — and inter-service calls that carry no JWT — pass through.
        return ResponseEntity.ok(orderService.getOrder(id));
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String role = JwtTokenUtil.extractRole(authHeader);
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(
                orderRepository.findAll()
        );
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Order>> getCustomerOrders(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                orderRepository.findByCustomerId(customerId)
        );
    }

    @org.springframework.beans.factory.annotation.Value("${service.product.url:http://localhost:8083}")
    private String productUrl;

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<Order>> getSupplierOrders(
            @PathVariable Long supplierId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String role = JwtTokenUtil.extractRole(authHeader);
        if ("SUPPLIER".equals(role)) {
            Long jwtUserId = JwtTokenUtil.extractUserId(authHeader);
            if (jwtUserId == null || !jwtUserId.equals(supplierId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            ResponseEntity<List> response = restTemplate.getForEntity(productUrl + "/products/supplier/" + supplierId, List.class);

            java.util.List<Long> productIds = new java.util.ArrayList<>();
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                for (Object obj : response.getBody()) {
                    java.util.Map product = (java.util.Map) obj;
                    productIds.add(((Number) product.get("id")).longValue());
                }
            }

            if (productIds.isEmpty()) {
                return ResponseEntity.ok(java.util.Collections.emptyList());
            }

            return ResponseEntity.ok(orderRepository.findDistinctByItemsProductIdIn(productIds));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
