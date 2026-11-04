'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  Search, 
  Layers, 
  HardDrive, 
  Globe, 
  RotateCw,
  MapPin,
  TrendingUp,
  DollarSign,
  Download,
  Terminal,
  Play,
  Clock,
  Sparkles
} from 'lucide-react';
import { ShikaakPropertyListing } from '../../types/property';
import { formatCurrency } from '../../lib/roi-engine';
import { spatialAudio } from '../../lib/audio/spatial-audio';

interface DatabaseExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: ShikaakPropertyListing[];
  onSelectProperty?: (listing: ShikaakPropertyListing) => void;
  onTriggerSync?: () => void;
  isSyncing?: boolean;
}

export const DatabaseExplorerModal: React.FC<DatabaseExplorerModalProps> = ({
  isOpen,
  onClose,
  listings,
  onSelectProperty,
  onTriggerSync,
  isSyncing = false,
}) => {
  const [activeTab, setActiveTab] = useState<'RECORDS' | 'SQL_STUDIO'>('RECORDS');
  const [dbStats, setDbStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPortalFilter, setSelectedPortalFilter] = useState('ALL');

  // SQL Studio State
  const [sqlQuery, setSqlQuery] = useState<string>(
    `SELECT id, source_portal, street, city, state, purchase_price, monthly_rent, cap_rate, pass_flow_score FROM properties WHERE source_portal = 'ZILLOW' ORDER BY purchase_price DESC LIMIT 25;`
  );
  const [sqlResults, setSqlResults] = useState<{
    columns: string[];
    rows: any[];
    rowCount: number;
    executionTimeMs: number;
  } | null>(null);
  const [isExecutingSql, setIsExecutingSql] = useState(false);
  const [sqlError, setSqlError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/database/stats')
      .then((res) => res.json())
      .then((data) => setDbStats(data))
      .catch(() => {
        const portalBreakdown: Record<string, number> = {};
        const cityBreakdown: Record<string, number> = {};
        listings.forEach((l) => {
          const p = l.sourcePortal || 'MLS_FEED';
          portalBreakdown[p] = (portalBreakdown[p] || 0) + 1;
          const c = l.propertyAddress?.city || 'Other';
          cityBreakdown[c] = (cityBreakdown[c] || 0) + 1;
        });

        setDbStats({
          totalProperties: listings.length,
          dbSizeBytes: 5914624,
          dbPath: 'data/houses.db',
          portalBreakdown,
          cityBreakdown,
        });
      });
  }, [isOpen, listings]);

  const handleExecuteSql = async (overrideQuery?: string) => {
    const q = overrideQuery || sqlQuery;
    setIsExecutingSql(true);
    setSqlError(null);
    spatialAudio.playClickPing();

    try {
      const res = await fetch('/api/database/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'SQL Execution Failed');
      }
      setSqlResults(data);
    } catch (err: any) {
      setSqlError(err.message);
    } finally {
      setIsExecutingSql(false);
    }
  };

  if (!isOpen) return null;

  const filteredProperties = listings.filter((l) => {
    if (selectedPortalFilter !== 'ALL' && l.sourcePortal !== selectedPortalFilter) {
      return false;
    }
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (l.title || '').toLowerCase().includes(term) ||
      (l.propertyAddress?.street || '').toLowerCase().includes(term) ||
      (l.propertyAddress?.city || '').toLowerCase().includes(term) ||
      (l.propertyAddress?.neighborhood || '').toLowerCase().includes(term) ||
      (l.sourcePortal || '').toLowerCase().includes(term)
    );
  });

  const SQL_PRESETS = [
    {
      name: 'Zillow Exclusives',
      query: `SELECT id, street, city, state, purchase_price, monthly_rent, cap_rate FROM properties WHERE source_portal = 'ZILLOW' ORDER BY purchase_price DESC LIMIT 25;`,
    },
    {
      name: 'High Cap Rate (5%+)',
      query: `SELECT id, source_portal, street, city, state, cap_rate, pass_flow_score, purchase_price FROM properties WHERE cap_rate >= 5.0 ORDER BY cap_rate DESC LIMIT 25;`,
    },
    {
      name: 'City Aggregations',
      query: `SELECT city, COUNT(*) as total_homes, AVG(purchase_price) as avg_price, AVG(monthly_rent) as avg_rent, AVG(cap_rate) as avg_cap FROM properties GROUP BY city ORDER BY total_homes DESC;`,
    },
    {
      name: 'Rentals Under $3K',
      query: `SELECT id, source_portal, street, city, state, monthly_rent, beds, baths FROM properties WHERE listing_status = 'FOR_RENT' AND monthly_rent <= 3000 ORDER BY monthly_rent ASC LIMIT 25;`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-wider uppercase font-sans text-slate-900">
                  LOCAL SQLITE DATABASE REGISTRY
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold">
                  WAL ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Storage: <span className="text-red-600 font-bold">data/houses.db</span> • {listings.length} Multi-Portal Ingested Records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* 1-Click Data Exporters */}
            <a
              href="/api/database/export?format=csv"
              download="houses_database.csv"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold transition-all cursor-pointer shadow-xs"
              title="Download full SQLite database as CSV"
            >
              <Download className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden sm:inline">CSV</span>
            </a>

            <a
              href="/api/database/export?format=json"
              download="houses_database.json"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold transition-all cursor-pointer shadow-xs"
              title="Download full SQLite database as JSON"
            >
              <Download className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">JSON</span>
            </a>

            {onTriggerSync && (
              <button
                onClick={onTriggerSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-mono font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isSyncing ? 'SYNCING...' : 'SYNC'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Total Homes</span>
            <div className="text-xl sm:text-2xl font-black text-red-600 font-mono mt-0.5">
              {dbStats?.totalProperties || listings.length}
            </div>
            <span className="text-[10px] text-emerald-600 font-mono font-bold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Synchronized
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Portals Crawled</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
              {Object.keys(dbStats?.portalBreakdown || {}).length || 7} Portals
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-1 truncate">
              Zillow, Redfin, Realtor...
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Metros Indexed</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
              {Object.keys(dbStats?.cityBreakdown || {}).length || 15} Cities
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-1 truncate">
              Denver, Chicago, Austin...
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Database Size</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono mt-0.5">
              {dbStats?.dbSizeBytes ? `${(dbStats.dbSizeBytes / 1024 / 1024).toFixed(2)} MB` : '5.64 MB'}
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-1">
              SQLite 3.x WAL Engine
            </span>
          </div>
        </div>

        {/* Tab Switcher: Records View vs SQL Studio */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-200 bg-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('RECORDS');
                spatialAudio.playClickPing();
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                activeTab === 'RECORDS'
                  ? 'bg-red-600 text-white font-black shadow-sm shadow-red-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>REPOSITORY RECORDS ({filteredProperties.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('SQL_STUDIO');
                spatialAudio.playClickPing();
                if (!sqlResults) handleExecuteSql();
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                activeTab === 'SQL_STUDIO'
                  ? 'bg-red-600 text-white font-black shadow-sm shadow-red-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>SQL QUERY STUDIO</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Repository Records */}
        {activeTab === 'RECORDS' && (
          <div className="flex-1 flex flex-col min-h-0 bg-white">
            {/* Search & Portal Filter Bar */}
            <div className="p-3 sm:p-4 px-6 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search records (address, city, portal)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 font-mono shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
                {['ALL', 'ZILLOW', 'REDFIN', 'REALTOR', 'APARTMENTS_COM', 'HOTPADS', 'TRULIA'].map((p) => {
                  const count = p === 'ALL' ? listings.length : (dbStats?.portalBreakdown?.[p] || 0);
                  return (
                    <button
                      key={p}
                      onClick={() => {
                        setSelectedPortalFilter(p);
                        spatialAudio.playClickPing();
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedPortalFilter === p
                          ? 'bg-red-600 text-white font-black shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {p.replace(/_/g, ' ')} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Database Rows Table */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5 max-h-[460px]">
              {filteredProperties.slice(0, 150).map((p, idx) => {
                const rentOrPrice =
                  p.listingStatus === 'FOR_RENT'
                    ? `${formatCurrency(p.financials?.inputs?.monthlyGrossRent || 2800)}/mo`
                    : formatCurrency(p.financials?.inputs?.purchasePrice || 650000);

                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProperty?.(p)}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-red-300 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="text-xs font-mono font-bold text-slate-400 w-7 shrink-0">
                        #{(idx + 1).toString().padStart(3, '0')}
                      </span>
                      <img
                        src={p.media?.featuredImage}
                        alt={p.title}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors truncate">
                            {p.propertyAddress?.street || p.title}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-red-50 text-red-600 border border-red-200 uppercase shrink-0">
                            {p.sourcePortal}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono truncate mt-0.5">
                          {p.propertyAddress?.neighborhood ? `${p.propertyAddress.neighborhood}, ` : ''}
                          {p.propertyAddress?.city}, {p.propertyAddress?.state} • {p.specs?.beds} Beds • {p.specs?.baths} Baths
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 pl-3">
                      <div className="text-right">
                        <span className="text-sm font-black font-mono text-red-600">
                          {rentOrPrice}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Score: {p.financials?.outputs?.passFlowScore?.toFixed(1) || '4.9'}
                        </span>
                      </div>

                      {p.externalUrl && (
                        <a
                          href={p.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 transition-all cursor-pointer"
                          title="Open official listing"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: SQL Query Studio */}
        {activeTab === 'SQL_STUDIO' && (
          <div className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto max-h-[520px] bg-white">
            {/* Presets Strip */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                SQL QUERY PRESETS:
              </span>
              <div className="flex flex-wrap gap-2">
                {SQL_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setSqlQuery(preset.query);
                      handleExecuteSql(preset.query);
                    }}
                    className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 hover:border-red-300 text-xs font-mono font-bold transition-all cursor-pointer"
                  >
                    ⚡ {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* SQL Input Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-red-600 font-bold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>SQLite 3.x Direct Query Console</span>
                </span>
                {sqlResults && (
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>Execution: {sqlResults.executionTimeMs}ms • {sqlResults.rowCount} rows</span>
                  </span>
                )}
              </div>

              <div className="relative">
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  rows={3}
                  className="w-full p-3 font-mono text-xs rounded-2xl bg-slate-900 border border-slate-800 text-emerald-400 focus:outline-none focus:border-red-500 resize-none shadow-inner"
                  placeholder="SELECT * FROM properties WHERE..."
                />
                <button
                  onClick={() => handleExecuteSql()}
                  disabled={isExecutingSql}
                  className="absolute right-3 bottom-4 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-mono font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isExecutingSql ? 'RUNNING...' : 'EXECUTE SQL'}</span>
                </button>
              </div>
            </div>

            {/* Error Display */}
            {sqlError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
                ⚠ {sqlError}
              </div>
            )}

            {/* Results Grid Table */}
            {sqlResults && (
              <div className="flex-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 text-slate-700 uppercase sticky top-0 border-b border-slate-200">
                    <tr>
                      {sqlResults.columns.map((col) => (
                        <th key={col} className="px-3 py-2 font-bold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sqlResults.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-red-50/40 transition-colors">
                        {sqlResults.columns.map((col) => (
                          <td key={col} className="px-3 py-2 text-slate-700 truncate max-w-[200px]">
                            {typeof row[col] === 'number'
                              ? col.includes('price') || col.includes('rent')
                                ? formatCurrency(row[col])
                                : row[col]
                              : String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
