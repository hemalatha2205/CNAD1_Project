import api from "./axiosConfig";

export const getDeliveryPerson = async (id) => {
  const response = await api.get(`/delivery-persons/${id}`);
  return response.data;
};

export const getDeliveryPersonByUserId = async (userId) => {
  const response = await api.get(`/delivery-persons/user/${userId}`);
  return response.data;
};

export const getAssignments = async (id) => {
  const response = await api.get(`/delivery-persons/${id}/assignments`);
  return response.data;
};

export const getAssignmentsByUserId = async (userId) => {
  const response = await api.get(`/delivery-persons/user/${userId}/assignments`);
  return response.data;
};

export const getWorkload = async (id) => {
  const response = await api.get(`/assignments/delivery-person/${id}/workload`);
  return response.data;
};

export const getShipment = async (id) => {
  const response = await api.get(`/shipments/${id}`);
  return response.data;
};

export const updateShipmentStatus = async (id, status) => {
  const response = await api.put(`/shipments/${id}/status?status=${status}`);
  return response.data;
};

export const getShipmentByOrderId = async (orderId) => {
  const response = await api.get(`/shipments/order/${orderId}`);
  return response.data;
};

export const resubmitDeliveryKyc = async (id, data) => {
  const response = await api.put(`/delivery-persons/${id}/resubmit`, data);
  return response.data;
};

export const getDeliveryAuditLogs = async (id) => {
  const response = await api.get(`/delivery-persons/${id}/audit-logs`);
  return response.data;
};

export const reviewDeliveryDecision = async (id, data) => {
  const response = await api.post(`/delivery-persons/${id}/review-decision`, data);
  return response.data;
};
