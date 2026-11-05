'use client';

import React, { useState, useMemo } from 'react';
import { 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  ChevronRight,
  ChevronLeft,
  Camera,
  GraduationCap,
  ShoppingBag,
  ExternalLink,
  Calendar,
  Sparkles
} from 'lucide-react';
import { ShikaakPropertyListing, BuyerPriorityWeights } from '../../types/property';
import { resolveUsMetro } from '../../lib/geo/us-metro-registry';
import { formatCurrency } from '../../lib/roi-engine';

interface PropertyCardProps {
  listing: ShikaakPropertyListing;
  isSelected?: boolean;
  buyerWeights?: BuyerPriorityWeights;
  onSelect?: (listing: ShikaakPropertyListing) => void;
  onOpenDetail?: (listing: ShikaakPropertyListing) => void;
  onOpenRoiCalculator?: (listing: ShikaakPropertyListing) => void;
  onOpenOkf?: (listing: ShikaakPropertyListing) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  listing,
  isSelected = false,
  onSelect,
  onOpenDetail,
}) => {
  const { specs, financials, propertyAddress, media, nearbyPointsOfInterest } = listing;
  const inputs = financials?.inputs || { purchasePrice: 2850000, monthlyGrossRent: 9500 };

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Deduplicate and assemble authentic high-res photo stream
  const photoList = useMemo(() => {
    const raw = [media?.featuredImage, ...(media?.gallery || [])].filter(Boolean) as string[];
    const unique = Array.from(new Set(raw));
    return unique.length > 0 ? unique : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'];
  }, [media]);

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photoList.length - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev < photoList.length - 1 ? prev + 1 : 0));
  };

  const metroInfo = useMemo(() => resolveUsMetro(propertyAddress?.city || 'Chicago'), [propertyAddress?.city]);
  const pois = nearbyPointsOfInterest && nearbyPointsOfInterest.length > 0 ? nearbyPointsOfInterest : [...(metroInfo.topSchools || []), ...(metroInfo.topMalls || [])];
  const topSchool = pois.find(p => p.type === 'SCHOOL' || (p.categoryLabel && p.categoryLabel.toLowerCase().includes('school'))) || pois[0];

  const priceText = listing.listingStatus === 'FOR_RENT'
    ? `${formatCurrency(inputs.monthlyGrossRent)}/mo`
    : formatCurrency(inputs.purchasePrice);

  return (
    <div
      id={`house-${listing.id}`}
      onClick={() => onSelect?.(listing)}
      className={`group bg-[#121216] rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer border select-none ${
        isSelected
          ? 'border-[#e2b170] shadow-xl shadow-[#e2b170]/20 ring-1 ring-[#e2b170]/50'
          : 'border-white/10 hover:border-[#e2b170]/60 hover:shadow-2xl hover:shadow-black/80'
      }`}
    >
      {/* 1. Interactive Multi-Photo Container with Navigation */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black select-none">
        <img
          src={photoList[activePhotoIdx] || media.featuredImage}
          alt={`${listing.title} - photo ${activePhotoIdx + 1}`}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
          }}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-95 group-hover:brightness-105"
        />

        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-transparent to-black/60 pointer-events-none" />

        {/* In-Card Next/Prev Arrow Controls */}
        {photoList.length > 1 && (
          <>
            <button
              onClick={handlePrevPhoto}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/75 hover:bg-black/95 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md shadow-lg cursor-pointer z-20 border border-white/20"
              title="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextPhoto}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/75 hover:bg-black/95 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md shadow-lg cursor-pointer z-20 border border-white/20"
              title="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* In-Card Photo Counter & Indicators */}
            <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between pointer-events-none z-20">
              <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white font-mono border border-white/10">
                <Camera className="w-3 h-3 text-[#e2b170]" />
                <span>{activePhotoIdx + 1} / {photoList.length}</span>
              </div>

              <div className="flex items-center gap-1">
                {photoList.slice(0, 5).map((_, pIdx) => (
                  <span
                    key={pIdx}
                    className={`h-1.5 rounded-full transition-all ${
                      pIdx === activePhotoIdx ? 'w-4 bg-[#e2b170]' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Top Badges */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between pointer-events-none z-20">
          <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/80 text-[#e2b170] border border-[#e2b170]/40 backdrop-blur-md shadow-md">
            {specs?.architecturalStyle || 'Modern Architecture'}
          </div>

          <div className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider bg-black/80 text-white border border-white/20 backdrop-blur-md uppercase">
            {listing.listingStatus === 'FOR_RENT' ? 'FOR LEASE' : 'FOR SALE'}
          </div>
        </div>
      </div>

      {/* 2. House Information & Actions */}
      <div className="p-5 space-y-3.5 bg-[#121216]">
        
        {/* Price & Status */}
        <div className="flex items-baseline justify-between">
          <div className="space-y-0.5">
            <span className="text-2xl font-black text-[#e2b170] font-mono tracking-tight">
              {priceText}
            </span>
            <p className="text-[11px] font-medium text-zinc-400 font-mono">
              {listing.listingStatus === 'FOR_RENT' ? 'Premier Lease Offering' : 'Curated Verified Residence'}
            </p>
          </div>
        </div>

        {/* Title & Street Address */}
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-[#e2b170] transition-colors truncate">
            {listing.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-zinc-400 truncate mt-0.5 font-mono">
            <MapPin className="w-3.5 h-3.5 text-[#e2b170] shrink-0" />
            <span>
              {propertyAddress?.street || listing.title}
              {propertyAddress?.neighborhood ? `, ${propertyAddress.neighborhood}` : ''}
              {propertyAddress?.city ? ` • ${propertyAddress.city}` : ''}
            </span>
          </div>
        </div>

        {/* Specs Bar (Beds • Baths • SqFt) */}
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 pt-2.5 border-t border-white/10 font-mono">
          <div className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5 text-[#e2b170]" />
            <span>{specs?.beds || 4} Beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5 text-[#e2b170]" />
            <span>{specs?.baths || 3.5} Baths</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="w-3.5 h-3.5 text-[#e2b170]" />
            <span>{(specs?.finishedSqFt || specs?.squareFeet || 3400).toLocaleString()} sq ft</span>
          </div>
        </div>

        {/* Top School Highlight */}
        {topSchool && (
          <div className="flex items-center justify-between text-[11px] bg-white/5 p-2 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5 truncate mr-2">
              <GraduationCap className="w-3.5 h-3.5 text-[#e2b170] shrink-0" />
              <span className="font-bold text-zinc-200 truncate">{topSchool.name}</span>
            </div>
            <span className="px-2 py-0.5 rounded-lg bg-[#e2b170]/15 text-[#e2b170] border border-[#e2b170]/30 font-bold font-mono text-[10px] shrink-0">
              ★ {topSchool.ratingScore || 10}/10 GreatSchools
            </span>
          </div>
        )}

        {/* Clean Luxury Action Buttons */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10 gap-2 font-mono">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail?.(listing);
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-[#e2b170] hover:bg-[#d4a055] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#e2b170]/20 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule Tour</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail?.(listing);
            }}
            className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 border border-white/10 cursor-pointer"
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#e2b170]" />
          </button>
        </div>

      </div>
    </div>
  );
};
