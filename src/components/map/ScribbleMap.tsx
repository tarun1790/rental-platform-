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
  TreePine
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

  // Multispectral Earth Engine Layer State
  const [activeSpectralLayer, setActiveSpectralLayer] = useState<SpectralBandType>('TRUE_COLOR_RGB');
  const [spectralOpacity, setSpectralOpacity] = useState<number>(0.7);
  const [showEarthEngineModal, setShowEarthEngineModal] = useState<boolean>(false);

  // Boundary Radar HUD State
  const [showBoundaryRadar, setShowBoundaryRadar] = useState<boolean>(true);

  // 24-Hour Sun Angle
  const [sunHour, setSunHour] = useState<number>(14);
  const [showSunSimulator, setShowSunSimulator] = useState(false);

  // Real Tile URLs for Live Streaming
  const TILE_CONFIGS: Record<RealEarthTileProvider, { url: string; maxZoom: number; attribution: string }> = {
    GOOGLE_EARTH_HYBRID: {
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      maxZoom: 20,
      attribution: 'Imagery © Google Earth, Maxar Technologies',
    },
    GOOGLE_EARTH_SATELLITE: {
      url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      maxZoom: 20,
      attribution: 'Imagery © Google Earth Satellite',
    },
    ESRI_SATELLITE: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      maxZoom: 19,
      attribution: 'Tiles © Esri, Earthstar Geographics',
    },
    OSM_STREETS: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      maxZoom: 19,
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

    // Center on Chicago Core (Lincoln Park / Gold Coast / West Loop / Loop)
    const map = L.map(mapContainerRef.current, {
      center: [41.898, -87.645],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Add Live Real Satellite Tile Layer
    const config = TILE_CONFIGS[tileProvider];
    tileLayerRef.current = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      subdomains: ['a', 'b', 'c', 'd'],
    }).addTo(map);

    // Create Marker and Polygon Layer Groups
    markersLayerRef.current = L.layerGroup().addTo(map);
    polygonLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Update Tile Provider when changed
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const L = require('leaflet');
    const config = TILE_CONFIGS[tileProvider];

    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      subdomains: ['a', 'b', 'c', 'd'],
    }).addTo(mapInstanceRef.current);
  }, [tileProvider]);

  // 3. Render Real Interactive Leaflet Markers (RED & WHITE CUSTOM PINS)
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const L = require('leaflet');
    const layer = markersLayerRef.current;
    layer.clearLayers();

    listings.forEach((listing) => {
      const isSelected = selectedListing?.id === listing.id;
      const { latitude, longitude } = listing.propertyAddress.location;

      const priceK = (listing.financials.inputs.purchasePrice / 1000).toFixed(0);
      const score = listing.financials.outputs.passFlowScore.toFixed(1);

      // Custom Red & White Pin Badge (NO BLACK)
      const customHtml = `
        <div class="cursor-pointer group flex flex-col items-center select-none" style="transform: translate(-50%, -100%);">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black tracking-tight shadow-xl border-2 transition-all ${
            isSelected
              ? 'bg-red-700 text-white border-white scale-110 ring-4 ring-red-500/50'
              : 'bg-red-600 text-white border-white hover:bg-red-700 hover:scale-105'
          }">
            <span class="font-mono">$${priceK}K</span>
            <span class="text-[10px] bg-white text-red-700 font-mono px-1.5 py-0.2 rounded font-black">Score ${score}</span>
          </div>
          <div class="w-0.5 h-3 bg-red-600"></div>
          <div class="w-2.5 h-1.5 rounded-full bg-red-600/80 blur-[1px]"></div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-property-pin',
        html: customHtml,
        iconSize: [90, 42],
        iconAnchor: [45, 42],
      });

      const marker = L.marker([latitude, longitude], { icon });

      // Click to select
      marker.on('click', () => {
        onSelectListing(listing);
        setShowBoundaryRadar(true);
      });

      layer.addLayer(marker);
    });
  }, [listings, selectedListing]);

  // 4. Fly to selected listing
  useEffect(() => {
    if (selectedListing && mapInstanceRef.current) {
      const { latitude, longitude } = selectedListing.propertyAddress.location;
      mapInstanceRef.current.flyTo([latitude, longitude], 15, {
        duration: 1.2,
      });
      setShowBoundaryRadar(true);
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
        weight: 3,
        dashArray: '6, 6',
        fillColor: '#DC2626',
        fillOpacity: 0.25,
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
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isScribbleActive || !isDrawingRef.current || !canvasRef.current) return;
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
    if (!isScribbleActive || !isDrawingRef.current || !canvasRef.current || !mapInstanceRef.current) return;
    isDrawingRef.current = false;

    const points = drawnPointsRef.current;
    if (points.length < 3) {
      onClearScribble();
      return;
    }

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    // Convert screen pixel points to GPS Coordinates
    const map = mapInstanceRef.current;
    const geoPolygon: GeoCoordinate[] = points.map((p) => {
      const latLng = map.containerPointToLatLng([p.x, p.y]);
      return { latitude: latLng.lat, longitude: latLng.lng };
    });

    onScribbleComplete(geoPolygon);
    setShowBoundaryRadar(true);
  };

  // Sync canvas size with container
  useEffect(() => {
    const updateSize = () => {
      if (mapContainerRef.current && canvasRef.current) {
        canvasRef.current.width = mapContainerRef.current.clientWidth;
        canvasRef.current.height = mapContainerRef.current.clientHeight;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden select-none">
      
      {/* REAL LEAFLET LIVE MAP CONTAINER */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-0 relative"
      />

      {/* Freehand Scribble Drawing Canvas (Over Map) */}
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

      {/* TOP FLOATING REAL MAP PROVIDER & EARTH CONTROLS (STRICTLY WHITE & RED) */}
      <div className="absolute top-4 left-4 z-30 flex flex-wrap items-center gap-2">
        
        {/* Real Live Map Provider Switcher (White & Red) */}
        <div className="flex items-center bg-white p-1 rounded-2xl border-2 border-red-200 shadow-xl">
          <button
            onClick={() => setTileProvider('GOOGLE_EARTH_HYBRID')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              tileProvider === 'GOOGLE_EARTH_HYBRID'
                ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                : 'text-slate-700 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Google Earth Hybrid</span>
          </button>
          <button
            onClick={() => setTileProvider('ESRI_SATELLITE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              tileProvider === 'ESRI_SATELLITE'
                ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                : 'text-slate-700 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <Layers2 className="w-3.5 h-3.5" />
            <span>Esri Satellite</span>
          </button>
          <button
            onClick={() => setTileProvider('OSM_STREETS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              tileProvider === 'OSM_STREETS'
                ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                : 'text-slate-700 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Streets</span>
          </button>
        </div>

        {/* Earth Engine Multispectral Hub Button (White & Red) */}
        <button
          onClick={() => setShowEarthEngineModal(!showEarthEngineModal)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold border-2 shadow-xl transition-all ${
            showEarthEngineModal || activeSpectralLayer !== 'TRUE_COLOR_RGB'
              ? 'bg-red-600 text-white border-red-600 shadow-red-500/30 animate-pulse'
              : 'bg-white text-slate-800 border-red-200 hover:border-red-400 hover:bg-red-50'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-red-600" />
          <span>
            {activeSpectralLayer === 'TRUE_COLOR_RGB'
              ? 'Earth Engine Spectrum'
              : activeSpectralLayer.replace(/_/g, ' ')}
          </span>
        </button>

        {/* Sun & Shadow Simulator Toggle */}
        <button
          onClick={() => setShowSunSimulator(!showSunSimulator)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold border-2 shadow-xl transition-all ${
            showSunSimulator
              ? 'bg-red-600 text-white border-red-600 font-black'
              : 'bg-white text-slate-800 border-red-200 hover:border-red-400 hover:bg-red-50'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-red-500" />
          <span>24h Sun Angle</span>
        </button>
      </div>

      {/* FLOATING EARTH ENGINE SPECTRAL SELECTOR MODAL */}
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

      {/* RIGHT FLOATING ZOOM & CENTER CONTROLS (WHITE & RED) */}
      <div className="absolute top-4 right-4 z-30 flex flex-col items-center gap-2">
        {/* Reset Center Compass */}
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([41.898, -87.645], 13, { duration: 1 });
            }
          }}
          className="w-10 h-10 rounded-2xl bg-white border-2 border-red-200 text-red-600 flex items-center justify-center shadow-xl hover:border-red-500 hover:bg-red-50 transition-all hover:scale-105"
          title="Reset View to Chicago Core"
        >
          <Compass className="w-5 h-5 text-red-600" />
        </button>

        {/* Zoom In & Out */}
        <div className="flex flex-col bg-white border-2 border-red-200 rounded-2xl shadow-xl overflow-hidden">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-2.5 text-slate-700 hover:text-red-600 hover:bg-red-50 border-b border-red-100 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-2.5 text-slate-700 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* EXPANDED SUN SIMULATOR SLIDER (WHITE & RED) */}
      {showSunSimulator && (
        <div className="absolute top-16 left-4 z-30 bg-white border-2 border-red-300 p-4 rounded-3xl shadow-2xl w-72 space-y-2 text-slate-900">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-1.5 text-red-600">
              <Sun className="w-4 h-4 text-red-500" />
              <span>Solar Daylight Simulator</span>
            </span>
            <span className="font-mono font-bold text-red-600">
              {sunHour % 12 === 0 ? 12 : sunHour % 12}:00 {sunHour >= 12 ? 'PM' : 'AM'}
            </span>
          </div>
          <input
            type="range"
            min="6"
            max="20"
            step="1"
            value={sunHour}
            onChange={(e) => setSunHour(Number(e.target.value))}
            className="w-full accent-red-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>6 AM (Sunrise)</span>
            <span>1 PM (Peak)</span>
            <span>8 PM (Sunset)</span>
          </div>
        </div>
      )}

      {/* BOUNDARY SCAN PROXIMITY & INTELLIGENCE RADAR HUD */}
      {showBoundaryRadar && (selectedListing || scribblePolygon) && (
        <BoundaryScanRadar
          enclosedListings={listings}
          selectedListing={selectedListing}
          onSelectListing={onSelectListing}
          onOpenFullDetail={(item) => onOpenFullDetail?.(item)}
          onClose={() => setShowBoundaryRadar(false)}
        />
      )}

      {/* BOTTOM TELEMETRY BAR (WHITE & RED) */}
      <div className="absolute bottom-3 inset-x-3 z-30 flex items-center justify-between pointer-events-none text-[11px] font-mono text-slate-700 bg-white/95 border-2 border-red-200 px-4 py-2.5 rounded-2xl shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-red-600 font-black">
            <Globe className="w-3.5 h-3.5 text-red-600" />
            <span>Google Earth Hybrid Tile Engine • Chicago Extent</span>
          </span>
          <span className="hidden sm:inline text-slate-600">Provider: {tileProvider}</span>
        </div>
        <div className="text-slate-500 text-[10px]">
          {TILE_CONFIGS[tileProvider].attribution}
        </div>
      </div>
    </div>
  );
};
