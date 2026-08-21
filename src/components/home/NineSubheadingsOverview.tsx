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
  Building,
  Bot,
  Sparkles,
  LucideIcon
} from 'lucide-react';

interface NineSubheadingsProps {
  onScrollToWorkspace?: () => void;
}

interface SubheadingItem {
  num: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const NineSubheadingsOverview: React.FC<NineSubheadingsProps> = ({
  onScrollToWorkspace,
}) => {
  const SUBHEADINGS: SubheadingItem[] = [
    {
      num: '01',
      title: 'Geospatial Satellite & Real Google Earth Hybrid Streaming',
      description: 'High-resolution live tile feeds integrating Google Earth Hybrid, Esri Satellite, Carto Night Radar, and OpenStreetMap street grids.',
      icon: Globe,
    },
    {
      num: '02',
      title: 'Ranked Academic Districts & Luxury Retail Proximity (km)',
      description: 'Precise geospatial proximity calculations ranking top five schools by GreatSchools ratings and top five shopping centers by customer reviews.',
      icon: GraduationCap,
    },
    {
      num: '03',
      title: 'Cook County Property Taxes & Escrow Liability Underwriting',
      description: 'Transparent municipal tax intelligence incorporating annual liabilities ($/yr), effective millage rates (1.95%), and verified assessment archives.',
      icon: DollarSign,
    },
    {
      num: '04',
      title: 'Police Department Patrol Corridors & Rapid 911 Dispatch Speeds',
      description: 'Precinct districts, sector patrol corridors, active on-duty fleet telemetry, and rapid emergency dispatch response times (3.5 to 5.0 minutes).',
      icon: ShieldCheck,
    },
    {
      num: '05',
      title: 'Deep Subsurface Geotechnical Mechanics & Bedrock Strata',
      description: 'Certified soil bearing capacity (3,500 to 7,500 PSF / 160 to 360 kPa), depth to solid limestone bedrock, and subterranean water table clearance.',
      icon: Layers,
    },
    {
      num: '06',
      title: 'Copernicus Sentinel Multispectral & Microclimate Telemetry',
      description: 'Copernicus Sentinel-2 NDVI canopy density, Landsat-8 thermal surface variance, and Sentinel-5P NO₂ tropospheric air quality monitoring.',
      icon: Sun,
    },
    {
      num: '07',
      title: 'Architectural CAD Blueprints & Interactive Room Staging',
      description: 'Interactive room-by-room architectural dimensions, structural partition boundaries, ceiling clearances, and custom furniture layout staging.',
      icon: Compass,
    },
    {
      num: '08',
      title: 'Institutional Financial Underwriting & Pass/Flow Score Engine',
      description: 'Algorithmic 1.0 to 5.0 Pass/Flow grading, Net Operating Income (NOI), Cap Rates, Cash-on-Cash yields, and Debt Service Coverage Ratios (DSCR).',
      icon: TrendingUp,
    },
    {
      num: '09',
      title: 'Autonomous Multi-Agent Synthesis & Executive Intelligence',
      description: 'Synchronous cross-agent analysis fusing structural computer vision, geotechnical strata, predictive AutoML models, and civic infrastructure.',
      icon: Bot,
    },
  ];

  return (
    <section className="bg-white text-slate-900 border-b border-red-100 py-12 px-4 sm:px-8 lg:px-12 select-none">
      <div className="w-full space-y-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-bold tracking-wider uppercase text-red-500 bg-red-50 border border-red-200 px-3.5 py-1 rounded-full inline-block">
            Institutional Real Estate Telemetry
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Nine Integrated Dimensions of Property Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Every residential listing is comprehensively vetted across satellite, structural, financial, civic, and geotechnical dimensions.
          </p>
        </div>

        {/* 9 Dimensions Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SUBHEADINGS.map((sub) => {
            const Icon = sub.icon;
            return (
              <div
                key={sub.num}
                className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 hover:border-red-300 hover:bg-white transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-red-500 shadow-sm">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      DIMENSION {sub.num}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {sub.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {sub.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
