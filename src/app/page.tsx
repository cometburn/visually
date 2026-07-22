'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from '@/components/Navbar';
import { PatientForm } from '@/components/PatientForm';
import { BodyMap } from '@/components/BodyMap';
import { PainModal } from '@/components/PainModal';
import { AssessmentSummary } from '@/components/AssessmentSummary';
import { BodyZone, getBodyZoneById } from '@/lib/bodyParts';
import { Gender, PainEntry } from '@/types/database';
import { savePainAssessment } from '@/lib/db';
import { Activity, UserCheck, HeartPulse, ChevronLeft, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PatientAssessmentPage() {
  const [step, setStep] = useState<1 | 2>(1);

  // Patient Info State
  const [patient, setPatient] = useState<{
    name: string;
    age: number;
    gender: Gender;
    notes?: string;
  }>({
    name: '',
    age: 25,
    gender: 'Male',
  });

  // Recorded Pain Entries State
  const [entries, setEntries] = useState<PainEntry[]>([]);

  // Modal State
  const [selectedZone, setSelectedZone] = useState<BodyZone | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [assessmentId, setAssessmentId] = useState<string>('');
  const [dbSource, setDbSource] = useState<'supabase' | 'local'>('local');

  // Step 1 Submission
  const handlePatientSubmit = (data: { name: string; age: number; gender: Gender; notes?: string }) => {
    setPatient(data);
    setStep(2);
  };

  // Select body zone to open modal
  const handleSelectZone = (zone: BodyZone) => {
    setSelectedZone(zone);
    setIsModalOpen(true);
  };

  // Save/Update Pain Entry from Modal
  const handleSaveEntry = (entry: PainEntry) => {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.body_part_id === entry.body_part_id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = entry;
        return copy;
      }
      return [...prev, entry];
    });
  };

  // Remove Pain Entry
  const handleRemoveEntry = (bodyPartId: string) => {
    setEntries((prev) => prev.filter((e) => e.body_part_id !== bodyPartId));
  };

  // Edit Pain Entry from Summary
  const handleEditEntry = (entry: PainEntry) => {
    const zone = getBodyZoneById(entry.body_part_id);
    if (zone) {
      setSelectedZone(zone);
      setIsModalOpen(true);
    }
  };

  // Final Assessment Submission
  const handleSubmitAssessment = async () => {
    setIsSubmitting(true);
    try {
      const result = await savePainAssessment({
        patient,
        entries,
      });

      if (result.success) {
        setAssessmentId(result.assessmentId);
        setDbSource(result.source);
        setSubmitted(true);

        // Fire celebration confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // ignore confetti if unsupported
        }
      }
    } catch (err) {
      console.error('Failed to submit pain assessment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Form
  const handleReset = () => {
    setStep(1);
    setEntries([]);
    setSubmitted(false);
    setAssessmentId('');
  };

  const existingEntryForModal = selectedZone
    ? entries.find((e) => e.body_part_id === selectedZone.id)
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
              Interactive Body Pain Assessment
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Select anatomical regions, rate pain severity (1-10), and log symptom duration.
            </p>
          </div>

          {step === 2 && !submitted && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Patient Info</span>
            </button>
          )}
        </div>

        {/* STEP 1: Patient Demographic Form */}
        {step === 1 && (
          <div className="py-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <PatientForm initialValues={patient.name ? patient : undefined} onSubmit={handlePatientSubmit} />
          </div>
        )}

        {/* STEP 2: Interactive Body Assessment & Summary Sidebar */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
            {/* Left Column: Interactive Body Map */}
            <div className="lg:col-span-7 flex flex-col items-center glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-bold text-white">Anatomical Body Selector</h3>
                </div>
                <span className="text-xs text-slate-400">Click any highlighted body part to add pain details</span>
              </div>

              <BodyMap
                entries={entries}
                onSelectZone={handleSelectZone}
              />
            </div>

            {/* Right Column: Assessment Summary & Submission */}
            <div className="lg:col-span-5 space-y-6">
              <AssessmentSummary
                patient={patient}
                entries={entries}
                onEditPatient={() => setStep(1)}
                onEditEntry={handleEditEntry}
                onRemoveEntry={handleRemoveEntry}
                onSubmit={handleSubmitAssessment}
                isSubmitting={isSubmitting}
                submitted={submitted}
                assessmentId={assessmentId}
                dbSource={dbSource}
                onReset={handleReset}
              />
            </div>
          </div>
        )}

        {/* Pain Details Modal */}
        <PainModal
          isOpen={isModalOpen}
          zone={selectedZone}
          existingEntry={existingEntryForModal}
          onSave={handleSaveEntry}
          onRemove={handleRemoveEntry}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedZone(null);
          }}
        />
      </main>
    </div>
  );
}
