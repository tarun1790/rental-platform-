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
  Sparkles
} from 'lucide-react';
import { ShikaakPropertyListing } from '../../types/property';
import { formatCurrency, formatPercent } from '../../lib/roi-engine';

interface PropertyCardProps {
  listing: ShikaakPropertyListing;
  isSelected?: boolean;
  onSelect?: (listing: ShikaakPropertyListing) => void;
  onOpenDetail?: (listing: ShikaakPropertyListing) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  listing,
  isSelected = false,
  onSelect,
  onOpenDetail,
}) => {
  const { specs, financials, propertyAddress, media, propertyTaxes, roomsBreakdown, forestResources, timezone, airport } = listing;
  const { inputs, outputs } = financials;

  return (
    <div
      onClick={() => onSelect?.(listing)}
      className={`group bg-white rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer border ${
        isSelected
          ? 'border-red-600 ring-4 ring-red-500/15 shadow-xl shadow-red-500/10'
          : 'border-slate-200/80 hover:border-red-300 hover:shadow-lg'
      }`}
    >
      {/* 1. Spacious Photo Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={media.featuredImage}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Top Floating Subtle Badges */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between pointer-events-none">
          {/* Pass/Flow Score Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-red-600 font-mono text-xs font-black backdrop-blur-md shadow-md border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>Pass/Flow {outputs.passFlowScore.toFixed(1)}</span>
          </div>

          {/* Location / Time Zone Tag */}
          <div className="px-2.5 py-1 rounded-full bg-white/95 text-slate-800 font-sans text-[11px] font-bold backdrop-blur-md shadow-md border border-slate-200">
            {propertyAddress.city}, {propertyAddress.state}
          </div>
        </div>
      </div>

      {/* 2. Airy, Minimalist Body */}
      <div className="p-5 space-y-3.5 bg-white">
        
        {/* Price & Monthly Rent */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-600 font-mono tracking-tight">
              {formatCurrency(inputs.purchasePrice)}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">
              {formatCurrency(inputs.monthlyGrossRent)}/mo
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Cap Rate</span>
            <span className="text-sm font-black text-slate-900 font-mono">
              {formatPercent(outputs.capRatePercent)}
            </span>
          </div>
        </div>

        {/* Title & Street Address */}
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors truncate">
            {listing.title}
          </h3>
          <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
            {propertyAddress.street}, {propertyAddress.neighborhood}
          </p>
        </div>

        {/* Clean 1-Line Specs Bar (Beds • Baths • SqFt • Rooms) */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Bed className="w-3.5 h-3.5 text-red-500" />
            <span>{specs.beds} Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-3.5 h-3.5 text-red-500" />
            <span>{specs.baths} Baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Square className="w-3.5 h-3.5 text-red-500" />
            <span>{specs.finishedSqFt.toLocaleString()} sq ft</span>
          </div>
        </div>

        {/* Clean Telemetry Pills Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-50/80 text-red-700 text-[11px] font-bold border border-red-100">
            <Plane className="w-3 h-3 text-red-500" />
            <span>{airport?.primaryAirportIATA || 'ORD'} {airport?.distanceToAirportKm || 24} km</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 text-slate-700 text-[11px] font-bold border border-slate-200">
            <TreePine className="w-3 h-3 text-emerald-600" />
            <span>{forestResources?.forestCanopyCoveragePercent || 34}% Canopy</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 text-slate-700 text-[11px] font-bold border border-slate-200">
            <span>Taxes: {formatCurrency(propertyTaxes.annualAmountUSD)}/yr</span>
          </span>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <span className="text-xs text-slate-500 font-medium">
            Net Cash Flow: <strong className="text-red-600 font-mono">+{formatCurrency(outputs.monthlyNetCashFlow)}/mo</strong>
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail?.(listing);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm group-hover:scale-105"
          >
            <span>Inspect</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
