'use client';

import React, { useState, useEffect } from 'react';
import { X, Flame, Clock, AlertTriangle, CheckCircle2, Trash2, Info, Sparkles } from 'lucide-react';
import { BodyZone, getPainColor } from '@/lib/bodyParts';
import { PainEntry } from '@/types/database';

interface PainModalProps {
  isOpen: boolean;
  zone: BodyZone | null;
  existingEntry?: PainEntry | null;
  onSave: (entry: PainEntry) => void;
  onRemove?: (bodyPartId: string) => void;
  onClose: () => void;
}

const DURATION_OPTIONS = [
  '< 24 hours',
  '1-3 days',
  '1-2 weeks',
  '1-6 months',
  'Chronic (> 6 months)',
];

const SYMPTOM_TYPES = [
  'Aching',
  'Sharp / Stabbing',
  'Throbbing',
  'Burning / Stinging',
  'Stiffness / Tightness',
  'Numbness / Tingling',
  'Dull Ache',
  'Radiating',
];

export function PainModal({
  isOpen,
  zone,
  existingEntry,
  onSave,
  onRemove,
  onClose,
}: PainModalProps) {
  const [painLevel, setPainLevel] = useState<number>(5);
  const [duration, setDuration] = useState<string>('1-3 days');
  const [symptomType, setSymptomType] = useState<string>('Aching');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (existingEntry) {
      setPainLevel(existingEntry.pain_level);
      setDuration(existingEntry.duration);
      setSymptomType(existingEntry.symptom_type || 'Aching');
      setNotes(existingEntry.notes || '');
    } else {
      setPainLevel(5);
      setDuration('1-3 days');
      setSymptomType('Aching');
      setNotes('');
    }
  }, [existingEntry, zone]);

  if (!isOpen || !zone) return null;

  const colorMeta = getPainColor(painLevel);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: PainEntry = {
      id: existingEntry?.id || `entry-${Date.now()}`,
      body_part_id: zone.id,
      body_part_name: zone.name,
      view: zone.view,
      pain_level: painLevel,
      duration,
      symptom_type: symptomType,
      notes: notes.trim() || undefined,
    };
    onSave(entry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl glass-panel border border-slate-700/60 shadow-2xl shadow-slate-950 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full animate-pulse"
              style={{ backgroundColor: colorMeta.fill }}
            />
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-white">
                {zone.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {zone.category} • {zone.view.toUpperCase()} VIEW
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Anatomical description hint */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs text-slate-300">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>{zone.description}</span>
          </div>

          {/* 1. Pain Severity Rating Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <Flame className="w-4 h-4 text-amber-400" />
                Pain Rating (1 to 10)
              </label>
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold border ${colorMeta.bg} ${colorMeta.text} ${colorMeta.border}`}
              >
                Score: {painLevel}/10 — {colorMeta.label}
              </div>
            </div>

            {/* Slider */}
            <div className="relative pt-2">
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={painLevel}
                onChange={(e) => setPainLevel(parseInt(e.target.value, 10))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-blue-500 focus:outline-none"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono pt-1">
                <span>1 (Mild)</span>
                <span>5 (Moderate)</span>
                <span>8 (Severe)</span>
                <span>10 (Worst)</span>
              </div>
            </div>

            {/* Quick Rating Selector Buttons */}
            <div className="grid grid-cols-10 gap-1 pt-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => {
                const isSelected = painLevel === val;
                const valMeta = getPainColor(val);
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPainLevel(val)}
                    className={`h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center border ${
                      isSelected
                        ? `${valMeta.bg} ${valMeta.text} ${valMeta.border} ring-2 ring-blue-500/50 scale-105`
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Duration Selector */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Clock className="w-4 h-4 text-cyan-400" />
              How long have you experienced this pain?
            </label>

            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => {
                const isSelected = duration === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDuration(opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                        : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Symptom Characteristic */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Symptom Description
            </label>

            <div className="grid grid-cols-2 gap-2">
              {SYMPTOM_TYPES.map((st) => {
                const isSelected = symptomType === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSymptomType(st)}
                    className={`px-3 py-2 rounded-xl text-xs text-left font-medium border transition-all ${
                      isSelected
                        ? 'bg-indigo-600/25 text-indigo-300 border-indigo-500/50'
                        : 'bg-slate-800/40 text-slate-400 border-slate-700/40 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Notes / Trigger Factors */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">
              Additional Details / Triggering Activities (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Worse when sitting down, hurts during deep breath, radiating down arm..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </div>

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {existingEntry && onRemove ? (
              <button
                type="button"
                onClick={() => {
                  onRemove(zone.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Pain Point</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-500/30 shadow-lg shadow-blue-600/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{existingEntry ? 'Update Pain Record' : 'Save Pain Record'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
