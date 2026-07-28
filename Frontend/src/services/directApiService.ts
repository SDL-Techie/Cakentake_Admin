import axios from "axios";
import { api } from "./api";

export const pincodeApi = {
  list: () => axios.get("/api/pincode"),
  create: (payload: unknown) => axios.post("/api/pincode", payload),
  remove: (id: string | number) => axios.delete(`/api/pincode/${id}`),
  charge: (zip: string) => axios.get(`/api/v1/pincode/${zip}`),
};

export const supplierApi = {
  list: () => axios.get("/suppliers"),
  create: (payload: unknown) => axios.post("/suppliers", payload),
  update: (id: string | number, payload: unknown) => axios.put(`/suppliers/${id}`, payload),
  remove: (id: string | number) => axios.delete(`/suppliers/${id}`),
};

export const maintenanceApi = {
  backup: (payload: unknown, config?: unknown) => axios.post("/api/v1/admin/backup", payload, config as never),
  restore: (payload: unknown, config?: unknown) => axios.post("/api/v1/admin/restore", payload, config as never),
};

export const legacyPointApi = {
  getSettings: (config?: unknown) => axios.get("/api/v1/getpointsettings", config as never),
  saveSettings: (payload: unknown, config?: unknown) => axios.post("/api/v1/createpointsettings", payload, config as never),
  getUserPoints: (phone: string, config?: unknown) => axios.get(`/api/v1/user-points/${phone}`, config as never),
  redeem: (payload: unknown, config?: unknown) => axios.post("/api/v1/redeem-points", payload, config as never),
};

export const storefrontApi = {
  products: (config?: unknown) => axios.get("/products", config as never),
  categories: () => axios.get("/category"),
  subcategories: (categoryId: string | number) => axios.get(`/categories/${categoryId}/subcategories`),
  login: <T>(payload: unknown) => axios.post<T>("/login", payload),
  register: (payload: unknown) => axios.post("/register", payload),
  logout: () => axios.post("/logout"),
  profile: (userId: string | number, config?: unknown) => axios.get(`/user/${userId}`, config as never),
  updateProfile: (payload: unknown, config?: unknown) => axios.put("/profile", payload, config as never),
  order: <T>(id: string | number, config?: unknown) => axios.get<T>(`/orders/${id}`, config as never),
};

export const wishlistApi = {
  list: (userId: string | number) => axios.get(`/api/wishlist/${userId}`),
  create: (payload: unknown) => axios.post("/api/wishlist", payload),
  remove: (id: string | number) => axios.delete(`/api/wishlist/${id}`),
};

export const retailerApi = {
  profile: (id: string | number, config?: unknown) => axios.get(`/api/v1/profile/${id}`, config as never),
  categories: () => axios.get("/api/v1/category"),
  productsByCategory: (id: string | number) => axios.get(`/api/v1/category/${id}`),
  updateProfile: (id: string | number, payload: unknown, config?: unknown) => axios.put(`/api/v1/profile/${id}`, payload, config as never),
  initiatePayment: (payload: unknown, config?: unknown) => axios.post("/api/v1/initiate-retailer-payment", payload, config as never),
  verifyPayment: (payload: unknown, config?: unknown) => axios.post("/api/v1/verify-retailer-payment", payload, config as never),
  createOrder: (payload: unknown, config?: unknown) => axios.post("/api/v1/createretailerorder", payload, config as never),
};

export const uploadCloudinaryImage = async (cloudName: string, data: FormData) => {
  const response = await axios.post(`https://axios.cloudinary.com/v1_1/${cloudName}/image/upload`, data);
  return response;
};

export const fetchGeoLocation = async () => {
  const response = await fetch("https://ipinfo.io/json");
  if (!response.ok) throw new Error("Unable to detect location");
  return response.json();
};

export const fetchGeoLocationFromIpApi = async () => {
  const response = await fetch("https://ipaxios.co/json/");
  if (!response.ok) throw new Error("Unable to detect location");
  return response.json();
};

export const menuApi = {
  get: <T = unknown>(path: string) => axios.get<T>(path),
  post: <T = unknown>(path: string, payload?: unknown) => axios.post<T>(path, payload),
  put: <T = unknown>(path: string, payload?: unknown) => axios.put<T>(path, payload),
  delete: <T = unknown>(path: string) => axios.delete<T>(path),
};

export const supplierApiDetails = {
  get: (id: string | number) => axios.get(`/suppliers/${id}`),
};
