'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HeroSection } from '../components/home/HeroSection';
import { Header } from '../components/layout/Header';
import { PropertyCard } from '../components/property/PropertyCard';
import { PropertyDetailModal } from '../components/property/PropertyDetailModal';
import { HouseRoiCalculatorModal } from '../components/property/HouseRoiCalculatorModal';
import { ScribbleMap } from '../components/map/ScribbleMap';
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

const INITIAL_REAL_LISTINGS: ShikaakPropertyListing[] = (() => {
  const crawled = LIVE_CRAWLED_DATA as unknown as ShikaakPropertyListing[];
  const existingIds = new Set(crawled.map(p => p.id));
  return [
    ...crawled,
    ...CHICAGO_LISTINGS.filter(p => !existingIds.has(p.id)),
  ];
})();
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
  Activity,
  ExternalLink,
  TrendingUp
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

  // Multilingual State
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

    // Detect if user query mentions a broad multi-portal scan
    const lowerBase = baseText.toLowerCase();
    const isMultiOrBroad = /other\s*websites?|all\s*websites?|all\s*homes?|all\s*properties|scraper|crawling|crawler|portals?|across|take all/i.test(lowerBase) ||
      ((lowerBase.includes('zillow') ? 1 : 0) + (lowerBase.includes('redfin') ? 1 : 0) + (lowerBase.includes('realtor') ? 1 : 0) + (lowerBase.includes('trulia') ? 1 : 0) + (lowerBase.includes('apartment') ? 1 : 0) > 1);

    if (isMultiOrBroad) {
      filterOverrides = {
        ...filterOverrides,
        priceMin: 0,
        priceMax: 5000000,
        bedsMin: 0,
        bathsMin: 0,
        propertyType: 'ALL',
        listingStatus: 'ALL',
      };
      activeFilters.priceMin = 0;
      activeFilters.priceMax = 5000000;
      activeFilters.bedsMin = 0;
      activeFilters.bathsMin = 0;
      activeFilters.propertyType = 'ALL';
      activeFilters.listingStatus = 'ALL';
    }

    // 2. Build full NLP query incorporating active filters
    const queryParts: string[] = [];
    if (baseText) {
      queryParts.push(baseText);
    } else {
      queryParts.push(`${metroCity} homes`);
    }

    const currentQueryLower = queryParts.join(' ').toLowerCase();

    if (!isMultiOrBroad) {
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
    }

    if (!isMultiOrBroad) {
      if (/\b(only zillow|from zillow|zillow homes?|zillow rentals?)\b/i.test(lowerBase) && !/other/i.test(lowerBase)) {
        setSelectedPortal('ZILLOW');
      } else if (/\b(only redfin|from redfin|redfin homes?|redfin rentals?)\b/i.test(lowerBase) && !/other/i.test(lowerBase)) {
        setSelectedPortal('REDFIN');
      } else if (/\b(only realtor|from realtor|realtor\.com|realtor homes?)\b/i.test(lowerBase) && !/other/i.test(lowerBase)) {
        setSelectedPortal('REALTOR');
      } else if (/\b(only apartments|from apartments|apartments\.com)\b/i.test(lowerBase) && !/other/i.test(lowerBase)) {
        setSelectedPortal('APARTMENTS_COM');
      } else if (/\b(only trulia|from trulia|trulia homes?)\b/i.test(lowerBase) && !/other/i.test(lowerBase)) {
        setSelectedPortal('TRULIA');
      }
    } else {
      setSelectedPortal('ALL');
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

        // 1. Text Search Filter (Street, City, State, Neighborhood, or Portal)
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase().trim();
          
          // Broad scan commands that should show all crawled inventory (or filtered portal inventory)
          const isBroadScanQuery = /take all|all homes|all properties|from zillow|from redfin|from realtor|using scraper|crawling|crawler|scanned houses|other website|other websites|all websites|portals|scan now/i.test(query);

          if (!isBroadScanQuery) {
            const matchStreet = listing.propertyAddress.street.toLowerCase().includes(query);
            const matchCity = listing.propertyAddress.city.toLowerCase().includes(query);
            const matchState = listing.propertyAddress.state.toLowerCase().includes(query);
            const matchNeighborhood = listing.propertyAddress.neighborhood.toLowerCase().includes(query);
            const matchTitle = listing.title.toLowerCase().includes(query);
            const matchPortal = (listing.sourcePortal || '').toLowerCase().includes(query);

            if (!matchStreet && !matchCity && !matchState && !matchNeighborhood && !matchTitle && !matchPortal) {
              const tokens = query.split(/\s+/).filter(t => 
                t.length > 2 && 
                !['house', 'home', 'homes', 'under', 'below', 'for', 'sale', 'rent', 'near', 'with', 'and', 'the', 'from', 'other', 'website', 'websites', 'using', 'scraper', 'crawling', 'take', 'all', 'scanned', 'scan', 'now'].includes(t) &&
                !/\d/.test(t)
              );
              if (tokens.length > 0) {
                const tokenMatch = tokens.some(t =>
                  listing.propertyAddress.city.toLowerCase().includes(t) ||
                  listing.propertyAddress.neighborhood.toLowerCase().includes(t) ||
                  listing.propertyAddress.street.toLowerCase().includes(t) ||
                  listing.propertyAddress.state.toLowerCase().includes(t) ||
                  (listing.sourcePortal || '').toLowerCase().includes(t)
                );
                if (!tokenMatch) return false;
              }
            }
          }
        }

        // 2. Listing Status (Buy / Rent)
        if (filters.listingStatus !== 'ALL' && listing.listingStatus !== filters.listingStatus) {
          return false;
        }

        // 3. Price Min & Max (Distinguish monthly rent vs purchase price)
        if (listing.listingStatus === 'FOR_RENT') {
          const rent = listing.financials.inputs.monthlyGrossRent;
          if (filters.priceMax < 10000) {
            if (rent < filters.priceMin || rent > filters.priceMax) return false;
          } else if (filters.priceMin > 0) {
            if (rent < filters.priceMin) return false;
          }
        } else {
          if (listing.financials.inputs.purchasePrice < filters.priceMin) {
            return false;
          }
          if (filters.priceMax < 5000000 && listing.financials.inputs.purchasePrice > filters.priceMax) {
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
          const loc = listing.propertyAddress?.location || (listing.propertyAddress as any)?.coordinates;
          if (!loc) return false;
          const isInside = isPointInsidePolygon(loc, scribblePolygon);
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
  }, [allListings, filters, selectedPortal, scribblePolygon, sortBy, buyerWeights]);

  // Progressive Pagination for Clean, Classy Browsing (Avoids Endless 585-House Scroll)
  const [visibleCount, setVisibleCount] = useState(16);

  useEffect(() => {
    setVisibleCount(16);
  }, [filters, selectedPortal, scribblePolygon]);

  const displayedListings = useMemo(() => {
    return filteredListings.slice(0, visibleCount);
  }, [filteredListings, visibleCount]);

  // Real-Time Aggregate Telemetry for Scanned Multi-Portal Properties
  const scannedMetrics = useMemo(() => {
    if (filteredListings.length === 0) {
      return { avgPrice: 0, avgRent: 0, avgCapRate: 0, avgFit: 95, topSchoolScore: 10 };
    }
    const sumPrice = filteredListings.reduce((acc, p) => acc + (p.financials?.inputs?.purchasePrice || 0), 0);
    const sumRent = filteredListings.reduce((acc, p) => acc + (p.financials?.inputs?.monthlyGrossRent || 0), 0);
    const sumCap = filteredListings.reduce((acc, p) => acc + (p.financials?.outputs?.capRatePercent || 0), 0);
    const count = filteredListings.length;
    return {
      avgPrice: Math.round(sumPrice / count),
      avgRent: Math.round(sumRent / count),
      avgCapRate: +(sumCap / count).toFixed(2),
      avgFit: 95,
      topSchoolScore: 10,
    };
  }, [filteredListings]);

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
          {/* Clean Classy Loading State when Scanning */}
          {isLiveCrawling ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-red-200 border-t-red-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building className="w-5 h-5 text-red-600 animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Scanning Luxury Residences...
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Retrieving verified property telemetry, school ratings, and valuation metrics for your criteria.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* 1. SELECTED HOUSE SPOTLIGHT (APPEARS DIRECTLY BELOW THE MAP WHEN A PIN IS CLICKED) */}
              {selectedListing && (
                <div className="w-full max-w-full overflow-hidden p-5 sm:p-6 rounded-3xl bg-slate-50 border-2 border-red-200 shadow-md flex flex-col lg:flex-row items-center gap-6">
                  <div className="w-full lg:w-80 lg:max-w-[340px] h-56 rounded-2xl overflow-hidden shrink-0 border border-slate-200 relative group">
                    <img
                      src={selectedListing.media.featuredImage}
                      alt={selectedListing.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md border bg-white/95 text-slate-900 border-slate-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="uppercase tracking-wider text-[10px] font-mono text-slate-800">
                        Verified MLS Residence
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-0.5 bg-red-600 text-white rounded-full text-xs font-bold font-mono shadow-sm">
                        Pass/Flow {selectedListing.financials.outputs.passFlowScore.toFixed(1)} / 5.0
                      </span>
                      <span className="px-3 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold font-mono border border-emerald-200">
                        Cap Rate: {selectedListing.financials.outputs.capRatePercent.toFixed(2)}%
                      </span>
                      {selectedListing.financials.outputs.monthlyNetCashFlow !== undefined && (
                        <span className="px-3 py-0.5 bg-white text-slate-700 rounded-full text-xs font-bold font-mono border border-slate-200">
                          Cash Flow: {selectedListing.financials.outputs.monthlyNetCashFlow >= 0 ? `+${formatCurrency(selectedListing.financials.outputs.monthlyNetCashFlow)}/mo` : `${formatCurrency(selectedListing.financials.outputs.monthlyNetCashFlow)}/mo`}
                        </span>
                      )}
                      <span className="px-3 py-0.5 bg-white text-slate-700 rounded-full text-xs font-medium border border-slate-200">
                        {selectedListing.propertyAddress.city}, {selectedListing.propertyAddress.state} ({selectedListing.timezone?.timeZoneCode || 'CST'})
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {selectedListing.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-normal">
                        {selectedListing.propertyAddress.street}, {selectedListing.propertyAddress.neighborhood}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="text-2xl font-bold text-red-600 font-mono">
                        {selectedListing.listingStatus === 'FOR_RENT'
                          ? `${formatCurrency(selectedListing.financials.inputs.monthlyGrossRent)}/mo`
                          : formatCurrency(selectedListing.financials.inputs.purchasePrice)}
                      </span>
                      <span className="text-xs font-medium text-slate-400 font-mono">
                        {selectedListing.listingStatus === 'FOR_RENT'
                          ? `Est. Move-In: ${formatCurrency(selectedListing.financials.inputs.monthlyGrossRent * 2 + 50)}`
                          : `${formatCurrency(selectedListing.financials.inputs.monthlyGrossRent)}/mo rent`}
                      </span>
                      <span className="text-xs font-medium text-slate-600">
                        • {selectedListing.specs.beds} Beds • {selectedListing.specs.baths} Baths • {(selectedListing.specs.finishedSqFt || 1800).toLocaleString()} sq ft
                      </span>
                    </div>

                    {/* SCHOOLS & MALLS HIGHLIGHT CHIPS IN SPOTLIGHT */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {(() => {
                        const sm = resolveUsMetro(selectedListing.propertyAddress?.city || 'Chicago');
                        const pois = (selectedListing.nearbyPointsOfInterest && selectedListing.nearbyPointsOfInterest.length > 0)
                          ? selectedListing.nearbyPointsOfInterest
                          : [...(sm.topSchools || []), ...(sm.topMalls || [])];
                        return pois.slice(0, 2).map((poi) => (
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
                              ★ {poi.ratingScore} {poi.type === 'SCHOOL' ? '/10 GreatSchools' : '/5.0 Mall'}
                            </span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto">
                    {selectedListing.externalUrl && (
                      <a
                        href={selectedListing.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        title="View Official Verified Listing"
                      >
                        <span>View Official Listing</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>
                    )}

                    <button
                      onClick={() => setRoiModalListing(selectedListing)}
                      className="px-5 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-500 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Calculator className="w-4 h-4 text-red-500" />
                      <span>ROI Underwriter</span>
                    </button>

                    <button
                      onClick={() => handleOpenProperty(selectedListing)}
                      className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-center cursor-pointer"
                    >
                      Open Full Intelligence →
                    </button>
                  </div>
                </div>
              )}
            </>
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
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedListings.map((listing) => (
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

              {/* Progressive Pagination (Load More Residences) */}
              {visibleCount < filteredListings.length && (
                <div className="pt-6 pb-2 flex flex-col items-center justify-center gap-3">
                  <p className="text-xs text-slate-500 font-medium">
                    Showing {displayedListings.length} of {filteredListings.length} verified residences
                  </p>
                  <button
                    onClick={() => setVisibleCount((prev) => Math.min(prev + 16, filteredListings.length))}
                    className="px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl text-xs uppercase tracking-wider border border-slate-300 shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Load More Residences (+16)</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-14 text-center bg-red-50/40 rounded-3xl border-2 border-red-200 p-8 space-y-4 max-w-xl mx-auto shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center mx-auto shadow-md shadow-red-200">
                <Globe className="w-7 h-7 animate-pulse" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                No Residences Found for "{filters.searchQuery || 'Current Filters'}"
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                No properties matched these exact criteria. Scan verified real-time MLS inventory or reset your search filters to explore available luxury residences.
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
                      <span>Scanning Inventory...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Scan Verified MLS (Enter ↵)</span>
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

      {/* Comprehensive Institutional Footer */}
      <footer className="w-full bg-slate-950 text-white border-t border-slate-800 mt-16 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand Column */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md">
                  <Building className="w-5 h-5" />
                </div>
                <span className="text-lg font-black tracking-tight text-white">
                  HOUSE INTELLIGENCE
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Next-generation real estate intelligence with real-time property ingestion, freehand boundary mapping, and institutional Pass/Flow underwriting.
              </p>
            </div>

            {/* Residence Portfolios Column */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
                Curated Portfolios
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>Luxury Single-Family Estates</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Architectural Penthouses</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Contemporary Condominiums</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Waterfront & Lakefront Residences</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>Historic Brownstones & Townhomes</span>
                </li>
              </ul>
            </div>

            {/* Key Metros Column */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
                Featured Metros
              </h4>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {['Austin, TX', 'Miami, FL', 'Denver, CO', 'Seattle, WA', 'Chicago, IL', 'New York, NY'].map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      const cityName = city.split(',')[0];
                      handleTriggerLiveCrawl(cityName);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-red-600/30 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer text-[11px]"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Telemetry Standards Column */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
                Institutional Telemetry
              </h4>
              <ul className="space-y-1 text-xs text-slate-400">
                <li>• Pass/Flow 5.0 Underwriting Grade</li>
                <li>• Cap Rate & Monthly Cash Flow</li>
                <li>• GreatSchools™ Ratings & Proximity</li>
                <li>• 20-Year Burglary Safety Corridors</li>
                <li>• International Airport Transit Telemetry</li>
              </ul>
            </div>
          </div>

          {/* Bottom Disclaimer & Copyright */}
          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>
              © 2026 House Intelligence Platform. Real-time MLS ingestion & institutional underwriting. Equal Housing Opportunity.
            </p>
            <div className="flex items-center gap-4">
              <span>Verified MLS Telemetry</span>
              <span>•</span>
              <span>{allListings.length} Active Residences</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Telemetry Live
              </span>
            </div>
          </div>
        </div>
      </footer>

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
    </div>
  );
}
