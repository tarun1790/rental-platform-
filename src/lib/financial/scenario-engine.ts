// =========================================================================
// HOUSE INTELLIGENCE - Multi-Scenario Financial Underwriting Engine
// 10-Line Operating Expense Model with Conservative, Base, and Optimistic Forecasts
// =========================================================================

import {
  FinancialInputs,
  MonthlyOperatingExpensesBreakdown,
  ScenarioProjection,
  MultiScenarioAnalysis,
  ShikaakPropertyListing,
} from '../../types/property';

export interface ScenarioParameters {
  rentGrowthPercentAnnual: number;
  appreciationPercentAnnual: number;
  vacancyRatePercent: number;
  maintenancePercentAnnual: number;
  managementPercent: number;
}

const DEFAULT_SCENARIOS: Record<'conservative' | 'base' | 'optimistic', ScenarioParameters> = {
  conservative: {
    rentGrowthPercentAnnual: 1.0,
    appreciationPercentAnnual: 0.5,
    vacancyRatePercent: 8.0,
    maintenancePercentAnnual: 1.8,
    managementPercent: 9.0,
  },
  base: {
    rentGrowthPercentAnnual: 3.0,
    appreciationPercentAnnual: 3.5,
    vacancyRatePercent: 4.5,
    maintenancePercentAnnual: 1.0,
    managementPercent: 7.0,
  },
  optimistic: {
    rentGrowthPercentAnnual: 4.5,
    appreciationPercentAnnual: 5.5,
    vacancyRatePercent: 2.5,
    maintenancePercentAnnual: 0.7,
    managementPercent: 6.0,
  },
};

/**
 * Calculates monthly mortgage principal & interest
 */
export function calculateMonthlyMortgage(
  purchasePrice: number,
  downPaymentPercent: number = 20,
  interestRatePercent: number = 6.5,
  loanTermYears: number = 30
): number {
  const loanAmount = purchasePrice * (1 - downPaymentPercent / 100);
  if (loanAmount <= 0 || interestRatePercent <= 0 || loanTermYears <= 0) return 0;

  const monthlyRate = interestRatePercent / 100 / 12;
  const totalMonths = loanTermYears * 12;
  const payment =
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  return Math.round(payment);
}

/**
 * Computes the detailed 10-line item monthly operating expenses
 */
export function computeDetailedExpenses(
  inputs: FinancialInputs,
  scenarioParams: ScenarioParameters = DEFAULT_SCENARIOS.base
): MonthlyOperatingExpensesBreakdown {
  const {
    purchasePrice,
    monthlyGrossRent,
    downPaymentPercent = 20,
    interestRatePercent = 6.5,
    loanTermYears = 30,
    monthlyPropertyTax,
    monthlyInsurance = 145,
    monthlyHoaDues = 0,
    annualPropertyTaxRatePercent = 1.95,
  } = inputs;

  const grossMonthlyRent = monthlyGrossRent;
  const vacancyLoss = Math.round(grossMonthlyRent * (scenarioParams.vacancyRatePercent / 100));
  const effectiveRent = grossMonthlyRent - vacancyLoss;

  const propertyManagementFee = Math.round(effectiveRent * (scenarioParams.managementPercent / 100));
  const annualMaintCost = purchasePrice * (scenarioParams.maintenancePercentAnnual / 100);
  const maintenanceReserve = Math.round((annualMaintCost * 0.6) / 12);
  const capexReserve = Math.round((annualMaintCost * 0.4) / 12);

  const propertyTaxMonthly = monthlyPropertyTax !== undefined
    ? monthlyPropertyTax
    : Math.round((purchasePrice * (annualPropertyTaxRatePercent / 100)) / 12);

  const insuranceMonthly = monthlyInsurance;
  const hoaDuesMonthly = monthlyHoaDues;
  const utilitiesMonthly = 0; // standard tenant-paid in residential leases

  const mortgageDebtService = calculateMonthlyMortgage(
    purchasePrice,
    downPaymentPercent,
    interestRatePercent,
    loanTermYears
  );

  const totalMonthlyExpenses =
    vacancyLoss +
    propertyManagementFee +
    maintenanceReserve +
    capexReserve +
    propertyTaxMonthly +
    insuranceMonthly +
    hoaDuesMonthly +
    utilitiesMonthly +
    mortgageDebtService;

  const netMonthlyCashFlow = grossMonthlyRent - totalMonthlyExpenses;

  return {
    grossMonthlyRent,
    vacancyLoss,
    propertyManagementFee,
    maintenanceReserve,
    capexReserve,
    propertyTaxMonthly,
    insuranceMonthly,
    hoaDuesMonthly,
    utilitiesMonthly,
    mortgageDebtService,
    totalMonthlyExpenses,
    netMonthlyCashFlow,
  };
}

/**
 * Projects a 5-year financial trajectory for a single economic scenario
 */
export function projectScenario(
  name: 'Conservative' | 'Base' | 'Optimistic',
  inputs: FinancialInputs,
  params: ScenarioParameters
): ScenarioProjection {
  const expenses = computeDetailedExpenses(inputs, params);
  const { purchasePrice, downPaymentPercent = 20, interestRatePercent = 6.5, loanTermYears = 30 } = inputs;

  const initialLoanAmount = purchasePrice * (1 - downPaymentPercent / 100);
  const totalCashInvested = purchasePrice * (downPaymentPercent / 100) + purchasePrice * 0.03; // include ~3% closing

  // Annual Net Operating Income (before debt service)
  const annualNOI = (expenses.grossMonthlyRent - (expenses.totalMonthlyExpenses - expenses.mortgageDebtService)) * 12;
  const capRatePercent = purchasePrice > 0 ? Number(((annualNOI / purchasePrice) * 100).toFixed(2)) : 0;
  const cashOnCashReturnPercent = totalCashInvested > 0
    ? Number((((expenses.netMonthlyCashFlow * 12) / totalCashInvested) * 100).toFixed(2))
    : 0;

  // 5-Year Equity Projection (Amortization + Appreciation)
  let balance = initialLoanAmount;
  const monthlyRate = interestRatePercent / 100 / 12;
  const monthlyPayment = expenses.mortgageDebtService;

  for (let m = 0; m < 60; m++) {
    const interest = balance * monthlyRate;
    const principal = monthlyPayment - interest;
    balance -= principal;
  }

  const futurePropertyValue = purchasePrice * Math.pow(1 + params.appreciationPercentAnnual / 100, 5);
  const fiveYearEquityUSD = Math.round(futurePropertyValue - Math.max(0, balance));

  // Cumulative 5-year cash flow with rent growth
  let cumulativeCashFlow = 0;
  let currentMonthlyRent = inputs.monthlyGrossRent;

  for (let y = 0; y < 5; y++) {
    const currentExp = computeDetailedExpenses(
      { ...inputs, monthlyGrossRent: Math.round(currentMonthlyRent) },
      params
    );
    cumulativeCashFlow += currentExp.netMonthlyCashFlow * 12;
    currentMonthlyRent *= 1 + params.rentGrowthPercentAnnual / 100;
  }

  const fiveYearTotalWealthUSD = Math.round(fiveYearEquityUSD + cumulativeCashFlow - totalCashInvested);

  return {
    name,
    rentGrowthPercentAnnual: params.rentGrowthPercentAnnual,
    appreciationPercentAnnual: params.appreciationPercentAnnual,
    vacancyRatePercent: params.vacancyRatePercent,
    maintenanceCapExPercent: params.maintenancePercentAnnual,
    monthlyNetCashFlow: expenses.netMonthlyCashFlow,
    capRatePercent,
    cashOnCashReturnPercent,
    fiveYearEquityUSD,
    fiveYearTotalWealthUSD,
  };
}

/**
 * Runs full 3-scenario underwriting analysis on any property listing
 */
export function executeMultiScenarioAnalysis(listing: ShikaakPropertyListing): MultiScenarioAnalysis {
  const inputs = listing.financials.inputs;
  const expenses = computeDetailedExpenses(inputs, DEFAULT_SCENARIOS.base);

  const conservative = projectScenario('Conservative', inputs, DEFAULT_SCENARIOS.conservative);
  const base = projectScenario('Base', inputs, DEFAULT_SCENARIOS.base);
  const optimistic = projectScenario('Optimistic', inputs, DEFAULT_SCENARIOS.optimistic);

  return {
    expenses,
    conservative,
    base,
    optimistic,
  };
}
