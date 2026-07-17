"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { 
  Search, 
  MapPin, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  ChevronRight, 
  History, 
  Heart, 
  AlertOctagon, 
  HelpCircle, 
  ShieldAlert, 
  CreditCard, 
  Landmark, 
  Store, 
  Gift, 
  Compass 
} from "lucide-react";
import { Product, CartItem, Order, Feedback, Vendor, Rider } from "@/app/page";
import TrademarkLoader from "./TrademarkLoader";

// Dynamically import map with SSR disabled to prevent node environment errors
const DeliveryMap = dynamic(() => import("./DeliveryMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-slate-100 rounded-xl flex items-center justify-center text-text-secondary font-mono text-[9px] uppercase tracking-wider">
      Hydrating Customer Corridor Map...
    </div>
  )
});

interface MarketplaceViewProps {
  inventory: Product[];
  cart: CartItem[];
  vendors: Vendor[];
  selectedVendorId: number;
  onSelectVendor: (vendorId: number) => void;
  onAddToCart: (productId: number) => void;
  onUpdateCartQuantity: (productId: number, quantity: number) => void;
  onRemoveFromCart: (productId: number) => void;
  onCheckout: (paymentMethod: "Online" | "COD", deliveryArea: string) => void;
  orders: Order[];
  feedbacks: Feedback[];
  onSubmitFeedback: (category: string, content: string, orderId?: string) => void;
  setView: (view: string) => void;
  riders: Rider[];
}

const getAreaCoords = (area: string): [number, number] => {
  const norm = area.toLowerCase();
  if (norm.includes("tambaram")) return [12.9320, 80.1220];
  if (norm.includes("kundrathur")) return [12.9810, 80.1010];
  return [12.9450, 80.1150];
};

const getVendorCoords = (vendorId: number): [number, number] => {
  if (vendorId === 2) return [12.9260, 80.1220];
  return [12.9750, 80.1080];
};

export default function MarketplaceView({
  inventory,
  cart,
  vendors,
  selectedVendorId,
  onSelectVendor,
  onAddToCart,
  onUpdateCartQuantity,
  onRemoveFromCart,
  onCheckout,
  orders,
  feedbacks,
  onSubmitFeedback,
  setView,
  riders
}: MarketplaceViewProps) {
  const [activeMenu, setActiveMenu] = useState("storefront"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Tracing Sandbox state
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Cart item flight animation particle state
  const [flyingParticle, setFlyingParticle] = useState<{
    id: number;
    image: string;
    startX: number;
    startY: number;
  } | null>(null);

  // Checkout detail states
  const [paymentMethod, setPaymentMethod] = useState<"Online" | "COD">("Online");
  const [deliveryArea, setDeliveryArea] = useState("Tambaram West Sector 3");

  // Complaint Form states
  const [feedbackCategory, setFeedbackCategory] = useState("Delivery Issue");
  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbackOrderId, setFeedbackOrderId] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const categories = ["All", "Dairy", "Groceries", "Snacks"];

  // Filtered products
  const filteredProducts = inventory.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartSubtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 25 : 0;
  const cartTotal = cartSubtotal + deliveryFee;

  const activeVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];

  const getPersonalizedOffer = () => {
    if (orders.length === 0) {
      return {
        title: "Welcome Discount Applied",
        desc: "Get ₹50 flat cashback on your first online order. Code: FIRST50",
        badge: "NEW USER"
      };
    }
    
    const boughtDairy = orders.some(o => o.items.some(item => item.product.category === "Dairy"));
    if (boughtDairy) {
      return {
        title: "Exclusive Dairy Booster",
        desc: "Enjoy 15% off fresh milk & paneer packs on your next checkout. Code: MILK15",
        badge: "DAIRY LOVER"
      };
    }

    return {
      title: "Corridor Express Special",
      desc: "Free delivery on order amounts exceeding ₹250. Code: FREESHIP",
      badge: "ACTIVE PROMO"
    };
  };

  const offer = getPersonalizedOffer();

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackContent.trim()) return;

    onSubmitFeedback(feedbackCategory, feedbackContent, feedbackOrderId || undefined);
    setFeedbackContent("");
    setFeedbackOrderId("");
    setFeedbackSuccess(true);
    setTimeout(() => setFeedbackSuccess(false), 3000);
  };

  // Triggers the visual addition flight
  const triggerAddToCartFlight = (e: React.MouseEvent, product: Product) => {
    setFlyingParticle({
      id: Date.now(),
      image: product.image,
      startX: e.clientX,
      startY: e.clientY
    });
    
    // Call the parent add handler
    onAddToCart(product.id);

    // Clear particle after animation duration completes
    setTimeout(() => setFlyingParticle(null), 850);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-canvas-primary relative">
      
      {/* Item flight particle layer */}
      {flyingParticle && (
        <div 
          className="fixed z-[9999] pointer-events-none rounded-xl border border-accent-primary shadow-lg overflow-hidden bg-white"
          style={{
            width: "48px",
            height: "48px",
            left: `${flyingParticle.startX}px`,
            top: `${flyingParticle.startY}px`,
            ["--tx" as any]: `${window.innerWidth - 220}px`,
            ["--ty" as any]: `190px`,
            animation: "flyToCartDrawer 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards"
          }}
        >
          <img src={flyingParticle.image} className="w-full h-full object-cover" alt="flying product" />
          <style>{`
            @keyframes flyToCartDrawer {
              0% { transform: scale(1.2); opacity: 1; }
              20% { transform: scale(1.4) rotate(15deg); }
              100% { left: var(--tx); top: var(--ty); transform: scale(0.1) rotate(45deg); opacity: 0.1; }
            }
          `}</style>
        </div>
      )}

      {/* 1. Midnight Navy Left Sidebar */}
      <aside className="w-64 bg-sidebar-bg shrink-0 hidden md:flex flex-col text-white justify-between border-r border-r-border-subtle/10 z-20">
        <div className="p-6 space-y-6">
          <div>
            <div className="text-[10px] font-bold text-accent-primary uppercase tracking-widest">Active Corridor Hub</div>
            <h2 className="text-sm font-black uppercase tracking-tight mt-1 truncate">{activeVendor.name}</h2>
            <p className="text-[9px] text-text-secondary/80 leading-normal mt-0.5">{activeVendor.address}</p>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveMenu("storefront")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors rounded-xl cursor-pointer ${
                activeMenu === "storefront"
                  ? "bg-accent-primary text-white"
                  : "text-text-secondary hover:text-white hover:bg-canvas-secondary/5"
              }`}
            >
              <Store className="h-4 w-4" />
              <span>Shop Storefront</span>
            </button>

            <button
              onClick={() => setActiveMenu("orders")}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors rounded-xl cursor-pointer ${
                activeMenu === "orders"
                  ? "bg-accent-primary text-white"
                  : "text-text-secondary hover:text-white hover:bg-canvas-secondary/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <History className="h-4 w-4" />
                <span>Track Dispatches</span>
              </div>
              {orders.filter(o => o.status === "Pending" || o.status === "Dispatched").length > 0 && (
                <span className="h-4 w-4 bg-accent-primary text-[8px] font-black flex items-center justify-center rounded-full text-white">
                  {orders.filter(o => o.status === "Pending" || o.status === "Dispatched").length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveMenu("rewards")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors rounded-xl cursor-pointer ${
                activeMenu === "rewards"
                  ? "bg-accent-primary text-white"
                  : "text-text-secondary hover:text-white hover:bg-canvas-secondary/5"
              }`}
            >
              <Gift className="h-4 w-4" />
              <span>Special Rewards</span>
            </button>

            <button
              onClick={() => setActiveMenu("feedback")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors rounded-xl cursor-pointer ${
                activeMenu === "feedback"
                  ? "bg-accent-primary text-white"
                  : "text-text-secondary hover:text-white hover:bg-canvas-secondary/5"
              }`}
            >
              <AlertOctagon className="h-4 w-4" />
              <span>Help & Feedback</span>
            </button>
          </nav>
        </div>

        <div className="p-6 border-t border-border-subtle/5 bg-slate-950/40 text-[9px] font-mono text-text-secondary/50">
          <div className="flex items-center gap-1.5 uppercase font-bold text-accent-primary mb-1">
            <Compass className="h-3 w-3" /> GPS LOCK Bounded
          </div>
          ACTIVE: Tambaram corridor
        </div>
      </aside>

      {/* 2. Main Workspace Panel */}
      <main className="flex-1 p-6 md:p-8 min-w-0 overflow-y-auto">
        
        {/* Navigation title header */}
        <div className="border-b border-border-subtle pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[9px] font-mono text-accent-primary uppercase tracking-widest font-black">
              Customer Terminal
            </span>
            <h1 className="text-xl font-black uppercase text-text-primary mt-0.5 tracking-tight">
              {activeMenu === "storefront" ? "Local Stock Storefront" : activeMenu === "orders" ? "Active Dispatch Telemetry" : activeMenu === "rewards" ? "Exclusive Customer Rewards" : "Feedback Desk & Complaint Forms"}
            </h1>
          </div>

          {/* Mobile navigation backup */}
          <div className="flex md:hidden gap-1.5 border border-border-subtle p-1 rounded-xl bg-canvas-secondary">
            <button 
              onClick={() => setActiveMenu("storefront")} 
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg ${activeMenu === "storefront" ? "bg-accent-primary text-white" : "text-text-secondary"}`}
            >
              Shop
            </button>
            <button 
              onClick={() => setActiveMenu("orders")} 
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg ${activeMenu === "orders" ? "bg-accent-primary text-white" : "text-text-secondary"}`}
            >
              Track
            </button>
            <button 
              onClick={() => setActiveMenu("rewards")} 
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg ${activeMenu === "rewards" ? "bg-accent-primary text-white" : "text-text-secondary"}`}
            >
              Gift
            </button>
            <button 
              onClick={() => setActiveMenu("feedback")} 
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg ${activeMenu === "feedback" ? "bg-accent-primary text-white" : "text-text-secondary"}`}
            >
              Help
            </button>
          </div>
        </div>

        {/* Tab A: Shop Storefront */}
        {activeMenu === "storefront" && (
          <div className="flex flex-col xl:flex-row gap-8 items-start">
            
            {/* Catalog Grid */}
            <div className="flex-1 w-full">
              
              {/* Category selector */}
              <div className="mb-6">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border rounded-xl transition-all duration-155 whitespace-nowrap cursor-pointer ${
                        selectedCategory === cat
                          ? "border-accent-primary bg-accent-primary text-white shadow-sm"
                          : "border-border-subtle bg-canvas-primary text-text-secondary hover:border-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const activeStock = product.stock[selectedVendorId] ?? 0;
                  const isOutOfStock = activeStock === 0;
                  const isLowStock = activeStock > 0 && activeStock <= 3;
                  const cartItem = cart.find((item) => item.product.id === product.id);
                  const cartQty = cartItem ? cartItem.quantity : 0;

                  return (
                    <div key={product.id} className={`border border-border-subtle rounded-2xl p-4 flex flex-col justify-between group transition-all duration-200 hover:border-accent-primary hover:shadow-[0_0_24px_rgba(249,115,22,0.06)] relative overflow-hidden ${
                      isOutOfStock ? "bg-slate-100/80 grayscale opacity-65" : "bg-canvas-secondary"
                    }`}>
                      
                      {/* Alert status badges */}
                      {isOutOfStock ? (
                        <div className="absolute top-3 left-3 z-10 bg-text-secondary/80 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded">
                          Sold Out
                        </div>
                      ) : isLowStock ? (
                        <div className="absolute top-3 left-3 z-10 bg-alert-critical text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded animate-pulse">
                          Only {activeStock} left!
                        </div>
                      ) : null}

                      {/* Image */}
                      <div className="w-full h-36 bg-canvas-primary rounded-xl overflow-hidden mb-4 relative">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between mb-4">
                        <div>
                          <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest block mb-1">
                            {product.category}
                          </span>
                          <h3 className="text-xs font-bold text-text-primary uppercase tracking-tight line-clamp-2 leading-tight">
                            {product.name}
                          </h3>
                        </div>
                        <div className="text-[10px] text-text-secondary font-semibold mt-2">
                          Weight: {product.weight}
                        </div>
                      </div>

                      {/* Price Action button */}
                      <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                        <span className="text-sm font-black text-text-primary">
                          ₹{product.price}
                        </span>

                        {cartQty > 0 ? (
                          <div className="flex items-center border border-accent-primary rounded-xl bg-canvas-secondary shadow-sm">
                            <button
                              onClick={() => onUpdateCartQuantity(product.id, cartQty - 1)}
                              className="px-2.5 py-1.5 text-accent-primary hover:bg-canvas-primary transition-colors cursor-pointer"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-1 text-xs font-bold text-text-primary">{cartQty}</span>
                            <button
                              onClick={(e) => {
                                if (cartQty < activeStock) {
                                  triggerAddToCartFlight(e, product);
                                  onUpdateCartQuantity(product.id, cartQty + 1);
                                }
                              }}
                              className="px-2.5 py-1.5 text-accent-primary hover:bg-canvas-primary transition-colors disabled:opacity-40 cursor-pointer"
                              disabled={cartQty >= activeStock}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => triggerAddToCartFlight(e, product)}
                            className="inline-flex items-center gap-1 bg-accent-primary border border-accent-primary hover:bg-accent-hover hover:shadow-[0_0_12px_rgba(249,115,22,0.45)] text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-sm"
                            disabled={isOutOfStock}
                          >
                            <Plus className="h-3.5 w-3.5 stroke-[3px]" /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right sidebar details */}
            <div className="w-full xl:w-[280px] shrink-0 space-y-6">
              {/* Vendor selector */}
              <div className="border border-border-subtle bg-canvas-secondary p-5 rounded-2xl shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-border-subtle pb-2 mb-3">
                  Vendor Depot
                </h3>
                <div className="space-y-3">
                  {vendors.map((v) => {
                    const isActive = v.id === selectedVendorId;
                    return (
                      <button
                        key={v.id}
                        onClick={() => onSelectVendor(v.id)}
                        className={`w-full text-left p-3 border transition-all duration-150 rounded-xl cursor-pointer ${
                          isActive 
                            ? "border-accent-primary bg-accent-primary/5 text-text-primary" 
                            : "border-border-subtle bg-canvas-primary text-text-secondary hover:border-text-secondary hover:text-text-primary"
                        }`}
                      >
                        <div className="text-xs font-bold uppercase tracking-tight flex items-center justify-between">
                          <span>{v.name}</span>
                          {isActive && <CheckCircle2 className="h-4 w-4 text-accent-primary shrink-0" />}
                        </div>
                        <div className="text-[10px] text-text-secondary mt-1 truncate">
                          {v.address}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Special Reward Promo card */}
              <div className="border border-accent-primary/20 bg-accent-primary/5 p-5 rounded-2xl">
                <div className="flex items-center gap-1.5 text-accent-primary font-bold uppercase tracking-wider text-[10px] mb-2">
                  <Gift className="h-4 w-4" /> Recommended Deal
                </div>
                <h4 className="text-xs font-black uppercase tracking-tight text-text-primary">
                  {offer.title}
                </h4>
                <p className="text-[9.5px] text-text-secondary leading-relaxed mt-1">
                  {offer.desc}
                </p>
              </div>
            </div>

          </div>
        )}

        {/* Tab B: Track Dispatches (Order Tracing Sandbox) */}
        {activeMenu === "orders" && (
          <div className="border border-border-subtle bg-canvas-secondary p-6 rounded-2xl shadow-sm">
            <div className="border-b border-border-subtle pb-4 mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Active Order Pipelines
              </h2>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 bg-canvas-primary rounded-xl border border-dashed border-border-subtle">
                <ShieldAlert className="mx-auto h-8 w-8 text-text-secondary/40 mb-2" />
                <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">No dispatches active</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {orders.map((order) => {
                  const statusColors = {
                    Pending: "border-text-secondary text-text-secondary bg-slate-50",
                    Accepted: "border-yellow-400 text-yellow-600 bg-yellow-50",
                    Dispatched: "border-accent-primary text-accent-primary bg-accent-primary/5",
                    Delivered: "border-green-600 text-green-700 bg-green-50"
                  };

                  const isTrackingActive = trackingOrderId === order.id;

                  // Resolve coordinates for this specific order tracing map
                  const trackVendorPos = getVendorCoords(order.vendorId);
                  const trackCustomerPos = getAreaCoords(order.deliveryArea);
                  const trackPartnerPos = order.assignedRider?.coords || [12.9550, 80.1150];

                  return (
                    <div key={order.id} className="border border-border-subtle bg-canvas-primary rounded-xl p-5 relative overflow-hidden flex flex-col gap-4">
                      <div className="flex flex-col lg:flex-row justify-between gap-4">
                        
                        {/* Order info details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between border-b border-border-subtle/50 pb-3 mb-3">
                            <div>
                              <h4 className="text-xs font-black text-text-primary uppercase tracking-tight">
                                {order.id}
                              </h4>
                              <div className="text-[9px] text-text-secondary font-semibold uppercase tracking-wider mt-0.5">
                                From: {order.vendorName}
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border rounded ${statusColors[order.status]}`}>
                              {order.status}
                            </span>
                          </div>

                          <div className="space-y-1.5 mb-4">
                            {order.items.map((item) => (
                              <div key={`ord-${order.id}-${item.product.id}`} className="flex justify-between text-[10px] font-semibold text-text-secondary">
                                <span>{item.product.name} (x{item.quantity})</span>
                                <span>₹{item.product.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-border-subtle/50 pt-3 mb-4">
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-text-secondary mb-1.5">
                              <span className={order.status === "Pending" ? "text-text-primary" : ""}>Pending</span>
                              <span className={order.status === "Accepted" ? "text-yellow-600" : ""}>Accepted</span>
                              <span className={order.status === "Dispatched" ? "text-accent-primary" : ""}>Dispatched</span>
                              <span className={order.status === "Delivered" ? "text-green-700" : ""}>Delivered</span>
                            </div>
                            <div className="h-1.5 w-full bg-border-subtle rounded-full overflow-hidden flex">
                              <div className={`h-full ${
                                order.status === "Pending" ? "w-1/4 bg-text-secondary" :
                                order.status === "Accepted" ? "w-2/4 bg-yellow-500" :
                                order.status === "Dispatched" ? "w-3/4 bg-accent-primary" :
                                "w-full bg-green-600"
                              }`} />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[9px] font-bold text-text-secondary border-t border-border-subtle/50 pt-3">
                            <div>
                              <div>Pay Mode: <strong className="text-text-primary uppercase">{order.paymentMethod}</strong></div>
                              <div>Area: <strong className="text-text-primary">{order.deliveryArea}</strong></div>
                            </div>
                            
                            {order.assignedRider ? (
                              <div className="text-right border-l border-border-subtle/60 pl-3">
                                <div className="text-[8px] font-black uppercase text-accent-primary">Courier Assigned</div>
                                <div className="text-text-primary font-bold uppercase">{order.assignedRider.name}</div>
                                <div className="text-text-secondary font-medium text-[8px]">{order.assignedRider.vehicle}</div>
                              </div>
                            ) : (
                              <div className="text-right text-[8.5px] italic text-text-secondary font-medium">
                                Awaiting courier assignment...
                              </div>
                            )}
                          </div>

                          {/* Tracing actions button */}
                          {order.status === "Dispatched" && (
                            <div className="mt-4 pt-3 border-t border-border-subtle/50">
                              <button
                                onClick={() => setTrackingOrderId(isTrackingActive ? null : order.id)}
                                className="w-full inline-flex items-center justify-center gap-1.5 bg-accent-primary hover:bg-accent-hover text-white text-[9.5px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-all shadow-[0_0_8px_rgba(249,115,22,0.35)] cursor-pointer"
                              >
                                <Compass className="h-3.5 w-3.5 animate-spin-slow" /> 
                                {isTrackingActive ? "Close Map View" : "Track Order Live Map"}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Inline Leaflet Map tracing panel for sandboxed safety */}
                        {isTrackingActive && order.status === "Dispatched" && (
                          <div className="w-full lg:w-96 h-64 border border-border-subtle rounded-xl overflow-hidden shrink-0 z-0">
                            <DeliveryMap
                              vendorPos={trackVendorPos}
                              customerPos={trackCustomerPos}
                              partnerPos={trackPartnerPos}
                              orderId={order.id}
                              riderName={order.assignedRider?.name}
                              orderStatus={order.status}
                              riders={riders}
                            />
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

        {/* Tab C: Customer Rewards */}
        {activeMenu === "rewards" && (
          <div className="space-y-6">
            <div className="border border-accent-primary/20 bg-accent-primary/5 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-3 right-3 px-3 py-1 bg-accent-primary text-white text-[9px] font-black uppercase tracking-widest rounded-xl">
                {offer.badge}
              </div>
              <div className="flex items-center gap-1.5 text-accent-primary font-bold uppercase tracking-wider text-xs mb-3">
                <Heart className="h-4.5 w-4.5 fill-accent-primary animate-pulse" /> Highly Recommended Loyalty Deal
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight text-text-primary">
                {offer.title}
              </h3>
              <p className="text-xs text-text-secondary font-medium leading-relaxed mt-1">
                {offer.desc}
              </p>
            </div>

            <div className="border border-border-subtle bg-canvas-secondary p-6 rounded-2xl shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-border-subtle pb-2 mb-4">
                Personalized History Stats
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-text-secondary">
                <div className="p-4 bg-canvas-primary border border-border-subtle rounded-xl">
                  <div>Previous Orders Placed</div>
                  <div className="text-xl font-black text-text-primary mt-1">{orders.length} Deliveries</div>
                </div>
                <div className="p-4 bg-canvas-primary border border-border-subtle rounded-xl">
                  <div>Active Special Discounts</div>
                  <div className="text-xl font-black text-accent-primary mt-1">2 Vouchers Available</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab D: Help & Feedback */}
        {activeMenu === "feedback" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Form */}
            <div className="border border-border-subtle bg-canvas-secondary p-6 rounded-2xl shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-border-subtle pb-3 mb-4 flex items-center gap-1.5">
                <AlertOctagon className="h-4 w-4 text-accent-primary" /> Log a Complaint or General Feedback
              </h3>
              
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                    Feedback Category
                  </label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="w-full text-xs font-bold bg-canvas-primary border border-border-subtle p-2 focus:outline-none focus:border-accent-primary rounded-xl"
                  >
                    <option>Delivery delay</option>
                    <option>Item damaged</option>
                    <option>Wrong stock count</option>
                    <option>General suggestion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                    Reference Order ID (Optional)
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. ORD-101"
                    value={feedbackOrderId}
                    onChange={(e) => setFeedbackOrderId(e.target.value)}
                    className="w-full text-xs font-medium bg-canvas-primary border border-border-subtle p-2.5 focus:outline-none focus:border-accent-primary rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                    Details
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Please explain your feedback in detail..."
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                    className="w-full text-xs font-medium bg-canvas-primary border border-border-subtle p-2.5 focus:outline-none focus:border-accent-primary rounded-xl resize-none"
                  />
                </div>

                {feedbackSuccess && (
                  <div className="text-[10px] text-accent-primary font-bold uppercase tracking-wider text-center animate-pulse">
                    Feedback recorded in system logs.
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center bg-text-primary hover:bg-accent-primary border border-text-primary text-white font-bold py-2.5 text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Submit Ticket
                </button>
              </form>
            </div>

            {/* List */}
            <div className="border border-border-subtle bg-canvas-secondary p-6 rounded-2xl shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-border-subtle pb-3 mb-4">
                Support Tickets & Logs
              </h3>

              {feedbacks.length === 0 ? (
                <div className="text-center py-12 bg-canvas-primary rounded-xl border border-dashed border-border-subtle">
                  <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">No tickets submitted</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {feedbacks.map((fb) => (
                    <div key={fb.id} className="p-4 bg-canvas-primary border border-border-subtle rounded-xl text-xs space-y-1.5 leading-relaxed">
                      <div className="flex justify-between font-bold text-text-primary uppercase tracking-tight">
                        <span>{fb.category}</span>
                        <span className="text-text-secondary text-[8.5px] font-normal">{fb.timestamp}</span>
                      </div>
                      {fb.orderId && <div className="text-[9px] font-bold text-accent-primary">Ref ID: {fb.orderId}</div>}
                      <p className="text-text-secondary font-medium leading-normal">{fb.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Persistent Cart drawer panel (Desktop) */}
      {activeMenu === "storefront" && (
        <div className="hidden md:block">
          <div className="fixed top-20 right-4 z-40 w-[290px] border border-border-subtle bg-canvas-secondary p-5 shadow-xl rounded-2xl">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-text-primary" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Shopping Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})
                </h2>
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8 bg-canvas-primary rounded-xl border border-dashed border-border-subtle flex flex-col items-center justify-center">
                <svg className="w-12 h-12 text-amber-700/50 mb-2 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                  <polyline points="3.29 7 12 12 20.71 7"/>
                </svg>
                <span className="text-[10px] font-black uppercase text-accent-primary tracking-widest">AeroBox Empty</span>
                <p className="text-[9px] text-text-secondary font-semibold mt-1 px-4 leading-normal">
                  Add items from the store to fill the box!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={`cart-${item.product.id}`} className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-text-primary uppercase truncate">{item.product.name}</div>
                        <div className="text-[9px] text-text-secondary font-semibold">₹{item.product.price} • {item.product.weight}</div>
                      </div>
                      
                      <div className="flex items-center border border-border-subtle bg-canvas-secondary rounded-xl overflow-hidden">
                        <button
                          onClick={() => onUpdateCartQuantity(item.product.id, item.quantity - 1)}
                          className="px-1.5 py-1 text-text-secondary hover:bg-canvas-primary cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-1 font-bold text-text-primary">{item.quantity}</span>
                        <button
                          onClick={(e) => {
                            const activeStock = item.product.stock[selectedVendorId] ?? 0;
                            if (item.quantity < activeStock) {
                              triggerAddToCartFlight(e, item.product);
                              onUpdateCartQuantity(item.product.id, item.quantity + 1);
                            }
                          }}
                          className="px-1.5 py-1 text-text-secondary hover:bg-canvas-primary disabled:opacity-40 cursor-pointer"
                          disabled={item.quantity >= (item.product.stock[selectedVendorId] ?? 0)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => onRemoveFromCart(item.product.id)}
                        className="text-text-secondary hover:text-alert-critical p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Open box visualization inside cart drawer */}
                <div className="border border-dashed border-accent-primary/45 bg-accent-primary/5 p-3.5 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex h-8 w-8 items-center justify-center bg-amber-50 border border-amber-200 text-amber-700 rounded-lg animate-pulse">
                    <svg className="w-5 h-5 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                      <polyline points="3.29 7 12 12 20.71 7"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[8px] font-black uppercase text-accent-primary tracking-widest block">AeroBox Opened</span>
                    <p className="text-[9.5px] text-text-secondary font-semibold leading-normal mt-0.5 truncate">
                      Box is open & receiving items...
                    </p>
                  </div>
                </div>

                {/* Checkout details input fields */}
                <div className="border-t border-border-subtle pt-3 space-y-3">
                  
                  {/* Location droppoint */}
                  <div>
                    <label className="block text-[8px] font-black uppercase tracking-wider text-text-secondary mb-1">
                      Delivery Droppoint
                    </label>
                    <input
                      type="text"
                      value={deliveryArea}
                      onChange={(e) => setDeliveryArea(e.target.value)}
                      className="w-full text-xs font-semibold bg-canvas-primary border border-border-subtle p-2 focus:outline-none focus:border-accent-primary rounded-xl"
                    />
                  </div>

                  {/* Online Payment vs COD choice */}
                  <div>
                    <label className="block text-[8px] font-black uppercase tracking-wider text-text-secondary mb-1">
                      Payment Option
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        onClick={() => setPaymentMethod("Online")}
                        className={`flex items-center justify-center gap-1.5 py-2 text-[9px] font-bold uppercase border rounded-xl cursor-pointer transition-all duration-150 ${
                          paymentMethod === "Online"
                            ? "border-accent-primary bg-accent-primary/5 text-accent-primary"
                            : "border-border-subtle bg-canvas-primary text-text-secondary hover:border-text-secondary"
                        }`}
                      >
                        <CreditCard className="h-3.5 w-3.5" /> Online
                      </button>
                      <button
                        onClick={() => setPaymentMethod("COD")}
                        className={`flex items-center justify-center gap-1.5 py-2 text-[9px] font-bold uppercase border rounded-xl cursor-pointer transition-all duration-150 ${
                          paymentMethod === "COD"
                            ? "border-accent-primary bg-accent-primary/5 text-accent-primary"
                            : "border-border-subtle bg-canvas-primary text-text-secondary hover:border-text-secondary"
                        }`}
                      >
                        <Landmark className="h-3.5 w-3.5" /> COD
                      </button>
                    </div>
                  </div>

                  {/* Amount details */}
                  <div className="space-y-1.5 text-[11px] font-semibold text-text-secondary pt-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-text-primary font-bold">₹{cartSubtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className="text-text-primary font-bold">₹{deliveryFee}</span>
                    </div>
                    <div className="border-t border-border-subtle pt-2 flex justify-between text-xs text-text-primary font-bold">
                      <span>Total Amount</span>
                      <span className="text-accent-primary font-black">₹{cartTotal}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onCheckout(paymentMethod, deliveryArea)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-accent-primary border border-accent-primary hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider py-3 mt-1.5 transition-colors cursor-pointer rounded-xl shadow-sm"
                >
                  Secure Checkout <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
