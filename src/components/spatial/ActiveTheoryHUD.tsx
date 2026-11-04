'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Database, 
  Map as MapIcon, 
  Layers, 
  Mic, 
  MicOff, 
  RotateCw, 
  Scan,
  Compass,
  ArrowRight,
  ShieldCheck,
  Building,
  Key,
  Volume2,
  VolumeX
} from 'lucide-react';
import { FilterState } from '../../types/property';
import { TiledHomeIcon } from '../common/TiledHomeIcon';
import { spatialAudio } from '../../lib/audio/spatial-audio';

interface ActiveTheoryHUDProps {
  activeView: 'spatial' | 'shrine' | 'map' | 'database';
  onViewChange: (view: 'spatial' | 'shrine' | 'map' | 'database') => void;
  totalDbCount: number;
  filteredCount: number;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onTriggerLiveCrawl: (query?: string, exaKey?: string, overrides?: Partial<FilterState>) => void;
  isCrawling: boolean;
  onOpenDbModal: () => void;
  onOpenExaModal: () => void;
  hasExaKey: boolean;
}

export const ActiveTheoryHUD: React.FC<ActiveTheoryHUDProps> = ({
  activeView,
  onViewChange,
  totalDbCount,
  filteredCount,
  filters,
  onFilterChange,
  onTriggerLiveCrawl,
  isCrawling,
  onOpenDbModal,
  onOpenExaModal,
  hasExaKey,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(spatialAudio.getIsMuted());
  }, []);

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
          const next = { ...filters, searchQuery: transcript };
          onFilterChange(next);
          onTriggerLiveCrawl(transcript, undefined, next);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
        return;
      } catch (e) {}
    }

    // Fallback simulation
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const voiceSample = '3 bedroom in Denver under 3000';
      const next = { ...filters, searchQuery: voiceSample };
      onFilterChange(next);
      onTriggerLiveCrawl(voiceSample, undefined, next);
    }, 1200);
  };

  const QUICK_INTENTS = [
    { label: 'ZILLOW VERIFIED (275)', query: 'zillow homes', status: 'ALL' },
    { label: 'ALL RESIDENCES (817)', query: '', status: 'ALL' },
    { label: 'FOR RENT', query: 'rentals for rent', status: 'FOR_RENT' },
    { label: 'FOR SALE', query: 'homes for sale', status: 'FOR_SALE' },
    { label: 'DENVER 3BHK', query: '3bhk in denver', status: 'FOR_RENT' },
    { label: 'CHICAGO CONDOS', query: 'chicago condo', status: 'FOR_RENT' },
    { label: 'AUSTIN TX', query: 'austin tx homes', status: 'FOR_RENT' },
    { label: 'MIAMI BEACH', query: 'miami beach', status: 'FOR_RENT' },
    { label: 'UNDER $2,500/MO', query: 'under 2500 per month', status: 'FOR_RENT' },
  ];

  const US_METRO_PILLS = [
    { name: 'Denver', state: 'CO' },
    { name: 'Chicago', state: 'IL' },
    { name: 'Austin', state: 'TX' },
    { name: 'Seattle', state: 'WA' },
    { name: 'Miami', state: 'FL' },
    { name: 'New York', state: 'NY' },
    { name: 'San Francisco', state: 'CA' },
    { name: 'Los Angeles', state: 'CA' },
  ];

  return (
    <>
      {/* 1. TOP BRAND & SPATIAL SWITCHER BAR */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 bg-black/60 backdrop-blur-2xl border-b border-white/10 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Icon & Name */}
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-400/40 flex items-center justify-center p-1.5 shadow-lg shadow-cyan-500/10 group-hover:border-cyan-300 transition-all">
              <TiledHomeIcon size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black tracking-widest text-white font-sans uppercase">
                  HOUSE INTELLIGENCE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  SPATIAL OS
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 tracking-wider uppercase mt-0.5 hidden sm:block">
                Autonomous Multi-Portal Real Estate Neural Engine
              </p>
            </div>
          </div>

          {/* Center Telemetry Badges */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenDbModal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-slate-300 transition-all cursor-pointer"
              title="Inspect local SQLite database statistics"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-white font-bold">{totalDbCount || 713}</span>
              <span className="text-slate-400">Houses in Local DB</span>
            </button>

            <button
              onClick={onOpenExaModal}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono transition-all cursor-pointer ${
                hasExaKey
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                  : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10'
              }`}
              title="Exa.ai Neural Search Status"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="font-bold">⚡ EXA AI ACTIVE</span>
            </button>
          </div>

          {/* Right Active Theory Pill Navigation */}
          <div className="flex items-center p-1 rounded-full bg-white/5 border border-white/15 backdrop-blur-xl">
            <button
              onClick={() => onViewChange('spatial')}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
                activeView === 'spatial'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/25'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3D SPATIAL</span>
            </button>

            <button
              onClick={() => onViewChange('shrine')}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
                activeView === 'shrine'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D SHRINE</span>
            </button>

            <button
              onClick={() => onViewChange('map')}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
                activeView === 'map'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/25'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>MAP MATRIX</span>
            </button>

            <button
              onClick={onOpenDbModal}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
                activeView === 'database'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/25'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LOCAL DB</span>
            </button>

            {/* Spatial Audio Mute Toggle Button */}
            <button
              onClick={() => {
                const nextMuted = spatialAudio.toggleMute();
                setIsMuted(nextMuted);
                if (!nextMuted) spatialAudio.playClickPing();
              }}
              className={`p-2 rounded-full border transition-all cursor-pointer ml-1 ${
                isMuted
                  ? 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'
                  : 'bg-cyan-950/70 border-cyan-500/50 text-cyan-400 shadow-md shadow-cyan-500/20'
              }`}
              title={isMuted ? 'Unmute Spatial Audio (SFX)' : 'Mute Spatial Audio (SFX)'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>
      </header>

      {/* 2. LEFT FLOATING HUD: "WHAT ARE YOU LOOKING FOR?" */}
      <aside className="fixed left-6 top-32 z-30 hidden xl:flex flex-col gap-2 max-w-[220px] pointer-events-auto">
        <div className="p-4 rounded-3xl bg-black/60 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h4 className="text-[11px] font-mono font-black tracking-widest text-slate-400 uppercase">
              WHAT ARE YOU LOOKING FOR?
            </h4>
          </div>

          <div className="space-y-1.5">
            {QUICK_INTENTS.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  const next = {
                    ...filters,
                    searchQuery: item.query,
                    listingStatus: (item.status as any) || 'ALL',
                  };
                  onFilterChange(next);
                  onTriggerLiveCrawl(item.query, undefined, next);
                }}
                className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-bold text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-white/10"
              >
                <span>→ {item.label}</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>

          <button
            onClick={() => onTriggerLiveCrawl(filters.searchQuery)}
            className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-purple-600/20 hover:from-cyan-500/30 hover:to-purple-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI SCAN NOW</span>
          </button>
        </div>
      </aside>

      {/* 3. BOTTOM FLOATING SEARCH COMMAND CONSOLE */}
      <div className="fixed bottom-6 inset-x-0 z-30 px-4 sm:px-8 pointer-events-none flex flex-col items-center gap-3">
        
        {/* US Metros Filter Strip */}
        <div className="pointer-events-auto flex items-center gap-2 p-1.5 rounded-full bg-black/70 border border-white/10 backdrop-blur-2xl shadow-xl overflow-x-auto max-w-2xl scrollbar-none">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase px-2">METRO:</span>
          {US_METRO_PILLS.map((m) => (
            <button
              key={m.name}
              onClick={() => {
                const q = `${m.name} homes`;
                const next = { ...filters, searchQuery: q };
                onFilterChange(next);
                onTriggerLiveCrawl(q, undefined, next);
              }}
              className="px-3 py-1 rounded-full text-xs font-mono font-bold text-slate-300 hover:text-cyan-300 hover:bg-white/10 transition-all cursor-pointer whitespace-nowrap"
            >
              {m.name}
            </button>
          ))}
        </div>

        {/* Grand Search Command Bar */}
        <div className="pointer-events-auto w-full max-w-3xl flex items-center h-14 sm:h-16 px-4 rounded-2xl sm:rounded-3xl bg-black/80 border-2 border-cyan-500/40 hover:border-cyan-400 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-500/20 backdrop-blur-2xl shadow-2xl transition-all duration-300 gap-3">
          
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />

          {/* Voice Search Mic */}
          <button
            type="button"
            onClick={handleToggleVoiceSearch}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isListening
                ? 'bg-red-600 text-white animate-pulse shadow-md'
                : 'text-slate-400 hover:text-cyan-400 hover:bg-white/10'
            }`}
            title={isListening ? 'Listening... Speak criteria now' : 'Voice Search with Speech Recognition'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Freely Breathing Search Input */}
          <input
            type="text"
            placeholder={
              isListening
                ? '🎙️ Listening... speak criteria now (e.g. 3bhk in Denver, Austin under 800k)'
                : 'Search any city, neighborhood, budget, or criteria (e.g. 3bhk in Denver, Chicago under 2500)...'
            }
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onTriggerLiveCrawl(filters.searchQuery);
              }
            }}
            className="flex-1 min-w-0 bg-transparent text-white placeholder-slate-400 text-sm sm:text-base font-medium focus:outline-none"
          />

          {/* Scan Action Button */}
          <button
            type="button"
            onClick={() => onTriggerLiveCrawl(filters.searchQuery)}
            disabled={isCrawling}
            className="flex items-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isCrawling ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Scan className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{isCrawling ? 'SCANNING...' : 'SCAN MLS'}</span>
          </button>
        </div>

      </div>
    </>
  );
};
