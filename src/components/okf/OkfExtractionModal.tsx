'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  X, 
  Download, 
  Copy, 
  Check, 
  Layers, 
  Database, 
  Building, 
  Sparkles,
  ExternalLink,
  Code
} from 'lucide-react';
import { ShikaakPropertyListing } from '../../types/property';
import { extractPropertyToOkf, OkfDocument } from '../../lib/okf/okf-extractor';

interface OkfExtractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedListing: ShikaakPropertyListing | null;
  allListings: ShikaakPropertyListing[];
  onSelectProperty?: (listing: ShikaakPropertyListing) => void;
}

export const OkfExtractionModal: React.FC<OkfExtractionModalProps> = ({
  isOpen,
  onClose,
  selectedListing,
  allListings,
  onSelectProperty,
}) => {
  const [activeProperty, setActiveProperty] = useState<ShikaakPropertyListing | null>(selectedListing || allListings[0] || null);
  const [okfDoc, setOkfDoc] = useState<OkfDocument | null>(null);
  const [viewMode, setViewMode] = useState<'DOCUMENT' | 'RAW_YAML'>('DOCUMENT');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (selectedListing) {
      setActiveProperty(selectedListing);
    } else if (!activeProperty && allListings.length > 0) {
      setActiveProperty(allListings[0]);
    }
  }, [selectedListing, allListings]);

  useEffect(() => {
    if (activeProperty) {
      const doc = extractPropertyToOkf(activeProperty);
      setOkfDoc(doc);
    }
  }, [activeProperty]);

  if (!isOpen || !activeProperty || !okfDoc) return null;

  const handleCopyMarkdown = () => {
    if (!okfDoc) return;
    navigator.clipboard.writeText(okfDoc.markdown);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!okfDoc) return;
    const blob = new Blob([okfDoc.markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${okfDoc.frontmatter.id}.okf.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-wider uppercase font-sans text-slate-900">
                  OPEN KNOWLEDGE FORMAT (OKF) EXTRACTOR
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold">
                  v1.0 STRICT
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Standardized AI Knowledge Dossier with YAML Frontmatter & Interconnected Evidence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold transition-all cursor-pointer shadow-xs"
              title="Copy OKF markdown to clipboard"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{isCopied ? 'COPIED' : 'COPY OKF'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-xs"
              title="Download property dossier as .okf.md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD .OKF.MD</span>
            </button>

            <a
              href="/api/okf/export?limit=100"
              download="knowledge_bundle.okf.md"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold transition-all cursor-pointer border border-slate-200"
              title="Export full OKF multi-property bundle"
            >
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>BUNDLE (100)</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Property Selector & Mode Switcher Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-200 bg-slate-100">
          <div className="flex items-center gap-2 max-w-md w-full">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase shrink-0">Property:</span>
            <select
              value={activeProperty.id}
              onChange={(e) => {
                const found = allListings.find(l => l.id === e.target.value);
                if (found) {
                  setActiveProperty(found);
                  onSelectProperty?.(found);
                }
              }}
              className="flex-1 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-red-500 truncate"
            >
              {allListings.slice(0, 100).map(l => (
                <option key={l.id} value={l.id}>
                  [{l.sourcePortal}] {l.propertyAddress?.street || l.title} — {l.propertyAddress?.city}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setViewMode('DOCUMENT')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                viewMode === 'DOCUMENT'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              FORMATTED DOSSIER
            </button>
            <button
              onClick={() => setViewMode('RAW_YAML')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                viewMode === 'RAW_YAML'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              RAW YAML FRONTMATTER
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[620px] bg-slate-50/50">
          {viewMode === 'RAW_YAML' ? (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner whitespace-pre leading-relaxed">
              {okfDoc.rawYaml}
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              
              {/* YAML Frontmatter Preview Badge */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase pb-1 border-b border-slate-200">
                  <span>OKF Schema Header</span>
                  <span className="text-red-600">YAML VALIDATED</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                  <div><strong className="text-slate-500">ID:</strong> <span className="text-red-600 font-bold">{okfDoc.frontmatter.id}</span></div>
                  <div><strong className="text-slate-500">Portal:</strong> <span className="font-bold">{okfDoc.frontmatter.source_portal}</span></div>
                  <div><strong className="text-slate-500">Status:</strong> <span className="font-bold">{okfDoc.frontmatter.listing_status}</span></div>
                  <div><strong className="text-slate-500">Score:</strong> <span className="font-bold text-emerald-600">{okfDoc.frontmatter.institutional_underwriting.pass_flow_score} / 5.0</span></div>
                </div>
              </div>

              {/* Dossier Title */}
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 block">
                  Open Knowledge Format Entity
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  {okfDoc.frontmatter.title}
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {okfDoc.frontmatter.address.street}, {okfDoc.frontmatter.address.city}, {okfDoc.frontmatter.address.state} {okfDoc.frontmatter.address.zip_code}
                </p>
              </div>

              {/* Section 1: Institutional Underwriting Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Institutional Underwriting Metrics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Monthly Rent</span>
                    <span className="text-base font-black text-red-600 font-mono">
                      ${okfDoc.frontmatter.institutional_underwriting.monthly_rent_usd.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Purchase Price</span>
                    <span className="text-base font-black text-slate-900 font-mono">
                      ${okfDoc.frontmatter.institutional_underwriting.purchase_price_usd.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Cap Rate</span>
                    <span className="text-base font-black text-blue-600 font-mono">
                      {okfDoc.frontmatter.institutional_underwriting.cap_rate_percent}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Net Cash Flow</span>
                    <span className="text-base font-black text-emerald-600 font-mono">
                      +${okfDoc.frontmatter.institutional_underwriting.cash_flow_monthly_usd.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Ranked Schools & Malls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                    <span>Ranked Schools</span>
                    <span className="text-[10px] font-mono text-red-600 font-bold">GreatSchools</span>
                  </span>
                  <div className="space-y-1.5">
                    {okfDoc.frontmatter.amenities_and_district.ranked_schools.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-slate-200/80">
                        <span className="font-medium text-slate-800 truncate mr-2">{s.name} ({s.distance_km} km)</span>
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 font-mono font-bold text-[10px] shrink-0">
                          ★ {s.rating}/10
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                    <span>Ranked Commercial Hubs</span>
                    <span className="text-[10px] font-mono text-purple-600 font-bold">Shopping & Malls</span>
                  </span>
                  <div className="space-y-1.5">
                    {okfDoc.frontmatter.amenities_and_district.ranked_malls.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-slate-200/80">
                        <span className="font-medium text-slate-800 truncate mr-2">{m.name} ({m.distance_km} km)</span>
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-900 font-mono font-bold text-[10px] shrink-0">
                          ★ {m.rating} / 5.0
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Geotechnical & Public Safety */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Safety Corridor</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {okfDoc.frontmatter.amenities_and_district.police_safety_milestone}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Soil Bearing Mechanics</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {okfDoc.frontmatter.geotechnical.soil_bearing_psf} PSF
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Depth to Bedrock</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {okfDoc.frontmatter.geotechnical.bedrock_depth_ft} ft solid bedrock
                  </span>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
