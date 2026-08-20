'use client';

import React from 'react';
import { 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  ChevronRight, 
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
  Calculator
} from 'lucide-react';
import { ShikaakPropertyListing } from '../../types/property';
import { formatCurrency, formatPercent } from '../../lib/roi-engine';

interface PropertyCardProps {
  listing: ShikaakPropertyListing;
  isSelected?: boolean;
  onSelect?: (listing: ShikaakPropertyListing) => void;
  onOpenDetail?: (listing: ShikaakPropertyListing) => void;
  onOpenRoiCalculator?: (listing: ShikaakPropertyListing) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  listing,
  isSelected = false,
  onSelect,
  onOpenDetail,
  onOpenRoiCalculator,
}) => {
  const { specs, geotechnical, financials, propertyAddress, media, propertyTaxes, roomsBreakdown, forestResources, timezone, airport, heatWaves, policeCorridor, climateTelemetry, nearbyPointsOfInterest } = listing;
  const { inputs, outputs } = financials;

  const topSchool = nearbyPointsOfInterest.find(p => p.type === 'SCHOOL' || p.categoryLabel.toLowerCase().includes('school')) || nearbyPointsOfInterest[0];
  const topMall = nearbyPointsOfInterest.find(p => p.type === 'MALL' || p.categoryLabel.toLowerCase().includes('mall') || p.categoryLabel.toLowerCase().includes('retail')) || nearbyPointsOfInterest[1];

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
      {/* 1. Spacious Photo Container (Top) */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={media.featuredImage}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out"
        />

        {/* Top Floating Subtle Badges */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between pointer-events-none">
          {/* Pass/Flow Score Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-red-500 font-mono text-xs font-bold shadow-sm border border-slate-200">
            <span>Pass/Flow {outputs.passFlowScore.toFixed(1)}</span>
          </div>

          {/* Location / Time Zone Tag */}
          <div className="px-2.5 py-1 rounded-full bg-white/95 text-slate-700 font-sans text-[11px] font-medium shadow-sm border border-slate-200">
            {propertyAddress.city}, {propertyAddress.state} ({timezone?.timeZoneCode || 'CST'})
          </div>
        </div>
      </div>

      {/* 2. Complete House Details Arranged Cleanly Below The Photo */}
      <div className="p-5 space-y-3.5 bg-white">
        
        {/* Price & Monthly Rent */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-500 font-mono tracking-tight">
              {formatCurrency(inputs.purchasePrice)}
            </span>
            <span className="text-xs font-medium text-slate-400 font-mono">
              {formatCurrency(inputs.monthlyGrossRent)}/mo rent
            </span>
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
            <span>{specs.finishedSqFt.toLocaleString()} sq ft</span>
          </div>
        </div>

        {/* NEARBY SCHOOLS & MALLS WITH RATINGS (PROMINENT HIGHLIGHT) */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100">
          {topSchool && (
            <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 truncate mr-2">
                <GraduationCap className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="font-semibold text-slate-800 truncate">{topSchool.name}</span>
                <span className="text-slate-400 font-mono">({topSchool.distanceKm} km)</span>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold font-mono text-[10px] shrink-0">
                ★ {topSchool.ratingScore}/10
              </span>
            </div>
          )}

          {topMall && (
            <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 truncate mr-2">
                <ShoppingBag className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="font-semibold text-slate-800 truncate">{topMall.name}</span>
                <span className="text-slate-400 font-mono">({topMall.distanceKm} km)</span>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold font-mono text-[10px] shrink-0">
                ★ {topMall.ratingScore} / 5.0
              </span>
            </div>
          )}
        </div>

        {/* Telemetry Chips (Airports in km • Taxes) */}
        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 text-slate-700 font-medium border border-slate-200 truncate">
            <Plane className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{airport?.primaryAirportIATA || 'ORD'} {airport?.distanceToAirportKm || 24} km</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 text-slate-700 font-medium border border-slate-200 truncate">
            <span>Taxes: <strong className="font-mono text-slate-800">{formatCurrency(propertyTaxes.annualAmountUSD)}/yr</strong></span>
          </div>
        </div>

        {/* Action Row: Custom ROI Calculator & Inspect CTA */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenRoiCalculator?.(listing);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-bold transition-all border border-slate-200"
          >
            <Calculator className="w-3.5 h-3.5 text-red-500" />
            <span>ROI Calculator</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail?.(listing);
            }}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider transition-all"
          >
            <span>Inspect</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
