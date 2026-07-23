'use client';

import React, { useState } from 'react';
import { User, Calendar, Users, ArrowRight, ArrowLeft, Activity } from 'lucide-react';
import { Gender } from '@/types/database';

interface PatientFormProps {
  initialValues?: {
    name: string;
    age: number;
    gender: Gender;
  };
  onSubmit: (data: { name: string; age: number; gender: Gender }) => void;
}

const GENDER_OPTIONS: { value: Gender; label: string; icon: string }[] = [
  { value: 'Male', label: 'Male', icon: '👨' },
  { value: 'Female', label: 'Female', icon: '👩' },
  { value: 'Non-binary', label: 'Non-binary', icon: '🧑' },
  { value: 'Prefer not to say', label: 'Prefer not to say', icon: '🔒' },
];

type FormStep = 1 | 2 | 3;

export function PatientForm({ initialValues, onSubmit }: PatientFormProps) {
  const [step, setStep] = useState<FormStep>(1);
  const [name, setName] = useState(initialValues?.name || '');
  const [age, setAge] = useState<number | ''>(initialValues?.age || '');
  const [gender, setGender] = useState<Gender>(initialValues?.gender || 'Male');
  const [errors, setErrors] = useState<{ name?: string; age?: string }>({});

  const validateStep = (currentStep: FormStep): boolean => {
    const newErrors: { name?: string; age?: string } = {};

    if (currentStep === 1 && !name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (currentStep === 2 && (age === '' || Number(age) <= 0 || Number(age) > 120)) {
      newErrors.age = 'Please enter a valid age (1-120)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setErrors({});
      setStep((prev) => (prev < 3 ? (prev + 1) as FormStep : prev));
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep((prev) => (prev > 1 ? (prev - 1) as FormStep : prev));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(3)) {
      setErrors({});
      onSubmit({
        name: name.trim(),
        age: Number(age),
        gender,
      });
    }
  };

  const stepLabels = ['Full Name', 'Age', 'Gender'];

  return (
    <div className="w-full max-w-xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
      <div className="space-y-4">
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

        <div className="flex items-center gap-2">
          {stepLabels.map((label, idx) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                    step > idx + 1
                      ? 'bg-blue-500 text-white border-blue-400'
                      : step === idx + 1
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:inline ${
                    step === idx + 1 ? 'text-blue-300' : 'text-slate-500'
                  }`}
                >
                  {label}
                </span>
              </div>
              {idx < stepLabels.length - 1 && (
                <div
                  className={`flex-1 h-0.5 rounded transition-all ${
                    step > idx + 1 ? 'bg-blue-500' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {step === 1 && (
          <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-200">
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
        )}

        {step === 2 && (
          <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-200">
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
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
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
          </div>
        )}

        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          {step < 3 && (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border border-blue-400/30 shadow-xl shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border border-blue-400/30 shadow-xl shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Continue to Body Pain Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
