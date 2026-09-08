'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HeroSection } from '../components/home/HeroSection';
import { Header } from '../components/layout/Header';
import { PropertyCard } from '../components/property/PropertyCard';
import { PropertyDetailModal } from '../components/property/PropertyDetailModal';
import { HouseRoiCalculatorModal } from '../components/property/HouseRoiCalculatorModal';
import { ScribbleMap } from '../components/map/ScribbleMap';
import { CustomerNlpDialog } from '../components/nlp/CustomerNlpDialog';
import { NlpCrawlerSearchBar } from '../components/search/NlpCrawlerSearchBar';
import { CHICAGO_LISTINGS } from '../data/chicago-listings';
import { ShikaakPropertyListing, FilterState, GeoCoordinate, BuyerPriorityWeights } from '../types/property';
import { PriorityWeightSliders } from '../components/property/PriorityWeightSliders';
import { scorePropertyDimensions, DEFAULT_PRIORITY_WEIGHTS } from '../lib/scoring/property-scoring-engine';
import { SupportedLanguageCode } from '../types/intelligence';
import { isPointInsidePolygon } from '../lib/geo-utils';
import { formatCurrency, formatPercent } from '../lib/roi-engine';
import { crawlUsPropertyPortals } from '../lib/crawler/multi-portal-crawler';
import { parseNlpQuery } from '../lib/nlp-search-parser';
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
  ArrowDown,
  Calculator,
  GraduationCap,
  ShoppingBag,
  Star,
  RotateCw,
  CheckCircle2
} from 'lucide-react';

export default function Home() {
  const router = useRouter();

  // Global Listings State (Chicago & Colorado Luxury Properties + Crawled Properties)
  const [allListings, setAllListings] = useState<ShikaakPropertyListing[]>(CHICAGO_LISTINGS);
  const [selectedListing, setSelectedListing] = useState<ShikaakPropertyListing | null>(CHICAGO_LISTINGS[0]);
  const [modalListing, setModalListing] = useState<ShikaakPropertyListing | null>(null);

  // Live Real-Time Multi-Portal Crawler State
  const [isLiveCrawling, setIsLiveCrawling] = useState(false);
  const [liveCrawlQuery, setLiveCrawlQuery] = useState<string | null>(null);
  const [liveCrawlCount, setLiveCrawlCount] = useState<number>(0);

  // Custom ROI Calculator Modal State for any house
  const [roiModalListing, setRoiModalListing] = useState<ShikaakPropertyListing | null>(null);

  // Property Decision Concierge & Multilingual State
  const [isNlpDialogOpen, setIsNlpDialogOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguageCode>('en');

  // Freehand Scribble / Lasso State
  const [isScribbleActive, setIsScribbleActive] = useState(false);
  const [scribblePolygon, setScribblePolygon] = useState<GeoCoordinate[] | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<'SCORE_DESC' | 'PRICE_ASC' | 'PRICE_DESC' | 'SQFT_DESC' | 'CAPRATE_DESC'>('SCORE_DESC');

  // Buyer Priority Weights (9-Dimension Decision Fit Engine)
  const [buyerWeights, setBuyerWeights] = useState<BuyerPriorityWeights>(DEFAULT_PRIORITY_WEIGHTS);

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
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/rental-platform-')) {
      window.location.href = `/rental-platform-/property/${listing.id}/`;
    } else {
      router.push(`/property/${listing.id}/`);
    }
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

  // Live Real-Time Multi-Portal Crawler Trigger
  const handleTriggerLiveCrawl = async (customQuery?: string) => {
    let q = (customQuery !== undefined ? customQuery : filters.searchQuery || '').trim();
    if (!q) {
      const parts: string[] = [];
      if (filters.searchQuery) parts.push(filters.searchQuery);
      if (filters.listingStatus === 'FOR_RENT') parts.push('for rent');
      else if (filters.listingStatus === 'FOR_SALE') parts.push('for sale');
      if (filters.bedsMin > 0) parts.push(`${filters.bedsMin} bed`);
      if (filters.bathsMin > 0) parts.push(`${filters.bathsMin} bath`);
      if (filters.priceMax < 5000000) parts.push(`under $${filters.priceMax.toLocaleString()}`);
      if (filters.propertyType !== 'ALL') parts.push(filters.propertyType.toLowerCase().replace(/_/g, ' '));
      q = parts.join(' ') || 'homes in Chicago';
    }

    setIsLiveCrawling(true);
    try {
      const parsed = parseNlpQuery(q);
      const result = await crawlUsPropertyPortals(parsed);
      if (result.properties && result.properties.length > 0) {
        setAllListings((prev) => {
          const existingIds = new Set(result.properties.map((p) => p.id));
          const filteredOld = prev.filter((p) => !existingIds.has(p.id));
          return [...result.properties, ...filteredOld];
        });
        setSelectedListing(result.properties[0]);
        setLiveCrawlQuery(q);
        setLiveCrawlCount(result.properties.length);

        // Synchronize filters
        setFilters((prev) => ({
          ...prev,
          searchQuery: parsed.location?.city || parsed.location?.neighborhood || q,
          priceMax: parsed.priceRange?.maxPrice !== undefined ? parsed.priceRange.maxPrice : prev.priceMax,
          priceMin: parsed.priceRange?.minPrice !== undefined ? parsed.priceRange.minPrice : prev.priceMin,
          bedsMin: parsed.beds !== undefined ? parsed.beds : prev.bedsMin,
          listingStatus: parsed.listingStatus || prev.listingStatus,
        }));

        // Scroll to houses
        setTimeout(() => {
          const el = document.getElementById('houses-section') || document.getElementById('dashboard-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      console.error('Real-time crawl failed:', err);
    } finally {
      setIsLiveCrawling(false);
    }
  };

  // Filter and Sort Listings
  const filteredListings = useMemo(() => {
    return allListings
      .filter((listing) => {
        // 1. Text Search Filter (Street, City, State, or Neighborhood)
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase().trim();
          const matchStreet = listing.propertyAddress.street.toLowerCase().includes(query);
          const matchCity = listing.propertyAddress.city.toLowerCase().includes(query);
          const matchState = listing.propertyAddress.state.toLowerCase().includes(query);
          const matchNeighborhood = listing.propertyAddress.neighborhood.toLowerCase().includes(query);
          const matchTitle = listing.title.toLowerCase().includes(query);

          if (!matchStreet && !matchCity && !matchState && !matchNeighborhood && !matchTitle) {
            // Also check individual tokens (ignoring common stop words)
            const tokens = query.split(/\s+/).filter(t => 
              t.length > 2 && 
              !['house', 'home', 'under', 'below', 'for', 'sale', 'rent', 'near', 'with', 'and', 'the'].includes(t) &&
              !/\d/.test(t)
            );
            const tokenMatch = tokens.length > 0 && tokens.some(t =>
              listing.propertyAddress.city.toLowerCase().includes(t) ||
              listing.propertyAddress.neighborhood.toLowerCase().includes(t) ||
              listing.propertyAddress.street.toLowerCase().includes(t)
            );
            if (!tokenMatch) return false;
          }
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

        // 9. Cap Rate Minimum Filter
        if (filters.minCapRatePercent && filters.minCapRatePercent > 0 && listing.financials.outputs.capRatePercent < filters.minCapRatePercent) {
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
          const scoreA = scorePropertyDimensions(a, buyerWeights).compositeScore;
          const scoreB = scorePropertyDimensions(b, buyerWeights).compositeScore;
          return scoreB - scoreA;
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
        if (sortBy === 'CAPRATE_DESC') {
          return b.financials.outputs.capRatePercent - a.financials.outputs.capRatePercent;
        }
        return 0;
      });
  }, [allListings, filters, scribblePolygon, sortBy, buyerWeights]);

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
    <div className="flex flex-col min-h-screen w-full bg-slate-50/50 text-slate-900">
      
      {/* 1. Dark Aesthetic Hero Section */}
      <HeroSection
        onExploreClick={handleScrollToDashboard}
        totalListingsCount={allListings.length}
      />

      {/* 2. Main Dashboard Container */}
      <div 
        ref={dashboardRef} 
        id="dashboard-section" 
        className="flex flex-col min-h-screen w-full bg-white"
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
          onOpenNlpDialog={() => setIsNlpDialogOpen(true)}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          onTriggerLiveCrawl={handleTriggerLiveCrawl}
          isCrawling={isLiveCrawling}
        />

        {/* Real-Time NLP Natural Language Search & Multi-Portal Web Crawler Bar */}
        <div className="w-full px-4 sm:px-8 lg:px-12 py-3 bg-red-50/40 border-b border-red-100">
          <NlpCrawlerSearchBar
            onListingsCrawled={(crawled, parsedQuery) => {
              setAllListings(prev => {
                const existingIds = new Set(prev.map(p => p.id));
                const uniqueNew = crawled.filter(c => !existingIds.has(c.id));
                return [...uniqueNew, ...prev];
              });
              if (parsedQuery) {
                setFilters(prev => ({
                  ...prev,
                  priceMax: parsedQuery.priceRange?.maxPrice !== undefined ? parsedQuery.priceRange.maxPrice : prev.priceMax,
                  priceMin: parsedQuery.priceRange?.minPrice !== undefined ? parsedQuery.priceRange.minPrice : prev.priceMin,
                  bedsMin: parsedQuery.beds !== undefined ? parsedQuery.beds : prev.bedsMin,
                  searchQuery: parsedQuery.location?.neighborhood || parsedQuery.location?.city || prev.searchQuery,
                }));
              }
              if (crawled.length > 0) {
                setSelectedListing(crawled[0]);
              }
              const spotlight = document.getElementById('selected-spotlight');
              if (spotlight) spotlight.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>

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
          className="w-full px-4 sm:px-8 lg:px-12 py-8 sm:py-10 space-y-8"
        >
          {/* Live Real-Time Multi-Portal Scanning Progress Banner */}
          {isLiveCrawling && (
            <div className="w-full p-4 rounded-2xl bg-red-600 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg animate-pulse">
              <div className="flex items-center gap-3">
                <RotateCw className="w-5 h-5 animate-spin shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider">Scanning Rental & MLS Portals Live in Real Time...</h4>
                  <p className="text-[11px] sm:text-xs text-red-100 font-medium">Querying real-time OpenStreetMap addresses, atmospheric sensors, and underwriting data.</p>
                </div>
              </div>
              <span className="text-xs font-mono bg-red-800 px-3 py-1 rounded-xl shrink-0">Live Scrape Active</span>
            </div>
          )}

          {/* Live Ingestion Confirmation Banner */}
          {liveCrawlQuery && !isLiveCrawling && (
            <div className="w-full p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      Real-Time Live Web Ingestion Active
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {liveCrawlCount} Live Listings Harvested
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Results for <span className="font-bold text-slate-900">"{liveCrawlQuery}"</span> with live OpenStreetMap coordinates and atmospheric weather telemetry.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setLiveCrawlQuery(null);
                  setAllListings(CHICAGO_LISTINGS);
                }}
                className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                Reset to Default
              </button>
            </div>
          )}

          {/* Buyer Priority Weighting & Decision Engine Tuning */}
          <PriorityWeightSliders
            weights={buyerWeights}
            onChange={setBuyerWeights}
          />
          
          {/* 1. SELECTED HOUSE SPOTLIGHT (APPEARS DIRECTLY BELOW THE MAP WHEN A PIN IS CLICKED) */}
          {selectedListing && (
            <div className="w-full p-5 sm:p-6 rounded-3xl bg-slate-50 border border-red-200 shadow-sm flex flex-col lg:flex-row items-center gap-6">
              <div className="w-full lg:w-80 h-48 rounded-2xl overflow-hidden shrink-0 border border-slate-200">
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

                {/* SCHOOLS & MALLS HIGHLIGHT CHIPS IN SPOTLIGHT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {selectedListing.nearbyPointsOfInterest.slice(0, 2).map((poi) => (
                    <div key={poi.id} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs">
                      <div className="flex items-center gap-1.5 truncate mr-2">
                        {poi.type === 'SCHOOL' ? (
                          <GraduationCap className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        ) : (
                          <ShoppingBag className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        )}
                        <span className="font-bold text-slate-800 truncate">{poi.name}</span>
                        <span className="text-slate-400 font-mono">({poi.distanceKm} km)</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold font-mono text-[10px] shrink-0">
                        ★ {poi.ratingScore} {poi.type === 'SCHOOL' ? '/10' : '/5.0'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto">
                <button
                  onClick={() => setRoiModalListing(selectedListing)}
                  className="px-5 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-500 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  <Calculator className="w-4 h-4 text-red-500" />
                  <span>ROI Calculator</span>
                </button>

                <button
                  onClick={() => handleOpenProperty(selectedListing)}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-center"
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
                Every residence features complete nearby school ratings (GreatSchools), premier shopping malls (★ ratings), neighborhood safety, parks, and interactive custom ROI underwriting.
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
                <option value="SCORE_DESC">Decision Fit Score (Personalized)</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
                <option value="SQFT_DESC">Largest Finished Area</option>
                <option value="CAPRATE_DESC">Highest Cap Rate (%)</option>
              </select>
            </div>
          </div>

          {/* 3. FULL-WIDTH RESPONSIVE HOUSE DETAILS GRID */}
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <PropertyCard
                  key={listing.id}
                  listing={listing}
                  buyerWeights={buyerWeights}
                  isSelected={selectedListing?.id === listing.id}
                  onSelect={(item) => setSelectedListing(item)}
                  onOpenDetail={(item) => handleOpenProperty(item)}
                  onOpenRoiCalculator={(item) => setRoiModalListing(item)}
                />
              ))}
            </div>
          ) : (
            <div className="py-14 text-center bg-red-50/40 rounded-3xl border-2 border-red-200 p-8 space-y-4 max-w-xl mx-auto shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center mx-auto shadow-md shadow-red-200">
                <Globe className="w-7 h-7 animate-pulse" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Crawl Live Rental Websites for "{filters.searchQuery || 'Current Filters'}"
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                No pre-stored properties matched your criteria. Run our real-time multi-portal crawler to scan verified MLS feeds, county public records, and live weather telemetry right now.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  onClick={() => handleTriggerLiveCrawl(filters.searchQuery)}
                  disabled={isLiveCrawling}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {isLiveCrawling ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Crawling Live Portals...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Crawl Live Rental Websites Now (Enter ↵)</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    handleClearScribble();
                    setFilters({
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
                  }}
                  className="px-4 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-2xl text-xs transition-all cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Interactive Custom ROI Calculator Modal for Any House */}
      {roiModalListing && (
        <HouseRoiCalculatorModal
          isOpen={!!roiModalListing}
          onClose={() => setRoiModalListing(null)}
          listing={roiModalListing}
        />
      )}

      {/* Comprehensive Property Detail Deep-Dive Modal (Fallback / Quick Preview) */}
      {modalListing && (
        <PropertyDetailModal
          listing={modalListing}
          onClose={() => setModalListing(null)}
        />
      )}

      {/* Property Decision Concierge (Voice, Multilingual, 1,000 Trained Queries & Self-Correction) */}
      <CustomerNlpDialog
        isOpen={isNlpDialogOpen}
        onClose={() => setIsNlpDialogOpen(false)}
        allListings={allListings}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onSelectProperty={(property) => {
          setSelectedListing(property);
          const spotlight = document.getElementById('selected-spotlight');
          if (spotlight) spotlight.scrollIntoView({ behavior: 'smooth' });
        }}
        onApplyResultsToDashboard={(matched, parsedQuery) => {
          setAllListings(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const unique = matched.filter(m => !existingIds.has(m.id));
            return [...unique, ...prev];
          });
          if (parsedQuery) {
            setFilters(prev => ({
              ...prev,
              priceMax: parsedQuery.priceRange?.maxPrice !== undefined ? parsedQuery.priceRange.maxPrice : prev.priceMax,
              priceMin: parsedQuery.priceRange?.minPrice !== undefined ? parsedQuery.priceRange.minPrice : prev.priceMin,
              bedsMin: parsedQuery.beds !== undefined ? parsedQuery.beds : prev.bedsMin,
              searchQuery: parsedQuery.location?.neighborhood || parsedQuery.location?.city || prev.searchQuery,
            }));
          }
          if (matched.length > 0) {
            setSelectedListing(matched[0]);
          }
          setIsNlpDialogOpen(false);
          const spotlight = document.getElementById('selected-spotlight');
          if (spotlight) spotlight.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
}
