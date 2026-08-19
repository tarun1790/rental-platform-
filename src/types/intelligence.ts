// =========================================================================
// HOME Platform - Advanced Geospatial, Multimodal & Predictive Types
// =========================================================================

export type SpectralBandType = 
  | 'TRUE_COLOR_RGB' 
  | 'SENTINEL2_NDVI' 
  | 'LANDSAT_THERMAL_HEAT' 
  | 'SENTINEL5P_AIR_NO2' 
  | 'INSAR_GROUND_SUBSIDENCE' 
  | 'FEMA_FLOOD_SURGE';

export interface EarthEngineLayerConfig {
  id: SpectralBandType;
  name: string;
  satelliteSensor: string;
  resolutionMeters: number;
  revisitDays: number;
  description: string;
  colorScale: {
    minLabel: string;
    maxLabel: string;
    gradientCss: string;
  };
  opacity: number;
}

export interface GeminiVisionInspectionResult {
  propertyId: string;
  inspectedImageUrl: string;
  timestamp: string;
  facadeStructuralScore: number; // 1 - 100
  facadeConditionTier: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'REQUIRES_RESTORATION';
  roofIntegrityScore: number; // 1 - 100
  estimatedRoofRemainingLifeYears: number;
  solarRooftopPotential: {
    annualSunlightHours: number;
    usableRoofAreaSqFt: number;
    recommendedSystemCapacityKW: number;
    estimatedAnnualGenerationKWh: number;
    estimatedAnnualEnergySavingsUSD: number;
    carbonOffsetTonsAnnual: number;
  };
  environmentalDegradation: {
    surfaceSootAndParticulateTier: 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH';
    vegetationCanopyHealth: 'HEALTHY' | 'MODERATE' | 'SPARSE';
    crackAnomaliesDetected: number;
    anomalies: Array<{
      id: string;
      label: string;
      confidence: number;
      boxCoordinates: { xPercent: number; yPercent: number; widthPercent: number; heightPercent: number };
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
    }>;
  };
  geminiExplanation: string;
}

export interface VertexPredictiveValuation {
  propertyId: string;
  baselinePrice: number;
  forecastYearSpan: number[]; // e.g. [2026, 2027, 2028, 2029, 2030, 2031]
  conservativeValuationUSD: number[];
  baseValuationUSD: number[];
  aggressiveValuationUSD: number[];
  projectedCapRateTrend: number[];
  projectedAnnualCashFlowUSD: number[];
  climateRiskAdjustmentFactor: number; // e.g. -0.4% to +1.2%
  autoMLModelConfidencePercent: number;
  bigQueryMunicipalSampleCount: number;
  drivers: Array<{
    feature: string;
    impactPercentage: number;
    positive: boolean;
  }>;
}

export type SupportedLanguageCode = 'en' | 'es' | 'hi' | 'zh' | 'ru' | 'pt' | 'ar';

export interface LanguageOption {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}
