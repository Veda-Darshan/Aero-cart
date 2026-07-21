"use client";

import React, { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import LandingView from "@/components/LandingView";
import MarketplaceView from "@/components/MarketplaceView";
import VendorHubView from "@/components/VendorHubView";
import DeliveryTrackerView from "@/components/DeliveryTrackerView";
import BoxPackingOverlay from "@/components/BoxPackingOverlay";
import { CheckCircle2, ShieldCheck, ArrowRight, X, Bell, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ProductVariant {
  name: string;
  stock: { [vendorId: number]: number };
}

export interface Product {
  id: number;
  name: string;
  weight: string;
  price: number;
  stock: { [vendorId: number]: number };
  variants?: ProductVariant[];
  category: string;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Rider {
  id: string;
  name: string;
  vehicle: string;
  coords: [number, number];
  status: "Idle" | "Delivering";
  earnings: number;
  deliveriesCount: number;
}

export interface Order {
  id: string;
  vendorId: number;
  vendorName: string;
  vendorAddress: string;
  items: CartItem[];
  total: number;
  status: "Pending" | "Accepted" | "Dispatched" | "Delivered";
  paymentMethod: "Online" | "COD";
  deliveryArea: string;
  assignedRider?: Rider;
}

export interface Feedback {
  id: string;
  orderId?: string;
  category: string;
  content: string;
  timestamp: string;
}

export interface Vendor {
  id: number;
  name: string;
  address: string;
  coords: [number, number];
}

// ─── Utility: derive delivery coords from area name ───────────────────────────
const getAreaCoords = (area: string): [number, number] => {
  const norm = area.toLowerCase();
  if (norm.includes("tambaram")) return [12.9320, 80.1220];
  if (norm.includes("kundrathur")) return [12.9810, 80.1010];
  return [12.9450, 80.1150];
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [currentView, setView] = useState("landing");
  const [loading, setLoading] = useState(true);

  // ── Live data — all from backend ──
  const [vendors,   setVendors]   = useState<Vendor[]>([]);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [riders,    setRiders]    = useState<Rider[]>([]);
  const [orders,    setOrders]    = useState<Order[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  const [selectedVendorId, setSelectedVendorId] = useState<number>(1);
  const [cart,  setCart]  = useState<CartItem[]>([]);
  const [loggedRole, setLoggedRole] = useState<"none" | "customer" | "vendor" | "rider">("none");

  // Toast / animations
  const [activeNotification, setActiveNotification] = useState<{
    message: string; orderId: string; actionType: "trace" | "info";
  } | null>(null);
  const [isBoxAnimating,    setIsBoxAnimating]    = useState(false);
  const [animationMessage,  setAnimationMessage]  = useState("Packing Order...");
  const [isCheckoutSuccessOpen, setIsCheckoutSuccessOpen] = useState(false);
  const [lastCheckoutDetails,   setLastCheckoutDetails]   = useState({ orderId: "", total: 0 });

  // Track prev dispatched orders for notification dedup
  const prevDispatchedRef = useRef<Set<string>>(new Set());

  // ── Bootstrap: load everything from backend ──────────────────────────────
  useEffect(() => {
    const boot = async () => {
      try {
        const [p, r, o, v, f] = await Promise.all([
          api.getProducts(),
          api.getRiders(),
          api.getOrders(),
          api.getVendors(),
          api.getFeedback(),
        ]);
        setInventory(p  || []);
        setRiders(r     || []);
        setOrders(o     || []);
        setVendors(v    || []);
        setFeedbacks(f  || []);
        if (v?.length) setSelectedVendorId(v[0].id);
        console.log("✅ Aero Cart connected to backend");
      } catch (err) {
        console.error("❌ Backend unreachable:", err);
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, []);

  // ── Poll backend every 4 seconds for live updates ────────────────────────
  useEffect(() => {
    if (loading) return;
    const poll = setInterval(async () => {
      try {
        const [p, r, o] = await Promise.all([
          api.getProducts(),
          api.getRiders(),
          api.getOrders(),
        ]);
        setInventory(p || []);
        setRiders(r   || []);
        setOrders(prev => {
          // Show notification when order moves to Dispatched
          (o || []).forEach((newO: Order) => {
            const old = prev.find(x => x.id === newO.id);
            if (
              newO.status === "Dispatched" &&
              old?.status !== "Dispatched" &&
              !prevDispatchedRef.current.has(newO.id)
            ) {
              prevDispatchedRef.current.add(newO.id);
              setActiveNotification({
                message: `🛵 Rider ${newO.assignedRider?.name} dispatched for order ${newO.id}!`,
                orderId: newO.id,
                actionType: "trace",
              });
            }
          });
          return o || prev;
        });
      } catch { /* keep showing last known state */ }
    }, 4000);
    return () => clearInterval(poll);
  }, [loading]);

  // ── Rider movement simulation (visual only) ───────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      const dispatched = orders.find(o => o.status === "Dispatched" && o.assignedRider);
      if (!dispatched || !dispatched.assignedRider) return;

      const rider     = dispatched.assignedRider;
      const target    = getAreaCoords(dispatched.deliveryArea);
      const curr      = rider.coords;
      const latDiff   = target[0] - curr[0];
      const lngDiff   = target[1] - curr[1];

      if (Math.abs(latDiff) < 0.0012 && Math.abs(lngDiff) < 0.0012) {
        // Auto-deliver when close enough
        handleDeliverOrder(dispatched.id);
        setActiveNotification({
          message: `✅ Order ${dispatched.id} delivered by ${rider.name}!`,
          orderId: dispatched.id,
          actionType: "info",
        });
      } else {
        const nextLat = curr[0] + latDiff * 0.20;
        const nextLng = curr[1] + lngDiff * 0.20;
        setRiders(prev => prev.map(r =>
          r.id === rider.id ? { ...r, coords: [nextLat, nextLng] } : r
        ));
        setOrders(prev => prev.map(o =>
          o.id === dispatched.id
            ? { ...o, assignedRider: { ...o.assignedRider!, coords: [nextLat, nextLng] } }
            : o
        ));
      }
    }, 4500);
    return () => clearInterval(timer);
  }, [orders, riders]);

  // ── Onboarding ────────────────────────────────────────────────────────────
  const handleRegisterUser = (_name: string, _phone: string, _landmark: string, _coords: [number, number]) => {
    setLoggedRole("customer");
    setView("marketplace");
  };

  const handleRegisterVendor = async (name: string, shopName: string, _phone: string, _categories: string[], coords: [number, number]) => {
    const newVendor = await api.createVendor({ name: shopName, address: `${shopName}, Chennai`, coords });
    setVendors(prev => [...prev, newVendor]);
    setInventory(await api.getProducts()); // backend added stock
    setSelectedVendorId(newVendor.id);
    setLoggedRole("vendor");
    setView("vendor");
  };

  const handleRegisterRider = async (_name: string, _phone: string, vehicle: string, activeHours: number, coords: [number, number]) => {
    const newRider = await api.createRider({
      name: _name, vehicle: `${vehicle} (${activeHours}h active)`,
      coords, status: "Idle", earnings: 0, deliveriesCount: 0,
    });
    setRiders(prev => [...prev, newRider]);
    setLoggedRole("rider");
    setView("delivery");
  };

  const handleSignOut = () => { setLoggedRole("none"); setView("landing"); };

  // ── Vendor Selection ──────────────────────────────────────────────────────
  const handleSelectVendor = (vendorId: number) => {
    if (cart.length > 0) {
      if (confirm("Changing vendors will clear your cart. Proceed?")) {
        setCart([]);
        setSelectedVendorId(vendorId);
      }
    } else {
      setSelectedVendorId(vendorId);
    }
  };

  // ── Cart ──────────────────────────────────────────────────────────────────
  const handleAddToCart = (productId: number) => {
    const product = inventory.find(p => p.id === productId);
    if (!product) return;
    const available = product.stock[selectedVendorId] || 0;
    if (available === 0) return;
    const existing = cart.find(i => i.product.id === productId);
    if (existing) {
      if (existing.quantity >= available) return;
      setCart(cart.map(i => i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setAnimationMessage("Item Added to Box!");
    setIsBoxAnimating(true);
  };

  const handleUpdateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) { setCart(cart.filter(i => i.product.id !== productId)); return; }
    const product = inventory.find(p => p.id === productId);
    if (!product) return;
    if (quantity > (product.stock[selectedVendorId] || 0)) return;
    setCart(cart.map(i => i.product.id === productId ? { ...i, quantity } : i));
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(cart.filter(i => i.product.id !== productId));
  };

  // ── Checkout → backend creates order, deducts stock ───────────────────────
  const handleCheckout = async (paymentMethod: "Online" | "COD", deliveryArea: string) => {
    const vendor   = vendors.find(v => v.id === selectedVendorId) || vendors[0];
    const subtotal = cart.reduce((t, i) => t + i.product.price * i.quantity, 0);
    const total    = subtotal + 25; // ₹25 delivery fee

    setAnimationMessage("Filing Dispatch Order...");
    setIsBoxAnimating(true);

    try {
      const newOrder = await api.createOrder({
        vendorId: selectedVendorId,
        vendorName: vendor.name,
        vendorAddress: vendor.address,
        items: cart,
        total,
        status: "Pending",
        paymentMethod,
        deliveryArea,
      });
      setOrders(prev => [newOrder, ...prev]);
      // Refresh inventory (stock deducted server-side)
      const fresh = await api.getProducts();
      setInventory(fresh);
      setLastCheckoutDetails({ orderId: newOrder.id, total });
      setCart([]);
      setTimeout(() => setIsCheckoutSuccessOpen(true), 1300);
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Checkout failed — please check backend connection.");
    }
  };

  // ── Vendor accepts → backend auto-dispatches nearest rider ───────────────
  const handleAcceptOrder = async (orderId: string) => {
    try {
      const updated = await api.updateOrder(orderId, { status: "Accepted" });
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      // Backend will auto-dispatch in 3s; polling picks it up
    } catch (err) {
      console.error("Accept order failed:", err);
    }
  };

  // ── Manual rider assignment (fallback) ────────────────────────────────────
  const handleAssignRider = async (orderId: string, riderId: string) => {
    const rider = riders.find(r => r.id === riderId);
    if (!rider) return;
    try {
      const [updatedOrder] = await Promise.all([
        api.updateOrder(orderId, { status: "Dispatched", assignedRider: rider }),
        api.updateRider(riderId, { status: "Delivering" }),
      ]);
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      setRiders(prev => prev.map(r => r.id === riderId ? { ...r, status: "Delivering" } : r));
      setActiveNotification({ message: `Rider ${rider.name} dispatched for order ${orderId}!`, orderId, actionType: "trace" });
    } catch (err) {
      console.error("Assign rider failed:", err);
    }
  };

  // ── Rider delivers → backend updates order + rider earnings ──────────────
  const handleDeliverOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order?.assignedRider) return;
    const riderId    = order.assignedRider.id;
    const rider      = riders.find(r => r.id === riderId);
    const newEarn    = (rider?.earnings || 0) + 50;
    const newCount   = (rider?.deliveriesCount || 0) + 1;
    try {
      await Promise.all([
        api.updateOrder(orderId, { status: "Delivered" }),
        api.updateRider(riderId, { status: "Idle", earnings: newEarn, deliveriesCount: newCount }),
      ]);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "Delivered" } : o));
      setRiders(prev => prev.map(r => r.id === riderId ? { ...r, status: "Idle", earnings: newEarn, deliveriesCount: newCount } : r));
    } catch { /* local state already updated above */ }
  };

  // ── Vendor inventory controls → backend ──────────────────────────────────
  const handleRestockProduct = async (productId: number, amount: number) => {
    const p = inventory.find(x => x.id === productId);
    if (!p) return;
    const newStock = { ...p.stock, [selectedVendorId]: (p.stock[selectedVendorId] || 0) + amount };
    setInventory(prev => prev.map(x => x.id === productId ? { ...x, stock: newStock } : x));
    try { await api.updateProduct(productId, { stock: newStock }); } catch {}
  };

  const handleDeleteProduct = async (productId: number) => {
    const p = inventory.find(x => x.id === productId);
    if (!p) return;
    const newStock = { ...p.stock, [selectedVendorId]: 0 };
    setInventory(prev => prev.map(x => x.id === productId ? { ...x, stock: newStock } : x));
    try { await api.updateProduct(productId, { stock: newStock }); } catch {}
  };

  const handleEditProduct = async (productId: number, newPrice: number) => {
    setInventory(prev => prev.map(x => x.id === productId ? { ...x, price: newPrice } : x));
    try { await api.updateProduct(productId, { price: newPrice }); } catch {}
  };

  // ── Feedback ──────────────────────────────────────────────────────────────
  const handleSubmitFeedback = async (category: string, content: string, orderId?: string) => {
    try {
      const fb = await api.createFeedback({
        category, content, orderId,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      setFeedbacks(prev => [fb, ...prev]);
    } catch { /* silently ignore */ }
  };

  const handleTraceClick = () => { setActiveNotification(null); setView("marketplace"); };
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-canvas-primary gap-4">
        <Loader2 className="h-10 w-10 text-accent-primary animate-spin" />
        <p className="text-text-secondary text-sm font-semibold uppercase tracking-widest">Connecting to Aero Cart...</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-canvas-primary font-sans antialiased selection:bg-accent-primary selection:text-white">
      <Navigation
        currentView={currentView}
        setView={setView}
        cartCount={cartCount}
        loggedRole={loggedRole}
        onSignOut={handleSignOut}
      />

      {/* Dispatch notification ribbon */}
      {activeNotification && (
        <div className="bg-sidebar-bg border-b border-accent-primary text-white py-3 px-4 sm:px-6 flex items-center justify-between text-xs font-bold uppercase tracking-wider z-50 shadow-md">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-accent-primary animate-bounce" />
            <span>{activeNotification.message}</span>
          </div>
          <div className="flex items-center gap-3">
            {activeNotification.actionType === "trace" && (
              <button
                onClick={handleTraceClick}
                className="bg-accent-primary hover:bg-accent-hover text-white px-3.5 py-1.5 rounded-lg border border-accent-primary text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_12px_rgba(249,115,22,0.4)]"
              >
                Trace Order Live
              </button>
            )}
            <button onClick={() => setActiveNotification(null)} className="text-text-secondary hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1">
        {currentView === "landing" && (
          <LandingView
            setView={setView}
            onRegisterUser={handleRegisterUser}
            onRegisterVendor={handleRegisterVendor}
            onRegisterRider={handleRegisterRider}
          />
        )}
        {currentView === "marketplace" && (
          <MarketplaceView
            inventory={inventory}
            cart={cart}
            vendors={vendors}
            selectedVendorId={selectedVendorId}
            onSelectVendor={handleSelectVendor}
            onAddToCart={handleAddToCart}
            onUpdateCartQuantity={handleUpdateCartQuantity}
            onRemoveFromCart={handleRemoveFromCart}
            onCheckout={handleCheckout}
            orders={orders}
            feedbacks={feedbacks}
            onSubmitFeedback={handleSubmitFeedback}
            setView={setView}
            riders={riders}
          />
        )}
        {currentView === "vendor" && (
          <VendorHubView
            inventory={inventory}
            selectedVendorId={selectedVendorId}
            vendors={vendors}
            orders={orders}
            riders={riders}
            onAcceptOrder={handleAcceptOrder}
            onAssignRider={handleAssignRider}
            onRestock={handleRestockProduct}
            onDelete={handleDeleteProduct}
            onEdit={handleEditProduct}
          />
        )}
        {currentView === "delivery" && (
          <DeliveryTrackerView
            orders={orders}
            riders={riders}
            onDeliverOrder={handleDeliverOrder}
          />
        )}
      </div>

      {isBoxAnimating && (
        <BoxPackingOverlay message={animationMessage} onComplete={() => setIsBoxAnimating(false)} />
      )}

      {isCheckoutSuccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-canvas-secondary border border-border-subtle p-8 shadow-sm text-center relative rounded-2xl">
            <button onClick={() => setIsCheckoutSuccessOpen(false)} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto flex h-12 w-12 items-center justify-center border border-accent-primary/20 bg-accent-primary/5 text-accent-primary mb-6 rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-2">Payment Authorized</h3>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-6">
              Order {lastCheckoutDetails.orderId} • Total Paid: ₹{lastCheckoutDetails.total}
            </p>
            <div className="border border-border-subtle bg-canvas-primary p-4 text-left text-xs font-medium text-text-secondary mb-6 leading-relaxed rounded-xl">
              <div className="flex items-center gap-1.5 text-text-primary font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="h-4 w-4 text-accent-primary animate-pulse" /> Dispatch Telemetry Active
              </div>
              Order received by Vendor Hub. Accept it there to trigger nearest-rider auto-dispatch!
            </div>
            <button
              onClick={() => { setIsCheckoutSuccessOpen(false); setView("vendor"); }}
              className="w-full inline-flex items-center justify-center gap-2 bg-text-primary border border-text-primary hover:bg-accent-primary hover:border-accent-primary hover:shadow-[0_0_12px_rgba(249,115,22,0.4)] text-white font-bold text-xs uppercase tracking-wider py-3 transition-colors cursor-pointer rounded-xl shadow-sm"
            >
              Go to Vendor Hub <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
