// src/lib/api.ts
const BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  // Vendors
  getVendors: () => req<any[]>("/api/vendors"),
  createVendor: (data: any) => req<any>("/api/vendors", { method: "POST", body: JSON.stringify(data) }),

  // Products
  getProducts: () => req<any[]>("/api/products"),
  updateProduct: (id: number, data: any) => req<any>(`/api/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  // Riders
  getRiders: () => req<any[]>("/api/riders"),
  createRider: (data: any) => req<any>("/api/riders", { method: "POST", body: JSON.stringify(data) }),
  updateRider: (id: string, data: any) => req<any>(`/api/riders/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  // Orders
  getOrders: () => req<any[]>("/api/orders"),
  createOrder: (data: any) => req<any>("/api/orders", { method: "POST", body: JSON.stringify(data) }),
  updateOrder: (id: string, data: any) => req<any>(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  // Feedback
  getFeedback: () => req<any[]>("/api/feedback"),
  createFeedback: (data: any) => req<any>("/api/feedback", { method: "POST", body: JSON.stringify(data) }),

  // Health
  health: () => req<any>("/health"),
};
