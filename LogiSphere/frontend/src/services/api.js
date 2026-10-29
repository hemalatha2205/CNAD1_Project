import api from "../api/axiosConfig";

export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);

  return response.data;
};

export const getProducts = async () => {
  const response = await api.get("/products");

  return response.data;
};

export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`);

  return response.data;
};

export default api;
