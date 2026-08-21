'use client';

import React, { useState, useMemo } from 'react';
import { 
  Bot, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  Building2, 
  Lightbulb, 
  GraduationCap, 
  RotateCw, 
  FileText, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Lock,
  ArrowRight,
  Gauge
} from 'lucide-react';
import { ShikaakPropertyListing } from '../../types/property';
import { MultiAgentExecutiveBrief, IndividualAgentSynthesis } from '../../types/intelligence';
import { generateMultiAgentExecutiveBrief } from '../../lib/multi-agent-orchestrator';

interface MultiAgentSynthesisConsoleProps {
  listing: ShikaakPropertyListing;
}

export const MultiAgentSynthesisConsole: React.FC<MultiAgentSynthesisConsoleProps> = ({ listing }) => {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'VERIFIED'>('ALL');

  // Compute multi-agent brief
  const brief: MultiAgentExecutiveBrief = useMemo(() => {
    return generateMultiAgentExecutiveBrief(listing);
  }, [listing]);

  const handleRerunSwarm = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
    }, 800);
  };

  const domainIcons: Record<string, React.ReactNode> = {
    VISION_STRUCTURAL: <Building2 className="w-4 h-4 text-red-500" />,
    GEOTECHNICAL_SUBSURFACE: <Layers className="w-4 h-4 text-amber-600" />,
    PREDICTIVE_MACRO: <TrendingUp className="w-4 h-4 text-blue-600" />,
    FINANCIAL_UNDERWRITING: <Activity className="w-4 h-4 text-emerald-600" />,
    CIVIC_INFRASTRUCTURE: <Lightbulb className="w-4 h-4 text-purple-600" />,
    ACADEMIC_PROXIMITY: <GraduationCap className="w-4 h-4 text-indigo-600" />,
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-red-100 p-6 sm:p-8 lg:p-10 shadow-sm space-y-8">
      
      {/* Top Header & Live Swarm Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center font-bold shadow-sm">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-500">
                Autonomous AI Swarm Intelligence
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                6 Agents Active & Synced
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Multi-Agent Executive Synthesis Console
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRerunSwarm}
            disabled={isSynthesizing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 text-red-500 ${isSynthesizing ? 'animate-spin' : ''}`} />
            <span>{isSynthesizing ? 'Synthesizing Swarm...' : 'Re-Execute Swarm'}</span>
          </button>
        </div>
      </div>

      {/* Executive Brief Card (Grammatically Pristine Presentation) */}
      <div className="p-6 sm:p-7 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Unified Institutional Rating
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900">
                {brief.overallInstitutionalRating.toFixed(1)} <span className="text-lg font-normal text-slate-500">/ 10.0</span>
              </span>
              <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500 text-white shadow-sm">
                {brief.overallVerdict.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Alpha Potential</span>
              <span className="text-base font-bold font-mono text-emerald-600">{brief.alphaOpportunityIndex}%</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Risk Index</span>
              <span className="text-base font-bold font-mono text-slate-800">{brief.riskIndex} / 100</span>
            </div>
          </div>
        </div>

        {/* Executive Prose */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-red-500" />
            <span>Autonomous Executive Brief</span>
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200/80 font-normal">
            {brief.executiveProseSummary}
          </p>
        </div>
      </div>

      {/* 6 Specialized Sub-Agents Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Bot className="w-4 h-4 text-red-500" />
            <span>Specialized Domain Sub-Agents ({brief.agentReports.length})</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">Click any agent to inspect full forensic findings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brief.agentReports.map((agent) => {
            const isSelected = selectedAgentId === agent.agentId;

            return (
              <div
                key={agent.agentId}
                onClick={() => setSelectedAgentId(isSelected ? null : agent.agentId)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-red-50/40 border-red-400 ring-1 ring-red-400/30'
                    : 'bg-slate-50/70 border-slate-200 hover:border-red-200 hover:bg-white'
                }`}
              >
                {/* Agent Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-sm">
                        {domainIcons[agent.domain]}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                        {agent.confidenceScore}% Confidence
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-slate-400">
                      {isSelected ? <ChevronUp className="w-4 h-4 text-red-500" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {agent.agentName}
                  </h4>
                  <p className="text-xs font-semibold text-red-600">
                    {agent.executiveVerdict}
                  </p>
                </div>

                {/* Key Findings List */}
                <div className="space-y-2 text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-100">
                  <ul className="space-y-1.5 list-disc list-inside">
                    {agent.keyFindings.slice(0, isSelected ? undefined : 2).map((finding, fIdx) => (
                      <li key={fIdx} className="leading-relaxed">
                        <span className="font-normal text-slate-700">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Telemetry Metrics Pill Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 font-mono text-[11px]">
                  {Object.entries(agent.telemetryMetrics).map(([k, v], mIdx) => (
                    <div key={mIdx} className="bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/60">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">{k}</span>
                      <span className="font-bold text-slate-800 truncate block">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
