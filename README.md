# CNAD1_Project

# LogiSphere –  Cloud-Native Logistics Platform

## Overview

**LogiSphere** is a cloud-native logistics and supply chain management platform that manages products, inventory, orders, shipments, and deliveries from registered suppliers and warehouses to customers.

The system uses **microservices and event-driven architecture** to provide scalable, loosely coupled, and independently deployable services.

## Key Features

* Order management
* Inventory and warehouse management
* Shipment tracking
* Delivery assignment
* User authentication and role-based access
* Adaptive warehouse selection for insufficient stock
* Shipment delay and low-stock alerts
* Event-driven communication using Kafka
* Real-time monitoring

## Architecture

```text
React.js
    ↓
API Gateway
    ↓
Eureka
    ↓
Microservices
 ┌──────┬───────────┬──────────┐
Order  Inventory  Shipment  Delivery
 └──────┴───────────┴──────────┘
             ↓
           Kafka
             ↓
       MySQL + Redis
             ↓
     Docker + Kubernetes
             ↓
    Prometheus + Grafana
```

## Technology Stack

* **Backend:** Java, Spring Boot
* **Frontend:** React.js
* **Database:** MySQL
* **Communication:** REST APIs, Apache Kafka
* **Service Discovery:** Eureka
* **API Gateway:** Spring Cloud Gateway
* **Security:** Spring Security, JWT
* **Caching:** Redis
* **Containerization:** Docker
* **Orchestration:** Kubernetes
* **Monitoring:** Prometheus, Grafana
* **Version Control:** Git, GitHub

## Unique Feature

LogiSphere can adapt to logistics conditions. For example, if one warehouse does not have enough stock for an order, the system can identify another registered warehouse with sufficient inventory and use it for fulfillment.

## Project Goal

To demonstrate how **cloud-native microservices, event-driven communication, and adaptive decision-making** can be used to build a scalable and maintainable logistics platform.

## Future Enhancements

* Demand prediction
* Route optimization
* Real-time GPS tracking
* Predictive delivery-delay detection
* Advanced logistics analytics
