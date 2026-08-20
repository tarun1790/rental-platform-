'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calculator, 
  RotateCcw, 
  DollarSign, 
  Percent, 
  TrendingUp, 
  ShieldCheck, 
  Building, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { ShikaakPropertyListing, InvestmentInputs } from '../../types/property';
import { calculateInvestmentOutputs, formatCurrency, formatPercent } from '../../lib/roi-engine';

interface HouseRoiCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ShikaakPropertyListing;
}

export const HouseRoiCalculatorModal: React.FC<HouseRoiCalculatorModalProps> = ({
  isOpen,
  onClose,
  listing,
}) => {
  const defaultInputs: InvestmentInputs = listing.financials.inputs;
  const [inputs, setInputs] = useState<InvestmentInputs>(defaultInputs);

  useEffect(() => {
    setInputs(listing.financials.inputs);
  }, [listing]);

  if (!isOpen) return null;

  const outputs = calculateInvestmentOutputs(inputs);

  const handleReset = () => {
    setInputs(defaultInputs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                  Custom Financial Underwriting
                </span>
                <span className="text-xs font-mono text-slate-400">• {listing.propertyAddress.city}, {listing.propertyAddress.state}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                ROI Calculator: {listing.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Dual Column (Inputs on Left, Live Computed Verdict on Right) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Top Live Verdict Card */}
          <div className={`p-5 rounded-2xl border transition-all ${
            outputs.verdict === 'PASS_TO_FLOW'
              ? 'bg-emerald-50/80 border-emerald-300 text-slate-900'
              : outputs.verdict === 'REVIEW_MARGINAL'
              ? 'bg-amber-50/80 border-amber-300 text-slate-900'
              : 'bg-rose-50/80 border-rose-300 text-slate-900'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Institutional Pass/Flow Underwriting Score
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-3xl font-black font-mono text-slate-900">
                    {outputs.passFlowScore.toFixed(1)} <span className="text-lg font-normal text-slate-500">/ 5.0</span>
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    outputs.verdict === 'PASS_TO_FLOW'
                      ? 'bg-emerald-600 text-white'
                      : outputs.verdict === 'REVIEW_MARGINAL'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}>
                    {outputs.verdict === 'PASS_TO_FLOW' ? '✔ Pass to Flow' : outputs.verdict === 'REVIEW_MARGINAL' ? '⚠️ Review / Marginal' : '✖ Negative Flow'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Net Monthly Cash Flow
                </span>
                <span className={`text-2xl sm:text-3xl font-black font-mono ${
                  outputs.monthlyNetCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {outputs.monthlyNetCashFlow >= 0 ? '+' : ''}{formatCurrency(outputs.monthlyNetCashFlow)}
                  <span className="text-xs font-normal text-slate-500">/mo</span>
                </span>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200/60">
              <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Cap Rate</span>
                <span className="text-base font-bold font-mono text-slate-900">{formatPercent(outputs.capRatePercent)}</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Cash on Cash</span>
                <span className={`text-base font-bold font-mono ${outputs.cashOnCashPercent >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {formatPercent(outputs.cashOnCashPercent)}
                </span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">DSCR Ratio</span>
                <span className="text-base font-bold font-mono text-slate-900">{outputs.dscrRatio.toFixed(2)}x</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Annual NOI</span>
                <span className="text-base font-bold font-mono text-slate-900">{formatCurrency(outputs.annualNetOperatingIncome)}</span>
              </div>
            </div>
          </div>

          {/* User Input Controls (Enter Everything) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Column 1: Purchase & Financing Inputs */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-red-500" />
                <span>1. Purchase & Mortgage Financing</span>
              </h3>

              {/* Purchase Price */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1 text-slate-800">
                  <span>Purchase Price ($)</span>
                  <span className="font-mono text-red-500">{formatCurrency(inputs.purchasePrice)}</span>
                </div>
                <input
                  type="number"
                  step="5000"
                  value={inputs.purchasePrice}
                  onChange={(e) => setInputs({ ...inputs, purchasePrice: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-mono focus:border-red-400 focus:outline-none mb-2"
                />
                <input
                  type="range"
                  min="200000"
                  max="3000000"
                  step="10000"
                  value={inputs.purchasePrice}
                  onChange={(e) => setInputs({ ...inputs, purchasePrice: Number(e.target.value) })}
                  className="w-full accent-red-500"
                />
              </div>

              {/* Expected Monthly Gross Rent */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1 text-slate-800">
                  <span>Monthly Gross Rent ($)</span>
                  <span className="font-mono text-emerald-600">{formatCurrency(inputs.monthlyGrossRent)}/mo</span>
                </div>
                <input
                  type="number"
                  step="100"
                  value={inputs.monthlyGrossRent}
                  onChange={(e) => setInputs({ ...inputs, monthlyGrossRent: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-mono focus:border-red-400 focus:outline-none mb-2"
                />
                <input
                  type="range"
                  min="1000"
                  max="20000"
                  step="100"
                  value={inputs.monthlyGrossRent}
                  onChange={(e) => setInputs({ ...inputs, monthlyGrossRent: Number(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Down Payment % */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1 text-slate-800">
                  <span>Down Payment (%)</span>
                  <span className="font-mono text-slate-700">{inputs.downPaymentPercent}% ({formatCurrency(inputs.purchasePrice * (inputs.downPaymentPercent / 100))})</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={inputs.downPaymentPercent}
                  onChange={(e) => setInputs({ ...inputs, downPaymentPercent: Number(e.target.value) })}
                  className="w-full accent-red-500"
                />
              </div>

              {/* Mortgage Interest Rate */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1 text-slate-800">
                  <span>Mortgage Interest Rate (%)</span>
                  <span className="font-mono text-slate-700">{inputs.mortgageInterestRatePercent.toFixed(2)}%</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.mortgageInterestRatePercent}
                  onChange={(e) => setInputs({ ...inputs, mortgageInterestRatePercent: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-mono focus:border-red-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Column 2: Operating Expenses & Reserves Inputs */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-red-500" />
                <span>2. Operating Expenses & Taxes</span>
              </h3>

              {/* Annual Property Taxes */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Annual Property Taxes ($/year)</label>
                <input
                  type="number"
                  step="100"
                  value={inputs.propertyTaxAnnualUSD}
                  onChange={(e) => setInputs({ ...inputs, propertyTaxAnnualUSD: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-mono focus:border-red-400 focus:outline-none"
                />
              </div>

              {/* Homeowners Insurance */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Homeowners Insurance ($/month)</label>
                <input
                  type="number"
                  step="10"
                  value={inputs.insuranceMonthlyUSD}
                  onChange={(e) => setInputs({ ...inputs, insuranceMonthlyUSD: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-mono focus:border-red-400 focus:outline-none"
                />
              </div>

              {/* Property Management Fee % */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1 text-slate-800">
                  <span>Property Management Fee (%)</span>
                  <span className="font-mono text-slate-700">{inputs.managementFeePercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={inputs.managementFeePercent}
                  onChange={(e) => setInputs({ ...inputs, managementFeePercent: Number(e.target.value) })}
                  className="w-full accent-red-500"
                />
              </div>

              {/* CapEx & Maintenance Reserve % */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1 text-slate-800">
                  <span>Maintenance & CapEx Reserve (%)</span>
                  <span className="font-mono text-slate-700">{inputs.capexAndMaintenancePercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={inputs.capexAndMaintenancePercent}
                  onChange={(e) => setInputs({ ...inputs, capexAndMaintenancePercent: Number(e.target.value) })}
                  className="w-full accent-red-500"
                />
              </div>

              {/* Vacancy Rate % */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1 text-slate-800">
                  <span>Vacancy Allowance (%)</span>
                  <span className="font-mono text-slate-700">{inputs.vacancyRatePercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={inputs.vacancyRatePercent}
                  onChange={(e) => setInputs({ ...inputs, vacancyRatePercent: Number(e.target.value) })}
                  className="w-full accent-red-500"
                />
              </div>
            </div>

          </div>

          {/* Monthly Cash Breakdown Table */}
          <div className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">Monthly Cash Flow Breakdown</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block">Gross Rent</span>
                <span className="text-emerald-700 font-bold">+{formatCurrency(outputs.monthlyGrossRent)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Mortgage (P&I)</span>
                <span className="text-slate-800 font-bold">-{formatCurrency(outputs.monthlyMortgagePrincipalAndInterest)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Operating Costs</span>
                <span className="text-slate-800 font-bold">-{formatCurrency(outputs.monthlyOperatingExpenses)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Net In Pocket</span>
                <span className={`font-bold ${outputs.monthlyNetCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {outputs.monthlyNetCashFlow >= 0 ? '+' : ''}{formatCurrency(outputs.monthlyNetCashFlow)}/mo
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Computed under institutional real estate underwriting guidelines.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            Apply & Close
          </button>
        </div>

      </div>
    </div>
  );
};
