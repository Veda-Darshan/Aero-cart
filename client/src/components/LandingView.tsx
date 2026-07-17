"use client";

import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Store, 
  Truck, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Play, 
  RefreshCw, 
  User, 
  Phone, 
  Compass, 
  MapPinIcon, 
  ChevronLeft, 
  Clock, 
  CheckSquare,
  KeyRound
} from "lucide-react";
import TrademarkLoader from "./TrademarkLoader";

interface LandingViewProps {
  setView: (view: string) => void;
  onRegisterUser: (name: string, phone: string, landmark: string, coords: [number, number]) => void;
  onRegisterVendor: (name: string, shopName: string, phone: string, categories: string[], coords: [number, number]) => void;
  onRegisterRider: (name: string, phone: string, vehicle: string, activeHours: number, coords: [number, number]) => void;
}

interface Particle {
  id: number;
  tx: number;
  ty: number;
  size: number;
}

// Pre-existing sandbox accounts
const PRESET_CUSTOMERS = [
  { name: "Vignesh K.", phone: "9840123456", landmark: "Tambaram West Crossing", coords: [12.9260, 80.1220] },
  { name: "Priya M.", phone: "9940123456", landmark: "Kundrathur Bus Stand", coords: [12.9750, 80.1080] }
];

const PRESET_VENDORS = [
  { name: "Ramesh K.", shopName: "Kundrathur Fresh Mart", phone: "9444123456", categories: ["Dairy", "Groceries"], coords: [12.9750, 80.1080] },
  { name: "Suresh S.", shopName: "Tambaram Central Hub", phone: "9555123456", categories: ["Dairy", "Snacks", "Drinks"], coords: [12.9260, 80.1220] }
];

const PRESET_RIDERS = [
  { name: "Aswin K.", phone: "9844512345", vehicle: "Scooter", hours: 8, coords: [12.9420, 80.1110] },
  { name: "Rajesh V.", phone: "9855512345", vehicle: "Electric Scooter", hours: 6, coords: [12.9690, 80.0990] }
];

export default function LandingView({ 
  setView, 
  onRegisterUser, 
  onRegisterVendor, 
  onRegisterRider 
}: LandingViewProps) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [animState, setAnimState] = useState<"welcome" | "exploding" | "animating" | "portal">("welcome");
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Onboarding role sub-view
  const [onboardRole, setOnboardRole] = useState<"none" | "customer" | "vendor" | "rider">("none");
  const [loginTab, setLoginTab] = useState<"register" | "login">("register");

  // Onboarding fields state
  const [coords, setCoords] = useState<[number, number]>([12.9750, 80.1080]);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "fetching" | "success" | "error">("idle");

  // User form states
  const [uName, setUName] = useState("");
  const [uPhone, setUPhone] = useState("");
  const [uLandmark, setULandmark] = useState("");

  // Vendor form states
  const [vName, setVName] = useState("");
  const [vShopName, setVShopName] = useState("");
  const [vPhone, setVPhone] = useState("");
  const [vCategories, setVCategories] = useState<string[]>(["Dairy", "Groceries"]);

  // Rider form states
  const [rName, setRName] = useState("");
  const [rPhone, setRPhone] = useState("");
  const [rVehicle, setRVehicle] = useState("Scooter");
  const [rHours, setRHours] = useState(8);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 8;
      const y = (e.clientY / innerHeight - 0.5) * 8;
      setMouseOffset({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const detectGPSLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsStatus("fetching");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords([latitude, longitude]);
        setGpsStatus("success");
      },
      (error) => {
        console.error(error);
        setCoords([12.9260, 80.1220]); // Fallback Tambaram coordinates
        setGpsStatus("success"); 
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const startDeliverySequence = () => {
    setAnimState("exploding");

    const newParticles = Array.from({ length: 14 }).map((_, i) => {
      const angle = (i * 2 * Math.PI) / 14 + (Math.random() - 0.5) * 0.2;
      const distance = 80 + Math.random() * 50;
      return {
        id: i,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        size: 4 + Math.random() * 4
      };
    });
    setParticles(newParticles);

    setTimeout(() => {
      setAnimState("animating");
    }, 250);

    setTimeout(() => {
      setAnimState("portal");
    }, 1500); 
  };

  const toggleCategory = (cat: string) => {
    if (vCategories.includes(cat)) {
      setVCategories(vCategories.filter(c => c !== cat));
    } else {
      setVCategories([...vCategories, cat]);
    }
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uName || !uPhone || !uLandmark) {
      alert("Please fill all required customer fields.");
      return;
    }
    onRegisterUser(uName, uPhone, uLandmark, coords);
  };

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName || !vShopName || !vPhone) {
      alert("Please fill all required vendor fields.");
      return;
    }
    if (vCategories.length === 0) {
      alert("Please select at least one shop category.");
      return;
    }
    onRegisterVendor(vName, vShopName, vPhone, vCategories, coords);
  };

  const handleRiderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rName || !rPhone) {
      alert("Please fill all required delivery partner fields.");
      return;
    }
    onRegisterRider(rName, rPhone, rVehicle, rHours, coords);
  };

  // Populate presets
  const handleSelectPresetCustomer = (idx: number) => {
    const p = PRESET_CUSTOMERS[idx];
    onRegisterUser(p.name, p.phone, p.landmark, p.coords as [number, number]);
  };

  const handleSelectPresetVendor = (idx: number) => {
    const p = PRESET_VENDORS[idx];
    onRegisterVendor(p.name, p.shopName, p.phone, p.categories, p.coords as [number, number]);
  };

  const handleSelectPresetRider = (idx: number) => {
    const p = PRESET_RIDERS[idx];
    onRegisterRider(p.name, p.phone, p.vehicle, p.hours, p.coords as [number, number]);
  };

  // Custom Vector Symbols
  const CustomerSymbol = () => (
    <svg className="w-14 h-14 text-accent-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" fill="rgba(249,115,22,0.15)" />
      <path d="M6 21a6 6 0 0 1 12 0" />
      <rect x="8" y="13" width="8" height="5" rx="1" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );

  const VendorSymbol = () => (
    <svg className="w-14 h-14 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9h18" fill="rgba(15,23,42,0.1)" />
      <path d="M9 22V12h6v10" />
      <path d="M3 9l3-6h12l3 6M4 22h16" />
      <path d="m6 9 1.5-3M18 9l-1.5-3" />
    </svg>
  );

  const RiderHelmetSymbol = () => (
    <svg className="w-14 h-14 text-accent-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a9 9 0 0 0-9 9v2c0 .6.4 1 1 1h16c.6 0 1-.4 1-1v-2a9 9 0 0 0-9-9Z" fill="rgba(249,115,22,0.15)" />
      <path d="M4 11h16v1.5H4z" fill="#0F172A" />
      <rect x="8" y="16" width="8" height="5" rx="0.5" fill="#D97706" stroke="#B45309" strokeWidth="1" />
      <line x1="12" y1="16" x2="12" y2="21" stroke="#FFFFFF" strokeWidth="1" />
    </svg>
  );

  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full overflow-hidden bg-canvas-primary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <style>{`
        @keyframes slowScrollBg {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .scrolling-bg {
          background-image: url('/shopping_complex.jpg');
          background-size: 140% 140%;
          animation: slowScrollBg 110s ease-in-out infinite;
        }
        @keyframes particleFly {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        .particle {
          animation: particleFly 0.35s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
        @keyframes revealPortals {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-reveal {
          animation: revealPortals 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Parallax background */}
      <div 
        className="absolute inset-0 z-0 scrolling-bg pointer-events-none opacity-25"
        style={{
          transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
        }}
      />
      <div className="absolute inset-0 z-0 bg-canvas-primary/65 pointer-events-none" />

      {/* Core UI Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[500px]">
        
        {/* welcome state */}
        {animState === "welcome" && (
          <div className="text-center max-w-2xl space-y-8 animate-reveal">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-border-subtle bg-canvas-secondary text-text-secondary text-[10px] font-bold uppercase tracking-wider rounded-lg">
              <MapPin className="h-3.5 w-3.5 text-accent-primary animate-pulse" /> Tambaram to Kundrathur Corridor - 5km radius
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-text-primary leading-tight uppercase">
              AeroCart <br />
              <span className="text-accent-primary">Hyperlocal Deliveries</span>
            </h1>
            
            <p className="text-sm text-text-secondary font-medium leading-relaxed">
              Experience the visual mechanics of a live instant-routing system. Press start to dispatch a local rider along the corridor map.
            </p>
            
            <div className="pt-4 flex justify-center">
              <button
                onClick={startDeliverySequence}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-accent-primary border border-accent-primary hover:bg-accent-hover hover:border-accent-hover hover:shadow-[0_0_12px_rgba(249,115,22,0.45)] text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-200 shadow-md group cursor-pointer"
              >
                <Play className="h-4 w-4 fill-white" /> Start Onboarding Portals
              </button>
            </div>
          </div>
        )}

        {/* button exploding particles */}
        {animState === "exploding" && (
          <div className="relative w-20 h-20 flex items-center justify-center">
            {particles.map((p) => (
              <span
                key={p.id}
                className="absolute rounded-full bg-accent-primary particle"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  ["--tx" as any]: `${p.tx}px`,
                  ["--ty" as any]: `${p.ty}px`
                }}
              />
            ))}
          </div>
        )}

        {/* trademark loading animation view */}
        {animState === "animating" && (
          <TrademarkLoader message="Dispatching Onboarding Dashboard..." isLooping={false} />
        )}

        {/* portal selection menu */}
        {animState === "portal" && (
          <div className="w-full max-w-4xl space-y-12 animate-reveal">
            
            {onboardRole === "none" ? (
              <>
                <div className="text-center max-w-2xl mx-auto space-y-4">
                  <h2 className="text-2xl font-bold uppercase tracking-tight text-text-primary">
                    Hyperlocal Onboarding Portals
                  </h2>
                  <p className="text-xs text-text-secondary font-semibold leading-relaxed">
                    Select your portal role below to register details and start dispatching along the corridor.
                  </p>
                </div>

                {/* Three Portal Choice Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Card 1: User Onboarding */}
                  <div 
                    onClick={() => { setOnboardRole("customer"); setLoginTab("register"); detectGPSLocation(); }}
                    className="group border border-border-subtle bg-canvas-secondary p-6 cursor-pointer rounded-2xl transition-all duration-200 hover:border-accent-primary hover:shadow-[0_0_24px_rgba(249,115,22,0.06)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-32 w-full bg-slate-50 border border-border-subtle rounded-xl mb-4 relative flex items-center justify-center group-hover:bg-accent-primary/5 transition-colors">
                        <CustomerSymbol />
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary mb-2 flex items-center gap-2">
                        <ShoppingBag className="h-4.5 w-4.5 text-accent-primary" /> Customer Portal
                      </h3>
                      <p className="text-[11px] text-text-secondary font-semibold leading-relaxed mb-6">
                        Enter the hyperlocal marketplace to browse fresh items, add to cart, and track dispatches live.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-primary flex items-center gap-1 group-hover:text-accent-primary transition-colors">
                      Customer Sign In <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>

                  {/* Card 2: Vendor Onboarding */}
                  <div 
                    onClick={() => { setOnboardRole("vendor"); setLoginTab("register"); detectGPSLocation(); }}
                    className="group border border-border-subtle bg-canvas-secondary p-6 cursor-pointer rounded-2xl transition-all duration-200 hover:border-accent-primary hover:shadow-[0_0_24px_rgba(249,115,22,0.06)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-32 w-full bg-slate-50 border border-border-subtle rounded-xl mb-4 relative flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                        <VendorSymbol />
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary mb-2 flex items-center gap-2">
                        <Store className="h-4.5 w-4.5 text-accent-primary" /> Vendor Suite
                      </h3>
                      <p className="text-[11px] text-text-secondary font-semibold leading-relaxed mb-6">
                        Access merchant inventories, edit stock catalog price levels, and inspect analytics curves.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-primary flex items-center gap-1 group-hover:text-accent-primary transition-colors">
                      Merchant Sign In <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>

                  {/* Card 3: Delivery Partner Onboarding */}
                  <div 
                    onClick={() => { setOnboardRole("rider"); setLoginTab("register"); detectGPSLocation(); }}
                    className="group border border-border-subtle bg-canvas-secondary p-6 cursor-pointer rounded-2xl transition-all duration-200 hover:border-accent-primary hover:shadow-[0_0_24px_rgba(249,115,22,0.06)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-32 w-full bg-slate-50 border border-border-subtle rounded-xl mb-4 relative flex items-center justify-center group-hover:bg-accent-primary/5 transition-colors">
                        <RiderHelmetSymbol />
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary mb-2 flex items-center gap-2">
                        <Truck className="h-4.5 w-4.5 text-accent-primary" /> Delivery Fleet
                      </h3>
                      <p className="text-[11px] text-text-secondary font-semibold leading-relaxed mb-6">
                        Register vehicle class, simulate coordinates tracking, and track delivered earnings commission.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-primary flex items-center gap-1 group-hover:text-accent-primary transition-colors">
                      Rider Sign In <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>

                </div>
              </>
            ) : (
              /* ONBOARDING REGISTRATION SIGN-IN FORMS */
              <div className="max-w-xl mx-auto border border-border-subtle bg-canvas-secondary p-8 rounded-2xl shadow-lg animate-reveal">
                
                {/* Form header */}
                <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
                  <button 
                    onClick={() => setOnboardRole("none")} 
                    className="inline-flex items-center gap-1 text-xs font-bold text-text-secondary hover:text-text-primary uppercase tracking-widest cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" /> Portals choice
                  </button>
                  <span className="text-[9px] font-mono text-accent-primary font-black uppercase tracking-wider bg-accent-primary/5 px-3 py-1 rounded-lg">
                    {onboardRole}
                  </span>
                </div>

                {/* Login Tabs: Register New vs Existing presets */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <button
                    onClick={() => setLoginTab("register")}
                    className={`py-2 text-xs font-bold uppercase tracking-wider border rounded-xl transition-all cursor-pointer ${
                      loginTab === "register"
                        ? "border-accent-primary bg-accent-primary text-white"
                        : "border-border-subtle bg-canvas-primary text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    New Sign-Up
                  </button>
                  <button
                    onClick={() => setLoginTab("login")}
                    className={`py-2 text-xs font-bold uppercase tracking-wider border rounded-xl transition-all cursor-pointer ${
                      loginTab === "login"
                        ? "border-accent-primary bg-accent-primary text-white"
                        : "border-border-subtle bg-canvas-primary text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Existing Login
                  </button>
                </div>

                {/* Role A: Customer Portal */}
                {onboardRole === "customer" && (
                  loginTab === "register" ? (
                    <form onSubmit={handleCustomerSubmit} className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-text-secondary mb-1">Customer Name *</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary"><User className="h-4 w-4" /></span>
                            <input type="text" required placeholder="e.g. Vignesh" value={uName} onChange={(e) => setUName(e.target.value)} className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 bg-canvas-primary border border-border-subtle rounded-xl focus:outline-none focus:border-accent-primary" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-text-secondary mb-1">Phone Number *</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary"><Phone className="h-4 w-4" /></span>
                            <input type="tel" required placeholder="e.g. 9840123456" value={uPhone} onChange={(e) => setUPhone(e.target.value)} className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 bg-canvas-primary border border-border-subtle rounded-xl focus:outline-none focus:border-accent-primary" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-text-secondary mb-1">Landmark Address Sector *</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary"><MapPinIcon className="h-4 w-4" /></span>
                            <input type="text" required placeholder="e.g. Tambaram West Railway Crossing" value={uLandmark} onChange={(e) => setULandmark(e.target.value)} className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 bg-canvas-primary border border-border-subtle rounded-xl focus:outline-none focus:border-accent-primary" />
                          </div>
                        </div>

                        <div className="p-4 bg-canvas-primary border border-border-subtle rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary uppercase">
                            <span>Detected GPS Coordinates</span>
                            <span className={gpsStatus === "success" ? "text-green-600" : "text-amber-600"}>
                              {gpsStatus === "success" ? "GPS Active" : "Detecting..."}
                            </span>
                          </div>
                          <div className="text-xs font-mono font-bold text-text-primary">
                            Lat: {coords[0].toFixed(5)} • Lng: {coords[1].toFixed(5)}
                          </div>
                          <button type="button" onClick={detectGPSLocation} className="w-full py-2 border border-border-subtle bg-canvas-secondary hover:bg-canvas-primary text-[9px] font-black uppercase tracking-widest rounded-lg cursor-pointer">
                            Detect Browser GPS Coordinates
                          </button>
                        </div>
                      </div>

                      <button type="submit" className="w-full bg-accent-primary hover:bg-accent-hover hover:shadow-[0_0_12px_rgba(249,115,22,0.45)] text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-all cursor-pointer shadow-md mt-4">
                        Register & Enter Marketplace
                      </button>
                    </form>
                  ) : (
                    /* Existing Login presets list */
                    <div className="space-y-4">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        Choose Preconfigured Customer Profile
                      </label>
                      <div className="space-y-3">
                        {PRESET_CUSTOMERS.map((cust, idx) => (
                          <button
                            key={`preset-cust-${idx}`}
                            onClick={() => handleSelectPresetCustomer(idx)}
                            className="w-full text-left p-4 border border-border-subtle bg-canvas-primary hover:border-accent-primary rounded-xl cursor-pointer transition-all flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-text-primary uppercase">{cust.name}</div>
                              <div className="text-[10px] text-text-secondary font-medium mt-1">
                                {cust.landmark} • {cust.phone}
                              </div>
                            </div>
                            <KeyRound className="h-4 w-4 text-accent-primary/60" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )}

                {/* Role B: Vendor Portal */}
                {onboardRole === "vendor" && (
                  loginTab === "register" ? (
                    <form onSubmit={handleVendorSubmit} className="space-y-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-text-secondary mb-1">Merchant Name *</label>
                            <input type="text" required placeholder="e.g. Ramesh K." value={vName} onChange={(e) => setVName(e.target.value)} className="w-full text-xs font-semibold px-4 py-2.5 bg-canvas-primary border border-border-subtle rounded-xl focus:outline-none focus:border-accent-primary" />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-text-secondary mb-1">Shop Name *</label>
                            <input type="text" required placeholder="e.g. Kundrathur Fresh Store" value={vShopName} onChange={(e) => setVShopName(e.target.value)} className="w-full text-xs font-semibold px-4 py-2.5 bg-canvas-primary border border-border-subtle rounded-xl focus:outline-none focus:border-accent-primary" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-text-secondary mb-1">Phone Number *</label>
                          <input type="tel" required placeholder="e.g. 9444123456" value={vPhone} onChange={(e) => setVPhone(e.target.value)} className="w-full text-xs font-semibold px-4 py-2.5 bg-canvas-primary border border-border-subtle rounded-xl focus:outline-none focus:border-accent-primary" />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-text-secondary mb-2">Shop Inventory Categories *</label>
                          <div className="grid grid-cols-3 gap-2.5">
                            {["Dairy", "Groceries", "Snacks", "Drinks", "Bakery"].map(cat => {
                              const isChecked = vCategories.includes(cat);
                              return (
                                <button
                                  key={`cat-cb-${cat}`}
                                  type="button"
                                  onClick={() => toggleCategory(cat)}
                                  className={`flex items-center justify-center gap-1.5 py-2 border rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                    isChecked 
                                      ? "border-accent-primary bg-accent-primary/5 text-accent-primary"
                                      : "border-border-subtle bg-canvas-primary text-text-secondary"
                                  }`}
                                >
                                  <CheckSquare className={`h-3 w-3 ${isChecked ? "text-accent-primary" : "text-text-secondary/40"}`} />
                                  {cat}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="p-4 bg-canvas-primary border border-border-subtle rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary uppercase">
                            <span>Detected Shop GPS Node</span>
                            <span className={gpsStatus === "success" ? "text-green-600" : "text-amber-600"}>
                              {gpsStatus === "success" ? "GPS Active" : "Detecting..."}
                            </span>
                          </div>
                          <div className="text-xs font-mono font-bold text-text-primary">
                            Lat: {coords[0].toFixed(5)} • Lng: {coords[1].toFixed(5)}
                          </div>
                          <button type="button" onClick={detectGPSLocation} className="w-full py-2 border border-border-subtle bg-canvas-secondary hover:bg-canvas-primary text-[9px] font-black uppercase tracking-widest rounded-lg cursor-pointer">
                            Detect Shop GPS Location
                          </button>
                        </div>
                      </div>

                      <button type="submit" className="w-full bg-accent-primary hover:bg-accent-hover hover:shadow-[0_0_12px_rgba(249,115,22,0.45)] text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-all cursor-pointer shadow-md mt-4">
                        Register & Launch Vendor Suite
                      </button>
                    </form>
                  ) : (
                    /* Existing Vendors lists */
                    <div className="space-y-4">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        Choose Preconfigured Merchant Profile
                      </label>
                      <div className="space-y-3">
                        {PRESET_VENDORS.map((vendor, idx) => (
                          <button
                            key={`preset-vendor-${idx}`}
                            onClick={() => handleSelectPresetVendor(idx)}
                            className="w-full text-left p-4 border border-border-subtle bg-canvas-primary hover:border-accent-primary rounded-xl cursor-pointer transition-all flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-text-primary uppercase">{vendor.shopName}</div>
                              <div className="text-[10px] text-text-secondary font-medium mt-1">
                                Merchant: {vendor.name} • {vendor.phone}
                              </div>
                            </div>
                            <KeyRound className="h-4 w-4 text-accent-primary/60" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )}

                {/* Role C: Rider Portal */}
                {onboardRole === "rider" && (
                  loginTab === "register" ? (
                    <form onSubmit={handleRiderSubmit} className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-text-secondary mb-1">Rider Name *</label>
                          <input type="text" required placeholder="e.g. Rahul M." value={rName} onChange={(e) => setRName(e.target.value)} className="w-full text-xs font-semibold px-4 py-2.5 bg-canvas-primary border border-border-subtle rounded-xl focus:outline-none focus:border-accent-primary" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-text-secondary mb-1">Vehicle Type *</label>
                            <select value={rVehicle} onChange={(e) => setRVehicle(e.target.value)} className="w-full text-xs font-bold bg-canvas-primary border border-border-subtle px-3 py-2.5 focus:outline-none focus:border-accent-primary rounded-xl">
                              <option>Scooter</option>
                              <option>Electric Scooter</option>
                              <option>Motorcycle</option>
                              <option>Bicycle</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-text-secondary mb-1">Active Hours Daily *</label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary"><Clock className="h-4 w-4" /></span>
                              <input type="number" required min={1} max={24} value={rHours} onChange={(e) => setRHours(Number(e.target.value))} className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 bg-canvas-primary border border-border-subtle rounded-xl focus:outline-none focus:border-accent-primary" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-text-secondary mb-1">Phone Number *</label>
                          <input type="tel" required placeholder="e.g. 9844512345" value={rPhone} onChange={(e) => setRPhone(e.target.value)} className="w-full text-xs font-semibold px-4 py-2.5 bg-canvas-primary border border-border-subtle rounded-xl focus:outline-none focus:border-accent-primary" />
                        </div>

                        <div className="p-4 bg-canvas-primary border border-border-subtle rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary uppercase">
                            <span>Detected Courier GPS Coordinates</span>
                            <span className={gpsStatus === "success" ? "text-green-600" : "text-amber-600"}>
                              {gpsStatus === "success" ? "GPS Active" : "Detecting..."}
                            </span>
                          </div>
                          <div className="text-xs font-mono font-bold text-text-primary">
                            Lat: {coords[0].toFixed(5)} • Lng: {coords[1].toFixed(5)}
                          </div>
                          <button type="button" onClick={detectGPSLocation} className="w-full py-2 border border-border-subtle bg-canvas-secondary hover:bg-canvas-primary text-[9px] font-black uppercase tracking-widest rounded-lg cursor-pointer">
                            Detect Current Coordinates
                          </button>
                        </div>
                      </div>

                      <button type="submit" className="w-full bg-accent-primary hover:bg-accent-hover hover:shadow-[0_0_12px_rgba(249,115,22,0.45)] text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-all cursor-pointer shadow-md mt-4">
                        Register & Enter Dispatch Fleet
                      </button>
                    </form>
                  ) : (
                    /* Existing Riders lists */
                    <div className="space-y-4">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        Choose Preconfigured Courier Profile
                      </label>
                      <div className="space-y-3">
                        {PRESET_RIDERS.map((rider, idx) => (
                          <button
                            key={`preset-rider-${idx}`}
                            onClick={() => handleSelectPresetRider(idx)}
                            className="w-full text-left p-4 border border-border-subtle bg-canvas-primary hover:border-accent-primary rounded-xl cursor-pointer transition-all flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-text-primary uppercase">{rider.name}</div>
                              <div className="text-[10px] text-text-secondary font-medium mt-1">
                                Vehicle: {rider.vehicle} • {rider.phone} • {rider.hours}h active
                              </div>
                            </div>
                            <KeyRound className="h-4 w-4 text-accent-primary/60" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )}

              </div>
            )}

            <div className="pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent-primary" /> Session active & synchronized
              </div>
              <button 
                onClick={() => { setOnboardRole("none"); setAnimState("welcome"); }}
                className="inline-flex items-center gap-1.5 hover:text-accent-primary transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Replay Dispatch Sequence
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
