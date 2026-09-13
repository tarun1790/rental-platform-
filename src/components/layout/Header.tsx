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
  MicOff,
  ArrowUpDown,
  Filter,
  ShieldCheck,
  TreePine,
  RotateCw,
  Scan,
  RotateCcw,
  Bot,
  Cpu
} from 'lucide-react';
import { FilterState, ListingStatus, PropertyType } from '../../types/property';
import { SupportedLanguageCode } from '../../types/intelligence';
import { SUPPORTED_LANGUAGES } from '../../lib/speech-translation';
import { TiledHomeIcon } from '../common/TiledHomeIcon';
import { parseNlpQuery } from '../../lib/nlp-search-parser';
import { ExaConnectModal } from '../crawler/ExaConnectModal';

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
  currentLanguage?: SupportedLanguageCode;
  onLanguageChange?: (lang: SupportedLanguageCode) => void;
  onTriggerLiveCrawl?: (query?: string, exaApiKey?: string, filterOverrides?: Partial<FilterState>) => void;
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
  currentLanguage = 'en',
  onLanguageChange,
  onTriggerLiveCrawl,
  isCrawling = false,
}) => {
  // Dropdown Popover States
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [showExaModal, setShowExaModal] = useState(false);
  const searchDebounceRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Voice speech recognition handler
  const handleToggleVoiceSearch = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        setIsListening(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setIsListening(false);
          const nextFilters = { ...filters, searchQuery: transcript };
          onFilterChange(nextFilters);
          onTriggerLiveCrawl?.(transcript, undefined, nextFilters);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
        return;
      } catch (e) {
        console.warn('Speech recognition fallback', e);
      }
    }

    // Fallback simulation if microphone hardware not available
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const voiceSample = '3 bed house in Denver under 800k near top schools';
      const nextFilters = { ...filters, searchQuery: voiceSample };
      onFilterChange(nextFilters);
      onTriggerLiveCrawl?.(voiceSample, undefined, nextFilters);
    }, 1500);
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const closeDropdowns = () => setOpenDropdown(null);

  const isRent = (filters.listingStatus as string) === 'FOR_RENT';
  const hasPriceFilter = filters.priceMin > 0 || (isRent ? filters.priceMax < 10000 : filters.priceMax < 5000000);
  const hasActiveFilters = 
    filters.searchQuery.trim().length > 0 ||
    filters.listingStatus !== 'ALL' ||
    hasPriceFilter ||
    filters.bedsMin > 0 ||
    filters.bathsMin > 0 ||
    filters.propertyType !== 'ALL' ||
    filters.minPassFlowScore > 1.0 ||
    ((filters.minCapRatePercent || 0) > 0) ||
    hasScribbleBoundary;

  const handleResetFilters = () => {
    if (hasScribbleBoundary) {
      onClearScribble();
    }
    const reset: FilterState = {
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
    };
    onFilterChange(reset);
    onTriggerLiveCrawl?.('', undefined, reset);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm select-none">
      
      {/* 1. TOP BRAND & TELEMETRY STATUS NAVBAR */}
      <div className="w-full px-4 sm:px-8 lg:px-12 border-b border-slate-100">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
          
          {/* Brand Logo & Title */}
          <div 
            onClick={onScrollToTop}
            className="flex items-center gap-3 cursor-pointer shrink-0 group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white border border-slate-200 group-hover:border-red-400 flex items-center justify-center transition-all p-1 shadow-sm">
              <TiledHomeIcon size={28} />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-tight text-red-600 font-sans leading-none">
                HOUSE INTELLIGENCE
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5 hidden sm:block">
                Institutional MLS & Underwriting Console
              </span>
            </div>
          </div>

          {/* Right Live Status Telemetry Indicator */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('agentic-workflow-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 text-red-900 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="View live autonomous multi-agent swarm workflow"
            >
              <Bot className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              <span className="hidden sm:inline">🤖 Agent Swarm (6 Active)</span>
              <span className="sm:hidden">🤖 Agents</span>
            </button>

            <button
              type="button"
              onClick={() => setShowExaModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Connect Exa.ai for real-time neural search across Zillow, Redfin, Realtor, Apartments.com & Trulia"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span className="hidden sm:inline">⚡ Exa.ai Neural Search</span>
              <span className="sm:hidden">⚡ Exa.ai</span>
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-900">{listingCount}</span>
              <span className="text-slate-500">Live Scanned Residences</span>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-all cursor-pointer"
                title="Reset all active search and filter constraints"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. DEDICATED SPACIOUS SEARCH COMMAND CENTER (UNCONGESTED & FREELY BREATHING) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 py-4 bg-slate-50/70 border-b border-slate-200/70">
        <div className="max-w-5xl mx-auto space-y-3">
          
          {/* A. GRAND WIDE SEARCH INPUT BOX */}
          <div className="relative flex items-center w-full bg-white rounded-2xl border-2 border-slate-200 hover:border-red-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100 shadow-sm transition-all duration-200 h-14 sm:h-16 px-3.5 sm:px-4 gap-2.5 sm:gap-3">
            
            {/* Search Icon & Voice Mic */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Search className="w-5 h-5 text-red-600 shrink-0" />
              <button
                type="button"
                onClick={handleToggleVoiceSearch}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isListening 
                    ? 'bg-red-600 text-white animate-pulse shadow-md' 
                    : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                }`}
                title={isListening ? 'Listening via microphone... speak criteria now' : 'Voice Search with Speech Recognition'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* Generous Freely Breathing Search Input */}
            <input
              type="text"
              placeholder={
                isListening 
                  ? '🎙️ Listening... speak criteria now (e.g. Austin 3 bed under 800k)' 
                  : 'Search any city, neighborhood, budget, or criteria (e.g. Austin 3 bed under 800k, Denver condo, Miami rentals)...'
              }
              value={filters.searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                const nextFilters = { ...filters, searchQuery: val };
                if (/(under|below|max|budget|\$|\d+k|beds?|bath|bhk|rk|rent)/i.test(val)) {
                  const parsed = parseNlpQuery(val);
                  if (parsed.priceRange?.maxPrice) {
                    nextFilters.priceMax = parsed.priceRange.maxPrice;
                  }
                  if (parsed.priceRange?.minPrice) {
                    nextFilters.priceMin = parsed.priceRange.minPrice;
                  }
                  if (parsed.beds !== undefined) {
                    nextFilters.bedsMin = parsed.beds;
                  }
                  if (parsed.listingStatus) {
                    nextFilters.listingStatus = parsed.listingStatus;
                  }
                  if (parsed.propertyType) {
                    nextFilters.propertyType = parsed.propertyType;
                  }
                }
                onFilterChange(nextFilters);

                // Auto-debounce live multi-portal crawl after 500ms of inactivity
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                if (val.trim().length >= 3) {
                  searchDebounceRef.current = setTimeout(() => {
                    onTriggerLiveCrawl?.(val, undefined, nextFilters);
                  }, 500);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                  onTriggerLiveCrawl?.(filters.searchQuery, undefined, filters);
                }
              }}
              className="flex-1 min-w-0 bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base font-medium focus:outline-none"
            />

            {/* Clear Button */}
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => {
                  if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                  const reset = { ...filters, searchQuery: '', priceMax: 5000000, priceMin: 0, bedsMin: 0 };
                  onFilterChange(reset);
                  onTriggerLiveCrawl?.('', undefined, reset);
                }}
                className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors shrink-0"
                title="Clear search text"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Exa.ai Neural Search Modal Trigger */}
            <button
              type="button"
              onClick={() => setShowExaModal(true)}
              title="Open Exa.ai Neural Real-Time Web Crawler"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 sm:py-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>⚡ Exa.ai</span>
            </button>

            {/* Prominent Scan Verified MLS Action Button */}
            <button
              type="button"
              onClick={() => {
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                onTriggerLiveCrawl?.(filters.searchQuery, undefined, filters);
              }}
              disabled={isCrawling}
              title="Execute verified MLS scan for this criteria"
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0"
            >
              {isCrawling ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <Scan className="w-4 h-4" />
              )}
              <span>{isCrawling ? 'Scanning...' : 'Scan MLS'}</span>
            </button>
          </div>

          {/* B. FREELY SPACED FILTER PILLS ROW */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Filter 1: Status (Buy vs Rent) */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('status')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                    openDropdown === 'status' || filters.listingStatus !== 'ALL'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-red-300 hover:bg-red-50/50'
                  }`}
                >
                  <span>{filters.listingStatus === 'FOR_SALE' ? 'For Sale' : filters.listingStatus === 'FOR_RENT' ? 'For Rent' : 'All Listings'}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>

                {openDropdown === 'status' && (
                  <div className="absolute left-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in space-y-1">
                    {(['FOR_SALE', 'FOR_RENT', 'ALL'] as ListingStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          const next = { 
                            ...filters, 
                            listingStatus: st,
                            priceMin: 0,
                            priceMax: st === 'FOR_RENT' ? 10000 : 5000000,
                          };
                          onFilterChange(next);
                          closeDropdowns();
                          onTriggerLiveCrawl?.(undefined, undefined, next);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-xl font-bold flex items-center justify-between cursor-pointer transition-colors ${
                          filters.listingStatus === st ? 'bg-red-50 text-red-600' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{st === 'FOR_SALE' ? 'For Sale' : st === 'FOR_RENT' ? 'For Rent' : 'All Listings'}</span>
                        {filters.listingStatus === st && <Check className="w-3.5 h-3.5 text-red-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter 2: Price Range */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('price')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                    openDropdown === 'price' || filters.priceMin > 0 || (filters.listingStatus === 'FOR_RENT' ? filters.priceMax < 10000 : filters.priceMax < 5000000)
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-red-300 hover:bg-red-50/50'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>
                    {filters.listingStatus === 'FOR_RENT'
                      ? (filters.priceMin > 0 || filters.priceMax < 10000
                          ? `$${filters.priceMin.toLocaleString()} - $${filters.priceMax.toLocaleString()}/mo`
                          : 'Price Range')
                      : (filters.priceMin > 0 || filters.priceMax < 5000000
                          ? `$${(filters.priceMin / 1000).toFixed(0)}k - $${(filters.priceMax / 1000).toFixed(0)}k`
                          : 'Price Range')}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>

                {openDropdown === 'price' && (
                  <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                      <span className="text-red-600 font-bold">
                        {filters.listingStatus === 'FOR_RENT' ? 'Monthly Rent ($/mo)' : 'Purchase Price ($)'}
                      </span>
                      <button
                        onClick={() => {
                          const next = { 
                            ...filters, 
                            priceMin: 0, 
                            priceMax: filters.listingStatus === 'FOR_RENT' ? 10000 : 5000000 
                          };
                          onFilterChange(next);
                          onTriggerLiveCrawl?.(undefined, undefined, next);
                        }}
                        className="text-[11px] text-red-600 font-bold hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Minimum</label>
                        <select
                          value={filters.priceMin}
                          onChange={(e) => {
                            const next = { ...filters, priceMin: Number(e.target.value) };
                            onFilterChange(next);
                            onTriggerLiveCrawl?.(undefined, undefined, next);
                          }}
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-red-500"
                        >
                          {filters.listingStatus === 'FOR_RENT' ? (
                            <>
                              <option value="0">$0</option>
                              <option value="1000">$1,000/mo</option>
                              <option value="1500">$1,500/mo</option>
                              <option value="2000">$2,000/mo</option>
                              <option value="2500">$2,500/mo</option>
                              <option value="3000">$3,000/mo</option>
                              <option value="4000">$4,000/mo</option>
                              <option value="5000">$5,000/mo</option>
                            </>
                          ) : (
                            <>
                              <option value="0">$0</option>
                              <option value="200000">$200,000</option>
                              <option value="300000">$300,000</option>
                              <option value="400000">$400,000</option>
                              <option value="600000">$600,000</option>
                              <option value="800000">$800,000</option>
                              <option value="1000000">$1,000,000</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Maximum</label>
                        <select
                          value={filters.priceMax}
                          onChange={(e) => {
                            const next = { ...filters, priceMax: Number(e.target.value) };
                            onFilterChange(next);
                            onTriggerLiveCrawl?.(undefined, undefined, next);
                          }}
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-red-500"
                        >
                          {filters.listingStatus === 'FOR_RENT' ? (
                            <>
                              <option value="10000">Any Max</option>
                              <option value="1500">$1,500/mo</option>
                              <option value="2000">$2,000/mo</option>
                              <option value="2500">$2,500/mo</option>
                              <option value="3000">$3,000/mo</option>
                              <option value="3500">$3,500/mo</option>
                              <option value="4000">$4,000/mo</option>
                              <option value="5000">$5,000/mo</option>
                              <option value="7500">$7,500/mo</option>
                            </>
                          ) : (
                            <>
                              <option value="5000000">Any Max</option>
                              <option value="300000">$300,000</option>
                              <option value="400000">$400,000</option>
                              <option value="500000">$500,000</option>
                              <option value="700000">$700,000</option>
                              <option value="900000">$900,000</option>
                              <option value="1200000">$1,200,000</option>
                              <option value="2000000">$2,000,000</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter 3: Beds & Baths */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('beds')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                    openDropdown === 'beds' || filters.bedsMin > 0 || filters.bathsMin > 0
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-red-300 hover:bg-red-50/50'
                  }`}
                >
                  <Bed className="w-3.5 h-3.5" />
                  <span>
                    {filters.bedsMin > 0 ? `${filters.bedsMin}+ Beds` : 'Beds & Baths'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>

                {openDropdown === 'beds' && (
                  <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">Bedrooms</span>
                      <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                        {[0, 1, 2, 3, 4].map((b) => (
                          <button
                            key={b}
                            onClick={() => {
                              const next = { ...filters, bedsMin: b };
                              onFilterChange(next);
                              onTriggerLiveCrawl?.(undefined, undefined, next);
                            }}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              filters.bedsMin === b ? 'bg-red-600 text-white shadow-sm' : 'text-slate-700 hover:text-red-600'
                            }`}
                          >
                            {b === 0 ? 'Any' : `${b}+`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">Bathrooms</span>
                      <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                        {[0, 1, 2, 3].map((ba) => (
                          <button
                            key={ba}
                            onClick={() => {
                              const next = { ...filters, bathsMin: ba };
                              onFilterChange(next);
                              onTriggerLiveCrawl?.(undefined, undefined, next);
                            }}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              filters.bathsMin === ba ? 'bg-red-600 text-white shadow-sm' : 'text-slate-700 hover:text-red-600'
                            }`}
                          >
                            {ba === 0 ? 'Any' : `${ba}+`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter 4: Home Type */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('type')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                    openDropdown === 'type' || filters.propertyType !== 'ALL'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-red-300 hover:bg-red-50/50'
                  }`}
                >
                  <span>{filters.propertyType === 'ALL' ? 'Home Type' : filters.propertyType.replace(/_/g, ' ')}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>

                {openDropdown === 'type' && (
                  <div className="absolute left-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in space-y-1">
                    {(['ALL', 'SINGLE_FAMILY', 'CONDO', 'TOWNHOUSE', 'LOFT'] as PropertyType[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          const next = { ...filters, propertyType: t };
                          onFilterChange(next);
                          closeDropdowns();
                          onTriggerLiveCrawl?.(undefined, undefined, next);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-xl font-bold flex items-center justify-between cursor-pointer transition-colors ${
                          filters.propertyType === t ? 'bg-red-50 text-red-600' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{t === 'ALL' ? 'All Home Types' : t.replace(/_/g, ' ')}</span>
                        {filters.propertyType === t && <Check className="w-3.5 h-3.5 text-red-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter 5: More Filters */}
              <button
                onClick={() => setShowMoreModal(!showMoreModal)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                  showMoreModal || filters.minPassFlowScore > 1.0 || (filters.minCapRatePercent !== undefined && filters.minCapRatePercent > 0)
                    ? 'bg-red-50 text-red-600 border-red-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-red-300 hover:bg-red-50/50'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-red-600" />
                <span>More Filters</span>
                {(filters.minPassFlowScore > 1.0 || (filters.minCapRatePercent !== undefined && filters.minCapRatePercent > 0)) && (
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                )}
              </button>
            </div>

            {/* Right: Map Boundary Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleScribble}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-2xs ${
                  isScribbleActive
                    ? 'bg-red-600 text-white shadow-md'
                    : hasScribbleBoundary
                    ? 'bg-red-50 text-red-600 border border-red-300'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
                title="Draw freehand boundary on map to scan houses"
              >
                <Compass className="w-3.5 h-3.5 text-red-600" />
                <span>{isScribbleActive ? 'Drawing...' : hasScribbleBoundary ? 'Boundary Active' : '✏️ Draw Boundary'}</span>
              </button>

              {hasScribbleBoundary && (
                <button
                  onClick={onClearScribble}
                  className="px-2.5 py-2 text-xs font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 cursor-pointer transition-colors"
                  title="Clear hand-drawn boundary"
                >
                  Clear Boundary
                </button>
              )}
            </div>

          </div>

          {/* C. MORE FILTERS EXPANDED PANEL */}
          {showMoreModal && (
            <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-5 rounded-2xl shadow-md animate-in fade-in border border-slate-200">
              {/* Min Pass Flow Score */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Min Pass/Flow Grade (Score 1.0 - 5.0)
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={filters.minPassFlowScore}
                  onChange={(e) => onFilterChange({ ...filters, minPassFlowScore: Number(e.target.value) })}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>1.0</span>
                  <span className="font-bold text-red-600">{filters.minPassFlowScore.toFixed(1)} / 5.0 Score</span>
                  <span>5.0</span>
                </div>
              </div>

              {/* Min Cap Rate Return */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Minimum Cap Rate (% Return)
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={filters.minCapRatePercent || 0}
                  onChange={(e) => onFilterChange({ ...filters, minCapRatePercent: Number(e.target.value) })}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>0%</span>
                  <span className="font-bold text-red-600">{((filters.minCapRatePercent || 0)).toFixed(1)}% Cap Rate</span>
                  <span>10%</span>
                </div>
              </div>

              {/* Max Annual Property Taxes */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Max Annual Taxes ($/yr)
                </label>
                <select
                  value={filters.maxPropertyTaxesUSD}
                  onChange={(e) => onFilterChange({ ...filters, maxPropertyTaxesUSD: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="50000">Any Taxes</option>
                  <option value="12000">Under $12,000/yr</option>
                  <option value="16000">Under $16,000/yr</option>
                  <option value="20000">Under $20,000/yr</option>
                </select>
              </div>

              {/* Max Distance to Top School */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Max Distance to School (km)
                </label>
                <select
                  value={filters.maxDistanceToSchoolKm}
                  onChange={(e) => onFilterChange({ ...filters, maxDistanceToSchoolKm: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="10">Any Distance</option>
                  <option value="0.5">Within 0.5 km (Walkable)</option>
                  <option value="1.0">Within 1.0 km</option>
                  <option value="2.0">Within 2.0 km</option>
                </select>
              </div>

              {/* Scan Action inside More Filters */}
              <div className="sm:col-span-2 lg:col-span-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    onFilterChange({
                      ...filters,
                      minPassFlowScore: 1.0,
                      minCapRatePercent: 0,
                      maxPropertyTaxesUSD: 50000,
                      maxDistanceToSchoolKm: 10,
                    });
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Reset Advanced Filters
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreModal(false);
                    onTriggerLiveCrawl?.(undefined, undefined, filters);
                  }}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Scan className="w-4 h-4" />
                  <span>Apply & Scan</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Exa.ai Live Search Neural Connector Modal */}
      <ExaConnectModal
        isOpen={showExaModal}
        onClose={() => setShowExaModal(false)}
        currentQuery={filters.searchQuery}
        onSearchWithExa={(q, key) => {
          onTriggerLiveCrawl?.(q, key, filters);
        }}
      />

    </header>
  );
};
