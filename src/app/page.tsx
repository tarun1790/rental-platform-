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
    <div className="flex flex-col min-h-screen w-full bg-[#09090b] text-zinc-100 select-none relative overflow-x-hidden">
      
      {/* Pure Noise-Free Luxury Atmosphere (Zero Glitters / Velvety Dark Ambiance) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-b from-[#e2b170]/10 via-amber-950/5 to-transparent blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[500px] bg-[#e2b170]/5 blur-3xl rounded-full" />
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
      <div className="w-full bg-[#111115] border-b border-white/10 shadow-lg relative z-10">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 overflow-x-auto text-xs scrollbar-none">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none font-mono">
            <div className="flex items-center gap-1.5 text-zinc-400 font-bold uppercase tracking-wider text-[10px] shrink-0 mr-1">
              <MapPin className="w-3.5 h-3.5 text-[#e2b170]" />
              <span>Premier Metros:</span>
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
                      ? 'bg-[#e2b170] text-black font-black shadow-md shadow-[#e2b170]/25'
                      : 'bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.name}, {m.state}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 shrink-0 text-xs font-mono text-zinc-300 bg-white/5 border border-white/10 px-3.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#e2b170] animate-pulse" />
            <span className="font-bold text-white">{filteredListings.length}</span>
            <span>Curated Residences</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE */}
      <main className="w-full py-5 sm:py-6 flex-1 relative z-10">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* VIEW MODE 1: ACTIVE THEORY 3D SPATIAL COVERFLOW */}
          {activeView === 'spatial' && (
            <div className="space-y-8 relative">
              
              {/* Giant Ghost Typographic Watermark (MotionSites Pattern H) */}
              <div className="absolute top-1/4 inset-x-0 flex items-center justify-center pointer-events-none -z-10 select-none overflow-hidden opacity-100">
                <span className="text-[17vw] font-black uppercase tracking-tighter text-white/[0.025] font-sans select-none whitespace-nowrap">
                  ARCHITECTURAL
                </span>
              </div>

              {/* Cinematic Editorial Banner (Inspired by Arin Vale & Active Theory) */}
              <div className="text-center pt-2 pb-2 space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e2b170]/15 border border-[#e2b170]/40 text-[#e2b170] text-xs font-mono font-bold tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e2b170] animate-pulse" />
                  CURATED ARCHITECTURAL COLLECTION
                </div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-wide uppercase font-sans drop-shadow-md">
                  EXCEPTIONAL HOMES FOR EXCEPTIONAL LIVES.
                </h1>
                <p className="text-xs sm:text-sm font-mono text-zinc-400 max-w-2xl mx-auto">
                  Immersive 3D gallery featuring bespoke residences, cantilevered pavilions, and private estates.
                </p>
              </div>

              {/* Spatial Layout with Left Active Theory HUD & Center 3D Deck */}
              <div className="flex flex-col lg:flex-row items-start gap-6">
                
                {/* Left Active Theory HUD (From User Reference Video) */}
                <aside className="w-full lg:w-72 shrink-0 space-y-3">
                  <div className="p-5 rounded-3xl bg-[#121216]/90 border border-white/10 shadow-2xl backdrop-blur-2xl space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#e2b170] animate-pulse" />
                      <h4 className="text-[11px] font-mono font-black tracking-widest text-zinc-400 uppercase">
                        COLLECTIONS
                      </h4>
                    </div>

                    <div className="space-y-1 font-mono text-xs">
                      {[
                        { id: 'ALL', label: `ALL RESIDENCES (${allListings.length})`, status: 'ALL' },
                        { id: 'SALE', label: 'FOR ACQUISITION (BUY)', status: 'FOR_SALE' },
                        { id: 'RENT', label: 'FOR LEASE (RENT)', status: 'FOR_RENT' },
                        { id: 'SINGLE_FAMILY', label: 'VILLAS & ESTATES', propType: 'SINGLE_FAMILY' },
                        { id: 'CONDO', label: 'PENTHOUSES & LOFTS', propType: 'CONDO' },
                      ].map((item: any) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            if (item.status) setFilters(prev => ({ ...prev, listingStatus: item.status }));
                            if (item.propType) setFilters(prev => ({ ...prev, propertyType: item.propType }));
                          }}
                          className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl text-zinc-300 hover:text-[#e2b170] hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-white/10"
                        >
                          <span>→ {item.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#e2b170] opacity-0 group-hover:opacity-100 transition-all" />
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTriggerLiveCrawl(filters.searchQuery)}
                      className="w-full py-2.5 px-3 rounded-2xl bg-[#e2b170] hover:bg-[#d4a055] text-black text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#e2b170]/20"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>BROWSE ALL METROS</span>
                    </button>
                  </div>
                </aside>

                {/* Center 3D Coverflow Stage */}
                <div className="flex-1 w-full overflow-visible">
                  <SpatialCardCarousel
                    listings={filteredListings}
                    onSelectListing={(l) => setSelectedListing(l)}
                    onOpenDetail={(l) => handleOpenProperty(l)}
                  />
                </div>

              </div>

              {/* 4-CARD CURATED ESTATE METRICS STRIP (MotionSites: Telemetry below Hero Stage) */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
                
                {/* Metric 1 */}
                <div className="bg-[#121216] rounded-2xl border border-white/10 p-4 sm:p-5 shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#e2b170]/15 border border-[#e2b170]/30 flex items-center justify-center text-[#e2b170] shrink-0">
                    <Building className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                      Curated Residences
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-white truncate font-mono">
                      {filteredListings.length} Available
                    </div>
                    <span className="text-[11px] text-[#e2b170] font-medium flex items-center gap-1 mt-0.5 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e2b170] animate-pulse" />
                      Verified Architectural Collection
                    </span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-[#121216] rounded-2xl border border-white/10 p-4 sm:p-5 shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#e2b170]/15 border border-[#e2b170]/30 flex items-center justify-center text-[#e2b170] shrink-0">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                      {filters.listingStatus === 'FOR_RENT' ? 'Average Lease' : 'Average Estate Value'}
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-[#e2b170] truncate font-mono">
                      {filters.listingStatus === 'FOR_RENT'
                        ? `${formatCurrency(metrics.avgRent)}/mo`
                        : formatCurrency(metrics.avgPrice)}
                    </div>
                    <span className="text-[11px] text-zinc-400 font-medium truncate block mt-0.5 font-mono">
                      Premier Market Baseline
                    </span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-[#121216] rounded-2xl border border-white/10 p-4 sm:p-5 shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#e2b170]/15 border border-[#e2b170]/30 flex items-center justify-center text-[#e2b170] shrink-0">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                      Premier Metros
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-white truncate font-mono">
                      12 US Metros
                    </div>
                    <span className="text-[11px] text-[#e2b170] font-medium truncate block mt-0.5 font-mono">
                      National Luxury Coverage
                    </span>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-[#121216] rounded-2xl border border-white/10 p-4 sm:p-5 shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#e2b170]/15 border border-[#e2b170]/30 flex items-center justify-center text-[#e2b170] shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                      Education & Culture
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-[#e2b170] truncate font-mono">
                      ★ 10/10 GreatSchools
                    </div>
                    <span className="text-[11px] text-zinc-400 font-medium truncate block mt-0.5 font-mono">
                      Top Proximity Districts
                    </span>
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* TELEMETRY STRIP FOR NON-SPATIAL VIEWS (Split, Grid, Map) */}
          {activeView !== 'spatial' && (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-[#121216] rounded-2xl border border-white/10 p-4 sm:p-5 shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#e2b170]/15 border border-[#e2b170]/30 flex items-center justify-center text-[#e2b170] shrink-0">
                  <Building className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                    Curated Residences
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white truncate font-mono">
                    {filteredListings.length} Available
                  </div>
                  <span className="text-[11px] text-[#e2b170] font-medium flex items-center gap-1 mt-0.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e2b170] animate-pulse" />
                    Verified Architectural Collection
                  </span>
                </div>
              </div>

              <div className="bg-[#121216] rounded-2xl border border-white/10 p-4 sm:p-5 shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#e2b170]/15 border border-[#e2b170]/30 flex items-center justify-center text-[#e2b170] shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                    {filters.listingStatus === 'FOR_RENT' ? 'Average Lease' : 'Average Estate Value'}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-[#e2b170] truncate font-mono">
                    {filters.listingStatus === 'FOR_RENT'
                      ? `${formatCurrency(metrics.avgRent)}/mo`
                      : formatCurrency(metrics.avgPrice)}
                  </div>
                  <span className="text-[11px] text-zinc-400 font-medium truncate block mt-0.5 font-mono">
                    Premier Market Baseline
                  </span>
                </div>
              </div>

              <div className="bg-[#121216] rounded-2xl border border-white/10 p-4 sm:p-5 shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#e2b170]/15 border border-[#e2b170]/30 flex items-center justify-center text-[#e2b170] shrink-0">
                  <Compass className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                    Premier Metros
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white truncate font-mono">
                    12 US Metros
                  </div>
                  <span className="text-[11px] text-[#e2b170] font-medium truncate block mt-0.5 font-mono">
                    National Luxury Coverage
                  </span>
                </div>
              </div>

              <div className="bg-[#121216] rounded-2xl border border-white/10 p-4 sm:p-5 shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#e2b170]/15 border border-[#e2b170]/30 flex items-center justify-center text-[#e2b170] shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                    Education & Culture
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-[#e2b170] truncate font-mono">
                    ★ 10/10 GreatSchools
                  </div>
                  <span className="text-[11px] text-zinc-400 font-medium truncate block mt-0.5 font-mono">
                    Top Proximity Districts
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* VIEW MODE 2: SPLIT SCREEN (MAP LEFT, HOUSES RIGHT - USES FULL SPACE OF THE SCREEN) */}
          {activeView === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Sticky Map Console (5 of 12 cols) */}
              <div className="lg:col-span-5 xl:col-span-6 lg:sticky lg:top-20 z-10">
                <div className="h-[520px] lg:h-[calc(100vh-140px)] w-full rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-black relative">
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
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 bg-[#121216]/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-md text-xs font-medium text-zinc-200 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-[#e2b170]" />
                    <span className="font-bold text-white">{activeMetroPill} Metro</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-[#e2b170] font-bold">{filteredListings.length} Curated Homes</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Collection Filters & Scrollable Property Cards (7 of 12 cols) */}
              <div className="lg:col-span-7 xl:col-span-6 space-y-4">
                
                {/* Collection Tabs Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-[#121216] rounded-2xl border border-white/10 shadow-xl">
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none font-mono">
                    {[
                      { id: 'ALL', label: 'All Estates' },
                      { id: 'ZILLOW', label: 'Zillow' },
                      { id: 'REDFIN', label: 'Redfin' },
                      { id: 'REALTOR', label: 'Realtor' },
                      { id: 'APARTMENTS_COM', label: 'Apartments' },
                    ].map((p) => {
                      const count = portalCounts[p.id] || 0;
                      const isSelected = selectedPortal === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPortal(p.id as any)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#e2b170] text-black font-black shadow-md shadow-[#e2b170]/25'
                              : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
                          }`}
                        >
                          <span>{p.label}</span>
                          <span className="ml-1.5 opacity-75 font-mono">({count})</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 font-mono">
                    <span className="text-xs text-zinc-400 font-medium hidden md:inline">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-200 focus:outline-none focus:border-[#e2b170] cursor-pointer"
                    >
                      <option value="SCORE_DESC">Featured Architecture</option>
                      <option value="PRICE_ASC">Price: Low to High</option>
                      <option value="PRICE_DESC">Price: High to Low</option>
                      <option value="SQFT_DESC">Largest SqFt</option>
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
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {displayedListings.length < filteredListings.length && (
                  <div className="pt-4 pb-2 flex justify-center">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 24)}
                      className="px-8 py-3 rounded-2xl bg-[#e2b170] hover:bg-[#d4a055] text-black font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#e2b170]/25 cursor-pointer flex items-center gap-2 font-mono"
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
              <div className="h-[280px] w-full rounded-3xl border border-white/10 shadow-xl overflow-hidden bg-black relative">
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[#121216] rounded-2xl border border-white/10 shadow-xl">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none font-mono">
                  {[
                    { id: 'ALL', label: 'All Estates' },
                    { id: 'ZILLOW', label: 'Zillow' },
                    { id: 'REDFIN', label: 'Redfin' },
                    { id: 'REALTOR', label: 'Realtor' },
                    { id: 'APARTMENTS_COM', label: 'Apartments' },
                  ].map((p) => {
                    const count = portalCounts[p.id] || 0;
                    const isSelected = selectedPortal === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPortal(p.id as any)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#e2b170] text-black font-black shadow-md shadow-[#e2b170]/25'
                            : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
                        }`}
                      >
                        <span>{p.label}</span>
                        <span className="ml-1.5 opacity-75 font-mono">({count})</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto font-mono">
                  <span className="text-xs text-zinc-400 font-medium hidden md:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-200 focus:outline-none focus:border-[#e2b170] cursor-pointer"
                  >
                    <option value="SCORE_DESC">Featured Architecture</option>
                    <option value="PRICE_ASC">Price: Low to High</option>
                    <option value="PRICE_DESC">Price: High to Low</option>
                    <option value="SQFT_DESC">Largest Square Footage</option>
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
                  />
                ))}
              </div>

              {/* Pagination Button */}
              {displayedListings.length < filteredListings.length && (
                <div className="pt-6 pb-4 flex justify-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 24)}
                    className="px-8 py-3 rounded-2xl bg-[#e2b170] hover:bg-[#d4a055] text-black font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#e2b170]/25 cursor-pointer flex items-center gap-2 font-mono"
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
                          <span className="text-xs font-black text-[#e2b170] font-mono">
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
                        onClick={() => handleOpenProperty(selectedListing)}
                        className="px-5 py-2.5 rounded-xl bg-[#e2b170] hover:bg-[#d4a055] text-black text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#e2b170]/25 cursor-pointer"
                      >
                        Explore Residence
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* 4. CLEAN LUXURY ESTATE FOOTER */}
      <footer className="w-full bg-[#09090b] text-zinc-400 py-14 border-t border-white/10 relative z-10">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10 text-xs font-mono">
            
            <div className="space-y-3 font-sans">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white tracking-wider">
                  HOUSE INTELLIGENCE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e2b170]/20 text-[#e2b170] border border-[#e2b170]/40 font-mono font-bold uppercase">
                  ESTATE
                </span>
              </div>
              <p className="text-zinc-400 leading-relaxed font-mono text-xs">
                Cinematic 3D architectural showcase indexing curated luxury estates, modern villas, and private residences across premier US metros.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-[#e2b170] tracking-wider">Premier Metros</h4>
              <div className="flex flex-wrap gap-1.5">
                {['Chicago', 'Denver', 'Austin', 'Seattle', 'Miami', 'New York', 'Los Angeles', 'San Francisco'].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setActiveMetroPill(c);
                      setFilters((prev) => ({ ...prev, searchQuery: c }));
                      handleScrollToTop();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#e2b170] hover:text-black text-zinc-300 text-[11px] transition-all cursor-pointer border border-white/10 font-mono font-semibold"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-[#e2b170] tracking-wider">Architectural Collections</h4>
              <ul className="space-y-1.5 text-zinc-400">
                <li>• Cantilevered Glass Modernism</li>
                <li>• Mid-Century Organic Architecture</li>
                <li>• Desert Minimalist Brutalism</li>
                <li>• Biophilic Waterfront Modern Villas</li>
                <li>• Cast-Iron Heritage Sky Penthouses</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-[#e2b170] tracking-wider">Private Advisory</h4>
              <p className="text-zinc-400 leading-relaxed">
                Discrete private viewings and bespoke architectural acquisitions coordinated worldwide.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => handleScrollToTop()}
                  className="px-4 py-2 rounded-xl bg-[#e2b170] hover:bg-[#d4a055] text-black font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#e2b170]/20 cursor-pointer"
                >
                  Schedule Private Tour
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500 font-mono">
            <p>© 2026 House Intelligence. Equal Housing Opportunity. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#e2b170] animate-pulse" />
              <span>Curated Architectural Collection ({allListings.length} Bespoke Residences)</span>
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
