package com.logisphere.shipment_service.client;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class DeliveryClient {

    private final RestClient deliveryRestClient;

    public DeliveryClient(RestClient deliveryRestClient) {
        this.deliveryRestClient = deliveryRestClient;
    }

    public void autoAssignShipment(
            Long shipmentId,
            String trackingNumber) {

        deliveryRestClient
                .post()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/assignments/auto-assign")
                                .queryParam("shipmentId", shipmentId)
                                .queryParam("trackingNumber", trackingNumber)
                                .build()
                )
                .retrieve()
                .toBodilessEntity();
    }
}
