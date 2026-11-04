'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyDetailModal } from '../components/property/PropertyDetailModal';
import { HouseRoiCalculatorModal } from '../components/property/HouseRoiCalculatorModal';
import { ModernPropertyGridCard } from '../components/property/ModernPropertyGridCard';
import { ScribbleMap } from '../components/map/ScribbleMap';
import { DatabaseExplorerModal } from '../components/spatial/DatabaseExplorerModal';
import { TiledHomeIcon } from '../components/common/TiledHomeIcon';
import { ShikaakPropertyListing, FilterState, GeoCoordinate } from '../types/property';
import { formatCurrency } from '../lib/roi-engine';
import { getExaApiKey } from '../lib/crawler/exa-client';
import LIVE_CRAWLED_DATA from '../data/live-crawled-portals.json';
import { CHICAGO_LISTINGS } from '../data/chicago-listings';
import { 
  Search, 
  MapPin, 
  Building, 
  ShieldCheck, 
  DollarSign, 
  ExternalLink, 
  Download, 
  LayoutGrid, 
  Map as MapIcon, 
  Database, 
  ArrowUpDown, 
  RotateCw, 
  X, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Bed,
  Check
} from 'lucide-react';

const INITIAL_REAL_LISTINGS: ShikaakPropertyListing[] = (() => {
  const crawled = LIVE_CRAWLED_DATA as unknown as ShikaakPropertyListing[];
  const existingIds = new Set(crawled.map((p) => p.id));
  return [
    ...crawled,
    ...CHICAGO_LISTINGS.filter((p) => !existingIds.has(p.id)),
  ];
})();

const US_METRO_OPTIONS = [
  { name: 'All Metros', city: '' },
  { name: 'Chicago, IL', city: 'Chicago' },
  { name: 'San Francisco, CA', city: 'San Francisco' },
  { name: 'Seattle, WA', city: 'Seattle' },
  { name: 'Austin, TX', city: 'Austin' },
  { name: 'Miami, FL', city: 'Miami' },
  { name: 'Los Angeles, CA', city: 'Los Angeles' },
  { name: 'Dallas, TX', city: 'Dallas' },
  { name: 'Atlanta, GA', city: 'Atlanta' },
  { name: 'New York, NY', city: 'New York' },
  { name: 'Denver, CO', city: 'Denver' },
  { name: 'Boston, MA', city: 'Boston' },
  { name: 'Phoenix, AZ', city: 'Phoenix' },
];

export default function Home() {
  const router = useRouter();

  // 1. Core State
  const [allListings, setAllListings] = useState<ShikaakPropertyListing[]>(INITIAL_REAL_LISTINGS);
  const [selectedListing, setSelectedListing] = useState<ShikaakPropertyListing | null>(INITIAL_REAL_LISTINGS[0]);
  const [modalListing, setModalListing] = useState<ShikaakPropertyListing | null>(null);
  const [roiModalListing, setRoiModalListing] = useState<ShikaakPropertyListing | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [totalDbCount, setTotalDbCount] = useState(817);

  // 2. View Mode (Grid View, Split Map View, Local SQLite Database)
  const [viewMode, setViewMode] = useState<'grid' | 'split_map' | 'database'>('grid');

  // 3. Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPortal, setSelectedPortal] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'FOR_RENT' | 'FOR_SALE'>('ALL');
  const [selectedMetro, setSelectedMetro] = useState<string>('');
  const [selectedBedFilter, setSelectedBedFilter] = useState<number>(0);
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'SCORE_DESC' | 'PRICE_ASC' | 'PRICE_DESC' | 'SQFT_DESC' | 'CAPRATE_DESC'>('SCORE_DESC');

  // 4. Freehand Map Lasso
  const [isScribbleActive, setIsScribbleActive] = useState(false);
  const [scribblePolygon, setScribblePolygon] = useState<GeoCoordinate[] | null>(null);

  // 5. Pagination
  const [visibleCount, setVisibleCount] = useState(24);

  // Load all 817 properties from SQLite database on mount
  useEffect(() => {
    fetch('/api/database/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.totalProperties) setTotalDbCount(data.totalProperties);
      })
      .catch(() => {});

    fetch('/api/database/properties?limit=1000')
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

  // Filter listings across all criteria
  const filteredListings = useMemo(() => {
    return allListings
      .filter((listing) => {
        // Portal Filter
        if (selectedPortal !== 'ALL' && listing.sourcePortal !== selectedPortal) {
          return false;
        }

        // Status Filter (Rent vs Sale)
        if (selectedStatus !== 'ALL' && listing.listingStatus !== selectedStatus) {
          return false;
        }

        // Metro Filter
        if (selectedMetro) {
          const city = (listing.propertyAddress?.city || '').toLowerCase();
          if (!city.includes(selectedMetro.toLowerCase())) return false;
        }

        // Bedroom Filter
        if (selectedBedFilter > 0 && (listing.specs?.beds || 0) < selectedBedFilter) {
          return false;
        }

        // Price Filter
        const rent = listing.financials?.inputs?.monthlyGrossRent || 0;
        const price = listing.financials?.inputs?.purchasePrice || 0;

        if (selectedPriceFilter === 'RENT_UNDER_2500' && (listing.listingStatus !== 'FOR_RENT' || rent > 2500)) {
          return false;
        }
        if (selectedPriceFilter === 'RENT_UNDER_3500' && (listing.listingStatus !== 'FOR_RENT' || rent > 3500)) {
          return false;
        }
        if (selectedPriceFilter === 'BUY_UNDER_750K' && (listing.listingStatus !== 'FOR_SALE' || price > 750000)) {
          return false;
        }
        if (selectedPriceFilter === 'BUY_UNDER_1500K' && (listing.listingStatus !== 'FOR_SALE' || price > 1500000)) {
          return false;
        }
        if (selectedPriceFilter === 'BUY_OVER_1500K' && (listing.listingStatus !== 'FOR_SALE' || price <= 1500000)) {
          return false;
        }

        // Text Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const street = (listing.propertyAddress?.street || '').toLowerCase();
          const city = (listing.propertyAddress?.city || '').toLowerCase();
          const state = (listing.propertyAddress?.state || '').toLowerCase();
          const neighborhood = (listing.propertyAddress?.neighborhood || '').toLowerCase();
          const title = (listing.title || '').toLowerCase();
          const portal = (listing.sourcePortal || '').toLowerCase();
          const zip = (listing.propertyAddress?.zipCode || '').toLowerCase();

          const matches =
            street.includes(q) ||
            city.includes(q) ||
            state.includes(q) ||
            neighborhood.includes(q) ||
            title.includes(q) ||
            portal.includes(q) ||
            zip.includes(q);

          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'SCORE_DESC') {
          const scoreA = a.financials?.outputs?.passFlowScore || 0;
          const scoreB = b.financials?.outputs?.passFlowScore || 0;
          return scoreB - scoreA;
        }
        if (sortBy === 'PRICE_ASC') {
          const priceA = a.listingStatus === 'FOR_RENT' ? a.financials?.inputs?.monthlyGrossRent || 0 : a.financials?.inputs?.purchasePrice || 0;
          const priceB = b.listingStatus === 'FOR_RENT' ? b.financials?.inputs?.monthlyGrossRent || 0 : b.financials?.inputs?.purchasePrice || 0;
          return priceA - priceB;
        }
        if (sortBy === 'PRICE_DESC') {
          const priceA = a.listingStatus === 'FOR_RENT' ? a.financials?.inputs?.monthlyGrossRent || 0 : a.financials?.inputs?.purchasePrice || 0;
          const priceB = b.listingStatus === 'FOR_RENT' ? b.financials?.inputs?.monthlyGrossRent || 0 : b.financials?.inputs?.purchasePrice || 0;
          return priceB - priceA;
        }
        if (sortBy === 'SQFT_DESC') {
          const sqftA = a.specs?.finishedSqFt || a.specs?.squareFeet || 0;
          const sqftB = b.specs?.finishedSqFt || b.specs?.squareFeet || 0;
          return sqftB - sqftA;
        }
        if (sortBy === 'CAPRATE_DESC') {
          const capA = a.financials?.outputs?.capRatePercent || 0;
          const capB = b.financials?.outputs?.capRatePercent || 0;
          return capB - capA;
        }
        return 0;
      });
  }, [allListings, selectedPortal, selectedStatus, selectedMetro, selectedBedFilter, selectedPriceFilter, searchQuery, sortBy]);

  // Aggregate stats of filtered set
  const stats = useMemo(() => {
    const total = filteredListings.length;
    if (total === 0) return { avgPrice: 0, avgRent: 0, avgCapRate: 0 };
    const sumPrice = filteredListings.reduce((acc, p) => acc + (p.financials?.inputs?.purchasePrice || 0), 0);
    const sumRent = filteredListings.reduce((acc, p) => acc + (p.financials?.inputs?.monthlyGrossRent || 0), 0);
    const sumCap = filteredListings.reduce((acc, p) => acc + (p.financials?.outputs?.capRatePercent || 0), 0);
    return {
      avgPrice: Math.round(sumPrice / total),
      avgRent: Math.round(sumRent / total),
      avgCapRate: +(sumCap / total).toFixed(2),
    };
  }, [filteredListings]);

  const displayedListings = filteredListings.slice(0, visibleCount);

  const handleOpenProperty = (listing: ShikaakPropertyListing) => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/rental-platform-')) {
      window.location.href = `/rental-platform-/property/${listing.id}/`;
    } else {
      router.push(`/property/${listing.id}/`);
    }
  };

  const PORTAL_TABS = [
    { id: 'ALL', label: 'All Portals' },
    { id: 'ZILLOW', label: 'Zillow (275)' },
    { id: 'REDFIN', label: 'Redfin (136)' },
    { id: 'REALTOR', label: 'Realtor (133)' },
    { id: 'APARTMENTS_COM', label: 'Apartments.com (119)' },
    { id: 'TRULIA', label: 'Trulia (116)' },
  ];

  return (
    <div className="min-h-screen w-full bg-[#080b11] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* 1. Sleek Modern Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#0c1019]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 select-none">
        <div className="max-w-[1780px] mx-auto flex items-center justify-between gap-4">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center p-1.5 text-cyan-400 shadow-sm">
              <TiledHomeIcon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white uppercase">
                  HOUSE INTELLIGENCE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-bold">
                  SQLITE 817
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Multi-Portal Rental & Housing Intelligence Engine
              </p>
            </div>
          </div>

          {/* Center Telemetry Strip */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <Building className="w-3.5 h-3.5 text-cyan-400" />
              <span>{filteredListings.length} Residences Matching</span>
            </div>
            {selectedStatus !== 'FOR_SALE' && stats.avgRent > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Avg Rent: {formatCurrency(stats.avgRent)}/mo</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Cap Rate: {stats.avgCapRate}%</span>
            </div>
          </div>

          {/* Right Controls: View Switcher & Database / Export */}
          <div className="flex items-center gap-2.5">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Spacious Responsive Card Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>

              <button
                onClick={() => setViewMode('split_map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'split_map'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Split Interactive Map & List"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split Map</span>
              </button>

              <button
                onClick={() => setIsDbModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Open SQLite Database Explorer & SQL Studio"
              >
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Local DB (817)</span>
              </button>
            </div>

            {/* Direct 1-Click CSV Export */}
            <a
              href="/api/database/export?format=csv"
              download="houses_database.csv"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer"
              title="Download all 817 records as CSV"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>CSV</span>
            </a>
          </div>

        </div>
      </header>

      {/* 2. Full-Width Filter & Search Control Center */}
      <section className="w-full bg-[#0a0d15] border-b border-slate-800/80 px-4 sm:px-8 py-4">
        <div className="max-w-[1780px] mx-auto space-y-3.5">
          
          {/* Main Search Row */}
          <div className="flex flex-col lg:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 817 residences by address, neighborhood, city, portal (Zillow, Redfin, etc.)..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#0f1420] border border-slate-800 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Selector Pills (Rent vs Sale) */}
            <div className="flex items-center p-1 rounded-xl bg-[#0f1420] border border-slate-800 shrink-0 w-full lg:w-auto">
              <button
                onClick={() => setSelectedStatus('ALL')}
                className={`flex-1 lg:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All (817)
              </button>
              <button
                onClick={() => setSelectedStatus('FOR_RENT')}
                className={`flex-1 lg:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === 'FOR_RENT'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                For Rent (417)
              </button>
              <button
                onClick={() => setSelectedStatus('FOR_SALE')}
                className={`flex-1 lg:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === 'FOR_SALE'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                For Sale (400)
              </button>
            </div>

            {/* Beds Filter */}
            <div className="flex items-center p-1 rounded-xl bg-[#0f1420] border border-slate-800 shrink-0">
              <span className="text-[11px] font-mono font-bold text-slate-400 px-2 uppercase">Beds:</span>
              {[0, 2, 3, 4].map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBedFilter(b)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedBedFilter === b
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {b === 0 ? 'Any' : `${b}+`}
                </button>
              ))}
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0f1420] border border-slate-800 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-mono text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="SCORE_DESC" className="bg-slate-900">Highest Pass/Flow Score</option>
                <option value="PRICE_ASC" className="bg-slate-900">Price: Low to High</option>
                <option value="PRICE_DESC" className="bg-slate-900">Price: High to Low</option>
                <option value="CAPRATE_DESC" className="bg-slate-900">Cap Rate: High to Low</option>
                <option value="SQFT_DESC" className="bg-slate-900">Largest Interior SqFt</option>
              </select>
            </div>
          </div>

          {/* Second Row: Portals Strip & US Metros Strip */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
            {/* Portal Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 mr-1 shrink-0">
                PORTAL:
              </span>
              {PORTAL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedPortal(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedPortal === tab.id
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-[#0f1420] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Metros Quick Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 mr-1 shrink-0">
                METRO:
              </span>
              {US_METRO_OPTIONS.map((m) => (
                <button
                  key={m.name}
                  onClick={() => setSelectedMetro(m.city)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                    selectedMetro === m.city
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-[#0f1420] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {m.name.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 3. Main Content Workspace: High-Efficiency Grid vs Split Map */}
      <main className="w-full max-w-[1780px] mx-auto px-4 sm:px-8 py-8 min-h-[calc(100vh-220px)]">
        
        {viewMode === 'grid' ? (
          /* HIGH-EFFICIENCY 4-COLUMN RESPONSIVE PROPERTY GRID (USES FULL SPACE) */
          <div className="space-y-6">
            
            {/* Grid Header Info */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                  {selectedMetro || 'All US Metros'} Residences
                  <span className="text-sm font-normal text-slate-400 font-mono ml-2.5">
                    ({filteredListings.length} Ingested in Local SQLite)
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Verified live data from Zillow, Redfin, Realtor.com, Apartments.com & Trulia
                </p>
              </div>

              {filteredListings.length > 0 && (
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  Showing 1 - {Math.min(visibleCount, filteredListings.length)} of {filteredListings.length}
                </span>
              )}
            </div>

            {/* 4-Column Modern Property Grid */}
            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedListings.map((listing) => (
                  <ModernPropertyGridCard
                    key={listing.id}
                    listing={listing}
                    onSelect={setSelectedListing}
                    onOpenDetail={handleOpenProperty}
                    onOpenRoiCalculator={setRoiModalListing}
                  />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center space-y-3 bg-[#0e131f] rounded-2xl border border-slate-800 p-8">
                <Building className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-white">No residences match your current criteria</h3>
                <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
                  Try clearing the search query or switching portals to explore all 817 ingested properties.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedPortal('ALL');
                    setSelectedStatus('ALL');
                    setSelectedMetro('');
                    setSelectedBedFilter(0);
                    setSelectedPriceFilter('ALL');
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Pagination Button: Load More */}
            {filteredListings.length > visibleCount && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 24)}
                  className="px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  <span>Load More Residences ({filteredListings.length - visibleCount} Remaining)</span>
                  <ChevronRight className="w-4 h-4 text-cyan-400" />
                </button>
              </div>
            )}

          </div>
        ) : (
          /* SPLIT MAP VIEW: MAP ON LEFT, RESIDENCES ON RIGHT */
          <div className="w-full flex flex-col lg:flex-row gap-6 h-[780px]">
            {/* Map Container */}
            <div className="w-full lg:w-7/12 h-[380px] lg:h-full rounded-2xl border border-slate-800 overflow-hidden shadow-xl bg-slate-950">
              <ScribbleMap
                listings={filteredListings}
                selectedListing={selectedListing}
                onSelectListing={setSelectedListing}
                isScribbleActive={isScribbleActive}
                onScribbleComplete={(polygon) => {
                  setScribblePolygon(polygon);
                  setIsScribbleActive(false);
                }}
                scribblePolygon={scribblePolygon}
                onClearScribble={() => {
                  setScribblePolygon(null);
                  setIsScribbleActive(false);
                }}
                onOpenFullDetail={handleOpenProperty}
              />
            </div>

            {/* Scrollable Cards Column */}
            <div className="w-full lg:w-5/12 h-full overflow-y-auto pr-1 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-mono font-bold uppercase text-slate-300">
                  {filteredListings.length} Mapped Residences
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  Click any pin or card to inspect
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {filteredListings.slice(0, 40).map((listing) => (
                  <ModernPropertyGridCard
                    key={listing.id}
                    listing={listing}
                    onSelect={setSelectedListing}
                    onOpenDetail={handleOpenProperty}
                    onOpenRoiCalculator={setRoiModalListing}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 4. Clean Professional Footer */}
      <footer className="w-full bg-[#0a0d15] text-slate-400 border-t border-slate-800 py-6 px-6 text-center text-xs select-none">
        <div className="max-w-[1780px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-white font-bold tracking-wider uppercase">
              HOUSE INTELLIGENCE PLATFORM
            </span>
            <span className="text-slate-600">|</span>
            <span>817 Multi-Portal Verified Residences Stored in SQLite</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <span>SQLite WAL Engine</span>
            <span>•</span>
            <span>Zillow (275) • Redfin (136) • Realtor (133) • Apartments.com (119)</span>
            <span>•</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>

      {/* Database Explorer & SQL Studio Modal */}
      <DatabaseExplorerModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        listings={allListings}
        onSelectProperty={(listing) => {
          setSelectedListing(listing);
          setIsDbModalOpen(false);
        }}
      />

      {/* Interactive Custom ROI Calculator Modal for Any House */}
      {roiModalListing && (
        <HouseRoiCalculatorModal
          isOpen={!!roiModalListing}
          onClose={() => setRoiModalListing(null)}
          listing={roiModalListing}
        />
      )}

      {/* Comprehensive Property Detail Deep-Dive Modal */}
      {modalListing && (
        <PropertyDetailModal
          listing={modalListing}
          onClose={() => setModalListing(null)}
        />
      )}
    </div>
  );
}
