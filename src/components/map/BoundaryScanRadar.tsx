'use client';

import React, { useState } from 'react';
import { 
  Compass, 
  GraduationCap, 
  ShoppingBag, 
  ShieldCheck, 
  DollarSign, 
  Sun, 
  Layers, 
  Building, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  TreePine,
  Activity,
  Award,
  Train,
  Wind,
  Plane,
  Flame,
  Globe,
  Clock
} from 'lucide-react';
import { ShikaakPropertyListing } from '../../types/property';
import { formatCurrency, formatPercent } from '../../lib/roi-engine';

interface BoundaryScanRadarProps {
  enclosedListings: ShikaakPropertyListing[];
  selectedListing: ShikaakPropertyListing | null;
  onSelectListing: (listing: ShikaakPropertyListing) => void;
  onOpenFullDetail: (listing: ShikaakPropertyListing) => void;
  onClose: () => void;
}

type RadarTab = 'airports_transit' | 'heatwaves_timezone' | 'schools_malls' | 'forest_climate' | 'taxes_police' | 'soil_foundation' | 'rooms_blueprint';

export const BoundaryScanRadar: React.FC<BoundaryScanRadarProps> = ({
  enclosedListings,
  selectedListing,
  onSelectListing,
  onOpenFullDetail,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<RadarTab>('airports_transit');

  const activeProperty = selectedListing || enclosedListings[0];
  if (!activeProperty) return null;

  const { nearbyPointsOfInterest, propertyTaxes, policeCorridor, climateTelemetry, geotechnical, roomsBreakdown, specs, financials, forestResources, propertyAddress, timezone, heatWaves, airport } = activeProperty;

  return (
    <div className="absolute top-16 left-4 right-4 sm:right-auto sm:w-[500px] max-h-[82vh] z-30 bg-white border-2 border-red-500 rounded-3xl shadow-2xl shadow-red-500/10 overflow-hidden flex flex-col text-slate-900 select-none animate-in fade-in slide-in-from-top-4">
      
      {/* 1. TOP HEADER (WHITE & RED) */}
      <div className="p-4 bg-red-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white text-red-600 flex items-center justify-center font-bold shadow-md">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider">
                Geospatial Proximity Radar
              </span>
              <span className="text-[9px] px-2 py-0.2 bg-white text-red-700 font-mono font-bold rounded-full">
                {enclosedListings.length} Scanned
              </span>
              <span className="text-[9px] px-1.5 py-0.2 bg-red-800 text-white font-mono rounded">
                {propertyAddress.state} ({timezone?.timeZoneCode || 'MST'})
              </span>
            </div>
            <p className="text-[11px] text-red-100 font-medium truncate max-w-[300px]">
              {propertyAddress.street}, {propertyAddress.neighborhood}, {propertyAddress.city}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-white/20 hover:bg-white text-white hover:text-red-600 flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. TAB CONTROLS (WHITE & RED) */}
      <div className="flex items-center bg-red-50 p-1.5 border-b border-red-100 gap-1 overflow-x-auto text-[11px]">
        {[
          { id: 'airports_transit', label: 'Airports (km)', icon: Plane },
          { id: 'heatwaves_timezone', label: 'Heat Waves & Time', icon: Flame },
          { id: 'schools_malls', label: 'Schools & Malls (km)', icon: GraduationCap },
          { id: 'forest_climate', label: 'Forest & Canopy', icon: TreePine },
          { id: 'taxes_police', label: 'Taxes & Police', icon: DollarSign },
          { id: 'soil_foundation', label: 'Soil & Bedrock', icon: Layers },
          { id: 'rooms_blueprint', label: 'Rooms & Blueprint', icon: Building },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as RadarTab)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-red-600 hover:bg-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. SCROLLABLE TAB BODY (WHITE & RED) */}
      <div className="p-4 space-y-3 overflow-y-auto max-h-[50vh] text-xs bg-white">
        
        {/* TAB: AIRPORTS & REGIONAL TRANSIT */}
        {activeTab === 'airports_transit' && (
          <div className="space-y-3">
            <div className="p-3.5 bg-red-50/60 rounded-2xl border-2 border-red-300 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-red-700 font-black">
                  <Plane className="w-4 h-4 text-red-600" />
                  <span className="uppercase tracking-wide">Nearest Major International Airport</span>
                </div>
                <span className="px-2 py-0.5 bg-red-600 text-white font-mono font-bold rounded-lg text-[10px]">
                  {airport?.primaryAirportIATA || 'DEN'}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-red-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">
                  {airport?.primaryAirportName || 'Denver International Airport'}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="text-slate-600">
                    Distance: <strong className="text-red-600 font-mono">{airport?.distanceToAirportKm || 34.2} km</strong>
                  </div>
                  <div className="text-slate-600">
                    Drive Time: <strong className="text-slate-900 font-mono">{airport?.driveTimeToAirportMinutes || 32} min</strong>
                  </div>
                  <div className="text-slate-600">
                    Express Train: <strong className="text-red-600 font-mono">{airport?.directTransitAvailable ? 'Direct Airport Line' : 'Regional Express'}</strong>
                  </div>
                  <div className="text-slate-600">
                    Hub Rank: <strong className="text-slate-900 font-mono">{airport?.annualPassengerVolumeRank || '#3 Busiest in US'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Local Transit Points */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-red-600 tracking-wider block">
                Local Rapid Transit & Commute Corridors
              </span>
              {nearbyPointsOfInterest.filter(p => p.type === 'TRANSIT').map((poi) => (
                <div key={poi.id} className="p-2.5 bg-red-50/30 rounded-xl border border-red-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 text-xs">{poi.name}</span>
                    <p className="text-[10px] text-slate-600">{poi.keyHighlight}</p>
                  </div>
                  <span className="text-xs font-black text-red-600 font-mono">{poi.distanceKm} km</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: HEAT WAVES & TIMEZONES */}
        {activeTab === 'heatwaves_timezone' && (
          <div className="space-y-3">
            {/* Timezone Card */}
            <div className="p-3.5 bg-red-50/50 rounded-2xl border border-red-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-red-700 font-black">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span className="uppercase tracking-wide">Official Time Zone Telemetry</span>
                </div>
                <span className="px-2 py-0.5 bg-red-600 text-white font-mono font-bold rounded-lg text-[10px]">
                  {timezone?.timeZoneCode || 'MST'} ({timezone?.utcOffset || 'UTC-7'})
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-2 bg-white rounded-xl border border-red-200">
                  <span className="text-slate-500 block text-[10px]">Time Zone Name</span>
                  <span className="font-bold text-slate-900">{timezone?.timeZoneName || 'Mountain Standard Time'}</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-red-200">
                  <span className="text-slate-500 block text-[10px]">Daylight Saving</span>
                  <span className="font-bold text-red-600">{timezone?.daylightSavingObserved ? 'Observed (Active)' : 'Standard'}</span>
                </div>
              </div>
            </div>

            {/* Heat Waves Telemetry */}
            <div className="p-3.5 bg-white border-2 border-red-300 rounded-2xl space-y-2 shadow-sm">
              <div className="flex items-center gap-1.5 text-red-700 font-black">
                <Flame className="w-4 h-4 text-red-600" />
                <span className="uppercase tracking-wide">Heat Wave & Extreme Thermal Telemetry</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-red-50/40 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">Annual Heat Wave Days</span>
                  <span className="text-sm font-black text-red-600 font-mono">{heatWaves?.annualHeatWaveDaysCount || 11} Days/yr</span>
                </div>
                <div className="p-2 bg-red-50/40 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">Peak Heat Index</span>
                  <span className="text-sm font-black text-slate-900 font-mono">{heatWaves?.peakSummerHeatIndexF || 97.5}°F</span>
                </div>
                <div className="p-2 bg-red-50/40 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">Urban Heat Island</span>
                  <span className="font-bold text-slate-900 font-mono">{heatWaves?.urbanHeatIslandAnomalyF || -0.5}°F vs Regional</span>
                </div>
                <div className="p-2 bg-red-50/40 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">Canopy Shade Cooling</span>
                  <span className="font-bold text-red-600 font-mono">{heatWaves?.shadeCanopyCoolingEffectF || -4.8}°F Cooling</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-600 italic pt-1">
                {heatWaves?.historicalHeatWaveTrend || 'High altitude dry cooling effect with minimal extreme heat wave risk.'}
              </p>
            </div>
          </div>
        )}

        {/* TAB: SCHOOLS, MALLS, HOSPITALS WITH EXACT KM DISTANCES */}
        {activeTab === 'schools_malls' && (
          <div className="space-y-2.5">
            <div className="text-[11px] font-black uppercase text-red-600 tracking-wider">
              Exact Distance in Kilometers from {propertyAddress.street}
            </div>

            {nearbyPointsOfInterest.map((poi) => (
              <div 
                key={poi.id} 
                className="p-3 bg-red-50/40 rounded-2xl border border-red-200 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase text-red-600">{poi.categoryLabel}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">{poi.name}</h4>
                  <p className="text-[11px] text-slate-600">{poi.keyHighlight}</p>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <span className="text-base font-black text-red-600 font-mono block">
                    {poi.distanceKm} km
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {poi.driveTimeMinutes} min drive • {poi.walkTimeMinutes} min walk
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: FOREST RESOURCES, TREE CANOPY & MICROCLIMATE */}
        {activeTab === 'forest_climate' && (
          <div className="space-y-3">
            <div className="p-3.5 bg-red-50/50 rounded-2xl border-2 border-red-300 space-y-2">
              <div className="flex items-center gap-1.5 text-red-700 font-black">
                <TreePine className="w-4 h-4 text-red-600" />
                <span className="uppercase tracking-wide">Urban Forest & Green Resources</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-white rounded-xl border border-red-200">
                  <span className="text-slate-500 block text-[10px] font-bold">Urban Forest Canopy</span>
                  <span className="text-sm font-black text-red-600 font-mono">
                    {forestResources?.forestCanopyCoveragePercent || 38}% Canopy
                  </span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-red-200">
                  <span className="text-slate-500 block text-[10px] font-bold">Distance to Forest/Park</span>
                  <span className="text-sm font-black text-red-600 font-mono">
                    {forestResources?.distanceToForestKm || 0.4} km
                  </span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-red-200 col-span-2">
                  <span className="text-slate-500 block text-[10px] font-bold">Nearest Park / Forest Resource</span>
                  <span className="font-bold text-slate-900">
                    {forestResources?.nearestParkOrForestName || 'Rocky Mountain Foothills Forest'}
                  </span>
                  <span className="text-[10px] text-red-600 font-mono block mt-0.5">
                    {forestResources?.treeAcreageNearby || 4200} Acres • {forestResources?.carbonSequestrationRating || 'Grade A+'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-red-200 space-y-2">
              <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">
                Microclimate & Surface Telemetry
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-red-50/40 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">Surface Temperature</span>
                  <span className="font-bold text-slate-900 font-mono">{climateTelemetry.surfaceTempC}°C ({climateTelemetry.surfaceTempF}°F)</span>
                </div>
                <div className="p-2 bg-red-50/40 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">Air Quality (AQI)</span>
                  <span className="font-bold text-red-600 font-mono">{climateTelemetry.airQualityIndexAQI} AQI ({climateTelemetry.airQualityVerdict})</span>
                </div>
                <div className="p-2 bg-red-50/40 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">Summer Peak / Winter Low</span>
                  <span className="font-bold text-slate-900 font-mono">+{climateTelemetry.summerPeakTempC}°C / {climateTelemetry.winterLowTempC}°C</span>
                </div>
                <div className="p-2 bg-red-50/40 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">FEMA Flood Zone</span>
                  <span className="font-bold text-slate-900">{climateTelemetry.floodZoneTier}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PROPERTY TAXES & POLICE CORRIDORS */}
        {activeTab === 'taxes_police' && (
          <div className="space-y-3">
            <div className="p-3.5 bg-red-50/50 rounded-2xl border border-red-200 space-y-2">
              <div className="flex items-center gap-1.5 text-red-700 font-black">
                <DollarSign className="w-4 h-4 text-red-600" />
                <span className="uppercase tracking-wide">{propertyTaxes.countyName} Annual Taxes</span>
              </div>
              <div className="divide-y divide-red-200 text-xs">
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">Annual Property Tax:</span>
                  <span className="font-bold text-red-600 font-mono">{formatCurrency(propertyTaxes.annualAmountUSD)}/yr</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">Effective Tax Rate:</span>
                  <span className="font-bold text-slate-900 font-mono">{propertyTaxes.effectiveTaxRatePercent}%</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">County Assessed Value:</span>
                  <span className="font-bold text-slate-900 font-mono">{formatCurrency(propertyTaxes.assessedValueUSD)}</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">Monthly Tax Escrow:</span>
                  <span className="font-bold text-red-600 font-mono">${Math.round(propertyTaxes.annualAmountUSD / 12)}/mo</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-red-200 space-y-2">
              <div className="flex items-center gap-1.5 text-red-700 font-black">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span className="uppercase tracking-wide">Police & Security Patrol Corridor</span>
              </div>
              <div className="divide-y divide-red-100 text-xs">
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">Precinct District:</span>
                  <span className="font-bold text-slate-900 font-mono">{policeCorridor.precinctDistrict}</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">Active Sector Beat:</span>
                  <span className="font-bold text-slate-900">{policeCorridor.patrolCorridorName}</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">911 Response Arrival Speed:</span>
                  <span className="font-bold text-red-600 font-mono">{policeCorridor.dispatchAvgMinutes} Minutes</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SUBSURFACE SOIL & BEDROCK */}
        {activeTab === 'soil_foundation' && (
          <div className="space-y-3">
            <div className="p-3.5 bg-red-50/50 rounded-2xl border border-red-200 space-y-2">
              <div className="flex items-center gap-1.5 text-red-700 font-black">
                <Layers className="w-4 h-4 text-red-600" />
                <span className="uppercase tracking-wide">Subsurface Geotechnical Mechanics</span>
              </div>
              <div className="divide-y divide-red-200 text-xs">
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">Underground Soil Classification:</span>
                  <span className="font-bold text-slate-900">{geotechnical.soilClassification}</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">Bearing Capacity (PSF):</span>
                  <span className="font-black text-red-600 font-mono">{geotechnical.bearingCapacityPSF.toLocaleString()} PSF ({geotechnical.bearingCapacityKPa} kPa)</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">Depth to Solid Limestone / Granite Bedrock:</span>
                  <span className="font-bold text-slate-900 font-mono">{geotechnical.bedrockDepthFeet} ft</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">Basement Water Table Safety:</span>
                  <span className="font-bold text-red-600 font-mono">{geotechnical.waterTableDepthFeet} ft (Dry Basement)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ROOMS BREAKDOWN & BLUEPRINT DIMENSIONS */}
        {activeTab === 'rooms_blueprint' && (
          <div className="space-y-3">
            <div className="p-3 bg-red-50/40 rounded-2xl border border-red-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-red-700">
                <span>Room Dimensions Breakdown</span>
                <span className="font-mono">{roomsBreakdown.totalRooms} Total Rooms ({specs.finishedSqFt.toLocaleString()} sq ft)</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {roomsBreakdown.roomDetails.map((rm, idx) => (
                  <div key={idx} className="p-2 bg-white rounded-xl border border-red-100 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-900">{rm.name} ({rm.level} Level)</span>
                    <span className="font-mono text-red-600 font-bold">{rm.dimensions} • {rm.sqFt} sq ft</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. BOTTOM ACTION BAR (WHITE & RED) */}
      <div className="p-3.5 bg-red-50 border-t border-red-200 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-600 font-bold block uppercase">Pass/Flow Rating</span>
          <span className="text-sm font-black text-red-600 font-mono">
            {financials.outputs.passFlowScore.toFixed(1)} / 5.0 Grade
          </span>
        </div>

        <button
          onClick={() => onOpenFullDetail(activeProperty)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-red-500/20 hover:scale-105"
        >
          <span>Open Full Intelligence Deep-Dive</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
