package com.logisphere.order_service.event;

public class OrderCreatedEvent {
    private String eventId;
    private Long orderId;
    private Long customerId;
    private String timestamp;

    public OrderCreatedEvent() {}

    public OrderCreatedEvent(String eventId, Long orderId, Long customerId, String timestamp) {
        this.eventId = eventId;
        this.orderId = orderId;
        this.customerId = customerId;
        this.timestamp = timestamp;
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
