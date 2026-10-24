package com.logisphere.delivery_service.listener;

import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.logisphere.delivery_service.service.DeliveryAssignmentService;

@ExtendWith(MockitoExtension.class)
class ShipmentStatusListenerTest {

    @Mock
    private DeliveryAssignmentService assignmentService;

    private ShipmentStatusListener listener;

    @BeforeEach
    void setUp() {
        listener = new ShipmentStatusListener(assignmentService);
    }

    @Test
    void testHandleShipmentStatusUpdated_Delivered_Success() {
        String eventJson = """
            {
                "eventId": "evt-123",
                "shipmentId": 3,
                "orderId": 3,
                "status": "DELIVERED",
                "timestamp": "2026-10-11T12:00:00Z"
            }
            """;

        listener.handleShipmentStatusUpdated(eventJson);

        verify(assignmentService, times(1)).completeAssignmentForShipment(3L);
    }

    @Test
    void testHandleShipmentStatusUpdated_DuplicateDeliveryEvents() {
        String eventJson = """
            {
                "eventId": "evt-123",
                "shipmentId": 3,
                "orderId": 3,
                "status": "DELIVERED",
                "timestamp": "2026-10-11T12:00:00Z"
            }
            """;

        listener.handleShipmentStatusUpdated(eventJson);
        listener.handleShipmentStatusUpdated(eventJson);

        verify(assignmentService, times(2)).completeAssignmentForShipment(3L);
    }

    @Test
    void testHandleShipmentStatusUpdated_OtherStatus_DoesNotComplete() {
        String eventJson = """
            {
                "eventId": "evt-123",
                "shipmentId": 3,
                "orderId": 3,
                "status": "SHIPPED",
                "timestamp": "2026-10-11T12:00:00Z"
            }
            """;

        listener.handleShipmentStatusUpdated(eventJson);

        verify(assignmentService, never()).completeAssignmentForShipment(any());
    }

    @Test
    void testHandleShipmentStatusUpdated_NoMatchingAssignment_HandlesGracefully() {
        String eventJson = """
            {
                "eventId": "evt-999",
                "shipmentId": 999,
                "orderId": 999,
                "status": "DELIVERED",
                "timestamp": "2026-10-11T12:00:00Z"
            }
            """;

        when(assignmentService.completeAssignmentForShipment(999L)).thenReturn(null);

        // Should not throw or crash
        listener.handleShipmentStatusUpdated(eventJson);

        verify(assignmentService, times(1)).completeAssignmentForShipment(999L);
    }

    @Test
    void testHandleShipmentStatusUpdated_MalformedPayload_NoCrash() {
        listener.handleShipmentStatusUpdated("invalid json {{{");
        listener.handleShipmentStatusUpdated(null);
        listener.handleShipmentStatusUpdated("");

        verify(assignmentService, never()).completeAssignmentForShipment(any());
    }

    @Test
    void testHandleShipmentStatusUpdated_WithBOM() {
        String eventJsonWithBOM = "\uFEFF" + """
            {
                "eventId": "evt-bom",
                "shipmentId": 3,
                "orderId": 3,
                "status": "DELIVERED",
                "timestamp": "2026-10-11T12:00:00Z"
            }
            """;

        listener.handleShipmentStatusUpdated(eventJsonWithBOM);

        verify(assignmentService, times(1)).completeAssignmentForShipment(3L);
    }
}
