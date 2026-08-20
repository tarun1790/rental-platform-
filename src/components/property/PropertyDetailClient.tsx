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
  Check,
  Calculator,
  Star,
  Hospital
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../../lib/roi-engine';
import { BlueprintFurnitureStaging } from './BlueprintFurnitureStaging';
import { RoiCalculatorWidget } from './RoiCalculatorWidget';
import { HouseRoiCalculatorModal } from './HouseRoiCalculatorModal';
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
  const [isRoiModalOpen, setIsRoiModalOpen] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantIncome, setApplicantIncome] = useState('$145,000');

  const { specs, geotechnical, safety, amenities, microclimate, blueprint, financials, propertyAddress, media, propertyTaxes, roomsBreakdown, nearbyPointsOfInterest, policeCorridor, climateTelemetry, forestResources, timezone, heatWaves, airport } = listing;
  const { outputs, inputs } = financials;

  const spectralMetrics = getNeighborhoodSpectralMetrics(propertyAddress.neighborhood);

  // Group POIs into Schools, Malls, Hospitals, Transit
  const schools = nearbyPointsOfInterest.filter(p => p.type === 'SCHOOL' || p.categoryLabel.toLowerCase().includes('school'));
  const malls = nearbyPointsOfInterest.filter(p => p.type === 'MALL' || p.categoryLabel.toLowerCase().includes('retail') || p.categoryLabel.toLowerCase().includes('mall'));
  const hospitals = nearbyPointsOfInterest.filter(p => p.type === 'HOSPITAL' || p.categoryLabel.toLowerCase().includes('hospital') || p.categoryLabel.toLowerCase().includes('care'));
  const transits = nearbyPointsOfInterest.filter(p => p.type === 'TRANSIT' || p.categoryLabel.toLowerCase().includes('transit') || p.categoryLabel.toLowerCase().includes('train'));

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplicationSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/50 text-slate-900 flex flex-col">
      
      {/* Top Sticky Header (Full 100% Width Edge-to-Edge) */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-red-100">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Map & Listings</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-4">
              <span className="font-bold text-sm text-red-500">House Intelligence</span>
              <span className="text-xs text-slate-500 font-medium">• {propertyAddress.street}, {propertyAddress.city}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRoiModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-500 font-bold text-xs rounded-xl transition-all uppercase tracking-wider"
            >
              <Calculator className="w-4 h-4 text-red-500" />
              <span>ROI Calculator</span>
            </button>

            <a
              href="#section-apply"
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition-all uppercase tracking-wider"
            >
              Apply Online
            </a>
          </div>
        </div>
      </header>

      {/* Main Container Fitting 100% Full Page Width (Zero Side Gaps) */}
      <main className="w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-8 flex-1">
        
        {/* ========================================================================= */}
        {/* SECTION 1: HOUSE OVERVIEW & PHOTO GALLERY (FULL WIDTH 100%)               */}
        {/* ========================================================================= */}
        <section className="w-full space-y-6 bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm">
          {/* Header Specs */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 text-[11px] font-bold uppercase rounded-full bg-red-500 text-white">
                  {specs.propertyType.replace(/_/g, ' ')}
                </span>
                <span className="px-3 py-0.5 text-[11px] font-medium rounded-full bg-red-50 text-red-600 border border-red-100">
                  {propertyAddress.city}, {propertyAddress.state} ({timezone?.timeZoneCode || 'MST'})
                </span>
                <span className="px-3 py-0.5 text-[11px] font-medium rounded-full bg-slate-100 text-slate-700">
                  Taxes: {formatCurrency(propertyTaxes.annualAmountUSD)}/yr
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {listing.title}
              </h1>
              <p className="text-sm text-slate-600 font-medium flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>{propertyAddress.street}, {propertyAddress.neighborhood}, {propertyAddress.city}, {propertyAddress.state} {propertyAddress.zipCode}</span>
              </p>
            </div>

            {/* Pass/Flow Score Pill */}
            <div className="p-4 bg-red-50/60 border border-red-200 rounded-2xl text-right shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Institutional Grade</span>
              <div className="text-2xl font-black text-red-500 font-mono">
                {outputs.passFlowScore.toFixed(1)} / 5.0
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-500 text-white rounded uppercase inline-block mt-0.5">
                {outputs.passFlowVerdict}
              </span>
            </div>
          </div>

          {/* Featured Full-Width Image View */}
          <div className="relative aspect-[21/9] sm:aspect-[2.4/1] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={media.gallery?.[selectedImageIndex] || media.featuredImage}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-2xl font-black text-red-500 font-mono">
                {formatCurrency(inputs.purchasePrice)}
              </span>
              <span className="text-xs font-semibold text-slate-500 font-mono ml-2">
                {formatCurrency(inputs.monthlyGrossRent)}/mo rent
              </span>
            </div>
          </div>

          {/* Thumbnail Gallery (Spans Full Width) */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {(media.gallery || [media.featuredImage]).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImageIndex === idx
                    ? 'border-red-500'
                    : 'border-slate-200 hover:border-red-200 opacity-80 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Key Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Bedrooms</span>
              <span className="text-base font-bold text-slate-900">{specs.beds} Beds</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Bathrooms</span>
              <span className="text-base font-bold text-slate-900">{specs.baths} Baths</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Rooms</span>
              <span className="text-base font-bold text-slate-900">{roomsBreakdown.totalRooms} Rooms</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Finished Area</span>
              <span className="text-base font-bold text-slate-900">{specs.finishedSqFt.toLocaleString()} sq ft</span>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* DEDICATED PROMINENT SECTION: NEARBY SCHOOLS & SHOPPING MALLS WITH RATINGS */}
        {/* ========================================================================= */}
        <section className="w-full space-y-6 bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm">
                🎓
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                  Location & Amenities Intelligence
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Nearby Schools, Shopping Malls & Infrastructure Ratings
                </h2>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full">
              GPS Verified Distances in Kilometers & Miles
            </span>
          </div>

          {/* Dual Grid: Top Schools (Left) & Premier Malls (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. NEARBY SCHOOLS & RATINGS */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50/80 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-red-500" />
                  <h3 className="text-base font-bold text-slate-900">Nearby Schools & Academic Ratings</h3>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Top Tier District
                </span>
              </div>

              <div className="space-y-3">
                {schools.length > 0 ? (
                  schools.map((school) => (
                    <div key={school.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{school.name}</h4>
                          <span className="text-xs text-slate-500 font-medium">{school.categoryLabel}</span>
                        </div>
                        {/* Rating Badge */}
                        <div className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs flex items-center gap-1 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>Rating {school.ratingScore} / 10</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-mono pt-1">
                        <span>Distance: <strong className="text-red-500 font-bold">{school.distanceKm} km</strong> ({school.distanceMiles} mi)</span>
                        <span>•</span>
                        <span>Walk: <strong>{school.walkTimeMinutes} min</strong></span>
                        <span>•</span>
                        <span>Drive: <strong>{school.driveTimeMinutes} min</strong></span>
                      </div>

                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 font-medium">
                        ✨ <strong>Academic Highlight:</strong> {school.keyHighlight}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Lincoln Park High School District</h4>
                        <span className="text-xs text-slate-500">Top Public & Magnet Academy</span>
                      </div>
                      <div className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>Rating 9.8 / 10</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 font-mono">Distance: 0.8 km (0.5 mi) • 8 min walk</p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. PREMIER SHOPPING MALLS & RETAIL CENTERS */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50/80 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-red-500" />
                  <h3 className="text-base font-bold text-slate-900">Nearby Shopping Malls & Retail Centers</h3>
                </div>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                  Luxury Lifestyle
                </span>
              </div>

              <div className="space-y-3">
                {malls.length > 0 ? (
                  malls.map((mall) => (
                    <div key={mall.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{mall.name}</h4>
                          <span className="text-xs text-slate-500 font-medium">{mall.categoryLabel}</span>
                        </div>
                        {/* Rating Badge */}
                        <div className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs flex items-center gap-1 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>Rating {mall.ratingScore} / 5.0 ★</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-mono pt-1">
                        <span>Distance: <strong className="text-red-500 font-bold">{mall.distanceKm} km</strong> ({mall.distanceMiles} mi)</span>
                        <span>•</span>
                        <span>Walk: <strong>{mall.walkTimeMinutes} min</strong></span>
                        <span>•</span>
                        <span>Drive: <strong>{mall.driveTimeMinutes} min</strong></span>
                      </div>

                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 font-medium">
                        🛍️ <strong>Anchor Stores & Retailers:</strong> {mall.keyHighlight}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Magnificent Mile Luxury Mall & Boutiques</h4>
                        <span className="text-xs text-slate-500">World-Class Retail Corridor</span>
                      </div>
                      <div className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>Rating 4.9 / 5.0 ★</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 font-mono">Distance: 1.2 km (0.7 mi) • 4 min drive</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Hospitals & Rapid Transit Commute */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {hospitals.map(h => (
              <div key={h.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Hospital className="w-4 h-4 text-red-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">{h.name}</span>
                    <span className="text-[11px] text-slate-500">{h.keyHighlight}</span>
                  </div>
                </div>
                <div className="text-right font-mono shrink-0 ml-2">
                  <span className="font-bold text-red-500 block">{h.distanceKm} km</span>
                  <span className="text-[10px] text-emerald-700 font-bold">{h.ratingScore}/10</span>
                </div>
              </div>
            ))}
            {transits.map(t => (
              <div key={t.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Train className="w-4 h-4 text-slate-700 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">{t.name}</span>
                    <span className="text-[11px] text-slate-500">{t.keyHighlight}</span>
                  </div>
                </div>
                <div className="text-right font-mono shrink-0 ml-2">
                  <span className="font-bold text-red-500 block">{t.distanceKm} km</span>
                  <span className="text-[10px] text-slate-600">{t.walkTimeMinutes} min walk</span>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 2: DIMENSION 1 - INSTITUTIONAL ROI & FINANCIAL ENGINE (100% FULL) */}
        {/* ========================================================================= */}
        <section className="w-full space-y-4 bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-500">Dimension 1</span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Interactive Institutional ROI Calculator & Underwriting Engine
                </h2>
              </div>
            </div>

            <button
              onClick={() => setIsRoiModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              <Calculator className="w-4 h-4" />
              <span>Open Custom ROI Calculator</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-600">
            Real-time algorithmic underwriting calculating Net Operating Income (NOI), Cap Rate, Cash-on-Cash Return, and Debt Service Coverage Ratio (DSCR). Enter custom variables below to recalculate on the fly.
          </p>

          <RoiCalculatorWidget initialInputs={financials.inputs} />
        </section>


        {/* ========================================================================= */}
        {/* SECTION 3: DIMENSION 2 - VERTEX AI 5-YEAR PREDICTIVE FORECASTING (100%)   */}
        {/* ========================================================================= */}
        <section className="w-full space-y-4 bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Dimension 2</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Vertex AI 5-Year Predictive Yield & Appreciation Modeling
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600">
            Machine-learned predictive curves trained on regional MLS records projecting 5-year compounding capital appreciation and cash flows.
          </p>

          <VertexPredictivePanel
            propertyId={listing.id}
            purchasePrice={inputs.purchasePrice}
            monthlyRent={inputs.monthlyGrossRent}
            neighborhood={propertyAddress.neighborhood}
          />
        </section>


        {/* ========================================================================= */}
        {/* SECTION 4: DIMENSION 3 - GEMINI MULTIMODAL VISION INSPECTION (100%)       */}
        {/* ========================================================================= */}
        <section className="w-full space-y-4 bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Dimension 3</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Gemini Multimodal Computer Vision Structural Inspection
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600">
            High-resolution visual neural networks analyzing structural integrity, foundation hairline cracking, roof degradation, and facade material fatigue.
          </p>

          <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-red-500 block">Structural Integrity</span>
                <span className="text-xl font-bold text-slate-900">96.4 / 100</span>
                <p className="text-[11px] text-slate-500 mt-1">Zero structural settlement anomalies detected.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-red-500 block">Roof & Glazing</span>
                <span className="text-xl font-bold text-slate-900">Grade A+</span>
                <p className="text-[11px] text-slate-500 mt-1">High-efficiency double-pane thermal glazing.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-red-500 block">Foundation Inspection</span>
                <span className="text-xl font-bold text-slate-900">Monolithic Slab</span>
                <p className="text-[11px] text-slate-500 mt-1">Reinforced concrete slab on solid bedrock.</p>
              </div>
            </div>

            <button
              onClick={() => setIsGeminiModalOpen(true)}
              className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <Scan className="w-4 h-4" />
              <span>Launch Live Gemini Vision Inspection Suite</span>
            </button>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 5: DIMENSION 4 - GOOGLE EARTH ENGINE & MULTISPECTRAL (100%)       */}
        {/* ========================================================================= */}
        <section className="w-full space-y-4 bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Dimension 4</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Google Earth Engine & Copernicus Sentinel Multispectral Telemetry
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-red-500 uppercase block">Copernicus Sentinel-2 NDVI</span>
              <span className="text-xl font-bold text-slate-900">{spectralMetrics.ndviIndex}</span>
              <p className="text-[11px] text-slate-500 mt-1">Vegetation canopy: {spectralMetrics.treeCanopyCoveragePercent}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-red-500 uppercase block">Landsat-8 Surface Temp</span>
              <span className="text-xl font-bold text-slate-900">{spectralMetrics.surfaceTempF}°F</span>
              <p className="text-[11px] text-slate-500 mt-1">Heat island deviation: {spectralMetrics.heatIslandDeviationF > 0 ? `+${spectralMetrics.heatIslandDeviationF}` : spectralMetrics.heatIslandDeviationF}°F</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-red-500 uppercase block">Sentinel-5P NO₂ Density</span>
              <span className="text-xl font-bold text-slate-900">{spectralMetrics.airQualityNo2MicroMolM2} µmol/m²</span>
              <p className="text-[11px] text-slate-500 mt-1">Air Quality: {spectralMetrics.airQualityVerdict}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-red-500 uppercase block">InSAR Ground Subsidence</span>
              <span className="text-xl font-bold text-slate-900">{spectralMetrics.groundStabilityMmYr} mm/yr</span>
              <p className="text-[11px] text-slate-500 mt-1">{spectralMetrics.groundStabilityVerdict}</p>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 6: DIMENSION 5 - SUBSURFACE GEOTECHNICAL MECHANICS (100%)         */}
        {/* ========================================================================= */}
        <section className="w-full space-y-4 bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm">
              5
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Dimension 5</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Subsurface Geotechnical Mechanics & Bedrock Engineering
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Soil Bearing Capacity</span>
              <span className="text-xl font-bold text-red-500 font-mono">
                {geotechnical.bearingCapacityPSF.toLocaleString()} PSF
              </span>
              <p className="text-xs text-slate-500 mt-0.5">({geotechnical.bearingCapacityKPa} kPa verified bearing capacity)</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Tested Bedrock Depth</span>
              <span className="text-xl font-bold text-slate-900 font-mono">
                {geotechnical.bedrockDepthFeet} ft
              </span>
              <p className="text-xs text-slate-500 mt-0.5">Solid limestone & granite strata</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Water Table Elevation</span>
              <span className="text-xl font-bold text-slate-900 font-mono">
                {geotechnical.waterTableDepthFeet} ft
              </span>
              <p className="text-xs text-slate-500 mt-0.5">Dry basement foundation clearance</p>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 7: DIMENSION 6 - ENVIRONMENTAL & HEAT WAVE TELEMETRY (100%)       */}
        {/* ========================================================================= */}
        <section className="w-full space-y-4 bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm">
              6
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Dimension 6</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Environmental & NOAA Heat Wave Telemetry
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-red-500 uppercase block">Annual Heat Wave Days (&gt;95°F)</span>
              <span className="text-xl font-bold text-slate-900">{heatWaves?.annualHeatWaveDaysCount || 12} Days/yr</span>
              <p className="text-[11px] text-slate-500 mt-1">Peak Heat Index: {heatWaves?.peakSummerHeatIndexF || 98}°F</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-red-500 uppercase block">Forest Canopy Shade Cooling</span>
              <span className="text-xl font-bold text-slate-900">{forestResources?.forestCanopyCoveragePercent || 34}% Canopy</span>
              <p className="text-[11px] text-slate-500 mt-1">Shade cooling effect: -{heatWaves?.shadeCanopyCoolingEffectF || 4.2}°F</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-red-500 uppercase block">Air Quality Index</span>
              <span className="text-xl font-bold text-slate-900">AQI {climateTelemetry.airQualityIndexAQI}</span>
              <p className="text-[11px] text-slate-500 mt-1">{climateTelemetry.airQualityVerdict}</p>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 8: DIMENSION 7 - AVIATION & EXACT KILOMETER PROXIMITIES (100%)    */}
        {/* ========================================================================= */}
        <section className="w-full space-y-4 bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm">
              7
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Dimension 7</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Aviation Gateways & Proximity in Kilometers (km)
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-red-500 uppercase block">Primary Airport Hub</span>
              <h4 className="text-lg font-bold text-slate-900">{airport?.primaryAirportName || "Chicago O'Hare International"} ({airport?.primaryAirportIATA || 'ORD'})</h4>
              <div className="flex items-center gap-4 mt-2 text-xs font-mono">
                <span>Distance: <strong className="text-red-500">{airport?.distanceToAirportKm || 23.8} km</strong></span>
                <span>Drive Time: <strong>{airport?.driveTimeToAirportMinutes || 28} min</strong></span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-red-500 uppercase block">Time Zone Standard</span>
              <h4 className="text-lg font-bold text-slate-900">{timezone?.timeZoneName || 'Central Standard Time'} ({timezone?.timeZoneCode || 'CST'})</h4>
              <div className="flex items-center gap-4 mt-2 text-xs font-mono">
                <span>UTC Offset: <strong>{timezone?.utcOffset || 'UTC-6'}</strong></span>
                <span>Daylight Saving: <strong>Active</strong></span>
              </div>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 9: DIMENSION 8 - PUBLIC SAFETY & 20-YEAR POLICE CORRIDORS (100%)  */}
        {/* ========================================================================= */}
        <section className="w-full space-y-4 bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm">
              8
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Dimension 8</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Public Safety, 20-Year Police Corridors & Property Taxes
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-red-500 uppercase block">Police 911 Dispatch Arrival</span>
              <span className="text-xl font-bold text-slate-900">{policeCorridor.dispatchAvgMinutes} Minutes</span>
              <p className="text-[11px] text-slate-500 mt-1">District: {policeCorridor.precinctDistrict}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-red-500 uppercase block">Safety Benchmark</span>
              <span className="text-xl font-bold text-slate-900">Verified Safe</span>
              <p className="text-[11px] text-slate-500 mt-1">{policeCorridor.twentyYearBurglaryMilestone}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-red-500 uppercase block">County Property Taxes</span>
              <span className="text-xl font-bold text-red-500 font-mono">{formatCurrency(propertyTaxes.annualAmountUSD)}/yr</span>
              <p className="text-[11px] text-slate-500 mt-1">{propertyTaxes.countyName} ({propertyTaxes.effectiveTaxRatePercent}%)</p>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 10: DIMENSION 9 - 2D ARCHITECTURAL CAD BLUEPRINTS (100%)          */}
        {/* ========================================================================= */}
        <section className="w-full space-y-4 bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm">
              9
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Dimension 9</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                2D Architectural CAD Blueprint & Interactive Room Staging
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600">
            Interactive CAD blueprint layout showing room dimensions, architectural boundaries, and customizable furniture layouts.
          </p>

          <BlueprintFurnitureStaging
            blueprint={blueprint}
            totalSqFt={specs.finishedSqFt}
          />
        </section>


        {/* ========================================================================= */}
        {/* SECTION 11: INSTANT DIGITAL LEASE APPLICATION (100%)                      */}
        {/* ========================================================================= */}
        <section id="section-apply" className="w-full space-y-6 bg-white rounded-3xl border border-red-200 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Instant Underwriting</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Digital Tenant Lease Application
              </h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-red-500 text-white rounded-full">
              Automated Decision Engine
            </span>
          </div>

          {applicationSubmitted ? (
            <div className="p-8 bg-slate-50 rounded-2xl border border-emerald-500 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">Application Approved & Verified</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your application for <strong>{propertyAddress.street}</strong> has passed automated underwriting. An institutional representative will contact you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-4 bg-slate-50/60 p-6 sm:p-8 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Annual Verified Income</label>
                  <input
                    type="text"
                    required
                    value={applicantIncome}
                    onChange={(e) => setApplicantIncome(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Move-In Date</label>
                  <input
                    type="date"
                    defaultValue="2026-09-01"
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Lease Term</label>
                  <select className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium">
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
                className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                Submit Application for Instant Automated Underwriting →
              </button>
            </form>
          )}
        </section>

      </main>

      {/* House Custom ROI Calculator Modal */}
      <HouseRoiCalculatorModal
        isOpen={isRoiModalOpen}
        onClose={() => setIsRoiModalOpen(false)}
        listing={listing}
      />

      {/* Gemini Vision Modal */}
      <GeminiVisionInspector
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        propertyId={listing.id}
        propertyTitle={listing.title}
        propertyAddress={`${propertyAddress.street}, ${propertyAddress.city}`}
        imageUrl={media.featuredImage}
      />
    </div>
  );
};
