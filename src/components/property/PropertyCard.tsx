'use client';

import React from 'react';
import { 
  Bed, 
  Bath, 
  Square, 
  ShieldCheck, 
  Layers, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  ChevronRight, 
  MapPin, 
  DollarSign, 
  GraduationCap, 
  ShoppingBag,
  Building,
  TreePine,
  Sun,
  Plane,
  Flame,
  Globe
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
  const { specs, geotechnical, safety, financials, propertyAddress, media, propertyTaxes, roomsBreakdown, nearbyPointsOfInterest, forestResources, climateTelemetry, timezone, heatWaves, airport } = listing;
  const { inputs, outputs } = financials;

  const nearestSchool = nearbyPointsOfInterest.find((p) => p.type === 'SCHOOL') || nearbyPointsOfInterest[0];
  const nearestMall = nearbyPointsOfInterest.find((p) => p.type === 'MALL') || nearbyPointsOfInterest[1];

  return (
    <div
      onClick={() => onSelect?.(listing)}
      className={`group relative bg-white border-2 rounded-3xl overflow-hidden shadow-sm transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'border-red-600 ring-4 ring-red-500/20 shadow-xl shadow-red-500/10'
          : 'border-red-100 hover:border-red-400 hover:shadow-md'
      }`}
    >
      {/* Image Container with Pure White & Red Badges (NO BLACK) */}
      <div className="relative aspect-[16/10] overflow-hidden bg-red-50/30">
        <img
          src={media.featuredImage}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Floating White & Red Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          {/* Pass/Flow Score Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-red-700 font-mono text-xs font-bold backdrop-blur-md shadow-md border-2 border-red-500">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>Pass/Flow: {outputs.passFlowScore.toFixed(1)} / 5.0</span>
            <span className="text-[9px] px-1.5 py-0.2 bg-red-100 text-red-800 rounded font-sans uppercase font-bold">
              {outputs.passFlowVerdict === 'PASS_TO_FLOW' ? 'PASS' : 'REVIEW'}
            </span>
          </div>

          {/* Time Zone & State Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-red-700 font-mono text-[11px] font-bold backdrop-blur-md border border-red-300 shadow-md">
            <Globe className="w-3 h-3 text-red-600" />
            <span>{propertyAddress.state} ({timezone?.timeZoneCode || 'CST'})</span>
          </div>
        </div>

        {/* Bottom Price Tag Overlay (White & Red) */}
        <div className="absolute bottom-3 left-3 bg-white/95 text-red-600 px-3.5 py-2 rounded-2xl backdrop-blur-md shadow-lg border-2 border-red-500 flex items-baseline gap-2">
          <span className="text-lg font-black font-mono tracking-tight">
            {formatCurrency(inputs.purchasePrice)}
          </span>
          <span className="text-xs font-bold text-slate-700 font-mono">
            {formatCurrency(inputs.monthlyGrossRent)}/mo rent
          </span>
        </div>
      </div>

      {/* Card Body (Strictly White & Red) */}
      <div className="p-4 sm:p-5 space-y-3 bg-white">
        {/* Address, City, State & Neighborhood */}
        <div>
          <div className="flex items-center justify-between text-red-600 text-xs font-bold mb-0.5">
            <div className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="truncate">{propertyAddress.street}, {propertyAddress.neighborhood}</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-red-50 rounded-lg border border-red-200">
              {propertyAddress.city}, {propertyAddress.state}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors truncate">
            {listing.title}
          </h3>
        </div>

        {/* Rooms Breakdown & Specs Bar */}
        <div className="flex items-center justify-between text-xs text-slate-700 font-semibold border-y border-red-100 py-2.5 bg-red-50/30 px-2 rounded-xl">
          <div className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5 text-red-500" />
            <span>{specs.beds} Beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5 text-red-500" />
            <span>{specs.baths} Baths</span>
          </div>
          <div className="flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-red-500" />
            <span>{roomsBreakdown.totalRooms} Rooms</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="w-3.5 h-3.5 text-red-500" />
            <span>{specs.finishedSqFt.toLocaleString()} sq ft</span>
          </div>
        </div>

        {/* Airports, Heat Waves, Forest Resources & Proximity in KM */}
        <div className="grid grid-cols-2 gap-2 text-[11px] bg-red-50/40 p-3 rounded-2xl border border-red-200">
          <div className="flex items-center gap-1.5 text-slate-800 truncate">
            <Plane className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="truncate">✈️ {airport?.primaryAirportIATA || 'ORD'} ({airport?.distanceToAirportKm || 24} km)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-800 truncate">
            <Flame className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="truncate">🔥 {heatWaves?.annualHeatWaveDaysCount || 12} Heat Days/yr ({heatWaves?.peakSummerHeatIndexF || 97}°F)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-800 truncate">
            <TreePine className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="truncate">🌲 {forestResources?.forestCanopyCoveragePercent || 34}% Canopy ({forestResources?.distanceToForestKm || 0.4} km)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-800 truncate">
            <DollarSign className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>Taxes: <strong className="text-red-700 font-mono">{formatCurrency(propertyTaxes.annualAmountUSD)}/yr</strong></span>
          </div>
        </div>

        {/* Soil & Climate Bar */}
        <div className="flex items-center justify-between text-[11px] px-2 py-1.5 bg-white border border-red-100 rounded-xl text-slate-700">
          <div className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-red-600" />
            <span>Soil: <strong className="text-red-600 font-mono">{geotechnical.bearingCapacityPSF.toLocaleString()} PSF</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <Sun className="w-3.5 h-3.5 text-red-600" />
            <span>Climate: <strong className="text-slate-900 font-mono">{climateTelemetry.surfaceTempC}°C</strong> (AQI {climateTelemetry.airQualityIndexAQI})</span>
          </div>
        </div>

        {/* Financial ROI Metrics & CTA */}
        <div className="pt-1 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Net Flow</span>
              <span className="font-bold text-red-600 font-mono">
                +{formatCurrency(outputs.monthlyNetCashFlow)}/mo
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Cap Rate</span>
              <span className="font-bold text-slate-900 font-mono">
                {formatPercent(outputs.capRatePercent)}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail?.(listing);
            }}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-red-500/20 group-hover:scale-105"
          >
            <span>Inspect</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
