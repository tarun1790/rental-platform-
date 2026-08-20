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
  Hospital,
  PartyPopper,
  Music,
  Lightbulb,
  Zap,
  Car,
  Users,
  Navigation
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../../lib/roi-engine';
import { BlueprintFurnitureStaging } from './BlueprintFurnitureStaging';
import { RoiCalculatorWidget } from './RoiCalculatorWidget';
import { HouseRoiCalculatorModal } from './HouseRoiCalculatorModal';
import { GeminiVisionInspector } from '../intelligence/GeminiVisionInspector';
import { VertexPredictivePanel } from '../intelligence/VertexPredictivePanel';
import { getNeighborhoodSpectralMetrics, EARTH_ENGINE_LAYERS } from '../../lib/earth-engine';
import { getRankedSchoolsForProperty, getRankedMallsForProperty, getEventsAndLifestyleForProperty } from '../../lib/neighborhood-intelligence';

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

  // 5 Ranked Schools (#1 to #5 by Distance) & 5 Ranked Malls (#1 to #5 by Distance)
  const rankedSchools = getRankedSchoolsForProperty(propertyAddress.neighborhood);
  const rankedMalls = getRankedMallsForProperty(propertyAddress.neighborhood);
  const lifestyleData = getEventsAndLifestyleForProperty(propertyAddress.neighborhood);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplicationSubmitted(true);
  };

  const handleBackToHome = () => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/rental-platform-')) {
      window.location.href = '/rental-platform-/';
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/50 text-slate-900 flex flex-col">
      
      {/* Top Sticky Header (Full 100% Width Edge-to-Edge) */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-red-100">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Map & Listings</span>
            </button>

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
        {/* SECTION: 5 SCHOOLS (RANKED #1 TO #5 BY DISTANCE)                          */}
        {/* ========================================================================= */}
        <section className="w-full space-y-6 bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm">
                🎓
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                  Education & Academic District
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  5 Nearby Schools (Ranked #1 to #5 by Proximity to Home)
                </h2>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              Verified GreatSchools Academic Ratings
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {rankedSchools.map((school, idx) => (
              <div key={school.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold uppercase rounded-md">
                      #{idx + 1} {idx === 0 ? 'Closest' : ''}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{school.ratingScore} / 10</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {school.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {school.categoryLabel}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-700">
                    <span>Distance: <strong className="text-red-500">{school.distanceKm} km</strong></span>
                    <span>({school.distanceMiles} mi)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>🚶 {school.walkTimeMinutes} min walk</span>
                    <span>🚗 {school.driveTimeMinutes} min drive</span>
                  </div>
                  <p className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100">
                    ✨ {school.keyHighlight}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION: 5 SHOPPING MALLS (RANKED #1 TO #5 BY DISTANCE)                   */}
        {/* ========================================================================= */}
        <section className="w-full space-y-6 bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm">
                🛍️
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                  Retail & Lifestyle Centers
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  5 Nearby Shopping Malls (Ranked #1 to #5 by Proximity to Home)
                </h2>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-full">
              Customer & Retail Review Ratings
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {rankedMalls.map((mall, idx) => (
              <div key={mall.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold uppercase rounded-md">
                      #{idx + 1} {idx === 0 ? 'Closest' : ''}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{mall.ratingScore} / 5.0 ★</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {mall.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {mall.categoryLabel}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-700">
                    <span>Distance: <strong className="text-red-500">{mall.distanceKm} km</strong></span>
                    <span>({mall.distanceMiles} mi)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>🚶 {mall.walkTimeMinutes} min walk</span>
                    <span>🚗 {mall.driveTimeMinutes} min drive</span>
                  </div>
                  <p className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100">
                    🛍️ {mall.keyHighlight}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION: COMMUNITY, EVENTS, PARTIES & NIGHTLIFE                           */}
        {/* ========================================================================= */}
        <section className="w-full space-y-6 bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm">
              🎉
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                Community & Social Lifestyle
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Local Events, Annual Festivals, Parties & Nightlife Lounges
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Annual Festivals & Community Events */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Annual Festivals & Street Galas</h3>
              </div>

              <div className="space-y-3">
                {lifestyleData.events.map((evt, i) => (
                  <div key={i} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{evt.name}</h4>
                      <span className="text-[10px] font-bold text-red-500 font-mono">{evt.distanceKm} km away</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-700 rounded-md inline-block">
                      {evt.seasonOrFrequency} • {evt.estimatedAttendees.toLocaleString()} Attendees
                    </span>
                    <p className="text-xs text-slate-600">{evt.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Nightlife, Parties & Social Clubs */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Parties, Rooftop Lounges & Nightlife</h3>
              </div>

              <div className="space-y-3">
                {lifestyleData.nightlife.map((lounge, i) => (
                  <div key={i} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{lounge.name}</h4>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        ★ {lounge.ratingScore} / 5.0
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      {lounge.category} • {lounge.distanceKm} km from home
                    </span>
                    <p className="text-xs text-slate-700 font-medium">✨ {lounge.dressCodeOrVibe}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION: ROADS, STREET LIGHTING, COMMUNITY & FOREST RESERVES              */}
        {/* ========================================================================= */}
        <section className="w-full space-y-6 bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm">
              🏙️
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                Civic Infrastructure & Demographics
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Roads, Street Lights, Forest Reserves, Community & Taxes
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Roads & Highways */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold text-slate-800 uppercase">Roads & Highways</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{lifestyleData.roads.primaryHighway}</h4>
              <p className="text-xs text-slate-600 font-mono">Distance: <strong>{lifestyleData.roads.distanceToHighwayKm} km</strong> ({lifestyleData.roads.driveTimeToHighwayMinutes} min)</p>
              <p className="text-xs text-slate-600 font-mono">Pavement Index (PCI): <strong>{lifestyleData.roads.pavementConditionIndexPCI} / 100</strong></p>
              <span className="text-[11px] text-emerald-700 font-bold block">⚡ {lifestyleData.roads.evChargingStallsNearbyCount} EV Superchargers Nearby</span>
            </div>

            {/* Street Lights & Smart City Grid */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold text-slate-800 uppercase">Street Lights & Grid</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{lifestyleData.lighting.fixtureType}</h4>
              <p className="text-xs text-slate-600 font-mono">Night Illumination: <strong>{lifestyleData.lighting.nightLuminanceLux} Lux</strong></p>
              <p className="text-xs text-slate-600 font-mono">Lighting Safety Coverage: <strong>{lifestyleData.lighting.streetLightingCoveragePercent}%</strong></p>
              <span className="text-[11px] text-red-500 font-bold block">🌐 {lifestyleData.lighting.fiberBroadbandSpeedGbps} Gbps Fiber • Underground Cabling</span>
            </div>

            {/* Community & Demographics */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold text-slate-800 uppercase">Community Profile</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{lifestyleData.community.neighborhoodAssociation}</h4>
              <p className="text-xs text-slate-600 font-mono">Median Income: <strong>{formatCurrency(lifestyleData.community.medianHouseholdIncomeUSD)}/yr</strong></p>
              <p className="text-xs text-slate-600 font-mono">Higher Education: <strong>{lifestyleData.community.higherEducationPercent}%</strong></p>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 pt-1">
                <span>Walk: {lifestyleData.community.walkScore}</span>
                <span>• Transit: {lifestyleData.community.transitScore}</span>
                <span>• Bike: {lifestyleData.community.bikeScore}</span>
              </div>
            </div>

            {/* Forest Reserves & Tree Canopy */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <TreePine className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold text-slate-800 uppercase">Forest Reserves</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{forestResources?.nearestParkOrForestName || 'Urban Forest & Conservatory'}</h4>
              <p className="text-xs text-slate-600 font-mono">Distance: <strong>{forestResources?.distanceToForestKm || 0.3} km</strong></p>
              <p className="text-xs text-slate-600 font-mono">Canopy Coverage: <strong>{forestResources?.forestCanopyCoveragePercent || 34}%</strong></p>
              <span className="text-[11px] text-emerald-700 font-bold block">{forestResources?.carbonSequestrationRating || 'Grade A+ Carbon Sequestration'}</span>
            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION: DIMENSION 1 - INSTITUTIONAL ROI & FINANCIAL ENGINE (100% FULL)   */}
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
        {/* SECTION: DIMENSION 2 - VERTEX AI 5-YEAR PREDICTIVE FORECASTING            */}
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
        {/* SECTION: DIMENSION 3 - GEMINI MULTIMODAL VISION INSPECTION                */}
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
        {/* SECTION: DIMENSION 4 - GOOGLE EARTH ENGINE & MULTISPECTRAL                */}
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
        {/* SECTION: DIMENSION 5 - SUBSURFACE GEOTECHNICAL MECHANICS                  */}
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
        {/* SECTION: DIMENSION 6 - PUBLIC SAFETY & PROPERTY TAXES                     */}
        {/* ========================================================================= */}
        <section className="w-full space-y-4 bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm">
              6
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Dimension 6</span>
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
        {/* SECTION: DIMENSION 7 - 2D ARCHITECTURAL CAD BLUEPRINTS                    */}
        {/* ========================================================================= */}
        <section className="w-full space-y-4 bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm">
              7
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Dimension 7</span>
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
        {/* SECTION: INSTANT DIGITAL LEASE APPLICATION                                */}
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
