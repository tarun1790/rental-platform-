'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShikaakPropertyListing } from '../../types/property';
import { 
  ChevronLeft, 
  ChevronRight, 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  Sparkles,
  Maximize2,
  Calendar,
  Camera,
  Compass
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
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  // In-card photo index for active card
  const [cardPhotoIndex, setCardPhotoIndex] = useState<Record<string, number>>({});

  // 3D Mouse Parallax Tilt state for the active center card
  const [mouseTilt, setMouseTilt] = useState<{ x: number; y: number; sheenX: number; sheenY: number }>({
    x: 0,
    y: 0,
    sheenX: 50,
    sheenY: 50,
  });
  const [isHoveringCenter, setIsHoveringCenter] = useState(false);

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
      setMouseTilt({ x: 0, y: 0, sheenX: 50, sheenY: 50 });
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
    if (dragOffset > 70) {
      navigateTo(activeIndex - 1);
    } else if (dragOffset < -70) {
      navigateTo(activeIndex + 1);
    }
    setDragOffset(0);
  };

  // Center card interactive mouse tilt handler
  const handleCenterMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    const tiltX = ((y / rect.height) - 0.5) * -14;
    const tiltY = ((x / rect.width) - 0.5) * 14;

    setMouseTilt({
      x: tiltX,
      y: tiltY,
      sheenX: percentX,
      sheenY: percentY,
    });
  };

  const handleCenterMouseEnter = () => {
    setIsHoveringCenter(true);
    spatialAudio.playCyberHover();
  };

  const handleCenterMouseLeave = () => {
    setIsHoveringCenter(false);
    setMouseTilt({ x: 0, y: 0, sheenX: 50, sheenY: 50 });
  };

  if (!listings || listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-zinc-500">
        <Sparkles className="w-10 h-10 text-[#e2b170] animate-pulse mb-3" />
        <p className="text-sm font-mono tracking-widest uppercase">NO RESIDENCES IN GALLERY</p>
      </div>
    );
  }

  // Render cards in a window of 7 around active card
  const visibleRange = 3;
  const startIndex = Math.max(0, activeIndex - visibleRange);
  const endIndex = Math.min(total - 1, activeIndex + visibleRange);

  const visibleListings = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleListings.push({ listing: listings[i], index: i });
  }

  return (
    <div className="relative w-full flex flex-col items-center select-none py-6 overflow-visible">
      
      {/* 3D Arc Viewport Stage */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative w-full h-[580px] sm:h-[620px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-visible"
        style={{
          perspective: '1600px',
        }}
      >
        {visibleListings.map(({ listing, index }) => {
          const offset = index - activeIndex;
          const isCenter = offset === 0;

          // 3D Arc Geometry with Mouse Parallax
          let translateX = offset * 360 + dragOffset * 0.75;
          let translateZ = -Math.abs(offset) * 170;
          let rotateY = -offset * 30 + (isCenter && isHoveringCenter ? mouseTilt.y : 0);
          let rotateX = isCenter && isHoveringCenter ? mouseTilt.x : 0;
          let scale = isCenter ? 1.05 : 0.82 - Math.abs(offset) * 0.08;
          let opacity = isCenter ? 1 : Math.max(0.18, 0.7 - Math.abs(offset) * 0.22);
          let zIndex = 50 - Math.abs(offset) * 10;

          const rentOrPrice =
            listing.listingStatus === 'FOR_RENT'
              ? `${formatCurrency(listing.financials?.inputs?.monthlyGrossRent || 9500)}/mo`
              : formatCurrency(listing.financials?.inputs?.purchasePrice || 3250000);

          const photos = listing.media?.gallery && listing.media.gallery.length > 0 
            ? listing.media.gallery 
            : [listing.media?.featuredImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=85'];
          
          const currentPhotoIdx = cardPhotoIndex[listing.id] || 0;
          const activeImage = photos[currentPhotoIdx % photos.length] || listing.media?.featuredImage;

          return (
            <div
              key={listing.id}
              onClick={() => {
                if (!isCenter) navigateTo(index);
              }}
              onMouseEnter={() => {
                if (isCenter) {
                  handleCenterMouseEnter();
                } else {
                  spatialAudio.playCyberHover();
                }
              }}
              onMouseLeave={() => {
                if (isCenter) handleCenterMouseLeave();
              }}
              onMouseMove={isCenter ? handleCenterMouseMove : undefined}
              className="absolute w-[340px] sm:w-[440px] lg:w-[480px] h-[520px] sm:h-[550px] rounded-[32px] transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden group backdrop-blur-2xl"
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`,
                opacity,
                zIndex,
                background: 'linear-gradient(155deg, rgba(24, 24, 30, 0.92) 0%, rgba(12, 12, 16, 0.96) 100%)',
                border: isCenter
                  ? '1px solid rgba(226, 177, 112, 0.7)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isCenter
                  ? '0 30px 80px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(226, 177, 112, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  : '0 20px 50px -10px rgba(0, 0, 0, 0.85)',
              }}
            >
              {/* Dynamic Interactive Specular Sheen (Active on Hover) */}
              {isCenter && (
                <div
                  className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle 350px at ${mouseTilt.sheenX}% ${mouseTilt.sheenY}%, rgba(255, 255, 255, 0.15) 0%, transparent 60%)`,
                    opacity: isHoveringCenter ? 1 : 0,
                  }}
                />
              )}

              {/* Upper Section: High-Resolution Architectural Photography */}
              <div className="relative w-full h-[290px] sm:h-[310px] overflow-hidden bg-black shrink-0">
                <img
                  src={activeImage}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-105"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85';
                  }}
                />
                
                {/* Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e12] via-transparent to-black/60" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/80 text-[#e2b170] border border-[#e2b170]/40 backdrop-blur-md shadow-md">
                    {listing.specs?.architecturalStyle || 'Modernist Residence'}
                  </span>
                </div>

                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider bg-black/80 text-white border border-white/20 backdrop-blur-md uppercase">
                    {listing.listingStatus === 'FOR_RENT' ? 'FOR LEASE' : 'FOR SALE'}
                  </span>
                </div>

                {/* In-Card Photo Carousel Navigation Arrows (Center card only) */}
                {isCenter && photos.length > 1 && (
                  <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCardPhotoIndex((prev) => ({
                          ...prev,
                          [listing.id]: (currentPhotoIdx - 1 + photos.length) % photos.length,
                        }));
                      }}
                      className="p-2 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md shadow-lg transition-all cursor-pointer"
                      title="Previous Photo"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCardPhotoIndex((prev) => ({
                          ...prev,
                          [listing.id]: (currentPhotoIdx + 1) % photos.length,
                        }));
                      }}
                      className="p-2 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md shadow-lg transition-all cursor-pointer"
                      title="Next Photo"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Bottom Photo Counter & Dots */}
                {photos.length > 1 && (
                  <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 bg-black/70 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md text-[10px] font-mono text-zinc-300">
                    <Camera className="w-3 h-3 text-[#e2b170]" />
                    <span>{currentPhotoIdx + 1}/{photos.length}</span>
                  </div>
                )}

                {/* Price Display */}
                <div className="absolute bottom-3 left-4 z-20 space-y-0.5">
                  <div className="text-2xl sm:text-3xl font-black text-[#e2b170] tracking-tight drop-shadow-md font-mono">
                    {rentOrPrice}
                  </div>
                </div>
              </div>

              {/* Lower Section: Luxury Typography & Specs */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-[#111116]/80">
                {/* Title & Neighborhood */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-wide uppercase line-clamp-1 group-hover:text-[#e2b170] transition-colors">
                    {listing.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1 line-clamp-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-[#e2b170] shrink-0" />
                    <span>
                      {listing.propertyAddress?.neighborhood ? `${listing.propertyAddress.neighborhood}, ` : ''}
                      {listing.propertyAddress?.city}, {listing.propertyAddress?.state}
                    </span>
                  </div>
                </div>

                {/* Clean Specs Strip */}
                <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-white/10 text-zinc-200 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-[#e2b170] shrink-0" />
                    <span className="font-semibold">{listing.specs?.beds || 4} Beds</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4 text-[#e2b170] shrink-0" />
                    <span className="font-semibold">{listing.specs?.baths || 3.5} Baths</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Square className="w-4 h-4 text-[#e2b170] shrink-0" />
                    <span className="font-semibold">
                      {(listing.specs?.finishedSqFt || listing.specs?.squareFeet || 3600).toLocaleString()} sqft
                    </span>
                  </div>
                </div>

                {/* Luxury Action Buttons */}
                <div className="flex items-center gap-2 pt-1 font-mono">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetail(listing);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#e2b170] hover:bg-[#d4a055] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#e2b170]/20 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Tour</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetail(listing);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer"
                    title="View Full Architectural Dossier"
                  >
                    <span>Details</span>
                    <Maximize2 className="w-3.5 h-3.5 text-[#e2b170]" />
                  </button>
                </div>
              </div>

              {/* Hyper-Realistic Mirrored Floor Reflection Plane */}
              <div
                className="absolute -bottom-28 left-0 right-0 h-28 pointer-events-none transform scale-y-[-1] opacity-35 blur-[1.5px] overflow-hidden"
                style={{
                  maskImage: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 80%)',
                  WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 80%)',
                }}
              >
                <img
                  src={activeImage}
                  alt=""
                  className="w-full h-full object-cover brightness-75"
                />
              </div>

            </div>
          );
        })}
      </div>

      {/* Navigation Controls & Index Indicator */}
      <div className="flex flex-col items-center gap-3 mt-6 z-20 w-full max-w-4xl px-4">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigateTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="p-3.5 rounded-2xl bg-[#141418] hover:bg-[#1e1e24] disabled:opacity-30 disabled:cursor-not-allowed text-white border border-white/10 transition-all shadow-lg hover:border-[#e2b170]/50 cursor-pointer"
            title="Previous Residence (Left Arrow)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 font-mono text-xs tracking-widest text-zinc-400">
            <span className="text-[#e2b170] font-black text-sm">
              {(activeIndex + 1).toString().padStart(4, '0')}
            </span>
            <span>/</span>
            <span>{total.toString().padStart(4, '0')}</span>
            <span className="ml-2 text-[10px] text-zinc-500 hidden sm:inline uppercase">
              [ Use ← → keys or swipe horizontally ]
            </span>
          </div>

          <button
            onClick={() => navigateTo(activeIndex + 1)}
            disabled={activeIndex === total - 1}
            className="p-3.5 rounded-2xl bg-[#141418] hover:bg-[#1e1e24] disabled:opacity-30 disabled:cursor-not-allowed text-white border border-white/10 transition-all shadow-lg hover:border-[#e2b170]/50 cursor-pointer"
            title="Next Residence (Right Arrow)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Thumbnail Quick-Scrubber Track */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-2.5 px-4 rounded-2xl bg-[#111116]/80 border border-white/10 backdrop-blur-md scrollbar-none shadow-2xl">
          {listings.slice(Math.max(0, activeIndex - 6), Math.min(total, activeIndex + 7)).map((item, idx) => {
            const actualIdx = Math.max(0, activeIndex - 6) + idx;
            const isCur = actualIdx === activeIndex;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(actualIdx)}
                className={`relative w-14 h-10 rounded-xl overflow-hidden shrink-0 transition-all border cursor-pointer ${
                  isCur 
                    ? 'border-[#e2b170] ring-2 ring-[#e2b170]/50 scale-105 shadow-md shadow-[#e2b170]/20' 
                    : 'border-white/10 opacity-40 hover:opacity-100 hover:border-white/30'
                }`}
                title={item.title}
              >
                <img
                  src={item.media?.featuredImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=140&q=80'}
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
