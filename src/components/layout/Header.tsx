'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
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
  Mic, 
  MicOff,
  RotateCw,
  RotateCcw,
  LayoutGrid,
  MapPin,
  Calendar,
  Volume2,
  VolumeX
} from 'lucide-react';
import { FilterState, ListingStatus, PropertyType } from '../../types/property';
import { SupportedLanguageCode } from '../../types/intelligence';
import { TiledHomeIcon } from '../common/TiledHomeIcon';
import { parseNlpQuery } from '../../lib/nlp-search-parser';
import { spatialAudio } from '../../lib/audio/spatial-audio';

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

const LUXURY_METROS = [
  'All Metros',
  'Chicago',
  'Los Angeles',
  'New York',
  'Miami',
  'Austin',
  'Denver',
  'Seattle',
  'San Francisco',
  'Dallas',
  'Phoenix',
  'Atlanta',
  'Boston'
];

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
  onScrollToTop,
  onTriggerLiveCrawl,
  isCrawling,
}) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setIsAudioMuted(spatialAudio.getIsMuted());
  }, []);

  const handleToggleAudio = () => {
    const nextMuted = spatialAudio.toggleMute();
    setIsAudioMuted(nextMuted);
    if (!nextMuted) spatialAudio.playCyberHover();
  };

  // Keyboard shortcut: Cmd+K / Ctrl+K or / to open Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input on search modal open
  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchModalOpen]);

  // Speech Recognition
  const handleToggleVoiceSearch = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      const parsed = parseNlpQuery(transcript);
      const nextFilters = {
        ...filters,
        searchQuery: transcript,
        ...(parsed.priceRange?.maxPrice && { priceMax: parsed.priceRange.maxPrice }),
        ...(parsed.priceRange?.minPrice && { priceMin: parsed.priceRange.minPrice }),
        ...(parsed.beds !== undefined && { bedsMin: parsed.beds }),
        ...(parsed.listingStatus && { listingStatus: parsed.listingStatus }),
        ...(parsed.propertyType && { propertyType: parsed.propertyType }),
      };
      onFilterChange(nextFilters);
      onTriggerLiveCrawl?.(transcript, undefined, nextFilters);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const hasActiveFilters =
    filters.searchQuery.trim().length > 0 ||
    filters.listingStatus !== 'ALL' ||
    filters.bedsMin > 0 ||
    filters.bathsMin > 0 ||
    filters.propertyType !== 'ALL' ||
    hasScribbleBoundary;

  const handleResetFilters = () => {
    if (hasScribbleBoundary) onClearScribble();
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
    <>
      {/* 1. ULTRA-SLEEK FLOATING LIQUID-GLASS HEADER BAR (MOTION SITES STANDARD) */}
      <header className="sticky top-0 z-40 bg-[#09090b]/85 backdrop-blur-2xl border-b border-white/10 text-white select-none transition-all duration-300">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Title */}
          <div 
            onClick={onScrollToTop}
            className="flex items-center gap-3 cursor-pointer shrink-0 group"
          >
            <div className="w-9 h-9 rounded-2xl bg-[#141210] border border-[#e2b170]/40 group-hover:border-[#e2b170] flex items-center justify-center transition-all p-1 shadow-md shadow-[#e2b170]/10">
              <TiledHomeIcon size={26} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black tracking-widest text-white font-sans leading-none">
                  HOUSE INTELLIGENCE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e2b170]/20 text-[#e2b170] border border-[#e2b170]/40 font-mono font-bold tracking-widest uppercase">
                  ESTATE
                </span>
              </div>
              <span className="text-[9px] font-medium text-zinc-400 tracking-widest uppercase mt-0.5 hidden sm:block font-mono">
                Curated Luxury Residences & Estates
              </span>
            </div>
          </div>

          {/* Center: Liquid-Glass View Switcher Pill */}
          <div className="flex items-center bg-[#141418] p-1 rounded-2xl border border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => onViewChange('spatial')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeView === 'spatial'
                  ? 'bg-[#e2b170] text-black font-black shadow-md shadow-[#e2b170]/25'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="3D Gallery Coverflow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-semibold">3D Gallery</span>
            </button>

            <button
              type="button"
              onClick={() => onViewChange('split')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeView === 'split'
                  ? 'bg-[#e2b170] text-black font-black shadow-md shadow-[#e2b170]/25'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Split View (Map Left, Houses Right)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-semibold">Split</span>
            </button>

            <button
              type="button"
              onClick={() => onViewChange('grid')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeView === 'grid' || (activeView as any) === 'list'
                  ? 'bg-[#e2b170] text-black font-black shadow-md shadow-[#e2b170]/25'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="High-Density 4-Column Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-semibold">Grid</span>
            </button>

            <button
              type="button"
              onClick={() => onViewChange('map')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeView === 'map'
                  ? 'bg-[#e2b170] text-black font-black shadow-md shadow-[#e2b170]/25'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Full Interactive Satellite Map View"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-semibold">Map</span>
            </button>
          </div>

          {/* Right Controls: Search Modal Trigger & Curated Counter */}
          <div className="flex items-center gap-2.5">
            {/* Ambient Spatial Audio Toggle (Active Theory Sound Design) */}
            <button
              type="button"
              onClick={handleToggleAudio}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isAudioMuted
                  ? 'bg-[#141418] border-white/10 text-zinc-500 hover:text-zinc-300'
                  : 'bg-[#e2b170]/15 border-[#e2b170]/40 text-[#e2b170] shadow-md shadow-[#e2b170]/15'
              }`}
              title={isAudioMuted ? 'Enable Ambient Spatial Audio' : 'Mute Ambient Spatial Audio'}
            >
              {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#141418] hover:bg-[#1a1a20] text-zinc-300 hover:text-white border border-white/10 hover:border-[#e2b170]/50 transition-all cursor-pointer shadow-sm group"
              title="Search and filter estates (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#e2b170]" />
              <span className="text-xs font-mono font-medium hidden md:inline">
                {filters.searchQuery ? `"${filters.searchQuery.slice(0, 15)}..."` : 'Search Estates...'}
              </span>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded bg-black/50 text-[10px] font-mono text-zinc-400 border border-white/10 group-hover:text-zinc-200">
                ⌘K
              </kbd>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#141418] border border-white/10 text-xs font-mono text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-[#e2b170] animate-pulse" />
              <span className="font-bold text-white">{listingCount || totalCount || 550}</span>
              <span className="text-zinc-400 hidden lg:inline">Residences</span>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#e2b170] hover:text-white bg-[#e2b170]/10 hover:bg-[#e2b170]/20 rounded-xl border border-[#e2b170]/30 transition-all cursor-pointer font-mono"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* 2. FLOATING LIQUID-GLASS SEARCH & FILTER COMMAND CENTER (MODAL) */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 select-none">
          
          {/* Click Outside Backdrop */}
          <div 
            className="fixed inset-0 -z-10" 
            onClick={() => setIsSearchModalOpen(false)} 
          />

          <div className="w-full max-w-3xl bg-[#121216] border border-white/15 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-[#e2b170]" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                  Curated Search & Filter Console
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* A. Search Input with Voice Command */}
            <div className="relative flex items-center w-full bg-[#18181f] rounded-2xl border border-white/15 focus-within:border-[#e2b170] focus-within:ring-4 focus-within:ring-[#e2b170]/20 px-4 py-3 gap-3">
              <Search className="w-5 h-5 text-[#e2b170] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search city, neighborhood, or criteria (e.g. Austin villa, Beverly Hills, Aspen chalet)..."
                value={filters.searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  const nextFilters = { ...filters, searchQuery: val };
                  if (/(under|below|max|budget|\$|\d+k|beds?|bath|bhk|rk|rent)/i.test(val)) {
                    const parsed = parseNlpQuery(val);
                    if (parsed.priceRange?.maxPrice) nextFilters.priceMax = parsed.priceRange.maxPrice;
                    if (parsed.priceRange?.minPrice) nextFilters.priceMin = parsed.priceRange.minPrice;
                    if (parsed.beds !== undefined) nextFilters.bedsMin = parsed.beds;
                    if (parsed.listingStatus) nextFilters.listingStatus = parsed.listingStatus;
                    if (parsed.propertyType) nextFilters.propertyType = parsed.propertyType;
                  }
                  onFilterChange(nextFilters);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsSearchModalOpen(false);
                    onTriggerLiveCrawl?.(filters.searchQuery, undefined, filters);
                  }
                }}
                className="flex-1 bg-transparent text-white placeholder-zinc-400 text-sm font-medium focus:outline-none"
              />
              <button
                type="button"
                onClick={handleToggleVoiceSearch}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isListening ? 'bg-amber-600 text-white animate-pulse' : 'text-zinc-400 hover:text-[#e2b170]'
                }`}
                title={isListening ? 'Listening...' : 'Voice Search'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* B. Metro Selection Chips */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                Filter By Metro:
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                {LUXURY_METROS.map((city) => {
                  const isSelected = city === 'All Metros' 
                    ? !filters.searchQuery 
                    : filters.searchQuery.toLowerCase().includes(city.toLowerCase());
                  return (
                    <button
                      key={city}
                      onClick={() => {
                        const nextQuery = city === 'All Metros' ? '' : city;
                        const next = { ...filters, searchQuery: nextQuery };
                        onFilterChange(next);
                        onTriggerLiveCrawl?.(nextQuery, undefined, next);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#e2b170] text-black border-[#e2b170] font-black shadow-md shadow-[#e2b170]/20'
                          : 'bg-[#18181f] text-zinc-300 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* C. Filter Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10 font-mono">
              
              {/* Offering Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-400 block">Offering Type</label>
                <div className="flex bg-[#18181f] p-1 rounded-xl border border-white/10">
                  {[
                    { id: 'ALL', label: 'All' },
                    { id: 'FOR_SALE', label: 'Buy' },
                    { id: 'FOR_RENT', label: 'Lease' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        const next = { ...filters, listingStatus: s.id as any };
                        onFilterChange(next);
                      }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        filters.listingStatus === s.id ? 'bg-[#e2b170] text-black font-black' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bedrooms */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-400 block">Min Bedrooms</label>
                <div className="flex bg-[#18181f] p-1 rounded-xl border border-white/10">
                  {[0, 2, 3, 4, 5].map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        const next = { ...filters, bedsMin: b };
                        onFilterChange(next);
                      }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        filters.bedsMin === b ? 'bg-[#e2b170] text-black font-black' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {b === 0 ? 'Any' : `${b}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Residence Style */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-400 block">Residence Type</label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => onFilterChange({ ...filters, propertyType: e.target.value as any })}
                  className="w-full text-xs p-2.5 bg-[#18181f] border border-white/10 rounded-xl font-medium text-white focus:ring-2 focus:ring-[#e2b170]"
                >
                  <option value="ALL">All Types</option>
                  <option value="SINGLE_FAMILY">Villas & Estates</option>
                  <option value="CONDO">Penthouses & Condos</option>
                </select>
              </div>

            </div>

            {/* D. Bottom Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-mono font-bold text-zinc-400 hover:text-white cursor-pointer"
              >
                Reset All Filters
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchModalOpen(false);
                    onToggleScribble();
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border cursor-pointer ${
                    hasScribbleBoundary 
                      ? 'bg-[#e2b170]/15 text-[#e2b170] border-[#e2b170]/40' 
                      : 'bg-[#18181f] text-zinc-300 border-white/10 hover:border-[#e2b170]'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-[#e2b170]" />
                  <span>{hasScribbleBoundary ? 'Boundary Active' : 'Draw Boundary'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSearchModalOpen(false);
                    onTriggerLiveCrawl?.(filters.searchQuery, undefined, filters);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#e2b170] hover:bg-[#d4a055] text-black font-black text-xs font-mono uppercase tracking-wider transition-all shadow-md shadow-[#e2b170]/20 cursor-pointer"
                >
                  Apply & View {listingCount || 550} Estates
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
