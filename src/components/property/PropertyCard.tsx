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
  Plane, 
  TreePine, 
  Flame, 
  ShieldCheck,
  Building,
  Sparkles,
  Layers,
  Sun,
  GraduationCap,
  ShoppingBag,
  Star,
  Calculator,
  ExternalLink
} from 'lucide-react';
import { ShikaakPropertyListing, BuyerPriorityWeights } from '../../types/property';
import { formatCurrency, formatPercent } from '../../lib/roi-engine';
import { scorePropertyDimensions, DEFAULT_PRIORITY_WEIGHTS } from '../../lib/scoring/property-scoring-engine';

interface PropertyCardProps {
  listing: ShikaakPropertyListing;
  isSelected?: boolean;
  buyerWeights?: BuyerPriorityWeights;
  onSelect?: (listing: ShikaakPropertyListing) => void;
  onOpenDetail?: (listing: ShikaakPropertyListing) => void;
  onOpenRoiCalculator?: (listing: ShikaakPropertyListing) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  listing,
  isSelected = false,
  buyerWeights,
  onSelect,
  onOpenDetail,
  onOpenRoiCalculator,
}) => {
  const { specs, geotechnical, financials, propertyAddress, media, propertyTaxes, roomsBreakdown, forestResources, timezone, airport, heatWaves, policeCorridor, climateTelemetry, nearbyPointsOfInterest } = listing;
  const { inputs, outputs } = financials;

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Deduplicate and assemble authentic photo stream
  const photoList = useMemo(() => {
    const raw = [media?.featuredImage, ...(media?.gallery || [])].filter(Boolean) as string[];
    const unique = Array.from(new Set(raw));
    return unique.length > 0 ? unique : ['https://photos.zillowstatic.com/fp/848f6a9144d553a02d967df41e3ccb9d-p_e.jpg'];
  }, [media]);

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photoList.length - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev < photoList.length - 1 ? prev + 1 : 0));
  };

  const dimScores = React.useMemo(() => {
    return scorePropertyDimensions(listing, buyerWeights || DEFAULT_PRIORITY_WEIGHTS);
  }, [listing, buyerWeights]);

  const pois = nearbyPointsOfInterest || [];
  const topSchool = pois.find(p => p.type === 'SCHOOL' || (p.categoryLabel && p.categoryLabel.toLowerCase().includes('school'))) || pois[0];
  const topMall = pois.find(p => p.type === 'MALL' || (p.categoryLabel && (p.categoryLabel.toLowerCase().includes('mall') || p.categoryLabel.toLowerCase().includes('retail')))) || pois[1];

  return (
    <div
      id={`house-${listing.id}`}
      onClick={() => onSelect?.(listing)}
      className={`group bg-white rounded-3xl overflow-hidden transition-all duration-200 cursor-pointer border ${
        isSelected
          ? 'border-red-400 shadow-sm'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* 1. Interactive Multi-Photo Container with Live Carousel Controls */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900 select-none">
        <img
          src={photoList[activePhotoIdx] || media.featuredImage}
          alt={`${listing.title} - photo ${activePhotoIdx + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 ease-out"
        />

        {/* Next / Previous In-Card Navigation Controls (Visible on hover or mobile) */}
        {photoList.length > 1 && (
          <>
            <button
              onClick={handlePrevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-md cursor-pointer z-10"
              title="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-md cursor-pointer z-10"
              title="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Bottom Carousel Indicator Pills & Photo Counter */}
            <div className="absolute bottom-2 inset-x-2 flex items-center justify-between pointer-events-none z-10">
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-white font-mono">
                <Camera className="w-2.5 h-2.5 text-red-400" />
                <span>{activePhotoIdx + 1} / {photoList.length}</span>
              </div>

              <div className="flex items-center gap-1">
                {photoList.map((_, pIdx) => (
                  <span
                    key={pIdx}
                    className={`h-1.5 rounded-full transition-all ${
                      pIdx === activePhotoIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Top Floating Badges */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between pointer-events-none z-10">
          {/* Decision Fit Score Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 text-white font-mono text-xs font-bold shadow-sm backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>Fit {Math.round(dimScores.compositeScore)}%</span>
          </div>

          {/* Live Ingested Feed Badge with Prominent Portal Branding */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-md border backdrop-blur-md ${
            listing.sourcePortal === 'REDFIN' ? 'bg-red-600/95 text-white border-red-400/30' :
            listing.sourcePortal === 'ZILLOW' ? 'bg-blue-600/95 text-white border-blue-400/30' :
            listing.sourcePortal === 'APARTMENTS_COM' ? 'bg-emerald-600/95 text-white border-emerald-400/30' :
            listing.sourcePortal === 'TRULIA' ? 'bg-teal-600/95 text-white border-teal-400/30' :
            listing.sourcePortal === 'REALTOR' ? 'bg-amber-600/95 text-white border-amber-400/30' :
            'bg-white/95 text-slate-800 border-slate-200'
          }`}>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="uppercase tracking-wider text-[10px]">
              Scraped from {listing.sourcePortal === 'APARTMENTS_COM' ? 'Apartments.com' : listing.sourcePortal === 'REALTOR' ? 'Realtor.com' : listing.sourcePortal ? (listing.sourcePortal.charAt(0) + listing.sourcePortal.slice(1).toLowerCase()) : 'Portal'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Complete House Details Arranged Cleanly Below The Photo */}
      <div className="p-5 space-y-3.5 bg-white">
        
        {/* Price & Monthly Rent */}
        <div className="flex items-baseline justify-between">
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-red-500 font-mono tracking-tight">
                {listing.listingStatus === 'FOR_RENT'
                  ? `${formatCurrency(inputs.monthlyGrossRent)}/mo`
                  : formatCurrency(inputs.purchasePrice)}
              </span>
              <span className="text-xs font-medium text-slate-400 font-mono">
                {listing.listingStatus === 'FOR_RENT'
                  ? `Est. Move-In: ${formatCurrency(inputs.monthlyGrossRent * 2 + 50)}`
                  : `${formatCurrency(inputs.monthlyGrossRent)}/mo rent`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="px-1.5 py-0.5 rounded-md bg-red-50 text-red-700 font-bold border border-red-200">
                Pass/Flow {outputs.passFlowScore.toFixed(1)} / 5.0
              </span>
              {outputs.monthlyNetCashFlow !== undefined && (
                <span className={`font-semibold ${outputs.monthlyNetCashFlow >= 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                  Cash Flow: {outputs.monthlyNetCashFlow >= 0 ? `+${formatCurrency(outputs.monthlyNetCashFlow)}/mo` : `${formatCurrency(outputs.monthlyNetCashFlow)}/mo`}
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Cap Rate</span>
            <span className="text-sm font-bold text-slate-800 font-mono">
              {formatPercent(outputs.capRatePercent)}
            </span>
          </div>
        </div>

        {/* Title & Street Address */}
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-red-500 transition-colors truncate">
            {listing.title}
          </h3>
          <p className="text-xs text-slate-500 font-normal truncate mt-0.5">
            {propertyAddress.street}, {propertyAddress.neighborhood}
          </p>
        </div>

        {/* Clean 1-Line Specs Bar (Beds • Baths • SqFt • Rooms) */}
        <div className="flex items-center justify-between text-xs font-medium text-slate-700 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5 text-slate-400" />
            <span>{specs.beds} Beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5 text-slate-400" />
            <span>{specs.baths} Baths</span>
          </div>
          <div className="flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>{roomsBreakdown.totalRooms} Rooms</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="w-3.5 h-3.5 text-slate-400" />
            <span>{(specs.finishedSqFt || 1800).toLocaleString()} sq ft</span>
          </div>
        </div>

        {/* NEARBY SCHOOLS & MALLS WITH RATINGS (PROMINENT HIGHLIGHT) */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100">
          {topSchool && (
            <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 truncate mr-2">
                <GraduationCap className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="font-bold text-slate-800 truncate">{topSchool.name}</span>
                <span className="text-slate-400 font-mono">({topSchool.distanceKm} km)</span>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold font-mono text-[10px] shrink-0">
                ★ {topSchool.ratingScore}/10 GreatSchools
              </span>
            </div>
          )}

          {topMall && (
            <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 truncate mr-2">
                <ShoppingBag className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="font-bold text-slate-800 truncate">{topMall.name}</span>
                <span className="text-slate-400 font-mono">({topMall.distanceKm} km)</span>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold font-mono text-[10px] shrink-0">
                ★ {topMall.ratingScore} / 5.0 Mall
              </span>
            </div>
          )}
        </div>

        {/* Telemetry Chips (Airports in km • Police Corridor • Taxes) */}
        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 text-slate-700 font-medium border border-slate-200 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate text-[10px] font-sans">{policeCorridor?.twentyYearBurglaryMilestone || '19.4-Yr Zero Incident Corridor'}</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 text-slate-700 font-medium border border-slate-200 truncate">
            <Plane className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate text-[10px]">{airport?.primaryAirportIATA || 'ORD'} {airport?.distanceToAirportKm || 24} km • Taxes: <strong className="font-mono text-slate-800">{formatCurrency(propertyTaxes.annualAmountUSD)}/yr</strong></span>
          </div>
        </div>

        {/* Action Row: Custom ROI Calculator, Live Portal Link & Inspect CTA */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenRoiCalculator?.(listing);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-red-500" />
            <span>ROI Underwriter</span>
          </button>

          <div className="flex items-center gap-1.5">
            {listing.externalUrl && (
              <a
                href={listing.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border shadow-sm ${
                  listing.sourcePortal === 'REDFIN' ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200' :
                  listing.sourcePortal === 'ZILLOW' ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' :
                  listing.sourcePortal === 'APARTMENTS_COM' ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200' :
                  listing.sourcePortal === 'TRULIA' ? 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200' :
                  'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                }`}
                title={`Open authentic listing on ${listing.sourcePortal || 'Portal'}`}
              >
                <span>View on {listing.sourcePortal === 'APARTMENTS_COM' ? 'Apartments.com' : listing.sourcePortal === 'REALTOR' ? 'Realtor.com' : listing.sourcePortal ? (listing.sourcePortal.charAt(0) + listing.sourcePortal.slice(1).toLowerCase()) : 'Portal'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail?.(listing);
              }}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>Inspect</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
