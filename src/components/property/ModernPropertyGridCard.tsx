'use client';

import React, { useState } from 'react';
import { 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  ShieldCheck, 
  Star, 
  ExternalLink, 
  ChevronRight,
  ChevronLeft,
  Calculator,
  Maximize2
} from 'lucide-react';
import { ShikaakPropertyListing } from '../../types/property';
import { formatCurrency } from '../../lib/roi-engine';

interface ModernPropertyGridCardProps {
  listing: ShikaakPropertyListing;
  onSelect?: (listing: ShikaakPropertyListing) => void;
  onOpenDetail?: (listing: ShikaakPropertyListing) => void;
  onOpenRoiCalculator?: (listing: ShikaakPropertyListing) => void;
}

export const ModernPropertyGridCard: React.FC<ModernPropertyGridCardProps> = ({
  listing,
  onSelect,
  onOpenDetail,
  onOpenRoiCalculator,
}) => {
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

  const photos = [
    listing.media?.featuredImage,
    ...(listing.media?.gallery || []),
  ].filter(Boolean) as string[];

  const uniquePhotos = photos.length > 0
    ? Array.from(new Set(photos))
    : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'];

  const portal = listing.sourcePortal || 'ZILLOW';
  const portalStyles: Record<string, string> = {
    ZILLOW: 'bg-blue-600 text-white border-blue-400/40',
    REDFIN: 'bg-red-600 text-white border-red-400/40',
    REALTOR: 'bg-amber-600 text-white border-amber-400/40',
    APARTMENTS_COM: 'bg-emerald-600 text-white border-emerald-400/40',
    TRULIA: 'bg-cyan-600 text-white border-cyan-400/40',
    HOTPADS: 'bg-orange-600 text-white border-orange-400/40',
    MLS_FEED: 'bg-indigo-600 text-white border-indigo-400/40',
  };

  const portalBadgeClass = portalStyles[portal] || 'bg-slate-700 text-white border-slate-500';

  const rentOrPrice =
    listing.listingStatus === 'FOR_RENT'
      ? `${formatCurrency(listing.financials?.inputs?.monthlyGrossRent || 2800)}/mo`
      : formatCurrency(listing.financials?.inputs?.purchasePrice || 685000);

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev < uniquePhotos.length - 1 ? prev + 1 : 0));
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev > 0 ? prev - 1 : uniquePhotos.length - 1));
  };

  return (
    <div
      onClick={() => {
        onSelect?.(listing);
      }}
      className="group flex flex-col bg-[#0e131f] hover:bg-[#121827] border border-slate-800/80 hover:border-cyan-500/50 rounded-2xl overflow-hidden transition-all duration-200 shadow-md hover:shadow-xl cursor-pointer"
    >
      {/* 1. High-Resolution Photo Container */}
      <div className="relative aspect-[16/10] w-full bg-slate-950 overflow-hidden select-none">
        <img
          src={uniquePhotos[currentPhotoIdx] || listing.media?.featuredImage}
          alt={listing.title}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0e131f] via-transparent to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${portalBadgeClass}`}>
            {portal.replace(/_/g, ' ')}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/60 text-slate-200 border border-white/20 backdrop-blur-md uppercase">
            {listing.listingStatus === 'FOR_RENT' ? 'RENTAL' : 'FOR SALE'}
          </span>
        </div>

        {/* Top Right: Photo Index Counter */}
        {uniquePhotos.length > 1 && (
          <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-black/70 text-slate-300 border border-white/20 text-[10px] font-mono backdrop-blur-md">
            {currentPhotoIdx + 1}/{uniquePhotos.length}
          </div>
        )}

        {/* Carousel Arrow Buttons */}
        {uniquePhotos.length > 1 && (
          <>
            <button
              onClick={handlePrevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Big Bold Price Tag */}
        <div className="absolute bottom-2.5 left-3.5 z-10">
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
            {rentOrPrice}
          </div>
        </div>
      </div>

      {/* 2. Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {/* Title & Location */}
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
            {listing.propertyAddress?.street || listing.title}
          </h3>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 line-clamp-1 font-mono">
            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span>
              {listing.propertyAddress?.neighborhood ? `${listing.propertyAddress.neighborhood}, ` : ''}
              {listing.propertyAddress?.city}, {listing.propertyAddress?.state} {listing.propertyAddress?.zipCode}
            </span>
          </p>
        </div>

        {/* Specs Strip */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800 text-slate-300 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <Bed className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{listing.specs?.beds || 3} Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{listing.specs?.baths || 2} Baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Square className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              {(listing.specs?.finishedSqFt || listing.specs?.squareFeet || 1600).toLocaleString()} sqft
            </span>
          </div>
        </div>

        {/* Investment & School Telemetry */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Score: {listing.financials?.outputs?.passFlowScore?.toFixed(1) || '4.8'}</span>
          </div>
          <div className="text-slate-400">
            Cap Rate: <span className="text-cyan-400 font-bold">{listing.financials?.outputs?.capRatePercent || '5.2'}%</span>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail?.(listing);
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>Inspect</span>
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {onOpenRoiCalculator && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenRoiCalculator(listing);
              }}
              className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-all cursor-pointer"
              title="ROI Calculator"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          )}

          {listing.externalUrl && (
            <a
              href={listing.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-all flex items-center justify-center cursor-pointer"
              title={`View on official ${portal} website`}
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
