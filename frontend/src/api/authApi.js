import api from "./axiosConfig";

export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const registerSupplier = async (data) => {
  const response = await api.post("/auth/register/supplier", data);
  return response.data;
};

export const registerDeliveryPerson = async (data) => {
  const response = await api.post("/auth/register/delivery", data);
  return response.data;
};

export const getApprovedSuppliers = async () => {
  const response = await api.get("/auth/suppliers/approved");
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get("/auth/profile");
  return response.data;
};

export const updateUserProfile = async (data) => {
  const response = await api.put("/auth/profile", data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.put("/auth/change-password", data);
  return response.data;
};

export const deactivateAccount = async (data) => {
  const response = await api.post("/auth/account/deactivate", data);
  return response.data;
};

export const getPublicStore = async (id) => {
  const response = await api.get(`/auth/suppliers/public/${id}`);
  return response.data;
};
