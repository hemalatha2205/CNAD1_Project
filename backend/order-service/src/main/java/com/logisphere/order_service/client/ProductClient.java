package com.logisphere.order_service.client;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class ProductClient {

    private final RestClient productRestClient;

    public ProductClient(RestClient productRestClient) {
        this.productRestClient = productRestClient;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getProduct(Long productId) {
        try {
            return productRestClient
                    .get()
                    .uri("/products/{productId}", productId)
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            return null;
        }
    }
}
