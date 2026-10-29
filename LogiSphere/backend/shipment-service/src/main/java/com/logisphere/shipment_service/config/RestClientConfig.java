package com.logisphere.shipment_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${service.delivery.url}")
    private String deliveryUrl;

    @Bean
    public RestClient deliveryRestClient() {
        return RestClient.builder()
                .baseUrl(deliveryUrl)
                .build();
    }
}
