'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CHICAGO_LISTINGS } from '../../data/chicago-listings';
import { 
  Home, 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  ShieldCheck, 
  Layers, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  ChevronRight, 
  Compass, 
  Sun, 
  Wind, 
  Award, 
  Utensils, 
  ShoppingBag, 
  Film, 
  GraduationCap, 
  CheckCircle2, 
  Building, 
  FileText,
  PhoneCall,
  Share2,
  Calendar,
  Globe,
  Scan,
  Activity,
  Database,
  DollarSign,
  Train,
  TreePine,
  Plane,
  Flame
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../../lib/roi-engine';
import { BlueprintFurnitureStaging } from './BlueprintFurnitureStaging';
import { RoiCalculatorWidget } from './RoiCalculatorWidget';
import { GeminiVisionInspector } from '../intelligence/GeminiVisionInspector';
import { VertexPredictivePanel } from '../intelligence/VertexPredictivePanel';
import { getNeighborhoodSpectralMetrics, EARTH_ENGINE_LAYERS } from '../../lib/earth-engine';

type TabType = 'overview' | 'airports_timezone' | 'heatwaves' | 'proximity_km' | 'forest_climate' | 'taxes_police' | 'earth_engine' | 'vertex_predictive' | 'geotechnical' | 'cad' | 'roi' | 'apply';

interface PropertyDetailClientProps {
  propertyId: string;
}

export const PropertyDetailClient: React.FC<PropertyDetailClientProps> = ({ propertyId }) => {
  const router = useRouter();

  const listing = CHICAGO_LISTINGS.find((p) => p.id === propertyId) || CHICAGO_LISTINGS[0];

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantIncome, setApplicantIncome] = useState('$145,000');

  const { specs, geotechnical, safety, amenities, microclimate, blueprint, financials, propertyAddress, media, propertyTaxes, roomsBreakdown, nearbyPointsOfInterest, policeCorridor, climateTelemetry, forestResources, timezone, heatWaves, airport } = listing;
  const { outputs } = financials;

  const spectralMetrics = getNeighborhoodSpectralMetrics(propertyAddress.neighborhood);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplicationSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col select-none">
      
      {/* Top Sticky Header (White & Red) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-red-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Map & Listings</span>
            </Link>

            <div className="hidden md:flex items-center gap-2 border-l border-red-100 pl-4">
              <span className="font-bold text-sm text-slate-900">{propertyAddress.street}</span>
              <span className="text-xs text-red-600 font-semibold">• {propertyAddress.neighborhood}, {propertyAddress.city}, {propertyAddress.state}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGeminiModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-500/20"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Gemini Vision Scan</span>
            </button>

            <div className="text-right">
              <span className="text-base font-black text-red-600 font-mono">
                {formatCurrency(financials.inputs.purchasePrice)}
              </span>
              <span className="text-xs font-semibold text-slate-700 block">
                {formatCurrency(financials.inputs.monthlyGrossRent)}/mo rent
              </span>
            </div>

            <button
              onClick={() => setActiveTab('apply')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20 transition-all hover:scale-105"
            >
              Apply Online
            </button>
          </div>
        </div>
      </header>

      {/* Main Full-Page Content Container (White & Red) */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        
        {/* Top Hero Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-red-50/50 rounded-3xl border-2 border-red-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-lg bg-red-600 text-white">
                {specs.propertyType.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-slate-700 font-semibold">{propertyAddress.state} ({timezone?.timeZoneCode || 'MST'})</span>
              <span className="text-xs text-red-600 font-bold">• Taxes: {formatCurrency(propertyTaxes.annualAmountUSD)}/yr</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {propertyAddress.street}
            </h1>
            <p className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span>{propertyAddress.neighborhood}, {propertyAddress.city}, {propertyAddress.state} {propertyAddress.zipCode}</span>
            </p>
          </div>

          {/* Key Pass/Flow Badge */}
          <div className="flex items-center gap-3 p-3.5 bg-white border-2 border-red-400 rounded-2xl shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Investment Grade</span>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-red-600 font-mono">
                  {outputs.passFlowScore.toFixed(1)} / 5.0
                </span>
                <span className="text-[10px] font-black px-2 py-0.2 bg-red-100 text-red-800 rounded">
                  PASS TO FLOW
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation (White & Red) */}
        <div className="border-2 border-red-200 bg-red-50/50 rounded-2xl p-1.5 shadow-sm flex items-center gap-1 overflow-x-auto text-xs">
          {[
            { id: 'overview', label: 'Overview & Gallery', icon: Building },
            { id: 'airports_timezone', label: 'Airports & Timezones', icon: Plane },
            { id: 'heatwaves', label: 'Heat Waves & Thermals', icon: Flame },
            { id: 'proximity_km', label: 'Proximity Radar (km)', icon: GraduationCap },
            { id: 'forest_climate', label: 'Forest & Canopy', icon: TreePine },
            { id: 'taxes_police', label: 'Taxes & Police Corridors', icon: DollarSign },
            { id: 'earth_engine', label: 'Earth Engine Spectrum', icon: Globe },
            { id: 'vertex_predictive', label: 'Vertex 5-Yr Forecast', icon: TrendingUp },
            { id: 'geotechnical', label: 'Soil & Foundation', icon: Layers },
            { id: 'cad', label: 'CAD Blueprint & Staging', icon: Compass },
            { id: 'roi', label: 'Institutional ROI Suite', icon: Activity },
            { id: 'apply', label: 'Digital Lease Application', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 py-2 px-3.5 font-bold rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                    : 'text-slate-700 hover:text-red-600 hover:bg-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & GALLERY */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 aspect-[16/10] rounded-3xl overflow-hidden bg-red-50/30 border-2 border-red-200 shadow-sm relative group">
                <img
                  src={media.gallery[selectedImageIndex] || media.featuredImage}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setIsGeminiModalOpen(true)}
                  className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/95 hover:bg-red-600 hover:text-white text-red-600 text-xs font-bold rounded-xl border-2 border-red-500 shadow-xl backdrop-blur-md transition-all hover:scale-105"
                >
                  <Scan className="w-4 h-4" />
                  <span>Inspect with Gemini Vision</span>
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {media.gallery.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedImageIndex === idx ? 'border-red-600 ring-2 ring-red-500/30' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Specs Grid (White & Red) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-5 bg-red-50/40 border-2 border-red-200 rounded-3xl shadow-sm">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 uppercase font-bold">Rooms Breakdown</span>
                <div className="text-lg font-black text-slate-900">{roomsBreakdown.totalRooms} Rooms ({specs.beds} Beds • {specs.baths} Baths)</div>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 uppercase font-bold">Airport Distance</span>
                <div className="text-lg font-black text-red-600 font-mono">✈️ {airport?.primaryAirportIATA} ({airport?.distanceToAirportKm} km)</div>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 uppercase font-bold">Annual Property Taxes</span>
                <div className="text-lg font-black text-red-600 font-mono">{formatCurrency(propertyTaxes.annualAmountUSD)}/yr</div>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 uppercase font-bold">Subsurface Soil</span>
                <div className="text-lg font-black text-red-600 font-mono">{geotechnical.bearingCapacityPSF.toLocaleString()} PSF</div>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 uppercase font-bold">Police Response</span>
                <div className="text-lg font-black text-slate-900 font-mono">{policeCorridor.dispatchAvgMinutes} min arrival</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AIRPORTS & TIMEZONES */}
        {activeTab === 'airports_timezone' && (
          <div className="space-y-6">
            <div className="p-6 bg-red-50/60 rounded-3xl border-2 border-red-300 space-y-4">
              <div className="flex items-center gap-2 text-red-700">
                <Plane className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wide">
                    Aviation Gateways & Time Zone Corridors
                  </h3>
                  <p className="text-xs text-slate-600">
                    Proximity to major US international hubs, regional airports, and time synchronization.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-white rounded-2xl border-2 border-red-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Primary Hub Airport</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">
                    {airport?.primaryAirportName} ({airport?.primaryAirportIATA})
                  </span>
                  <span className="text-xs font-black text-red-600 font-mono mt-1 block">
                    {airport?.distanceToAirportKm} km distance ({airport?.driveTimeToAirportMinutes} min drive)
                  </span>
                </div>

                <div className="p-4 bg-white rounded-2xl border-2 border-red-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Airport Hub Classification</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">
                    {airport?.annualPassengerVolumeRank}
                  </span>
                  <span className="text-xs text-slate-600 block mt-1">
                    {airport?.directTransitAvailable ? 'Direct Rail / Express Transit Connected' : 'Regional Shuttle Access'}
                  </span>
                </div>

                <div className="p-4 bg-white rounded-2xl border-2 border-red-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Time Zone Standard</span>
                  <span className="text-xl font-black text-red-600 font-mono mt-1 block">
                    {timezone?.timeZoneCode} ({timezone?.utcOffset})
                  </span>
                  <span className="text-xs text-slate-600 block mt-1">
                    {timezone?.timeZoneName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HEAT WAVES & THERMAL TELEMETRY */}
        {activeTab === 'heatwaves' && (
          <div className="space-y-6">
            <div className="p-6 bg-red-50/60 rounded-3xl border-2 border-red-300 space-y-4">
              <div className="flex items-center gap-2 text-red-700">
                <Flame className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wide">
                    Heat Wave Telemetry & Extreme Weather Resilience
                  </h3>
                  <p className="text-xs text-slate-600">
                    NOAA historical heat wave monitoring, peak summer heat index, and urban shade cooling.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-4 bg-white rounded-2xl border-2 border-red-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Annual Heat Wave Days</span>
                  <span className="text-2xl font-black text-red-600 font-mono mt-1 block">
                    {heatWaves?.annualHeatWaveDaysCount || 11} Days/yr
                  </span>
                  <span className="text-[10px] text-slate-600">Days Exceeding 95°F</span>
                </div>

                <div className="p-4 bg-white rounded-2xl border-2 border-red-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Peak Heat Index</span>
                  <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                    {heatWaves?.peakSummerHeatIndexF || 97.5}°F
                  </span>
                  <span className="text-[10px] text-slate-600">Summer Maximum</span>
                </div>

                <div className="p-4 bg-white rounded-2xl border-2 border-red-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Canopy Shade Mitigation</span>
                  <span className="text-2xl font-black text-red-600 font-mono mt-1 block">
                    {heatWaves?.shadeCanopyCoolingEffectF || -4.8}°F
                  </span>
                  <span className="text-[10px] text-slate-600">Thermal Protection</span>
                </div>

                <div className="p-4 bg-white rounded-2xl border-2 border-red-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Heat Risk Classification</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">
                    {heatWaves?.extremeHeatRiskTier || 'LOW'}
                  </span>
                  <span className="text-[10px] text-slate-600">{heatWaves?.historicalHeatWaveTrend}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROXIMITY RADAR WITH EXACT KM DISTANCES */}
        {activeTab === 'proximity_km' && (
          <div className="space-y-4">
            <div className="p-5 bg-red-600 text-white rounded-3xl space-y-1">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                <h3 className="text-base font-black uppercase tracking-wide">
                  Nearby Points of Interest & Exact Distances in Kilometers
                </h3>
              </div>
              <p className="text-xs text-red-100">
                Top schools, luxury shopping malls, Level-1 trauma centers, and transit stations near {propertyAddress.street}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nearbyPointsOfInterest.map((poi) => (
                <div key={poi.id} className="p-5 bg-white border-2 border-red-200 rounded-3xl shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-red-600">{poi.categoryLabel}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{poi.name}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{poi.keyHighlight}</p>
                    </div>
                    <span className="text-xl font-black text-red-600 font-mono">
                      {poi.distanceKm} km
                    </span>
                  </div>
                  <div className="pt-2 border-t border-red-100 flex justify-between text-xs text-slate-700 font-mono font-semibold">
                    <span>{poi.distanceMiles} miles</span>
                    <span>🚗 {poi.driveTimeMinutes} min drive</span>
                    <span>🚶 {poi.walkTimeMinutes} min walk</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: FOREST RESOURCES & CLIMATE TELEMETRY */}
        {activeTab === 'forest_climate' && (
          <div className="space-y-4">
            <div className="p-6 bg-red-50/60 rounded-3xl border-2 border-red-300 space-y-4">
              <div className="flex items-center gap-2 text-red-700">
                <TreePine className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wide">
                    Forest Resources, Tree Canopy & Green Corridors
                  </h3>
                  <p className="text-xs text-slate-600">
                    Copernicus Sentinel-2 multispectral NDVI and forestry metrics.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-4 bg-white rounded-2xl border-2 border-red-200">
                  <span className="text-[11px] text-slate-500 font-bold uppercase block">Urban Forest Canopy</span>
                  <span className="text-2xl font-black text-red-600 font-mono mt-1 block">
                    {forestResources?.forestCanopyCoveragePercent || 38}%
                  </span>
                  <span className="text-[10px] text-slate-600">Protected Forest Canopy</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border-2 border-red-200">
                  <span className="text-[11px] text-slate-500 font-bold uppercase block">Distance to Forest / Park</span>
                  <span className="text-2xl font-black text-red-600 font-mono mt-1 block">
                    {forestResources?.distanceToForestKm || 0.4} km
                  </span>
                  <span className="text-[10px] text-slate-600">Walkable Green Oasis</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border-2 border-red-200">
                  <span className="text-[11px] text-slate-500 font-bold uppercase block">Sentinel-2 NDVI Index</span>
                  <span className="text-2xl font-black text-red-600 font-mono mt-1 block">
                    {forestResources?.ndviVegetationIndex || 0.68}
                  </span>
                  <span className="text-[10px] text-slate-600">High Photosynthetic Density</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-red-200 text-xs">
                <span className="text-slate-500 block font-bold">Nearest Park or Forest Resource:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {forestResources?.nearestParkOrForestName}
                </span>
                <span className="text-red-600 font-mono font-bold block mt-1">
                  {forestResources?.treeAcreageNearby} Acres Total • {forestResources?.carbonSequestrationRating}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PROPERTY TAXES & POLICE PATROL CORRIDORS */}
        {activeTab === 'taxes_police' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-red-50/50 border-2 border-red-200 rounded-3xl space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-red-600" />
                  <h4 className="text-base font-black text-red-700 uppercase">
                    {propertyTaxes.countyName} Annual Taxes
                  </h4>
                </div>
                <div className="divide-y divide-red-200 text-xs">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-700 font-medium">Annual Tax Liability:</span>
                    <span className="font-bold text-red-600 font-mono text-sm">{formatCurrency(propertyTaxes.annualAmountUSD)}/yr</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-700 font-medium">Effective Tax Rate:</span>
                    <span className="font-bold text-slate-900 font-mono">{propertyTaxes.effectiveTaxRatePercent}%</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-700 font-medium">County Assessed Value:</span>
                    <span className="font-bold text-slate-900 font-mono">{formatCurrency(propertyTaxes.assessedValueUSD)}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-700 font-medium">Monthly Tax Escrow Requirement:</span>
                    <span className="font-bold text-red-600 font-mono">${Math.round(propertyTaxes.annualAmountUSD / 12)}/mo</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border-2 border-red-200 rounded-3xl space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-red-600" />
                  <h4 className="text-base font-black text-red-700 uppercase">
                    Police & Security Patrol Corridor
                  </h4>
                </div>
                <div className="divide-y divide-red-100 text-xs">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-700 font-medium">Precinct District:</span>
                    <span className="font-bold text-slate-900 font-mono">{policeCorridor.precinctDistrict}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-700 font-medium">Active Sector Patrol:</span>
                    <span className="font-bold text-slate-900">{policeCorridor.patrolCorridorName}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-700 font-medium">911 Emergency Response Time:</span>
                    <span className="font-bold text-red-600 font-mono">{policeCorridor.dispatchAvgMinutes} Minutes</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-700 font-medium">Active Squad Units on Duty:</span>
                    <span className="font-bold text-slate-900 font-mono">{policeCorridor.activePatrolUnitsOnDuty} Squad Units</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: EARTH ENGINE & MULTISPECTRAL */}
        {activeTab === 'earth_engine' && (
          <div className="space-y-6">
            <div className="p-6 bg-red-50/60 border-2 border-red-300 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-red-700">
                <Globe className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wide">
                    Google Earth Engine & Copernicus Sentinel Telemetry
                  </h3>
                  <p className="text-xs text-slate-600">
                    Multispectral environmental biometrics for {propertyAddress.neighborhood}, {propertyAddress.city}.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-4 bg-white rounded-2xl border-2 border-red-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Sentinel-2 NDVI Canopy</span>
                  <span className="text-2xl font-black text-red-600 font-mono mt-1 block">
                    {spectralMetrics.ndviIndex}
                  </span>
                  <span className="text-[10px] text-slate-600">{spectralMetrics.treeCanopyCoveragePercent}% Urban Canopy</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border-2 border-red-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Landsat Thermal Surface</span>
                  <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                    {spectralMetrics.surfaceTempF}°F
                  </span>
                  <span className="text-[10px] text-slate-600">Deviation: +{spectralMetrics.heatIslandDeviationF}°F</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border-2 border-red-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Sentinel-5P NO₂ Air</span>
                  <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                    {spectralMetrics.airQualityNo2MicroMolM2} μmol
                  </span>
                  <span className="text-[10px] text-slate-600">{spectralMetrics.airQualityVerdict} Air Corridor</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border-2 border-red-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">InSAR Soil Subsidence</span>
                  <span className="text-2xl font-black text-red-600 font-mono mt-1 block">
                    {spectralMetrics.groundStabilityMmYr} mm/yr
                  </span>
                  <span className="text-[10px] text-slate-600">Bedrock Locked</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: VERTEX AI PREDICTIVE */}
        {activeTab === 'vertex_predictive' && (
          <VertexPredictivePanel
            propertyId={listing.id}
            purchasePrice={financials.inputs.purchasePrice}
            monthlyRent={financials.inputs.monthlyGrossRent}
            neighborhood={propertyAddress.neighborhood}
          />
        )}

        {/* TAB 9: GEOTECHNICAL & SUBSURFACE SOIL */}
        {activeTab === 'geotechnical' && (
          <div className="space-y-6">
            <div className="p-6 bg-red-50/60 border-2 border-red-300 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-red-700">
                <Layers className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wide">
                    Subsurface Soil Mechanics & Foundation Engineering
                  </h3>
                  <p className="text-xs text-slate-600">
                    Deep geotechnical and soil stability telemetry.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-white rounded-2xl border-2 border-red-200">
                  <span className="text-[11px] text-slate-500 uppercase font-bold block">Underground Soil Type</span>
                  <span className="text-base font-bold text-slate-900 mt-1 block">{geotechnical.soilClassification}</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border-2 border-red-200">
                  <span className="text-[11px] text-slate-500 uppercase font-bold block">Bearing Capacity</span>
                  <span className="text-2xl font-black text-red-600 font-mono mt-1 block">
                    {geotechnical.bearingCapacityPSF.toLocaleString()} PSF
                  </span>
                  <span className="text-[10px] text-slate-600">Zero foundation sinkage risk</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border-2 border-red-200">
                  <span className="text-[11px] text-slate-500 uppercase font-bold block">Settlement Score</span>
                  <span className="text-2xl font-black text-red-600 font-mono mt-1 block">
                    {geotechnical.settlementRiskScore} / 100
                  </span>
                  <span className="text-[10px] text-slate-600">Top 1% structural stability</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: CAD BLUEPRINT & FURNITURE STAGING */}
        {activeTab === 'cad' && (
          <BlueprintFurnitureStaging blueprint={blueprint} totalSqFt={specs.finishedSqFt} />
        )}

        {/* TAB 11: INSTITUTIONAL ROI CALCULATOR */}
        {activeTab === 'roi' && (
          <RoiCalculatorWidget initialInputs={financials.inputs} />
        )}

        {/* TAB 12: DIGITAL APPLICATION */}
        {activeTab === 'apply' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="p-6 bg-red-600 text-white rounded-3xl text-center space-y-2 shadow-lg shadow-red-500/20">
              <FileText className="w-8 h-8 text-white mx-auto" />
              <h3 className="text-lg font-black uppercase tracking-wide">
                Instant Digital Rental Application & Smart Screening
              </h3>
            </div>

            {!applicationSubmitted ? (
              <form onSubmit={handleApply} className="space-y-4 bg-white p-6 rounded-3xl border-2 border-red-200 shadow-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Applicant Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full text-xs p-3 bg-red-50/40 border border-red-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Verified Annual Income</label>
                    <input
                      type="text"
                      value={applicantIncome}
                      onChange={(e) => setApplicantIncome(e.target.value)}
                      className="w-full text-xs p-3 bg-red-50/40 border border-red-200 rounded-xl text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Target Move-In Date</label>
                    <input
                      type="date"
                      defaultValue="2026-09-01"
                      className="w-full text-xs p-3 bg-red-50/40 border border-red-200 rounded-xl text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-red-500/20 transition-all hover:scale-[1.02]"
                >
                  Submit Verified Application Instantly
                </button>
              </form>
            ) : (
              <div className="p-8 bg-red-50 border-2 border-red-300 rounded-3xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-red-600 mx-auto" />
                <h4 className="text-base font-black text-red-900">
                  Application Successfully Underwritten!
                </h4>
                <p className="text-xs text-red-700">
                  Your preliminary digital package has been transmitted for <strong>{propertyAddress.street}</strong>.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Gemini Multimodal Vision Modal */}
      <GeminiVisionInspector
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        propertyId={listing.id}
        propertyTitle={listing.title}
        propertyAddress={propertyAddress.street}
        imageUrl={media.gallery[selectedImageIndex] || media.featuredImage}
      />
    </div>
  );
};
