"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { 
  ShieldAlert, 
  User, 
  Award, 
  DollarSign, 
  ListOrdered, 
  CheckCircle2, 
  ChevronRight, 
  LogOut, 
  Edit2, 
  Map, 
  Compass, 
  Inbox, 
  History 
} from "lucide-react";
import { Order, Rider } from "@/types";
import TrademarkLoader from "./TrademarkLoader";

// Dynamically import the map component with SSR disabled
const DeliveryMap = dynamic(() => import("./DeliveryMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[480px] bg-text-primary flex flex-col items-center justify-center">
      <TrademarkLoader message="Initializing Geospatial Corridor..." />
    </div>
  ),
});

interface DeliveryTrackerViewProps {
  orders: Order[];
  riders: Rider[];
  onDeliverOrder: (orderId: string) => void;
}

// Coordinate mapping helper based on area text
const getAreaCoords = (area: string): [number, number] => {
  const norm = area.toLowerCase();
  if (norm.includes("tambaram")) return [12.9320, 80.1220];
  if (norm.includes("kundrathur")) return [12.9810, 80.1010];
  return [12.9450, 80.1150]; // default midpoint
};

const getVendorCoords = (vendorId: number): [number, number] => {
  if (vendorId === 2) return [12.9260, 80.1220]; // Tambaram
  return [12.9750, 80.1080]; // Kundrathur
};

export default function DeliveryTrackerView({ orders, riders, onDeliverOrder }: DeliveryTrackerViewProps) {
  const [selectedRiderId, setSelectedRiderId] = useState<string>("RIDER-1");
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "dispatches" | "requests"
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Edit details modal states (mock)
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [tempVehicle, setTempVehicle] = useState("");

  const activeRider = riders.find(r => r.id === selectedRiderId) || riders[0];

  // Rider Elite Badge Logic
  const getEliteBadge = (deliveries: number) => {
    if (deliveries >= 16) {
      return { label: "Gold Dispatcher", class: "bg-amber-100 text-amber-700 border-amber-300" };
    }
    if (deliveries >= 6) {
      return { label: "Silver Rider", class: "bg-slate-100 text-slate-700 border-slate-300" };
    }
    return { label: "Bronze Rider", class: "bg-orange-100 text-orange-700 border-orange-200" };
  };

  const badge = getEliteBadge(activeRider.deliveriesCount);

  // Filter orders for active rider
  const riderActiveOrders = orders.filter(o => o.assignedRider?.id === activeRider.id && o.status === "Dispatched");
  const riderHistoryOrders = orders.filter(o => o.assignedRider?.id === activeRider.id && o.status === "Delivered");

  // Determine currently mapped order details
  // Default to first active order, or selected order
  const activeMappedOrder = orders.find(o => o.id === (selectedOrderId || (riderActiveOrders[0]?.id || orders[0]?.id)));

  const mapVendorPos: [number, number] = activeMappedOrder ? getVendorCoords(activeMappedOrder.vendorId) : [12.9750, 80.1080];
  const mapCustomerPos: [number, number] = activeMappedOrder ? getAreaCoords(activeMappedOrder.deliveryArea) : [12.9320, 80.1220];
  const mapPartnerPos: [number, number] = activeRider.coords;

  return (
    <div className="w-full h-[calc(100vh-64px)] relative flex bg-canvas-primary overflow-hidden">
      
      {/* 1. Deep Midnight Navy Left-Hand Sidebar */}
      <aside className="w-64 bg-sidebar-bg shrink-0 hidden md:flex flex-col text-white justify-between border-r border-border-subtle/10 z-20">
        <div className="p-6 space-y-6">
          {/* Active Rider Profile Info */}
          <div>
            <div className="text-[10px] font-bold text-accent-primary uppercase tracking-widest">Active Courier</div>
            <div className="mt-1.5 flex items-center gap-2">
              <select
                value={selectedRiderId}
                onChange={(e) => {
                  setSelectedRiderId(e.target.value);
                  setSelectedOrderId(null);
                }}
                className="text-xs font-black bg-slate-800 border border-slate-700 text-white p-1 focus:outline-none rounded-lg uppercase tracking-wider"
              >
                {riders.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            
            <div className="mt-3 flex items-center gap-2">
              <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border rounded-full ${badge.class}`}>
                {badge.label}
              </span>
            </div>
          </div>

          {/* Sidebar Menu Sections */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors rounded-xl cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-accent-primary text-white"
                  : "text-text-secondary hover:text-white hover:bg-canvas-secondary/5"
              }`}
            >
              <DollarSign className="h-4 w-4" />
              <span>Earnings Menu</span>
            </button>

            <button
              onClick={() => setActiveTab("dispatches")}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors rounded-xl cursor-pointer ${
                activeTab === "dispatches"
                  ? "bg-accent-primary text-white"
                  : "text-text-secondary hover:text-white hover:bg-canvas-secondary/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <ListOrdered className="h-4 w-4" />
                <span>Active Dispatches</span>
              </div>
              {riderActiveOrders.length > 0 && (
                <span className="h-4 w-4 bg-alert-critical text-[8px] font-black flex items-center justify-center rounded-full text-white">
                  {riderActiveOrders.length}
                </span>
              )}
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
                <span>Corridor Previews</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Bounding Coordinate Marker */}
        <div className="p-6 border-t border-border-subtle/5 bg-slate-950/40 text-[9px] font-mono text-text-secondary/50">
          <div className="flex items-center gap-1.5 uppercase font-bold text-accent-primary mb-1">
            <Compass className="h-3 w-3" /> FLT GPS BOUNDS
          </div>
          BOUNDS: Tambaram Corridor
        </div>
      </aside>

      {/* 2. Left-Center Detail Panel (Toggled dynamically by Sidebar Menu) */}
      <div className="w-80 border-r border-border-subtle bg-canvas-secondary flex flex-col justify-between overflow-y-auto shrink-0 z-10">
        
        <div className="p-5 space-y-6">
          
          {/* Header metadata */}
          <div className="border-b border-border-subtle pb-3 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-primary">
              {activeTab === "dashboard" ? "Rider Earning Details" : activeTab === "dispatches" ? "Active dispatches" : "Corridor Requests"}
            </h3>
            <span className="text-[9px] bg-canvas-primary border border-border-subtle px-2 py-0.5 rounded font-mono text-text-secondary">
              {activeRider.id}
            </span>
          </div>

          {/* Section A: Dashboard / Earnings details */}
          {activeTab === "dashboard" && (
            <div className="space-y-5">
              
              {/* Earning Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-canvas-primary border border-border-subtle p-3 rounded-xl text-center">
                  <div className="text-[8px] font-bold text-text-secondary uppercase tracking-widest mb-1">Total Paid</div>
                  <div className="text-sm font-black text-text-primary">₹{activeRider.earnings}</div>
                </div>
                <div className="bg-canvas-primary border border-border-subtle p-3 rounded-xl text-center">
                  <div className="text-[8px] font-bold text-text-secondary uppercase tracking-widest mb-1">Trips Done</div>
                  <div className="text-sm font-black text-text-primary">{activeRider.deliveriesCount}</div>
                </div>
              </div>

              {/* Courier info card */}
              <div className="p-4 bg-canvas-primary border border-border-subtle rounded-xl text-xs space-y-2">
                <div className="font-bold text-text-primary uppercase tracking-tight">Vehicle details</div>
                <div className="text-text-secondary font-semibold">
                  <div>Type: <strong>{activeRider.vehicle}</strong></div>
                  <div>Status: <span className="text-accent-primary uppercase font-bold">{activeRider.status}</span></div>
                  <div>Corridor Base: <strong>Tambaram Node</strong></div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setTempVehicle(activeRider.vehicle);
                      setShowEditDetails(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 border border-border-subtle bg-canvas-secondary hover:bg-canvas-primary text-[9px] font-bold uppercase py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" /> Edit Vehicle Class
                  </button>
                </div>
              </div>

              {/* Delivered orders log */}
              {riderHistoryOrders.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[9px] font-black uppercase text-text-secondary tracking-widest">
                    Delivered History Logs
                  </h4>
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {riderHistoryOrders.map(h => (
                      <div key={`hist-${h.id}`} className="text-[10px] font-bold text-text-secondary flex justify-between bg-canvas-primary border border-border-subtle p-2.5 rounded-xl">
                        <div>
                          <div className="text-text-primary">{h.id}</div>
                          <div className="text-[8px] text-text-secondary font-semibold mt-0.5">{h.deliveryArea}</div>
                        </div>
                        <span className="text-green-700 font-black">₹{h.total} ✓</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Section B: Active Dispatches tab */}
          {activeTab === "dispatches" && (
            <div className="space-y-4">
              {riderActiveOrders.length === 0 ? (
                <div className="text-center py-10 bg-canvas-primary rounded-xl border border-dashed border-border-subtle">
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">No active dispatches</p>
                  <p className="text-[9px] text-text-secondary mt-0.5">Assigned dispatches will appear in this menu.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {riderActiveOrders.map(order => (
                    <div key={`rider-act-${order.id}`} className="p-4 bg-canvas-primary border border-border-subtle rounded-xl space-y-3 shadow-sm">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black text-text-primary uppercase tracking-tight">{order.id}</span>
                        <span className="text-[9px] bg-accent-primary/10 text-accent-primary px-2 py-0.5 rounded font-bold uppercase">Dispatched</span>
                      </div>
                      <div className="text-[10px] text-text-secondary space-y-1 font-semibold leading-normal">
                        <div>Pickup Depot: <strong>{order.vendorName}</strong></div>
                        <div>Droppoint: <strong>{order.deliveryArea}</strong></div>
                        <div>Payload Weight: <strong>1.5 kg</strong></div>
                        <div>Price: <strong>₹{order.total}</strong></div>
                      </div>
                      
                      <button
                        onClick={() => onDeliverOrder(order.id)}
                        className="w-full inline-flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white font-bold text-[9px] uppercase tracking-widest py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Mark as Delivered
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section C: Corridor Requests tab */}
          {activeTab === "requests" && (
            <div className="space-y-4">
              {orders.filter(o => o.status === "Accepted" || o.status === "Dispatched").length === 0 ? (
                <div className="text-center py-10 bg-canvas-primary rounded-xl border border-dashed border-border-subtle">
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">No corridor requests</p>
                  <p className="text-[9px] text-text-secondary mt-0.5">Submit orders from user section to load data.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.filter(o => o.status === "Accepted" || o.status === "Dispatched").map(order => {
                    const isDispatched = order.status === "Dispatched";
                    return (
                      <div 
                        key={`rider-req-${order.id}`} 
                        className={`p-3.5 rounded-xl border transition-all duration-150 space-y-3 ${
                          activeMappedOrder?.id === order.id 
                            ? "border-accent-primary bg-accent-primary/5" 
                            : "border-border-subtle bg-canvas-primary"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-black text-text-primary uppercase tracking-tight">{order.id}</span>
                            <div className="text-[9px] text-text-secondary font-bold uppercase mt-0.5">{order.vendorName}</div>
                          </div>
                          <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase ${
                            isDispatched ? "bg-accent-primary/10 text-accent-primary" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="text-[9px] text-text-secondary leading-normal font-semibold space-y-1">
                          <div>Area: <strong>{order.deliveryArea}</strong></div>
                          <div>Address: <strong>{order.vendorAddress}</strong></div>
                        </div>

                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="w-full inline-flex items-center justify-center gap-1.5 bg-text-primary hover:bg-accent-primary text-white font-bold text-[9px] uppercase tracking-widest py-2 rounded-xl transition-colors cursor-pointer"
                        >
                          View Delivering in Map <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Sidebar Ribbon options */}
        <div className="p-4 border-t border-border-subtle bg-canvas-primary flex justify-center">
          <button
            onClick={() => window.location.reload()}
            className="w-full inline-flex items-center justify-center gap-1.5 border border-border-subtle bg-canvas-secondary hover:bg-red-50 hover:text-alert-critical text-text-secondary font-bold text-[9px] uppercase tracking-widest py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out Session
          </button>
        </div>
      </div>

      {/* 3. Right Panel: Dynamic light-colored Leaflet corridor map */}
      <div className="flex-1 h-full relative z-0">
        <DeliveryMap 
          vendorPos={mapVendorPos}
          customerPos={mapCustomerPos}
          partnerPos={mapPartnerPos}
          orderId={activeMappedOrder?.id}
          riderName={activeRider.name}
          orderStatus={activeMappedOrder?.status}
          riders={riders}
        />
      </div>

      {/* Edit Details Dialog Modal */}
      {showEditDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-canvas-secondary border border-border-subtle p-6 rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-border-subtle pb-3 mb-4">
              Edit Rider Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                  Rider Vehicle Class
                </label>
                <input 
                  type="text" 
                  value={tempVehicle}
                  onChange={(e) => setTempVehicle(e.target.value)}
                  className="w-full text-xs font-semibold bg-canvas-primary border border-border-subtle p-2.5 focus:outline-none focus:border-accent-primary rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    activeRider.vehicle = tempVehicle;
                    setShowEditDetails(false);
                  }}
                  className="flex-1 bg-text-primary text-white hover:bg-accent-primary text-[10px] font-bold uppercase py-2.5 rounded-xl cursor-pointer"
                >
                  Save Details
                </button>
                <button
                  onClick={() => setShowEditDetails(false)}
                  className="px-4 border border-border-subtle bg-canvas-primary text-text-secondary text-[10px] font-bold uppercase py-2.5 rounded-xl hover:bg-canvas-secondary cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
