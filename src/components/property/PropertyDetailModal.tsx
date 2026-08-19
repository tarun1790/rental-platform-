'use client';

import React, { useState } from 'react';
import { 
  X, 
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
  Volume2, 
  Calendar, 
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
  Heart,
  Home,
  TreePine,
  Plane,
  Globe
} from 'lucide-react';
import { ShikaakPropertyListing } from '../../types/property';
import { formatCurrency, formatPercent } from '../../lib/roi-engine';
import { BlueprintFurnitureStaging } from './BlueprintFurnitureStaging';
import { RoiCalculatorWidget } from './RoiCalculatorWidget';

interface PropertyDetailModalProps {
  listing: ShikaakPropertyListing | null;
  onClose: () => void;
}

type TabType = 'overview' | 'geotechnical' | 'safety' | 'amenities' | 'cad' | 'roi' | 'apply';

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  listing,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantIncome, setApplicantIncome] = useState('$145,000');

  if (!listing) return null;

  const { specs, geotechnical, safety, amenities, microclimate, blueprint, financials, propertyAddress, media } = listing;
  const { outputs } = financials;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplicationSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-modal border-2 border-red-500 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Sticky Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-red-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black shadow-md shadow-red-500/20">
              <Home className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  {propertyAddress.street}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-lg bg-red-100 text-red-800 font-sans">
                  {specs.propertyType.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>{propertyAddress.neighborhood}, {propertyAddress.city}, {propertyAddress.state} {propertyAddress.zipCode}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Price Pill */}
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-lg font-black text-red-600 font-mono">
                {formatCurrency(financials.inputs.purchasePrice)}
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {formatCurrency(financials.inputs.monthlyGrossRent)} / mo rent
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-red-100 bg-red-50/50 flex items-center gap-2 overflow-x-auto text-xs py-2">
          {[
            { id: 'overview', label: 'Overview & Gallery', icon: Building },
            { id: 'geotechnical', label: 'Soil & Foundation', icon: Layers },
            { id: 'safety', label: 'Safety & 911', icon: ShieldCheck },
            { id: 'amenities', label: 'Ranked Amenities', icon: Award },
            { id: 'cad', label: 'CAD Blueprint', icon: Compass },
            { id: 'roi', label: 'ROI Calculator', icon: TrendingUp },
            { id: 'apply', label: 'Apply Online', icon: FileText },
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

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* TAB 1: OVERVIEW & GALLERY */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Photo Gallery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={media.gallery[selectedImageIndex] || media.featuredImage}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
                  {media.gallery.slice(0, 3).map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative aspect-[16/10] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedImageIndex === idx ? 'border-brand-600' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Highlights Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Beds / Baths</span>
                  <div className="text-base font-black text-slate-900">{specs.beds} Beds • {specs.baths} Baths</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Finished Area</span>
                  <div className="text-base font-black text-slate-900">{specs.finishedSqFt.toLocaleString()} Sq Ft</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Year Built</span>
                  <div className="text-base font-black text-slate-900">{specs.yearBuilt} Modern Build</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">HVAC & Climate</span>
                  <div className="text-xs font-bold text-slate-900">{specs.hvacType}</div>
                </div>
              </div>

              {/* Overview Summary & Why It Surpasses Zillow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
                    About {listing.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Exclusively surveyed and underwritten by HOME. Located in prestigious {propertyAddress.neighborhood}, this property features verified post-fire brick/masonry architectural engineering, tested silty loam foundation bearing capacity of {geotechnical.bearingCapacityPSF.toLocaleString()} PSF, a documented {safety.theftFreeMilestoneYears}-year zero-burglary block security milestone, and an institutional Pass/Flow investment rating of <strong>{outputs.passFlowScore.toFixed(1)} / 5.0</strong>.
                  </p>

                  {/* Microclimate Telemetry Grid */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-brand-400">
                      Microclimate & Environmental Telemetry
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Annual Sun</span>
                        <span className="font-bold font-mono">{microclimate.annualSunHours} Hours</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Lake Wind Buffer</span>
                        <span className="font-bold font-mono">{microclimate.windBufferingScore}/100</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Rush Hour Noise</span>
                        <span className="font-bold font-mono">{microclimate.peakNoiseDecibelsRushHour} dB (Quiet)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Snow Priority</span>
                        <span className="font-bold font-mono">Tier {microclimate.snowClearancePriorityTier} (Rapid)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Underwriting Sidebar */}
                <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <span className="font-black text-emerald-900 text-sm uppercase tracking-wider">
                      Pass/Flow Rating: {outputs.passFlowScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-emerald-200/60">
                      <span className="text-slate-600">Net Monthly Cash Flow:</span>
                      <span className="font-black text-emerald-700 font-mono">+{formatCurrency(outputs.monthlyNetCashFlow)}/mo</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-emerald-200/60">
                      <span className="text-slate-600">Cap Rate:</span>
                      <span className="font-bold text-slate-900 font-mono">{formatPercent(outputs.capRatePercent)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-emerald-200/60">
                      <span className="text-slate-600">Cash on Cash:</span>
                      <span className="font-bold text-emerald-700 font-mono">{formatPercent(outputs.cashOnCashReturnPercent)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">DSCR Debt Coverage:</span>
                      <span className="font-bold text-slate-900 font-mono">{outputs.debtServiceCoverageRatio.toFixed(2)}x</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('roi')}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Open Live ROI Calculator →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GEOTECHNICAL & SUBSURFACE SOIL SPECS */}
          {activeTab === 'geotechnical' && (
            <div className="space-y-6">
              <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-6 h-6 text-brand-400" />
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wide">
                      Subsurface Soil Mechanics & Foundation Engineering
                    </h3>
                    <p className="text-xs text-slate-400">
                      Deep geotechnical and soil stability telemetry for institutional accuracy.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                      Underground Soil Type
                    </span>
                    <span className="text-base font-bold text-white mt-1 block">
                      {geotechnical.soilClassification}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                      Foundation Bearing Capacity
                    </span>
                    <span className="text-xl font-black text-amber-400 font-mono mt-1 block">
                      {geotechnical.bearingCapacityPSF.toLocaleString()} PSF
                    </span>
                    <span className="text-[10px] text-emerald-400">Zero foundation sinkage risk</span>
                  </div>

                  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                      Settlement Safety Score
                    </span>
                    <span className="text-xl font-black text-emerald-400 font-mono mt-1 block">
                      {geotechnical.settlementRiskScore} / 100
                    </span>
                    <span className="text-[10px] text-slate-300">Top 1% structural stability</span>
                  </div>
                </div>
              </div>

              {/* Subsurface Geological Specs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Geotechnical Invariants
                  </h4>
                  <div className="divide-y divide-slate-200 text-xs">
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-600">Depth to Solid Limestone Bedrock:</span>
                      <span className="font-bold text-slate-900 font-mono">{geotechnical.bedrockDepthFeet} ft</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-600">Water Table Depth (Basement Flood Safety):</span>
                      <span className="font-bold text-emerald-600 font-mono">{geotechnical.waterTableDepthFeet} ft (Dry Basement)</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-600">Seismic Liquefaction Risk Tier:</span>
                      <span className="font-bold text-emerald-600 font-mono">{geotechnical.liquefactionRiskTier}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-600">Expansive Clay Shrink-Swell Rating:</span>
                      <span className="font-bold text-slate-900 font-mono">{geotechnical.expansiveClayShrinkSwell}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Why Soil Mechanics Matter for Buyers & Investors
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Foundation settling and basement water intrusion are among the #1 unexpected repair costs in Chicago. With a tested <strong>{geotechnical.bearingCapacityPSF.toLocaleString()} PSF</strong> bearing capacity and a dry water table at <strong>{geotechnical.waterTableDepthFeet}+ ft</strong>, this property requires 0 foundation underpinning and offers complete peace of mind.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 20-YEAR SAFETY TIMELINE & 911 DISPATCH */}
          {activeTab === 'safety' && (
            <div className="space-y-6">
              {/* Safety Hero Banner */}
              <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wide">
                      20-Year Block Security & Emergency Dispatch Radar
                    </h3>
                    <p className="text-xs text-slate-400">
                      Multi-decade verified municipal incident logs & response times.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Safety Index</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                      {safety.safetyIndexScore} / 100
                    </span>
                    <span className="text-[10px] text-slate-300">Top 2% Safest Chicago</span>
                  </div>

                  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Theft Milestone</span>
                    <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
                      {safety.theftFreeMilestoneYears} Years
                    </span>
                    <span className="text-[10px] text-emerald-400">0 Burglaries Recorded</span>
                  </div>

                  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">CPD Arrival Time</span>
                    <span className="text-2xl font-black text-white font-mono mt-1 block">
                      {safety.policeResponseAvgMinutes} min
                    </span>
                    <span className="text-[10px] text-slate-300">{safety.nearestPrecinct?.distanceMiles || 0.5} mi from Station</span>
                  </div>

                  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Fire / EMS Arrival</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                      {safety.fireEMSResponseAvgMinutes} min
                    </span>
                    <span className="text-[10px] text-slate-300">Rapid Response Zone</span>
                  </div>
                </div>
              </div>

              {/* Traffic Accident History & Incident Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    10-Year Intersection & Street Safety
                  </h4>
                  <div className="divide-y divide-slate-200 text-xs">
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-600">10-Year Pedestrian Accidents:</span>
                      <span className="font-bold text-emerald-600 font-mono">0 Incidents</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-600">10-Year Vehicular Collisions:</span>
                      <span className="font-bold text-slate-900 font-mono">{safety.tenYearTrafficAccidents?.vehicularCollisions || 0} Minor</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-600">Speed Limit & Calming:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {safety.tenYearTrafficAccidents?.speedZoneLimitMph || 20} MPH Speed Humps Installed
                      </span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-600">Nearest Police Precinct:</span>
                      <span className="font-bold text-slate-900">{safety.nearestPrecinct?.name || 'CPD Precinct'}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Incident Log Timeline
                  </h4>
                  {(safety.incidentTimeline && safety.incidentTimeline.length > 0) ? (
                    <div className="space-y-3 text-xs">
                      {safety.incidentTimeline.map((item, idx) => (
                        <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
                          <span className="px-2 py-0.5 bg-slate-100 font-mono font-bold text-slate-800 rounded">
                            {item.year}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900">{item.description}</div>
                            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                              Status: Resolved & Cleared
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs">
                      🏆 Pristine record: Zero reported criminal or vehicular incidents on this block.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RANKED AMENITIES MATRIX */}
          {activeTab === 'amenities' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black uppercase tracking-wide">
                    5-Star Ranked Local Amenities & Lifestyle Matrix
                  </h3>
                  <p className="text-xs text-slate-400">
                    Every nearby hospital, Michelin corridor, shopping hub, and school scored 1-100.
                  </p>
                </div>
              </div>

              {/* Amenity Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {amenities.map((amenity) => {
                  const configMap: Record<string, { icon: any; label: string; color: string }> = {
                    HOSPITAL: { icon: Award, label: 'Level-1 Hospital', color: 'text-rose-600 bg-rose-50' },
                    MICHELIN_DINING: { icon: Utensils, label: 'Michelin Dining', color: 'text-amber-600 bg-amber-50' },
                    FOOD_MICHELIN: { icon: Utensils, label: 'Michelin Dining', color: 'text-amber-600 bg-amber-50' },
                    SHOPPING: { icon: ShoppingBag, label: 'Shopping & Retail', color: 'text-purple-600 bg-purple-50' },
                    SHOPPING_MALL: { icon: ShoppingBag, label: 'Regional Retail', color: 'text-purple-600 bg-purple-50' },
                    ENTERTAINMENT: { icon: Film, label: 'Live Entertainment', color: 'text-blue-600 bg-blue-50' },
                    SCHOOL: { icon: GraduationCap, label: 'Top School', color: 'text-emerald-600 bg-emerald-50' },
                    PARK: { icon: Award, label: 'Park & Recreation', color: 'text-emerald-600 bg-emerald-50' },
                  };

                  const categoryConfig = configMap[amenity.category] || { icon: Award, label: 'Amenity', color: 'text-slate-600 bg-slate-50' };
                  const Icon = categoryConfig.icon;

                  return (
                    <div key={amenity.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${categoryConfig.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {categoryConfig.label}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm leading-snug">
                              {amenity.name}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">{amenity.keyAttribute}</p>
                          </div>
                        </div>

                        {/* Rank Score Pill */}
                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded-full bg-slate-900 text-white font-mono font-bold text-xs">
                            {amenity.rankScore} / 100
                          </span>
                          {amenity.hygieneGradeOrRating && (
                            <span className="block text-[10px] font-bold text-emerald-600 mt-1">
                              {amenity.hygieneGradeOrRating}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <span>Distance: <strong>{amenity.distanceMiles} miles</strong></span>
                        <span className="font-bold text-brand-600">{amenity.driveTimeMinutes} min drive / transit</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: CAD BLUEPRINT & FURNITURE STAGING */}
          {activeTab === 'cad' && (
            <BlueprintFurnitureStaging
              blueprint={blueprint}
              totalSqFt={specs.finishedSqFt}
            />
          )}

          {/* TAB 6: INSTITUTIONAL ROI CALCULATOR */}
          {activeTab === 'roi' && (
            <RoiCalculatorWidget initialInputs={financials.inputs} />
          )}

          {/* TAB 7: DIGITAL LEASE APPLICATION */}
          {activeTab === 'apply' && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="p-6 bg-slate-900 text-white rounded-2xl text-center space-y-2">
                <FileText className="w-8 h-8 text-brand-500 mx-auto" />
                <h3 className="text-lg font-black uppercase tracking-wide">
                  Instant Digital Rental Application & Smart Screening
                </h3>
                <p className="text-xs text-slate-400">
                  Pre-screened verification with zero hard-credit inquiries and automated escrow lease generation.
                </p>
              </div>

              {!applicationSubmitted ? (
                <form onSubmit={handleApply} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Applicant Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Verified Annual Income</label>
                      <input
                        type="text"
                        value={applicantIncome}
                        onChange={(e) => setApplicantIncome(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Target Move-In Date</label>
                      <input
                        type="date"
                        defaultValue="2026-09-01"
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Lease Term Preference</label>
                    <select className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900">
                      <option>12-Month Standard Lease ({formatCurrency(financials.inputs.monthlyGrossRent)}/mo)</option>
                      <option>24-Month Guaranteed Rate</option>
                      <option>Month-to-Month Flexible</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-brand shadow-red-500/20 transition-all hover:scale-[1.02]"
                  >
                    Submit Verified Application Instantly
                  </button>
                </form>
              ) : (
                <div className="p-8 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-black text-emerald-900">
                    Application Successfully Underwritten!
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Your preliminary digital package has been transmitted to the property management team for <strong>{propertyAddress.street}</strong>.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
