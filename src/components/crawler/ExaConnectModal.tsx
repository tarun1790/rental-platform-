'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Key, CheckCircle2, AlertCircle, ExternalLink, X, RotateCw, Globe, ShieldCheck } from 'lucide-react';
import { testExaApiKey, getExaApiKey } from '../../lib/crawler/exa-client';

interface ExaConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchWithExa?: (query: string, apiKey: string) => void;
  currentQuery?: string;
}

export const ExaConnectModal: React.FC<ExaConnectModalProps> = ({
  isOpen,
  onClose,
  onSearchWithExa,
  currentQuery = '',
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [savedKeyExists, setSavedKeyExists] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existingKey = getExaApiKey();
      if (existingKey) {
        setApiKey(existingKey);
        setSavedKeyExists(true);
      } else {
        setSavedKeyExists(false);
      }
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    if (!apiKey.trim()) {
      setTestResult({ valid: false, message: 'Please enter an Exa.ai API key.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testExaApiKey(apiKey.trim());
    setIsTesting(false);
    setTestResult(result);

    if (result.valid) {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('EXA_API_KEY', apiKey.trim());
      }
      setSavedKeyExists(true);
    }
  };

  const handleClearKey = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('EXA_API_KEY');
    }
    setApiKey('');
    setSavedKeyExists(false);
    setTestResult(null);
  };

  const handleExecuteLiveSearch = () => {
    const key = apiKey.trim() || getExaApiKey() || '';
    if (key && onSearchWithExa) {
      onSearchWithExa(currentQuery || '3bhk in denver', key);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Exa.ai Neural Search Connector</h2>
              <p className="text-xs text-rose-100 font-medium">Real-Time Multi-Portal Web Intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Information banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Globe className="w-4 h-4 text-red-600" />
              <span>Live Neural Indexing Across 5 Portals</span>
            </div>
            <p className="leading-relaxed">
              When connected, the crawler submits neural queries directly to <strong>Exa.ai</strong>, crawling live residential pages on <strong>Zillow</strong>, <strong>Redfin</strong>, <strong>Realtor.com</strong>, <strong>Apartments.com</strong>, and <strong>Trulia</strong> in real time.
            </p>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>Exa.ai API Key</span>
              </label>
              <a
                href="https://exa.ai"
                target="_blank"
                rel="noreferrer"
                className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Get API key at exa.ai</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative flex items-center">
              <input
                type="password"
                placeholder="exa_live_..."
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestResult(null);
                }}
                className="w-full h-12 px-4 pr-24 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 font-mono text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
              />
              {savedKeyExists && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="absolute right-3 px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Clear Key
                </button>
              )}
            </div>
          </div>

          {/* Feedback message */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs font-medium animate-fadeIn ${
                testResult.valid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-tight">{testResult.message}</span>
            </div>
          )}

          {/* Target Portals Indicators */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Crawled Portals & Ingestion Channels
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Zillow.com', badge: 'Live Scraped' },
                { name: 'Redfin.com', badge: 'Live Scraped' },
                { name: 'Realtor.com', badge: 'Live Scraped' },
                { name: 'Apartments.com', badge: 'Live Scraped' },
                { name: 'Trulia.com', badge: 'Live Scraped' },
              ].map((portal) => (
                <div
                  key={portal.name}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/60 text-[11px] font-bold text-slate-700"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{portal.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isTesting || !apiKey.trim()}
              onClick={handleSaveAndTest}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isTesting ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin text-red-600" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{isTesting ? 'Verifying...' : 'Verify & Save'}</span>
            </button>

            <button
              type="button"
              onClick={handleExecuteLiveSearch}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-all cursor-pointer uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Neural Scan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
