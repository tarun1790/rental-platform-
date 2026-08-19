'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
  totalListingsCount?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
}) => {
  return (
    <section 
      onClick={onExploreClick}
      className="relative w-full h-screen bg-black text-white flex flex-col justify-between items-center overflow-hidden select-none cursor-pointer group"
    >
      {/* 1. FULL-BLEED IMMERSIVE BACKGROUND: ONE BLACK HOUSE WITH GOLD LIGHTS INSIDE & BLACK WINDOWS */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=95"
          alt="HOME"
          className="w-full h-full object-cover object-center brightness-75 contrast-110 group-hover:scale-105 transition-transform duration-1000 ease-out"
        />

        {/* Golden Dusk Vignette & Subtle Lighting Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/70 pointer-events-none" />
      </div>

      {/* 2. TRANSPARENT ARCHITECTURAL HOME BLUEPRINT / WIREFRAME BACKSIDE */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25 z-10 flex items-center justify-center scale-105"
        aria-hidden="true"
      >
        <svg viewBox="0 0 1200 800" className="w-full h-full text-amber-400/80 stroke-current fill-none">
          {/* Outer Geometric Home Gable & Frame */}
          <polygon points="600,60 1100,320 100,320" strokeWidth="2.5" strokeDasharray="8 8" />
          <rect x="180" y="320" width="840" height="420" strokeWidth="2.5" strokeDasharray="8 8" />
          
          {/* Internal Structural Grid Lines */}
          <line x1="600" y1="60" x2="600" y2="320" strokeWidth="1.5" strokeDasharray="6 6" />
          <line x1="350" y1="190" x2="850" y2="190" strokeWidth="1.5" strokeDasharray="6 6" />
          <line x1="180" y1="520" x2="1020" y2="520" strokeWidth="1.5" strokeDasharray="6 6" />
          <line x1="520" y1="320" x2="520" y2="740" strokeWidth="1.5" strokeDasharray="6 6" />
          <line x1="780" y1="320" x2="780" y2="740" strokeWidth="1.5" strokeDasharray="6 6" />
          
          {/* Architectural Window CAD Wireframes */}
          <rect x="240" y="360" width="220" height="120" strokeWidth="1.5" />
          <rect x="580" y="360" width="160" height="120" strokeWidth="1.5" />
          <rect x="820" y="360" width="140" height="120" strokeWidth="1.5" />
          <rect x="240" y="560" width="220" height="140" strokeWidth="1.5" />
          <rect x="580" y="560" width="160" height="180" strokeWidth="1.5" />
          <rect x="820" y="560" width="140" height="140" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Top Spacer */}
      <div className="w-full pt-10 relative z-20" />

      {/* 3. CENTERPIECE: STRICTLY ONLY THE TEXT "HOME" IN THE MAIN IMAGE */}
      <div className="relative z-20 flex flex-col items-center justify-center my-auto px-4 text-center">
        <h1 className="text-7xl sm:text-9xl md:text-[11rem] lg:text-[13rem] font-black tracking-[0.22em] text-white/95 uppercase drop-shadow-[0_15px_45px_rgba(0,0,0,0.95)] leading-none select-none group-hover:tracking-[0.25em] transition-all duration-700">
          HOME
        </h1>
      </div>

      {/* 4. BOTTOM SCROLL ARROW INDICATOR */}
      <div className="relative z-20 pb-10 flex flex-col items-center justify-center transition-colors">
        <div className="w-11 h-11 rounded-full bg-black/80 border border-slate-700/90 flex items-center justify-center group-hover:border-amber-400 group-hover:bg-black transition-all animate-bounce shadow-2xl backdrop-blur-md">
          <ChevronDown className="w-5 h-5 text-amber-400" />
        </div>
      </div>
    </section>
  );
};
