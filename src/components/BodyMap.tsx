'use client';

import React, { useState } from 'react';
import { RotateCw, CheckCircle2, AlertCircle, Info, Eye, Layers } from 'lucide-react';
import {
  ANTERIOR_BODY_ZONES,
  POSTERIOR_BODY_ZONES,
  BodyZone,
  getPainColor,
} from '@/lib/bodyParts';
import { BodyPartView, PainEntry } from '@/types/database';

interface BodyMapProps {
  entries: PainEntry[];
  onSelectZone: (zone: BodyZone) => void;
  activeView?: BodyPartView;
  onViewChange?: (view: BodyPartView) => void;
  readOnly?: boolean;
}

export function BodyMap({
  entries,
  onSelectZone,
  activeView = 'anterior',
  onViewChange,
  readOnly = false,
}: BodyMapProps) {
  const [currentView, setCurrentView] = useState<BodyPartView>(activeView);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);

  const setView = (view: BodyPartView) => {
    setCurrentView(view);
    if (onViewChange) onViewChange(view);
  };

  const zones = currentView === 'anterior' ? ANTERIOR_BODY_ZONES : POSTERIOR_BODY_ZONES;

  // Map entries for quick lookup
  const entryMap = new Map<string, PainEntry>();
  entries.forEach((e) => entryMap.set(e.body_part_id, e));

  const hoveredZone = zones.find((z) => z.id === hoveredZoneId);
  const hoveredEntry = hoveredZoneId ? entryMap.get(hoveredZoneId) : null;

  return (
    <div className="flex flex-col items-center w-full space-y-4">
      {/* View Switcher Controls */}
      <div className="flex items-center justify-between w-full max-w-md p-1.5 rounded-2xl glass-panel border border-slate-800">
        <button
          type="button"
          onClick={() => setView('anterior')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
            currentView === 'anterior'
              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Anterior (Front View)</span>
        </button>

        <button
          type="button"
          onClick={() => setView('posterior')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
            currentView === 'posterior'
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Posterior (Back View)</span>
        </button>
      </div>

      {/* Main Body Map Container */}
      <div className="relative w-full max-w-md aspect-[1/1.9] bg-slate-900/40 backdrop-blur-sm rounded-3xl border border-slate-800 p-4 shadow-2xl flex items-center justify-center overflow-hidden">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        {/* View Badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
          <Layers className="w-3 h-3 text-blue-400" />
          <span>{currentView.toUpperCase()} VIEW</span>
        </div>

        {/* SVG Anatomical Human Body Silhouette */}
        <div className="relative w-full h-full">
          <svg
            viewBox="0 0 200 380"
            className="w-full h-full drop-shadow-[0_0_15px_rgba(30,41,59,0.5)] select-none"
          >
            <defs>
              <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Base Human Silhouette Outlines */}
            <g opacity="0.85">
              {/* Head */}
              <ellipse cx="100" cy="30" rx="18" ry="22" fill="url(#bodyGradient)" stroke="#334155" strokeWidth="1.5" />
              {/* Neck */}
              <rect x="92" y="50" width="16" height="15" rx="3" fill="url(#bodyGradient)" stroke="#334155" strokeWidth="1.5" />

              {/* Torso & Arms */}
              <path
                d="M 65 65 Q 100 62 135 65 L 148 105 L 140 180 L 125 180 L 125 165 L 75 165 L 75 180 L 60 180 L 52 105 Z"
                fill="url(#bodyGradient)"
                stroke="#334155"
                strokeWidth="1.5"
              />

              {/* Arms */}
              {/* Left Arm (Viewer Right) */}
              <path d="M 135 65 L 158 105 L 168 150 L 172 185 L 162 185 L 150 148 L 140 110 Z" fill="url(#bodyGradient)" stroke="#334155" strokeWidth="1.5" />
              {/* Right Arm (Viewer Left) */}
              <path d="M 65 65 L 42 105 L 32 150 L 28 185 L 38 185 L 50 148 L 60 110 Z" fill="url(#bodyGradient)" stroke="#334155" strokeWidth="1.5" />

              {/* Pelvis & Legs */}
              <path d="M 75 165 L 125 165 L 132 240 L 122 310 L 118 355 L 105 355 L 102 240 L 98 240 L 95 355 L 82 355 L 78 310 L 68 240 Z" fill="url(#bodyGradient)" stroke="#334155" strokeWidth="1.5" />
            </g>

            {/* Clickable Zone Interactive Overlays */}
            {zones.map((zone) => {
              const entry = entryMap.get(zone.id);
              const isHovered = hoveredZoneId === zone.id;
              const hasPain = Boolean(entry);
              const painColor = entry ? getPainColor(entry.pain_level) : null;

              // Convert percentage marker position to SVG viewBox (width: 200, height: 380)
              const cx = (zone.markerPos.x / 100) * 200;
              const cy = (zone.markerPos.y / 100) * 380;

              return (
                <g key={zone.id} className="cursor-pointer">
                  {/* Interactive Hotspot Circle */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={hasPain ? 16 : isHovered ? 14 : 11}
                    fill={hasPain ? painColor?.fill : isHovered ? 'rgba(59, 130, 246, 0.4)' : 'rgba(30, 41, 59, 0.7)'}
                    stroke={hasPain ? '#ffffff' : isHovered ? '#60a5fa' : '#475569'}
                    strokeWidth={hasPain ? 2.5 : isHovered ? 2 : 1}
                    className="transition-all duration-200"
                    onMouseEnter={() => setHoveredZoneId(zone.id)}
                    onMouseLeave={() => setHoveredZoneId(null)}
                    onClick={() => !readOnly && onSelectZone(zone)}
                  />

                  {/* Pulsing ring for active pain items */}
                  {hasPain && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="20"
                      fill="none"
                      stroke={painColor?.fill}
                      strokeWidth="1.5"
                      className="animate-ping opacity-60"
                      style={{ transformOrigin: `${cx}px ${cy}px` }}
                    />
                  )}

                  {/* Rating Badge Text */}
                  {entry ? (
                    <text
                      x={cx}
                      y={cy + 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      className="pointer-events-none select-none font-mono"
                    >
                      {entry.pain_level}
                    </text>
                  ) : (
                    <text
                      x={cx}
                      y={cy + 3}
                      textAnchor="middle"
                      fill={isHovered ? '#60a5fa' : '#94a3b8'}
                      fontSize="9"
                      fontWeight="600"
                      className="pointer-events-none select-none"
                    >
                      +
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floating Hover Tooltip */}
          {hoveredZone && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-xs p-3 rounded-2xl glass-panel border border-blue-500/40 shadow-xl text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">{hoveredZone.name}</span>
                <span className="text-[10px] font-mono text-slate-400">{hoveredZone.category}</span>
              </div>

              {hoveredEntry ? (
                <div className="space-y-1 pt-1 border-t border-slate-700/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Pain Score:</span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        getPainColor(hoveredEntry.pain_level).bg
                      } ${getPainColor(hoveredEntry.pain_level).text}`}
                    >
                      {hoveredEntry.pain_level} / 10 ({getPainColor(hoveredEntry.pain_level).label})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Duration: <span className="text-slate-200">{hoveredEntry.duration}</span>
                  </div>
                  {hoveredEntry.symptom_type && (
                    <div className="text-[11px] text-slate-400">
                      Symptom: <span className="text-cyan-300">{hoveredEntry.symptom_type}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">
                  {readOnly ? 'No pain reported' : 'Click to report pain on this body part'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 pt-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
          <span>Mild (1-3)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
          <span>Moderate (4-6)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm" />
          <span>Severe (7-8)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-sm" />
          <span>Critical (9-10)</span>
        </div>
      </div>
    </div>
  );
}
