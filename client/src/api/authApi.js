import api from "./axios";

export async function registerUser(payload) {
  const response = await api.post("/auth/register", payload);
  return response.data;
}

export async function loginUser(payload) {
  const response = await api.post("/auth/login", payload);
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/auth/me");
  return response.data;
}

export async function setupMasterPassword(payload) {
  const response = await api.post("/auth/master-password", payload);
  return response.data;
}

export async function verifyMasterPassword(payload) {
  const response = await api.post("/auth/master-password/verify", payload);
  return response.data;
}
