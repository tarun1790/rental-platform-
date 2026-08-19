'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, 
  Sun, 
  Moon, 
  Layers, 
  MapPin, 
  Navigation, 
  RotateCcw, 
  Sparkles,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Globe,
  ZoomIn,
  ZoomOut,
  Eye,
  Crosshair,
  Sliders,
  Activity,
  Layers2,
  TreePine,
  Flame,
  Radio,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { ShikaakPropertyListing, GeoCoordinate } from '../../types/property';
import { SpectralBandType } from '../../types/intelligence';
import { EARTH_ENGINE_LAYERS } from '../../lib/earth-engine';
import { EarthEngineLayerSelector } from '../geospatial/EarthEngineLayerSelector';
import { BoundaryScanRadar } from './BoundaryScanRadar';

interface ScribbleMapProps {
  listings: ShikaakPropertyListing[];
  selectedListing: ShikaakPropertyListing | null;
  onSelectListing: (listing: ShikaakPropertyListing) => void;
  isScribbleActive: boolean;
  onScribbleComplete: (polygon: GeoCoordinate[]) => void;
  scribblePolygon: GeoCoordinate[] | null;
  onClearScribble: () => void;
  onOpenFullDetail?: (listing: ShikaakPropertyListing) => void;
}

type RealEarthTileProvider = 'GOOGLE_EARTH_HYBRID' | 'GOOGLE_EARTH_SATELLITE' | 'ESRI_SATELLITE' | 'OSM_STREETS';

export const ScribbleMap: React.FC<ScribbleMapProps> = ({
  listings,
  selectedListing,
  onSelectListing,
  isScribbleActive,
  onScribbleComplete,
  scribblePolygon,
  onClearScribble,
  onOpenFullDetail,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const polygonLayerRef = useRef<any>(null);

  // Canvas for freehand lasso overlay
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const drawnPointsRef = useRef<{ x: number; y: number }[]>([]);

  // Tile Provider State (Default: Real Google Earth Satellite Hybrid)
  const [tileProvider, setTileProvider] = useState<RealEarthTileProvider>('GOOGLE_EARTH_HYBRID');
  const [isLayerDropdownOpen, setIsLayerDropdownOpen] = useState(false);

  // Multispectral Earth Engine Layer State
  const [activeSpectralLayer, setActiveSpectralLayer] = useState<SpectralBandType>('TRUE_COLOR_RGB');
  const [spectralOpacity, setSpectralOpacity] = useState<number>(0.7);
  const [showEarthEngineModal, setShowEarthEngineModal] = useState<boolean>(false);

  // Boundary Radar HUD State (Default: Closed so map starts clean and uncluttered)
  const [showBoundaryRadar, setShowBoundaryRadar] = useState<boolean>(false);

  // 24-Hour Sun Angle
  const [sunHour, setSunHour] = useState<number>(14);
  const [showSunSimulator, setShowSunSimulator] = useState(false);

  // Real Tile URLs for Live Streaming
  const TILE_CONFIGS: Record<RealEarthTileProvider, { url: string; maxZoom: number; label: string; attribution: string }> = {
    GOOGLE_EARTH_HYBRID: {
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      maxZoom: 20,
      label: 'Google Earth Hybrid',
      attribution: 'Imagery © Google Earth, Maxar',
    },
    GOOGLE_EARTH_SATELLITE: {
      url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      maxZoom: 20,
      label: 'Google Satellite',
      attribution: 'Imagery © Google Earth',
    },
    ESRI_SATELLITE: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      maxZoom: 19,
      label: 'Esri Satellite',
      attribution: 'Tiles © Esri, Earthstar',
    },
    OSM_STREETS: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      maxZoom: 19,
      label: 'Clean Streets',
      attribution: '© OpenStreetMap contributors',
    },
  };

  // 1. Initialize Real Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let L: any;
    try {
      L = require('leaflet');
    } catch (err) {
      console.error('Leaflet load error:', err);
      return;
    }

    if (mapInstanceRef.current) return;

    // Center on Chicago / US Core
    const map = L.map(mapContainerRef.current, {
      center: [41.898, -87.645],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: true,
      zoomAnimation: true,
    });

    // Add Real Google Earth Satellite Hybrid Tile Layer
    const tileLayer = L.tileLayer(TILE_CONFIGS[tileProvider].url, {
      maxZoom: TILE_CONFIGS[tileProvider].maxZoom,
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Marker Layer Group
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Polygon Layer Group
    const polygonLayer = L.layerGroup().addTo(map);
    polygonLayerRef.current = polygonLayer;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Handle Tile Provider Switching
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const L = require('leaflet');
    tileLayerRef.current.remove();

    const newLayer = L.tileLayer(TILE_CONFIGS[tileProvider].url, {
      maxZoom: TILE_CONFIGS[tileProvider].maxZoom,
      subdomains: ['a', 'b', 'c'],
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  }, [tileProvider]);

  // 3. Render Sleek, Modern Price Pins (Zillow-Style Pure White & Red)
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const L = require('leaflet');
    const layer = markersLayerRef.current;
    layer.clearLayers();

    listings.forEach((listing) => {
      const isSelected = selectedListing?.id === listing.id;
      const { latitude, longitude } = listing.propertyAddress.location;

      const priceVal = listing.financials.inputs.purchasePrice;
      const priceFormatted = priceVal >= 1000000 
        ? `$${(priceVal / 1000000).toFixed(2).replace('.00', '')}M` 
        : `$${Math.round(priceVal / 1000)}K`;

      const score = listing.financials.outputs.passFlowScore.toFixed(1);

      // Sleek, Minimalist White & Red Price Pill
      const customHtml = `
        <div class="cursor-pointer group flex flex-col items-center select-none" style="transform: translate(-50%, -100%);">
          <div class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black tracking-tight shadow-md border transition-all duration-200 ${
            isSelected
              ? 'bg-red-600 text-white border-white scale-110 shadow-lg shadow-red-600/40 ring-2 ring-red-400 z-50'
              : 'bg-white text-red-700 border-red-500 hover:bg-red-600 hover:text-white hover:border-white hover:scale-105'
          }">
            <span class="font-mono font-bold">${priceFormatted}</span>
            <span class="text-[9px] ${isSelected ? 'bg-white text-red-700' : 'bg-red-50 text-red-600 group-hover:bg-white group-hover:text-red-700'} font-mono px-1 rounded font-black">${score}</span>
          </div>
          <div class="w-0.5 h-1.5 ${isSelected ? 'bg-red-600' : 'bg-red-500'}"></div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-property-pin',
        html: customHtml,
        iconSize: [80, 32],
        iconAnchor: [40, 32],
      });

      const marker = L.marker([latitude, longitude], { icon, zIndexOffset: isSelected ? 1000 : 10 });

      // Click to select property
      marker.on('click', () => {
        onSelectListing(listing);
        setShowBoundaryRadar(true);
      });

      layer.addLayer(marker);
    });
  }, [listings, selectedListing]);

  // 4. Fly to selected listing smoothly
  useEffect(() => {
    if (selectedListing && mapInstanceRef.current) {
      const { latitude, longitude } = selectedListing.propertyAddress.location;
      mapInstanceRef.current.flyTo([latitude, longitude], 15, {
        duration: 0.8,
        easeLinearity: 0.25,
      });
    }
  }, [selectedListing]);

  // 5. Render Saved Scribble Polygon on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !polygonLayerRef.current) return;
    const L = require('leaflet');
    const layer = polygonLayerRef.current;
    layer.clearLayers();

    if (scribblePolygon && scribblePolygon.length > 2) {
      const latLngs = scribblePolygon.map((p) => [p.latitude, p.longitude]);
      const polygon = L.polygon(latLngs, {
        color: '#DC2626',
        weight: 2.5,
        dashArray: '5, 5',
        fillColor: '#DC2626',
        fillOpacity: 0.2,
      });
      layer.addLayer(polygon);
      setShowBoundaryRadar(true);
    }
  }, [scribblePolygon]);

  // 6. Freehand Scribble Drawing on Overlay Canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isScribbleActive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDrawingRef.current = true;
    drawnPointsRef.current = [{ x, y }];

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !isScribbleActive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    drawnPointsRef.current.push({ x, y });

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawingRef.current || !isScribbleActive || !mapInstanceRef.current || !canvasRef.current) return;
    isDrawingRef.current = false;

    const points = drawnPointsRef.current;
    if (points.length < 5) return;

    // Convert pixel coordinates to real GPS GeoCoordinates
    const geoPolygon: GeoCoordinate[] = points.map((p) => {
      const latLng = mapInstanceRef.current.containerPointToLatLng([p.x, p.y]);
      return { latitude: latLng.lat, longitude: latLng.lng };
    });

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    onScribbleComplete(geoPolygon);
    setShowBoundaryRadar(true);
  };

  return (
    <div className="relative w-full h-full min-h-full overflow-hidden select-none bg-slate-100">
      
      {/* 1. REAL LEAFLET SATELLITE MAP CONTAINER */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-0" 
        style={{ minHeight: '100%' }}
      />

      {/* 2. FREEHAND DRAWING CANVAS OVERLAY */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        className={`absolute inset-0 z-20 ${
          isScribbleActive ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
        }`}
        style={{ width: '100%', height: '100%' }}
      />

      {/* 3. CLEAN FLOATING TOP-LEFT MAP CONTROL BAR (PURE WHITE & RED) */}
      <div className="absolute top-3 left-3 z-30 flex flex-wrap items-center gap-2">
        
        {/* Compact Layer Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsLayerDropdownOpen(!isLayerDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-xl border border-red-200 shadow-md hover:border-red-400 transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-red-600" />
            <span>{TILE_CONFIGS[tileProvider].label}</span>
            <ChevronDown className="w-3 h-3 text-red-500" />
          </button>

          {isLayerDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-48 bg-white border border-red-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in space-y-1">
              {(Object.keys(TILE_CONFIGS) as RealEarthTileProvider[]).map((providerKey) => (
                <button
                  key={providerKey}
                  onClick={() => {
                    setTileProvider(providerKey);
                    setIsLayerDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-xl font-bold flex items-center justify-between ${
                    tileProvider === providerKey ? 'bg-red-50 text-red-600' : 'text-slate-700 hover:bg-red-50/60'
                  }`}
                >
                  <span>{TILE_CONFIGS[providerKey].label}</span>
                  {tileProvider === providerKey && <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Market Jumper (Chicago / Colorado) */}
        <div className="hidden sm:flex items-center bg-white p-0.5 rounded-xl border border-red-200 shadow-md text-xs font-bold">
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([41.898, -87.645], 13, { duration: 1 });
              }
            }}
            className="px-2.5 py-1 text-slate-700 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
          >
            Chicago (CST)
          </button>
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([39.7185, -104.9572], 12, { duration: 1.2 });
              }
            }}
            className="px-2.5 py-1 text-slate-700 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
          >
            Colorado (MST)
          </button>
        </div>

        {/* Proximity Radar Toggle Button */}
        <button
          onClick={() => setShowBoundaryRadar(!showBoundaryRadar)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-md transition-all ${
            showBoundaryRadar
              ? 'bg-red-600 text-white border-red-600 shadow-red-500/20'
              : 'bg-white text-slate-800 border-red-200 hover:border-red-400 hover:bg-red-50'
          }`}
          title="Toggle Geospatial Proximity Radar HUD"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Radar HUD</span>
        </button>

        {/* Earth Engine Multispectral Button */}
        <button
          onClick={() => setShowEarthEngineModal(!showEarthEngineModal)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-md transition-all ${
            showEarthEngineModal || activeSpectralLayer !== 'TRUE_COLOR_RGB'
              ? 'bg-red-600 text-white border-red-600 shadow-red-500/20'
              : 'bg-white text-slate-800 border-red-200 hover:border-red-400 hover:bg-red-50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Earth Engine</span>
        </button>
      </div>

      {/* 4. TOP-RIGHT COMPACT ZOOM CONTROLS */}
      <div className="absolute top-3 right-3 z-30 flex flex-col items-center gap-1.5">
        <div className="flex flex-col bg-white border border-red-200 rounded-xl shadow-md overflow-hidden">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-2 text-slate-700 hover:text-red-600 hover:bg-red-50 border-b border-red-100 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-2 text-slate-700 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5. FLOATING EARTH ENGINE SPECTRAL SELECTOR MODAL */}
      <EarthEngineLayerSelector
        isOpen={showEarthEngineModal}
        onClose={() => setShowEarthEngineModal(false)}
        activeLayer={activeSpectralLayer}
        onLayerChange={(l) => {
          setActiveSpectralLayer(l);
          setShowEarthEngineModal(false);
        }}
        layerOpacity={spectralOpacity}
        onOpacityChange={setSpectralOpacity}
      />

      {/* 6. BOUNDARY SCAN PROXIMITY & INTELLIGENCE RADAR HUD (ONLY WHEN TOGGLED) */}
      {showBoundaryRadar && (selectedListing || scribblePolygon) && (
        <BoundaryScanRadar
          enclosedListings={listings}
          selectedListing={selectedListing}
          onSelectListing={onSelectListing}
          onOpenFullDetail={(item) => onOpenFullDetail?.(item)}
          onClose={() => setShowBoundaryRadar(false)}
        />
      )}

      {/* 7. CLEAN SUBTLE BOTTOM ATTRIBUTION BADGE */}
      <div className="absolute bottom-2 right-2 z-20 pointer-events-none text-[10px] font-mono text-slate-600 bg-white/90 border border-red-200 px-2.5 py-1 rounded-lg shadow-sm backdrop-blur-sm">
        {TILE_CONFIGS[tileProvider].attribution}
      </div>
    </div>
  );
};
