import api from "./axiosConfig";

export const getInventory = async (productId) => {
  const response = await api.get(`/inventory/${productId}`);
  return response.data;
};

export const createInventory = async (data) => {
  const response = await api.post("/inventory", data);
  return response.data;
};

export const addStock = async (productId, quantity) => {
  const response = await api.post(`/inventory/${productId}/add?quantity=${quantity}`);
  return response.data;
};

export const removeStock = async (productId, quantity) => {
  const response = await api.post(`/inventory/${productId}/remove?quantity=${quantity}`);
  return response.data;
};
