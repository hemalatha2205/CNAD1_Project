# LogiSphere
### Cloud-Native Logistics & Supply Chain Management Platform

**Transforming logistics operations through intelligent architecture, seamless integration, and scalable microservices.**


## About LogiSphere

**LogiSphere** is a cloud-native logistics and supply chain management platform designed to streamline logistics operations through a modular, microservices-based Service-Oriented Architecture (SOA).

Traditional logistics systems often struggle with disconnected operations, inefficient inventory management, delayed order processing, and limited coordination between suppliers, customers, and delivery personnel.

LogiSphere addresses these challenges by bringing essential logistics operations together in one platform, supported by independent backend services and a centralized frontend experience.

The platform separates business functionalities into dedicated microservices, enabling modular development, independent service management, and easier scalability.

## The Vision

To create a unified digital logistics ecosystem where different stakeholders and business operations work together seamlessly.

**One platform. Multiple services. Connected logistics.**

## Core Features

| Feature | Description |
|---|---|
| Authentication & Security | User registration, login, JWT-based authentication |
| Product Management | Dedicated product management services |
| Inventory Management | Stock information and inventory operations |
| Order Management | Order creation and processing |
| Shipment Management | Shipment information and operations |
| Delivery Management | Delivery assignments and delivery-person operations |
| Service Discovery | Dynamic service registration using Netflix Eureka |
| API Gateway | Centralized request routing using Spring Cloud Gateway |
| Event-Driven Communication | Asynchronous communication using Apache Kafka |

## System Architecture

LogiSphere follows a **Microservices-based Service-Oriented Architecture**, separating business capabilities into independent services.

### Architectural Components

- **Frontend Layer:** React.js provides the interactive user interface.
- **API Gateway Layer:** Spring Cloud Gateway serves as the centralized entry point for API requests.
- **Service Discovery Layer:** Netflix Eureka maintains the service registry.
- **Business Layer:** Independent Spring Boot microservices handle logistics operations.
- **Database Layer:** MySQL provides relational data storage with separate logical databases.
- **Messaging Layer:** Apache Kafka supports asynchronous communication between selected services.

## Microservices Architecture

LogiSphere consists of eight backend services, each responsible for a specific function.

| Microservice | Port | Responsibility |
|---|---:|---|
| Eureka Server | 8761 | Service registration and discovery |
| API Gateway | 8080 | Centralized API routing |
| Authentication Service | 8082 | Registration, login and JWT |
| Product Service | 8083 | Product management |
| Inventory Service | 8084 | Inventory operations |
| Order Service | 8085 | Order processing |
| Shipment Service | 8086 | Shipment management |
| Delivery Service | 8087 | Delivery assignments |

### Why Microservices?

- Independent development and maintenance.
- Separation of business responsibilities.
- Better modularity and extensibility.
- Service discovery and centralized routing.
- Support for independent service scaling.
- Asynchronous communication between selected services.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, Axios |
| Programming Language | Java |
| Backend Framework | Spring Boot |
| Cloud Framework | Spring Cloud |
| API Gateway | Spring Cloud Gateway |
| Service Discovery | Netflix Eureka |
| Security | Spring Security, JWT |
| Database | MySQL 8 |
| ORM | Spring Data JPA, Hibernate |
| Messaging | Apache Kafka |
| Coordination | Apache ZooKeeper |
| Build Tool | Maven |
| Containerization | Docker |
| Frontend Deployment | Vercel |
| Backend Deployment Target | Render |
| Version Control | Git, GitHub |
| API Testing | Postman |

## How LogiSphere Works

### 1. Authentication Workflow
- Users register through the React frontend.
- Authentication requests are routed to the Authentication Service.
- User credentials are validated.
- JWT tokens are generated after successful authentication.
- Tokens support authenticated access to protected operations.

### 2. Product & Inventory Workflow
- Frontend requests are sent through the API Gateway.
- The Product and Inventory Services process their respective requests.
- Relevant information is retrieved or updated in MySQL.
- Responses are returned to the frontend.

### 3. Order Processing Workflow
- Users submit order-related requests.
- The Order Service processes the requests.
- Product and inventory services support the required operations.
- Relevant events can be communicated through Apache Kafka.

### 4. Shipment & Delivery Workflow
- The Shipment Service manages shipment-related operations.
- Shipment events can be communicated through Kafka.
- The Delivery Service manages delivery assignments and delivery-related information.

## Database Architecture

LogiSphere uses MySQL with separate logical databases for individual business services.

| Database | Purpose |
|---|---|
| `logisphere_auth_db` | Authentication and user information |
| `logisphere_product_db` | Product information |
| `logisphere_inventory_db` | Inventory information |
| `logisphere_order_db` | Order information |
| `logisphere_shipment_db` | Shipment information |
| `logisphere_delivery_db` | Delivery information |

This separation supports modular data management across the different business services.

## Security

Security is an important component of LogiSphere.

- JWT-based authentication.
- User registration and login.
- Spring Security integration.
- Token-based access to protected functionality.
- CORS configuration for frontend-backend communication.

## Deployment & Cloud Infrastructure

LogiSphere uses cloud hosting and containerization technologies as part of its deployment architecture.

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend Deployment Target | Render |
| Containerization | Docker |
| Source Code | GitHub |

**Live Frontend:** [Open LogiSphere](https://logisphere-green.vercel.app)

**GitHub Repository:** [View Source Code](https://github.com/hemalatha2205/CNAD1_Project)

*Note: The frontend is hosted on Vercel. Render is the backend deployment target; availability of all backend services depends on the current deployment configuration.*

## Getting Started

### Prerequisites

Ensure that the following tools are installed:

- Java JDK
- Node.js and npm
- Maven
- MySQL
- Apache Kafka and ZooKeeper
- Git
- Docker (for containerized execution)

### Clone the Repository

```bash
git clone https://github.com/hemalatha2205/CNAD1_Project.git
```

### Navigate to the Project

```bash
cd CNAD1_Project/LogiSphere
```

### Run the Application

1. Configure the MySQL databases and application properties.
2. Start ZooKeeper and Kafka.
3. Start the Eureka Server.
4. Start the backend microservices.
5. Start the API Gateway.
6. Install frontend dependencies and launch the React application.

Frontend commands:

```bash
npm install
npm run dev
```

Run backend services using their respective Maven configurations.

*Refer to the individual service configuration files for database credentials, ports, and environment variables.*

## Future Enhancements

LogiSphere provides a foundation for further improvements:

- Real-time shipment tracking.
- GPS-based delivery monitoring.
- Intelligent delivery route optimization.
- Predictive inventory management.
- Machine learning-based demand forecasting.
- Automated supplier and delivery notifications.
- Advanced logistics analytics.
- Enhanced monitoring and fault tolerance.
- Automated CI/CD pipelines.

## What This Project Demonstrates

Through LogiSphere, the project explores practical implementation of:

- Service-Oriented Architecture (SOA).
- Microservices-based application development.
- REST API development and integration.
- Dynamic service discovery.
- Centralized API routing.
- JWT-based authentication.
- Event-driven communication.
- Relational database management.
- Docker-based containerization.
- Cloud application deployment.

## Project Information

| Attribute | Details |
|---|---|
| Project Name | LogiSphere |
| Domain | Logistics & Supply Chain Management |
| Architecture | Microservices-based SOA |
| Frontend | React.js |
| Backend | Java, Spring Boot, Spring Cloud |
| Database | MySQL |
| Project Type | Academic Software Development Project |

---

<p align="center">

### LOGISPHERE

**Connecting Every Step of the Supply Chain.**

*Designed to organize. Engineered to scale. Built to connect.*

</p>
