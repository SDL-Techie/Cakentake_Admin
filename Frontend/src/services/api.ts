import axios from "axios";

export const BASE_URL = "http://127.0.0.1:5000";

export const api = axios.create({
  baseURL: BASE_URL,
});

// axios.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const currency = localStorage.getItem("currency") || "KWD";

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["X-Currency"] = currency;

  return config;
});

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};