package com.logisphere.order_service.client;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class ShipmentClient {

    private final RestClient shipmentRestClient;

    public ShipmentClient(RestClient shipmentRestClient) {
        this.shipmentRestClient = shipmentRestClient;
    }

    public ShipmentResponse createShipment(
            Long orderId,
            Long customerId,
            String customerName,
            String deliveryAddress) {

        return shipmentRestClient
                .post()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/shipments")
                                .queryParam("orderId", orderId)
                                .queryParam("customerId", customerId)
                                .queryParam("customerName", customerName)
                                .queryParam("deliveryAddress", deliveryAddress)
                                .build()
                )
                .retrieve()
                .body(ShipmentResponse.class);
    }
}
