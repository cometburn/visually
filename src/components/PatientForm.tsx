'use client';

import React, { useState } from 'react';
import { User, Calendar, Users, ArrowRight, Activity, FileText } from 'lucide-react';
import { Gender } from '@/types/database';

interface PatientFormProps {
  initialValues?: {
    name: string;
    age: number;
    gender: Gender;
    notes?: string;
  };
  onSubmit: (data: { name: string; age: number; gender: Gender; notes?: string }) => void;
}

const GENDER_OPTIONS: { value: Gender; label: string; icon: string }[] = [
  { value: 'Male', label: 'Male', icon: '👨' },
  { value: 'Female', label: 'Female', icon: '👩' },
  { value: 'Non-binary', label: 'Non-binary', icon: '🧑' },
  { value: 'Prefer not to say', label: 'Prefer not to say', icon: '🔒' },
];

export function PatientForm({ initialValues, onSubmit }: PatientFormProps) {
  const [name, setName] = useState(initialValues?.name || '');
  const [age, setAge] = useState<number | ''>(initialValues?.age || '');
  const [gender, setGender] = useState<Gender>(initialValues?.gender || 'Male');
  const [notes, setNotes] = useState(initialValues?.notes || '');
  const [errors, setErrors] = useState<{ name?: string; age?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; age?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (age === '' || Number(age) <= 0 || Number(age) > 120) {
      newErrors.age = 'Please enter a valid age (1-120)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      name: name.trim(),
      age: Number(age),
      gender,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
          <Activity className="w-3.5 h-3.5" />
          <span>Step 1 of 2: Patient Registration</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Patient General Information
        </h2>
        <p className="text-sm text-slate-400">
          Please complete your personal details before locating pain on the interactive body map.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <User className="w-4 h-4 text-blue-400" />
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
            className={`w-full px-4 py-3 rounded-2xl bg-slate-900/90 border text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.name
                ? 'border-rose-500/60 focus:ring-rose-500/30'
                : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
          />
          {errors.name && <p className="text-xs text-rose-400 font-medium">{errors.name}</p>}
        </div>

        {/* Age & Gender Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Age */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Age (Years)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              placeholder="e.g. 35"
              className={`w-full px-4 py-3 rounded-2xl bg-slate-900/90 border text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.age
                  ? 'border-rose-500/60 focus:ring-rose-500/30'
                  : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
            {errors.age && <p className="text-xs text-rose-400 font-medium">{errors.age}</p>}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Users className="w-4 h-4 text-indigo-400" />
              Gender Identification
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              {GENDER_OPTIONS.map((g) => (
                <option key={g.value} value={g.value} className="bg-slate-900 text-slate-200">
                  {g.icon} {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Gender Card Quick Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {GENDER_OPTIONS.map((g) => {
            const isSelected = gender === g.value;
            return (
              <button
                key={g.value}
                type="button"
                onClick={() => setGender(g.value)}
                className={`py-2.5 px-3 rounded-2xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-blue-600/25 text-blue-300 border-blue-500/50 shadow-md shadow-blue-500/10'
                    : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <span>{g.icon}</span>
                <span className="truncate">{g.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chief Complaint / Notes */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <FileText className="w-4 h-4 text-slate-400" />
            General Health / Medical Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Recent physical exertion, chronic desk sitting, past sports injury..."
            className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border border-blue-400/30 shadow-xl shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>Continue to Body Pain Map</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
