'use client';

import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Sparkles, 
  ChevronRight, 
  Compass, 
  Sun, 
  Calendar, 
  Award, 
  Utensils, 
  GraduationCap, 
  Building, 
  PhoneCall, 
  Share2, 
  Heart, 
  ExternalLink, 
  BarChart3, 
  DollarSign, 
  CheckCircle2,
  Camera,
  Layers,
  ArrowRight,
  FileCode,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { ShikaakPropertyListing, RankedAmenity } from '../../types/property';
import { formatCurrency, formatPercent } from '../../lib/roi-engine';
import { extractPropertyToOkf, OkfDocument } from '../../lib/okf/okf-extractor';

interface PropertyDetailModalProps {
  listing: ShikaakPropertyListing | null;
  onClose: () => void;
}

type TabType = 'overview' | 'specs' | 'amenities' | 'financials' | 'okf' | 'inquire';

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  listing,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [tourSubmitted, setTourSubmitted] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [tourDate, setTourDate] = useState('2026-11-15');
  const [tourTime, setTourTime] = useState('14:00');
  const [isOkfCopied, setIsOkfCopied] = useState(false);

  const okfDoc = React.useMemo(() => {
    return listing ? extractPropertyToOkf(listing) : null;
  }, [listing]);

  const handleCopyOkf = () => {
    if (okfDoc) {
      navigator.clipboard.writeText(okfDoc.markdown);
      setIsOkfCopied(true);
      setTimeout(() => setIsOkfCopied(false), 2000);
    }
  };

  const handleDownloadOkf = () => {
    if (!okfDoc || !listing) return;
    const blob = new Blob([okfDoc.markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${listing.id}.okf.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!listing) return null;

  const specs = listing.specs || {
    beds: 4,
    baths: 3.5,
    finishedSqFt: 3600,
    propertyType: 'SINGLE_FAMILY',
    architecturalStyle: 'Modernist Residence',
    yearBuilt: 2022,
    hvacType: 'Dual-Zone Smart Climate Control',
  };

  const propertyAddress = listing.propertyAddress || {
    street: listing.title || '100 Crestview Way',
    neighborhood: 'Gold Coast',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60611',
    location: { latitude: 41.8781, longitude: -87.6298 },
  };

  const financials = listing.financials || {
    inputs: {
      purchasePrice: 2850000,
      monthlyGrossRent: 12500,
      annualPropertyTaxesUSD: 24000,
      monthlyPropertyTax: 2000,
      monthlyInsurance: 350,
      monthlyHoaDues: 0,
      propertyManagementPercent: 5,
      maintenanceAndCapExPercent: 5,
    },
    outputs: {
      capRatePercent: 4.8,
      passFlowScore: 4.9,
      monthlyMortgagePI: 4200,
      monthlyDebtService: 4200,
      monthlyNetCashFlow: 350,
      grossRentMultiplier: 12.5,
      debtServiceCoverageRatio: 1.35,
    },
  };

  const media = listing.media || {
    featuredImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85'
    ],
  };

  const galleryImages = media.gallery && media.gallery.length > 0 ? media.gallery : [media.featuredImage];

  const amenities: RankedAmenity[] = (listing.amenities && listing.amenities.length > 0) ? listing.amenities : [
    {
      id: 'amenity_1',
      category: 'SCHOOL',
      name: 'Gold Coast Preparatory Academy',
      distanceMiles: 0.4,
      distanceKm: 0.6,
      driveTimeMinutes: 3,
      rankScore: 9.9,
      keyAttribute: '★ 10/10 GreatSchools Rating',
      hygieneGradeOrRating: 'A+',
    },
    {
      id: 'amenity_2',
      category: 'MICHELIN_DINING',
      name: 'Alinea & Michelin Dining Row',
      distanceMiles: 0.8,
      distanceKm: 1.3,
      driveTimeMinutes: 5,
      rankScore: 9.8,
      keyAttribute: '3-Star Michelin Gastronomy',
      hygieneGradeOrRating: 'A+',
    },
    {
      id: 'amenity_3',
      category: 'PARK',
      name: 'Lake Shore Waterfront Promenade',
      distanceMiles: 0.5,
      distanceKm: 0.8,
      driveTimeMinutes: 4,
      rankScore: 9.7,
      keyAttribute: 'Private Yacht Marina & Trails',
      hygieneGradeOrRating: 'A',
    },
  ];

  const priceLabel = listing.listingStatus === 'FOR_RENT'
    ? `${formatCurrency(financials.inputs?.monthlyGrossRent || 9500)}/mo`
    : formatCurrency(financials.inputs?.purchasePrice || 2850000);

  const handleBookTour = (e: React.FormEvent) => {
    e.preventDefault();
    setTourSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-[#0c0c10] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-zinc-100">
        
        {/* Sticky Luxury Header */}
        <div className="sticky top-0 z-30 bg-[#121216]/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#e2b170]/15 border border-[#e2b170]/40 flex items-center justify-center text-[#e2b170] shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide uppercase truncate font-sans">
                  {listing.title}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-[#e2b170]/20 text-[#e2b170] border border-[#e2b170]/40 uppercase shrink-0">
                  {specs.architecturalStyle || 'Modernist Residence'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono flex items-center gap-1.5 truncate mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#e2b170] shrink-0" />
                <span>{propertyAddress.street}, {propertyAddress.neighborhood}, {propertyAddress.city}, {propertyAddress.state}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col text-right font-mono">
              <span className="text-xl font-black text-[#e2b170] tracking-tight">
                {priceLabel}
              </span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest">
                {listing.listingStatus === 'FOR_RENT' ? 'Premier Lease Offering' : 'Curated Private Acquisition'}
              </span>
            </div>

            {listing.externalUrl && (
              <a
                href={listing.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-mono font-bold transition-all"
                title={`Open official listing on ${listing.sourcePortal || 'Portal'}`}
              >
                <span>{listing.sourcePortal || 'Portal'}</span>
                <ExternalLink className="w-3 h-3 text-[#e2b170]" />
              </a>
            )}

            {/* OKF Knowledge Graph Direct Action */}
            <button
              type="button"
              onClick={() => setActiveTab('okf')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'okf'
                  ? 'bg-[#e2b170] text-black border-[#e2b170] shadow-md shadow-[#e2b170]/20'
                  : 'bg-white/5 hover:bg-white/10 text-[#e2b170] border-[#e2b170]/30'
              }`}
              title="Inspect Open Knowledge Format (OKF) Dossier from Database"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">OKF Dossier</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer"
              title="Close Dossier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="px-6 border-b border-white/10 bg-[#0e0e14] flex items-center gap-1.5 overflow-x-auto text-xs py-2 scrollbar-none font-mono">
          {[
            { id: 'overview', label: 'Overview & Gallery', icon: Camera },
            { id: 'specs', label: 'Architectural Specs', icon: Layers },
            { id: 'amenities', label: 'Neighborhood & Schools', icon: Award },
            { id: 'financials', label: 'Investment & Lease Analysis', icon: BarChart3 },
            { id: 'okf', label: 'OKF Knowledge Graph', icon: FileCode },
            { id: 'inquire', label: 'Schedule Private Viewing', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 py-2 px-3.5 font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#e2b170] text-black shadow-md shadow-[#e2b170]/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW & GALLERY */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Photo Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 aspect-[16/10] rounded-2xl overflow-hidden bg-black border border-white/10 relative group">
                  <img
                    src={galleryImages[selectedImageIndex % galleryImages.length]}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-[#e2b170] border border-[#e2b170]/40">
                    Photo {selectedImageIndex + 1} of {galleryImages.length}
                  </div>
                </div>

                <div className="grid grid-cols-4 md:grid-cols-2 gap-2">
                  {galleryImages.slice(0, 4).map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative aspect-[16/10] rounded-xl overflow-hidden cursor-pointer border transition-all ${
                        selectedImageIndex === idx 
                          ? 'border-[#e2b170] ring-2 ring-[#e2b170]/40 scale-[1.02]' 
                          : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                      }`}
                    >
                      <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Residence Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#141418] border border-white/10 rounded-2xl font-mono">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Configuration</span>
                  <div className="text-base font-black text-white">{specs.beds} Beds • {specs.baths} Baths</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Finished Space</span>
                  <div className="text-base font-black text-white">{specs.finishedSqFt.toLocaleString()} Sq Ft</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Year Completed</span>
                  <div className="text-base font-black text-white">{specs.yearBuilt} Modern Build</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Architectural Style</span>
                  <div className="text-xs font-black text-[#e2b170] truncate">{specs.architecturalStyle}</div>
                </div>
              </div>

              {/* Architectural Narrative */}
              <div className="space-y-3 bg-[#121216] p-5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e2b170] animate-pulse" />
                  <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#e2b170]">
                    Architectural Dossier
                  </h3>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                  {(listing as any).description || `Exclusively curated residence located in premier ${propertyAddress.neighborhood}. Featuring tailored cantilevered geometry, full-height acoustic glazing, custom terrazzo surfaces, and bespoke climate zoning. Positioned within premier proximity to renowned schools and private transport corridors.`}
                </p>
              </div>

              {/* Action Strip */}
              <div className="flex items-center justify-between p-4 bg-[#141418] rounded-2xl border border-white/10 font-mono">
                <div>
                  <div className="text-xs text-zinc-400">Current Inquiries:</div>
                  <div className="text-sm font-bold text-white">Private viewings coordinated upon request</div>
                </div>
                <button
                  onClick={() => setActiveTab('inquire')}
                  className="px-6 py-2.5 rounded-xl bg-[#e2b170] hover:bg-[#d4a055] text-black font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#e2b170]/20 cursor-pointer"
                >
                  Schedule Private Tour
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: ARCHITECTURAL SPECS */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              <div className="p-5 bg-[#141418] rounded-2xl border border-white/10 space-y-4 font-mono">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#e2b170]">
                  Residence Specifications
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-zinc-400">Total Bedrooms:</span>
                    <span className="font-bold text-white">{specs.beds} En-Suite Suites</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-zinc-400">Bathrooms:</span>
                    <span className="font-bold text-white">{specs.baths} Marble Baths</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-zinc-400">Gross Interior Area:</span>
                    <span className="font-bold text-white">{specs.finishedSqFt.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-zinc-400">Ceiling Clearance:</span>
                    <span className="font-bold text-[#e2b170]">11' - 14' Volumetric</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-zinc-400">Climate System:</span>
                    <span className="font-bold text-white">{specs.hvacType || 'Dual-Zone Smart Climate Control'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-zinc-400">Year Completed:</span>
                    <span className="font-bold text-white">{specs.yearBuilt}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-zinc-400">Parking Capacity:</span>
                    <span className="font-bold text-white">2 - 3 Vehicle Garage</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-zinc-400">Architectural Category:</span>
                    <span className="font-bold text-[#e2b170]">{specs.architecturalStyle}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NEIGHBORHOOD & SCHOOLS */}
          {activeTab === 'amenities' && (
            <div className="space-y-6">
              <div className="p-5 bg-[#141418] rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#e2b170]">
                    Curated Proximities & Education
                  </h3>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#e2b170]/15 text-[#e2b170] border border-[#e2b170]/40 font-bold">
                    ★ 10/10 GreatSchools Baseline
                  </span>
                </div>

                <div className="space-y-3">
                  {amenities.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-[#0e0e12] border border-white/10 font-mono text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#e2b170]/15 border border-[#e2b170]/30 flex items-center justify-center text-[#e2b170]">
                          {item.category === 'SCHOOL' ? <GraduationCap className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-white">{item.name}</div>
                          <div className="text-[11px] text-[#e2b170]">{item.keyAttribute}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-white">{item.distanceMiles} miles</div>
                        <div className="text-[10px] text-zinc-400">{item.driveTimeMinutes} min drive</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FINANCIALS & LEASE ANALYSIS */}
          {activeTab === 'financials' && (
            <div className="space-y-6 font-mono">
              <div className="p-5 bg-[#141418] rounded-2xl border border-white/10 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#e2b170]">
                  Acquisition & Lease Underwriting
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-zinc-400">Offering Classification:</span>
                    <span className="font-bold text-white">{listing.listingStatus === 'FOR_RENT' ? 'For Lease' : 'For Sale'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-zinc-400">Baseline Price:</span>
                    <span className="font-bold text-[#e2b170] text-sm">{priceLabel}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-zinc-400">Estimated Annual Property Tax:</span>
                    <span className="font-bold text-white">{formatCurrency((listing as any).taxes?.annualAmountUSD || (financials.inputs?.monthlyPropertyTax ? financials.inputs.monthlyPropertyTax * 12 : 24000))}/yr</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-zinc-400">Estimated Monthly Insurance:</span>
                    <span className="font-bold text-white">{formatCurrency(financials.inputs?.monthlyInsurance || 350)}/mo</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-zinc-400">Projected Cap Rate:</span>
                    <span className="font-bold text-[#e2b170]">{formatPercent(financials.outputs?.capRatePercent || 4.8)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-zinc-400">Gross Rent Multiplier (GRM):</span>
                    <span className="font-bold text-white">{(financials.outputs?.grossRentMultiplier || 12.5).toFixed(1)}x</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: OPEN KNOWLEDGE FORMAT (OKF) DATABASE EXTRACTION */}
          {activeTab === 'okf' && okfDoc && (
            <div className="space-y-5 font-mono">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[#141418] rounded-2xl border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#e2b170]/15 border border-[#e2b170]/30 flex items-center justify-center text-[#e2b170]">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-white tracking-wider">
                      Open Knowledge Format (OKF) Entity Dossier
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Standardized YAML Frontmatter + Markdown Graph extracted directly from database
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handleCopyOkf}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 text-xs font-bold transition-all cursor-pointer"
                  >
                    {isOkfCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#e2b170]" />}
                    <span>{isOkfCopied ? 'Copied' : 'Copy OKF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadOkf}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e2b170] hover:bg-[#d4a055] text-black text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#e2b170]/20 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .okf.md</span>
                  </button>
                </div>
              </div>

              {/* YAML Frontmatter Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="uppercase tracking-widest text-[#e2b170] font-bold">YAML Frontmatter Schema</span>
                  <span>ID: {okfDoc.frontmatter.id}</span>
                </div>
                <pre className="p-4 rounded-2xl bg-black/80 border border-white/10 text-zinc-300 text-xs overflow-x-auto max-h-64 scrollbar-none font-mono">
                  {okfDoc.rawYaml}
                </pre>
              </div>

              {/* Markdown Body Preview */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-widest text-[#e2b170] font-bold block">
                  Knowledge Graph Body (Markdown)
                </span>
                <pre className="p-4 rounded-2xl bg-black/60 border border-white/10 text-zinc-300 text-xs overflow-x-auto max-h-64 scrollbar-none font-mono whitespace-pre-wrap">
                  {okfDoc.markdown}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 5: INQUIRE & TOUR */}
          {activeTab === 'inquire' && (
            <div className="space-y-6">
              {tourSubmitted ? (
                <div className="p-8 bg-[#141418] rounded-2xl border border-[#e2b170]/40 text-center space-y-3 font-mono">
                  <div className="w-12 h-12 rounded-full bg-[#e2b170]/20 border border-[#e2b170] text-[#e2b170] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-white uppercase">Viewing Request Confirmed</h3>
                  <p className="text-xs text-zinc-300 max-w-md mx-auto">
                    Our private architectural advisory desk has received your request for {tourDate} at {tourTime}. A personal advisor will contact {guestEmail || 'you'} directly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookTour} className="p-6 bg-[#141418] rounded-2xl border border-white/10 space-y-4 font-mono">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#e2b170]" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">
                      Request Discrete Private Viewing
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 text-[11px] uppercase">Full Name</label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Sterling Archer"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-[#e2b170]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-zinc-400 text-[11px] uppercase">Email Address</label>
                      <input
                        type="email"
                        required
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="advisor@residence.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-[#e2b170]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-zinc-400 text-[11px] uppercase">Preferred Date</label>
                      <input
                        type="date"
                        value={tourDate}
                        onChange={(e) => setTourDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#e2b170]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-zinc-400 text-[11px] uppercase">Preferred Time</label>
                      <input
                        type="time"
                        value={tourTime}
                        onChange={(e) => setTourTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#e2b170]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#e2b170] hover:bg-[#d4a055] text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#e2b170]/25 cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Confirm Private Tour Appointment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
