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
import { ActiveTheoryParticleCanvas } from '../components/spatial/ActiveTheoryParticleCanvas';
import { SpatialCardCarousel } from '../components/spatial/SpatialCardCarousel';
import { ActiveTheoryHUD } from '../components/spatial/ActiveTheoryHUD';
import { DatabaseExplorerModal } from '../components/spatial/DatabaseExplorerModal';
import { getExaApiKey } from '../lib/crawler/exa-client';

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
  TrendingUp,
  DollarSign,
  X
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

  // Active Theory Spatial UI View & Database Explorer State
  const [spatialViewMode, setSpatialViewMode] = useState<'spatial' | 'shrine' | 'map' | 'database'>('spatial');
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [totalDbCount, setTotalDbCount] = useState(817);
  const [hasExaKey, setHasExaKey] = useState(true);

  // Load full SQLite database inventory on mount
  useEffect(() => {
    setHasExaKey(!!getExaApiKey());

    fetch('/api/database/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.totalProperties) setTotalDbCount(data.totalProperties);
      })
      .catch(() => {});

    fetch('/api/database/properties?limit=850')
      .then((res) => res.json())
      .then((data) => {
        if (data.properties && data.properties.length > 0) {
          setAllListings((prev) => {
            const existingIds = new Set(data.properties.map((p: any) => p.id));
            const remaining = prev.filter((p) => !existingIds.has(p.id));
            return [...data.properties, ...remaining];
          });
        }
      })
      .catch(() => {});
  }, []);

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
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/rental-platform-')) {
      window.location.href = `/rental-platform-/property/${listing.id}/`;
    } else {
      router.push(`/property/${listing.id}/`);
    }
  };

  const handleSelectPropertyFromMap = (listing: ShikaakPropertyListing) => {
    setSelectedListing(listing);
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
      const effectiveListingStatus = (activeFilters.listingStatus && activeFilters.listingStatus !== 'ALL') ? activeFilters.listingStatus : (parsed.listingStatus || 'FOR_RENT');
      const effectiveBeds = (activeFilters.bedsMin !== undefined && Number(activeFilters.bedsMin) > 0) ? Number(activeFilters.bedsMin) : (parsed.beds || 3);
      const effectiveType = (activeFilters.propertyType && activeFilters.propertyType !== 'ALL') ? activeFilters.propertyType : parsed.propertyType;

      const result = await crawlUsPropertyPortals(parsed, {
        exaApiKey: storedExaKey || undefined,
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
            const street = (listing.propertyAddress?.street || '').toLowerCase();
            const city = (listing.propertyAddress?.city || '').toLowerCase();
            const state = (listing.propertyAddress?.state || '').toLowerCase();
            const neighborhood = (listing.propertyAddress?.neighborhood || '').toLowerCase();
            const title = (listing.title || '').toLowerCase();
            const portal = (listing.sourcePortal || '').toLowerCase();

            if (query.includes('zillow') && portal === 'zillow') {
              // Matches zillow
            } else if (query.includes('redfin') && portal === 'redfin') {
              // Matches redfin
            } else if (query.includes('apartments') && portal.includes('apartments')) {
              // Matches apartments
            } else {
              const directMatch = street.includes(query) || city.includes(query) || state.includes(query) || neighborhood.includes(query) || title.includes(query) || portal.includes(query);
              if (!directMatch) {
                const stopWords = new Set([
                  'house', 'home', 'homes', 'under', 'below', 'for', 'sale', 'rent', 'rental', 'rentals',
                  'near', 'with', 'and', 'the', 'from', 'other', 'website', 'websites', 'using', 'scraper',
                  'crawling', 'take', 'all', 'scanned', 'scan', 'now', 'bed', 'beds', 'bedroom', 'bedrooms',
                  'bath', 'baths', 'bathroom', 'bathrooms', 'bhk', 'rk', 'apartment', 'apartments', 'condo',
                  'condos', 'flat', 'flats', 'property', 'properties', 'in'
                ]);

                const tokens = query.split(/\s+/).filter(t => 
                  t.length >= 2 && !stopWords.has(t) && !/^\d+$/.test(t) && !/^\d+(?:bhk|rk|bed|br)$/i.test(t)
                );

                if (tokens.length > 0) {
                  const tokenMatch = tokens.some(t =>
                    city.includes(t) ||
                    neighborhood.includes(t) ||
                    street.includes(t) ||
                    state.includes(t) ||
                    portal.includes(t) ||
                    (listing.propertyTaxes?.countyName || '').toLowerCase().includes(t)
                  );
                  if (!tokenMatch) return false;
                }
              }
            }
          }
        }

        // 2. Listing Status (Buy / Rent)
        if (filters.listingStatus !== 'ALL' && listing.listingStatus !== filters.listingStatus) {
          return false;
        }

        // 3. Price Min & Max (Distinguish monthly rent vs purchase price)
        const rent = listing.financials?.inputs?.monthlyGrossRent || 0;
        const price = listing.financials?.inputs?.purchasePrice || 0;

        if (listing.listingStatus === 'FOR_RENT') {
          if (filters.priceMax < 10000) {
            if (rent < filters.priceMin || rent > filters.priceMax) return false;
          } else if (filters.priceMin > 0) {
            if (rent < filters.priceMin) return false;
          }
        } else {
          if (price < filters.priceMin) {
            return false;
          }
          if (filters.priceMax < 5000000 && price > filters.priceMax) {
            return false;
          }
        }

        // 4. Beds Min
        if (filters.bedsMin > 0 && (listing.specs?.beds || 0) < filters.bedsMin) {
          return false;
        }

        // 5. Baths Min
        if (filters.bathsMin > 0 && (listing.specs?.baths || 0) < filters.bathsMin) {
          return false;
        }

        // 6. Property Type
        if (filters.propertyType !== 'ALL' && (listing.specs?.propertyType || 'CONDO') !== filters.propertyType) {
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
        if (filters.maxPropertyTaxesUSD < 50000 && (listing.propertyTaxes?.annualAmountUSD || 0) > filters.maxPropertyTaxesUSD) {
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
          const priceA = a.financials?.inputs?.purchasePrice || 0;
          const priceB = b.financials?.inputs?.purchasePrice || 0;
          return priceA - priceB;
        }
        if (sortBy === 'PRICE_DESC') {
          const priceA = a.financials?.inputs?.purchasePrice || 0;
          const priceB = b.financials?.inputs?.purchasePrice || 0;
          return priceB - priceA;
        }
        if (sortBy === 'SQFT_DESC') {
          const sqftA = a.specs?.finishedSqFt || 0;
          const sqftB = b.specs?.finishedSqFt || 0;
          return sqftB - sqftA;
        }
        if (sortBy === 'CAPRATE_DESC') {
          const capA = a.financials?.outputs?.capRatePercent || 0;
          const capB = b.financials?.outputs?.capRatePercent || 0;
          return capB - capA;
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
    <div className="relative min-h-screen w-full bg-[#050508] text-white overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950 font-sans">
      
      {/* 1. Active Theory Three.js Cosmic Particle Nebula & Holographic Gyro Ring */}
      <ActiveTheoryParticleCanvas interactive={true} />

      {/* 2. Master HUD Navigation (Top Bar, Left "What are you looking for?" Menu, Bottom Search Console) */}
      <ActiveTheoryHUD
        activeView={spatialViewMode}
        onViewChange={(mode) => {
          if (mode === 'database') {
            setIsDbModalOpen(true);
          } else {
            setSpatialViewMode(mode);
          }
        }}
        totalDbCount={totalDbCount}
        filteredCount={filteredListings.length}
        filters={filters}
        onFilterChange={setFilters}
        onTriggerLiveCrawl={handleTriggerLiveCrawl}
        isCrawling={isLiveCrawling}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onOpenExaModal={() => {}}
        hasExaKey={hasExaKey}
      />

      {/* 3. Main Centerpiece Workspace (Spatial 3D Cover Flow vs Map Matrix) */}
      <main className="relative z-10 w-full min-h-[calc(100vh-160px)] flex flex-col items-center justify-center pt-4 pb-28">
        
        {spatialViewMode === 'spatial' ? (
          /* FLAGSHIP ACTIVE THEORY 3D FLOATING CAROUSEL */
          <div className="w-full max-w-7xl mx-auto flex flex-col items-center animate-in fade-in duration-500">
            
            {/* Center Stage Floating Header */}
            <div className="text-center space-y-1 mb-2 select-none">
              <span className="text-[11px] font-mono tracking-widest text-cyan-400 font-bold uppercase flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>SPATIAL REAL ESTATE BROWSER // COVER FLOW</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                {filters.searchQuery || activeMetroPill} Residences ({filteredListings.length} Ingested)
              </h2>
            </div>

            {/* 3D Perspective Cover Flow Carousel */}
            <SpatialCardCarousel
              listings={filteredListings}
              onSelectListing={setSelectedListing}
              onOpenDetail={handleOpenProperty}
            />
          </div>
        ) : spatialViewMode === 'shrine' ? (
          /* ACTIVE THEORY IMMERSIVE 3D CYBERNETIC SHRINE VIEW */
          <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center space-y-4 animate-in fade-in duration-700 p-8 rounded-3xl bg-black/50 border border-amber-500/30 backdrop-blur-2xl shadow-2xl select-none">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 p-1 flex items-center justify-center shadow-lg shadow-amber-500/40 animate-pulse">
              <Sparkles className="w-8 h-8 text-slate-950" />
            </div>
            <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
              ACTIVE THEORY 3D SHRINE // 817 HOUSES IN ORBIT
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Immersive Spatial Chamber
            </h2>
            <p className="text-xs font-mono text-slate-300 max-w-md leading-relaxed">
              Explore the suspended golden gyro rig, living organic particle torus, and liquid caustic reflections with real-time mouse inertia.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSpatialViewMode('spatial')}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs font-mono tracking-wider uppercase shadow-lg shadow-cyan-500/25 hover:brightness-110 transition-all cursor-pointer"
              >
                BROWSE RESIDENCES (817)
              </button>
              <button
                onClick={() => setIsDbModalOpen(true)}
                className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs font-mono tracking-wider uppercase border border-white/20 transition-all cursor-pointer"
              >
                OPEN LOCAL DB
              </button>
            </div>
          </div>
        ) : (
          /* MAP MATRIX VIEW */
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center animate-in fade-in duration-500 space-y-4">
            <div className="w-full h-[540px] sm:h-[600px] relative rounded-3xl border-2 border-cyan-500/40 shadow-2xl overflow-hidden bg-slate-950/80 backdrop-blur-xl">
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

              {/* Scanning Overlay */}
              {isLiveCrawling && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-5 py-2 bg-black/90 text-cyan-300 rounded-full shadow-2xl border border-cyan-500/40 backdrop-blur-md">
                  <RotateCw className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span className="text-xs font-mono font-bold tracking-wide">
                    Live Scanning Portals for "{filters.searchQuery || 'Criteria'}"...
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* 4. Local SQLite Database Explorer Modal */}
      <DatabaseExplorerModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        listings={allListings}
        onSelectProperty={(listing) => {
          setSelectedListing(listing);
          setIsDbModalOpen(false);
          setSpatialViewMode('spatial');
        }}
        onTriggerSync={() => handleTriggerLiveCrawl(filters.searchQuery)}
        isSyncing={isLiveCrawling}
      />

      {/* Active Theory Minimalist Dark Status Bar & Footer */}
      <footer className="relative z-10 w-full bg-[#050508]/90 text-slate-400 border-t border-cyan-900/30 py-6 px-6 text-center text-xs backdrop-blur-md select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-cyan-400 tracking-widest uppercase font-bold text-xs">
              HOUSE INTELLIGENCE // ACTIVE THEORY SPATIAL
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">{allListings.length} Ingested Multi-Portal Homes</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-500">
            <span>Embedded SQLite WAL Engine</span>
            <span>•</span>
            <span>Zillow • Redfin • Realtor • Apartments.com</span>
            <span>•</span>
            <span>© 2026</span>
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
