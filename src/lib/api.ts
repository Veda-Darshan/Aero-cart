// src/lib/api.ts
// Uses relative URLs → Next.js proxy forwards to Express backend on port 8080
const BASE = typeof window !== "undefined"
  ? ""           // browser: relative URL → Next.js proxy → backend
  : "http://localhost:8080"; // server-side: direct

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status} on ${path}`);
  return res.json();
}

export const api = {
  getVendors:    ()             => req<any[]>("/api/vendors"),
  createVendor:  (data: any)   => req<any>("/api/vendors",          { method: "POST",  body: JSON.stringify(data) }),

  getProducts:   ()             => req<any[]>("/api/products"),
  updateProduct: (id: number, data: any) => req<any>(`/api/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  getRiders:     ()             => req<any[]>("/api/riders"),
  createRider:   (data: any)   => req<any>("/api/riders",           { method: "POST",  body: JSON.stringify(data) }),
  updateRider:   (id: string, data: any) => req<any>(`/api/riders/${id}`,   { method: "PATCH", body: JSON.stringify(data) }),

  getOrders:     ()             => req<any[]>("/api/orders"),
  createOrder:   (data: any)   => req<any>("/api/orders",           { method: "POST",  body: JSON.stringify(data) }),
  updateOrder:   (id: string, data: any) => req<any>(`/api/orders/${id}`,   { method: "PATCH", body: JSON.stringify(data) }),

  getFeedback:   ()             => req<any[]>("/api/feedback"),
  createFeedback:(data: any)   => req<any>("/api/feedback",         { method: "POST",  body: JSON.stringify(data) }),

  health:        ()             => req<any>("/health"),
};
