'use client';

import React from 'react';
import { 
  Globe, 
  GraduationCap, 
  DollarSign, 
  ShieldCheck, 
  Layers, 
  Sun, 
  Compass, 
  TrendingUp, 
  Building 
} from 'lucide-react';

interface NineSubheadingsProps {
  onScrollToWorkspace?: () => void;
}

export const NineSubheadingsOverview: React.FC<NineSubheadingsProps> = ({
  onScrollToWorkspace,
}) => {
  const SUBHEADINGS = [
    {
      num: '01',
      title: 'Geospatial Live Satellite & Real Google Earth Hybrid',
      description: 'Live interactive pan-and-zoom tile streaming from Google Earth Hybrid, Esri Satellite, Carto Dark Night, and OSM Streets.',
      icon: Globe,
      color: 'text-sky-500 bg-sky-950/40 border-sky-800/60',
    },
    {
      num: '02',
      title: 'Instant Proximity Radar & Nearby Radius Telemetry (km)',
      description: 'Calculates exact distances in kilometers (km), drive times, and walk times to top-rated schools, luxury shopping malls, Level-1 trauma centers, and transit stations.',
      icon: GraduationCap,
      color: 'text-amber-400 bg-amber-950/40 border-amber-800/60',
    },
    {
      num: '03',
      title: 'Cook County Property Taxes & Assessed Escrow Liability',
      description: 'Transparent municipal tax intelligence, annual liability ($/yr), effective rate % (1.95%), assessed property valuation, and monthly escrow calculation.',
      icon: DollarSign,
      color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60',
    },
    {
      num: '04',
      title: 'Chicago Police Department (CPD) Patrol Corridors & 911 Speeds',
      description: 'Precinct districts, sector patrol corridors, active squad car unit counts, and rapid 911 dispatch response times (3.5 to 5.0 minutes).',
      icon: ShieldCheck,
      color: 'text-blue-400 bg-blue-950/40 border-blue-800/60',
    },
    {
      num: '05',
      title: 'Deep Subsurface Geotechnical Mechanics & Soil Stability',
      description: 'Tested foundation bearing capacity (3,500 to 7,500 PSF / 160 to 360 kPa), depth to solid limestone bedrock, and dry water table flood protection.',
      icon: Layers,
      color: 'text-orange-400 bg-orange-950/40 border-orange-800/60',
    },
    {
      num: '06',
      title: 'Microclimate Telemetry & Environmental Heat Sensors',
      description: 'Surface temperatures in °C & °F, summer peak heat, winter low temperatures, Air Quality Index (AQI), and urban heat island mitigation.',
      icon: Sun,
      color: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/60',
    },
    {
      num: '07',
      title: 'Architectural CAD Blueprints & Room-by-Room Layouts',
      description: 'Room-by-room dimension breakdowns (e.g. 22\' x 16\'), finished area sq ft, ceiling heights, solar window exposure, and interactive furniture staging.',
      icon: Compass,
      color: 'text-purple-400 bg-purple-950/40 border-purple-800/60',
    },
    {
      num: '08',
      title: 'Institutional ROI Underwriting & Pass/Flow Score Engine',
      description: 'Automated 1.0 to 5.0 Pass/Flow grading, monthly net cash flow (+$/mo), cap rates %, Cash-on-Cash returns, and Debt Service Coverage Ratios (DSCR).',
      icon: TrendingUp,
      color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60',
    },
    {
      num: '09',
      title: '30 Verified Chicago Neighborhood Property Records',
      description: '30 comprehensive neighborhood records across Lincoln Park, Gold Coast, West Loop, Lakeview, Streeterville, Wicker Park, River North, South Loop, and Hyde Park.',
      icon: Building,
      color: 'text-brand-400 bg-brand-950/40 border-brand-800/60',
    },
  ];

  return (
    <section className="bg-slate-950 text-white border-b border-slate-800 py-12 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-black tracking-widest uppercase text-brand-400 bg-brand-950/80 border border-brand-800 px-3 py-1 rounded-full">
            Intelligent Platform Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Nine Integrated Intelligence Dimensions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Comprehensive real estate telemetry synthesized across geospatial, financial, and environmental domains.
          </p>
        </div>

        {/* 9 Subheadings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUBHEADINGS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.num}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all hover:bg-slate-900 shadow-sm space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 group-hover:text-white transition-colors">
                    {item.num}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
