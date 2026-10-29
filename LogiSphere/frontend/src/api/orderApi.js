import api from "./axiosConfig";

export const createOrder = async (orderData) => {
  const response = await api.post("/orders", orderData);
  return response.data;
};

export const getOrder = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const getAllOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

export const getCustomerOrders = async (customerId) => {
  const response = await api.get(`/orders/customer/${customerId}`);
  return response.data;
};
