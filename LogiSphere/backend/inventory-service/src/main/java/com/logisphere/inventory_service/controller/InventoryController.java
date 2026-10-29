package com.logisphere.inventory_service.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.logisphere.inventory_service.entity.Inventory;
import com.logisphere.inventory_service.repository.InventoryRepository;
import com.logisphere.inventory_service.security.JwtTokenUtil;
import com.logisphere.inventory_service.service.InventoryService;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    private final InventoryRepository inventoryRepository;
    private final InventoryService inventoryService;
    private final RestTemplate restTemplate = new RestTemplate();

    public InventoryController(
            InventoryRepository inventoryRepository,
            InventoryService inventoryService) {

        this.inventoryRepository = inventoryRepository;
        this.inventoryService = inventoryService;
    }

    @org.springframework.beans.factory.annotation.Value("${service.product.url:http://localhost:8083}")
    private String productUrl;

    private boolean isAuthorizedForProduct(Long productId, String authHeader, boolean allowInternal) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return allowInternal;
        }

        String role = JwtTokenUtil.extractRole(authHeader);
        if ("ADMIN".equals(role)) {
            return true;
        }
        if (!"SUPPLIER".equals(role)) {
            return false;
        }

        Long supplierId = JwtTokenUtil.extractUserId(authHeader);
        if (supplierId == null) {
            return false;
        }

        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(productUrl + "/products/" + productId, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Number prodSupplierId = (Number) response.getBody().get("supplierId");
                return prodSupplierId != null && prodSupplierId.longValue() == supplierId;
            }
        } catch (Exception e) {
            return false;
        }
        return false;
    }

    @PostMapping
    public ResponseEntity<Inventory> createInventory(
            @RequestBody Inventory inventory,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (!isAuthorizedForProduct(inventory.getProductId(), authHeader, false)) { // false = DO NOT allow internal
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Inventory savedInventory = inventoryRepository.save(inventory);
        return ResponseEntity.ok(savedInventory);
    }

    @GetMapping("/{productId}")
    public ResponseEntity<Inventory> getInventory(
            @PathVariable Long productId) {
        // GET inventory is public
        return inventoryRepository
                .findByProductId(productId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<java.util.List<Inventory>> getAllInventory(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String role = JwtTokenUtil.extractRole(authHeader);
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(inventoryRepository.findAll());
    }

    @PostMapping("/{productId}/add")
    public ResponseEntity<Inventory> addStock(
            @PathVariable Long productId,
            @RequestParam int quantity,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (!isAuthorizedForProduct(productId, authHeader, false)) { // false = DO NOT allow internal bypass
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(
                inventoryService.addStock(productId, quantity)
        );
    }

    @PostMapping("/{productId}/remove")
    public ResponseEntity<Inventory> removeStock(
            @PathVariable Long productId,
            @RequestParam int quantity,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (!isAuthorizedForProduct(productId, authHeader, true)) { // true = allow internal bypass from order-service
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(
                inventoryService.removeStock(productId, quantity)
        );
    }
}
