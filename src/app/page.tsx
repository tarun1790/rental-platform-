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
import { formatCurrency } from '../lib/roi-engine';
import { 
  Sparkles, 
  ArrowUpDown, 
  Layers, 
  ShieldCheck, 
  Compass, 
  Building, 
  Info, 
  Globe,
  Map as MapIcon,
  List,
  Columns2,
  ChevronRight,
  X,
  MapPin,
  Bed,
  Bath,
  Square
} from 'lucide-react';

export default function Home() {
  const router = useRouter();

  // Global Listings State (Chicago & Colorado Properties)
  const [allListings] = useState<ShikaakPropertyListing[]>(CHICAGO_LISTINGS);
  const [selectedListing, setSelectedListing] = useState<ShikaakPropertyListing | null>(CHICAGO_LISTINGS[0]);
  const [modalListing, setModalListing] = useState<ShikaakPropertyListing | null>(null);

  // Intelligence & Voice Assistant
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguageCode>('en');

  // Freehand Scribble / Lasso State
  const [isScribbleActive, setIsScribbleActive] = useState(false);
  const [scribblePolygon, setScribblePolygon] = useState<GeoCoordinate[] | null>(null);

  // View state: split, map, list
  const [activeView, setActiveView] = useState<'split' | 'map' | 'list'>('split');

  // Mobile check
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024 && activeView === 'split') {
        setActiveView('split');
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
  const listingsScrollRef = useRef<HTMLDivElement>(null);

  const handleScrollToDashboard = () => {
    const el = document.getElementById('dashboard-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProperty = (listing: ShikaakPropertyListing) => {
    router.push(`/property/${listing.id}`);
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
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-x-hidden">
      
      {/* 1. Dark Aesthetic Hero Section (Full Screen 100vh Black Luxury House with ONLY HOME Text) */}
      <HeroSection
        onExploreClick={handleScrollToDashboard}
        totalListingsCount={allListings.length}
      />

      {/* 2. Full-Fitted Interactive Real Estate & Geospatial Dashboard Section */}
      <div 
        ref={dashboardRef} 
        id="dashboard-section" 
        className="flex flex-col h-screen max-h-screen overflow-hidden bg-white"
      >
        
        {/* 9-Item Clean Header & Filter Controls (Strictly White & Red) */}
        <Header
          filters={filters}
          onFilterChange={setFilters}
          listingCount={filteredListings.length}
          totalCount={allListings.length}
          isScribbleActive={isScribbleActive}
          onToggleScribble={handleToggleScribble}
          onClearScribble={handleClearScribble}
          hasScribbleBoundary={!!scribblePolygon}
          activeView={activeView}
          onViewChange={setActiveView}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onScrollToTop={handleScrollToTop}
          onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
        />

        {/* Main Dashboard Workspace (Strictly Fits Screen Max Without Page Spill) */}
        <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden relative">
          
          {/* Left Pane: Dedicated Scrollable Rectangular House Listings Feed */}
          {(activeView === 'split' || activeView === 'list') && (
            <section 
              className={`flex flex-col bg-slate-50/50 border-r border-red-100 transition-all ${
                activeView === 'list' 
                  ? 'w-full max-w-5xl mx-auto border-r-0 h-full overflow-hidden' 
                  : 'w-full lg:w-[48%] xl:w-[45%] h-full overflow-hidden'
              } ${isMobile && activeView === 'split' ? 'h-[50%] border-b-2 border-red-200' : ''}`}
            >
              
              {/* List Control Bar */}
              <div className="p-3 sm:p-4 bg-white border-b border-red-100 flex items-center justify-between gap-2 shrink-0 z-20">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">
                    {filteredListings.length} Verified Properties
                  </span>
                  {scribblePolygon && (
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-red-100 text-red-800 border border-red-300 rounded-full">
                      Polygon Filter Active
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-red-600 font-mono font-bold">
                  Showing 1 - {filteredListings.length} of {allListings.length}
                </div>
              </div>

              {/* INDEPENDENT SCROLLABLE RECTANGULAR HOUSE CONTAINER */}
              <div 
                ref={listingsScrollRef}
                className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-red-300"
              >

                {/* Property Cards Feed */}
                {filteredListings.length > 0 ? (
                  filteredListings.map((listing) => (
                    <PropertyCard
                      key={listing.id}
                      listing={listing}
                      isSelected={selectedListing?.id === listing.id}
                      onSelect={(item) => setSelectedListing(item)}
                      onOpenDetail={(item) => handleOpenProperty(item)}
                    />
                  ))
                ) : (
                  <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border-2 border-red-200 space-y-3">
                    <Compass className="w-10 h-10 text-red-300 mx-auto" />
                    <h4 className="text-base font-bold text-slate-800">
                      No properties match your current boundary or filter criteria
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Try clearing the hand-drawn boundary or resetting your location and price filters.
                    </p>
                    <button
                      onClick={handleClearScribble}
                      className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 hover:bg-red-700"
                    >
                      Clear Boundary
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Right Pane: Stationary Interactive Geospatial Live Map */}
          {(activeView === 'split' || activeView === 'map') && (
            <section 
              className={`flex-1 relative bg-slate-100 h-full overflow-hidden ${
                isMobile && activeView === 'split' ? 'h-[50%]' : 'h-full'
              }`}
            >
              <ScribbleMap
                listings={filteredListings}
                selectedListing={selectedListing}
                onSelectListing={(listing) => setSelectedListing(listing)}
                isScribbleActive={isScribbleActive}
                onScribbleComplete={handleScribbleComplete}
                scribblePolygon={scribblePolygon}
                onClearScribble={handleClearScribble}
                onOpenFullDetail={handleOpenProperty}
              />

              {/* Mobile Selected Property Floating Bottom Preview Card (When in Map View on Mobile) */}
              {isMobile && activeView === 'map' && selectedListing && (
                <div className="absolute bottom-16 inset-x-3 z-30 bg-white border-2 border-red-500 rounded-3xl p-3 shadow-2xl shadow-red-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
                  <img
                    src={selectedListing.media.featuredImage}
                    alt={selectedListing.title}
                    className="w-20 h-20 rounded-2xl object-cover border border-red-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] text-red-600 font-bold mb-0.5">
                      <span>{selectedListing.propertyAddress.city}, {selectedListing.propertyAddress.state}</span>
                      <span>•</span>
                      <span className="font-mono">{selectedListing.timezone?.timeZoneCode || 'MST'}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {selectedListing.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-black text-red-600 font-mono">
                        {formatCurrency(selectedListing.financials.inputs.purchasePrice)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600">
                        {selectedListing.specs.beds}b • {selectedListing.specs.baths}ba
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenProperty(selectedListing)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shrink-0 shadow-md"
                  >
                    Inspect
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Floating Mobile Bottom Navigation Switcher */}
          <div className="lg:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border-2 border-red-500 px-3 py-1.5 rounded-full shadow-2xl shadow-red-500/30 flex items-center gap-1">
            <button
              onClick={() => setActiveView('split')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                activeView === 'split' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-700 hover:text-red-600'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setActiveView('map')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                activeView === 'map' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-700 hover:text-red-600'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                activeView === 'list' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-700 hover:text-red-600'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Houses ({filteredListings.length})</span>
            </button>
          </div>
        </main>
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
