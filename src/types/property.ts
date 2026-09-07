// =========================================================================
// HOME Platform - Core Domain Models & Geospatial Types
// =========================================================================

export type PropertyType = 'SINGLE_FAMILY' | 'CONDO' | 'TOWNHOUSE' | 'MULTI_FAMILY' | 'LOFT' | 'ALL';
export type ListingStatus = 'FOR_SALE' | 'FOR_RENT' | 'ALL';

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface PropertyAddress {
  street: string;
  unit?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  location: GeoCoordinate;
}

export interface PropertySpecs {
  propertyType: PropertyType;
  beds: number;
  baths: number;
  halfBaths?: number;
  finishedSqFt: number;
  finishedSqMeters: number;
  lotSqFt?: number;
  lotSizeSqFt?: number;
  yearBuilt: number;
  parkingSpaces?: number;
  garageSpaces?: number;
  stories?: number;
  architecturalStyle?: string;
  hoaMonthlyFeeUSD?: number;
  hvacType?: string;
}

export interface RoomDetail {
  name: string;
  dimensions: string; // e.g. "18' x 14'"
  sqFt: number;
  level: 'Main' | 'Upper' | 'Lower' | 'Basement' | 'Rooftop' | 'Penthouse';
}

export interface RoomsBreakdown {
  totalRooms: number;
  livingRooms?: number;
  diningRooms?: number;
  kitchens?: number;
  bedrooms?: number;
  bathrooms?: number;
  bedroomCount?: number;
  bathroomCount?: number;
  hasBalconyPatio?: boolean;
  hasFinishedBasement?: boolean;
  hasHomeOffice?: boolean;
  hasRooftopDeck?: boolean;
  roomDetails: RoomDetail[];
}

export interface PropertyTaxes {
  annualAmountUSD: number;
  effectiveTaxRatePercent: number; // e.g. 1.95%
  taxYear: number;
  countyName: string; // e.g. "Cook County"
  assessedValueUSD: number;
}

export interface PointOfInterest {
  id: string;
  type: 'MALL' | 'SCHOOL' | 'HOSPITAL' | 'TRANSIT' | 'PARK' | 'DINING';
  name: string;
  categoryLabel: string;
  distanceKm: number;
  distanceMiles: number;
  walkTimeMinutes: number;
  driveTimeMinutes: number;
  ratingScore: number;
  keyHighlight: string;
}

export interface PoliceCorridorTelemetry {
  precinctDistrict: string;
  patrolCorridorName: string;
  dispatchAvgMinutes: number;
  activePatrolUnitsOnDuty: number;
  twentyYearBurglaryMilestone: string;
}

export interface ClimateTelemetry {
  surfaceTempC: number;
  surfaceTempF: number;
  summerPeakTempC: number;
  winterLowTempC: number;
  airQualityIndexAQI: number;
  airQualityVerdict: string;
  floodZoneTier: string;
  lakeEffectSnowRiskTier: string;
  annualRainfallInches: number;
  urbanHeatIslandDeviationF: number;
}

export interface ForestResourcesTelemetry {
  forestCanopyCoveragePercent: number;
  nearestParkOrForestName: string;
  distanceToForestKm: number;
  ndviVegetationIndex: number;
  treeAcreageNearby: number;
  carbonSequestrationRating: string;
}

export interface TimezoneTelemetry {
  timeZoneName: string;
  timeZoneCode: 'MST' | 'MDT' | 'CST' | 'CDT' | 'EST' | 'EDT' | 'PST' | 'PDT';
  utcOffset: string;
  daylightSavingObserved: boolean;
}

export interface HeatWaveTelemetry {
  annualHeatWaveDaysCount: number;
  peakSummerHeatIndexF: number;
  extremeHeatRiskTier: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  urbanHeatIslandAnomalyF: number;
  shadeCanopyCoolingEffectF: number;
  historicalHeatWaveTrend: string;
}

export interface CommunityTelemetry {
  medianHouseholdIncomeUSD: number;
  higherEducationPercent: number; // e.g. 86% Master's/Bachelor's
  neighborhoodAssociation: string;
  walkScore: number;
  transitScore: number;
  bikeScore: number;
}

export interface SmartCityLightingTelemetry {
  streetLightingCoveragePercent: number;
  fixtureType: string; // e.g. "Smart Adaptive Warm LED (3000K)"
  nightLuminanceLux: number; // e.g. 45 Lux
  fiberBroadbandSpeedGbps: number; // e.g. 10 Gbps symmetrical
  undergroundPowerGrid: boolean;
}

export interface RoadTransitTelemetry {
  primaryHighway: string; // e.g. "I-90 / I-94 Kennedy Expressway"
  distanceToHighwayKm: number;
  driveTimeToHighwayMinutes: number;
  rushHourCBDCommuteMinutes: number;
  pavementConditionIndexPCI: number; // e.g. 94 / 100
  evChargingStallsNearbyCount: number;
}

export interface LocalEventItem {
  name: string;
  seasonOrFrequency: string; // e.g. "Annual Summer Festival"
  distanceKm: number;
  estimatedAttendees: number;
  description: string;
}

export interface NightlifePartyItem {
  name: string;
  category: string; // e.g. "Rooftop Cocktail Lounge & Social Club"
  distanceKm: number;
  ratingScore: number;
  dressCodeOrVibe: string;
}

export interface EventsAndLifestyleTelemetry {
  annualEvents: LocalEventItem[];
  nightlifeAndLounges: NightlifePartyItem[];
}

export interface AirportTelemetry {
  primaryAirportName: string;
  primaryAirportIATA: string;
  distanceToAirportKm: number;
  driveTimeToAirportMinutes: number;
  directTransitAvailable: boolean;
  annualPassengerVolumeRank: string;
}

export interface GeotechnicalTelemetry {
  soilClassification: string;
  bearingCapacityPSF: number;
  bearingCapacityKPa: number;
  bedrockDepthFeet: number;
  waterTableDepthFeet: number;
  settlementRiskScore: number;
  expansiveClayShrinkSwell: 'LOW' | 'MODERATE' | 'HIGH';
  liquefactionRiskTier: 'VERY_LOW' | 'LOW' | 'MODERATE';
}

export interface SafetyTelemetry {
  safetyIndexScore: number;
  theftFreeMilestoneYears: number;
  policeResponseAvgMinutes: number;
  fireEMSResponseAvgMinutes: number;
  violentCrimeRatePer1000: number;
  propertyCrimeRatePer1000: number;
  nearestPrecinct?: { name: string; distanceMiles: number; jurisdictionCode: string };
  tenYearTrafficAccidents?: { pedestrianIncidents: number; vehicularCollisions: number; speedZoneLimitMph: number; trafficCalmingInstalled: boolean };
  incidentTimeline?: Array<{ year: number; category: string; description: string; resolved: boolean }>;
}

export interface RankedAmenity {
  id: string;
  category: 'HOSPITAL' | 'MICHELIN_DINING' | 'SHOPPING' | 'SCHOOL' | 'ENTERTAINMENT' | 'PARK';
  name: string;
  distanceMiles: number;
  distanceKm: number;
  driveTimeMinutes: number;
  rankScore: number;
  keyAttribute: string;
  hygieneGradeOrRating?: string;
}

export interface FurnitureItem {
  id: string;
  type: string;
  name: string;
  widthFeet: number;
  lengthFeet: number;
  x: number;
  y: number;
  rotationDeg: number;
  iconName?: string;
}

export interface RoomDimension {
  id: string;
  roomName: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  dimensionsFeet: {
    width: number;
    length: number;
    ceilingHeight: number;
  };
  squareFootage: number;
  windowOrientation: string;
  flooringType: string;
  hasEnSuiteBath?: boolean;
}

export interface ArchitecturalBlueprint {
  floorplanImageUrl?: string;
  totalFloorCount: number;
  dimensionsWidthFeet: number;
  dimensionsLengthFeet: number;
  roomBreakdown: RoomDimension[];
  defaultFurniture: FurnitureItem[];
}

export interface FinancialInputs {
  purchasePrice: number;
  monthlyGrossRent: number;
  grossAnnualRevenue?: number;
  downPaymentPercent: number;
  interestRatePercent: number;
  loanTermYears: number;
  monthlyPropertyTax?: number;
  monthlyInsurance?: number;
  monthlyHoaDues?: number;
  maintenanceAndCapExPercent?: number;
  vacancyRatePercent: number;
  propertyManagementPercent: number;
  annualPropertyTaxRatePercent?: number;
  annualInsuranceUSD?: number;
  annualMaintenancePercent?: number;
  hoaMonthlyFeeUSD?: number;
  isShortTermRentalStrategy?: boolean;
  shortTermAverageDailyRate?: number;
  shortTermOccupancyRatePercent?: number;
  strDailyRate?: number;
  strOccupancyPercent?: number;
  strOccupancyRate?: number;
}

export interface FinancialOutputs {
  grossAnnualRevenue: number;
  netOperatingIncomeAnnual: number;
  monthlyDebtService: number;
  monthlyOperatingExpenses: number;
  monthlyMortgagePI?: number;
  monthlyPropertyTax?: number;
  monthlyInsurance?: number;
  monthlyMaintenance?: number;
  monthlyVacancyReserve?: number;
  monthlyManagement?: number;
  monthlyTotalExpenses?: number;
  monthlyNetOperatingIncome?: number;
  monthlyNetCashFlow: number;
  annualNetOperatingIncome?: number;
  annualNetCashFlow?: number;
  capRatePercent: number;
  cashOnCashReturnPercent: number;
  grossRentMultiplier: number;
  debtServiceCoverageRatio: number;
  passFlowScore: number;
  passFlowVerdict?: 'PASS_TO_FLOW' | 'BORDERLINE' | 'FAIL' | 'FAIL_NEGATIVE_FLOW' | 'REVIEW_MARGINAL';
  verdict: 'FAIL_NEGATIVE_FLOW' | 'REVIEW_MARGINAL' | 'PASS_TO_FLOW';
  verdictReason: string;
}

export type InvestmentInputs = FinancialInputs;
export type InvestmentOutputs = FinancialOutputs;

// =========================================================================
// Property Intelligence & Decision Engine Types
// =========================================================================

export type VerificationClassification = 'VERIFIED_FACT' | 'CALCULATED' | 'MODEL_ESTIMATE' | 'FORECAST';

export type SourceType =
  | 'MLS_IDX'
  | 'COUNTY_ASSESSOR'
  | 'MUNICIPAL_RECORDS'
  | 'AUTHORIZED_API'
  | 'PARTNER_FEED'
  | 'USER_URL';

export interface EvidenceField<T> {
  value: T;
  source: SourceType;
  sourceName: string;
  retrievedAt: string;
  confidence: number; // 0.00 - 1.00
  verification: VerificationClassification;
  citationOrRecordId?: string;
}

export interface PropertyEvidenceGraph {
  canonicalId: string;
  address: EvidenceField<string>;
  parcelIdAPN: EvidenceField<string>;
  mlsNumber?: EvidenceField<string>;
  coordinates: EvidenceField<GeoCoordinate>;
  price: EvidenceField<number>;
  beds: EvidenceField<number>;
  baths: EvidenceField<number>;
  finishedSqFt: EvidenceField<number>;
  yearBuilt: EvidenceField<number>;
  propertyType: EvidenceField<PropertyType>;
  annualPropertyTax: EvidenceField<number>;
  assessedValue: EvidenceField<number>;
  monthlyRentEstimate: EvidenceField<number>;
  monthlyHoaDues: EvidenceField<number>;
  foundationType: EvidenceField<string>;
  roofType: EvidenceField<string>;
  hvacSystem: EvidenceField<string>;
  safetyScore: EvidenceField<number>;
  overallDataConfidence: number; // 0 - 100
  lastVerifiedAt: string;
}

export interface BuyerPriorityWeights {
  budget: number;       // default 0.30
  schools: number;      // default 0.20
  safety: number;       // default 0.20
  commute: number;      // default 0.15
  lifestyle: number;    // default 0.15
}

export interface PropertyDimensionScores {
  budgetFit: number;          // 0 - 100
  locationFit: number;        // 0 - 100
  investmentFit: number;      // 0 - 100
  schoolFit: number;          // 0 - 100
  safetyFit: number;          // 0 - 100
  transportationFit: number;  // 0 - 100
  lifestyleFit: number;       // 0 - 100
  propertyQualityFit: number; // 0 - 100
  dataConfidence: number;     // 0 - 100
  overallScore: number;       // 0 - 100 (weighted)
  compositeScore: number;     // alias for overallScore
}

export interface MonthlyOperatingExpensesBreakdown {
  grossMonthlyRent: number;
  vacancyLoss: number;
  propertyManagementFee: number;
  maintenanceReserve: number;
  capexReserve: number;
  propertyTaxMonthly: number;
  insuranceMonthly: number;
  hoaDuesMonthly: number;
  utilitiesMonthly: number;
  mortgageDebtService: number;
  totalMonthlyExpenses: number;
  netMonthlyCashFlow: number;
}

export interface ScenarioProjection {
  name: 'Conservative' | 'Base' | 'Optimistic';
  rentGrowthPercentAnnual: number;
  appreciationPercentAnnual: number;
  vacancyRatePercent: number;
  maintenanceCapExPercent: number;
  monthlyNetCashFlow: number;
  capRatePercent: number;
  cashOnCashReturnPercent: number;
  fiveYearEquityUSD: number;
  fiveYearTotalWealthUSD: number;
}

export interface MultiScenarioAnalysis {
  expenses: MonthlyOperatingExpensesBreakdown;
  conservative: ScenarioProjection;
  base: ScenarioProjection;
  optimistic: ScenarioProjection;
}

export interface DueDiligenceNotice {
  positiveHighlights: string[];
  dueDiligenceWarnings: Array<{
    category: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    message: string;
    recommendation: string;
  }>;
}

export interface PropertyFinancials {
  inputs: FinancialInputs;
  outputs: FinancialOutputs;
}

export interface ShikaakPropertyListing {
  id: string;
  canonicalId?: string;
  title: string;
  tagline: string;
  listingStatus: ListingStatus;
  propertyAddress: PropertyAddress;
  specs: PropertySpecs;
  roomsBreakdown: RoomsBreakdown;
  propertyTaxes: PropertyTaxes;
  nearbyPointsOfInterest: PointOfInterest[];
  policeCorridor: PoliceCorridorTelemetry;
  climateTelemetry: ClimateTelemetry;
  forestResources?: ForestResourcesTelemetry;
  timezone?: TimezoneTelemetry;
  heatWaves?: HeatWaveTelemetry;
  airport?: AirportTelemetry;
  community?: CommunityTelemetry;
  smartLighting?: SmartCityLightingTelemetry;
  roadTransit?: RoadTransitTelemetry;
  lifestyle?: EventsAndLifestyleTelemetry;
  geotechnical: GeotechnicalTelemetry;
  safety: SafetyTelemetry;
  amenities: RankedAmenity[];
  microclimate: {
    avgSummerTempF?: number;
    avgWinterTempF?: number;
    annualSnowfallInches?: number;
    windExposureTier?: 'SHELTERED' | 'MODERATE' | 'HIGH_EXPOSURE';
    annualSunHours?: number;
    windBufferingScore?: number;
    peakNoiseDecibelsRushHour?: number;
    snowClearancePriorityTier?: number;
  };
  blueprint: ArchitecturalBlueprint;
  financials: PropertyFinancials;
  media: {
    featuredImage: string;
    gallery: string[];
  };
  evidenceGraph?: PropertyEvidenceGraph;
  scores?: PropertyDimensionScores;
  financialScenarios?: MultiScenarioAnalysis;
  dueDiligence?: DueDiligenceNotice;
}

export interface FilterState {
  searchQuery: string;
  listingStatus: ListingStatus;
  priceMin: number;
  priceMax: number;
  bedsMin: number;
  bathsMin: number;
  propertyType: PropertyType;
  minPassFlowScore: number;
  zeroTheftOnly: boolean;
  minSoilBearingPSF?: number;
  minMonthlyProfitUSD?: number;
  minCapRatePercent?: number;
  maxPropertyTaxesUSD: number;
  maxDistanceToSchoolKm: number;
}

