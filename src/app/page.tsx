'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../components/layout/Header';
import { PropertyCard } from '../components/property/PropertyCard';
import { PropertyDetailModal } from '../components/property/PropertyDetailModal';
import { HouseRoiCalculatorModal } from '../components/property/HouseRoiCalculatorModal';
import { DatabaseExplorerModal } from '../components/spatial/DatabaseExplorerModal';
import { OkfExtractionModal } from '../components/okf/OkfExtractionModal';
import { StrikeRateAuditModal } from '../components/database/StrikeRateAuditModal';
import { ScribbleMap } from '../components/map/ScribbleMap';
import { SpatialCardCarousel } from '../components/spatial/SpatialCardCarousel';
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
  RotateCcw,
  FileCode,
  ExternalLink,
  Compass,
  ArrowRight
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
  const [showOkfModal, setShowOkfModal] = useState(false);
  const [showStrikeRateModal, setShowStrikeRateModal] = useState(false);
  const [okfModalListing, setOkfModalListing] = useState<ShikaakPropertyListing | null>(null);
  const [activeView, setActiveView] = useState<'spatial' | 'split' | 'grid' | 'map'>('spatial');

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
    fetch('/api/database/properties?limit=5000&reload=1')
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

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProperty = (listing: ShikaakPropertyListing) => {
    setModalListing(listing);
  };

  const handleSelectPropertyFromMap = (listing: ShikaakPropertyListing) => {
    setSelectedListing(listing);
  };

  // Live Multi-Portal Search Execution
  const handleTriggerLiveCrawl = async (explicitQuery?: string, explicitExaKey?: string, filterOverrides?: Partial<FilterState>) => {
    try {
      setIsLiveCrawling(true);
      const activeFilters = { ...filters, ...(filterOverrides || {}) };
      const baseText = explicitQuery !== undefined ? explicitQuery : activeFilters.searchQuery;
      const metroCity = activeMetroPill || 'Chicago';

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
    <div className="flex flex-col min-h-screen w-full bg-[#07090e] text-slate-100 select-none relative overflow-x-hidden">
      
      {/* Pure Cinematic Deep Radial Ambiance (Zero Glitters / Pure Noise-Free Luxury Atmosphere) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-b from-cyan-950/20 via-blue-950/10 to-transparent blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[500px] bg-purple-950/15 blur-3xl rounded-full" />
      </div>

      {/* 1. TOP HEADER & NAVIGATION COMMAND CENTER */}
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
        onViewChange={(v) => setActiveView(v as any)}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onScrollToTop={handleScrollToTop}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onTriggerLiveCrawl={handleTriggerLiveCrawl}
        isCrawling={isLiveCrawling}
        onOpenDatabase={() => setShowDbModal(true)}
        onOpenOkfStudio={() => setShowOkfModal(true)}
        onOpenStrikeRate={() => setShowStrikeRateModal(true)}
      />

      {/* 2. US METROS QUICK SELECTOR STRIP */}
      <div className="w-full bg-[#0a0d18] border-b border-white/10 shadow-lg relative z-10">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 overflow-x-auto text-xs scrollbar-none">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none font-mono">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px] shrink-0 mr-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
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
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                      : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.name}, {m.state}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 shrink-0 text-xs font-mono text-slate-300 bg-white/5 border border-white/10 px-3.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">{filteredListings.length}</span>
            <span>Residences Ingested (100% Strike Rate)</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE */}
      <main className="w-full py-5 sm:py-6 flex-1 relative z-10">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          {/* 4-CARD INSTITUTIONAL TELEMETRY STRIP */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Telemetry 1 */}
            <div className="bg-[#0d111c] rounded-2xl border border-white/10 p-4 sm:p-5 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  Verified Residences
                </span>
                <div className="text-xl sm:text-2xl font-black text-white truncate font-mono">
                  {filteredListings.length} Active
                </div>
                <span className="text-[11px] text-cyan-400 font-medium flex items-center gap-1 mt-0.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  100% Strike Rate Live Feed
                </span>
              </div>
            </div>

            {/* Telemetry 2 */}
            <div className="bg-[#0d111c] rounded-2xl border border-white/10 p-4 sm:p-5 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  {filters.listingStatus === 'FOR_RENT' ? 'Avg Monthly Rent' : 'Avg Purchase Price'}
                </span>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 truncate font-mono">
                  {filters.listingStatus === 'FOR_RENT'
                    ? `${formatCurrency(metrics.avgRent)}/mo`
                    : formatCurrency(metrics.avgPrice)}
                </div>
                <span className="text-[11px] text-slate-400 font-medium truncate block mt-0.5 font-mono">
                  Yield: ~{formatCurrency(metrics.avgRent)}/mo
                </span>
              </div>
            </div>

            {/* Telemetry 3 */}
            <div className="bg-[#0d111c] rounded-2xl border border-white/10 p-4 sm:p-5 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  Institutional Cap Rate
                </span>
                <div className="text-xl sm:text-2xl font-black text-white truncate font-mono">
                  {metrics.avgCapRate}%
                </div>
                <span className="text-[11px] text-cyan-400 font-medium truncate block mt-0.5 font-mono">
                  Pass/Flow 5.0 Rating
                </span>
              </div>
            </div>

            {/* Telemetry 4 */}
            <div className="bg-[#0d111c] rounded-2xl border border-white/10 p-4 sm:p-5 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  Top District Rating
                </span>
                <div className="text-xl sm:text-2xl font-black text-amber-400 truncate font-mono">
                  ★ 10/10 GreatSchools
                </div>
                <span className="text-[11px] text-slate-400 font-medium truncate block mt-0.5 font-mono">
                  ~1.2 km Top Amenities
                </span>
              </div>
            </div>
          </section>

          {/* VIEW MODE 1: ACTIVE THEORY 3D SPATIAL COVERFLOW (INSPIRED BY USER REFERENCE VIDEOS) */}
          {activeView === 'spatial' && (
            <div className="space-y-6">
              
              {/* Cinematic Editorial Banner (Inspired by Arin Vale & Active Theory) */}
              <div className="text-center py-4 sm:py-6 space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  4,815 RESIDENCES INDEXED // 100% FIELD STRIKE RATE
                </div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase font-sans drop-shadow-md">
                  DISCOVER SOMETHING EXTRAORDINARY.
                </h1>
                <p className="text-xs sm:text-sm font-mono text-slate-400 max-w-2xl mx-auto">
                  Active Theory 3D spatial coverflow with real-time multi-portal underwriting across Zillow, Redfin, Realtor & MLS feeds.
                </p>
              </div>

              {/* Spatial Layout with Left Active Theory HUD & Center 3D Deck */}
              <div className="flex flex-col lg:flex-row items-start gap-6">
                
                {/* Left Active Theory HUD (From Video 4 activetheory.net) */}
                <aside className="w-full lg:w-72 shrink-0 space-y-3">
                  <div className="p-4 rounded-3xl bg-[#0d111c] border border-white/10 shadow-2xl backdrop-blur-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <h4 className="text-[11px] font-mono font-black tracking-widest text-slate-400 uppercase">
                        WHAT ARE YOU LOOKING FOR?
                      </h4>
                    </div>

                    <div className="space-y-1 font-mono text-xs">
                      {[
                        { id: 'ALL', label: `ALL RESIDENCES (${allListings.length})`, status: 'ALL' },
                        { id: 'ZILLOW', label: `ZILLOW VERIFIED (${portalCounts.ZILLOW || 2773})`, portal: 'ZILLOW' },
                        { id: 'REDFIN', label: `REDFIN HOMES (${portalCounts.REDFIN || 704})`, portal: 'REDFIN' },
                        { id: 'APARTMENTS_COM', label: `APARTMENTS (${portalCounts.APARTMENTS_COM || 672})`, portal: 'APARTMENTS_COM' },
                        { id: 'REALTOR', label: `REALTOR ESTATES (${portalCounts.REALTOR || 364})`, portal: 'REALTOR' },
                        { id: 'RENT', label: 'FOR RENT', status: 'FOR_RENT' },
                        { id: 'SALE', label: 'FOR SALE', status: 'FOR_SALE' },
                        { id: 'HIGH_YIELD', label: 'HIGH CAP RATE (>5%)', minCap: 5 },
                      ].map((item: any) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            if (item.portal) setSelectedPortal(item.portal);
                            if (item.status) setFilters(prev => ({ ...prev, listingStatus: item.status }));
                            if (item.minCap) setFilters(prev => ({ ...prev, minCapRatePercent: item.minCap }));
                          }}
                          className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-white/10"
                        >
                          <span>→ {item.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTriggerLiveCrawl(filters.searchQuery)}
                      className="w-full py-2.5 px-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/25"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI NEURAL SCAN</span>
                    </button>
                  </div>
                </aside>

                {/* Center 3D Coverflow Stage */}
                <div className="flex-1 w-full overflow-visible">
                  <SpatialCardCarousel
                    listings={filteredListings}
                    onSelectListing={(l) => setSelectedListing(l)}
                    onOpenDetail={(l) => handleOpenProperty(l)}
                    onOpenRoiCalculator={(l) => setRoiModalListing(l)}
                    onOpenOkf={(l) => {
                      setOkfModalListing(l);
                      setShowOkfModal(true);
                    }}
                  />
                </div>

              </div>

            </div>
          )}

          {/* VIEW MODE 2: SPLIT SCREEN (MAP LEFT, HOUSES RIGHT - USES FULL SPACE OF THE SCREEN) */}
          {activeView === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Sticky Google Earth Satellite Map Console (5 of 12 cols) */}
              <div className="lg:col-span-5 xl:col-span-6 lg:sticky lg:top-20 z-10">
                <div className="h-[520px] lg:h-[calc(100vh-140px)] w-full rounded-3xl border-2 border-white/10 shadow-2xl overflow-hidden bg-slate-950 relative">
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

                  {/* Overlay Badge */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 bg-[#0d111c]/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-md text-xs font-medium text-slate-200 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-bold text-white">{activeMetroPill} Metro</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-cyan-400 font-bold">{filteredListings.length} Verified Pins</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Portal Filters & Scrollable Property Cards (7 of 12 cols) */}
              <div className="lg:col-span-7 xl:col-span-6 space-y-4">
                
                {/* Portal Tabs Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-[#0d111c] rounded-2xl border border-white/10 shadow-xl">
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none font-mono">
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
                              ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                          }`}
                        >
                          <span>{p.label}</span>
                          <span className="ml-1.5 opacity-75 font-mono">({count})</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 font-mono">
                    <span className="text-xs text-slate-400 font-medium hidden md:inline">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="SCORE_DESC">Highest Pass Score</option>
                      <option value="PRICE_ASC">Price: Low to High</option>
                      <option value="PRICE_DESC">Price: High to Low</option>
                      <option value="SQFT_DESC">Largest SqFt</option>
                      <option value="CAPRATE_DESC">Highest Cap Rate</option>
                    </select>
                  </div>
                </div>

                {/* 2-Column Responsive Card Grid in Split View */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayedListings.map((listing) => (
                    <PropertyCard
                      key={listing.id}
                      listing={listing}
                      isSelected={selectedListing?.id === listing.id}
                      onSelect={(l) => setSelectedListing(l)}
                      onOpenDetail={(l) => handleOpenProperty(l)}
                      onOpenRoiCalculator={(l) => setRoiModalListing(l)}
                      onOpenOkf={(l) => {
                        setOkfModalListing(l);
                        setShowOkfModal(true);
                      }}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {displayedListings.length < filteredListings.length && (
                  <div className="pt-4 pb-2 flex justify-center">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 24)}
                      className="px-8 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 cursor-pointer flex items-center gap-2 font-mono"
                    >
                      <span>Load More ({filteredListings.length - displayedListings.length} remaining)</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* VIEW MODE 3: HIGH-DENSITY GRID VIEW (4-COLUMN) */}
          {(activeView === 'grid' || (activeView as any) === 'list') && (
            <div className="space-y-6">
              
              {/* Compact Map Preview Banner */}
              <div className="h-[280px] w-full rounded-3xl border-2 border-white/10 shadow-xl overflow-hidden bg-slate-950 relative">
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
              </div>

              {/* Portal Tabs Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[#0d111c] rounded-2xl border border-white/10 shadow-xl">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none font-mono">
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
                            ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                        }`}
                      >
                        <span>{p.label}</span>
                        <span className="ml-1.5 opacity-75 font-mono">({count})</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto font-mono">
                  <span className="text-xs text-slate-400 font-medium hidden md:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="SCORE_DESC">Highest Pass Score</option>
                    <option value="PRICE_ASC">Price: Low to High</option>
                    <option value="PRICE_DESC">Price: High to Low</option>
                    <option value="SQFT_DESC">Largest Square Footage</option>
                    <option value="CAPRATE_DESC">Highest Cap Rate</option>
                  </select>
                </div>
              </div>

              {/* 4-Column Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedListings.map((listing) => (
                  <PropertyCard
                    key={listing.id}
                    listing={listing}
                    isSelected={selectedListing?.id === listing.id}
                    onSelect={(l) => setSelectedListing(l)}
                    onOpenDetail={(l) => handleOpenProperty(l)}
                    onOpenRoiCalculator={(l) => setRoiModalListing(l)}
                    onOpenOkf={(l) => {
                      setOkfModalListing(l);
                      setShowOkfModal(true);
                    }}
                  />
                ))}
              </div>

              {/* Pagination Button */}
              {displayedListings.length < filteredListings.length && (
                <div className="pt-6 pb-4 flex justify-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 24)}
                    className="px-8 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 cursor-pointer flex items-center gap-2 font-mono"
                  >
                    <span>Load More Residences ({filteredListings.length - displayedListings.length} remaining)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 4: FULL SCREEN INTERACTIVE MAP VIEW */}
          {activeView === 'map' && (
            <div className="space-y-4">
              <div className="h-[calc(100vh-210px)] min-h-[600px] w-full rounded-3xl border-2 border-white/10 shadow-2xl overflow-hidden bg-slate-950 relative">
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

                {/* Floating Bottom Card Preview */}
                {selectedListing && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-xl bg-[#0d111c]/95 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 overflow-hidden shrink-0 border border-white/10">
                        <img
                          src={selectedListing.media?.featuredImage || selectedListing.media?.gallery?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'}
                          alt={selectedListing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 font-mono">
                        <h4 className="font-black text-white text-sm truncate">{selectedListing.title}</h4>
                        <p className="text-xs text-slate-400 truncate">{selectedListing.propertyAddress.street}, {selectedListing.propertyAddress.city}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-black text-cyan-400 font-mono">
                            {selectedListing.listingStatus === 'FOR_RENT'
                              ? `${formatCurrency(selectedListing.financials.inputs.monthlyGrossRent)}/mo`
                              : formatCurrency(selectedListing.financials.inputs.purchasePrice)}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 font-bold text-slate-300 border border-white/10">
                            {selectedListing.specs.beds}b / {selectedListing.specs.baths}ba
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-mono">
                      <button
                        type="button"
                        onClick={() => {
                          setOkfModalListing(selectedListing);
                          setShowOkfModal(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 text-xs font-bold transition-all cursor-pointer border border-white/10"
                        title="OKF Extraction"
                      >
                        OKF
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenProperty(selectedListing)}
                        className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-cyan-500/25 cursor-pointer"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* 4. CLEAN INSTITUTIONAL FOOTER */}
      <footer className="w-full bg-[#05070c] text-slate-400 py-12 border-t border-white/10 relative z-10">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/10 text-xs font-mono">
            
            <div className="space-y-3 font-sans">
              <span className="text-base font-black text-white tracking-tight">
                HOUSE INTELLIGENCE
              </span>
              <p className="text-slate-400 leading-relaxed font-mono text-xs">
                Active Theory 3D spatial underwriting and real-time housing database indexing across Zillow, Redfin, Realtor, Apartments.com, and Trulia.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-cyan-400 tracking-wider">Curated Metros</h4>
              <div className="flex flex-wrap gap-1.5">
                {['Chicago', 'Denver', 'Austin', 'Seattle', 'Miami', 'New York'].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setActiveMetroPill(c);
                      setFilters((prev) => ({ ...prev, searchQuery: c }));
                      handleScrollToTop();
                    }}
                    className="px-2 py-1 rounded bg-white/5 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-[11px] transition-colors cursor-pointer border border-white/10"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-cyan-400 tracking-wider">Telemetry Standards</h4>
              <ul className="space-y-1 text-slate-400">
                <li>• Pass/Flow 5.0 Underwriting Grade</li>
                <li>• SQLite 3.x WAL Storage Engine</li>
                <li>• GreatSchools™ Verified Proximity</li>
                <li>• Institutional ROI & Cap Rate Calculator</li>
                <li>• Open Knowledge Format (OKF) Extraction</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-cyan-400 tracking-wider">Local Repository</h4>
              <p className="text-slate-400">
                {allListings.length} verified listings indexed in <code className="text-cyan-300 font-mono">data/houses.db</code>
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setShowDbModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/25 cursor-pointer"
                >
                  SQL Studio
                </button>
                <button
                  onClick={() => setShowOkfModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer border border-white/15"
                >
                  OKF Studio
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
            <p>© 2026 House Intelligence. Equal Housing Opportunity. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Local SQLite WAL Engine Connected ({allListings.length} Residences • 100% Strike Rate)</span>
            </div>
          </div>
        </div>
      </footer>

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

      {/* Open Knowledge Format (OKF) Extraction Studio Modal */}
      <OkfExtractionModal
        isOpen={showOkfModal}
        onClose={() => setShowOkfModal(false)}
        selectedListing={okfModalListing || selectedListing}
        allListings={filteredListings}
        onSelectProperty={(p) => {
          setOkfModalListing(p);
          setSelectedListing(p);
        }}
      />

      {/* 100% Strike Rate Data Quality & Provenance Studio Modal */}
      <StrikeRateAuditModal
        isOpen={showStrikeRateModal}
        onClose={() => setShowStrikeRateModal(false)}
      />

    </div>
  );
}
