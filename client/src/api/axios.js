import axios from "axios";
import { clearVaultSession, getVaultSession } from "../constants/vaultSession";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const vaultToken = getVaultSession();
  if (vaultToken) {
    config.headers["X-Vault-Token"] = vaultToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message;
    if (
      error.response?.status === 403 &&
      typeof message === "string" &&
      message.toLowerCase().includes("vault locked")
    ) {
      clearVaultSession();
      window.dispatchEvent(new Event("vault-session-expired"));
    }
    return Promise.reject(error);
  }
);

export default api;
