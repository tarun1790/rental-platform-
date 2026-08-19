'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Sun, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  X,
  Scan,
  RefreshCw,
  Zap,
  Activity
} from 'lucide-react';
import { runGeminiVisionInspection } from '../../lib/gemini-multimodal';
import { GeminiVisionInspectionResult } from '../../types/intelligence';

interface GeminiVisionInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  imageUrl: string;
}

export const GeminiVisionInspector: React.FC<GeminiVisionInspectorProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  propertyAddress,
  imageUrl,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<GeminiVisionInspectionResult | null>(() =>
    runGeminiVisionInspection(propertyId, imageUrl, propertyAddress)
  );

  if (!isOpen) return null;

  const handleRescan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setResult(runGeminiVisionInspection(propertyId, imageUrl, propertyAddress));
      setIsScanning(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border-2 border-red-500 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-slate-900">
        
        {/* Top Modal Bar (White & Red) */}
        <div className="p-5 bg-red-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-red-600 flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black uppercase tracking-wider">
                  Gemini Multimodal Vision Inspector
                </h3>
                <span className="text-[10px] px-2 py-0.5 bg-white text-red-700 font-mono font-bold rounded-full">
                  Vertex Vision 2.0
                </span>
              </div>
              <p className="text-xs text-red-100 font-medium truncate max-w-md">
                Automated architectural defect, glazing & structural scan for {propertyAddress}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRescan}
              disabled={isScanning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white text-white hover:text-red-600 text-xs font-bold transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Re-Scan'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-red-600 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content (White & Red) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          
          {/* Main Inspection Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Image with Scan Overlays */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-red-200 bg-red-50/30">
              <img
                src={imageUrl}
                alt="Vision Target"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-dashed border-red-500/50 pointer-events-none" />
              
              {/* Scan HUD Overlays */}
              <div className="absolute top-3 left-3 bg-white/95 text-red-600 border border-red-300 px-3 py-1.5 rounded-xl text-xs font-mono font-bold shadow-md">
                <span>Structural Integrity: {result?.facadeStructuralScore || 96} / 100</span>
              </div>
            </div>

            {/* Right: Structural Metrics */}
            <div className="space-y-4">
              <div className="p-4 bg-red-50/50 border border-red-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-black uppercase text-red-600 tracking-wider">
                  Gemini Multimodal AI Synthesis
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {result?.geminiExplanation}
                </p>
              </div>

              {/* Dimension Scores */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-white border border-red-200 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Facade Condition</span>
                  <div className="text-lg font-black text-red-600 font-mono">
                    {result?.facadeConditionTier || 'EXCELLENT'}
                  </div>
                  <span className="text-[10px] text-slate-600">Score: {result?.facadeStructuralScore}/100</span>
                </div>

                <div className="p-3.5 bg-white border border-red-200 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Solar Rooftop Potential</span>
                  <div className="text-lg font-black text-red-600 font-mono">
                    ${result?.solarRooftopPotential.estimatedAnnualEnergySavingsUSD.toLocaleString()}/yr
                  </div>
                  <span className="text-[10px] text-slate-600">{result?.solarRooftopPotential.recommendedSystemCapacityKW} kW Capacity</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detected Features Tags */}
          <div className="p-4 bg-red-50/40 border border-red-200 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wide">
              Verified Architectural & Material Elements
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {(result?.environmentalDegradation.anomalies.map((a) => a.label) || ['Clean Masonry Tuckpointing', 'Rooftop Solar Azimuth Alignment: 180° South']).map((item, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white border border-red-200 rounded-xl text-xs font-bold text-slate-800 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-red-50 border-t border-red-200 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">
            Analyzed via Google Vertex AI Multimodal Vision Pipeline
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 transition-all"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
