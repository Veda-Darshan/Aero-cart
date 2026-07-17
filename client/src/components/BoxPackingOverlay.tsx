"use client";

import React, { useEffect } from "react";
import { Sparkles } from "lucide-react";

interface BoxPackingOverlayProps {
  onComplete: () => void;
  message?: string;
}

export default function BoxPackingOverlay({ onComplete, message = "Packing Order..." }: BoxPackingOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1000); // 1.0 seconds flight lifecycle
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Micro items flying into the box
  const MilkCartonSVG = () => (
    <svg className="w-6 h-6 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M6 18V9l4-3 4 3v9Z" fill="#93C5FD" />
      <path d="M6 10h8" />
    </svg>
  );

  const AppleSVG = () => (
    <svg className="w-5 h-5 text-red-500 drop-shadow" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 5c.47 0 .9-.28 1.09-.71l1-2.22c.2-.44.75-.62 1.18-.42s.62.75.42 1.18l-1 2.22A1.996 1.996 0 0 1 13 6.09V7c1.66 0 3.32-.4 4.5-.8 1.13-.38 2.5.47 2.5 1.8v10c0 1.66-1.34 3-3 3h-10c-1.66 0-3-1.34-3-3V8c0-1.33 1.37-2.18 2.5-1.8 1.18.4 2.84.8 4.5.8Z" />
    </svg>
  );

  const CookieSVG = () => (
    <svg className="w-6 h-6 text-amber-500 drop-shadow" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="#F59E0B" />
      <circle cx="8" cy="9" r="1.2" fill="#78350F" />
      <circle cx="15" cy="8" r="0.8" fill="#78350F" />
      <circle cx="14" cy="14" r="1.2" fill="#78350F" />
    </svg>
  );

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-80 h-32 bg-canvas-secondary border-2 border-accent-primary p-4 shadow-xl rounded-2xl flex items-center gap-4 overflow-hidden pointer-events-auto animate-fade-in-up">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.2s ease-out forwards;
        }

        /* Snap box pack and fly across from Right to Left sidebar */
        @keyframes miniBoxPack {
          0% { transform: scale(0.3) rotate(0deg); opacity: 0; }
          15% { transform: scale(1.15) rotate(-5deg); opacity: 1; }
          30% { transform: scale(1.25) rotate(5deg); }
          48% { transform: scale(1.25) rotate(0deg); }
          /* Flights to left and slightly up (towards Left Sidebar Nav) */
          85% { transform: translate(-50vw, -30vh) scale(0.4) rotate(-20deg); opacity: 0.85; }
          100% { transform: translate(-68vw, -42vh) scale(0.05) rotate(-35deg); opacity: 0; }
        }

        /* Fast items flying into the box */
        @keyframes item1In {
          0% { transform: translate(-80px, -60px) scale(1); opacity: 0; }
          12% { opacity: 1; }
          32% { transform: translate(0, 0) scale(0.2); opacity: 0.5; }
          100% { transform: translate(0, 0) scale(0); opacity: 0; }
        }

        @keyframes item2In {
          0% { transform: translate(80px, -60px) scale(1); opacity: 0; }
          12% { opacity: 1; }
          32% { transform: translate(0, 0) scale(0.2); opacity: 0.5; }
          100% { transform: translate(0, 0) scale(0); opacity: 0; }
        }

        @keyframes item3In {
          0% { transform: translate(0, -90px) scale(1); opacity: 0; }
          15% { opacity: 1; }
          35% { transform: translate(0, 0) scale(0.2); opacity: 0.5; }
          100% { transform: translate(0, 0) scale(0); opacity: 0; }
        }

        /* Flaps and tape */
        @keyframes flapLeft {
          0%, 32% { transform: rotate(0deg); }
          48% { transform: rotate(-130deg); }
          100% { transform: rotate(-130deg); }
        }
        @keyframes flapRight {
          0%, 32% { transform: rotate(0deg); }
          48% { transform: rotate(130deg); }
          100% { transform: rotate(130deg); }
        }
        @keyframes tapeFill {
          0%, 48% { width: 0px; opacity: 0; }
          58% { width: 64px; opacity: 1; }
          100% { width: 64px; opacity: 1; }
        }

        .animate-snap-box {
          animation: miniBoxPack 1.25s cubic-bezier(0.175, 0.885, 0.32, 1.2) forwards;
        }
        .animate-item1 { animation: item1In 1.25s forwards; }
        .animate-item2 { animation: item2In 1.25s forwards; }
        .animate-item3 { animation: item3In 1.25s forwards; }
        .animate-flap-l { transform-origin: left bottom; animation: flapLeft 1.25s forwards; }
        .animate-flap-r { transform-origin: right bottom; animation: flapRight 1.25s forwards; }
        .animate-tape-f { animation: tapeFill 1.25s forwards; }
      `}</style>

      {/* Left side: The Animation Box */}
      <div className="relative w-24 h-24 shrink-0 bg-canvas-primary border border-border-subtle rounded-xl flex items-center justify-center overflow-hidden">
        
        {/* Flying items */}
        <div className="absolute animate-item1 z-20"><MilkCartonSVG /></div>
        <div className="absolute animate-item2 z-20"><AppleSVG /></div>
        <div className="absolute animate-item3 z-20"><CookieSVG /></div>

        {/* Box Container */}
        <div className="absolute animate-snap-box flex flex-col items-center">
          <div className="relative w-16 h-16 flex flex-col items-center">
            {/* Box main front body */}
            <div className="absolute bottom-1 w-14 h-10 bg-amber-700 border border-amber-800 shadow z-10 rounded-b">
              <div className="w-6 h-3.5 bg-white/10 rotate-[-5deg] mx-auto mt-2 flex items-center justify-center text-[4px] text-white/50 font-mono">
                AERO
              </div>
            </div>
            {/* Flaps */}
            <div className="absolute top-[8px] w-14 h-5 flex justify-between z-0">
              <div className="w-6 h-4 bg-amber-600 border border-amber-700 animate-flap-l" />
              <div className="w-6 h-4 bg-amber-600 border border-amber-700 animate-flap-r" />
            </div>
            {/* Sealing Tape */}
            <div className="absolute top-[22px] left-[4px] h-2 bg-red-600 z-30 animate-tape-f rounded-full" />
          </div>
        </div>
      </div>

      {/* Right side: Loading Info */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-1 text-[9px] font-bold text-accent-primary uppercase tracking-widest mb-1 animate-pulse">
          <Sparkles className="h-3 w-3" /> dispatch status
        </div>
        <h4 className="text-xs font-black uppercase text-text-primary truncate">{message}</h4>
        <p className="text-[10px] text-text-secondary font-semibold leading-none mt-1">Routing to Left Sidebar...</p>
      </div>

    </div>
  );
}
