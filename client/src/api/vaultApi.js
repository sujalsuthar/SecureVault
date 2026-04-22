import api from "./axios";

export async function fetchVaultItems() {
  const response = await api.get("/vault");
  return response.data;
}

export async function createVaultItem(payload) {
  const response = await api.post("/vault", payload);
  return response.data;
}

export async function updateVaultItem(id, payload) {
  const response = await api.put(`/vault/${id}`, payload);
  return response.data;
}

export async function deleteVaultItem(id) {
  const response = await api.delete(`/vault/${id}`);
  return response.data;
}
