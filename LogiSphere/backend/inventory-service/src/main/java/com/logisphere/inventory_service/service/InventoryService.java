package com.logisphere.inventory_service.service;

import org.springframework.stereotype.Service;

import com.logisphere.inventory_service.entity.Inventory;
import com.logisphere.inventory_service.repository.InventoryRepository;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public Inventory addStock(Long productId, int quantity) {

        if (quantity <= 0) {
            throw new RuntimeException(
                    "Quantity must be greater than 0"
            );
        }

        Inventory inventory = inventoryRepository
                .findByProductId(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Inventory not found for product ID: "
                                        + productId
                        )
                );

        inventory.setQuantity(
                inventory.getQuantity() + quantity
        );

        return inventoryRepository.save(inventory);
    }

    public Inventory removeStock(Long productId, int quantity) {

        if (quantity <= 0) {
            throw new RuntimeException(
                    "Quantity must be greater than 0"
            );
        }

        Inventory inventory = inventoryRepository
                .findByProductId(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Inventory not found for product ID: "
                                        + productId
                        )
                );

        if (inventory.getQuantity() < quantity) {
            throw new RuntimeException(
                    "Insufficient stock. Available: "
                            + inventory.getQuantity()
                            + ", Requested: "
                            + quantity
            );
        }

        inventory.setQuantity(
                inventory.getQuantity() - quantity
        );

        return inventoryRepository.save(inventory);
    }
}
