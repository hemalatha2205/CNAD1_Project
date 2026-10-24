import api from "./axiosConfig";

export const getShipment = async (id) => {
  const response = await api.get(`/shipments/${id}`);
  return response.data;
};

export const updateShipmentStatus = async (id, status) => {
  const response = await api.put(`/shipments/${id}/status?status=${status}`);
  return response.data;
};
