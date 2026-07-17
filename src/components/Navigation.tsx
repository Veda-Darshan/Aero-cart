"use client";

import React from "react";
import { Store, ShoppingBag, Truck, Grid, LogOut } from "lucide-react";

interface NavigationProps {
  currentView: string;
  setView: (view: string) => void;
  cartCount: number;
  loggedRole: "none" | "customer" | "vendor" | "rider";
  onSignOut: () => void;
}

export default function Navigation({ currentView, setView, cartCount, loggedRole, onSignOut }: NavigationProps) {
  // If not logged in, hide navigation tabs
  const isLogged = loggedRole !== "none";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-canvas-secondary/95 backdrop-blur-md shrink-0">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setView("landing")}>
          {/* Trademark Logo: Packed box on wheels */}
          <div className="flex h-9 w-9 items-center justify-center bg-accent-primary text-white rounded-xl shadow-sm relative">
            <svg className="w-5.5 h-5.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            {/* Wheels at bottom */}
            <div className="absolute -bottom-1 left-1.5 w-2 h-2 bg-text-primary rounded-full border border-white" />
            <div className="absolute -bottom-1 right-1.5 w-2 h-2 bg-text-primary rounded-full border border-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-text-primary">
            AeroCart<span className="text-accent-primary font-bold text-xs ml-1.5 tracking-wider uppercase">Hyperlocal</span>
          </span>
        </div>

        {/* Navigation Items (Role Restricted) */}
        {isLogged && (
          <nav className="flex items-center gap-1 sm:gap-2">
            
            {/* 1. Overview (Visible to everyone) */}
            <button
              onClick={() => setView("landing")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-bold border-b-2 transition-all duration-150 uppercase tracking-wider cursor-pointer ${
                currentView === "landing"
                  ? "border-accent-primary text-accent-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:bg-canvas-primary"
              }`}
            >
              <Grid className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </button>
            
            {/* 2. Customer Section (Visible to Customer only) */}
            {loggedRole === "customer" && (
              <button
                onClick={() => setView("marketplace")}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-bold border-b-2 transition-all duration-150 uppercase tracking-wider cursor-pointer ${
                  currentView === "marketplace"
                    ? "border-accent-primary text-accent-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary hover:bg-canvas-primary"
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Marketplace</span>
                {cartCount > 0 && (
                  <span className="ml-1 flex h-4.5 w-4.5 items-center justify-center bg-accent-primary text-[10px] font-black text-white rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* 3. Vendor Suite (Visible to Vendor only) */}
            {loggedRole === "vendor" && (
              <button
                onClick={() => setView("vendor")}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-bold border-b-2 transition-all duration-150 uppercase tracking-wider cursor-pointer ${
                  currentView === "vendor"
                    ? "border-accent-primary text-accent-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary hover:bg-canvas-primary"
                }`}
              >
                <Store className="h-4 w-4" />
                <span>Vendor Hub</span>
              </button>
            )}

            {/* 4. Delivery Fleet (Visible to Rider only) */}
            {loggedRole === "rider" && (
              <button
                onClick={() => setView("delivery")}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-bold border-b-2 transition-all duration-150 uppercase tracking-wider cursor-pointer ${
                  currentView === "delivery"
                    ? "border-accent-primary text-accent-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary hover:bg-canvas-primary"
                }`}
              >
                <Truck className="h-4 w-4" />
                <span>Delivery Fleet</span>
              </button>
            )}

            {/* Logout/Sign Out Option */}
            <button
              onClick={onSignOut}
              title="Sign Out Session"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-border-subtle bg-canvas-primary hover:bg-red-50 hover:text-alert-critical text-text-secondary transition-colors rounded-xl cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Exit</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
