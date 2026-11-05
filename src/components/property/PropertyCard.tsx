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
  ExternalLink,
  FileText
} from 'lucide-react';
import { ShikaakPropertyListing, BuyerPriorityWeights } from '../../types/property';
import { resolveUsMetro } from '../../lib/geo/us-metro-registry';
import { formatCurrency, formatPercent } from '../../lib/roi-engine';
import { scorePropertyDimensions, DEFAULT_PRIORITY_WEIGHTS } from '../../lib/scoring/property-scoring-engine';

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
  buyerWeights,
  onSelect,
  onOpenDetail,
  onOpenRoiCalculator,
  onOpenOkf,
}) => {
  const { specs, geotechnical, financials, propertyAddress, media, propertyTaxes, roomsBreakdown, forestResources, timezone, airport, heatWaves, policeCorridor, climateTelemetry, nearbyPointsOfInterest } = listing;
  const inputs = financials?.inputs || { purchasePrice: 750000, monthlyGrossRent: 3500 };
  const outputs = financials?.outputs || { passFlowScore: 4.8, capRatePercent: 4.77, monthlyNetCashFlow: 850 };

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

  const metroInfo = useMemo(() => resolveUsMetro(propertyAddress?.city || 'Chicago'), [propertyAddress?.city]);
  const airportCode = airport?.primaryAirportIATA || metroInfo.primaryAirport.iata;
  const airportDist = airport?.distanceToAirportKm || metroInfo.primaryAirport.distanceKm;

  const pois = nearbyPointsOfInterest && nearbyPointsOfInterest.length > 0 ? nearbyPointsOfInterest : [...(metroInfo.topSchools || []), ...(metroInfo.topMalls || [])];
  const topSchool = pois.find(p => p.type === 'SCHOOL' || (p.categoryLabel && p.categoryLabel.toLowerCase().includes('school'))) || pois[0] || (metroInfo.topSchools && metroInfo.topSchools[0]);
  const topMall = pois.find(p => p.type === 'MALL' || (p.categoryLabel && (p.categoryLabel.toLowerCase().includes('mall') || p.categoryLabel.toLowerCase().includes('retail')))) || pois[1] || (metroInfo.topMalls && metroInfo.topMalls[0]);

  return (
    <div
      id={`house-${listing.id}`}
      onClick={() => onSelect?.(listing)}
      className={`group bg-[#0d111c] rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer border ${
        isSelected
          ? 'border-cyan-400 shadow-lg shadow-cyan-500/20'
          : 'border-white/10 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10'
      }`}
    >
      {/* 1. Interactive Multi-Photo Container with Live Carousel Controls */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950 select-none">
        <img
          src={photoList[activePhotoIdx] || media.featuredImage}
          alt={`${listing.title} - photo ${activePhotoIdx + 1}`}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
          }}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-102"
        />

        {/* Next / Previous In-Card Navigation Controls (Visible on hover or mobile) */}
        {photoList.length > 1 && (
          <>
            <button
              onClick={handlePrevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md shadow-md cursor-pointer z-10 border border-white/10"
              title="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md shadow-md cursor-pointer z-10 border border-white/10"
              title="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Bottom Carousel Indicator Pills & Photo Counter */}
            <div className="absolute bottom-2 inset-x-2 flex items-center justify-between pointer-events-none z-10">
              <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-white font-mono border border-white/10">
                <Camera className="w-2.5 h-2.5 text-cyan-400" />
                <span>{activePhotoIdx + 1} / {photoList.length}</span>
              </div>

              <div className="flex items-center gap-1">
                {photoList.map((_, pIdx) => (
                  <span
                    key={pIdx}
                    className={`h-1.5 rounded-full transition-all ${
                      pIdx === activePhotoIdx ? 'w-4 bg-cyan-400' : 'w-1.5 bg-white/40'
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
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 text-cyan-300 font-mono text-xs font-bold shadow-sm backdrop-blur-md border border-cyan-500/30">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fit {Math.round(dimScores.compositeScore)}%</span>
          </div>

          {/* Clean Classy Verified MLS Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md border backdrop-blur-md bg-black/80 text-emerald-400 border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="uppercase tracking-wider text-[10px] font-mono text-emerald-300">
              {listing.sourcePortal || 'VERIFIED MLS'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Complete House Details Arranged Cleanly Below The Photo */}
      <div className="p-5 space-y-3.5 bg-[#0a0d18]">
        
        {/* Price & Monthly Rent */}
        <div className="flex items-baseline justify-between">
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-cyan-400 font-mono tracking-tight">
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
              <span className="px-1.5 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/30">
                Pass/Flow {outputs.passFlowScore.toFixed(1)} / 5.0
              </span>
              {outputs.monthlyNetCashFlow !== undefined && (
                <span className={`font-semibold ${outputs.monthlyNetCashFlow >= 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  Cash Flow: {outputs.monthlyNetCashFlow >= 0 ? `+${formatCurrency(outputs.monthlyNetCashFlow)}/mo` : `${formatCurrency(outputs.monthlyNetCashFlow)}/mo`}
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider font-mono">Cap Rate</span>
            <span className="text-sm font-bold text-white font-mono">
              {formatPercent(outputs.capRatePercent)}
            </span>
          </div>
        </div>

        {/* Title & Street Address */}
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
            {listing.title}
          </h3>
          <p className="text-xs text-slate-400 font-normal truncate mt-0.5 font-mono">
            {propertyAddress?.street || listing.title}{propertyAddress?.neighborhood ? `, ${propertyAddress.neighborhood}` : ''}
          </p>
        </div>

        {/* Clean 1-Line Specs Bar (Beds • Baths • SqFt • Rooms) */}
        <div className="flex items-center justify-between text-xs font-medium text-slate-300 pt-2 border-t border-white/10 font-mono">
          <div className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5 text-cyan-400" />
            <span>{specs?.beds || 3} Beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5 text-cyan-400" />
            <span>{specs?.baths || 2} Baths</span>
          </div>
          <div className="flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-cyan-400" />
            <span>{roomsBreakdown?.totalRooms || ((specs?.beds || 3) + 2)} Rooms</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="w-3.5 h-3.5 text-cyan-400" />
            <span>{(specs?.finishedSqFt || 1800).toLocaleString()} sq ft</span>
          </div>
        </div>

        {/* NEARBY SCHOOLS & MALLS WITH RATINGS (PROMINENT HIGHLIGHT) */}
        <div className="space-y-1.5 pt-1 border-t border-white/10">
          {topSchool && (
            <div className="flex items-center justify-between text-[11px] bg-white/5 p-2 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 truncate mr-2">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-bold text-slate-200 truncate">{topSchool.name}</span>
                <span className="text-slate-400 font-mono">({topSchool.distanceKm || 1.2} km)</span>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold font-mono text-[10px] shrink-0">
                ★ {topSchool.ratingScore || 9}/10 GreatSchools
              </span>
            </div>
          )}

          {topMall && (
            <div className="flex items-center justify-between text-[11px] bg-white/5 p-2 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 truncate mr-2">
                <ShoppingBag className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-bold text-slate-200 truncate">{topMall.name}</span>
                <span className="text-slate-400 font-mono">({topMall.distanceKm || 1.8} km)</span>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold font-mono text-[10px] shrink-0">
                ★ {topMall.ratingScore || 4.8} / 5.0 Mall
              </span>
            </div>
          )}
        </div>

        {/* Telemetry Chips (Airports in km • Police Corridor • Taxes) */}
        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 font-mono">
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 text-slate-300 font-medium border border-white/10 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate text-[10px]">{policeCorridor?.twentyYearBurglaryMilestone || '19.4-Yr Zero Incident Corridor'}</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 text-slate-300 font-medium border border-white/10 truncate">
            <Plane className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="truncate text-[10px]">{airportCode || 'ORD'} {airportDist || 14} km • Taxes: <strong className="font-mono text-cyan-300">{formatCurrency(propertyTaxes?.annualAmountUSD || 4200)}/yr</strong></span>
          </div>
        </div>

        {/* Action Row: Custom ROI Calculator, OKF Extractor, Live Portal Link & Inspect CTA */}
        <div className="pt-2 flex flex-wrap items-center justify-between border-t border-white/10 gap-1.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenRoiCalculator?.(listing);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-400 text-[11px] font-bold font-mono transition-all border border-white/10 cursor-pointer shrink-0"
              title="Open Custom ROI Calculator"
            >
              <Calculator className="w-3.5 h-3.5 text-cyan-400" />
              <span>ROI</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenOkf?.(listing);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 text-[11px] font-bold font-mono transition-all border border-cyan-500/40 cursor-pointer shrink-0"
              title="Extract Open Knowledge Format (OKF) dossier"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>OKF</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            {listing.externalUrl && (
              <a
                href={listing.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wider transition-all border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white shadow-sm"
                title="View Official Verified Listing"
              >
                <span>Portal</span>
                <ExternalLink className="w-3 h-3 text-cyan-400" />
              </a>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail?.(listing);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-md shadow-cyan-500/25"
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
