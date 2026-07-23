'use client';

import React from 'react';
import {
  CheckCircle2,
  Trash2,
  Edit3,
  Send,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { PainEntry, QuestionAnswer } from '@/types/database';
import { getPainColor } from '@/lib/bodyParts';

interface AssessmentSummaryProps {
  patient: {
    name: string;
    age: number;
    gender: string;
  };
  entries: PainEntry[];
  onEditPatient: () => void;
  onEditEntry: (entry: PainEntry) => void;
  onRemoveEntry: (bodyPartId: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitted: boolean;
  assessmentId?: string;
  dbSource?: 'supabase' | 'local';
  onReset: () => void;
}

export function AssessmentSummary({
  patient,
  entries,
  onEditPatient,
  onEditEntry,
  onRemoveEntry,
  onSubmit,
  isSubmitting,
  submitted,
  assessmentId,
  dbSource,
  onReset,
}: AssessmentSummaryProps) {
  // Compute highest severity score
  const maxPainLevel = entries.length > 0 ? Math.max(...entries.map((e) => e.pain_level)) : 0;
  const maxPainMeta = getPainColor(maxPainLevel);

  if (submitted) {
    return (
      <div className="w-full max-w-xl mx-auto glass-panel p-8 rounded-3xl border border-emerald-500/30 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Pain Assessment Recorded!
          </h2>
          <p className="text-sm text-slate-300">
            Thank you, <span className="font-semibold text-white">{patient.name}</span>. Your body pain assessment report has been securely saved to the database.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Record Reference ID:</span>
            <span className="font-mono text-cyan-400 font-semibold">{assessmentId || 'REC-9921'}</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Database Destination:</span>
            <span className="font-mono text-emerald-400 font-semibold uppercase">
              {dbSource === 'supabase' ? 'Supabase Cloud Postgres' : 'Local Storage Engine'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total Body Parts Assessed:</span>
            <span className="font-bold text-white">{entries.length} Location(s)</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Submit New Assessment</span>
          </button>

          <a
            href="/admin"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/40 shadow-lg shadow-indigo-600/20 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>View in Admin Dashboard</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Assessment Breakdown</h3>
          <p className="text-xs text-slate-400">Review selected body locations before final save</p>
        </div>

        {entries.length > 0 && (
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${maxPainMeta.bg} ${maxPainMeta.text} ${maxPainMeta.border}`}>
            Max Severity: {maxPainLevel}/10
          </div>
        )}
      </div>

      {/* Patient info quick summary pill */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-slate-200">{patient.name}</span>
          <span className="text-slate-400">({patient.age} yrs • {patient.gender})</span>
        </div>
        <button
          type="button"
          onClick={onEditPatient}
          className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300"
        >
          <Edit3 className="w-3 h-3" />
          <span>Edit Info</span>
        </button>
      </div>

      {/* Entries List */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {entries.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-400/80 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No body pain points clicked yet</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Please click on any body region on the interactive body diagram to add pain score and duration.
            </p>
          </div>
        ) : (
          entries.map((entry) => {
            const color = getPainColor(entry.pain_level);
            return (
              <div
                key={entry.body_part_id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs border ${color.bg} ${color.text} ${color.border}`}
                  >
                    {entry.pain_level}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{entry.body_part_name}</h4>
                    <p className="text-[11px] text-slate-400">
                      Duration: <span className="text-slate-200 font-medium">{entry.duration}</span>
                      {entry.symptom_type && ` • ${entry.symptom_type}`}
                    </p>
                    {entry.answers && entry.answers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entry.answers.map((ans: QuestionAnswer) => (
                          <span key={ans.question_id} className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-medium border border-slate-700/60">
                            {ans.selected_option}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEditEntry(entry)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                    title="Edit entry"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveEntry(entry.body_part_id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Remove entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submit Button */}
      <button
        type="button"
        disabled={entries.length === 0 || isSubmitting}
        onClick={onSubmit}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-500/30 shadow-xl shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span>Saving Assessment to Database...</span>
          </div>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Submit Complete Assessment ({entries.length} Points)</span>
          </>
        )}
      </button>
    </div>
  );
}
