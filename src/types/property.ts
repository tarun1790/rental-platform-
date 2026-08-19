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

export interface PropertyFinancials {
  inputs: FinancialInputs;
  outputs: FinancialOutputs;
}

export interface ShikaakPropertyListing {
  id: string;
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
  minSoilBearingPSF: number;
  maxPropertyTaxesUSD: number;
  maxDistanceToSchoolKm: number;
}
