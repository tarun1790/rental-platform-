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
import { spatialAudio } from '../../lib/audio/spatial-audio';

interface SpatialCardCarouselProps {
  listings: ShikaakPropertyListing[];
  onSelectListing: (listing: ShikaakPropertyListing) => void;
  onOpenDetail: (listing: ShikaakPropertyListing) => void;
  onOpenRoiCalculator?: (listing: ShikaakPropertyListing) => void;
  onOpenOkf?: (listing: ShikaakPropertyListing) => void;
}

export const SpatialCardCarousel: React.FC<SpatialCardCarouselProps> = ({
  listings,
  onSelectListing,
  onOpenDetail,
  onOpenRoiCalculator,
  onOpenOkf,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const total = listings.length;

  const navigateTo = useCallback(
    (index: number) => {
      if (total === 0) return;
      const newIndex = Math.max(0, Math.min(total - 1, index));
      if (newIndex !== activeIndex) {
        spatialAudio.playCardSwipe(newIndex > activeIndex ? 'right' : 'left');
      }
      setActiveIndex(newIndex);
      onSelectListing(listings[newIndex]);
    },
    [total, listings, onSelectListing, activeIndex]
  );

  // Keyboard navigation
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
    if (dragOffset > 60) {
      navigateTo(activeIndex - 1);
    } else if (dragOffset < -60) {
      navigateTo(activeIndex + 1);
    }
    setDragOffset(0);
  };

  if (!listings || listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400">
        <Sparkles className="w-10 h-10 text-cyan-400 animate-pulse mb-3" />
        <p className="text-sm font-mono tracking-wider uppercase">NO RESIDENCES IN SPATIAL BUFFER</p>
      </div>
    );
  }

  // Render cards in a window of 7 around the active card
  const visibleRange = 3;
  const startIndex = Math.max(0, activeIndex - visibleRange);
  const endIndex = Math.min(total - 1, activeIndex + visibleRange);

  const visibleListings = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleListings.push({ listing: listings[i], index: i });
  }

  return (
    <div className="relative w-full flex flex-col items-center select-none py-4">
      {/* 3D Arc Viewport Stage */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative w-full h-[540px] sm:h-[580px] flex items-center justify-center perspective-[1500px] cursor-grab active:cursor-grabbing overflow-visible"
        style={{
          perspective: '1500px',
        }}
      >
        {visibleListings.map(({ listing, index }) => {
          const offset = index - activeIndex;
          const isCenter = offset === 0;

          // 3D Arc Geometry Matching Active Theory Frame 01
          let translateX = offset * 340 + dragOffset * 0.75;
          let translateZ = -Math.abs(offset) * 160;
          let rotateY = -offset * 32;
          let scale = isCenter ? 1.04 : 0.84 - Math.abs(offset) * 0.08;
          let opacity = isCenter ? 1 : Math.max(0.2, 0.75 - Math.abs(offset) * 0.25);
          let zIndex = 50 - Math.abs(offset) * 10;

          const portal = listing.sourcePortal || 'ZILLOW';
          const portalColor =
            portal === 'ZILLOW'
              ? 'bg-blue-600/90 text-white border-blue-400/50'
              : portal === 'REDFIN'
              ? 'bg-red-600/90 text-white border-red-400/50'
              : portal === 'APARTMENTS_COM'
              ? 'bg-emerald-600/90 text-white border-emerald-400/50'
              : 'bg-cyan-600/90 text-white border-cyan-400/50';

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
              onMouseEnter={() => {
                if (!isCenter) spatialAudio.playCyberHover();
              }}
              className="absolute w-[340px] sm:w-[420px] lg:w-[460px] h-[490px] sm:h-[510px] rounded-[32px] transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden group backdrop-blur-2xl"
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                zIndex,
                background: 'linear-gradient(145deg, rgba(16, 16, 28, 0.88) 0%, rgba(8, 8, 16, 0.94) 100%)',
                border: isCenter
                  ? '2px solid rgba(0, 240, 255, 0.75)'
                  : '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: isCenter
                  ? '0 30px 80px -15px rgba(0, 240, 255, 0.35), 0 0 40px rgba(0, 240, 255, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  : '0 20px 50px -10px rgba(0, 0, 0, 0.85)',
              }}
            >
              {/* Card Upper: High-Gloss Real Estate Photography */}
              <div className="relative w-full h-[260px] sm:h-[280px] overflow-hidden bg-slate-950 shrink-0">
                <img
                  src={
                    listing.media?.featuredImage ||
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
                  }
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-105"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                
                {/* Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-black/20 to-black/50" />

                {/* Top Badge Strip */}
                <div className="absolute top-3.5 left-4 z-10 flex items-center gap-2">
                  <span
                    className={`px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg ${portalColor}`}
                  >
                    {portal.replace(/_/g, ' ')}
                  </span>
                  {listing.isLiveCrawled && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-950/90 text-cyan-400 border border-cyan-500/50 backdrop-blur-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      VERIFIED LIVE
                    </span>
                  )}
                </div>

                {/* Top Right: Status Pill */}
                <div className="absolute top-3.5 right-4 z-10">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider bg-black/75 text-slate-200 border border-white/20 backdrop-blur-md uppercase">
                    {listing.listingStatus === 'FOR_RENT' ? 'FOR RENT' : 'FOR SALE'}
                  </span>
                </div>

                {/* Floating Big Price in Segmented Display Style */}
                <div className="absolute bottom-3 left-4 z-10 space-y-0.5">
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400/90 uppercase font-bold block">
                    {listing.listingStatus === 'FOR_RENT' ? 'Gross Lease Rate' : 'Acquisition Cost'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-lg font-mono">
                    {rentOrPrice}
                  </div>
                </div>
              </div>

              {/* Card Body: Active Theory Cyber Typography Details */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-[#080810]/60">
                {/* Title & Address */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight uppercase line-clamp-1 group-hover:text-cyan-400 transition-colors">
                    {listing.propertyAddress?.street || listing.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 line-clamp-1 font-mono">
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

                {/* Specs Strip */}
                <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-white/10 text-slate-200 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-semibold">{listing.specs?.beds || 3} Beds</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-semibold">{listing.specs?.baths || 2} Baths</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Square className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-semibold">
                      {(
                        listing.specs?.finishedSqFt ||
                        listing.specs?.squareFeet ||
                        1400
                      ).toLocaleString()}{' '}
                      sqft
                    </span>
                  </div>
                </div>

                {/* Institutional Telemetry Row */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      Pass/Flow: {listing.financials?.outputs?.passFlowScore?.toFixed(1) || '4.9'} / 5.0
                    </span>
                  </div>
                  <span className="text-cyan-400 font-bold">
                    Cap Rate: {listing.financials?.outputs?.capRatePercent || '5.2'}%
                  </span>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono">
                  {onOpenRoiCalculator && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenRoiCalculator(listing);
                      }}
                      className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 text-[11px] font-bold uppercase transition-all cursor-pointer"
                      title="Open ROI Calculator"
                    >
                      ROI
                    </button>
                  )}

                  {onOpenOkf && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenOkf(listing);
                      }}
                      className="px-2.5 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold uppercase transition-all cursor-pointer"
                      title="Open OKF Dossier"
                    >
                      OKF
                    </button>
                  )}

                  {listing.externalUrl && (
                    <a
                      href={listing.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/15 text-[11px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>PORTAL</span>
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    </a>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetail(listing);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs font-mono tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/30 cursor-pointer"
                  >
                    <span>INSPECT</span>
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Water Reflection Plane Beneath Card */}
              <div
                className="absolute -bottom-24 left-0 right-0 h-24 opacity-25 pointer-events-none transform scale-y-[-1] blur-[2px]"
                style={{
                  background: 'linear-gradient(to top, rgba(0,240,255,0.15), transparent 70%)',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Navigation Controls & Index Indicator */}
      <div className="flex flex-col items-center gap-3 mt-4 z-20 w-full max-w-4xl px-4">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigateTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed text-white border border-white/15 transition-all shadow-lg hover:border-cyan-500/50 cursor-pointer"
            title="Previous Residence (Left Arrow)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 font-mono text-xs tracking-widest text-slate-400">
            <span className="text-cyan-400 font-bold text-sm">
              {(activeIndex + 1).toString().padStart(4, '0')}
            </span>
            <span>/</span>
            <span>{total.toString().padStart(4, '0')}</span>
            <span className="ml-2 text-[10px] text-slate-500 hidden sm:inline">
              [ ← → ARROWS OR DRAG CAROUSEL ]
            </span>
          </div>

          <button
            onClick={() => navigateTo(activeIndex + 1)}
            disabled={activeIndex === total - 1}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed text-white border border-white/15 transition-all shadow-lg hover:border-cyan-500/50 cursor-pointer"
            title="Next Residence (Right Arrow)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Thumbnail Quick-Scrubber Track */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-2 px-3 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md scrollbar-none">
          {listings.slice(Math.max(0, activeIndex - 6), Math.min(total, activeIndex + 7)).map((item, idx) => {
            const actualIdx = Math.max(0, activeIndex - 6) + idx;
            const isCur = actualIdx === activeIndex;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(actualIdx)}
                className={`relative w-12 h-9 rounded-lg overflow-hidden shrink-0 transition-all border cursor-pointer ${
                  isCur ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-105' : 'border-white/10 opacity-50 hover:opacity-100'
                }`}
                title={item.title}
              >
                <img
                  src={item.media?.featuredImage || item.media?.gallery?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=120&q=80'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
