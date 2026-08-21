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

export type AgentDomainType = 
  | 'VISION_STRUCTURAL' 
  | 'GEOTECHNICAL_SUBSURFACE' 
  | 'PREDICTIVE_MACRO' 
  | 'FINANCIAL_UNDERWRITING' 
  | 'CIVIC_INFRASTRUCTURE' 
  | 'ACADEMIC_PROXIMITY';

export type AgentStatus = 'INITIALIZING' | 'ANALYZING' | 'SYNTHESIZED' | 'VERIFIED';

export interface IndividualAgentSynthesis {
  agentId: string;
  agentName: string;
  domain: AgentDomainType;
  modelArchitecture: string;
  confidenceScore: number; // e.g. 98.6
  status: AgentStatus;
  executiveVerdict: string;
  keyFindings: string[];
  telemetryMetrics: Record<string, string | number>;
}

export interface MultiAgentExecutiveBrief {
  propertyId: string;
  propertyTitle: string;
  overallInstitutionalRating: number; // 1.0 - 10.0
  overallVerdict: 'STRONG_PASS_TO_FLOW' | 'PASS_TO_FLOW' | 'MODERATE_OPPORTUNITY' | 'CAUTION_REQUIRED';
  executiveProseSummary: string;
  riskIndex: number; // 0 - 100
  alphaOpportunityIndex: number; // 0 - 100
  agentReports: IndividualAgentSynthesis[];
  timestamp: string;
}

