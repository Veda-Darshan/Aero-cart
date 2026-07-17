"use client";

import React from "react";

// Highly detailed custom SVG representing a friendly Scooter Delivery Boy facing right
const ScooterBoySVG = () => (
  <svg className="w-20 h-20 filter drop-shadow-sm" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Rear Wheel (Left) */}
    <circle cx="25" cy="80" r="10" fill="#1E293B" stroke="#E2E8F0" strokeWidth="2" />
    <circle cx="25" cy="80" r="4" fill="#64748B" />
    
    {/* Front Wheel (Right) */}
    <circle cx="75" cy="80" r="10" fill="#1E293B" stroke="#E2E8F0" strokeWidth="2" />
    <circle cx="75" cy="80" r="4" fill="#64748B" />

    {/* Scooter Deck and Rear Shield */}
    <rect x="25" y="72" width="45" height="6" fill="#F97316" rx="3" />
    <path d="M15 80 C15 65, 33 63, 35 80" fill="#F97316" />

    {/* Front steering column and headlight shield */}
    <path d="M72 80 L62 46 L68 43 L76 75 Z" fill="#F97316" />
    <path d="M60 46 C60 38, 70 38, 70 46 Z" fill="#F97316" />
    
    {/* Headlight beam */}
    <circle cx="68" cy="42" r="3" fill="#FFFFFF" />
    <path d="M68 42 L88 39 L88 47 Z" fill="#FFE0B2" opacity="0.35" />

    {/* Handlebars */}
    <rect x="57" y="40" width="9" height="3" fill="#0F172A" rx="1" />
    
    {/* Carrier Rack behind rider for holding order box */}
    <rect x="16" y="52" width="18" height="4" fill="#475569" rx="1" />
    <line x1="21" y1="56" x2="21" y2="72" stroke="#475569" strokeWidth="2" />
    <line x1="29" y1="56" x2="29" y2="72" stroke="#475569" strokeWidth="2" />

    {/* Delivery Boy character */}
    {/* Torso / Jacket */}
    <path d="M38 66 C38 50, 50 48, 52 48 L58 42" stroke="#0F172A" strokeWidth="7.5" strokeLinecap="round" />
    {/* Arms holding handlebars */}
    <path d="M46 54 L57 43" stroke="#F97316" strokeWidth="4.5" strokeLinecap="round" />
    <circle cx="57" cy="42" r="3" fill="#FDBA74" />

    {/* Neck and Face */}
    <rect x="44" y="36" width="4" height="6" fill="#FDBA74" />
    <circle cx="46" cy="32" r="7" fill="#FDBA74" />
    
    {/* Cute profile details */}
    <circle cx="49" cy="31" r="1" fill="#1E293B" />
    <path d="M48 35 C48 37, 50 37, 50 35" stroke="#1E293B" strokeWidth="1" strokeLinecap="round" fill="none" />

    {/* Safety Helmet (Midnight Navy with Vibrant Coral visor) */}
    <path d="M37 30 C37 18, 55 18, 55 30 Z" fill="#0F172A" />
    <rect x="36" y="28" width="20" height="3" fill="#0F172A" rx="1" />
    <path d="M47 28 C53 28, 55 32, 53 34 Z" fill="#F97316" />
  </svg>
);

const BoxSVG = () => (
  <svg className="w-7 h-7 text-amber-700" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9l9-4 9 4v8l-9 4-9-4z" />
    <path d="M12 5v16" stroke="#92400e" strokeWidth="1" />
    <path d="M3 9l9 4 9-4" stroke="#92400e" strokeWidth="1" fill="none" />
  </svg>
);

interface TrademarkLoaderProps {
  message?: string;
  isLooping?: boolean;
}

export default function TrademarkLoader({ message = "LOADING COURIER CORRIDOR...", isLooping = true }: TrademarkLoaderProps) {
  const iterationType = isLooping ? "infinite" : "forwards";

  return (
    <div className="flex flex-col items-center justify-center p-8 w-full max-w-sm mx-auto bg-canvas-secondary/90 backdrop-blur-md border border-border-subtle rounded-2xl shadow-md relative overflow-hidden h-[180px]">
      <style>{`
        /* Minimal height flight path: Snappy 1.25s timeline */
        @keyframes miniPackageFlight {
          0% { transform: translateY(20px) scale(0.3); opacity: 0; }
          10% { opacity: 1; }
          30% { transform: translateY(-40px) scale(1); }
          45% { transform: translateY(-40px) scale(1); }
          50% { transform: translateY(-8px) scale(0.85); opacity: 1; }
          54% { transform: translateY(-8px) scale(0.85); opacity: 0; } /* Land and hand-off */
          100% { transform: translateY(-8px) scale(0.85); opacity: 0; }
        }

        /* Snappy scooter sequence: Left-to-Right in 1.25s */
        @keyframes miniRiderSequence {
          0% { transform: translateX(-180px); }
          30% { transform: translateX(0px); } /* Halt center */
          44% { transform: translateX(0px) scaleY(1); }
          48% { transform: translateX(0px) scaleY(0.92); } /* Catch Squash */
          52% { transform: translateX(0px) scaleY(1.05); } /* Rebound Bounce */
          56% { transform: translateX(0px) scaleY(1); }
          65% { transform: translateX(0px); } /* Brief pause */
          100% { transform: translateX(200px); } /* Speed off right */
        }

        /* Box rack connection */
        @keyframes miniBoxOnRack {
          0%, 48% { opacity: 0; transform: scale(0.2); }
          50% { opacity: 1; transform: scale(1.1); }
          54% { opacity: 1; transform: scale(1); }
          100% { opacity: 1; transform: scale(1); }
        }

        .animate-mini-package {
          animation: miniPackageFlight 1.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${iterationType};
        }

        .animate-mini-rider {
          animation: miniRiderSequence 1.25s cubic-bezier(0.25, 0.8, 0.25, 1) ${iterationType};
        }

        .animate-mini-rack-box {
          animation: miniBoxOnRack 1.25s ease-out ${iterationType};
        }
      `}</style>

      {/* Grid overlay */}
      <div className="absolute inset-x-0 top-0 h-[100px] bg-canvas-primary flex items-center justify-center border-b border-dashed border-border-subtle">
        <span className="text-[8px] font-mono text-text-secondary/20 tracking-widest uppercase">
          AeroCart Telemetry Link
        </span>
      </div>

      {/* Flying package */}
      <div className="absolute top-[82px] z-20 animate-mini-package">
        <BoxSVG />
      </div>

      {/* Rider scooter boy */}
      <div className="absolute bottom-[8px] z-10 animate-mini-rider flex flex-col items-center">
        {/* Attached cargo rack box */}
        <div className="absolute -top-4 left-1 z-20 animate-mini-rack-box">
          <svg className="w-5.5 h-5.5 text-amber-700" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9l9-4 9 4v8l-9 4-9-4z" />
            <path d="M12 5v16" stroke="#92400e" strokeWidth="1" />
          </svg>
        </div>
        <ScooterBoySVG />
      </div>

      {/* Status details */}
      <div className="absolute bottom-2 text-center w-full">
        <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest animate-pulse">
          {message}
        </span>
      </div>
    </div>
  );
}
