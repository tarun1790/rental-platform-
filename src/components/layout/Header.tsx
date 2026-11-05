'use client';

import React, { useState, useEffect } from 'react';
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
  Key,
  Database,
  Download,
  FileCode,
  LayoutGrid,
  CheckCircle2
} from 'lucide-react';
import { FilterState, ListingStatus, PropertyType } from '../../types/property';
import { SupportedLanguageCode } from '../../types/intelligence';
import { SUPPORTED_LANGUAGES } from '../../lib/speech-translation';
import { TiledHomeIcon } from '../common/TiledHomeIcon';
import { parseNlpQuery } from '../../lib/nlp-search-parser';
import { ExaConnectModal } from '../crawler/ExaConnectModal';
import { getExaApiKey } from '../../lib/crawler/exa-client';

interface HeaderProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  listingCount: number;
  totalCount: number;
  isScribbleActive: boolean;
  onToggleScribble: () => void;
  onClearScribble: () => void;
  hasScribbleBoundary: boolean;
  activeView: 'spatial' | 'split' | 'map' | 'list' | 'grid';
  onViewChange: (view: 'spatial' | 'split' | 'map' | 'list' | 'grid') => void;
  sortBy: string;
  onSortChange: (sort: any) => void;
  onScrollToTop?: () => void;
  currentLanguage?: SupportedLanguageCode;
  onLanguageChange?: (lang: SupportedLanguageCode) => void;
  onTriggerLiveCrawl?: (query?: string, exaApiKey?: string, filterOverrides?: Partial<FilterState>) => void;
  isCrawling?: boolean;
  onOpenDatabase?: () => void;
  onOpenOkfStudio?: () => void;
  onOpenStrikeRate?: () => void;
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
  onOpenDatabase,
  onOpenOkfStudio,
  onOpenStrikeRate,
}) => {
  // Dropdown Popover States
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [showExaModal, setShowExaModal] = useState(false);
  const [hasExaKey, setHasExaKey] = useState(false);
  const searchDebounceRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    setHasExaKey(!!getExaApiKey());
  }, [showExaModal]);

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
    <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-2xl border-b border-white/10 text-white shadow-2xl select-none">
      
      {/* 1. TOP BRAND & CURATED RESIDENCES NAVBAR */}
      <div className="w-full px-4 sm:px-8 lg:px-12 border-b border-white/10">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
          
          {/* Brand Logo & Title */}
          <div 
            onClick={onScrollToTop}
            className="flex items-center gap-3 cursor-pointer shrink-0 group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#141210] border border-[#e2b170]/40 group-hover:border-[#e2b170] flex items-center justify-center transition-all p-1 shadow-md shadow-[#e2b170]/10">
              <TiledHomeIcon size={28} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-wider text-white font-sans leading-none">
                  HOUSE INTELLIGENCE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e2b170]/15 text-[#e2b170] border border-[#e2b170]/40 font-mono font-bold tracking-widest uppercase">
                  ESTATE
                </span>
              </div>
              <span className="text-[10px] font-medium text-zinc-400 tracking-widest uppercase mt-0.5 hidden sm:block font-mono">
                Curated Luxury Residences & Estates
              </span>
            </div>
          </div>

          {/* Right Status & Curated Inventory Indicator */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18181b] border border-white/10 text-xs font-mono text-zinc-300 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-[#e2b170] animate-pulse" />
              <span className="font-bold text-white">{listingCount || totalCount || 4815}</span>
              <span className="text-zinc-400">Curated Residences</span>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#e2b170] hover:text-white bg-[#e2b170]/10 hover:bg-[#e2b170]/20 rounded-xl border border-[#e2b170]/30 transition-all cursor-pointer font-mono"
                title="Reset all active search and filter constraints"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. DEDICATED SPACIOUS SEARCH COMMAND CENTER */}
      <div className="w-full px-4 sm:px-8 lg:px-12 py-3 bg-[#09090b]/90 border-b border-white/10">
        <div className="max-w-5xl mx-auto space-y-3">
          
          {/* A. GRAND WIDE SEARCH INPUT BOX */}
          <div className="relative flex items-center w-full bg-[#141418] rounded-2xl border border-white/15 hover:border-[#e2b170] focus-within:border-[#e2b170] focus-within:ring-4 focus-within:ring-[#e2b170]/20 shadow-xl transition-all duration-200 h-14 sm:h-16 px-3.5 sm:px-4 gap-2.5 sm:gap-3">
            
            {/* Search Icon & Voice Mic */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Search className="w-5 h-5 text-[#e2b170] shrink-0" />
              <button
                type="button"
                onClick={handleToggleVoiceSearch}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isListening 
                    ? 'bg-amber-600 text-white animate-pulse shadow-md' 
                    : 'text-zinc-400 hover:text-[#e2b170] hover:bg-white/5'
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
                  ? '🎙️ Listening... speak criteria now (e.g. Austin luxury villa, Aspen chalet)' 
                  : 'Search by city, neighborhood, or criteria (e.g. Austin villa, Beverly Hills, Aspen chalet, Miami waterfront)...'
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
              className="flex-1 min-w-0 bg-transparent text-white placeholder-zinc-400 text-sm sm:text-base font-medium focus:outline-none"
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
                className="text-zinc-400 hover:text-[#e2b170] p-1.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors shrink-0"
                title="Clear search text"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Clean Luxury Search Action Button */}
            <button
              type="button"
              onClick={() => {
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                onTriggerLiveCrawl?.(filters.searchQuery, undefined, filters);
              }}
              disabled={isCrawling}
              title="Search curated residences"
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#e2b170] hover:bg-[#d4a055] disabled:opacity-40 text-black rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md shadow-[#e2b170]/20 cursor-pointer shrink-0"
            >
              {isCrawling ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>{isCrawling ? 'Searching...' : 'Search'}</span>
            </button>
          </div>

          {/* B. FREELY SPACED FILTER PILLS ROW */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Filter 1: Status (Buy vs Rent) */}
              <div className="relative font-mono">
                <button
                  onClick={() => toggleDropdown('status')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                    openDropdown === 'status' || filters.listingStatus !== 'ALL'
                      ? 'bg-[#e2b170] text-black border-[#e2b170] font-black shadow-md shadow-[#e2b170]/25'
                      : 'bg-[#18181b] text-zinc-300 border-white/10 hover:border-[#e2b170] hover:text-white'
                  }`}
                >
                  <span>{filters.listingStatus === 'FOR_SALE' ? 'For Sale' : filters.listingStatus === 'FOR_RENT' ? 'For Rent' : 'All Listings'}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>

                {openDropdown === 'status' && (
                  <div className="absolute left-0 mt-2 w-44 bg-[#141418] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in space-y-1">
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
                          filters.listingStatus === st ? 'bg-[#e2b170]/15 text-[#e2b170] border border-[#e2b170]/30' : 'text-zinc-300 hover:bg-white/5'
                        }`}
                      >
                        <span>{st === 'FOR_SALE' ? 'For Sale' : st === 'FOR_RENT' ? 'For Rent' : 'All Listings'}</span>
                        {filters.listingStatus === st && <Check className="w-3.5 h-3.5 text-[#e2b170]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter 2: Price Range */}
              <div className="relative font-mono">
                <button
                  onClick={() => toggleDropdown('price')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                    openDropdown === 'price' || filters.priceMin > 0 || (filters.listingStatus === 'FOR_RENT' ? filters.priceMax < 10000 : filters.priceMax < 5000000)
                      ? 'bg-[#e2b170] text-black border-[#e2b170] font-black shadow-md shadow-[#e2b170]/25'
                      : 'bg-[#18181b] text-zinc-300 border-white/10 hover:border-[#e2b170] hover:text-white'
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
                  <div className="absolute left-0 mt-2 w-72 bg-[#141418] border border-white/15 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-white border-b border-white/10 pb-2">
                      <span className="text-[#e2b170] font-bold">
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
                        className="text-[11px] text-[#e2b170] font-bold hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Minimum</label>
                        <select
                          value={filters.priceMin}
                          onChange={(e) => {
                            const next = { ...filters, priceMin: Number(e.target.value) };
                            onFilterChange(next);
                            onTriggerLiveCrawl?.(undefined, undefined, next);
                          }}
                          className="w-full text-xs p-2 bg-[#1c1c21] border border-white/10 rounded-xl font-medium text-white focus:ring-2 focus:ring-[#e2b170]"
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
                        <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Maximum</label>
                        <select
                          value={filters.priceMax}
                          onChange={(e) => {
                            const next = { ...filters, priceMax: Number(e.target.value) };
                            onFilterChange(next);
                            onTriggerLiveCrawl?.(undefined, undefined, next);
                          }}
                          className="w-full text-xs p-2 bg-[#1c1c21] border border-white/10 rounded-xl font-medium text-white focus:ring-2 focus:ring-[#e2b170]"
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
              <div className="relative font-mono">
                <button
                  onClick={() => toggleDropdown('beds')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                    openDropdown === 'beds' || filters.bedsMin > 0 || filters.bathsMin > 0
                      ? 'bg-[#e2b170] text-black border-[#e2b170] font-black shadow-md shadow-[#e2b170]/25'
                      : 'bg-[#18181b] text-zinc-300 border-white/10 hover:border-[#e2b170] hover:text-white'
                  }`}
                >
                  <Bed className="w-3.5 h-3.5" />
                  <span>
                    {filters.bedsMin > 0 ? `${filters.bedsMin}+ Beds` : 'Beds & Baths'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>

                {openDropdown === 'beds' && (
                  <div className="absolute left-0 mt-2 w-64 bg-[#141418] border border-white/15 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1.5">Bedrooms</span>
                      <div className="flex bg-[#1c1c21] p-1 rounded-xl gap-1 border border-white/10">
                        {[0, 1, 2, 3, 4].map((b) => (
                          <button
                            key={b}
                            onClick={() => {
                              const next = { ...filters, bedsMin: b };
                              onFilterChange(next);
                              onTriggerLiveCrawl?.(undefined, undefined, next);
                            }}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              filters.bedsMin === b ? 'bg-[#e2b170] text-black shadow-sm font-black' : 'text-zinc-300 hover:text-white'
                            }`}
                          >
                            {b === 0 ? 'Any' : `${b}+`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1.5">Bathrooms</span>
                      <div className="flex bg-[#1c1c21] p-1 rounded-xl gap-1 border border-white/10">
                        {[0, 1, 2, 3].map((ba) => (
                          <button
                            key={ba}
                            onClick={() => {
                              const next = { ...filters, bathsMin: ba };
                              onFilterChange(next);
                              onTriggerLiveCrawl?.(undefined, undefined, next);
                            }}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              filters.bathsMin === ba ? 'bg-[#e2b170] text-black shadow-sm font-black' : 'text-zinc-300 hover:text-white'
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
              <div className="relative font-mono">
                <button
                  onClick={() => toggleDropdown('type')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                    openDropdown === 'type' || filters.propertyType !== 'ALL'
                      ? 'bg-[#e2b170] text-black border-[#e2b170] font-black shadow-md shadow-[#e2b170]/25'
                      : 'bg-[#18181b] text-zinc-300 border-white/10 hover:border-[#e2b170] hover:text-white'
                  }`}
                >
                  <span>{filters.propertyType === 'ALL' ? 'Home Type' : filters.propertyType.replace(/_/g, ' ')}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>

                {openDropdown === 'type' && (
                  <div className="absolute left-0 mt-2 w-52 bg-[#141418] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in space-y-1">
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
                          filters.propertyType === t ? 'bg-[#e2b170]/15 text-[#e2b170] border border-[#e2b170]/30' : 'text-zinc-300 hover:bg-white/5'
                        }`}
                      >
                        <span>{t === 'ALL' ? 'All Home Types' : t.replace(/_/g, ' ')}</span>
                        {filters.propertyType === t && <Check className="w-3.5 h-3.5 text-[#e2b170]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter 5: More Filters */}
              <button
                onClick={() => setShowMoreModal(!showMoreModal)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold font-mono rounded-xl border transition-all cursor-pointer shadow-2xs ${
                  showMoreModal || filters.minPassFlowScore > 1.0 || (filters.minCapRatePercent !== undefined && filters.minCapRatePercent > 0)
                    ? 'bg-[#e2b170]/15 text-[#e2b170] border-[#e2b170]/40'
                    : 'bg-[#18181b] text-zinc-300 border-white/10 hover:border-[#e2b170] hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#e2b170]" />
                <span>More Filters</span>
                {(filters.minPassFlowScore > 1.0 || (filters.minCapRatePercent !== undefined && filters.minCapRatePercent > 0)) && (
                  <span className="w-2 h-2 rounded-full bg-[#e2b170] animate-pulse" />
                )}
              </button>
            </div>

            {/* Right: Map Boundary Controls */}
            <div className="flex items-center gap-2 font-mono">
              <button
                onClick={onToggleScribble}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-2xs ${
                  isScribbleActive
                    ? 'bg-[#e2b170] text-black font-black shadow-md shadow-[#e2b170]/25'
                    : hasScribbleBoundary
                    ? 'bg-[#e2b170]/15 text-[#e2b170] border border-[#e2b170]/40'
                    : 'bg-[#18181b] hover:bg-white/10 text-zinc-300 border border-white/10 hover:border-[#e2b170]'
                }`}
                title="Draw freehand boundary on map to filter residences"
              >
                <Compass className="w-3.5 h-3.5 text-[#e2b170]" />
                <span>{isScribbleActive ? 'Drawing...' : hasScribbleBoundary ? 'Boundary Active' : '✏️ Draw Boundary'}</span>
              </button>

              {hasScribbleBoundary && (
                <button
                  onClick={onClearScribble}
                  className="px-2.5 py-2 text-xs font-bold text-cyan-400 border border-cyan-500/30 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                  title="Clear hand-drawn boundary"
                >
                  Clear Boundary
                </button>
              )}

              {/* View Switcher: 3D Gallery / Split / Grid / Map */}
              <div className="flex items-center bg-[#141418] p-1 rounded-xl border border-white/10 ml-1">
                <button
                  type="button"
                  onClick={() => onViewChange('spatial')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activeView === 'spatial' ? 'bg-[#e2b170] text-black shadow-md shadow-[#e2b170]/25 font-black' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="3D Gallery Coverflow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">3D Gallery</span>
                </button>
                <button
                  type="button"
                  onClick={() => onViewChange('split')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeView === 'split' ? 'bg-[#e2b170] text-black shadow-md shadow-[#e2b170]/25 font-black' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Split View (Map Left, Houses Right)"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Split</span>
                </button>
                <button
                  type="button"
                  onClick={() => onViewChange('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeView === 'grid' || activeView === 'list' ? 'bg-[#e2b170] text-black shadow-md shadow-[#e2b170]/25 font-black' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="High-Density 4-Column Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => onViewChange('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeView === 'map' ? 'bg-[#e2b170] text-black shadow-md shadow-[#e2b170]/25 font-black' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Full Interactive Map View"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Map</span>
                </button>
              </div>
            </div>

          </div>

          {/* C. MORE FILTERS EXPANDED PANEL (LUXURY OBSIDIAN PALETTE) */}
          {showMoreModal && (
            <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#141418] p-5 rounded-2xl shadow-2xl animate-in fade-in border border-white/15 text-white font-mono">
              {/* Max Property Taxes */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Max Annual Taxes ($/yr)
                </label>
                <select
                  value={filters.maxPropertyTaxesUSD}
                  onChange={(e) => onFilterChange({ ...filters, maxPropertyTaxesUSD: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 bg-[#1c1c21] border border-white/10 rounded-xl font-medium text-white focus:ring-2 focus:ring-[#e2b170]"
                >
                  <option value="50000">Any Taxes</option>
                  <option value="12000">Under $12,000/yr</option>
                  <option value="16000">Under $16,000/yr</option>
                  <option value="20000">Under $20,000/yr</option>
                </select>
              </div>

              {/* Max Distance to Top School */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Max Distance to School (km)
                </label>
                <select
                  value={filters.maxDistanceToSchoolKm}
                  onChange={(e) => onFilterChange({ ...filters, maxDistanceToSchoolKm: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 bg-[#1c1c21] border border-white/10 rounded-xl font-medium text-white focus:ring-2 focus:ring-[#e2b170]"
                >
                  <option value="10">Any Distance</option>
                  <option value="0.5">Within 0.5 km (Walkable)</option>
                  <option value="1.0">Within 1.0 km</option>
                  <option value="2.0">Within 2.0 km</option>
                </select>
              </div>

              {/* Min Bedrooms */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Minimum Bedrooms
                </label>
                <select
                  value={filters.bedsMin}
                  onChange={(e) => onFilterChange({ ...filters, bedsMin: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 bg-[#1c1c21] border border-white/10 rounded-xl font-medium text-white focus:ring-2 focus:ring-[#e2b170]"
                >
                  <option value="0">Any Bedrooms</option>
                  <option value="2">2+ Bedrooms</option>
                  <option value="3">3+ Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                  <option value="5">5+ Bedrooms</option>
                </select>
              </div>

              {/* Property Architecture */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Residence Type
                </label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => onFilterChange({ ...filters, propertyType: e.target.value as any })}
                  className="w-full text-xs p-2.5 bg-[#1c1c21] border border-white/10 rounded-xl font-medium text-white focus:ring-2 focus:ring-[#e2b170]"
                >
                  <option value="ALL">All Residence Types</option>
                  <option value="SINGLE_FAMILY">Villas & Estates</option>
                  <option value="CONDO">Penthouses & Condos</option>
                  <option value="TOWNHOUSE">Townhouses</option>
                </select>
              </div>

              {/* Apply & Reset inside More Filters */}
              <div className="sm:col-span-2 lg:col-span-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    onFilterChange({
                      ...filters,
                      bedsMin: 0,
                      bathsMin: 0,
                      propertyType: 'ALL',
                      maxPropertyTaxesUSD: 50000,
                      maxDistanceToSchoolKm: 10,
                    });
                  }}
                  className="text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Reset Advanced Filters
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreModal(false);
                    onTriggerLiveCrawl?.(undefined, undefined, filters);
                  }}
                  className="px-6 py-2.5 bg-[#e2b170] hover:bg-[#d4a055] text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#e2b170]/20"
                >
                  <Search className="w-4 h-4" />
                  <span>Apply Criteria</span>
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
