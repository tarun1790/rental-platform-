'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Database, 
  ShieldCheck, 
  Layers, 
  ArrowUpRight,
  Info
} from 'lucide-react';
import { runVertexPredictiveValuation } from '../../lib/predictive-ai';
import { formatCurrency } from '../../lib/roi-engine';

interface VertexPredictivePanelProps {
  propertyId: string;
  purchasePrice: number;
  monthlyRent: number;
  neighborhood: string;
}

export const VertexPredictivePanel: React.FC<VertexPredictivePanelProps> = ({
  propertyId,
  purchasePrice,
  monthlyRent,
  neighborhood,
}) => {
  const [forecastMode, setForecastMode] = useState<'BASE' | 'CONSERVATIVE' | 'AGGRESSIVE'>('BASE');

  const forecast = runVertexPredictiveValuation(propertyId, purchasePrice, monthlyRent, neighborhood);

  const selectedTrajectory = 
    forecastMode === 'BASE' 
      ? forecast.baseValuationUSD 
      : forecastMode === 'CONSERVATIVE' 
      ? forecast.conservativeValuationUSD 
      : forecast.aggressiveValuationUSD;

  const fiveYearGain = selectedTrajectory[selectedTrajectory.length - 1] - purchasePrice;
  const fiveYearRoiPercent = ((fiveYearGain / purchasePrice) * 100).toFixed(1);

  return (
    <div className="space-y-6 select-none">
      
      {/* Top Banner (White & Red) */}
      <div className="p-6 bg-red-50/60 text-slate-900 rounded-3xl border-2 border-red-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border-2 border-red-500 flex items-center justify-center text-red-600 shadow-md">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black uppercase tracking-wider text-slate-900">
                  Vertex AI 5-Year Predictive Valuation & Yield Modeling
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-mono font-bold">
                  AutoML Regressor v4.2
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Trained on 1.4M Cook County property assessor records and historical rent trajectories
              </p>
            </div>
          </div>

          {/* Scenario Selector */}
          <div className="flex items-center bg-white p-1 rounded-2xl border border-red-200">
            {(['CONSERVATIVE', 'BASE', 'AGGRESSIVE'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setForecastMode(mode)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  forecastMode === mode
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-red-600'
                }`}
              >
                {mode === 'BASE' ? 'Base Case (4.8%)' : mode === 'CONSERVATIVE' ? 'Conservative (2.5%)' : 'Aggressive (7.2%)'}
              </button>
            ))}
          </div>
        </div>

        {/* 5-Year Projection Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-white rounded-2xl border-2 border-red-200">
            <span className="text-[11px] text-slate-500 font-bold uppercase block">Current Valuation</span>
            <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
              {formatCurrency(purchasePrice)}
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border-2 border-red-200">
            <span className="text-[11px] text-slate-500 font-bold uppercase block">5-Year Target Valuation</span>
            <span className="text-2xl font-black text-red-600 font-mono mt-1 block">
              {formatCurrency(selectedTrajectory[selectedTrajectory.length - 1])}
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border-2 border-red-200">
            <span className="text-[11px] text-slate-500 font-bold uppercase block">Projected Capital Appreciation</span>
            <span className="text-2xl font-black text-red-600 font-mono mt-1 block">
              +{formatCurrency(fiveYearGain)} (+{fiveYearRoiPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Year-by-Year Trajectory Table (White & Red) */}
      <div className="p-6 bg-white border-2 border-red-200 rounded-3xl space-y-4 shadow-sm">
        <h4 className="text-sm font-black text-red-600 uppercase tracking-wide">
          Annualized Capital Growth & Estimated Gross Rent Trajectory
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {forecast.forecastYearSpan.map((yr, idx) => (
            <div key={yr} className="p-3.5 bg-red-50/40 border border-red-200 rounded-2xl space-y-1">
              <span className="text-[11px] font-bold text-red-700 block">{yr}</span>
              <div className="text-sm font-black text-slate-900 font-mono">
                {formatCurrency(selectedTrajectory[idx])}
              </div>
              <span className="text-[10px] text-slate-600 font-mono block">
                Cash Flow: +${Math.round((forecast.projectedAnnualCashFlowUSD[idx] || 12000) / 12)}/mo
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
