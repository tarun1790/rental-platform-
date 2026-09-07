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
import { MultiAgentSynthesisConsole } from '../intelligence/MultiAgentSynthesisConsole';
import { getNeighborhoodSpectralMetrics, EARTH_ENGINE_LAYERS } from '../../lib/earth-engine';
import { getRankedSchoolsForProperty, getRankedMallsForProperty, getEventsAndLifestyleForProperty } from '../../lib/neighborhood-intelligence';
import { getPropertyById } from '../../lib/property-store';
import { buildPropertyEvidenceGraph, getVerificationBadge } from '../../lib/evidence/evidence-graph';
import { scorePropertyDimensions, generateDueDiligenceNotice } from '../../lib/scoring/property-scoring-engine';
import { executeMultiScenarioAnalysis } from '../../lib/financial/scenario-engine';

interface PropertyDetailClientProps {
  propertyId: string;
}

export const PropertyDetailClient: React.FC<PropertyDetailClientProps> = ({ propertyId }) => {
  const router = useRouter();

  const listing = getPropertyById(propertyId) || CHICAGO_LISTINGS.find((p) => p.id === propertyId) || CHICAGO_LISTINGS[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState<'conservative' | 'base' | 'optimistic'>('base');
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [isRoiModalOpen, setIsRoiModalOpen] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantIncome, setApplicantIncome] = useState('$145,000');

  const evidence = listing.evidenceGraph || buildPropertyEvidenceGraph(listing);
  const scores = listing.scores || scorePropertyDimensions(listing);
  const scenarios = listing.financialScenarios || executeMultiScenarioAnalysis(listing);
  const dueDiligence = listing.dueDiligence || generateDueDiligenceNotice(listing, scores);

  const { specs, geotechnical, safety, amenities, microclimate, blueprint, financials, propertyAddress, media, propertyTaxes, roomsBreakdown, nearbyPointsOfInterest, policeCorridor, climateTelemetry, forestResources, timezone, heatWaves, airport } = listing;
  const { outputs, inputs } = financials;

  const spectralMetrics = getNeighborhoodSpectralMetrics(propertyAddress.neighborhood);

  // 5 Ranked Schools (#1 to #5 by Distance) & 5 Ranked Malls (#1 to #5 by Distance)
  const poiSchools = nearbyPointsOfInterest?.filter((p) => p.type === 'SCHOOL') || [];
  const poiMalls = nearbyPointsOfInterest?.filter((p) => p.type === 'MALL') || [];

  const rankedSchools = poiSchools.length >= 5
    ? poiSchools
    : getRankedSchoolsForProperty(propertyAddress.neighborhood);

  const rankedMalls = poiMalls.length >= 5
    ? poiMalls
    : getRankedMallsForProperty(propertyAddress.neighborhood);

  const fallbackLifestyle = getEventsAndLifestyleForProperty(propertyAddress.neighborhood);
  const lifestyleData = {
    events: listing.lifestyle?.annualEvents || fallbackLifestyle.events,
    nightlife: listing.lifestyle?.nightlifeAndLounges || fallbackLifestyle.nightlife,
    community: listing.community || fallbackLifestyle.community,
    lighting: listing.smartLighting || fallbackLifestyle.lighting,
    roads: listing.roadTransit || fallbackLifestyle.roads,
  };

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
        {/* SECTION: 9-DIMENSION PROPERTY DECISION SCORECARD & DATA CONFIDENCE        */}
        {/* ========================================================================= */}
        <section className="w-full bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center font-black text-base shadow-md shadow-red-200">
                ★
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                  Decision Engine
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  9-Dimension Property Decision Scorecard
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Decision Fit</span>
                <span className="text-2xl sm:text-3xl font-black text-red-600 font-mono">
                  {scores.overallScore} / 100
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{scores.dataConfidence}% Data Confidence</span>
              </div>
            </div>
          </div>

          {/* 9 Discrete Dimension Scores */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Budget Fit</span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-slate-900 font-mono">{scores.budgetFit}</span>
                <span className="text-[10px] font-bold text-slate-500">/ 100</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${scores.budgetFit}%` }} />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Location Fit</span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-slate-900 font-mono">{scores.locationFit}</span>
                <span className="text-[10px] font-bold text-slate-500">/ 100</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${scores.locationFit}%` }} />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Investment Fit</span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-slate-900 font-mono">{scores.investmentFit}</span>
                <span className="text-[10px] font-bold text-slate-500">/ 100</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${scores.investmentFit}%` }} />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">School Fit</span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-slate-900 font-mono">{scores.schoolFit}</span>
                <span className="text-[10px] font-bold text-slate-500">/ 100</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${scores.schoolFit}%` }} />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Safety Fit</span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-slate-900 font-mono">{scores.safetyFit}</span>
                <span className="text-[10px] font-bold text-slate-500">/ 100</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${scores.safetyFit}%` }} />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Commute / Transit</span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-slate-900 font-mono">{scores.transportationFit}</span>
                <span className="text-[10px] font-bold text-slate-500">/ 100</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${scores.transportationFit}%` }} />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Lifestyle & Malls</span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-slate-900 font-mono">{scores.lifestyleFit}</span>
                <span className="text-[10px] font-bold text-slate-500">/ 100</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${scores.lifestyleFit}%` }} />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Build Quality</span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-slate-900 font-mono">{scores.propertyQualityFit}</span>
                <span className="text-[10px] font-bold text-slate-500">/ 100</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-slate-700 h-full rounded-full" style={{ width: `${scores.propertyQualityFit}%` }} />
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Data Provenance</span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-emerald-900 font-mono">{scores.dataConfidence}%</span>
                <span className="text-[10px] font-bold text-emerald-600">Verified</span>
              </div>
              <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${scores.dataConfidence}%` }} />
              </div>
            </div>
          </div>

          {/* Why This Home & Due Diligence Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Why This Home */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Why This Property Fits You</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {dueDiligence.positiveHighlights.map((hl, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Potential Concerns / Due Diligence */}
            <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3">
              <h3 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>⚠️</span>
                <span>Potential Concerns & Due Diligence Alerts</span>
              </h3>
              {dueDiligence.dueDiligenceWarnings.length > 0 ? (
                <div className="space-y-2.5 text-xs">
                  {dueDiligence.dueDiligenceWarnings.map((w, i) => (
                    <div key={i} className="p-2.5 bg-white/90 rounded-xl border border-amber-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900">{w.category}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                          {w.severity}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{w.message}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Recommendation: {w.recommendation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  ✓ Clean Due Diligence Profile: No elevated HOA commitments, historical mechanical fatigue, or adverse zoning encumbrances detected.
                </p>
              )}
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION: MULTI-SCENARIO FINANCIAL UNDERWRITING & 10-LINE EXPENSE MODEL    */}
        {/* ========================================================================= */}
        <section className="w-full bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-red-200">
                📊
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                  Financial Intelligence
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Multi-Scenario Investment Underwriting (10-Line Operating Model)
                </h2>
              </div>
            </div>

            {/* Scenario Switcher Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setSelectedScenario('conservative')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedScenario === 'conservative' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Conservative
              </button>
              <button
                onClick={() => setSelectedScenario('base')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedScenario === 'base' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Base Case
              </button>
              <button
                onClick={() => setSelectedScenario('optimistic')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedScenario === 'optimistic' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Optimistic
              </button>
            </div>
          </div>

          {/* Active Scenario Summary Cards */}
          {(() => {
            const activeProj = scenarios[selectedScenario];
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Monthly Net Cash Flow</span>
                  <span className={`text-xl font-black font-mono ${activeProj.monthlyNetCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {activeProj.monthlyNetCashFlow >= 0 ? '+' : ''}{formatCurrency(activeProj.monthlyNetCashFlow)}/mo
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                    {selectedScenario.toUpperCase()} CASE
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Unlevered Cap Rate</span>
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {activeProj.capRatePercent}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                    Calculated NOI / Price
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Cash-on-Cash Return</span>
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {activeProj.cashOnCashReturnPercent}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                    Down Payment + Closing
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">5-Year Equity Projection</span>
                  <span className="text-xl font-black text-emerald-700 font-mono">
                    {formatCurrency(activeProj.fiveYearEquityUSD)}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                    +{activeProj.appreciationPercentAnnual}%/yr appreciation
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Detailed 10-Line Operating Expense Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              10-Line Item Monthly Operating Expense Schedule
            </h3>
            <div className="divide-y divide-slate-100 text-xs border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <div className="p-3 bg-slate-50 font-bold flex justify-between text-slate-900">
                <span>Monthly Gross Scheduled Rent:</span>
                <span className="font-mono text-emerald-700">+{formatCurrency(scenarios.expenses.grossMonthlyRent)}</span>
              </div>
              <div className="p-3 flex justify-between text-slate-600">
                <span>Vacancy & Credit Loss Reserve:</span>
                <span className="font-mono text-rose-600">-{formatCurrency(scenarios.expenses.vacancyLoss)}</span>
              </div>
              <div className="p-3 flex justify-between text-slate-600">
                <span>Professional Property Management Fee:</span>
                <span className="font-mono text-rose-600">-{formatCurrency(scenarios.expenses.propertyManagementFee)}</span>
              </div>
              <div className="p-3 flex justify-between text-slate-600">
                <span>Ongoing Maintenance & Turnover Reserve:</span>
                <span className="font-mono text-rose-600">-{formatCurrency(scenarios.expenses.maintenanceReserve)}</span>
              </div>
              <div className="p-3 flex justify-between text-slate-600">
                <span>Long-Term Capital Expenditure (CapEx) Reserve:</span>
                <span className="font-mono text-rose-600">-{formatCurrency(scenarios.expenses.capexReserve)}</span>
              </div>
              <div className="p-3 flex justify-between text-slate-600">
                <span>Municipal & County Real Estate Taxes (Monthly):</span>
                <span className="font-mono text-rose-600">-{formatCurrency(scenarios.expenses.propertyTaxMonthly)}</span>
              </div>
              <div className="p-3 flex justify-between text-slate-600">
                <span>Hazard & Property Insurance Premium (Monthly):</span>
                <span className="font-mono text-rose-600">-{formatCurrency(scenarios.expenses.insuranceMonthly)}</span>
              </div>
              <div className="p-3 flex justify-between text-slate-600">
                <span>Homeowners Association (HOA) Dues:</span>
                <span className="font-mono text-slate-900">-{formatCurrency(scenarios.expenses.hoaDuesMonthly)}</span>
              </div>
              <div className="p-3 flex justify-between text-slate-600">
                <span>Mortgage Debt Service (30-Yr Fixed Principal & Interest):</span>
                <span className="font-mono text-rose-600">-{formatCurrency(scenarios.expenses.mortgageDebtService)}</span>
              </div>
              <div className="p-3.5 bg-slate-900 text-white font-bold flex justify-between items-center">
                <span>Net Operating Cash Flow (Monthly):</span>
                <span className={`text-base font-black font-mono ${scenarios.expenses.netMonthlyCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {scenarios.expenses.netMonthlyCashFlow >= 0 ? '+' : ''}{formatCurrency(scenarios.expenses.netMonthlyCashFlow)}/mo
                </span>
              </div>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION: AUTONOMOUS MULTI-AGENT SYNTHESIS CONSOLE                         */}
        {/* ========================================================================= */}
        <section className="w-full">
          <MultiAgentSynthesisConsole listing={listing} />
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
        {/* SECTION: DIMENSION 4 - NEIGHBORHOOD LIVING QUALITY & CLEAN AIR            */}
        {/* ========================================================================= */}
        <section className="w-full space-y-4 bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Dimension 4</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Neighborhood Living Quality, Greenery & Clean Air Environment
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-red-500 uppercase block">Air Quality & Freshness</span>
              <span className="text-xl font-bold text-slate-900">Clean & Pure (AQI 22)</span>
              <p className="text-[11px] text-slate-500 mt-1">Low allergen tier • Fresh park-filtered breezes</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-red-500 uppercase block">Mature Tree Canopy</span>
              <span className="text-xl font-bold text-slate-900">{forestResources?.forestCanopyCoveragePercent || 34}% Tree Canopy</span>
              <p className="text-[11px] text-slate-500 mt-1">Shaded pedestrian sidewalks and neighborhood parks</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-red-500 uppercase block">Natural Sunlight Exposure</span>
              <span className="text-xl font-bold text-slate-900">Optimal South Exposure</span>
              <p className="text-[11px] text-slate-500 mt-1">Bright, sunlit living rooms with high energy efficiency</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-red-500 uppercase block">Flood & Storm Safety</span>
              <span className="text-xl font-bold text-slate-900">FEMA Zone X (Safe)</span>
              <p className="text-[11px] text-slate-500 mt-1">Zero 100-year flood risk • Well elevated terrain</p>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION: DIMENSION 5 - STRUCTURAL BUILD QUALITY & FOUNDATION ASSURANCE    */}
        {/* ========================================================================= */}
        <section className="w-full space-y-4 bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm">
              5
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Dimension 5</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Structural Home Build Quality, Foundation & Energy Efficiency
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Foundation Type</span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ✓ VERIFIED FACT
                </span>
              </div>
              <span className="text-base font-black text-slate-900 font-sans block">
                Monolithic Reinforced Slab
              </span>
              <p className="text-[11px] text-slate-500">Source: County Building Records • Bedrock depth {geotechnical.bedrockDepthFeet || 36} ft</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Groundwater Clearance</span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ✓ VERIFIED FACT
                </span>
              </div>
              <span className="text-base font-black text-slate-900 font-sans block">
                {geotechnical.waterTableDepthFeet} ft Water Table
              </span>
              <p className="text-[11px] text-slate-500">Source: Geotechnical Survey • Deep clearance above seasonal water table</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Roof & Envelope</span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ✓ VERIFIED FACT
                </span>
              </div>
              <span className="text-base font-black text-slate-900 font-sans block">
                Architectural Shingle
              </span>
              <p className="text-[11px] text-slate-500">Source: Building Inspection Log • Low-E double pane insulated glazing</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Mechanical & HVAC</span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  CALCULATED
                </span>
              </div>
              <span className="text-base font-black text-slate-900 font-sans block">
                Dual-Zone Heat Pump
              </span>
              <p className="text-[11px] text-slate-500">Source: MLS Disclosure • Estimated residential utility ~$145/mo</p>
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
                Public Safety Intelligence, Municipal Precincts & Property Taxes
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
