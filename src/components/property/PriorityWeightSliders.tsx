'use client';

// =========================================================================
// HOUSE INTELLIGENCE - Buyer Priority Weighting & Scoring Sliders
// Lets buyers dynamically tune priorities (Budget, Schools, Safety, Commute, Lifestyle)
// =========================================================================

import React from 'react';
import { Sliders, DollarSign, GraduationCap, ShieldCheck, Navigation, Heart, RotateCcw } from 'lucide-react';
import { BuyerPriorityWeights } from '../../types/property';
import { DEFAULT_PRIORITY_WEIGHTS } from '../../lib/scoring/property-scoring-engine';

interface PriorityWeightSlidersProps {
  weights: BuyerPriorityWeights;
  onChange: (weights: BuyerPriorityWeights) => void;
  className?: string;
}

export const PriorityWeightSliders: React.FC<PriorityWeightSlidersProps> = ({
  weights,
  onChange,
  className = '',
}) => {
  const total = weights.budget + weights.schools + weights.safety + weights.commute + weights.lifestyle;

  const handleSliderChange = (dimension: keyof BuyerPriorityWeights, rawVal: number) => {
    const val = Number((rawVal / 100).toFixed(2));
    onChange({
      ...weights,
      [dimension]: val,
    });
  };

  const handleReset = () => {
    onChange(DEFAULT_PRIORITY_WEIGHTS);
  };

  const dimensions = [
    { key: 'budget' as const, label: 'Budget & Price Fit', icon: DollarSign, color: 'text-emerald-600', val: Math.round((weights.budget / total) * 100) },
    { key: 'schools' as const, label: 'Top Schools (1-10)', icon: GraduationCap, color: 'text-blue-600', val: Math.round((weights.schools / total) * 100) },
    { key: 'safety' as const, label: 'Safety & Dispatch', icon: ShieldCheck, color: 'text-purple-600', val: Math.round((weights.safety / total) * 100) },
    { key: 'commute' as const, label: 'Commute & Highway', icon: Navigation, color: 'text-amber-600', val: Math.round((weights.commute / total) * 100) },
    { key: 'lifestyle' as const, label: 'Malls & Parks', icon: Heart, color: 'text-rose-600', val: Math.round((weights.lifestyle / total) * 100) },
  ];

  return (
    <div className={`p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Buyer Priority Weights
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">
              Personalized Decision Fit = Σ(weight × dimensionScore)
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {dimensions.map((dim) => {
          const Icon = dim.icon;
          return (
            <div key={dim.key} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${dim.color}`} />
                  <span className="text-[11px] font-bold text-slate-700">{dim.label.split(' ')[0]}</span>
                </div>
                <span className="font-mono font-black text-slate-900 text-xs">{dim.val}%</span>
              </div>

              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={dim.val}
                onChange={(e) => handleSliderChange(dim.key, parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
