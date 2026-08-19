'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  PieChart, 
  RotateCcw,
  Building,
  Home,
  CheckCircle2
} from 'lucide-react';
import { InvestmentInputs } from '../../types/property';
import { calculateInvestmentOutputs, formatCurrency, formatPercent } from '../../lib/roi-engine';

interface RoiCalculatorWidgetProps {
  initialInputs: InvestmentInputs;
}

export const RoiCalculatorWidget: React.FC<RoiCalculatorWidgetProps> = ({ initialInputs }) => {
  const [inputs, setInputs] = useState<InvestmentInputs>(initialInputs);

  // Compute live outputs deterministically
  const outputs = calculateInvestmentOutputs(inputs);

  const handleReset = () => {
    setInputs(initialInputs);
  };

  return (
    <div className="space-y-6">
      {/* Header & Pass/Flow Verdict Banner */}
      <div className={`p-6 rounded-2xl border transition-all ${
        outputs.verdict === 'PASS_TO_FLOW'
          ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-lg'
          : outputs.verdict === 'REVIEW_MARGINAL'
          ? 'bg-amber-950/80 border-amber-500 text-white shadow-lg'
          : 'bg-rose-950/80 border-rose-500 text-white shadow-lg'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-300">
                Institutional Financial Underwriting
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white/10 rounded-full">
                Deterministic OGC Engine
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight">
                {outputs.passFlowScore.toFixed(1)} <span className="text-xl font-normal opacity-70">/ 5.0</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                outputs.verdict === 'PASS_TO_FLOW'
                  ? 'bg-emerald-500 text-slate-950'
                  : outputs.verdict === 'REVIEW_MARGINAL'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-rose-500 text-white'
              }`}>
                {outputs.verdict === 'PASS_TO_FLOW' ? '✔ PASS TO FLOW' : outputs.verdict === 'REVIEW_MARGINAL' ? '⚠️ REVIEW / MARGINAL' : '✖ NEGATIVE FLOW'}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-300 uppercase font-semibold">Monthly Net Cash Flow</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              {outputs.monthlyNetCashFlow >= 0 ? '+' : ''}{formatCurrency(outputs.monthlyNetCashFlow)}
              <span className="text-xs font-normal text-slate-300"> / mo</span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-200 border-t border-white/10 pt-2.5">
          <strong>Investment Verdict:</strong> {outputs.verdictReason}
        </p>
      </div>

      {/* Strategy Switcher: Long Term (LTR) vs Short Term (STR / Airbnb) */}
      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">Underwriting Strategy:</span>
          <div className="inline-flex p-1 bg-white border border-slate-200 rounded-lg">
            <button
              onClick={() => setInputs({ ...inputs, isShortTermRentalStrategy: false })}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                !inputs.isShortTermRentalStrategy
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Long-Term Rental (12-Mo)
            </button>
            <button
              onClick={() => setInputs({ ...inputs, isShortTermRentalStrategy: true })}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                inputs.isShortTermRentalStrategy
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Short-Term Vacation (Airbnb)
            </button>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-brand-600 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Key Ratios Dashboard Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* NOI */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">
            Annual NOI
          </span>
          <span className="text-lg font-black text-slate-900 font-mono">
            {formatCurrency(outputs.netOperatingIncomeAnnual)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Net Operating Income</span>
        </div>

        {/* Cap Rate */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">
            Cap Rate
          </span>
          <span className="text-lg font-black text-brand-600 font-mono">
            {formatPercent(outputs.capRatePercent)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Unleveraged baseline</span>
        </div>

        {/* Cash-on-Cash */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">
            Cash-on-Cash
          </span>
          <span className="text-lg font-black text-emerald-600 font-mono">
            {formatPercent(outputs.cashOnCashReturnPercent)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Yield on actual out-of-pocket</span>
        </div>

        {/* DSCR */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">
            DSCR Ratio
          </span>
          <span className="text-lg font-black text-slate-900 font-mono">
            {outputs.debtServiceCoverageRatio.toFixed(2)}x
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Target ≥ 1.25x</span>
        </div>
      </div>

      {/* Interactive Sliders Workstation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
        
        {/* Column 1: Acquisition & Financing */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            1. Purchase & Financing
          </h4>

          {/* Purchase Price */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Purchase Price</span>
              <span className="font-bold text-slate-900 font-mono">{formatCurrency(inputs.purchasePrice)}</span>
            </div>
            <input
              type="range"
              min="200000"
              max="2500000"
              step="10000"
              value={inputs.purchasePrice}
              onChange={(e) => setInputs({ ...inputs, purchasePrice: Number(e.target.value) })}
              className="w-full accent-brand-600"
            />
          </div>

          {/* Down Payment */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Down Payment ({inputs.downPaymentPercent}%)</span>
              <span className="font-bold text-slate-900 font-mono">
                {formatCurrency(inputs.purchasePrice * (inputs.downPaymentPercent / 100))}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={inputs.downPaymentPercent}
              onChange={(e) => setInputs({ ...inputs, downPaymentPercent: Number(e.target.value) })}
              className="w-full accent-brand-600"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Mortgage Interest Rate</span>
              <span className="font-bold text-slate-900 font-mono">{inputs.interestRatePercent.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              min="3.0"
              max="12.0"
              step="0.1"
              value={inputs.interestRatePercent}
              onChange={(e) => setInputs({ ...inputs, interestRatePercent: Number(e.target.value) })}
              className="w-full accent-brand-600"
            />
          </div>

          {/* Monthly Debt Service Display */}
          <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-600">Principal & Interest (P&I):</span>
            <span className="font-black text-slate-900 font-mono">
              {formatCurrency(outputs.monthlyDebtService)} / mo
            </span>
          </div>
        </div>

        {/* Column 2: Revenue & Operations */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            2. Revenue & Operating Expenses
          </h4>

          {/* Monthly Gross Rent or STR params */}
          {!inputs.isShortTermRentalStrategy ? (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Expected Monthly Gross Rent</span>
                <span className="font-bold text-emerald-600 font-mono">{formatCurrency(inputs.monthlyGrossRent)}/mo</span>
              </div>
              <input
                type="range"
                min="1000"
                max="15000"
                step="50"
                value={inputs.monthlyGrossRent}
                onChange={(e) => setInputs({ ...inputs, monthlyGrossRent: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">STR Daily Nightly Rate</span>
                  <span className="font-bold text-emerald-600 font-mono">{formatCurrency(inputs.strDailyRate || 320)}/night</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1200"
                  step="10"
                  value={inputs.strDailyRate || 320}
                  onChange={(e) => setInputs({ ...inputs, strDailyRate: Number(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">STR Occupancy Rate</span>
                  <span className="font-bold text-slate-900 font-mono">{inputs.strOccupancyRate || 75}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="95"
                  step="1"
                  value={inputs.strOccupancyRate || 75}
                  onChange={(e) => setInputs({ ...inputs, strOccupancyRate: Number(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>
          )}

          {/* Property Tax & Insurance */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Property Tax ($/mo)</label>
              <input
                type="number"
                value={inputs.monthlyPropertyTax}
                onChange={(e) => setInputs({ ...inputs, monthlyPropertyTax: Number(e.target.value) })}
                className="w-full text-xs font-mono p-2 bg-white border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Insurance ($/mo)</label>
              <input
                type="number"
                value={inputs.monthlyInsurance}
                onChange={(e) => setInputs({ ...inputs, monthlyInsurance: Number(e.target.value) })}
                className="w-full text-xs font-mono p-2 bg-white border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Maintenance & Management % */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                CapEx & Maint: {inputs.maintenanceAndCapExPercent}%
              </label>
              <input
                type="range"
                min="3"
                max="15"
                step="1"
                value={inputs.maintenanceAndCapExPercent}
                onChange={(e) => setInputs({ ...inputs, maintenanceAndCapExPercent: Number(e.target.value) })}
                className="w-full accent-brand-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Mgmt Fee: {inputs.propertyManagementPercent}%
              </label>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={inputs.propertyManagementPercent}
                onChange={(e) => setInputs({ ...inputs, propertyManagementPercent: Number(e.target.value) })}
                className="w-full accent-brand-600"
              />
            </div>
          </div>

          {/* Total Monthly Operating Costs */}
          <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-600">Total Monthly Operating Expenses:</span>
            <span className="font-black text-rose-600 font-mono">
              -{formatCurrency(outputs.monthlyOperatingExpenses)} / mo
            </span>
          </div>
        </div>
      </div>

      {/* Underwriting Breakdown Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider">
            Monthly Cash Inflow / Outflow Schedule
          </span>
          <span className="font-mono text-emerald-400 font-bold">
            Gross: {formatCurrency(outputs.grossAnnualRevenue / 12)}/mo
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="p-3 flex items-center justify-between">
            <span className="font-medium text-slate-700">Gross Monthly Rent Revenue</span>
            <span className="font-bold text-emerald-600 font-mono">
              +{formatCurrency(outputs.grossAnnualRevenue / 12)}
            </span>
          </div>

          <div className="p-3 flex items-center justify-between bg-slate-50/50">
            <span className="text-slate-600">Vacancy Reserve ({inputs.vacancyRatePercent}%)</span>
            <span className="font-mono text-slate-600">
              -{formatCurrency((outputs.grossAnnualRevenue * (inputs.vacancyRatePercent / 100)) / 12)}
            </span>
          </div>

          <div className="p-3 flex items-center justify-between">
            <span className="text-slate-600">Property Taxes & Homeowners Insurance</span>
            <span className="font-mono text-slate-600">
              -{formatCurrency((inputs.monthlyPropertyTax || 0) + (inputs.monthlyInsurance || 0))}
            </span>
          </div>

          <div className="p-3 flex items-center justify-between bg-slate-50/50">
            <span className="text-slate-600">
              CapEx Reserves ({inputs.maintenanceAndCapExPercent || 1}%) & Management ({inputs.propertyManagementPercent || 7}%)
            </span>
            <span className="font-mono text-slate-600">
              -{formatCurrency((((inputs.maintenanceAndCapExPercent || 1) + (inputs.propertyManagementPercent || 7)) / 100 * (outputs.grossAnnualRevenue / 12)))}
            </span>
          </div>

          <div className="p-3 flex items-center justify-between font-semibold text-slate-900">
            <span>Net Operating Income (NOI / Month)</span>
            <span className="font-mono text-slate-900">
              {formatCurrency(outputs.netOperatingIncomeAnnual / 12)}
            </span>
          </div>

          <div className="p-3 flex items-center justify-between bg-rose-50/50 text-rose-700">
            <span>Mortgage Debt Service (Principal & Interest)</span>
            <span className="font-mono font-bold">
              -{formatCurrency(outputs.monthlyDebtService)}
            </span>
          </div>

          <div className="p-4 flex items-center justify-between bg-emerald-50 text-emerald-900 font-black text-sm">
            <span>Net Cash Flow in Your Pocket (Monthly)</span>
            <span className="font-mono text-base text-emerald-600">
              +{formatCurrency(outputs.monthlyNetCashFlow)} / month
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
