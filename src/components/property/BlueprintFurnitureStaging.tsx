'use client';

import React, { useState, useRef } from 'react';
import { 
  Maximize2, 
  RotateCw, 
  Trash2, 
  Plus, 
  Move, 
  Bed, 
  Sofa, 
  Laptop, 
  Tv, 
  Compass,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ArchitecturalBlueprint, FurnitureItem, RoomDimension } from '../../types/property';

interface BlueprintFurnitureStagingProps {
  blueprint: ArchitecturalBlueprint;
  totalSqFt: number;
}

const AVAILABLE_FURNITURE_CATALOG = [
  {
    type: 'BED_KING' as const,
    name: 'King Bed (6.5 x 7 ft)',
    widthFeet: 6.5,
    lengthFeet: 7.0,
    icon: Bed,
    widthPx: 65,
    heightPx: 70,
    color: 'bg-indigo-100 border-indigo-400 text-indigo-800',
  },
  {
    type: 'BED_QUEEN' as const,
    name: 'Queen Bed (5 x 6.5 ft)',
    widthFeet: 5.0,
    lengthFeet: 6.5,
    icon: Bed,
    widthPx: 50,
    heightPx: 65,
    color: 'bg-blue-100 border-blue-400 text-blue-800',
  },
  {
    type: 'SOFA_SECTIONAL' as const,
    name: 'L-Couch Sectional (9 x 8 ft)',
    widthFeet: 9.0,
    lengthFeet: 8.0,
    icon: Sofa,
    widthPx: 85,
    heightPx: 75,
    color: 'bg-emerald-100 border-emerald-400 text-emerald-800',
  },
  {
    type: 'OFFICE_DESK' as const,
    name: 'Standing Desk (5 x 3 ft)',
    widthFeet: 5.0,
    lengthFeet: 3.0,
    icon: Laptop,
    widthPx: 50,
    heightPx: 32,
    color: 'bg-amber-100 border-amber-400 text-amber-800',
  },
  {
    type: 'TV_MEDIA_CONSOLE' as const,
    name: '65" Media Center (5.5 x 2 ft)',
    widthFeet: 5.5,
    lengthFeet: 2.0,
    icon: Tv,
    widthPx: 55,
    heightPx: 22,
    color: 'bg-purple-100 border-purple-400 text-purple-800',
  },
];

export const BlueprintFurnitureStaging: React.FC<BlueprintFurnitureStagingProps> = ({
  blueprint,
  totalSqFt,
}) => {
  const [furnitureList, setFurnitureList] = useState<FurnitureItem[]>(
    blueprint.defaultFurniture || []
  );
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<RoomDimension | null>(
    blueprint.roomBreakdown[0] || null
  );

  const canvasRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Add new furniture piece
  const handleAddFurniture = (item: typeof AVAILABLE_FURNITURE_CATALOG[0]) => {
    const newItem: FurnitureItem = {
      id: `furn_${Date.now()}`,
      type: item.type,
      name: item.name,
      widthFeet: item.widthFeet,
      lengthFeet: item.lengthFeet,
      x: 100 + Math.random() * 80,
      y: 100 + Math.random() * 80,
      rotationDeg: 0,
      iconName: item.name,
    };
    setFurnitureList([...furnitureList, newItem]);
    setSelectedFurnitureId(newItem.id);
  };

  // Rotate selected furniture
  const handleRotateSelected = () => {
    if (!selectedFurnitureId) return;
    setFurnitureList(
      furnitureList.map((f) =>
        f.id === selectedFurnitureId
          ? { ...f, rotationDeg: (f.rotationDeg + 90) % 360 }
          : f
      )
    );
  };

  // Remove selected furniture
  const handleRemoveSelected = () => {
    if (!selectedFurnitureId) return;
    setFurnitureList(furnitureList.filter((f) => f.id !== selectedFurnitureId));
    setSelectedFurnitureId(null);
  };

  // Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedFurnitureId(id);
    isDraggingRef.current = true;
    const item = furnitureList.find((f) => f.id === id);
    if (item && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      dragOffsetRef.current = {
        x: e.clientX - rect.left - item.x,
        y: e.clientY - rect.top - item.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !selectedFurnitureId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(10, Math.min(540, e.clientX - rect.left - dragOffsetRef.current.x));
    const newY = Math.max(10, Math.min(380, e.clientY - rect.top - dragOffsetRef.current.y));

    setFurnitureList(
      furnitureList.map((f) =>
        f.id === selectedFurnitureId ? { ...f, x: newX, y: newY } : f
      )
    );
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 text-white rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
            <h4 className="text-base font-black tracking-wide uppercase text-white">
              Architectural CAD & Interactive Staging
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Total Finished Area: <strong className="text-white">{totalSqFt.toLocaleString()} Sq Ft</strong> • {blueprint.totalFloorCount} Stories
          </p>
        </div>

        {/* Selected Item Controls */}
        <div className="flex items-center gap-2">
          {selectedFurnitureId ? (
            <>
              <button
                onClick={handleRotateSelected}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 transition-all"
                title="Rotate 90 degrees"
              >
                <RotateCw className="w-3.5 h-3.5 text-brand-400" />
                <span>Rotate 90°</span>
              </button>
              <button
                onClick={handleRemoveSelected}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-semibold rounded-lg border border-rose-800 transition-all"
                title="Delete furniture"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-400 italic">
              Click & drag any furniture piece to test room fit
            </span>
          )}
        </div>
      </div>

      {/* Main Staging Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left: Furniture Staging Palette */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Drag & Drop Furniture
          </div>
          <p className="text-[11px] text-slate-500">
            Verify actual fit against load-bearing dimensions before touring:
          </p>
          <div className="space-y-2">
            {AVAILABLE_FURNITURE_CATALOG.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleAddFurniture(item)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/40 text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-brand-100 flex items-center justify-center text-slate-700 group-hover:text-brand-600 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {item.name.split('(')[0]}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {item.widthFeet}' × {item.lengthFeet}' Dimensions
                      </div>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
                </button>
              );
            })}
          </div>

          {/* Room Selection Pills */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Room Dimensions
            </div>
            <div className="space-y-1.5">
              {blueprint.roomBreakdown.map((room) => (
                <div
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    activeRoom?.id === room.id
                      ? 'border-brand-500 bg-brand-50/60 text-slate-900'
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100/80 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{room.roomName}</span>
                    <span className="text-[11px] font-mono text-brand-600 font-bold">
                      {room.squareFootage} sqft
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-between">
                    <span>
                      {room.dimensionsFeet.width}' × {room.dimensionsFeet.length}' ({room.dimensionsFeet.ceilingHeight}' Ceiling)
                    </span>
                    <span className="font-semibold text-slate-600">
                      {room.windowOrientation} Sun Exposure
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Interactive 2D Blueprint Canvas */}
        <div className="lg:col-span-3">
          <div
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="relative w-full h-[460px] bg-slate-900 border-2 border-slate-700 rounded-2xl overflow-hidden select-none shadow-inner"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          >
            {/* Grid Legend Overlay */}
            <div className="absolute top-3 left-3 bg-slate-800/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700 text-[10px] text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500" />
              <span>Grid Scale: 1 Block = 2.0 ft</span>
            </div>

            <div className="absolute top-3 right-3 bg-slate-800/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700 text-[10px] text-slate-300 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-brand-400" />
              <span>Solar North ↑</span>
            </div>

            {/* Architectural Rooms Render */}
            {blueprint.roomBreakdown.map((room) => {
              const isSelected = activeRoom?.id === room.id;
              return (
                <div
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={`absolute rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-brand-500 bg-brand-950/40 shadow-[0_0_20px_rgba(220,38,38,0.25)]'
                      : 'border-slate-600 bg-slate-800/60 hover:border-slate-500'
                  }`}
                  style={{
                    left: `${room.rect.x}px`,
                    top: `${room.rect.y}px`,
                    width: `${room.rect.width}px`,
                    height: `${room.rect.height}px`,
                  }}
                >
                  {/* Room Label */}
                  <div className="p-2.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{room.roomName}</span>
                      {room.hasEnSuiteBath && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-emerald-900/80 text-emerald-300 border border-emerald-700 rounded">
                          En-Suite
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-300 font-mono mt-0.5">
                      {room.dimensionsFeet.width}' × {room.dimensionsFeet.length}' • {room.squareFootage} sqft
                    </div>
                  </div>

                  {/* Window Orientation Indicator */}
                  <div className="absolute bottom-2 right-2 text-[9px] text-amber-300/80 font-mono">
                    Window [{room.windowOrientation}]
                  </div>
                </div>
              );
            })}

            {/* Draggable Furniture Items */}
            {furnitureList.map((f) => {
              const isSelected = selectedFurnitureId === f.id;
              return (
                <div
                  key={f.id}
                  onMouseDown={(e) => handleMouseDown(e, f.id)}
                  className={`absolute p-2 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-shadow z-20 select-none ${
                    isSelected
                      ? 'border-brand-400 bg-brand-600 text-white shadow-brand shadow-red-500/50 scale-105'
                      : 'border-white/80 bg-slate-800/90 text-white hover:border-brand-300 shadow-md'
                  }`}
                  style={{
                    left: `${f.x}px`,
                    top: `${f.y}px`,
                    transform: `rotate(${f.rotationDeg}deg)`,
                    minWidth: '60px',
                  }}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-bold">
                    <Move className="w-3 h-3 shrink-0 opacity-70" />
                    <span className="truncate">{f.name.split('(')[0]}</span>
                  </div>
                  <div className="text-[9px] opacity-80 font-mono">
                    {f.widthFeet}' × {f.lengthFeet}'
                  </div>
                </div>
              );
            })}
          </div>

          {/* Staging Verification Tip */}
          <div className="mt-3 flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Spatial Verification:</strong> All room walls reflect structural load-bearing CAD data. Move and stage furniture to inspect clearances before visiting in person.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
