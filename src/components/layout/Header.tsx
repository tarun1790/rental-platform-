'use client';

import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  ChevronDown, 
  SlidersHorizontal, 
  Compass, 
  DollarSign, 
  Bed, 
  Layers, 
  Sparkles, 
  X, 
  Check, 
  Globe, 
  Mic, 
  ArrowUpDown,
  Filter,
  ShieldCheck,
  TreePine,
  Bot,
  Zap,
  ExternalLink
} from 'lucide-react';
import { FilterState, ListingStatus, PropertyType } from '../../types/property';
import { SupportedLanguageCode } from '../../types/intelligence';
import { SUPPORTED_LANGUAGES } from '../../lib/speech-translation';
import { TiledHomeIcon } from '../common/TiledHomeIcon';
import { parseNlpQuery } from '../../lib/nlp-search-parser';
import { testExaApiKey } from '../../lib/crawler/exa-client';

interface HeaderProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  listingCount: number;
  totalCount: number;
  isScribbleActive: boolean;
  onToggleScribble: () => void;
  onClearScribble: () => void;
  hasScribbleBoundary: boolean;
  activeView: 'split' | 'map' | 'list';
  onViewChange: (view: 'split' | 'map' | 'list') => void;
  sortBy: string;
  onSortChange: (sort: any) => void;
  onScrollToTop?: () => void;
  onOpenVoiceAssistant?: () => void;
  onOpenNlpDialog?: () => void;
  currentLanguage?: SupportedLanguageCode;
  onLanguageChange?: (lang: SupportedLanguageCode) => void;
  onTriggerLiveCrawl?: (query?: string, exaApiKey?: string) => void;
  isCrawling?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  filters,
  onFilterChange,
  listingCount,
  totalCount,
  isScribbleActive,
  onToggleScribble,
  onClearScribble,
  hasScribbleBoundary,
  activeView,
  onViewChange,
  sortBy,
  onSortChange,
  onScrollToTop,
  onOpenVoiceAssistant,
  onOpenNlpDialog,
  currentLanguage = 'en',
  onLanguageChange,
  onTriggerLiveCrawl,
  isCrawling = false,
}) => {
  // Dropdown Popover States
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showMoreModal, setShowMoreModal] = useState(false);

  // Exa.ai Live Neural Crawler Modal & Key States
  const [showExaModal, setShowExaModal] = useState(false);
  const [exaKeyInput, setExaKeyInput] = useState('');
  const [hasExaKey, setHasExaKey] = useState(false);
  const [testingExa, setTestingExa] = useState(false);
  const [exaTestStatus, setExaTestStatus] = useState<{ valid?: boolean; message?: string } | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('EXA_API_KEY');
      if (stored && stored.trim()) {
        setHasExaKey(true);
        setExaKeyInput(stored.trim());
      }
    }
  }, []);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const closeDropdowns = () => setOpenDropdown(null);

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-red-100 shadow-sm select-none">
      
      {/* 9-ITEM CLEAN HORIZONTAL FILTER BAR (STRICTLY WHITE & RED) */}
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* 1. BRAND LOGO (WHITE & RED TILED HOME) */}
          <div 
            onClick={onScrollToTop}
            className="flex items-center gap-2.5 cursor-pointer shrink-0 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 group-hover:border-red-400 flex items-center justify-center transition-all p-1">
              <TiledHomeIcon size={30} />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-wide text-red-500 font-sans hidden sm:inline">
              HOUSE INTELLIGENCE
            </span>
          </div>

          {/* 2. LOCATION & NLP SEARCH INPUT */}
          <div className="relative flex-1 max-w-xs md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
            <input
              type="text"
              placeholder="Search US, Chicago, Dallas, under 400k, 3 bed..."
              value={filters.searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                if (/(under|below|max|budget|\$|\d+k|beds?|bath)/i.test(val)) {
                  const parsed = parseNlpQuery(val);
                  const nextFilters = { ...filters, searchQuery: val };
                  if (parsed.priceRange?.maxPrice) {
                    nextFilters.priceMax = parsed.priceRange.maxPrice;
                  }
                  if (parsed.priceRange?.minPrice) {
                    nextFilters.priceMin = parsed.priceRange.minPrice;
                  }
                  if (parsed.beds !== undefined) {
                    nextFilters.bedsMin = parsed.beds;
                  }
                  onFilterChange(nextFilters);
                } else {
                  onFilterChange({ ...filters, searchQuery: val });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onTriggerLiveCrawl?.(filters.searchQuery, exaKeyInput.trim() || undefined);
                }
              }}
              className="w-full pl-9 pr-24 py-2 text-xs bg-red-50/40 border border-red-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-medium"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {filters.searchQuery && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filters, searchQuery: '', priceMax: 5000000, priceMin: 0, bedsMin: 0 })}
                  className="text-red-400 hover:text-red-600 p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onTriggerLiveCrawl?.(filters.searchQuery, exaKeyInput.trim() || undefined)}
                disabled={isCrawling}
                title="Press Enter or click to crawl live rental portals in real time"
                className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                <span>{isCrawling ? '...' : 'Crawl'}</span>
                <span className="hidden sm:inline opacity-80 font-mono text-[9px]">↵</span>
              </button>
            </div>
          </div>

          {/* 2.5. PROPERTY DECISION CONCIERGE TRIGGER (VOICE & NLP) */}
          {(onOpenNlpDialog || onOpenVoiceAssistant) && (
            <button
              onClick={onOpenNlpDialog || onOpenVoiceAssistant}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all shrink-0 cursor-pointer"
              title="Open AI Property Advisor Chat (Conversational Needs & Specification Intelligence)"
            >
              <Bot className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">AI Property Chat</span>
              <span className="sm:hidden">Chat</span>
            </button>
          )}

          {/* 2.6. EXA.AI LIVE NEURAL CRAWLER TRIGGER */}
          <button
            onClick={() => setShowExaModal(true)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all shrink-0 cursor-pointer ${
              hasExaKey
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-sm'
                : 'bg-white text-slate-700 border-red-200 hover:border-red-400 hover:bg-red-50/50'
            }`}
            title="Configure Exa.ai Neural Search to crawl live listings from Zillow, Redfin, Realtor.com"
          >
            <Zap className={`w-3.5 h-3.5 ${hasExaKey ? 'text-emerald-600' : 'text-red-500'}`} />
            <span className="hidden sm:inline">{hasExaKey ? 'Exa.ai Active' : 'Exa.ai Live Search'}</span>
            <span className="sm:hidden">Exa</span>
            {hasExaKey && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
          </button>

          {/* 3. STATUS (FOR SALE / FOR RENT) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => toggleDropdown('status')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                openDropdown === 'status'
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-white text-slate-800 border-red-200 hover:border-red-400 hover:bg-red-50/50'
              }`}
            >
              <span>{filters.listingStatus === 'FOR_SALE' ? 'For Sale' : filters.listingStatus === 'FOR_RENT' ? 'For Rent' : 'Buy & Rent'}</span>
              <ChevronDown className="w-3 h-3 text-red-500" />
            </button>

            {openDropdown === 'status' && (
              <div className="absolute left-0 mt-2 w-36 bg-white border border-red-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in space-y-1">
                {(['FOR_SALE', 'FOR_RENT', 'ALL'] as ListingStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      onFilterChange({ ...filters, listingStatus: st });
                      closeDropdowns();
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-xl font-bold flex items-center justify-between ${
                      filters.listingStatus === st ? 'bg-red-50 text-red-600' : 'text-slate-700 hover:bg-red-50/60'
                    }`}
                  >
                    <span>{st === 'FOR_SALE' ? 'For Sale' : st === 'FOR_RENT' ? 'For Rent' : 'All Listings'}</span>
                    {filters.listingStatus === st && <Check className="w-3.5 h-3.5 text-red-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. PRICE RANGE POPOVER */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => toggleDropdown('price')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                openDropdown === 'price' || filters.priceMin > 0 || filters.priceMax < 5000000
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-white text-slate-800 border-red-200 hover:border-red-400 hover:bg-red-50/50'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>
                {filters.priceMin > 0 || filters.priceMax < 5000000
                  ? `$${(filters.priceMin / 1000).toFixed(0)}k - $${(filters.priceMax / 1000).toFixed(0)}k`
                  : 'Price Range'}
              </span>
              <ChevronDown className="w-3 h-3 text-red-500" />
            </button>

            {openDropdown === 'price' && (
              <div className="absolute left-0 mt-2 w-72 bg-white border border-red-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-900 border-b border-red-100 pb-2">
                  <span className="text-red-600 font-black">Price Range (USD)</span>
                  <button
                    onClick={() => onFilterChange({ ...filters, priceMin: 0, priceMax: 5000000 })}
                    className="text-[11px] text-red-600 font-bold hover:underline"
                  >
                    Reset
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Minimum</label>
                    <select
                      value={filters.priceMin}
                      onChange={(e) => onFilterChange({ ...filters, priceMin: Number(e.target.value) })}
                      className="w-full text-xs p-2 bg-red-50/40 border border-red-200 rounded-xl font-medium"
                    >
                      <option value="0">$0</option>
                      <option value="200000">$200,000</option>
                      <option value="300000">$300,000</option>
                      <option value="400000">$400,000</option>
                      <option value="600000">$600,000</option>
                      <option value="800000">$800,000</option>
                      <option value="1000000">$1,000,000</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Maximum</label>
                    <select
                      value={filters.priceMax}
                      onChange={(e) => onFilterChange({ ...filters, priceMax: Number(e.target.value) })}
                      className="w-full text-xs p-2 bg-red-50/40 border border-red-200 rounded-xl font-medium"
                    >
                      <option value="5000000">Any Max</option>
                      <option value="300000">$300,000</option>
                      <option value="400000">$400,000</option>
                      <option value="500000">$500,000</option>
                      <option value="700000">$700,000</option>
                      <option value="900000">$900,000</option>
                      <option value="1200000">$1,200,000</option>
                      <option value="2000000">$2,000,000</option>
                    </select>
                  </div>
                </div>

                {/* Instant Crawl Action */}
                <button
                  type="button"
                  onClick={() => {
                    closeDropdowns();
                    onTriggerLiveCrawl?.();
                  }}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Apply & Crawl Live Portals (Enter ↵)</span>
                </button>
              </div>
            )}
          </div>

          {/* 5. BEDS & BATHS SELECTOR */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => toggleDropdown('beds')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                openDropdown === 'beds' || filters.bedsMin > 0 || filters.bathsMin > 0
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-white text-slate-800 border-red-200 hover:border-red-400 hover:bg-red-50/50'
              }`}
            >
              <Bed className="w-3.5 h-3.5" />
              <span>
                {filters.bedsMin > 0 ? `${filters.bedsMin}+ Beds` : 'Beds & Baths'}
              </span>
              <ChevronDown className="w-3 h-3 text-red-500" />
            </button>

            {openDropdown === 'beds' && (
              <div className="absolute left-0 mt-2 w-64 bg-white border border-red-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-red-600 block mb-1.5">Bedrooms</span>
                  <div className="flex bg-red-50 p-1 rounded-xl gap-1">
                    {[0, 1, 2, 3, 4].map((b) => (
                      <button
                        key={b}
                        onClick={() => onFilterChange({ ...filters, bedsMin: b })}
                        className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                          filters.bedsMin === b ? 'bg-red-600 text-white shadow-sm' : 'text-slate-700 hover:text-red-600'
                        }`}
                      >
                        {b === 0 ? 'Any' : `${b}+`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-red-600 block mb-1.5">Bathrooms</span>
                  <div className="flex bg-red-50 p-1 rounded-xl gap-1">
                    {[0, 1, 2, 3].map((ba) => (
                      <button
                        key={ba}
                        onClick={() => onFilterChange({ ...filters, bathsMin: ba })}
                        className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                          filters.bathsMin === ba ? 'bg-red-600 text-white shadow-sm' : 'text-slate-700 hover:text-red-600'
                        }`}
                      >
                        {ba === 0 ? 'Any' : `${ba}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instant Crawl Action */}
                <button
                  type="button"
                  onClick={() => {
                    closeDropdowns();
                    onTriggerLiveCrawl?.();
                  }}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Apply & Crawl Live Portals (Enter ↵)</span>
                </button>
              </div>
            )}
          </div>

          {/* 6. HOME TYPE SELECTOR */}
          <div className="relative hidden xl:block">
            <button
              onClick={() => toggleDropdown('type')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                openDropdown === 'type' || filters.propertyType !== 'ALL'
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-white text-slate-800 border-red-200 hover:border-red-400 hover:bg-red-50/50'
              }`}
            >
              <span>{filters.propertyType === 'ALL' ? 'Home Type' : filters.propertyType.replace(/_/g, ' ')}</span>
              <ChevronDown className="w-3 h-3 text-red-500" />
            </button>

            {openDropdown === 'type' && (
              <div className="absolute left-0 mt-2 w-52 bg-white border border-red-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in space-y-1">
                {(['ALL', 'SINGLE_FAMILY', 'CONDO', 'TOWNHOUSE', 'LOFT'] as PropertyType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      onFilterChange({ ...filters, propertyType: t });
                      closeDropdowns();
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-xl font-bold flex items-center justify-between ${
                      filters.propertyType === t ? 'bg-red-50 text-red-600' : 'text-slate-700 hover:bg-red-50/60'
                    }`}
                  >
                    <span>{t === 'ALL' ? 'All Home Types' : t.replace(/_/g, ' ')}</span>
                    {filters.propertyType === t && <Check className="w-3.5 h-3.5 text-red-600" />}
                  </button>
                ))}

                {/* Instant Crawl Action */}
                <div className="pt-1 border-t border-red-100">
                  <button
                    type="button"
                    onClick={() => {
                      closeDropdowns();
                      onTriggerLiveCrawl?.();
                    }}
                    className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Crawl Live Portals (Enter ↵)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 7. MORE / ADVANCED MODAL BUTTON */}
          <button
            onClick={() => setShowMoreModal(!showMoreModal)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white text-slate-800 border border-red-200 hover:border-red-400 hover:bg-red-50/50 transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">More Filters</span>
          </button>

          {/* 7.5. INSTANT LIVE CRAWL BUTTON FOR CURRENT FILTERS */}
          <button
            onClick={() => onTriggerLiveCrawl?.()}
            disabled={isCrawling}
            title="Scan & Ingest Active Live Listings from Other Rental Websites for Current Filters"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:bg-slate-300 text-white shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Globe className={`w-3.5 h-3.5 ${isCrawling ? 'animate-spin' : 'animate-pulse'}`} />
            <span className="hidden md:inline">{isCrawling ? 'Crawling Portals...' : 'Crawl Live Portals'}</span>
            <span className="md:hidden">{isCrawling ? '...' : 'Crawl'}</span>
          </button>

          {/* 8. DRAW / SCRIBBLE BOUNDARY BUTTON (RED & WHITE) */}
          <button
            onClick={onToggleScribble}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              isScribbleActive
                ? 'bg-red-600 text-white'
                : hasScribbleBoundary
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
            title="Draw freehand boundary on map to scan houses"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{isScribbleActive ? 'Drawing...' : hasScribbleBoundary ? 'Boundary Active' : '✏️ Draw Boundary'}</span>
          </button>

          {hasScribbleBoundary && (
            <button
              onClick={onClearScribble}
              className="px-2.5 py-1.5 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
            >
              Clear
            </button>
          )}

          {/* 9. VIEW & SORT SWITCHER (WHITE & RED) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Switcher */}
            <div className="hidden sm:flex items-center bg-red-50 p-1 rounded-xl border border-red-200">
              <button
                onClick={() => onViewChange('split')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeView === 'split' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-700 hover:text-red-600'
                }`}
              >
                Split
              </button>
              <button
                onClick={() => onViewChange('map')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeView === 'map' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-700 hover:text-red-600'
                }`}
              >
                Map
              </button>
              <button
                onClick={() => onViewChange('list')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeView === 'list' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-700 hover:text-red-600'
                }`}
              >
                List
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-xs font-bold bg-white border border-red-200 rounded-xl p-2 text-slate-800 focus:ring-1 focus:ring-red-500 cursor-pointer hidden md:block"
            >
              <option value="SCORE_DESC">Pass/Flow Score (High to Low)</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
              <option value="SQFT_DESC">Largest Finished Area</option>
              <option value="CAPRATE_DESC">Highest Cap Rate (%)</option>
            </select>
          </div>
        </div>

        {/* MORE FILTERS EXPANDED MODAL (WHITE & RED) */}
        {showMoreModal && (
          <div className="py-4 border-t border-red-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-red-50/50 p-4 rounded-2xl mb-3 animate-in fade-in border border-red-200">
            {/* Min Pass Flow Score */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Min Pass/Flow Grade (Score 1.0 - 5.0)
              </label>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.1"
                value={filters.minPassFlowScore}
                onChange={(e) => onFilterChange({ ...filters, minPassFlowScore: Number(e.target.value) })}
                className="w-full accent-red-600"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                <span>1.0</span>
                <span className="font-bold text-red-600">{filters.minPassFlowScore.toFixed(1)} / 5.0 Score</span>
                <span>5.0</span>
              </div>
            </div>

            {/* Min Cap Rate Return */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Minimum Cap Rate (% Return)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={filters.minCapRatePercent || 0}
                onChange={(e) => onFilterChange({ ...filters, minCapRatePercent: Number(e.target.value) })}
                className="w-full accent-red-600"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                <span>0%</span>
                <span className="font-bold text-red-600">{((filters.minCapRatePercent || 0)).toFixed(1)}% Cap Rate</span>
                <span>10%</span>
              </div>
            </div>

            {/* Max Annual Property Taxes */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Max Annual Property Taxes ($/yr)
              </label>
              <select
                value={filters.maxPropertyTaxesUSD}
                onChange={(e) => onFilterChange({ ...filters, maxPropertyTaxesUSD: Number(e.target.value) })}
                className="w-full text-xs p-2 bg-white border border-red-200 rounded-xl"
              >
                <option value="50000">Any Taxes</option>
                <option value="12000">Under $12,000/yr</option>
                <option value="16000">Under $16,000/yr</option>
                <option value="20000">Under $20,000/yr</option>
              </select>
            </div>

            {/* Max Distance to Top School */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Max Distance to School (km)
              </label>
              <select
                value={filters.maxDistanceToSchoolKm}
                onChange={(e) => onFilterChange({ ...filters, maxDistanceToSchoolKm: Number(e.target.value) })}
                className="w-full text-xs p-2 bg-white border border-red-200 rounded-xl"
              >
                <option value="10">Any Distance</option>
                <option value="0.5">Within 0.5 km (Walkable)</option>
                <option value="1.0">Within 1.0 km</option>
                <option value="2.0">Within 2.0 km</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* EXA.AI LIVE NEURAL CRAWLER CONFIGURATION MODAL */}
      {showExaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-red-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-red-100 flex items-center justify-between bg-red-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/20">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Exa.ai Neural Search Ingestion</h3>
                  <p className="text-xs text-slate-500 font-medium">Crawl live properties directly from Zillow, Redfin, & Realtor</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowExaModal(false);
                  setExaTestStatus(null);
                }}
                className="w-8 h-8 rounded-full bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-2xl flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Connecting an <strong>Exa.ai API Key</strong> enables real-time neural web searches across <strong>zillow.com, redfin.com, realtor.com, apartments.com, and trulia.com</strong> based on your location and criteria.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800">
                    Exa.ai API Key:
                  </label>
                  <a
                    href="https://exa.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Get API key at exa.ai</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="e.g. exa-xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={exaKeyInput}
                  onChange={(e) => {
                    setExaKeyInput(e.target.value);
                    setExaTestStatus(null);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white font-mono text-xs transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Persists in browser localStorage or can be configured via <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">EXA_API_KEY</code> in environment.
                </p>
              </div>

              {exaTestStatus && (
                <div
                  className={`p-3 rounded-xl border flex items-start gap-2 ${
                    exaTestStatus.valid
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {exaTestStatus.valid ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-tight font-medium">{exaTestStatus.message}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.localStorage.removeItem('EXA_API_KEY');
                    }
                    setExaKeyInput('');
                    setHasExaKey(false);
                    setExaTestStatus({ valid: false, message: 'Exa API key cleared. Standard MLS & public records crawler active.' });
                  }}
                  disabled={!hasExaKey && !exaKeyInput}
                  className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 font-bold transition-all disabled:opacity-40 cursor-pointer"
                >
                  Clear Key
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={testingExa || !exaKeyInput.trim()}
                    onClick={async () => {
                      setTestingExa(true);
                      setExaTestStatus(null);
                      const res = await testExaApiKey(exaKeyInput.trim());
                      setTestingExa(false);
                      setExaTestStatus(res);
                      if (res.valid) {
                        if (typeof window !== 'undefined') {
                          window.localStorage.setItem('EXA_API_KEY', exaKeyInput.trim());
                        }
                        setHasExaKey(true);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {testingExa ? 'Testing...' : 'Test Connection'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = exaKeyInput.trim();
                      if (trimmed) {
                        if (typeof window !== 'undefined') {
                          window.localStorage.setItem('EXA_API_KEY', trimmed);
                        }
                        setHasExaKey(true);
                      }
                      setShowExaModal(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Save & Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
