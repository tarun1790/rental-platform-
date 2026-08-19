'use client';

import React, { useState, useMemo, useRef } from 'react';
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
import { 
  Sparkles, 
  ArrowUpDown, 
  Layers, 
  ShieldCheck, 
  Compass, 
  Building,
  Info,
  Globe
} from 'lucide-react';

export default function Home() {
  const router = useRouter();

  // Global Listings State (30 Chicago Properties)
  const [allListings] = useState<ShikaakPropertyListing[]>(CHICAGO_LISTINGS);
  const [selectedListing, setSelectedListing] = useState<ShikaakPropertyListing | null>(null);
  const [modalListing, setModalListing] = useState<ShikaakPropertyListing | null>(null);

  // Intelligence & Voice Assistant
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguageCode>('en');

  // Freehand Scribble / Lasso State
  const [isScribbleActive, setIsScribbleActive] = useState(false);
  const [scribblePolygon, setScribblePolygon] = useState<GeoCoordinate[] | null>(null);

  // View state: split, map, list
  const [activeView, setActiveView] = useState<'split' | 'map' | 'list'>('split');

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
        // 1. Text Search Filter (Street or Neighborhood)
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          const matchStreet = listing.propertyAddress.street.toLowerCase().includes(query);
          const matchNeighborhood = listing.propertyAddress.neighborhood.toLowerCase().includes(query);
          const matchTitle = listing.title.toLowerCase().includes(query);
          if (!matchStreet && !matchNeighborhood && !matchTitle) return false;
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

        // 4. Beds & Baths
        if (filters.bedsMin > 0 && listing.specs.beds < filters.bedsMin) {
          return false;
        }
        if (filters.bathsMin > 0 && listing.specs.baths < filters.bathsMin) {
          return false;
        }

        // 5. Property Type
        if (filters.propertyType !== 'ALL' && listing.specs.propertyType !== filters.propertyType) {
          return false;
        }

        // 6. Minimum Pass/Flow Score
        if (listing.financials.outputs.passFlowScore < filters.minPassFlowScore) {
          return false;
        }

        // 7. Soil Bearing Capacity PSF
        if (
          filters.minSoilBearingPSF > 0 &&
          listing.geotechnical.bearingCapacityPSF < filters.minSoilBearingPSF
        ) {
          return false;
        }

        // 8. Max Property Taxes
        if (
          filters.maxPropertyTaxesUSD < 50000 &&
          listing.propertyTaxes.annualAmountUSD > filters.maxPropertyTaxesUSD
        ) {
          return false;
        }

        // 9. Max Distance to School in km
        if (filters.maxDistanceToSchoolKm < 10) {
          const school = listing.nearbyPointsOfInterest.find((p) => p.type === 'SCHOOL');
          if (school && school.distanceKm > filters.maxDistanceToSchoolKm) {
            return false;
          }
        }

        // 10. Freehand Scribble Polygon Containment (Point-in-Polygon)
        if (scribblePolygon && scribblePolygon.length > 2) {
          const isInside = isPointInsidePolygon(
            listing.propertyAddress.location,
            scribblePolygon
          );
          if (!isInside) return false;
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
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* 1. Dark Aesthetic Hero Section (Single Luxury House Focus) */}
      <HeroSection
        onExploreClick={handleScrollToDashboard}
        totalListingsCount={allListings.length}
      />

      {/* 2. Interactive Real Estate & Rental Dashboard Section */}
      <div 
        ref={dashboardRef} 
        id="dashboard-section" 
        className="flex flex-col min-h-screen"
      >
        
        {/* 9-Item Clean Header & Filter Controls */}
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

        {/* Main Split-Screen Workspace */}
        <main className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
          
          {/* Left Pane: Property List & Underwriting Summaries */}
          {(activeView === 'split' || activeView === 'list') && (
            <section className={`flex flex-col bg-slate-50/60 border-r border-slate-200 transition-all ${
              activeView === 'list' ? 'w-full max-w-5xl mx-auto border-r-0' : 'w-full lg:w-[48%] xl:w-[45%]'
            }`}>
              
              {/* List Control Bar */}
              <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-4 sticky top-16 z-20">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    {filteredListings.length} Verified Chicago Properties
                  </span>
                  {scribblePolygon && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200 rounded-full">
                      Boundary Scan Active
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 font-mono">
                  Showing 1 - {filteredListings.length} of {allListings.length}
                </div>
              </div>

              {/* Scrollable Property Feed */}
              <div className="p-4 sm:p-6 space-y-4 flex-1">
                
                {/* Feature Introduction Banner (WHITE & RED) */}
                <div className="p-5 rounded-3xl bg-red-50/70 border-2 border-red-200 text-slate-900 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-red-600">
                      Geospatial Proximity Radar & Real Satellite Tiles
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900">
                    30 Verified Chicago Neighborhood Records
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Featuring <strong>exact kilometer distances</strong> to schools, malls, hospitals, and <strong>forest resources</strong>, <strong>Cook County property taxes</strong>, <strong>CPD patrol corridors</strong>, <strong>subsurface soil mechanics</strong>, and <strong>institutional ROI underwriting</strong>.
                  </p>
                </div>

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
                  <div className="p-12 text-center bg-white rounded-3xl border-2 border-red-200 space-y-3">
                    <Compass className="w-10 h-10 text-red-300 mx-auto" />
                    <h4 className="text-base font-bold text-slate-800">
                      No properties match your current boundary or filter criteria
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Try clearing the hand-drawn boundary or resetting your price and bedroom filters.
                    </p>
                    <button
                      onClick={handleClearScribble}
                      className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20"
                    >
                      Clear Boundary
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Right Pane: Interactive Geospatial Live Map */}
          {(activeView === 'split' || activeView === 'map') && (
            <section className="flex-1 relative bg-slate-100 sticky top-16 h-[calc(100vh-64px)]">
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
            </section>
          )}
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
