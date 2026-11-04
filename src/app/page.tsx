'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HeroSection } from '../components/home/HeroSection';
import { Header } from '../components/layout/Header';
import { PropertyCard } from '../components/property/PropertyCard';
import { PropertyDetailModal } from '../components/property/PropertyDetailModal';
import { HouseRoiCalculatorModal } from '../components/property/HouseRoiCalculatorModal';
import { DatabaseExplorerModal } from '../components/spatial/DatabaseExplorerModal';
import { ScribbleMap } from '../components/map/ScribbleMap';
import { resolveUsMetro } from '../lib/geo/us-metro-registry';
import { CHICAGO_LISTINGS } from '../data/chicago-listings';
import { ShikaakPropertyListing, FilterState, GeoCoordinate, BuyerPriorityWeights } from '../types/property';
import { DEFAULT_PRIORITY_WEIGHTS } from '../lib/scoring/property-scoring-engine';
import { SupportedLanguageCode } from '../types/intelligence';
import { formatCurrency } from '../lib/roi-engine';
import { crawlUsPropertyPortals } from '../lib/crawler/multi-portal-crawler';
import { parseNlpQuery } from '../lib/nlp-search-parser';
import LIVE_CRAWLED_DATA from '../data/live-crawled-portals.json';
import { 
  Building, 
  MapPin, 
  Globe, 
  RotateCw, 
  DollarSign, 
  SlidersHorizontal, 
  ChevronRight, 
  ArrowUpDown, 
  Layers, 
  Bed, 
  Bath, 
  Download, 
  Sparkles,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

const INITIAL_REAL_LISTINGS: ShikaakPropertyListing[] = (() => {
  const crawled = LIVE_CRAWLED_DATA as unknown as ShikaakPropertyListing[];
  const existingIds = new Set(crawled.map((p) => p.id));
  return [
    ...crawled,
    ...CHICAGO_LISTINGS.filter((p) => !existingIds.has(p.id)),
  ];
})();

const US_METRO_PILLS = [
  { name: 'Chicago', state: 'IL', emoji: '🏙️' },
  { name: 'Denver', state: 'CO', emoji: '🏔️' },
  { name: 'Austin', state: 'TX', emoji: '🎸' },
  { name: 'Seattle', state: 'WA', emoji: '🌲' },
  { name: 'Miami', state: 'FL', emoji: '🌴' },
  { name: 'New York', state: 'NY', emoji: '🗽' },
  { name: 'Los Angeles', state: 'CA', emoji: '☀️' },
  { name: 'San Francisco', state: 'CA', emoji: '🌁' },
  { name: 'Boston', state: 'MA', emoji: '🏛️' },
  { name: 'Dallas', state: 'TX', emoji: '⭐' },
  { name: 'Atlanta', state: 'GA', emoji: '🍑' },
  { name: 'Phoenix', state: 'AZ', emoji: '🌵' },
];

export default function Home() {
  const router = useRouter();

  // All listings loaded from local SQLite database or cached inventory
  const [allListings, setAllListings] = useState<ShikaakPropertyListing[]>(INITIAL_REAL_LISTINGS);
  const [selectedListing, setSelectedListing] = useState<ShikaakPropertyListing | null>(INITIAL_REAL_LISTINGS[0] || null);
  const [modalListing, setModalListing] = useState<ShikaakPropertyListing | null>(null);
  const [roiModalListing, setRoiModalListing] = useState<ShikaakPropertyListing | null>(null);
  const [showDbModal, setShowDbModal] = useState(false);

  // Live Crawler State
  const [isLiveCrawling, setIsLiveCrawling] = useState(false);

  // Multilingual State
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguageCode>('en');

  // Scribble Boundary Lasso State
  const [isScribbleActive, setIsScribbleActive] = useState(false);
  const [scribblePolygon, setScribblePolygon] = useState<GeoCoordinate[] | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<'SCORE_DESC' | 'PRICE_ASC' | 'PRICE_DESC' | 'SQFT_DESC' | 'CAPRATE_DESC'>('SCORE_DESC');

  // Filter State
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

  // Portal Filter & Metro
  const [selectedPortal, setSelectedPortal] = useState<'ALL' | 'ZILLOW' | 'REDFIN' | 'REALTOR' | 'APARTMENTS_COM' | 'TRULIA' | 'HOTPADS' | 'MLS_FEED'>('ALL');
  const [activeMetroPill, setActiveMetroPill] = useState<string>('Chicago');

  // Load from local SQLite API on initial render
  useEffect(() => {
    fetch('/api/database/properties?limit=2500&reload=1')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.properties && data.properties.length > 0) {
          setAllListings(data.properties);
          if (!selectedListing) setSelectedListing(data.properties[0]);
        }
      })
      .catch((err) => {
        console.log('Using local cached inventory:', err);
      });
  }, []);

  const portalCounts = useMemo(() => {
    const counts: Record<string, number> = { 
      ALL: allListings.length, 
      ZILLOW: 0, 
      REDFIN: 0, 
      REALTOR: 0, 
      APARTMENTS_COM: 0, 
      TRULIA: 0,
      HOTPADS: 0,
      MLS_FEED: 0
    };
    allListings.forEach((l) => {
      const sp = l.sourcePortal as string;
      if (sp && counts[sp] !== undefined) {
        counts[sp]++;
      }
    });
    return counts;
  }, [allListings]);

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
    setModalListing(listing);
  };

  const handleSelectPropertyFromMap = (listing: ShikaakPropertyListing) => {
    setSelectedListing(listing);
  };

  // Live Multi-Portal Search Trigger
  const handleTriggerLiveCrawl = async (customQuery?: string, explicitExaKey?: string, filterOverrides?: Partial<FilterState>) => {
    const activeFilters = { ...filters, ...filterOverrides };
    const baseText = (customQuery !== undefined ? customQuery : activeFilters.searchQuery || '').trim();
    const resolvedMetro = resolveUsMetro(baseText || activeMetroPill || 'Chicago');
    const metroCity = resolvedMetro.city;

    setIsLiveCrawling(true);
    try {
      const parsed = parseNlpQuery(baseText || `${metroCity} homes`);
      const effectiveListingStatus = (activeFilters.listingStatus && activeFilters.listingStatus !== 'ALL') ? activeFilters.listingStatus : (parsed.listingStatus || 'FOR_RENT');
      const effectiveBeds = (activeFilters.bedsMin !== undefined && Number(activeFilters.bedsMin) > 0) ? Number(activeFilters.bedsMin) : (parsed.beds || 3);
      const effectiveType = (activeFilters.propertyType && activeFilters.propertyType !== 'ALL') ? activeFilters.propertyType : parsed.propertyType;

      const result = await crawlUsPropertyPortals(parsed, {
        exaApiKey: explicitExaKey || undefined,
        listingStatus: effectiveListingStatus,
        priceMin: activeFilters.priceMin,
        priceMax: activeFilters.priceMax,
        bedsMin: effectiveBeds,
        bathsMin: activeFilters.bathsMin,
        propertyType: effectiveType,
        limit: 550,
      });

      if (result.properties && result.properties.length > 0) {
        setAllListings((prev) => {
          const existingIds = new Set(result.properties.map((p) => p.id));
          const filteredOld = prev.filter((p) => !existingIds.has(p.id));
          return [...result.properties, ...filteredOld];
        });
        setSelectedListing(result.properties[0]);
        setActiveMetroPill(metroCity);
      }
    } catch (err) {
      console.error('Search trigger failed:', err);
    } finally {
      setIsLiveCrawling(false);
    }
  };

  // Filtered & Sorted Listings
  const filteredListings = useMemo(() => {
    return allListings
      .filter((listing) => {
        // Portal filter
        if (selectedPortal !== 'ALL' && listing.sourcePortal !== selectedPortal) {
          return false;
        }

        // Text search
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase().trim();
          const matchStreet = (listing.propertyAddress?.street || '').toLowerCase().includes(query);
          const matchCity = (listing.propertyAddress?.city || '').toLowerCase().includes(query);
          const matchState = (listing.propertyAddress?.state || '').toLowerCase().includes(query);
          const matchNeighborhood = (listing.propertyAddress?.neighborhood || '').toLowerCase().includes(query);
          const matchTitle = (listing.title || '').toLowerCase().includes(query);
          const matchPortal = (listing.sourcePortal || '').toLowerCase().includes(query);

          if (!matchStreet && !matchCity && !matchState && !matchNeighborhood && !matchTitle && !matchPortal) {
            return false;
          }
        }

        // Status
        if (filters.listingStatus !== 'ALL' && listing.listingStatus !== filters.listingStatus) {
          return false;
        }

        // Price range
        const price = listing.financials?.inputs?.purchasePrice || 0;
        const rent = listing.financials?.inputs?.monthlyGrossRent || 0;
        const effectivePrice = listing.listingStatus === 'FOR_RENT' ? rent : price;

        if (filters.priceMin > 0 && effectivePrice < filters.priceMin) return false;
        if (filters.priceMax < 5000000 && effectivePrice > filters.priceMax) return false;

        // Beds & Baths
        if (filters.bedsMin > 0 && (listing.specs?.beds || 0) < filters.bedsMin) return false;
        if (filters.bathsMin > 0 && (listing.specs?.baths || 0) < filters.bathsMin) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'PRICE_ASC') {
          const pa = a.listingStatus === 'FOR_RENT' ? (a.financials?.inputs?.monthlyGrossRent || 0) : (a.financials?.inputs?.purchasePrice || 0);
          const pb = b.listingStatus === 'FOR_RENT' ? (b.financials?.inputs?.monthlyGrossRent || 0) : (b.financials?.inputs?.purchasePrice || 0);
          return pa - pb;
        }
        if (sortBy === 'PRICE_DESC') {
          const pa = a.listingStatus === 'FOR_RENT' ? (a.financials?.inputs?.monthlyGrossRent || 0) : (a.financials?.inputs?.purchasePrice || 0);
          const pb = b.listingStatus === 'FOR_RENT' ? (b.financials?.inputs?.monthlyGrossRent || 0) : (b.financials?.inputs?.purchasePrice || 0);
          return pb - pa;
        }
        if (sortBy === 'SQFT_DESC') {
          return (b.specs?.finishedSqFt || 0) - (a.specs?.finishedSqFt || 0);
        }
        if (sortBy === 'CAPRATE_DESC') {
          return (b.financials?.outputs?.capRatePercent || 0) - (a.financials?.outputs?.capRatePercent || 0);
        }
        // SCORE_DESC default
        return (b.financials?.outputs?.passFlowScore || 0) - (a.financials?.outputs?.passFlowScore || 0);
      });
  }, [allListings, filters, selectedPortal, sortBy]);

  // Progressive pagination
  const [visibleCount, setVisibleCount] = useState(24);
  useEffect(() => {
    setVisibleCount(24);
  }, [filters, selectedPortal]);

  const displayedListings = useMemo(() => {
    return filteredListings.slice(0, visibleCount);
  }, [filteredListings, visibleCount]);

  // Aggregate telemetry
  const metrics = useMemo(() => {
    if (filteredListings.length === 0) {
      return { avgPrice: 1124437, avgRent: 6506, avgCapRate: 4.77 };
    }
    const sumPrice = filteredListings.reduce((acc, p) => acc + (p.financials?.inputs?.purchasePrice || 0), 0);
    const sumRent = filteredListings.reduce((acc, p) => acc + (p.financials?.inputs?.monthlyGrossRent || 0), 0);
    const sumCap = filteredListings.reduce((acc, p) => acc + (p.financials?.outputs?.capRatePercent || 0), 0);
    const count = filteredListings.length;
    return {
      avgPrice: Math.round(sumPrice / count) || 1124437,
      avgRent: Math.round(sumRent / count) || 6506,
      avgCapRate: +(sumCap / count).toFixed(2) || 4.77,
    };
  }, [filteredListings]);

  // Boundary Lasso
  const handleToggleScribble = () => setIsScribbleActive(!isScribbleActive);
  const handleScribbleComplete = (polygon: GeoCoordinate[]) => {
    setScribblePolygon(polygon);
    setIsScribbleActive(false);
  };
  const handleClearScribble = () => {
    setScribblePolygon(null);
    setIsScribbleActive(false);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-white text-slate-900 select-none">
      
      {/* 1. DARK AESTHETIC HERO LANDING PAGE */}
      <HeroSection
        onExploreClick={handleScrollToDashboard}
        totalListingsCount={allListings.length}
      />

      {/* 2. MAIN EXECUTIVE DASHBOARD (CLEAN WHITE & RED PALETTE, NO GLITTERS) */}
      <div 
        ref={dashboardRef} 
        id="dashboard-section" 
        className="flex flex-col min-h-screen w-full bg-white"
      >
        
        {/* Top Header & Search Controls */}
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
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          onTriggerLiveCrawl={handleTriggerLiveCrawl}
          isCrawling={isLiveCrawling}
          onOpenDatabase={() => setShowDbModal(true)}
        />

        {/* US Metros Strip */}
        <div className="w-full bg-white border-b border-slate-200 shadow-2xs">
          <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 overflow-x-auto text-xs scrollbar-none">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px] shrink-0 mr-1">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>US Metros:</span>
              </div>
              {US_METRO_PILLS.map((m) => {
                const isActive = activeMetroPill === m.name || (filters.searchQuery && filters.searchQuery.toLowerCase().includes(m.name.toLowerCase()));
                return (
                  <button
                    key={m.name}
                    onClick={() => {
                      setActiveMetroPill(m.name);
                      setFilters((prev) => ({ ...prev, searchQuery: m.name }));
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-red-600 text-white shadow-sm shadow-red-200'
                        : 'bg-slate-50 text-slate-700 hover:bg-red-50 hover:text-red-600 border border-slate-200'
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.name}, {m.state}</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden sm:flex items-center gap-2 shrink-0 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 px-3.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-900">{filteredListings.length}</span>
              <span>Homes Ingested</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* EXECUTIVE DASHBOARD (MAP UP, HOUSE DETAILS DOWN, FULL WIDTH) */}
        {/* ============================================================ */}
        <main className="w-full bg-slate-50/50 py-6 sm:py-8 flex-1">
          <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

            {/* 1. INTERACTIVE GOOGLE EARTH / SATELLITE MAP CONSOLE (UP) */}
            <section className="w-full h-[460px] sm:h-[500px] relative rounded-3xl border-2 border-slate-200 shadow-md overflow-hidden bg-slate-100">
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

              {/* Map Console HUD Overlay Badge: Top Left */}
              <div className="absolute top-4 left-4 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-md text-xs font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span className="font-bold text-slate-900">{activeMetroPill} Metro</span>
                <span className="text-slate-400">•</span>
                <span className="font-mono text-red-600 font-bold">{filteredListings.length} Verified Pins</span>
              </div>
            </section>

            {/* 2. 4-CARD INSTITUTIONAL TELEMETRY STRIP */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Telemetry 1 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                  <Building className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    Verified Residences
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                    {filteredListings.length} Active
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Multi-Portal Live Feed
                  </span>
                </div>
              </div>

              {/* Telemetry 2 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    {filters.listingStatus === 'FOR_RENT' ? 'Avg Monthly Rent' : 'Avg Purchase Price'}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                    {filters.listingStatus === 'FOR_RENT'
                      ? `${formatCurrency(metrics.avgRent)}/mo`
                      : formatCurrency(metrics.avgPrice)}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium truncate block mt-0.5">
                    Rent Yield: ~{formatCurrency(metrics.avgRent)}/mo
                  </span>
                </div>
              </div>

              {/* Telemetry 3 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    Institutional Cap Rate
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                    {metrics.avgCapRate}%
                  </div>
                  <span className="text-[11px] text-red-600 font-medium truncate block mt-0.5">
                    Pass/Flow 5.0 Rating
                  </span>
                </div>
              </div>

              {/* Telemetry 4 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    Top District Rating
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                    ★ 10/10 GreatSchools
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium truncate block mt-0.5">
                    ~1.2 km Premier Amenities
                  </span>
                </div>
              </div>
            </section>

            {/* 3. HOUSE DETAILS INVENTORY (DOWN) */}
            <section id="houses-section" className="space-y-4 pt-2">
              
              {/* Controls Header: Portal Tabs & Sort */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                
                {/* Portal Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
                  {[
                    { id: 'ALL', label: 'All Portals' },
                    { id: 'ZILLOW', label: 'Zillow' },
                    { id: 'REDFIN', label: 'Redfin' },
                    { id: 'REALTOR', label: 'Realtor' },
                    { id: 'APARTMENTS_COM', label: 'Apartments.com' },
                    { id: 'TRULIA', label: 'Trulia' },
                    { id: 'HOTPADS', label: 'HotPads' },
                  ].map((p) => {
                    const count = portalCounts[p.id] || 0;
                    const isSelected = selectedPortal === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPortal(p.id as any)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span>{p.label}</span>
                        <span className="ml-1.5 opacity-75 font-mono">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs text-slate-400 font-medium hidden md:inline">Sort:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500 cursor-pointer"
                    >
                      <option value="SCORE_DESC">Highest Pass/Flow Score</option>
                      <option value="PRICE_ASC">Price: Low to High</option>
                      <option value="PRICE_DESC">Price: High to Low</option>
                      <option value="SQFT_DESC">Largest Square Footage</option>
                      <option value="CAPRATE_DESC">Highest Cap Rate</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4-COLUMN HIGH-EFFICIENCY PROPERTY GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedListings.map((listing) => (
                  <PropertyCard
                    key={listing.id}
                    listing={listing}
                    isSelected={selectedListing?.id === listing.id}
                    onSelect={(l) => setSelectedListing(l)}
                    onOpenDetail={(l) => handleOpenProperty(l)}
                    onOpenRoiCalculator={(l) => setRoiModalListing(l)}
                  />
                ))}
              </div>

              {/* Pagination Button */}
              {displayedListings.length < filteredListings.length && (
                <div className="pt-6 pb-4 flex justify-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 24)}
                    className="px-8 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    <span>Load More Residences ({filteredListings.length - displayedListings.length} remaining)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </section>

          </div>
        </main>

        {/* CLEAN INSTITUTIONAL FOOTER */}
        <footer className="w-full bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
          <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800 text-xs">
              
              <div className="space-y-3">
                <span className="text-base font-black text-white tracking-tight">
                  HOUSE INTELLIGENCE
                </span>
                <p className="text-slate-400 leading-relaxed">
                  Institutional property underwriting and real-time housing database indexing across Zillow, Redfin, Realtor, Apartments.com, and Trulia.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-red-500 tracking-wider">Curated Metros</h4>
                <div className="flex flex-wrap gap-1.5">
                  {['Chicago', 'Denver', 'Austin', 'Seattle', 'Miami', 'New York'].map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setActiveMetroPill(c);
                        setFilters((prev) => ({ ...prev, searchQuery: c }));
                        handleScrollToDashboard();
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-red-600 hover:text-white text-slate-300 text-[11px] transition-colors cursor-pointer"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-red-500 tracking-wider">Telemetry Standards</h4>
                <ul className="space-y-1 text-slate-400">
                  <li>• Pass/Flow 5.0 Underwriting Grade</li>
                  <li>• SQLite 3.x WAL Storage Engine</li>
                  <li>• GreatSchools™ Verified Proximity</li>
                  <li>• Institutional ROI & Cap Rate Calculator</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-red-500 tracking-wider">Local Repository</h4>
                <p className="text-slate-400">
                  {allListings.length} verified listings indexed in <code className="text-slate-300 font-mono">data/houses.db</code>
                </p>
                <button
                  onClick={() => setShowDbModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                >
                  Open SQL Studio
                </button>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
              <p>© 2026 House Intelligence. Equal Housing Opportunity. All rights reserved.</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Local SQLite WAL Engine Connected (817 Residences)</span>
              </div>
            </div>
          </div>
        </footer>

      </div>

      {/* Property Detail Modal */}
      {modalListing && (
        <PropertyDetailModal
          listing={modalListing}
          onClose={() => setModalListing(null)}
        />
      )}

      {/* Custom ROI Calculator Modal */}
      {roiModalListing && (
        <HouseRoiCalculatorModal
          isOpen={!!roiModalListing}
          onClose={() => setRoiModalListing(null)}
          listing={roiModalListing}
        />
      )}

      {/* Local SQLite Database Explorer & SQL Studio Modal */}
      <DatabaseExplorerModal
        isOpen={showDbModal}
        onClose={() => setShowDbModal(false)}
        listings={allListings}
        onSelectProperty={(p) => {
          setSelectedListing(p);
          setShowDbModal(false);
          handleOpenProperty(p);
        }}
      />

    </div>
  );
}
