import api from "./axiosConfig";

export const getProducts = async () => {
  const response = await api.get("/products");
  return response.data;
};

export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const searchProducts = async (name) => {
  const response = await api.get(`/products/search?name=${encodeURIComponent(name)}`);
  return response.data;
};

export const getProductsByCategory = async (category) => {
  const response = await api.get(`/products/category/${encodeURIComponent(category)}`);
  return response.data;
};

export const getProductsBySupplier = async (supplierId) => {
  const response = await api.get(`/products/supplier/${supplierId}`);
  return response.data;
};

export const addProduct = async (product) => {
  const response = await api.post("/products", product);
  return response.data;
};
