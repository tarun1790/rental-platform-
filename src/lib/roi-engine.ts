// =========================================================================
// Shikaak Platform - Institutional ROI & Pass/Flow Calculation Engine
// =========================================================================

import { InvestmentInputs, InvestmentOutputs } from '../types/property';

export function calculateInvestmentOutputs(inputs: InvestmentInputs): InvestmentOutputs {
  const {
    purchasePrice,
    downPaymentPercent = 20,
    interestRatePercent = 6.5,
    loanTermYears = 30,
    monthlyGrossRent = 4000,
    vacancyRatePercent = 4.0,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyHoaDues = 0,
    maintenanceAndCapExPercent = 1.0,
    propertyManagementPercent = 7.0,
    annualPropertyTaxRatePercent = 1.95,
    annualInsuranceUSD = 1800,
    isShortTermRentalStrategy = false,
    strDailyRate = 320,
    strOccupancyRate = 75,
  } = inputs;

  // 1. Gross Revenue
  let grossAnnualRevenue: number;
  if (isShortTermRentalStrategy) {
    grossAnnualRevenue = strDailyRate * 365 * (strOccupancyRate / 100);
  } else {
    grossAnnualRevenue = monthlyGrossRent * 12;
  }

  // 2. Vacancy & Effective Gross Income
  const vacancyLoss = grossAnnualRevenue * (vacancyRatePercent / 100);
  const effectiveGrossIncome = grossAnnualRevenue - vacancyLoss;

  // 3. Operating Expenses
  const computedAnnualTax = monthlyPropertyTax !== undefined ? monthlyPropertyTax * 12 : (purchasePrice * (annualPropertyTaxRatePercent / 100));
  const computedAnnualInsurance = monthlyInsurance !== undefined ? monthlyInsurance * 12 : annualInsuranceUSD;
  const annualHoa = monthlyHoaDues * 12;
  const annualMaintenance = grossAnnualRevenue * (maintenanceAndCapExPercent / 100);
  const annualManagement = grossAnnualRevenue * (propertyManagementPercent / 100);

  const totalAnnualOperatingExpenses =
    computedAnnualTax + computedAnnualInsurance + annualHoa + annualMaintenance + annualManagement;
  const monthlyOperatingExpenses = totalAnnualOperatingExpenses / 12;

  // 4. Net Operating Income (NOI)
  const netOperatingIncomeAnnual = effectiveGrossIncome - totalAnnualOperatingExpenses;

  // 5. Debt Service (Mortgage P&I)
  const loanAmount = purchasePrice * (1 - downPaymentPercent / 100);
  let monthlyDebtService = 0;

  if (loanAmount > 0 && interestRatePercent > 0 && loanTermYears > 0) {
    const monthlyRate = interestRatePercent / 100 / 12;
    const totalPayments = loanTermYears * 12;
    monthlyDebtService =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
  }

  const annualDebtService = monthlyDebtService * 12;

  // 6. Cash Flow
  const annualNetCashFlow = netOperatingIncomeAnnual - annualDebtService;
  const monthlyNetCashFlow = annualNetCashFlow / 12;

  // 7. Core Institutional Ratios
  const capRatePercent = purchasePrice > 0 ? (netOperatingIncomeAnnual / purchasePrice) * 100 : 0;

  // Total cash invested = Down Payment + Closing Costs (~3% standard)
  const totalCashInvested = purchasePrice * (downPaymentPercent / 100) + purchasePrice * 0.03;
  const cashOnCashReturnPercent =
    totalCashInvested > 0 ? (annualNetCashFlow / totalCashInvested) * 100 : 0;

  const debtServiceCoverageRatio =
    annualDebtService > 0 ? netOperatingIncomeAnnual / annualDebtService : 99.9;

  const grossRentMultiplier =
    grossAnnualRevenue > 0 ? purchasePrice / grossAnnualRevenue : 0;

  // 8. Automated Institutional Pass / Flow Rating (1.0 to 5.0)
  let passFlowScore = 1.0;
  let verdict: 'FAIL_NEGATIVE_FLOW' | 'REVIEW_MARGINAL' | 'PASS_TO_FLOW' = 'FAIL_NEGATIVE_FLOW';
  let verdictReason = '';

  if (monthlyNetCashFlow <= 0 || debtServiceCoverageRatio < 1.0) {
    verdict = 'FAIL_NEGATIVE_FLOW';
    // Base 1.0 to 2.8 depending on how negative
    passFlowScore = Math.max(1.0, Math.min(2.8, 2.0 + monthlyNetCashFlow / 1000));
    verdictReason = `Negative cash flow (${formatCurrency(monthlyNetCashFlow)}/mo) & inadequate debt coverage (${debtServiceCoverageRatio.toFixed(2)}x DSCR)`;
  } else if (debtServiceCoverageRatio < 1.25 || monthlyNetCashFlow < 350 || capRatePercent < 4.5) {
    verdict = 'REVIEW_MARGINAL';
    passFlowScore = Math.max(3.0, Math.min(3.9, 3.0 + (debtServiceCoverageRatio - 1.0) * 2.5 + (capRatePercent - 4.5) * 0.2));
    verdictReason = `Marginal cash cushion (${formatCurrency(monthlyNetCashFlow)}/mo) — vulnerable to unexpected maintenance or rate shifts`;
  } else {
    verdict = 'PASS_TO_FLOW';
    // Score 4.0 to 5.0
    const dscrBonus = Math.min(0.4, (debtServiceCoverageRatio - 1.25) * 0.5);
    const cashFlowBonus = Math.min(0.3, (monthlyNetCashFlow - 350) / 1500);
    const cocBonus = Math.min(0.3, (cashOnCashReturnPercent - 6.0) / 10);
    passFlowScore = Math.min(5.0, Math.max(4.0, 4.0 + dscrBonus + cashFlowBonus + cocBonus));
    verdictReason = `Strong positive net yield (+${formatCurrency(monthlyNetCashFlow)}/mo), solid ${debtServiceCoverageRatio.toFixed(2)}x DSCR, & ${capRatePercent.toFixed(2)}% unleveraged Cap Rate`;
  }

  // Round values for clean display
  return {
    grossAnnualRevenue: Math.round(grossAnnualRevenue),
    netOperatingIncomeAnnual: Math.round(netOperatingIncomeAnnual),
    monthlyDebtService: Number(monthlyDebtService.toFixed(2)),
    monthlyOperatingExpenses: Number(monthlyOperatingExpenses.toFixed(2)),
    monthlyNetCashFlow: Number(monthlyNetCashFlow.toFixed(2)),
    capRatePercent: Number(capRatePercent.toFixed(2)),
    cashOnCashReturnPercent: Number(cashOnCashReturnPercent.toFixed(2)),
    debtServiceCoverageRatio: Number(debtServiceCoverageRatio.toFixed(2)),
    grossRentMultiplier: Number(grossRentMultiplier.toFixed(2)),
    passFlowScore: Number(passFlowScore.toFixed(1)),
    verdict,
    verdictReason,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
