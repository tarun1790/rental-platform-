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
  Bot,
  RotateCw,
  Scan
} from 'lucide-react';
import { FilterState, ListingStatus, PropertyType } from '../../types/property';
import { SupportedLanguageCode } from '../../types/intelligence';
import { SUPPORTED_LANGUAGES } from '../../lib/speech-translation';
import { TiledHomeIcon } from '../common/TiledHomeIcon';
import { parseNlpQuery } from '../../lib/nlp-search-parser';

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

          {/* 2. UNIFIED SEARCH INPUT (ONE SINGLE OPTION - AUTOMATICALLY DOES EVERYTHING AT ONCE) */}
          <div className="relative flex-1 min-w-[240px] max-w-xl md:max-w-2xl">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
              <Search className="w-4 h-4 text-red-500 shrink-0" />
              <button
                type="button"
                onClick={handleToggleVoiceSearch}
                className={`p-1 rounded-lg transition-all cursor-pointer ${
                  isListening 
                    ? 'bg-red-600 text-white animate-pulse shadow-md' 
                    : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                }`}
                title={isListening ? 'Listening via microphone... speak now' : 'Voice Search'}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            </div>
            <input
              type="text"
              placeholder={isListening ? '🎙️ Listening... speak criteria now' : 'Search any city or criteria (e.g. Austin 3 bed under 800k, Denver condo, Miami rentals)...'}
              value={filters.searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                const nextFilters = { ...filters, searchQuery: val };
                if (/(under|below|max|budget|\$|\d+k|beds?|bath)/i.test(val)) {
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
                }
                onFilterChange(nextFilters);

                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                if (val.trim().length >= 2) {
                  searchDebounceRef.current = setTimeout(() => {
                    onTriggerLiveCrawl?.(val.trim(), undefined, nextFilters);
                  }, 400);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                  onTriggerLiveCrawl?.(filters.searchQuery, undefined, filters);
                }
              }}
              className="w-full pl-16 pr-28 py-2.5 text-xs sm:text-sm bg-red-50/40 border border-red-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-medium"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {filters.searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    const reset = { ...filters, searchQuery: '', priceMax: 5000000, priceMin: 0, bedsMin: 0 };
                    onFilterChange(reset);
                    onTriggerLiveCrawl?.('', undefined, reset);
                  }}
                  className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                  onTriggerLiveCrawl?.(filters.searchQuery, undefined, filters);
                }}
                disabled={isCrawling}
                title="Scan and scrape all rental websites for this criteria"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                {isCrawling ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Scan className="w-3.5 h-3.5" />
                )}
                <span>{isCrawling ? 'Scanning...' : 'Scan'}</span>
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
                openDropdown === 'price' || filters.priceMin > 0 || (filters.listingStatus === 'FOR_RENT' ? filters.priceMax < 10000 : filters.priceMax < 5000000)
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-white text-slate-800 border-red-200 hover:border-red-400 hover:bg-red-50/50'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>
                {filters.listingStatus === 'FOR_RENT'
                  ? (filters.priceMin > 0 || filters.priceMax < 10000
                      ? `$${filters.priceMin.toLocaleString()} - $${filters.priceMax.toLocaleString()}/mo`
                      : 'Monthly Rent')
                  : (filters.priceMin > 0 || filters.priceMax < 5000000
                      ? `$${(filters.priceMin / 1000).toFixed(0)}k - $${(filters.priceMax / 1000).toFixed(0)}k`
                      : 'Price Range')}
              </span>
              <ChevronDown className="w-3 h-3 text-red-500" />
            </button>

            {openDropdown === 'price' && (
              <div className="absolute left-0 mt-2 w-72 bg-white border border-red-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-900 border-b border-red-100 pb-2">
                  <span className="text-red-600 font-black">
                    {filters.listingStatus === 'FOR_RENT' ? 'Monthly Rent (USD/mo)' : 'Purchase Price (USD)'}
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
                    <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Minimum</label>
                    <select
                      value={filters.priceMin}
                      onChange={(e) => {
                        const next = { ...filters, priceMin: Number(e.target.value) };
                        onFilterChange(next);
                        onTriggerLiveCrawl?.(undefined, undefined, next);
                      }}
                      className="w-full text-xs p-2 bg-red-50/40 border border-red-200 rounded-xl font-medium"
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
                    <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Maximum</label>
                    <select
                      value={filters.priceMax}
                      onChange={(e) => {
                        const next = { ...filters, priceMax: Number(e.target.value) };
                        onFilterChange(next);
                        onTriggerLiveCrawl?.(undefined, undefined, next);
                      }}
                      className="w-full text-xs p-2 bg-red-50/40 border border-red-200 rounded-xl font-medium"
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
                        onClick={() => {
                          const next = { ...filters, bedsMin: b };
                          onFilterChange(next);
                          onTriggerLiveCrawl?.(undefined, undefined, next);
                        }}
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
                        onClick={() => {
                          const next = { ...filters, bathsMin: ba };
                          onFilterChange(next);
                          onTriggerLiveCrawl?.(undefined, undefined, next);
                        }}
                        className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
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
                      const next = { ...filters, propertyType: t };
                      onFilterChange(next);
                      closeDropdowns();
                      onTriggerLiveCrawl?.(undefined, undefined, next);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-xl font-bold flex items-center justify-between ${
                      filters.propertyType === t ? 'bg-red-50 text-red-600' : 'text-slate-700 hover:bg-red-50/60'
                    }`}
                  >
                    <span>{t === 'ALL' ? 'All Home Types' : t.replace(/_/g, ' ')}</span>
                    {filters.propertyType === t && <Check className="w-3.5 h-3.5 text-red-600" />}
                  </button>
                ))}
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

            {/* Scan Action inside More Filters */}
            <div className="sm:col-span-2 lg:col-span-4 pt-2 border-t border-red-200 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowMoreModal(false);
                  onTriggerLiveCrawl?.(undefined, undefined, filters);
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Scan className="w-4 h-4" />
                <span>Scan Properties</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
