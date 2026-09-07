'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Globe, 
  Bot, 
  RotateCw, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  TrendingUp, 
  DollarSign, 
  Bed, 
  MapPin, 
  GraduationCap, 
  ShoppingBag,
  ExternalLink,
  Layers,
  Activity
} from 'lucide-react';
import { parseNlpQuery, ParsedNlpQuery } from '../../lib/nlp-search-parser';
import { crawlUsPropertyPortals, CrawlJobResult, CrawlProgressEvent } from '../../lib/crawler/multi-portal-crawler';
import { ShikaakPropertyListing } from '../../types/property';

interface NlpCrawlerSearchBarProps {
  onListingsCrawled: (crawledListings: ShikaakPropertyListing[], parsedQuery: ParsedNlpQuery) => void;
  className?: string;
}

const EXAMPLE_QUERIES = [
  "3 bed house in Lincoln Park Chicago under 800k with cap rate > 6% near top schools",
  "Denver mountain home under 1.2M with positive cash flow near parks and retail",
  "Luxury 2 bed condo in Gold Coast Chicago under 650k with high pass/flow grade",
  "Modern loft in West Loop Chicago between 500k and 900k near Whole Foods",
];

export const NlpCrawlerSearchBar: React.FC<NlpCrawlerSearchBarProps> = ({
  onListingsCrawled,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [parsed, setParsed] = useState<ParsedNlpQuery | null>(null);
  const [isCrawling, setIsCrawling] = useState(false);
  const [showRadarModal, setShowRadarModal] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState<CrawlProgressEvent[]>([]);
  const [crawlResult, setCrawlResult] = useState<CrawlJobResult | null>(null);

  // Real-time parsing of the user's sentence
  useEffect(() => {
    if (query.trim().length > 3) {
      const parsedData = parseNlpQuery(query);
      setParsed(parsedData);
    } else {
      setParsed(null);
    }
  }, [query]);

  const handleExecuteCrawl = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q.trim()) return;

    const parsedData = parseNlpQuery(q);
    setParsed(parsedData);
    setIsCrawling(true);
    setShowRadarModal(true);
    setCrawlProgress([]);
    setCrawlResult(null);

    try {
      const result = await crawlUsPropertyPortals(parsedData, {
        onProgress: (evt) => {
          setCrawlProgress((prev) => [...prev.slice(-4), evt]);
        },
      });

      // Brief pause to visualize real-time crawler completion
      setTimeout(() => {
        setCrawlResult(result);
        setIsCrawling(false);
      }, 700);
    } catch (err) {
      console.error('Crawl execution failed:', err);
      setIsCrawling(false);
    }
  };

  const handleApplyToDashboard = () => {
    if (crawlResult && crawlResult.properties.length > 0) {
      onListingsCrawled(crawlResult.properties, crawlResult.parsedQuery);
      setShowRadarModal(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      
      {/* 1. MAIN NLP INPUT BAR */}
      <div className="relative bg-white rounded-2xl border-2 border-red-200/90 shadow-md p-2 transition-all focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200">
        <div className="flex items-center gap-2">
          
          <div className="flex items-center gap-1.5 pl-2 text-red-500 shrink-0">
            <Bot className="w-5 h-5 animate-pulse" />
            <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-wider text-red-600 font-sans">
              NLP AI Crawler
            </span>
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecuteCrawl()}
              placeholder="Write any sentence: e.g. 3 bed house in Lincoln Park Chicago under 800k with cap rate > 6% near top schools..."
              className="w-full py-2 px-2 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => handleExecuteCrawl()}
            disabled={!query.trim() || isCrawling}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer shadow-sm"
          >
            {isCrawling ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span className="hidden md:inline">Crawling US Portals...</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                <span className="hidden md:inline">Crawl US Portals</span>
                <span className="md:hidden">Crawl</span>
              </>
            )}
          </button>
        </div>

        {/* 2. PARSED SEMANTIC TOKEN CHIPS (REAL-TIME VISUAL FEEDBACK) */}
        {parsed && parsed.parsedChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2.5 mt-2 border-t border-slate-100 px-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mr-1">
              Extracted Intent:
            </span>
            {parsed.parsedChips.map((chip, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-100"
              >
                <span className="text-[9px] font-bold uppercase text-slate-400">{chip.label}:</span>
                <span>{chip.value}</span>
              </span>
            ))}
          </div>
        )}

        {/* 3. PROMPT PRESETS / EXAMPLES */}
        {!query && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 mt-1 border-t border-slate-100 px-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mr-1">
              Try asking:
            </span>
            {EXAMPLE_QUERIES.map((example, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(example);
                  handleExecuteCrawl(example);
                }}
                className="text-[11px] px-2 py-0.5 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg border border-slate-200 transition-all truncate max-w-[280px] sm:max-w-none text-left"
              >
                "{example}"
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. REAL-TIME MULTI-PORTAL CRAWLER RADAR MODAL                             */}
      {/* ========================================================================= */}
      {showRadarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                      Real-Time US Multi-Portal Web Crawler
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      5 Portals Linked
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    Live Crawl: "{parsed?.rawQuery || query}"
                  </h3>
                </div>
              </div>

              {!isCrawling && (
                <button
                  onClick={() => setShowRadarModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Modal Body: Real-Time Crawler Scanner HUD */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Portals Scanning Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { name: 'Zillow', icon: '🏠', domain: 'zillow.com', desc: 'MLS & Active Rentals' },
                  { name: 'Redfin', icon: '🔴', domain: 'redfin.com', desc: 'Live Direct Feed' },
                  { name: 'Realtor', icon: '🏢', domain: 'realtor.com', desc: 'County Tax Archives' },
                  { name: 'Apartments', icon: '🏬', domain: 'apartments.com', desc: 'Floorplans & Rent' },
                  { name: 'Exa.ai', icon: '🧠', domain: 'exa.ai', desc: 'Neural Web Crawler' },
                ].map((portal, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-center space-y-1 transition-all ${
                      isCrawling
                        ? 'bg-red-50/50 border-red-300 animate-pulse'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-xl block">{portal.icon}</span>
                    <span className="text-xs font-bold text-slate-900 block">{portal.name}</span>
                    <span className="text-[9px] text-slate-400 block font-mono">{portal.domain}</span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md inline-block ${
                      isCrawling ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isCrawling ? 'Crawling...' : 'Verified'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Real-time Telemetry Terminal Logs */}
              <div className="bg-slate-900 rounded-2xl p-4 font-mono text-xs text-slate-300 space-y-1.5 shadow-inner">
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1.5 mb-2">
                  <span>LIVE CRAWLER PIPELINE TELEMETRY</span>
                  <span>{isCrawling ? 'STATUS: ACTIVE' : 'STATUS: INGESTION COMPLETE'}</span>
                </div>
                {crawlProgress.length === 0 ? (
                  <p className="text-slate-500 italic">Initializing multi-threaded scraper swarm...</p>
                ) : (
                  crawlProgress.map((evt, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-red-400">[{evt.portal}]</span>
                      <span className="text-slate-200">{evt.message}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Ingested Results Summary */}
              {crawlResult && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-bold uppercase text-emerald-800 tracking-wider">
                        {crawlResult.totalNormalized} US Properties Crawled & Underwritten
                      </span>
                    </div>
                    <span className="text-xs font-mono text-emerald-700 font-bold">
                      Latency: {crawlResult.executionDurationMs}ms
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Successfully harvested real-time listings across US portals, calculated 9-dimension telemetry (soil bearing, CPD dispatch, 5 ranked schools, 5 ranked malls), and executed institutional ROI underwriting.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {isCrawling ? 'Scanning regional MLS servers...' : 'Ready to project onto interactive dashboard.'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRadarModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyToDashboard}
                  disabled={!crawlResult || isCrawling}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>Apply to Live Map & Grid</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
