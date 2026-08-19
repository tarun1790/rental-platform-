'use client';

import React from 'react';
import { 
  Globe, 
  Layers, 
  Sun, 
  Wind, 
  Activity, 
  Waves, 
  Sparkles,
  Info,
  Check,
  X
} from 'lucide-react';
import { EARTH_ENGINE_LAYERS } from '../../lib/earth-engine';
import { SpectralBandType } from '../../types/intelligence';

interface EarthEngineLayerSelectorProps {
  activeLayer: SpectralBandType;
  onLayerChange: (layer: SpectralBandType) => void;
  layerOpacity: number;
  onOpacityChange: (opacity: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const EarthEngineLayerSelector: React.FC<EarthEngineLayerSelectorProps> = ({
  activeLayer,
  onLayerChange,
  layerOpacity,
  onOpacityChange,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const currentConfig = EARTH_ENGINE_LAYERS.find((l) => l.id === activeLayer) || EARTH_ENGINE_LAYERS[0];

  return (
    <div className="absolute top-16 left-4 z-30 w-80 sm:w-96 bg-white border-2 border-red-500 rounded-3xl p-5 shadow-2xl text-slate-900 space-y-4 animate-in fade-in zoom-in-95 duration-200 select-none">
      
      {/* Header (White & Red) */}
      <div className="flex items-center justify-between border-b border-red-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-500/20">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-red-600">
              Google Earth Engine
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              Copernicus & Landsat Multispectral Hub
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Layer Picker List */}
      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
        {EARTH_ENGINE_LAYERS.map((layer) => {
          const isSelected = layer.id === activeLayer;
          return (
            <button
              key={layer.id}
              onClick={() => onLayerChange(layer.id)}
              className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start justify-between gap-2 ${
                isSelected
                  ? 'bg-red-50 border-2 border-red-500 text-red-700 shadow-sm'
                  : 'bg-white hover:bg-red-50/50 border-red-100 text-slate-700'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold">{layer.name}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {layer.satelliteSensor} • {layer.resolutionMeters}m res
                </p>
              </div>

              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Layer Details */}
      <div className="p-3 bg-red-50/50 rounded-2xl border border-red-200 text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-red-700">Overlay Opacity</span>
          <span className="font-mono font-bold text-red-600">{(layerOpacity * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={layerOpacity}
          onChange={(e) => onOpacityChange(Number(e.target.value))}
          className="w-full accent-red-600 cursor-pointer"
        />
        <p className="text-[10px] text-slate-600 leading-relaxed pt-1">
          {currentConfig.description}
        </p>
      </div>
    </div>
  );
};
