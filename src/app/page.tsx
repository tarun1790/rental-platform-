'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HeroSection } from '../components/home/HeroSection';
import { Header } from '../components/layout/Header';
import { PropertyCard } from '../components/property/PropertyCard';
import { PropertyDetailModal } from '../components/property/PropertyDetailModal';
import { ScribbleMap } from '../components/map/ScribbleMap';
import { VoiceAssistantModal } from '../components/intelligence/VoiceAssistantModal';
import { CHICAGO_LISTINGS } from '../data/chicago-listings';
import { ShikaakPropertyListing, FilterState, GeoCoordinate } from '../types/property';
import { SupportedLanguageCode } from '../types/intelligence';
import { isPointInsidePolygon } from '../lib/geo-utils';
import { formatCurrency, formatPercent } from '../lib/roi-engine';
import { 
  Sparkles, 
  ArrowUpDown, 
  Layers, 
  ShieldCheck, 
  Compass, 
  Building, 
  Info, 
  Globe,
  MapPin,
  ChevronDown,
  SlidersHorizontal,
  Map as MapIcon,
  List,
  ChevronRight,
  Plane,
  TreePine,
  Flame,
  Bed,
  Bath,
  Square,
  ArrowDown
} from 'lucide-react';

export default function Home() {
  const router = useRouter();

  // Global Listings State (Chicago & Colorado Luxury Properties)
  const [allListings] = useState<ShikaakPropertyListing[]>(CHICAGO_LISTINGS);
  const [selectedListing, setSelectedListing] = useState<ShikaakPropertyListing | null>(CHICAGO_LISTINGS[0]);
  const [modalListing, setModalListing] = useState<ShikaakPropertyListing | null>(null);

  // Intelligence & Voice Assistant
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguageCode>('en');

  // Freehand Scribble / Lasso State
  const [isScribbleActive, setIsScribbleActive] = useState(false);
  const [scribblePolygon, setScribblePolygon] = useState<GeoCoordinate[] | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<'SCORE_DESC' | 'PRICE_ASC' | 'PRICE_DESC' | 'SQFT_DESC' | 'SOIL_DESC'>('SCORE_DESC');

  // Filter State (9-Item Filter Criteria)
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    listingStatus: 'ALL',
    priceMin: 0,
    priceMax: 5000000,
    bedsMin: 0,
    bathsMin: 0,
    propertyType: 'ALL',
    minPassFlowScore: 1.0,
    zeroTheftOnly: false,
    minSoilBearingPSF: 0,
    maxPropertyTaxesUSD: 50000,
    maxDistanceToSchoolKm: 10,
  });

  const dashboardRef = useRef<HTMLDivElement>(null);
  const housesSectionRef = useRef<HTMLDivElement>(null);

  const handleScrollToDashboard = () => {
    const el = document.getElementById('dashboard-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToHouses = () => {
    const el = document.getElementById('houses-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenProperty = (listing: ShikaakPropertyListing) => {
    router.push(`/property/${listing.id}`);
  };

  const handleSelectPropertyFromMap = (listing: ShikaakPropertyListing) => {
    setSelectedListing(listing);
    // Smoothly scroll down to that selected house card below the map
    setTimeout(() => {
      const cardEl = document.getElementById(`house-${listing.id}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // Filter and Sort Listings
  const filteredListings = useMemo(() => {
    return allListings
      .filter((listing) => {
        // 1. Text Search Filter (Street, City, State, or Neighborhood)
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          const matchStreet = listing.propertyAddress.street.toLowerCase().includes(query);
          const matchCity = listing.propertyAddress.city.toLowerCase().includes(query);
          const matchState = listing.propertyAddress.state.toLowerCase().includes(query);
          const matchNeighborhood = listing.propertyAddress.neighborhood.toLowerCase().includes(query);
          const matchTitle = listing.title.toLowerCase().includes(query);
          if (!matchStreet && !matchCity && !matchState && !matchNeighborhood && !matchTitle) return false;
        }

        // 2. Listing Status (Buy / Rent)
        if (filters.listingStatus !== 'ALL' && listing.listingStatus !== filters.listingStatus) {
          return false;
        }

        // 3. Price Min & Max
        if (
          listing.financials.inputs.purchasePrice < filters.priceMin ||
          listing.financials.inputs.purchasePrice > filters.priceMax
        ) {
          return false;
        }

        // 4. Beds Min
        if (filters.bedsMin > 0 && listing.specs.beds < filters.bedsMin) {
          return false;
        }

        // 5. Baths Min
        if (filters.bathsMin > 0 && listing.specs.baths < filters.bathsMin) {
          return false;
        }

        // 6. Property Type
        if (filters.propertyType !== 'ALL' && listing.specs.propertyType !== filters.propertyType) {
          return false;
        }

        // 7. Pass / Flow Score Minimum
        if (listing.financials.outputs.passFlowScore < filters.minPassFlowScore) {
          return false;
        }

        // 8. Hand-Drawn Scribble Polygon Spatial Filter
        if (scribblePolygon && scribblePolygon.length >= 3) {
          const isInside = isPointInsidePolygon(listing.propertyAddress.location, scribblePolygon);
          if (!isInside) return false;
        }

        // 9. Subsurface Soil Bearing PSF Minimum
        if (filters.minSoilBearingPSF > 0 && listing.geotechnical.bearingCapacityPSF < filters.minSoilBearingPSF) {
          return false;
        }

        // 10. Maximum Property Taxes
        if (filters.maxPropertyTaxesUSD < 50000 && listing.propertyTaxes.annualAmountUSD > filters.maxPropertyTaxesUSD) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'SCORE_DESC') {
          return b.financials.outputs.passFlowScore - a.financials.outputs.passFlowScore;
        }
        if (sortBy === 'PRICE_ASC') {
          return a.financials.inputs.purchasePrice - b.financials.inputs.purchasePrice;
        }
        if (sortBy === 'PRICE_DESC') {
          return b.financials.inputs.purchasePrice - a.financials.inputs.purchasePrice;
        }
        if (sortBy === 'SQFT_DESC') {
          return b.specs.finishedSqFt - a.specs.finishedSqFt;
        }
        if (sortBy === 'SOIL_DESC') {
          return b.geotechnical.bearingCapacityPSF - a.geotechnical.bearingCapacityPSF;
        }
        return 0;
      });
  }, [allListings, filters, scribblePolygon, sortBy]);

  // Handlers for Scribble Lasso
  const handleToggleScribble = () => {
    setIsScribbleActive(!isScribbleActive);
  };

  const handleScribbleComplete = (polygon: GeoCoordinate[]) => {
    setScribblePolygon(polygon);
    setIsScribbleActive(false);
  };

  const handleClearScribble = () => {
    setScribblePolygon(null);
    setIsScribbleActive(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 text-slate-900">
      
      {/* 1. Dark Aesthetic Hero Section */}
      <HeroSection
        onExploreClick={handleScrollToDashboard}
        totalListingsCount={allListings.length}
      />

      {/* 2. Main Dashboard Container */}
      <div 
        ref={dashboardRef} 
        id="dashboard-section" 
        className="flex flex-col min-h-screen bg-white"
      >
        
        {/* Top Header & Filter Controls */}
        <Header
          filters={filters}
          onFilterChange={setFilters}
          listingCount={filteredListings.length}
          totalCount={allListings.length}
          isScribbleActive={isScribbleActive}
          onToggleScribble={handleToggleScribble}
          onClearScribble={handleClearScribble}
          hasScribbleBoundary={!!scribblePolygon}
          activeView="split"
          onViewChange={() => {}}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onScrollToTop={handleScrollToTop}
          onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
        />

        {/* ============================================================ */}
        {/* SECTION UP: FULL-WIDTH INTERACTIVE SATELLITE MAP ON TOP     */}
        {/* ============================================================ */}
        <section className="w-full h-[48vh] sm:h-[55vh] lg:h-[58vh] relative bg-slate-100 border-b border-slate-200 z-10">
          <ScribbleMap
            listings={filteredListings}
            selectedListing={selectedListing}
            onSelectListing={handleSelectPropertyFromMap}
            isScribbleActive={isScribbleActive}
            onScribbleComplete={handleScribbleComplete}
            scribblePolygon={scribblePolygon}
            onClearScribble={handleClearScribble}
            onOpenFullDetail={handleOpenProperty}
          />

          {/* Quick Glide Down Button */}
          <button
            onClick={handleScrollToHouses}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-white/95 text-red-500 border border-slate-300 rounded-full shadow-sm text-xs font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all"
          >
            <span>View {filteredListings.length} Houses Below</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </section>

        {/* ============================================================ */}
        {/* SECTION DOWN: SPACIOUS HOUSE DETAILS GRID UNDERNEATH THE MAP */}
        {/* ============================================================ */}
        <section 
          ref={housesSectionRef}
          id="houses-section"
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8"
        >
          
          {/* 1. SELECTED HOUSE SPOTLIGHT (APPEARS DIRECTLY BELOW THE MAP WHEN A PIN IS CLICKED) */}
          {selectedListing && (
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 border border-red-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-72 h-44 rounded-2xl overflow-hidden shrink-0 border border-slate-200">
                <img
                  src={selectedListing.media.featuredImage}
                  alt={selectedListing.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold font-mono">
                    Pass/Flow {selectedListing.financials.outputs.passFlowScore.toFixed(1)} / 5.0
                  </span>
                  <span className="px-3 py-0.5 bg-white text-slate-700 rounded-full text-xs font-medium border border-slate-200">
                    {selectedListing.propertyAddress.city}, {selectedListing.propertyAddress.state} ({selectedListing.timezone?.timeZoneCode || 'CST'})
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    Selected on Map
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {selectedListing.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-normal">
                    {selectedListing.propertyAddress.street}, {selectedListing.propertyAddress.neighborhood}
                  </p>
                </div>

                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-2xl font-bold text-red-500 font-mono">
                    {formatCurrency(selectedListing.financials.inputs.purchasePrice)}
                  </span>
                  <span className="text-xs font-medium text-slate-400 font-mono">
                    {formatCurrency(selectedListing.financials.inputs.monthlyGrossRent)}/mo rent
                  </span>
                  <span className="text-xs font-medium text-slate-600">
                    • {selectedListing.specs.beds} Beds • {selectedListing.specs.baths} Baths • {selectedListing.specs.finishedSqFt.toLocaleString()} sq ft
                  </span>
                </div>

                {/* Telemetry Chips for Selected House */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium">
                    ✈️ {selectedListing.airport?.primaryAirportIATA || 'ORD'} ({selectedListing.airport?.distanceToAirportKm || 24} km)
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium">
                    🌲 {selectedListing.forestResources?.forestCanopyCoveragePercent || 34}% Canopy
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium">
                    💰 Taxes: {formatCurrency(selectedListing.propertyTaxes.annualAmountUSD)}/yr
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium">
                    🧱 Soil: {selectedListing.geotechnical.bearingCapacityPSF.toLocaleString()} PSF
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
                <button
                  onClick={() => handleOpenProperty(selectedListing)}
                  className="px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-center"
                >
                  Open Full Intelligence →
                </button>
              </div>
            </div>
          )}

          {/* 2. Feed Title & Quick Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 pt-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                  Verified Real Estate Telemetry
                </span>
                {scribblePolygon && (
                  <span className="px-2.5 py-0.5 text-[10px] font-medium bg-red-50 text-red-700 border border-red-200 rounded-full">
                    Boundary Scan Active
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {filteredListings.length} Luxury Residences Available
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Every residence features complete soil mechanics, airport proximity (km), NOAA heat waves, tree canopy %, and institutional Pass/Flow ROI underwriting.
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-medium text-slate-500 hidden sm:inline">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-red-400 shadow-sm cursor-pointer transition-all"
              >
                <option value="SCORE_DESC">Pass/Flow Score (High to Low)</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
                <option value="SQFT_DESC">Largest Finished Area</option>
                <option value="SOIL_DESC">Highest Soil Bearing (PSF)</option>
              </select>
            </div>
          </div>

          {/* 3. 3-COLUMN SPACIOUS HOUSE DETAILS GRID */}
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <PropertyCard
                  key={listing.id}
                  listing={listing}
                  isSelected={selectedListing?.id === listing.id}
                  onSelect={(item) => setSelectedListing(item)}
                  onOpenDetail={(item) => handleOpenProperty(item)}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-slate-50 rounded-3xl border border-slate-200 space-y-4 max-w-2xl mx-auto">
              <Compass className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">
                No properties match your current boundary or filter criteria
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try clearing the drawn polygon boundary on the map above or resetting your price and bedroom filters.
              </p>
              <button
                onClick={handleClearScribble}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all"
              >
                Clear Boundary & Show All Homes
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />

      {/* Comprehensive Property Detail Deep-Dive Modal (Fallback / Quick Preview) */}
      {modalListing && (
        <PropertyDetailModal
          listing={modalListing}
          onClose={() => setModalListing(null)}
        />
      )}
    </div>
  );
}
