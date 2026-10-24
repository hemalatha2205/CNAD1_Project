package com.logisphere.order_service.client;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.logisphere.order_service.dto.InventoryResponse;

@Service
public class InventoryClient {

    private final RestClient inventoryRestClient;

    public InventoryClient(RestClient inventoryRestClient) {
        this.inventoryRestClient = inventoryRestClient;
    }

    public InventoryResponse getInventory(Long productId) {

        return inventoryRestClient
                .get()
                .uri("/inventory/{productId}", productId)
                .retrieve()
                .body(InventoryResponse.class);
    }

    public InventoryResponse removeStock(
            Long productId,
            Integer quantity) {

        return inventoryRestClient
                .post()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/inventory/{productId}/remove")
                                .queryParam("quantity", quantity)
                                .build(productId)
                )
                .retrieve()
                .body(InventoryResponse.class);
    }
}
