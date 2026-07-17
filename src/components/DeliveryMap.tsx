"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { Navigation, Compass, AlertCircle } from "lucide-react";
import { Rider } from "@/types";

interface DeliveryMapProps {
  vendorPos: [number, number];
  customerPos: [number, number];
  partnerPos: [number, number];
  orderId?: string;
  riderName?: string;
  orderStatus?: string;
  riders: Rider[];
}

// Setup Leaflet custom divIcons
const createDivIcon = (htmlContent: string, bgClass: string, extraClass: string = "") => {
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-9 h-9 border border-slate-200 ${bgClass} shadow-md rounded-xl ${extraClass}">${htmlContent}</div>`,
    className: "custom-leaflet-icon",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

export default function DeliveryMap({
  vendorPos,
  customerPos,
  partnerPos,
  orderId = "#882",
  riderName = "Vignesh S.",
  orderStatus = "Pending",
  riders = []
}: DeliveryMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-canvas-primary flex items-center justify-center text-text-secondary font-mono text-xs">
        INITIALIZING GEOSPATIAL MAP CORE...
      </div>
    );
  }

  // Centering midpoint
  const mapCenter: [number, number] = [
    (vendorPos[0] + customerPos[0]) / 2,
    (vendorPos[1] + customerPos[1]) / 2
  ];
  
  // Bounded corridor
  const bounds = L.latLngBounds(
    [12.9000, 80.0700], // South-West
    [13.0250, 80.1500]  // North-East
  );

  // SVG Icons
  const storeSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
      <path d="M2 7h20"/>
    </svg>
  `;

  const jigglingBoxSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <polyline points="3.29 7 12 12 20.71 7"/>
      <line x1="12" y1="22" x2="12" y2="12"/>
    </svg>
  `;

  const bikeSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H8.5C7.7 7 7 7.7 7 8.5v3.3c0 .8-.5 1.5-1.2 1.8l-2.4 1c-.8.3-1.4 1-1.4 1.9v.5c0 .6.4 1 1 1h2"/>
      <circle cx="6.5" cy="17.5" r="2.5"/>
      <circle cx="16.5" cy="17.5" r="2.5"/>
    </svg>
  `;

  const customerSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  `;

  const vendorIcon = createDivIcon(storeSVG, "bg-sidebar-bg text-white border-sidebar-bg");
  const boxIcon = createDivIcon(jigglingBoxSVG, "bg-amber-50 text-amber-700 border-amber-300", "jiggle-attention");
  const customerIcon = createDivIcon(customerSVG, "bg-canvas-secondary text-text-primary border-border-subtle");

  // Route lines
  const transitRoute: [number, number][] = [partnerPos, vendorPos]; 
  const deliveryRoute: [number, number][] = [vendorPos, customerPos]; 

  return (
    <div className="relative w-full h-full min-h-[480px]">
      
      <style>{`
        @keyframes jiggle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          15% { transform: scale(1.1) rotate(-6deg); }
          30% { transform: scale(1.1) rotate(5deg); }
          45% { transform: scale(1.1) rotate(-4deg); }
          60% { transform: scale(1.1) rotate(3deg); }
        }
        .jiggle-attention {
          animation: jiggle 1.3s ease-in-out infinite;
        }
      `}</style>
      
      <MapContainer
        key={`${vendorPos[0]}-${customerPos[0]}`}
        center={mapCenter}
        zoom={13}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        minZoom={11}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {orderStatus === "Dispatched" && (
          <>
            {/* Transit Route */}
            <Polyline
              positions={transitRoute}
              pathOptions={{
                color: "#64748B",
                weight: 2.5,
                dashArray: "6, 8",
                opacity: 0.7
              }}
            />
            {/* Active Delivery Route */}
            <Polyline
              positions={deliveryRoute}
              pathOptions={{
                color: "#F97316",
                weight: 4,
                opacity: 0.95
              }}
            />
          </>
        )}

        {/* Vendor Node */}
        <Marker position={vendorPos} icon={vendorIcon}>
          <Popup className="custom-popup">
            <div className="text-xs p-1 font-sans">
              <div className="font-bold text-text-primary uppercase">Merchant Depot</div>
              <div className="text-[10px] text-text-secondary mt-0.5">Corridor Node</div>
            </div>
          </Popup>
        </Marker>

        {/* Jiggling Box Marker (only show if pending pickup) */}
        {(orderStatus === "Pending" || orderStatus === "Accepted") && (
          <Marker position={[vendorPos[0] + 0.0006, vendorPos[1] + 0.0006]} icon={boxIcon}>
            <Popup className="custom-popup">
              <div className="text-xs p-1 font-sans">
                <div className="font-bold text-amber-700 uppercase tracking-tight">Broadcasting Depot</div>
                <div className="text-[10px] text-text-secondary mt-0.5">Awaiting Rider Accept...</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render all corridor riders in real time */}
        {riders.map((r) => {
          const isCurrent = r.name === riderName;
          const isRiderJiggling = orderStatus === "Accepted"; // Jiggle all riders during matching bid broadcast!
          const rIcon = createDivIcon(
            bikeSVG, 
            isCurrent ? "bg-accent-primary text-white border-accent-hover" : "bg-text-secondary text-white border-border-subtle",
            isRiderJiggling ? "jiggle-attention" : ""
          );

          return (
            <Marker key={r.id} position={r.coords} icon={rIcon}>
              <Popup className="custom-popup">
                <div className="text-xs p-1 font-sans">
                  <div className="font-bold text-text-primary uppercase">{r.name}</div>
                  <div className="text-[10px] text-text-secondary mt-0.5">{r.vehicle}</div>
                  <div className="text-[9px] mt-1 font-bold text-text-primary">
                    Status: <span className={r.status === "Idle" ? "text-green-600" : "text-amber-600"}>{r.status}</span>
                  </div>
                  {isRiderJiggling && (
                    <div className="text-[8.5px] text-accent-primary font-black uppercase tracking-wider animate-pulse mt-1">
                      Dispatch broadcast active...
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Customer Droppoint */}
        <Marker position={customerPos} icon={customerIcon}>
          <Popup className="custom-popup">
            <div className="text-xs p-1 font-sans">
              <div className="font-bold text-text-primary uppercase">Customer Droppoint</div>
              <div className="text-[10px] text-text-secondary mt-0.5">Delivery Destination Node</div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Floating telemetry panel */}
      <div className="absolute top-4 left-4 z-[1000] w-64 bg-canvas-secondary/95 backdrop-blur-md border border-border-subtle p-4 shadow-md rounded-2xl">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3 mb-3">
          <div className="flex h-7 w-7 items-center justify-center bg-accent-primary text-white rounded-lg">
            <Navigation className="h-3.5 w-3.5 animate-pulse" />
          </div>
          <div>
            <div className="text-[8px] font-bold text-text-secondary uppercase tracking-widest">Active Dispatch</div>
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-tight">Order {orderId}</h3>
          </div>
        </div>

        <div className="space-y-2 text-[10px] font-semibold text-text-secondary mb-4">
          <div className="flex justify-between">
            <span>Rider Status</span>
            <span className="text-accent-primary uppercase font-bold">
              {orderStatus === "Accepted" ? "Courier Matching" : orderStatus === "Dispatched" ? "En Route" : orderStatus}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Assign Partner</span>
            <span className="text-text-primary font-bold">{riderName}</span>
          </div>
          <div className="flex justify-between">
            <span>Corridor Link</span>
            <span className="text-text-primary font-bold">Tambaram Bounded</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 inline-flex items-center justify-center gap-1.5 bg-accent-primary hover:bg-accent-hover hover:shadow-[0_0_12px_rgba(249,115,22,0.4)] text-white font-bold text-[10px] uppercase tracking-wider py-2 rounded-xl transition-all cursor-pointer">
            <Compass className="h-3 w-3" /> Navigate
          </button>
          <button className="inline-flex items-center justify-center border border-border-subtle bg-canvas-secondary hover:bg-canvas-primary text-text-secondary p-2.5 rounded-xl transition-colors cursor-pointer">
            <AlertCircle className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
