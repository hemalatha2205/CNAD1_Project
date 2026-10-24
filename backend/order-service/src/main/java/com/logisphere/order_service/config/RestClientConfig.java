package com.logisphere.order_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${service.inventory.url}")
    private String inventoryUrl;

    @Value("${service.shipment.url}")
    private String shipmentUrl;

    @Bean
    public RestClient inventoryRestClient() {
        return RestClient.builder()
                .baseUrl(inventoryUrl)
                .build();
    }

    @Bean
    public RestClient shipmentRestClient() {
        return RestClient.builder()
                .baseUrl(shipmentUrl)
                .build();
    }
}
