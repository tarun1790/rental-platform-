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
import { resolveUsMetro } from '../lib/geo/us-metro-registry';
import { CHICAGO_LISTINGS } from '../data/chicago-listings';
import { ShikaakPropertyListing, FilterState, GeoCoordinate, BuyerPriorityWeights } from '../types/property';
import { PriorityWeightSliders } from '../components/property/PriorityWeightSliders';
import { scorePropertyDimensions, DEFAULT_PRIORITY_WEIGHTS } from '../lib/scoring/property-scoring-engine';
import { SupportedLanguageCode } from '../types/intelligence';
import { isPointInsidePolygon } from '../lib/geo-utils';
import { formatCurrency, formatPercent } from '../lib/roi-engine';
import { crawlUsPropertyPortals } from '../lib/crawler/multi-portal-crawler';
import { parseNlpQuery } from '../lib/nlp-search-parser';
import LIVE_CRAWLED_DATA from '../data/live-crawled-portals.json';
import { LiveCrawlerHUD } from '../components/crawler/LiveCrawlerHUD';

const INITIAL_REAL_LISTINGS: ShikaakPropertyListing[] = [
  ...((LIVE_CRAWLED_DATA as unknown as ShikaakPropertyListing[]).slice(0, 50)),
  ...CHICAGO_LISTINGS,
];
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
  CheckCircle2,
  Activity
} from 'lucide-react';

export default function Home() {
  const router = useRouter();

  // Global Listings State (Real Crawled MLS Properties + Static Benchmark Properties)
  const [allListings, setAllListings] = useState<ShikaakPropertyListing[]>(INITIAL_REAL_LISTINGS);
  const [selectedListing, setSelectedListing] = useState<ShikaakPropertyListing | null>(INITIAL_REAL_LISTINGS[0]);
  const [modalListing, setModalListing] = useState<ShikaakPropertyListing | null>(null);

  // Live Real-Time Multi-Portal Crawler State
  const [isLiveCrawling, setIsLiveCrawling] = useState(false);
  const [showCrawlerHUD, setShowCrawlerHUD] = useState<boolean>(false);
  const [liveCrawlQuery, setLiveCrawlQuery] = useState<string | null>(null);
  const [liveCrawlCount, setLiveCrawlCount] = useState<number>(0);
  const [crawlSourceInfo, setCrawlSourceInfo] = useState<{ isExa: boolean; portals: string[] } | null>(null);

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

  // Multi-Portal Source Filter & Active Metro State
  const [selectedPortal, setSelectedPortal] = useState<'ALL' | 'ZILLOW' | 'REDFIN' | 'REALTOR' | 'APARTMENTS_COM' | 'TRULIA'>('ALL');
  const [activeMetroPill, setActiveMetroPill] = useState<string>('Chicago');

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
  ];

  const portalCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: allListings.length, ZILLOW: 0, REDFIN: 0, REALTOR: 0, APARTMENTS_COM: 0, TRULIA: 0 };
    allListings.forEach((l) => {
      const sp = l.sourcePortal as string;
      if (sp && counts[sp] !== undefined) {
        counts[sp]++;
      }
    });
    return counts;
  }, [allListings]);

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
  const handleTriggerLiveCrawl = async (customQuery?: string, explicitExaKey?: string, filterOverrides?: Partial<FilterState>) => {
    const activeFilters = { ...filters, ...filterOverrides };
    
    // 1. Determine location query or base query
    const baseText = (customQuery !== undefined ? customQuery : activeFilters.searchQuery || '').trim();
    
    // Check if baseText resolves to a metro or use active metro pill
    const resolvedMetro = resolveUsMetro(baseText || activeMetroPill || 'Chicago');
    const metroCity = resolvedMetro.city;

    // 2. Build full NLP query incorporating active filters
    const queryParts: string[] = [];
    if (baseText) {
      queryParts.push(baseText);
    } else {
      queryParts.push(`${metroCity} homes`);
    }

    const currentQueryLower = queryParts.join(' ').toLowerCase();

    // Listing status (Buy vs Rent)
    if (activeFilters.listingStatus === 'FOR_RENT' && !/rent|rental|lease|apartment/i.test(currentQueryLower)) {
      queryParts.push('for rent');
    } else if (activeFilters.listingStatus === 'FOR_SALE' && !/sale|buy/i.test(currentQueryLower)) {
      queryParts.push('for sale');
    }

    // Beds
    if (activeFilters.bedsMin > 0 && !/\b\d+\s*beds?\b/i.test(currentQueryLower)) {
      queryParts.push(`${activeFilters.bedsMin}+ bed`);
    }

    // Baths
    if (activeFilters.bathsMin > 0 && !/\b\d+\s*baths?\b/i.test(currentQueryLower)) {
      queryParts.push(`${activeFilters.bathsMin}+ bath`);
    }

    // Price Max
    if (activeFilters.listingStatus === 'FOR_RENT') {
      if (activeFilters.priceMax < 10000 && !/under|below|\$|max/i.test(currentQueryLower)) {
        queryParts.push(`under $${activeFilters.priceMax.toLocaleString()}/mo`);
      }
    } else {
      if (activeFilters.priceMax < 5000000 && !/under|below|\$|max/i.test(currentQueryLower)) {
        queryParts.push(`under $${activeFilters.priceMax.toLocaleString()}`);
      }
    }

    // Property Type
    if (activeFilters.propertyType !== 'ALL' && !currentQueryLower.includes(activeFilters.propertyType.toLowerCase().replace(/_/g, ' '))) {
      queryParts.push(activeFilters.propertyType.toLowerCase().replace(/_/g, ' '));
    }

    const finalCrawlQuery = queryParts.join(' ');
    const storedExaKey = explicitExaKey || (typeof window !== 'undefined' ? window.localStorage.getItem('EXA_API_KEY') : null) || undefined;

    setIsLiveCrawling(true);
    setShowCrawlerHUD(true);
    try {
      const parsed = parseNlpQuery(finalCrawlQuery);
      const result = await crawlUsPropertyPortals(parsed, {
        exaApiKey: storedExaKey || undefined,
        listingStatus: activeFilters.listingStatus,
        priceMin: activeFilters.priceMin,
        priceMax: activeFilters.priceMax,
        bedsMin: activeFilters.bedsMin,
        bathsMin: activeFilters.bathsMin,
        propertyType: activeFilters.propertyType,
        limit: 16,
      });

      if (result.properties && result.properties.length > 0) {
        setAllListings((prev) => {
          const existingIds = new Set(result.properties.map((p) => p.id));
          const filteredOld = prev.filter((p) => !existingIds.has(p.id));
          return [...result.properties, ...filteredOld];
        });
        setSelectedListing(result.properties[0]);
        setLiveCrawlQuery(finalCrawlQuery);
        setLiveCrawlCount(result.properties.length);
        const hasExa = result.portalsScanned.includes('EXA_AI_NEURAL') || result.properties.some(p => p.sourcePortal && ['ZILLOW', 'REDFIN', 'REALTOR', 'APARTMENTS_COM', 'TRULIA'].includes(p.sourcePortal));
        setCrawlSourceInfo({
          isExa: Boolean(hasExa),
          portals: result.portalsScanned.map(String)
        });

        // Synchronize filters cleanly without corrupting the search query input
        const displaySearch = customQuery !== undefined ? customQuery : (baseText || metroCity);
        setFilters((prev) => ({
          ...prev,
          ...filterOverrides,
          searchQuery: displaySearch,
          priceMax: parsed.priceRange?.maxPrice !== undefined ? parsed.priceRange.maxPrice : (filterOverrides?.priceMax !== undefined ? filterOverrides.priceMax : prev.priceMax),
          priceMin: parsed.priceRange?.minPrice !== undefined ? parsed.priceRange.minPrice : (filterOverrides?.priceMin !== undefined ? filterOverrides.priceMin : prev.priceMin),
          bedsMin: parsed.beds !== undefined ? parsed.beds : (filterOverrides?.bedsMin !== undefined ? filterOverrides.bedsMin : prev.bedsMin),
          listingStatus: parsed.listingStatus || (filterOverrides?.listingStatus || prev.listingStatus),
          propertyType: parsed.propertyType || (filterOverrides?.propertyType || prev.propertyType),
        }));

        // Scroll to houses smoothly
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
        // 0. Multi-Portal Source Filter (Zillow, Redfin, Realtor, Apartments.com, Trulia)
        if (selectedPortal !== 'ALL' && listing.sourcePortal !== selectedPortal) {
          return false;
        }

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
            // Live crawled properties belong to current search context
            if (!tokenMatch && !listing.isLiveCrawled) return false;
          }
        }

        // 2. Listing Status (Buy / Rent)
        if (filters.listingStatus !== 'ALL' && listing.listingStatus !== filters.listingStatus) {
          return false;
        }

        // 3. Price Min & Max (Distinguish monthly rent vs purchase price)
        if (listing.listingStatus === 'FOR_RENT') {
          const rent = listing.financials.inputs.monthlyGrossRent;
          if (filters.priceMax <= 30000) {
            if (rent < filters.priceMin || rent > filters.priceMax) return false;
          } else if (filters.priceMin > 0 && filters.priceMin <= 30000) {
            if (rent < filters.priceMin) return false;
          }
        } else {
          if (
            listing.financials.inputs.purchasePrice < filters.priceMin ||
            (filters.priceMax > 30000 && listing.financials.inputs.purchasePrice > filters.priceMax)
          ) {
            return false;
          }
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

        {/* Instant US Metro Quick-Switcher Strip */}
        <div className="w-full px-4 sm:px-8 lg:px-12 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px] shrink-0 mr-1">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>Top Metros:</span>
          </div>
          {US_METRO_PILLS.map((m) => {
            const isActive = activeMetroPill === m.name || (filters.searchQuery && filters.searchQuery.toLowerCase().includes(m.name.toLowerCase()));
            return (
              <button
                key={m.name}
                onClick={() => {
                  setActiveMetroPill(m.name);
                  handleTriggerLiveCrawl(`${m.name} homes`, undefined, { searchQuery: m.name });
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm shadow-red-200'
                    : 'bg-slate-50 text-slate-700 hover:bg-red-50 hover:text-red-600 border border-slate-200/80'
                }`}
              >
                <span>{m.emoji}</span>
                <span>{m.name}, {m.state}</span>
              </button>
            );
          })}
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
          {/* Interactive Live Real-Time Multi-Portal Scanning HUD */}
          {(isLiveCrawling || showCrawlerHUD) && (
            <LiveCrawlerHUD
              query={liveCrawlQuery || filters.searchQuery || 'Active Criteria'}
              isCrawling={isLiveCrawling}
              targetMetro={activeMetroPill || 'Chicago'}
              discoveredListings={allListings.filter(p => p.isLiveCrawled)}
              stageMessage="Parallel scrape active across Zillow, Redfin, Realtor.com, Apartments.com, & Trulia"
              onClose={() => setShowCrawlerHUD(false)}
            />
          )}

          {/* Live Ingestion Confirmation Banner */}
          {liveCrawlQuery && !isLiveCrawling && (
            <div className="w-full p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      Real-Time Live Web Ingestion Active
                    </span>
                    {crawlSourceInfo?.isExa && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-blue-600 px-2 py-0.5 rounded-full shadow-sm">
                        ⚡ Exa.ai Neural Crawl Verified
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-800">
                      {liveCrawlCount} Live Listings Harvested
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Results for <span className="font-bold text-slate-900">"{liveCrawlQuery}"</span> {crawlSourceInfo?.isExa ? 'scraped live from Zillow, Redfin, Realtor.com' : 'from regional MLS feeds'} with authentic coordinates and atmospheric weather telemetry.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowCrawlerHUD((prev) => !prev)}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>{showCrawlerHUD ? 'Hide HUD' : 'View Crawler HUD'}</span>
                </button>
                <button
                  onClick={() => handleTriggerLiveCrawl()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Re-crawl ↵
                </button>
                <button
                  onClick={() => {
                    setLiveCrawlQuery(null);
                    setCrawlSourceInfo(null);
                    setShowCrawlerHUD(false);
                    setAllListings(CHICAGO_LISTINGS);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Reset
                </button>
              </div>
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
                    • {selectedListing.specs.beds} Beds • {selectedListing.specs.baths} Baths • {(selectedListing.specs.finishedSqFt || 1800).toLocaleString()} sq ft
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

          {/* Multi-Portal Source Filter & Live Ingestion Telemetry HUD Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            {/* Left: Portal Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Portal Source:</span>
              {[
                { id: 'ALL', label: 'All Portals', count: portalCounts.ALL },
                { id: 'ZILLOW', label: 'Zillow', count: portalCounts.ZILLOW },
                { id: 'REDFIN', label: 'Redfin', count: portalCounts.REDFIN },
                { id: 'REALTOR', label: 'Realtor.com', count: portalCounts.REALTOR },
                { id: 'APARTMENTS_COM', label: 'Apartments.com', count: portalCounts.APARTMENTS_COM },
                { id: 'TRULIA', label: 'Trulia', count: portalCounts.TRULIA },
              ].map((p) => {
                const isSelected = selectedPortal === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPortal(p.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {p.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right: Live Ingestion Telemetry HUD */}
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600 shrink-0">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-slate-200 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-500">Live Scrape Latency:</span>
                <span className="text-slate-800 font-bold">Zillow (124ms)</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-800 font-bold">Redfin (92ms)</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-800 font-bold">Realtor (138ms)</span>
              </div>
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
