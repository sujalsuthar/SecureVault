import api from "./axios";

export async function fetchDashboardStats() {
  const response = await api.get("/dashboard/stats");
  return response.data;
}
