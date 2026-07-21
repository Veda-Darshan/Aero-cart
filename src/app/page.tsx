"use client";

import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import LandingView from "@/components/LandingView";
import MarketplaceView from "@/components/MarketplaceView";
import VendorHubView from "@/components/VendorHubView";
import DeliveryTrackerView from "@/components/DeliveryTrackerView";
import BoxPackingOverlay from "@/components/BoxPackingOverlay";
import { CheckCircle2, ShieldCheck, ArrowRight, X, Compass, Bell } from "lucide-react";
import { api } from "@/lib/api";

export interface ProductVariant {
  name: string;
  stock: { [vendorId: number]: number };
}

export interface Product {
  id: number;
  name: string;
  weight: string;
  price: number;
  stock: { [vendorId: number]: number }; // total aggregated stock
  variants?: ProductVariant[]; // detailed sizing variants
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

const INITIAL_VENDORS: Vendor[] = [
  {
    id: 1,
    name: "Kundrathur Fresh Mart",
    address: "Node #8A, Kundrathur High Road, Chennai",
    coords: [12.9750, 80.1080]
  },
  {
    id: 2,
    name: "Tambaram Central Hub",
    address: "Node #4B, Shanmugam Road, West Tambaram, Chennai",
    coords: [12.9260, 80.1220]
  }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Amul Fresh Toned Milk",
    weight: "1 Litre / 500 ml",
    price: 66,
    stock: { 1: 6, 2: 28 },
    variants: [
      { name: "1 Litre Pack", stock: { 1: 2, 2: 18 } },
      { name: "500 ml Pack", stock: { 1: 4, 2: 10 } }
    ],
    category: "Dairy",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    name: "Aavin Green Magic Milk",
    weight: "500 ml",
    price: 24,
    stock: { 1: 15, 2: 25 },
    category: "Dairy",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    name: "Farm Fresh Country Eggs",
    weight: "6 / 12 Units",
    price: 54,
    stock: { 1: 4, 2: 0 },
    variants: [
      { name: "6 Pack Cardboard", stock: { 1: 3, 2: 0 } },
      { name: "12 Pack Premium", stock: { 1: 1, 2: 0 } }
    ],
    category: "Dairy",
    image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: 4,
    name: "Ooty Carrots Organic",
    weight: "500 g",
    price: 45,
    stock: { 1: 22, 2: 12 },
    category: "Groceries",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: 5,
    name: "Premium Basmati Rice",
    weight: "1 kg",
    price: 110,
    stock: { 1: 1, 2: 10 },
    category: "Groceries",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: 6,
    name: "Britannia Bourbon Biscuits",
    weight: "150 g",
    price: 20,
    stock: { 1: 40, 2: 30 },
    category: "Snacks",
    image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: 7,
    name: "Lay's Magic Masala Chips",
    weight: "50 g",
    price: 20,
    stock: { 1: 8, 2: 14 },
    category: "Snacks",
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: 8,
    name: "Kanan Devan Tea Powder",
    weight: "250 g",
    price: 95,
    stock: { 1: 12, 2: 6 },
    category: "Groceries",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: 9,
    name: "Heritage Fresh Paneer Pack",
    weight: "200 g",
    price: 85,
    stock: { 1: 3, 2: 8 },
    category: "Dairy",
    image: "https://images.unsplash.com/photo-1634482326227-ec17f7f28689?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: 10,
    name: "Fresh Gala Apples",
    weight: "4 Units",
    price: 180,
    stock: { 1: 15, 2: 10 },
    category: "Groceries",
    image: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400&auto=format&fit=crop&q=80"
  }
];

const INITIAL_RIDERS: Rider[] = [
  {
    id: "RIDER-1",
    name: "Vignesh S.",
    vehicle: "Scooter (Vibrant Coral)",
    coords: [12.9550, 80.1150],
    status: "Delivering", // active order ORD-103
    earnings: 350,
    deliveriesCount: 7
  },
  {
    id: "RIDER-2",
    name: "Rahul M.",
    vehicle: "Electric Scooter",
    coords: [12.9420, 80.1110],
    status: "Idle",
    earnings: 890,
    deliveriesCount: 18
  },
  {
    id: "RIDER-3",
    name: "Aswin K.",
    vehicle: "Motorcycle",
    coords: [12.9690, 80.0990],
    status: "Idle",
    earnings: 150,
    deliveriesCount: 3
  }
];

const getAreaCoords = (area: string): [number, number] => {
  const norm = area.toLowerCase();
  if (norm.includes("tambaram")) return [12.9320, 80.1220];
  if (norm.includes("kundrathur")) return [12.9810, 80.1010];
  return [12.9450, 80.1150];
};

const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-101",
    vendorId: 1,
    vendorName: "Kundrathur Fresh Mart",
    vendorAddress: "Node #8A, Kundrathur High Road, Chennai",
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 2
      },
      {
        product: INITIAL_PRODUCTS[7],
        quantity: 1
      }
    ],
    total: 252,
    status: "Pending",
    paymentMethod: "COD",
    deliveryArea: "Tambaram West Sector 3"
  },
  {
    id: "ORD-102",
    vendorId: 2,
    vendorName: "Tambaram Central Hub",
    vendorAddress: "Node #4B, Shanmugam Road, West Tambaram, Chennai",
    items: [
      {
        product: INITIAL_PRODUCTS[1],
        quantity: 1
      },
      {
        product: INITIAL_PRODUCTS[5],
        quantity: 2
      }
    ],
    total: 89,
    status: "Accepted",
    paymentMethod: "Online",
    deliveryArea: "Kundrathur Sector 1"
  },
  {
    id: "ORD-103",
    vendorId: 1,
    vendorName: "Kundrathur Fresh Mart",
    vendorAddress: "Node #8A, Kundrathur High Road, Chennai",
    items: [
      {
        product: INITIAL_PRODUCTS[8],
        quantity: 1
      },
      {
        product: INITIAL_PRODUCTS[3],
        quantity: 1
      }
    ],
    total: 155,
    status: "Dispatched",
    paymentMethod: "Online",
    deliveryArea: "Tambaram East Sector 4",
    assignedRider: INITIAL_RIDERS[0]
  }
];

export default function Home() {
  const [currentView, setView] = useState("landing");
  
  // Shared States
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [selectedVendorId, setSelectedVendorId] = useState<number>(1);
  const [inventory, setInventory] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [riders, setRiders] = useState<Rider[]>(INITIAL_RIDERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [backendOnline, setBackendOnline] = useState(false);

  const [loggedRole, setLoggedRole] = useState<"none" | "customer" | "vendor" | "rider">("none");

  // Bootstrap: load live data from backend (fallback to mock on failure)
  useEffect(() => {
    const load = async () => {
      try {
        const [p, r, o, v, f] = await Promise.all([
          api.getProducts(),
          api.getRiders(),
          api.getOrders(),
          api.getVendors(),
          api.getFeedback(),
        ]);
        if (p?.length) setInventory(p);
        if (r?.length) setRiders(r);
        if (o?.length) setOrders(o);
        if (v?.length) setVendors(v);
        if (f?.length) setFeedbacks(f);
        setBackendOnline(true);
        console.log("✅ Connected to backend at", process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080");
      } catch {
        console.warn("⚠️ Backend offline — running with mock data");
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!backendOnline) return;

    const interval = window.setInterval(async () => {
      try {
        const [p, r, o, v, f] = await Promise.all([
          api.getProducts(),
          api.getRiders(),
          api.getOrders(),
          api.getVendors(),
          api.getFeedback(),
        ]);
        if (p?.length) setInventory(p);
        if (r?.length) setRiders(r);
        if (o?.length) setOrders(o);
        if (v?.length) setVendors(v);
        if (f?.length) setFeedbacks(f);
      } catch {
        // keep the current UI state if the backend briefly pauses
      }
    }, 4000);

    return () => window.clearInterval(interval);
  }, [backendOnline]);

  // Onboarding Registry Handlers
  const handleRegisterUser = (name: string, phone: string, landmark: string, coords: [number, number]) => {
    console.log("Registered Customer:", { name, phone, landmark, coords });
    setLoggedRole("customer");
    setView("marketplace");
  };

  const handleRegisterVendor = async (name: string, shopName: string, phone: string, categories: string[], coords: [number, number]) => {
    const newVendorId = vendors.length + 1;
    const newVendor: Vendor = {
      id: newVendorId,
      name: shopName,
      address: `Node #${newVendorId}A, ${shopName} Sector, Chennai`,
      coords
    };

    setVendors(prev => [...prev, newVendor]);
    setInventory(current => current.map(p => ({
      ...p,
      stock: { ...p.stock, [newVendorId]: Math.floor(10 + Math.random() * 20) }
    })));
    setSelectedVendorId(newVendorId);
    setLoggedRole("vendor");
    setView("vendor");
    if (backendOnline) {
      try { await api.createVendor(newVendor); } catch {}
    }
  };

  const handleRegisterRider = async (name: string, phone: string, vehicle: string, activeHours: number, coords: [number, number]) => {
    const newRider: Rider = {
      id: `RIDER-${riders.length + 1}`,
      name,
      vehicle: `${vehicle} (${activeHours}h active)`,
      coords,
      status: "Idle",
      earnings: 0,
      deliveriesCount: 0
    };
    setRiders(prev => [...prev, newRider]);
    setLoggedRole("rider");
    setView("delivery");
    if (backendOnline) {
      try { await api.createRider(newRider); } catch {}
    }
  };

  const handleSignOut = () => {
    setLoggedRole("none");
    setView("landing");
  };
  
  // Real-time toast alert state
  const [activeNotification, setActiveNotification] = useState<{
    message: string;
    orderId: string;
    actionType: "trace" | "info";
  } | null>(null);

  // Animation overlay States
  const [isBoxAnimating, setIsBoxAnimating] = useState(false);
  const [animationMessage, setAnimationMessage] = useState("Packing Order...");

  // Modal Dialog States
  const [isCheckoutSuccessOpen, setIsCheckoutSuccessOpen] = useState(false);
  const [lastCheckoutDetails, setLastCheckoutDetails] = useState({ orderId: "", total: 0 });

  // 1. Live location coordinate increment simulation
  useEffect(() => {
    const timer = setInterval(() => {
      // Find the first active dispatched order
      const activeDispatched = orders.find(o => o.status === "Dispatched");
      if (!activeDispatched || !activeDispatched.assignedRider) return;

      const rider = activeDispatched.assignedRider;
      const targetCoords = getAreaCoords(activeDispatched.deliveryArea);
      const currCoords = rider.coords;

      const latDiff = targetCoords[0] - currCoords[0];
      const lngDiff = targetCoords[1] - currCoords[1];

      // If rider is close enough, auto-deliver it!
      if (Math.abs(latDiff) < 0.0012 && Math.abs(lngDiff) < 0.0012) {
        handleDeliverOrder(activeDispatched.id);
        setActiveNotification({
          message: `Order ${activeDispatched.id} has been delivered successfully by ${rider.name}!`,
          orderId: activeDispatched.id,
          actionType: "info"
        });
      } else {
        // Step coords closer (20% distance progress per tick)
        const nextLat = currCoords[0] + latDiff * 0.20;
        const nextLng = currCoords[1] + lngDiff * 0.20;

        // Update rider database
        setRiders(prevRiders => prevRiders.map(r => 
          r.id === rider.id ? { ...r, coords: [nextLat, nextLng] } : r
        ));

        // Update rider coords inside orders mapping
        setOrders(prevOrders => prevOrders.map(o => 
          o.id === activeDispatched.id 
            ? { ...o, assignedRider: { ...o.assignedRider!, coords: [nextLat, nextLng] } }
            : o
        ));
      }
    }, 4500); // ticks every 4.5 seconds

    return () => clearInterval(timer);
  }, [orders, riders]);

  // 2. Vendor Selection Handler
  const handleSelectVendor = (vendorId: number) => {
    if (cart.length > 0) {
      if (confirm("Changing vendors will clear your current cart. Proceed?")) {
        setCart([]);
        setSelectedVendorId(vendorId);
      }
    } else {
      setSelectedVendorId(vendorId);
    }
  };

  // 3. Add to Cart Handler
  const handleAddToCart = (productId: number) => {
    const product = inventory.find((p) => p.id === productId);
    if (!product) return;
    
    const availableStock = product.stock[selectedVendorId] || 0;
    if (availableStock === 0) return;

    const existing = cart.find((item) => item.product.id === productId);
    if (existing) {
      if (existing.quantity >= availableStock) return;
      setCart(
        cart.map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }

    setAnimationMessage("Item Added to Box!");
    setIsBoxAnimating(true);
  };

  // 4. Update Cart Quantity
  const handleUpdateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.product.id !== productId));
      return;
    }

    const product = inventory.find((p) => p.id === productId);
    if (!product) return;
    
    const availableStock = product.stock[selectedVendorId] || 0;
    if (quantity > availableStock) return;

    setCart(
      cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // 5. Remove from Cart
  const handleRemoveFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  // 6. Checkout handler
  const handleCheckout = async (paymentMethod: "Online" | "COD", deliveryArea: string) => {
    const activeVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];
    const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    const deliveryFee = 25;
    const finalTotal = subtotal + deliveryFee;
    const generatedOrderId = `ORD-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: Order = {
      id: generatedOrderId,
      vendorId: selectedVendorId,
      vendorName: activeVendor.name,
      vendorAddress: activeVendor.address,
      items: [...cart],
      total: finalTotal,
      status: "Pending",
      paymentMethod,
      deliveryArea
    };

    // Deduct stock in global inventory including variants if present
    const updatedInventory = inventory.map((product) => {
      const cartItem = cart.find((item) => item.product.id === product.id);
      if (cartItem) {
        const currentStock = product.stock[selectedVendorId] || 0;
        
        // Deduct variant stock too if variant list exists
        let updatedVariants = product.variants;
        if (product.variants) {
          updatedVariants = product.variants.map((v, idx) => {
            // Deduct from the first variant to keep mock simple
            if (idx === 0) {
              const vStock = v.stock[selectedVendorId] || 0;
              return {
                ...v,
                stock: { ...v.stock, [selectedVendorId]: Math.max(0, vStock - cartItem.quantity) }
              };
            }
            return v;
          });
        }

        return {
          ...product,
          stock: {
            ...product.stock,
            [selectedVendorId]: Math.max(0, currentStock - cartItem.quantity)
          },
          variants: updatedVariants
        };
      }
      return product;
    });

    setInventory(updatedInventory);
    setOrders([newOrder, ...orders]);
    setLastCheckoutDetails({ orderId: generatedOrderId, total: finalTotal });
    setCart([]);
    setAnimationMessage("Filing Dispatch Order...");
    setIsBoxAnimating(true);
    // Sync to backend
    if (backendOnline) {
      try { await api.createOrder(newOrder); } catch {}
    }
    setTimeout(() => {
      setIsCheckoutSuccessOpen(true);
    }, 1300);
  };

  // 7. Auto-assignment Dispatch Broadcast pipeline
  const handleAcceptOrder = (orderId: string) => {
    setOrders(prevOrders => prevOrders.map(order =>
      order.id === orderId ? { ...order, status: "Accepted" } : order
    ));
    if (backendOnline) api.updateOrder(orderId, { status: "Accepted" }).catch(() => {});

    setTimeout(() => {
      setOrders(currentOrders => {
        const order = currentOrders.find(o => o.id === orderId);
        if (!order || order.status !== "Accepted") return currentOrders;
        const idleRider = riders.find(r => r.status === "Idle");
        if (idleRider) {
          setRiders(prevRiders => prevRiders.map(r =>
            r.id === idleRider.id ? { ...r, status: "Delivering" } : r
          ));
          if (backendOnline) {
            api.updateRider(idleRider.id, { status: "Delivering" }).catch(() => {});
            api.updateOrder(orderId, { status: "Dispatched", assignedRider: idleRider }).catch(() => {});
          }
          setActiveNotification({
            message: `Rider ${idleRider.name} is on the way for accepted order ${orderId}!`,
            orderId,
            actionType: "trace"
          });
          return currentOrders.map(o =>
            o.id === orderId ? { ...o, status: "Dispatched", assignedRider: idleRider } : o
          );
        }
        return currentOrders;
      });
    }, 4000);
  };

  // Manual fallback assignment
  const handleAssignRider = (orderId: string, riderId: string) => {
    const rider = riders.find(r => r.id === riderId);
    if (!rider) return;

    setRiders(riders.map(r => 
      r.id === riderId ? { ...r, status: "Delivering" } : r
    ));

    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: "Dispatched", assignedRider: rider } : order
    ));

    setActiveNotification({
      message: `Rider ${rider.name} dispatched for order ${orderId}!`,
      orderId,
      actionType: "trace"
    });
  };

  // 8. Deliver order completion handler
  const handleDeliverOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.assignedRider) return;
    const riderId = order.assignedRider.id;
    const updatedRider = riders.find(r => r.id === riderId);
    const newEarnings = (updatedRider?.earnings || 0) + 50;
    const newCount = (updatedRider?.deliveriesCount || 0) + 1;
    setRiders(riders.map(r =>
      r.id === riderId ? { ...r, status: "Idle", earnings: newEarnings, deliveriesCount: newCount } : r
    ));
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: "Delivered" } : o));
    if (backendOnline) {
      api.updateOrder(orderId, { status: "Delivered" }).catch(() => {});
      api.updateRider(riderId, { status: "Idle", earnings: newEarnings, deliveriesCount: newCount }).catch(() => {});
    }
  };

  // 9. Feedback ticket
  const handleSubmitFeedback = async (category: string, content: string, orderId?: string) => {
    const newFeedback: Feedback = {
      id: `FB-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId,
      category,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setFeedbacks([newFeedback, ...feedbacks]);
    if (backendOnline) {
      try { await api.createFeedback(newFeedback); } catch {}
    }
  };

  // 10. Catalog inventory adjustments
  const handleRestockProduct = (productId: number, amount: number) => {
    setInventory(inventory.map(p => {
      if (p.id === productId) {
        const currentVal = p.stock[selectedVendorId] || 0;
        
        // Increase variant stock too
        let updatedVariants = p.variants;
        if (p.variants) {
          updatedVariants = p.variants.map((v, idx) => {
            if (idx === 0) {
              const vStock = v.stock[selectedVendorId] || 0;
              return { ...v, stock: { ...v.stock, [selectedVendorId]: vStock + amount } };
            }
            return v;
          });
        }

        return {
          ...p,
          stock: {
            ...p.stock,
            [selectedVendorId]: currentVal + amount
          },
          variants: updatedVariants
        };
      }
      return p;
    }));
  };

  const handleDeleteProduct = (productId: number) => {
    setInventory(inventory.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          stock: { ...p.stock, [selectedVendorId]: 0 }
        };
      }
      return p;
    }));
  };

  const handleEditProduct = (productId: number, newPrice: number) => {
    setInventory(inventory.map(p => 
      p.id === productId ? { ...p, price: newPrice } : p
    ));
  };

  // Navigate to tracker view from notification toast
  const handleTraceClick = () => {
    setActiveNotification(null);
    setView("marketplace");
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen bg-canvas-primary font-sans antialiased selection:bg-accent-primary selection:text-white">
      {/* Top Navigation bar */}
      <Navigation 
        currentView={currentView} 
        setView={setView} 
        cartCount={cartCount} 
        loggedRole={loggedRole}
        onSignOut={handleSignOut}
      />

      {/* Real-time Order Accepted Toast Notification Ribbon */}
      {activeNotification && (
        <div className="bg-sidebar-bg border-b border-accent-primary text-white py-3 px-4 sm:px-6 flex items-center justify-between text-xs font-bold uppercase tracking-wider z-50 transition-all shadow-md">
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
            <button 
              onClick={() => setActiveNotification(null)}
              className="text-text-secondary hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Content views selector */}
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

      {/* non-intrusive bottom-right packing animation */}
      {isBoxAnimating && (
        <BoxPackingOverlay 
          message={animationMessage}
          onComplete={() => setIsBoxAnimating(false)} 
        />
      )}

      {/* Success Modal */}
      {isCheckoutSuccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-canvas-secondary border border-border-subtle p-8 shadow-sm text-center relative rounded-2xl">
            <button
              onClick={() => setIsCheckoutSuccessOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto flex h-12 w-12 items-center justify-center border border-accent-primary/20 bg-accent-primary/5 text-accent-primary mb-6 rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <h3 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-2">
              Payment Authorized
            </h3>
            
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-6">
              Order {lastCheckoutDetails.orderId} • Total Paid: ₹{lastCheckoutDetails.total}
            </p>

            <div className="border border-border-subtle bg-canvas-primary p-4 text-left text-xs font-medium text-text-secondary mb-6 leading-relaxed rounded-xl">
              <div className="flex items-center gap-1.5 text-text-primary font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="h-4 w-4 text-accent-primary animate-pulse" /> Dispatch Telemetry Bounded
              </div>
              The order is placed. The **Vendor Hub** queue has received it. Switch to the Vendor Hub to accept it and witness the autodispatch bidding broadcast!
            </div>

            <button
              onClick={() => { setIsCheckoutSuccessOpen(false); setView("marketplace"); }}
              className="w-full inline-flex items-center justify-center gap-2 bg-text-primary border border-text-primary hover:bg-accent-primary hover:border-accent-primary hover:shadow-[0_0_12px_rgba(249,115,22,0.4)] text-white font-bold text-xs uppercase tracking-wider py-3 transition-colors cursor-pointer rounded-xl shadow-sm"
            >
              Track Live Dispatch <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
