"use client";

import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Edit2, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  LayoutDashboard, 
  Inbox, 
  Package, 
  Compass, 
  UserCheck, 
  Sparkles, 
  Clock 
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Product, Order, Rider, Vendor } from "@/app/page";

interface VendorHubViewProps {
  inventory: Product[];
  selectedVendorId: number;
  vendors: Vendor[];
  orders: Order[];
  riders: Rider[];
  onAcceptOrder: (orderId: string) => void;
  onAssignRider: (orderId: string, riderId: string) => void;
  onRestock: (productId: number, amount: number) => void;
  onDelete: (productId: number) => void;
  onEdit: (productId: number, newPrice: number) => void;
}

export default function VendorHubView({
  inventory,
  selectedVendorId,
  vendors,
  orders,
  riders,
  onAcceptOrder,
  onAssignRider,
  onRestock,
  onDelete,
  onEdit
}: VendorHubViewProps) {
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "requests" | "catalog"
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editPriceVal, setEditPriceVal] = useState(0);

  // Active vendor details
  const activeVendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];

  // Filter products belonging to active vendor
  const vendorCatalog = inventory.filter((p) => p.stock[selectedVendorId] !== undefined);

  // Search filter
  const filteredCatalog = vendorCatalog.filter((p) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter orders for active vendor
  const vendorOrders = orders.filter((o) => o.vendorId === selectedVendorId);

  // Get items with low stock (< 3 units) or out of stock (0 units)
  const lowStockItems = vendorCatalog.filter(
    (item) => (item.stock[selectedVendorId] ?? 0) > 0 && (item.stock[selectedVendorId] ?? 0) <= 3
  );

  const outOfStockItems = vendorCatalog.filter(
    (item) => (item.stock[selectedVendorId] ?? 0) === 0
  );

  // Simulated operational sales data logs
  const salesHistory = [
    { hour: "08:00", orders: 1200 },
    { hour: "10:00", orders: 2400 },
    { hour: "12:00", orders: 4800 },
    { hour: "14:00", orders: 3200 },
    { hour: "16:00", orders: 4500 },
    { hour: "18:00", orders: 6100 },
    { hour: "20:00", orders: 5800 }
  ];

  // Helper status tags for stock level
  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { label: "Depleted", class: "border-red-400 text-red-600 bg-red-50" };
    }
    if (stock <= 3) {
      return { label: "Critical", class: "border-amber-400 text-amber-600 bg-amber-50" };
    }
    return { label: "Good Stock", class: "border-green-400 text-green-700 bg-green-50" };
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-canvas-primary">
      
      {/* 1. Deep Midnight Navy Sidebar Menu */}
      <aside className="w-64 bg-sidebar-bg shrink-0 hidden md:flex flex-col text-white justify-between border-r border-border-subtle/10 z-20">
        <div className="p-6 space-y-6">
          {/* Active Vendor Profile Info */}
          <div>
            <div className="text-[10px] font-bold text-accent-primary uppercase tracking-widest">Logged Merchant</div>
            <h2 className="text-sm font-black uppercase tracking-tight mt-1 truncate">{activeVendor.name}</h2>
            <p className="text-[9px] text-text-secondary/80 leading-normal mt-0.5">{activeVendor.address}</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors rounded-xl cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-accent-primary text-white"
                  : "text-text-secondary hover:text-white hover:bg-canvas-secondary/5"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("requests")}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors rounded-xl cursor-pointer ${
                activeTab === "requests"
                  ? "bg-accent-primary text-white"
                  : "text-text-secondary hover:text-white hover:bg-canvas-secondary/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Inbox className="h-4 w-4" />
                <span>Orders Queue</span>
              </div>
              {vendorOrders.filter(o => o.status === "Pending").length > 0 && (
                <span className="h-4 w-4 bg-alert-critical text-[8px] font-black flex items-center justify-center rounded-full text-white">
                  {vendorOrders.filter(o => o.status === "Pending").length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("catalog")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors rounded-xl cursor-pointer ${
                activeTab === "catalog"
                  ? "bg-accent-primary text-white"
                  : "text-text-secondary hover:text-white hover:bg-canvas-secondary/5"
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Stock Catalog</span>
            </button>
          </nav>
        </div>

        {/* Corridor bounds */}
        <div className="p-6 border-t border-border-subtle/5 bg-slate-950/40 text-[9px] font-mono text-text-secondary/50">
          <div className="flex items-center gap-1.5 uppercase font-bold text-accent-primary mb-1">
            <Compass className="h-3 w-3" /> GPS BOUNDS ACTIVE
          </div>
          ACTIVE: Tambaram Corridor
        </div>
      </aside>

      {/* 2. Main content area (Warm Ivory Canvas) */}
      <main className="flex-1 p-6 md:p-8 min-w-0 overflow-y-auto">
        
        {/* Active tab header */}
        <div className="border-b border-border-subtle pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[9px] font-mono text-accent-primary uppercase tracking-widest font-black">
              Vendor Suite • {activeVendor.name}
            </span>
            <h1 className="text-xl font-black uppercase text-text-primary mt-0.5 tracking-tight">
              {activeTab === "dashboard" ? "Dashboard Analytics" : activeTab === "requests" ? "Order Requests Queue" : "Inventory Stock Control"}
            </h1>
          </div>
          
          {/* Mobile view tabs fallback */}
          <div className="flex md:hidden gap-1.5 border border-border-subtle p-1 rounded-xl bg-canvas-secondary">
            <button 
              onClick={() => setActiveTab("dashboard")} 
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg ${activeTab === "dashboard" ? "bg-accent-primary text-white" : "text-text-secondary"}`}
            >
              Dash
            </button>
            <button 
              onClick={() => setActiveTab("requests")} 
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg ${activeTab === "requests" ? "bg-accent-primary text-white" : "text-text-secondary"}`}
            >
              Orders
            </button>
            <button 
              onClick={() => setActiveTab("catalog")} 
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg ${activeTab === "catalog" ? "bg-accent-primary text-white" : "text-text-secondary"}`}
            >
              Stock
            </button>
          </div>
        </div>

        {/* Tab 1: Dashboard Analytics */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            
            {/* Predictive Depletion Alert Banner */}
            <div className="border border-alert-critical/20 bg-alert-critical/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl">
              <div className="flex items-start gap-3">
                <div className="p-2 border border-alert-critical/20 bg-canvas-secondary text-alert-critical rounded-xl shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-alert-critical flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> Statistical Depletion Forecasting
                  </h3>
                  <p className="text-xs font-semibold text-text-primary leading-relaxed mt-1">
                    High probability (94%) of Milk & Dairy depletion by 17:00. Restock suggested.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab("catalog")}
                className="shrink-0 border border-accent-primary bg-accent-primary hover:bg-accent-hover hover:shadow-[0_0_12px_rgba(249,115,22,0.45)] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 transition-colors cursor-pointer rounded-xl shadow-sm"
              >
                Restock Now
              </button>
            </div>

            {/* Redesigned Suggesion & Alerts section for stock depletion */}
            {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
              <div className="border-4 border-alert-critical bg-red-50/20 p-6 rounded-2xl shadow-sm">
                
                <h3 className="text-xs font-black text-alert-critical uppercase tracking-widest flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-alert-critical animate-pulse" /> Critical Inventory Stock Warnings
                </h3>

                <style>{`
                  @keyframes alertJiggle {
                    0%, 100% { transform: scale(1) rotate(0deg); }
                    15% { transform: scale(1.05) rotate(-3deg); }
                    30% { transform: scale(1.05) rotate(3deg); }
                  }
                  .jiggle-alert {
                    animation: alertJiggle 1.5s ease-in-out infinite;
                  }
                `}</style>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lowStockItems.map(item => (
                    <div key={`alert-${item.id}`} className="bg-canvas-secondary border-2 border-amber-500 p-4 rounded-xl flex items-center justify-between gap-3 shadow">
                      <div>
                        <div className="text-xs font-black text-text-primary uppercase tracking-tight">{item.name}</div>
                        <div className="text-[10px] text-text-secondary mt-1 font-semibold">
                          Stock is critical: Only <strong className="text-alert-critical font-black">{item.stock[selectedVendorId]}</strong> units left.
                        </div>
                      </div>
                      <button
                        onClick={() => onRestock(item.id, 10)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-colors cursor-pointer shadow-sm shrink-0"
                      >
                        +10 Restock
                      </button>
                    </div>
                  ))}
                  {outOfStockItems.map(item => (
                    <div key={`alert-out-${item.id}`} className="bg-canvas-secondary border-2 border-red-500 p-4 rounded-xl flex items-center justify-between gap-3 shadow">
                      <div>
                        <div className="text-xs font-black text-text-primary uppercase tracking-tight">{item.name}</div>
                        <div className="text-[10px] text-text-secondary mt-1 font-semibold">
                          Depleted completely: <strong className="text-alert-critical font-black">Sold Out</strong>.
                        </div>
                      </div>
                      <button
                        onClick={() => onRestock(item.id, 20)}
                        className="bg-alert-critical hover:bg-alert-critical/90 text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-colors cursor-pointer shadow-sm shrink-0"
                      >
                        +20 Restock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="border border-border-subtle bg-canvas-secondary p-5 rounded-2xl shadow-sm">
                <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Gross Revenue (12h)</div>
                <div className="text-xl font-black text-text-primary tracking-tight">₹25,870</div>
                <div className="text-[10px] text-accent-primary font-bold mt-1.5">▲ +12% from morning</div>
              </div>
              <div className="border border-border-subtle bg-canvas-secondary p-5 rounded-2xl shadow-sm">
                <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Pending Requests</div>
                <div className="text-xl font-black text-text-primary tracking-tight">
                  {vendorOrders.filter(o => o.status === "Pending").length} Orders
                </div>
                <div className="text-[10px] text-text-secondary font-semibold mt-1.5">Awaiting accept confirmation</div>
              </div>
              <div className="border border-border-subtle bg-canvas-secondary p-5 rounded-2xl shadow-sm">
                <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Stock Depletion Rate</div>
                <div className="text-xl font-black text-text-primary tracking-tight">3.4 items/hr</div>
                <div className="text-[10px] text-alert-critical font-bold mt-1.5">Currently critical depletion</div>
              </div>
            </div>

            {/* Recharts Analytics chart */}
            <div className="border border-border-subtle bg-canvas-secondary p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">Operational Insights</h2>
                  <p className="text-[10px] text-text-secondary font-medium mt-0.5">Gross sales totals (in INR) hourly logs</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 bg-accent-primary rounded-full" />
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Order Sales</span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesHistory} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fill: "var(--text-secondary)", fontSize: 10, fontWeight: 600 }} 
                      axisLine={{ stroke: "var(--border-subtle)" }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: "var(--text-secondary)", fontSize: 10, fontWeight: 600 }} 
                      axisLine={false} 
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "var(--sidebar-bg)", border: "1px solid var(--border-subtle)", borderRadius: 12 }}
                      labelStyle={{ fontSize: "11px", fontWeight: "bold", color: "#FFFFFF", textTransform: "uppercase" }}
                      itemStyle={{ fontSize: "11px", color: "var(--accent-primary)" }}
                      formatter={(value) => [`₹${value}`, "Gross Sales"]}
                    />
                    <Bar dataKey="orders" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Nearby Delivery Riders Directory list */}
            <div className="border border-border-subtle bg-canvas-secondary p-6 rounded-2xl shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-border-subtle pb-3 mb-4">
                Nearby Delivery Partners Map Coordinates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {riders.map((rider) => (
                  <div key={rider.id} className="p-4 bg-canvas-primary border border-border-subtle rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-text-primary uppercase tracking-tight">{rider.name}</div>
                      <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded ${
                        rider.status === "Idle" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {rider.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-text-secondary leading-normal">
                      <div>Vehicle: <strong>{rider.vehicle}</strong></div>
                      <div>GPS: <strong>[{rider.coords[0].toFixed(4)}, {rider.coords[1].toFixed(4)}]</strong></div>
                      <div>Delivered: <strong>{rider.deliveriesCount} orders</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Order Requests Queue (Accepting / Pending & Rider assignment) */}
        {activeTab === "requests" && (
          <div className="space-y-6">
            {vendorOrders.length === 0 ? (
              <div className="text-center py-20 bg-canvas-secondary border border-dashed border-border-subtle rounded-2xl">
                <Inbox className="mx-auto h-10 w-10 text-text-secondary/40 mb-2" />
                <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Queue is empty</p>
                <p className="text-[10px] text-text-secondary font-medium mt-0.5">Waiting for customer dispatches along the corridor.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vendorOrders.map((order) => {
                  return (
                    <div key={order.id} className="border border-border-subtle bg-canvas-secondary rounded-2xl p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4 mb-4">
                        <div>
                          <div className="text-[9px] font-mono text-accent-primary uppercase tracking-widest font-black">
                            Order Reference ID
                          </div>
                          <h3 className="text-sm font-black text-text-primary uppercase mt-0.5 tracking-tight">{order.id}</h3>
                          <div className="text-[10px] text-text-secondary mt-1 font-semibold">
                            Pay Mode: <strong className="text-text-primary">{order.paymentMethod}</strong> • Delivery Area: <strong className="text-text-primary">{order.deliveryArea}</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded border ${
                            order.status === "Pending" ? "border-text-secondary text-text-secondary bg-slate-50" :
                            order.status === "Accepted" ? "border-yellow-400 text-yellow-600 bg-yellow-50" :
                            "border-accent-primary text-accent-primary bg-accent-primary/5"
                          }`}>
                            {order.status}
                          </span>
                          <span className="text-xs font-black text-text-primary">
                            ₹{order.total}
                          </span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2 mb-6">
                        <h4 className="text-[9px] font-black uppercase text-text-secondary tracking-widest mb-1">Order Items</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {order.items.map(item => (
                            <div key={`req-item-${order.id}-${item.product.id}`} className="flex items-center gap-2 p-2 bg-canvas-primary border border-border-subtle rounded-xl text-xs">
                              <img src={item.product.image} className="w-10 h-10 rounded-lg object-cover" />
                              <div>
                                <div className="font-bold text-text-primary uppercase text-[10px] truncate max-w-[150px]">{item.product.name}</div>
                                <div className="text-[9px] text-text-secondary font-semibold">Qty: {item.quantity} • {item.product.weight}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Acceptance and Rider assignment Controls */}
                      <div className="border-t border-border-subtle pt-4">
                        {order.status === "Pending" ? (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-[10px] text-text-secondary leading-normal font-semibold">
                              Inspect items and pricing totals above. Accept order request to proceed.
                            </p>
                            <button
                              onClick={() => onAcceptOrder(order.id)}
                              className="w-full sm:w-auto px-6 py-2.5 bg-accent-primary hover:bg-accent-hover hover:shadow-[0_0_12px_rgba(249,115,22,0.45)] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm"
                            >
                              Accept Order Request
                            </button>
                          </div>
                        ) : order.status === "Accepted" ? (
                          /* Auto-Dispatch Broadcasting Panel */
                          <div className="bg-accent-primary/5 border border-accent-primary/20 p-4 rounded-xl space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                {/* Jiggling Box Icon */}
                                <div className="flex h-9 w-9 items-center justify-center bg-amber-50 border border-amber-300 text-amber-700 rounded-xl jiggle-attention shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                                    <polyline points="3.29 7 12 12 20.71 7"/>
                                    <line x1="12" y1="22" x2="12" y2="12"/>
                                  </svg>
                                </div>
                                <div>
                                  <div className="text-[10px] font-black text-text-primary uppercase tracking-tight flex items-center gap-1.5">
                                    Broadcasting Dispatch Signal...
                                  </div>
                                  <p className="text-[9px] text-text-secondary font-semibold leading-normal mt-0.5">
                                    Broadcasting request to active riders in 5km radius...
                                  </p>
                                </div>
                              </div>
                              
                              {/* Live loader dots */}
                              <div className="flex gap-1 items-center shrink-0 pr-2">
                                <span className="h-2.5 w-2.5 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="h-2.5 w-2.5 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="h-2.5 w-2.5 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                              </div>
                            </div>

                            {/* Broadcasting riders list jiggling */}
                            <div className="border-t border-border-subtle/40 pt-3">
                              <span className="text-[8px] font-black text-text-secondary uppercase tracking-widest block mb-2">
                                Notified fleet partners bidding:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {riders.map(r => (
                                  <div key={`broad-r-${r.id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-canvas-secondary border border-accent-primary/20 rounded-xl text-[9px] font-black uppercase text-accent-primary jiggle-attention shrink-0">
                                    <span>🏍 {r.name} ({r.vehicle.split(" ")[0]})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full flex items-center justify-between text-xs">
                            <span className="text-text-secondary font-semibold">
                              Assigned Delivery Partner: <strong className="text-text-primary uppercase">{order.assignedRider?.name}</strong>
                            </span>
                            <span className="text-[10px] bg-green-50 text-green-700 font-bold border border-green-200 px-3 py-1 rounded-lg uppercase tracking-wider">
                              In Transit
                            </span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Inventory Stock Management */}
        {activeTab === "catalog" && (
          <div className="border border-border-subtle bg-canvas-secondary rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative w-full sm:max-w-xs">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-text-secondary" />
                </div>
                <input
                  type="text"
                  placeholder="Search catalog products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 text-xs font-semibold border border-border-subtle bg-canvas-primary text-text-primary rounded-xl focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider text-right">
                Managing: {activeVendor.name} Stock Catalog
              </div>
            </div>

            {/* Dense Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-canvas-primary border-b border-border-subtle text-[9px] font-black uppercase text-text-secondary tracking-widest">
                    <th className="px-6 py-4">Thumbnail</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price (INR)</th>
                    <th className="px-6 py-4">Stock Level</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-xs">
                  {filteredCatalog.map((product) => {
                    const activeStock = product.stock[selectedVendorId] ?? 0;
                    const status = getStockStatus(activeStock);
                    const isEditing = editingProductId === product.id;

                    return (
                      <tr key={product.id} className="hover:bg-canvas-primary/50 transition-colors">
                        
                        {/* Enlarged Thumbnail Images */}
                        <td className="px-6 py-4">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-18 h-18 object-cover rounded-xl border border-border-subtle shadow-sm shrink-0" 
                          />
                        </td>
                        
                        {/* Detailed variant stock sizes dropdown listing */}
                        <td className="px-6 py-4 font-bold text-text-primary uppercase tracking-tight">
                          <div>{product.name}</div>
                          {product.variants && (
                            <div className="text-[9.5px] text-text-secondary font-semibold mt-1.5 leading-normal">
                              <span className="text-accent-primary font-black uppercase tracking-wider block mb-0.5">Sizing Variants Remaining:</span>
                              <div className="space-y-1">
                                {product.variants.map((v) => (
                                  <div key={v.name} className="flex justify-between border-b border-border-subtle/50 pb-0.5 max-w-[170px]">
                                    <span className="font-medium text-text-secondary">{v.name}:</span>
                                    <strong className="text-text-primary">{v.stock[selectedVendorId] ?? 0} left</strong>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-text-secondary font-medium">
                          {product.category}
                        </td>
                        
                        <td className="px-6 py-4 font-bold text-text-primary">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-text-secondary font-bold">₹</span>
                              <input
                                type="number"
                                value={editPriceVal}
                                onChange={(e) => setEditPriceVal(Number(e.target.value))}
                                className="w-16 border border-border-subtle bg-canvas-secondary p-1 text-xs focus:outline-none rounded-lg"
                              />
                            </div>
                          ) : (
                            `₹${product.price}`
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-text-primary">
                          {activeStock} units
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 text-[9px] font-bold border uppercase tracking-wider rounded-lg ${status.class}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => {
                                    onEdit(product.id, editPriceVal);
                                    setEditingProductId(null);
                                  }}
                                  className="px-3 py-1 bg-accent-primary hover:bg-accent-hover text-white text-[9px] font-bold uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingProductId(null)}
                                  className="px-2 py-1 border border-border-subtle bg-canvas-secondary text-text-secondary text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-canvas-primary transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingProductId(product.id);
                                    setEditPriceVal(product.price);
                                  }}
                                  title="Edit Price"
                                  className="p-2 border border-border-subtle bg-canvas-secondary hover:bg-canvas-primary text-text-secondary transition-colors rounded-xl cursor-pointer"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => onRestock(product.id, 10)}
                                  title="Restock +10"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-accent-primary bg-accent-primary hover:bg-accent-hover text-white text-[9px] font-bold uppercase tracking-widest transition-colors rounded-xl cursor-pointer"
                                >
                                  <RefreshCw className="h-3 w-3 animate-spin-slow" /> +10
                                </button>
                                <button
                                  onClick={() => onDelete(product.id)}
                                  title="Archive Product"
                                  className="p-2 border border-border-subtle bg-canvas-secondary hover:text-alert-critical hover:bg-red-50 text-text-secondary transition-colors rounded-xl cursor-pointer"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
