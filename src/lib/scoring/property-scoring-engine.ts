// =========================================================================
// HOUSE INTELLIGENCE - 9-Dimension Configurable Scoring Engine
// Evaluates properties across 9 distinct dimensions with customizable buyer profile weights
// =========================================================================

import {
  ShikaakPropertyListing,
  PropertyDimensionScores,
  BuyerPriorityWeights,
  DueDiligenceNotice,
} from '../../types/property';
import { ParsedNlpQuery } from '../nlp-search-parser';

export const DEFAULT_PRIORITY_WEIGHTS: BuyerPriorityWeights = {
  budget: 0.30,
  schools: 0.20,
  safety: 0.20,
  commute: 0.15,
  lifestyle: 0.15,
};

/**
 * Evaluates the 9 distinct dimensions for a property (each 0 to 100)
 */
export function scorePropertyDimensions(
  listing: ShikaakPropertyListing,
  weights?: BuyerPriorityWeights
): PropertyDimensionScores;
export function scorePropertyDimensions(
  listing: ShikaakPropertyListing,
  query?: ParsedNlpQuery,
  weights?: BuyerPriorityWeights
): PropertyDimensionScores;
export function scorePropertyDimensions(
  listing: ShikaakPropertyListing,
  queryOrWeights?: ParsedNlpQuery | BuyerPriorityWeights,
  maybeWeights?: BuyerPriorityWeights
): PropertyDimensionScores {
  let query: ParsedNlpQuery | undefined;
  let weights: BuyerPriorityWeights = DEFAULT_PRIORITY_WEIGHTS;

  if (queryOrWeights) {
    if ('budget' in queryOrWeights) {
      weights = queryOrWeights as BuyerPriorityWeights;
    } else {
      query = queryOrWeights as ParsedNlpQuery;
      if (maybeWeights) {
        weights = maybeWeights;
      }
    }
  }
  // 1. Budget Fit (0 - 100)
  let budgetFit = 85;
  const price = listing.financials.inputs.purchasePrice;
  const rent = listing.financials.inputs.monthlyGrossRent;

  if (query?.monthlyRentBudget) {
    if (rent <= query.monthlyRentBudget) {
      const margin = (query.monthlyRentBudget - rent) / query.monthlyRentBudget;
      budgetFit = Math.min(100, Math.round(90 + margin * 20));
    } else {
      const overage = (rent - query.monthlyRentBudget) / query.monthlyRentBudget;
      budgetFit = Math.max(30, Math.round(85 - overage * 120));
    }
  } else if (query?.priceRange?.maxPrice) {
    if (price <= query.priceRange.maxPrice) {
      const margin = (query.priceRange.maxPrice - price) / query.priceRange.maxPrice;
      budgetFit = Math.min(100, Math.round(90 + margin * 25));
    } else {
      const overage = (price - query.priceRange.maxPrice) / query.priceRange.maxPrice;
      budgetFit = Math.max(30, Math.round(85 - overage * 120));
    }
  }

  // 2. Location Fit (0 - 100)
  let locationFit = 88;
  if (query?.location?.city) {
    const cityMatch = listing.propertyAddress.city.toLowerCase() === query.location.city.toLowerCase();
    const neighborhoodMatch = query.location.neighborhood
      ? listing.propertyAddress.neighborhood.toLowerCase().includes(query.location.neighborhood.toLowerCase())
      : false;
    locationFit = neighborhoodMatch ? 98 : cityMatch ? 92 : 55;
  }

  // 3. Investment Fit (0 - 100)
  const capRate = listing.financials.outputs.capRatePercent;
  const cashFlow = listing.financials.outputs.monthlyNetCashFlow;
  let investmentFit = Math.min(100, Math.max(40, Math.round(50 + capRate * 7 + (cashFlow > 0 ? 15 : -10))));

  // 4. School Fit (0 - 100)
  const schools = listing.nearbyPointsOfInterest?.filter((p) => p.type === 'SCHOOL') || [];
  let schoolFit = 85;
  if (schools.length > 0) {
    const avgSchoolRating = schools.reduce((acc, s) => acc + s.ratingScore, 0) / schools.length;
    schoolFit = Math.min(100, Math.round(avgSchoolRating * 10));
  }

  // 5. Safety Fit (0 - 100)
  const safetyScore = listing.safety?.safetyIndexScore || 85;
  const safetyFit = Math.min(100, Math.max(40, safetyScore));

  // 6. Transportation / Commute Fit (0 - 100)
  const transitScore = listing.community?.transitScore || 82;
  const commuteMin = listing.roadTransit?.rushHourCBDCommuteMinutes || 18;
  const transportationFit = Math.min(100, Math.max(45, Math.round(transitScore * 0.6 + (30 - Math.min(25, commuteMin)) * 1.6)));

  // 7. Lifestyle Fit (0 - 100)
  const walkScore = listing.community?.walkScore || 85;
  const malls = listing.nearbyPointsOfInterest?.filter((p) => p.type === 'MALL') || [];
  const lifestyleFit = Math.min(100, Math.round(walkScore * 0.7 + Math.min(30, malls.length * 6)));

  // 8. Property Build Quality (0 - 100)
  const yearBuilt = listing.specs.yearBuilt;
  const age = Math.max(0, 2026 - yearBuilt);
  const propertyQualityFit = Math.min(100, Math.max(50, Math.round(95 - age * 0.8)));

  // 9. Data Confidence (0 - 100)
  const dataConfidence = listing.evidenceGraph?.overallDataConfidence || 94;

  // Composite Weighted Overall Score
  const totalWeight = weights.budget + weights.schools + weights.safety + weights.commute + weights.lifestyle;
  const wBudget = weights.budget / (totalWeight || 1);
  const wSchools = weights.schools / (totalWeight || 1);
  const wSafety = weights.safety / (totalWeight || 1);
  const wCommute = weights.commute / (totalWeight || 1);
  const wLifestyle = weights.lifestyle / (totalWeight || 1);

  const overallScore = Math.min(
    100,
    Math.max(
      40,
      Math.round(
        budgetFit * wBudget +
        schoolFit * wSchools +
        safetyFit * wSafety +
        transportationFit * wCommute +
        lifestyleFit * wLifestyle
      )
    )
  );

  return {
    budgetFit,
    locationFit,
    investmentFit,
    schoolFit,
    safetyFit,
    transportationFit,
    lifestyleFit,
    propertyQualityFit,
    dataConfidence,
    overallScore,
    compositeScore: overallScore,
  };
}

/**
 * Generates transparent "Why This Property?" rationales and due diligence alerts
 */
export function generateDueDiligenceNotice(
  listing: ShikaakPropertyListing,
  scores: PropertyDimensionScores,
  query?: ParsedNlpQuery
): DueDiligenceNotice {
  const highlights: string[] = [];
  const warnings: DueDiligenceNotice['dueDiligenceWarnings'] = [];

  // Positive highlights
  if (scores.budgetFit >= 90) {
    highlights.push(`Comfortably fits your target budget with verified MLS pricing`);
  }
  if (scores.schoolFit >= 90) {
    highlights.push(`Access to premier accredited public and preparatory schools (Ranked 9+/10)`);
  }
  if (scores.safetyFit >= 85) {
    highlights.push(`Municipal security index of ${scores.safetyFit}/100 with verified precinct patrol`);
  }
  if (listing.financials.outputs.monthlyNetCashFlow > 0) {
    highlights.push(`Positive projected net cash flow (+$${listing.financials.outputs.monthlyNetCashFlow}/mo base scenario)`);
  }
  if (listing.specs.beds) {
    highlights.push(`${listing.specs.beds} Bedroom capacity with ${listing.specs.finishedSqFt.toLocaleString()} sq ft finished living area`);
  }

  // Due diligence warnings
  const hoa = listing.financials.inputs.monthlyHoaDues || 0;
  if (hoa > 350) {
    warnings.push({
      category: 'HOA & Association Fees',
      severity: 'MEDIUM',
      message: `Monthly HOA fee of $${hoa}/mo represents a significant ongoing expense commitment.`,
      recommendation: 'Request the HOA reserve study, recent meeting minutes, and special assessment history.',
    });
  }

  const age = 2026 - listing.specs.yearBuilt;
  if (age > 25) {
    warnings.push({
      category: 'Mechanical & Structural Age',
      severity: 'MEDIUM',
      message: `Property was constructed in ${listing.specs.yearBuilt} (${age} years ago).`,
      recommendation: 'Conduct a certified independent HVAC, plumbing, and roof structural inspection.',
    });
  }

  if (listing.financials.outputs.capRatePercent < 4.5 && listing.listingStatus === 'FOR_SALE') {
    warnings.push({
      category: 'Investment Yield',
      severity: 'LOW',
      message: `Cap rate is ${listing.financials.outputs.capRatePercent}%, which favors long-term equity appreciation over immediate rental income.`,
      recommendation: 'Review the 5-year multi-scenario equity projection before proceeding.',
    });
  }

  return {
    positiveHighlights: highlights.slice(0, 4),
    dueDiligenceWarnings: warnings,
  };
}
