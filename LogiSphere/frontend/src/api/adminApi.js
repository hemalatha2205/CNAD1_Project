import api from "./axiosConfig";

export const adminApi = {
    // Users
    getUsers: () => api.get("/auth/users"),

    // Suppliers
    getSuppliers: () => api.get("/auth/suppliers"),
    verifySupplier: (id, status) => api.put(`/auth/suppliers/${id}/verify?status=${status}`),

    // Products
    getProducts: () => api.get("/products"),

    // Inventory
    getInventory: () => api.get("/inventory"),

    // Orders
    getOrders: () => api.get("/orders"),

    // Shipments
    getShipments: () => api.get("/shipments"),

    // Deliveries
    getDeliveryPersons: () => api.get("/delivery-persons"),
    verifyDeliveryPerson: (id, status) => api.put(`/delivery-persons/${id}/verify?status=${status}`),
    reviewDeliveryDecision: (id, decisionData) => api.post(`/delivery-persons/${id}/review-decision`, decisionData),
    getDeliveryAuditLogs: (id) => api.get(`/delivery-persons/${id}/audit-logs`),
    assignShipment: (shipmentId, deliveryPersonId, trackingNumber) =>
        api.post(`/assignments?shipmentId=${shipmentId}&deliveryPersonId=${deliveryPersonId}&trackingNumber=${encodeURIComponent(trackingNumber)}`),
    autoAssignShipment: (shipmentId, trackingNumber) =>
        api.post(`/assignments/auto-assign?shipmentId=${shipmentId}&trackingNumber=${encodeURIComponent(trackingNumber)}`),
    getAssignmentByShipment: (shipmentId) =>
        api.get(`/assignments/shipment/${shipmentId}`)
};
