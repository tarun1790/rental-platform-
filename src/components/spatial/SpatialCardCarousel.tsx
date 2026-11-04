'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShikaakPropertyListing } from '../../types/property';
import { 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Bed, 
  Bath, 
  Square, 
  ShieldCheck, 
  MapPin, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import { formatCurrency } from '../../lib/roi-engine';

interface SpatialCardCarouselProps {
  listings: ShikaakPropertyListing[];
  onSelectListing: (listing: ShikaakPropertyListing) => void;
  onOpenDetail: (listing: ShikaakPropertyListing) => void;
}

export const SpatialCardCarousel: React.FC<SpatialCardCarouselProps> = ({
  listings,
  onSelectListing,
  onOpenDetail,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = listings.length;

  // Clamp index within bounds
  const navigateTo = useCallback(
    (index: number) => {
      if (total === 0) return;
      const newIndex = Math.max(0, Math.min(total - 1, index));
      setActiveIndex(newIndex);
      onSelectListing(listings[newIndex]);
    },
    [total, listings, onSelectListing]
  );

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        navigateTo(activeIndex - 1);
      } else if (e.key === 'ArrowRight') {
        navigateTo(activeIndex + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, navigateTo]);

  // Touch and Mouse drag handlers with inertia
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setDragOffset(0);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    setDragOffset(diff);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset > 70) {
      navigateTo(activeIndex - 1);
    } else if (dragOffset < -70) {
      navigateTo(activeIndex + 1);
    }
    setDragOffset(0);
  };

  if (!listings || listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400">
        <Sparkles className="w-10 h-10 text-cyan-400 animate-pulse mb-3" />
        <p className="text-sm font-mono tracking-wider">NO RESIDENCES IN SPATIAL BUFFER</p>
      </div>
    );
  }

  // Render cards in a window of 9 around the active card
  const visibleRange = 4;
  const startIndex = Math.max(0, activeIndex - visibleRange);
  const endIndex = Math.min(total - 1, activeIndex + visibleRange);

  const visibleListings = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleListings.push({ index: i, listing: listings[i] });
  }

  const currentListing = listings[activeIndex] || listings[0];

  return (
    <div className="relative w-full h-[640px] sm:h-[680px] lg:h-[720px] flex flex-col items-center justify-center overflow-hidden select-none">
      
      {/* 3D Perspective Scene Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full h-[520px] flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{
          perspective: '1300px',
          perspectiveOrigin: '50% 48%',
        }}
      >
        {visibleListings.map(({ index, listing }) => {
          const offset = index - activeIndex + dragOffset / 280;
          const absOffset = Math.abs(offset);

          // Spatial 3D transform mathematics (Cover Flow)
          const rotateY = offset * -26;
          const translateX = offset * 290;
          const translateZ = -absOffset * 150;
          const scale = Math.max(0.72, 1 - absOffset * 0.12);
          const opacity = Math.max(0.18, 1 - absOffset * 0.28);
          const zIndex = 30 - Math.round(absOffset * 5);
          const isCenter = index === activeIndex;

          const portal = (listing.sourcePortal || 'MLS_FEED').toUpperCase();
          const portalColor =
            portal === 'ZILLOW'
              ? 'bg-blue-600/90 text-white border-blue-400/50'
              : portal === 'REDFIN'
              ? 'bg-red-600/90 text-white border-red-400/50'
              : portal === 'HOTPADS'
              ? 'bg-amber-600/90 text-white border-amber-400/50'
              : portal === 'APARTMENTS_COM'
              ? 'bg-emerald-600/90 text-white border-emerald-400/50'
              : portal === 'REALTOR'
              ? 'bg-sky-700/90 text-white border-sky-400/50'
              : 'bg-purple-600/90 text-white border-purple-400/50';

          const rentOrPrice =
            listing.listingStatus === 'FOR_RENT'
              ? `${formatCurrency(listing.financials?.inputs?.monthlyGrossRent || 2800)}/mo`
              : formatCurrency(listing.financials?.inputs?.purchasePrice || 685000);

          return (
            <div
              key={listing.id}
              onClick={() => {
                if (!isCenter) navigateTo(index);
              }}
              className="absolute w-[300px] sm:w-[350px] lg:w-[380px] h-[480px] rounded-3xl transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden shadow-2xl group"
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                zIndex,
                background: 'rgba(12, 12, 22, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: isCenter
                  ? '2px solid rgba(0, 240, 255, 0.65)'
                  : '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: isCenter
                  ? '0 25px 60px -15px rgba(0, 240, 255, 0.35), 0 0 30px rgba(0, 240, 255, 0.2)'
                  : '0 20px 40px -10px rgba(0, 0, 0, 0.7)',
              }}
            >
              {/* Card Header & Media */}
              <div className="relative w-full h-[240px] overflow-hidden bg-slate-900 shrink-0">
                <img
                  src={
                    listing.media?.featuredImage ||
                    'https://photos.zillowstatic.com/fp/848f6a9144d553a02d967df41e3ccb9d-p_e.jpg'
                  }
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c16] via-transparent to-black/40" />

                {/* Top Badge: Portal Source */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-md ${portalColor}`}
                  >
                    {portal.replace(/_/g, ' ')}
                  </span>
                  {listing.isLiveCrawled && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 backdrop-blur-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>

                {/* Top Right: Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-black/60 text-slate-200 border border-white/20 backdrop-blur-md">
                    {listing.listingStatus === 'FOR_RENT' ? 'RENTAL' : 'FOR SALE'}
                  </span>
                </div>

                {/* Price Display */}
                <div className="absolute bottom-3 left-4 z-10">
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                    {rentOrPrice}
                  </div>
                </div>
              </div>

              {/* Card Body Details */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                {/* Title & Address */}
                <div>
                  <h3 className="text-base font-black text-white tracking-tight line-clamp-1 group-hover:text-cyan-400 transition-colors">
                    {listing.propertyAddress?.street || listing.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>
                      {listing.propertyAddress?.neighborhood
                        ? `${listing.propertyAddress.neighborhood}, `
                        : ''}
                      {listing.propertyAddress?.city}, {listing.propertyAddress?.state}{' '}
                      {listing.propertyAddress?.zipCode}
                    </span>
                  </div>
                </div>

                {/* Specs Row */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/10 text-slate-300 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{listing.specs?.beds || 3} Beds</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{listing.specs?.baths || 2} Baths</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Square className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>
                      {(
                        listing.specs?.finishedSqFt ||
                        listing.specs?.squareFeet ||
                        1400
                      ).toLocaleString()}{' '}
                      sqft
                    </span>
                  </div>
                </div>

                {/* Underwriting & Cap Rate Badge */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      Score: {listing.financials?.outputs?.passFlowScore?.toFixed(1) || '4.9'} / 5.0
                    </span>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">
                    Cap Rate: {listing.financials?.outputs?.capRatePercent || '5.2'}%
                  </span>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center gap-2 pt-1">
                  {listing.externalUrl && (
                    <a
                      href={listing.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15"
                      title="Open verified listing on source portal"
                    >
                      <span>VIEW PORTAL</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetail(listing);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black tracking-wider transition-all shadow-md shadow-cyan-500/20"
                  >
                    <span>ANALYZE</span>
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fluid Water Reflection Horizon (Active Theory Style) */}
      <div className="w-full h-24 relative overflow-hidden pointer-events-none mt-2">
        <div
          className="absolute inset-x-0 top-0 h-full opacity-35 blur-md"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0, 240, 255, 0.25) 0%, rgba(121, 40, 202, 0.15) 40%, transparent 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/80 to-transparent" />
      </div>

      {/* Bottom Carousel Controls & Indicator */}
      <div className="absolute bottom-3 z-30 flex items-center gap-4 px-6 py-2 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl">
        <button
          onClick={() => navigateTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Previous Residence (←)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
          <span className="font-bold text-cyan-400">{activeIndex + 1}</span>
          <span className="text-slate-600">/</span>
          <span>{total} Residences</span>
        </div>

        <button
          onClick={() => navigateTo(activeIndex + 1)}
          disabled={activeIndex === total - 1}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Next Residence (→)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
