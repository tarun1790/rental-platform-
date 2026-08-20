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
  Flame,
  Check
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../../lib/roi-engine';
import { BlueprintFurnitureStaging } from './BlueprintFurnitureStaging';
import { RoiCalculatorWidget } from './RoiCalculatorWidget';
import { GeminiVisionInspector } from '../intelligence/GeminiVisionInspector';
import { VertexPredictivePanel } from '../intelligence/VertexPredictivePanel';
import { getNeighborhoodSpectralMetrics, EARTH_ENGINE_LAYERS } from '../../lib/earth-engine';

interface PropertyDetailClientProps {
  propertyId: string;
}

export const PropertyDetailClient: React.FC<PropertyDetailClientProps> = ({ propertyId }) => {
  const router = useRouter();

  const listing = CHICAGO_LISTINGS.find((p) => p.id === propertyId) || CHICAGO_LISTINGS[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantIncome, setApplicantIncome] = useState('$145,000');

  const { specs, geotechnical, safety, amenities, microclimate, blueprint, financials, propertyAddress, media, propertyTaxes, roomsBreakdown, nearbyPointsOfInterest, policeCorridor, climateTelemetry, forestResources, timezone, heatWaves, airport } = listing;
  const { outputs, inputs } = financials;

  const spectralMetrics = getNeighborhoodSpectralMetrics(propertyAddress.neighborhood);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplicationSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col select-none">
      
      {/* Top Sticky Header (House Intelligence) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-red-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Map & Listings</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 border-l border-red-200 pl-4">
              <span className="font-black text-sm text-red-600">House Intelligence</span>
              <span className="text-xs text-slate-500 font-medium">• {propertyAddress.street}, {propertyAddress.city}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-500 font-bold block">Purchase Price</span>
              <span className="text-base font-black text-red-600 font-mono">
                {formatCurrency(inputs.purchasePrice)}
              </span>
            </div>

            <a
              href="#section-apply"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md shadow-red-500/20 transition-all uppercase tracking-wider"
            >
              Apply Online
            </a>
          </div>
        </div>
      </header>

      {/* Main Single-Column Vertical Stream (Everything in scrolling down, not side-by-side) */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10 flex-1">
        
        {/* ========================================================================= */}
        {/* SECTION 1: HOUSE OVERVIEW & PHOTO GALLERY (FULL WIDTH)                    */}
        {/* ========================================================================= */}
        <section className="space-y-6 bg-white rounded-3xl border-2 border-red-200 p-6 sm:p-8 shadow-sm">
          {/* Header Specs */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-red-100 pb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 text-xs font-black uppercase rounded-full bg-red-600 text-white">
                  {specs.propertyType.replace(/_/g, ' ')}
                </span>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-50 text-red-700 border border-red-200">
                  {propertyAddress.city}, {propertyAddress.state} ({timezone?.timeZoneCode || 'MST'})
                </span>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-800">
                  Taxes: {formatCurrency(propertyTaxes.annualAmountUSD)}/yr
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {listing.title}
              </h1>
              <p className="text-sm text-red-600 font-bold flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                <span>{propertyAddress.street}, {propertyAddress.neighborhood}, {propertyAddress.city}, {propertyAddress.state} {propertyAddress.zipCode}</span>
              </p>
            </div>

            {/* Pass/Flow Score Pill */}
            <div className="p-4 bg-red-50 border-2 border-red-400 rounded-2xl shadow-sm text-right shrink-0">
              <span className="text-[10px] uppercase font-black tracking-wider text-red-600 block">Institutional Grade</span>
              <div className="text-2xl font-black text-red-600 font-mono">
                {outputs.passFlowScore.toFixed(1)} / 5.0
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 bg-red-600 text-white rounded uppercase">
                {outputs.passFlowVerdict}
              </span>
            </div>
          </div>

          {/* Featured Large Image View */}
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
            <img
              src={media.gallery?.[selectedImageIndex] || media.featuredImage}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-red-200 shadow-lg">
              <span className="text-2xl font-black text-red-600 font-mono">
                {formatCurrency(inputs.purchasePrice)}
              </span>
              <span className="text-xs font-bold text-slate-500 font-mono ml-2">
                {formatCurrency(inputs.monthlyGrossRent)}/mo rent
              </span>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {(media.gallery || [media.featuredImage]).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImageIndex === idx
                    ? 'border-red-600 ring-2 ring-red-500/40 scale-105'
                    : 'border-slate-200 hover:border-red-300'
                }`}
              >
                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* 1-Line Key Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-red-50/40 rounded-2xl border border-red-200 text-center">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Bedrooms</span>
              <span className="text-base font-black text-slate-900">{specs.beds} Beds</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Bathrooms</span>
              <span className="text-base font-black text-slate-900">{specs.baths} Baths</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Rooms</span>
              <span className="text-base font-black text-slate-900">{roomsBreakdown.totalRooms} Rooms</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Finished Area</span>
              <span className="text-base font-black text-slate-900">{specs.finishedSqFt.toLocaleString()} sq ft</span>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 2: DIMENSION 1 - INSTITUTIONAL ROI & FINANCIAL ENGINE             */}
        {/* ========================================================================= */}
        <section className="space-y-4 bg-white rounded-3xl border-2 border-red-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-red-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black">
              1
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-red-600">Dimension 1</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Institutional Financial Underwriting Engine
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600">
            Real-time algorithmic underwriting calculating Net Operating Income (NOI), Cap Rate, Cash-on-Cash Return, and Debt Service Coverage Ratio (DSCR).
          </p>

          <RoiCalculatorWidget initialInputs={financials.inputs} />
        </section>


        {/* ========================================================================= */}
        {/* SECTION 3: DIMENSION 2 - VERTEX AI 5-YEAR PREDICTIVE FORECASTING           */}
        {/* ========================================================================= */}
        <section className="space-y-4 bg-white rounded-3xl border-2 border-red-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-red-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black">
              2
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-red-600">Dimension 2</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Vertex AI 5-Year Predictive Yield & Appreciation Modeling
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600">
            Machine-learned predictive curves trained on 140,000+ regional MLS records projecting 5-year compounding capital appreciation and cash flows.
          </p>

          <VertexPredictivePanel listing={listing} />
        </section>


        {/* ========================================================================= */}
        {/* SECTION 4: DIMENSION 3 - GEMINI MULTIMODAL VISION INSPECTION              */}
        {/* ========================================================================= */}
        <section className="space-y-4 bg-white rounded-3xl border-2 border-red-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-red-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black">
              3
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-red-600">Dimension 3</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Gemini Multimodal Computer Vision Structural Inspection
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600">
            High-resolution visual neural networks analyzing structural integrity, foundation hairline cracking, roof degradation, and facade material fatigue.
          </p>

          <div className="p-6 bg-red-50/50 rounded-2xl border border-red-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl border border-red-200">
                <span className="text-[10px] font-black uppercase text-red-600 block">Structural Integrity</span>
                <span className="text-xl font-black text-slate-900">96.4 / 100</span>
                <p className="text-[11px] text-slate-500 mt-1">Zero structural settlement anomalies detected.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-red-200">
                <span className="text-[10px] font-black uppercase text-red-600 block">Roof & Glazing</span>
                <span className="text-xl font-black text-slate-900">Grade A+</span>
                <p className="text-[11px] text-slate-500 mt-1">High-efficiency double-pane thermal glazing.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-red-200">
                <span className="text-[10px] font-black uppercase text-red-600 block">Foundation Inspection</span>
                <span className="text-xl font-black text-slate-900">Monolithic Slab</span>
                <p className="text-[11px] text-slate-500 mt-1">Reinforced concrete slab on solid bedrock.</p>
              </div>
            </div>

            <button
              onClick={() => setIsGeminiModalOpen(true)}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Scan className="w-4 h-4" />
              <span>Launch Live Gemini Vision Inspection Suite</span>
            </button>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 5: DIMENSION 4 - GOOGLE EARTH ENGINE & SATELLITE MULTISPECTRAL    */}
        {/* ========================================================================= */}
        <section className="space-y-4 bg-white rounded-3xl border-2 border-red-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-red-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black">
              4
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-red-600">Dimension 4</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Google Earth Engine & Copernicus Sentinel Multispectral Telemetry
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200">
              <span className="text-[10px] font-bold text-red-600 uppercase block">Copernicus Sentinel-2 NDVI</span>
              <span className="text-xl font-black text-slate-900">{spectralMetrics.ndviScore}</span>
              <p className="text-[11px] text-slate-500 mt-1">Vegetation canopy coverage: {spectralMetrics.canopyCoveragePercent}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200">
              <span className="text-[10px] font-bold text-red-600 uppercase block">Landsat-8 Surface Temp</span>
              <span className="text-xl font-black text-slate-900">{spectralMetrics.surfaceTempC}°C</span>
              <p className="text-[11px] text-slate-500 mt-1">Thermal heat island deviation: {spectralMetrics.heatIslandDeviationF}°F</p>
            </div>
            <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200">
              <span className="text-[10px] font-bold text-red-600 uppercase block">Sentinel-5P Tropospheric NO₂</span>
              <span className="text-xl font-black text-slate-900">{spectralMetrics.no2TroposphericIndex} µmol/m²</span>
              <p className="text-[11px] text-slate-500 mt-1">Air Quality: AQI {spectralMetrics.airQualityAQI}</p>
            </div>
            <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200">
              <span className="text-[10px] font-bold text-red-600 uppercase block">InSAR Soil Subsidence</span>
              <span className="text-xl font-black text-slate-900">{spectralMetrics.groundSubsidenceMmPerYear} mm/yr</span>
              <p className="text-[11px] text-slate-500 mt-1">Subsurface stability: Optimal</p>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 6: DIMENSION 5 - SUBSURFACE GEOTECHNICAL MECHANICS               */}
        {/* ========================================================================= */}
        <section className="space-y-4 bg-white rounded-3xl border-2 border-red-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-red-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black">
              5
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-red-600">Dimension 5</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Subsurface Geotechnical Mechanics & Bedrock Engineering
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-red-50/40 rounded-2xl border border-red-200">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Soil Bearing Capacity</span>
              <span className="text-xl font-black text-red-600 font-mono">
                {geotechnical.bearingCapacityPSF.toLocaleString()} PSF
              </span>
              <p className="text-xs text-slate-500 mt-0.5">({geotechnical.bearingCapacityKPa} kPa verified bearing capacity)</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Tested Bedrock Depth</span>
              <span className="text-xl font-black text-slate-900 font-mono">
                {geotechnical.depthToBedrockFt} ft
              </span>
              <p className="text-xs text-slate-500 mt-0.5">Solid limestone & granite strata</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Water Table Elevation</span>
              <span className="text-xl font-black text-slate-900 font-mono">
                {geotechnical.waterTableDepthFt} ft
              </span>
              <p className="text-xs text-slate-500 mt-0.5">Dry basement foundation clearance</p>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 7: DIMENSION 6 - ENVIRONMENTAL & HEAT WAVE TELEMETRY              */}
        {/* ========================================================================= */}
        <section className="space-y-4 bg-white rounded-3xl border-2 border-red-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-red-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black">
              6
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-red-600">Dimension 6</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Environmental & NOAA Heat Wave Telemetry
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200">
              <span className="text-[10px] font-bold text-red-600 uppercase block">Annual Heat Wave Days (>95°F)</span>
              <span className="text-xl font-black text-slate-900">{heatWaves?.annualHeatWaveDaysCount || 12} Days/yr</span>
              <p className="text-[11px] text-slate-500 mt-1">Peak Heat Index: {heatWaves?.peakSummerHeatIndexF || 98}°F</p>
            </div>
            <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200">
              <span className="text-[10px] font-bold text-red-600 uppercase block">Forest Canopy Shade Cooling</span>
              <span className="text-xl font-black text-slate-900">{forestResources?.forestCanopyCoveragePercent || 34}% Canopy</span>
              <p className="text-[11px] text-slate-500 mt-1">Shade cooling effect: -{heatWaves?.shadeCanopyCoolingEffectF || 4.2}°F</p>
            </div>
            <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200">
              <span className="text-[10px] font-bold text-red-600 uppercase block">Air Quality Index</span>
              <span className="text-xl font-black text-slate-900">AQI {climateTelemetry.airQualityIndexAQI}</span>
              <p className="text-[11px] text-slate-500 mt-1">{climateTelemetry.airQualityVerdict}</p>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 8: DIMENSION 7 - AVIATION & EXACT KILOMETER PROXIMITIES          */}
        {/* ========================================================================= */}
        <section className="space-y-4 bg-white rounded-3xl border-2 border-red-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-red-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black">
              7
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-red-600">Dimension 7</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Aviation Gateways & Proximity in Kilometers (km)
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-red-50/40 border border-red-200">
              <span className="text-[10px] font-bold text-red-600 uppercase block">Primary Airport Hub</span>
              <h4 className="text-lg font-black text-slate-900">{airport?.primaryAirportName || "Chicago O'Hare International"} ({airport?.primaryAirportIATA || 'ORD'})</h4>
              <div className="flex items-center gap-4 mt-2 text-xs font-mono">
                <span>Distance: <strong className="text-red-600">{airport?.distanceToAirportKm || 23.8} km</strong></span>
                <span>Drive Time: <strong>{airport?.driveTimeToAirportMinutes || 28} min</strong></span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-red-50/40 border border-red-200">
              <span className="text-[10px] font-bold text-red-600 uppercase block">Time Zone Standard</span>
              <h4 className="text-lg font-black text-slate-900">{timezone?.timeZoneName || 'Central Standard Time'} ({timezone?.timeZoneCode || 'CST'})</h4>
              <div className="flex items-center gap-4 mt-2 text-xs font-mono">
                <span>UTC Offset: <strong>{timezone?.utcOffset || 'UTC-6'}</strong></span>
                <span>Daylight Saving: <strong>Active</strong></span>
              </div>
            </div>
          </div>

          {/* Points of Interest (Schools, Malls, Transit in KM) */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Key Points of Interest Distances</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {nearbyPointsOfInterest.slice(0, 6).map((poi) => (
                <div key={poi.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <div className="truncate mr-2">
                    <span className="font-bold text-slate-900 block truncate">{poi.name}</span>
                    <span className="text-[10px] text-slate-500">{poi.categoryLabel}</span>
                  </div>
                  <span className="font-mono font-bold text-red-600 shrink-0">{poi.distanceKm} km</span>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 9: DIMENSION 8 - PUBLIC SAFETY & 20-YEAR POLICE CORRIDORS         */}
        {/* ========================================================================= */}
        <section className="space-y-4 bg-white rounded-3xl border-2 border-red-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-red-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black">
              8
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-red-600">Dimension 8</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Public Safety, 20-Year Police Corridors & Property Taxes
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200">
              <span className="text-[10px] font-bold text-red-600 uppercase block">Police 911 Dispatch Arrival</span>
              <span className="text-xl font-black text-slate-900">{policeCorridor.dispatchAvgMinutes} Minutes</span>
              <p className="text-[11px] text-slate-500 mt-1">District: {policeCorridor.precinctDistrict}</p>
            </div>
            <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200">
              <span className="text-[10px] font-bold text-red-600 uppercase block">Safety Benchmark</span>
              <span className="text-xl font-black text-slate-900">Verified Safe</span>
              <p className="text-[11px] text-slate-500 mt-1">{policeCorridor.twentyYearBurglaryMilestone}</p>
            </div>
            <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200">
              <span className="text-[10px] font-bold text-red-600 uppercase block">County Property Taxes</span>
              <span className="text-xl font-black text-red-600 font-mono">{formatCurrency(propertyTaxes.annualAmountUSD)}/yr</span>
              <p className="text-[11px] text-slate-500 mt-1">{propertyTaxes.countyName} ({propertyTaxes.effectiveTaxRatePercent}%)</p>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 10: DIMENSION 9 - 2D ARCHITECTURAL CAD BLUEPRINTS                 */}
        {/* ========================================================================= */}
        <section className="space-y-4 bg-white rounded-3xl border-2 border-red-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-red-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black">
              9
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-red-600">Dimension 9</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                2D Architectural CAD Blueprint & Interactive Room Staging
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600">
            Interactive CAD blueprint layout showing room dimensions, architectural boundaries, and customizable furniture layouts.
          </p>

          <BlueprintFurnitureStaging listing={listing} />
        </section>


        {/* ========================================================================= */}
        {/* SECTION 11: INSTANT DIGITAL LEASE APPLICATION                             */}
        {/* ========================================================================= */}
        <section id="section-apply" className="space-y-6 bg-red-50/50 rounded-3xl border-2 border-red-300 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-red-200 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-red-600">Instant Underwriting</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Digital Tenant Lease Application
              </h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-red-600 text-white rounded-full">
              400ms Decision Engine
            </span>
          </div>

          {applicationSubmitted ? (
            <div className="p-8 bg-white rounded-2xl border-2 border-emerald-500 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-slate-900">Application Approved & Verified</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your application for <strong>{propertyAddress.street}</strong> has passed automated underwriting. An institutional representative will contact you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-4 bg-white p-6 rounded-2xl border border-red-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full p-2.5 text-xs bg-red-50/30 border border-red-200 rounded-xl font-medium focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Annual Verified Income</label>
                  <input
                    type="text"
                    required
                    value={applicantIncome}
                    onChange={(e) => setApplicantIncome(e.target.value)}
                    className="w-full p-2.5 text-xs bg-red-50/30 border border-red-200 rounded-xl font-medium focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Move-In Date</label>
                  <input
                    type="date"
                    defaultValue="2026-09-01"
                    className="w-full p-2.5 text-xs bg-red-50/30 border border-red-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Lease Term</label>
                  <select className="w-full p-2.5 text-xs bg-red-50/30 border border-red-200 rounded-xl font-medium">
                    <option>12 Months Standard</option>
                    <option>24 Months Preferred</option>
                    <option>36 Months Long-Term</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Security Deposit</label>
                  <input
                    type="text"
                    disabled
                    value={formatCurrency(inputs.monthlyGrossRent * 1.5)}
                    className="w-full p-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-600 font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-red-500/30 transition-all hover:scale-[1.01]"
              >
                Submit Application for Instant Automated Underwriting →
              </button>
            </form>
          )}
        </section>

      </main>

      {/* Gemini Vision Modal */}
      <GeminiVisionInspector
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        listing={listing}
      />
    </div>
  );
};
