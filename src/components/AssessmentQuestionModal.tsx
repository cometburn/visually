'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ChevronRight, ChevronLeft, Play } from 'lucide-react';
import { BodyZone, getPainColor } from '@/lib/bodyParts';
import { PainEntry, AssessmentQuestion } from '@/types/database';
import { getAssessmentQuestions } from '@/lib/db';
import { getEmbedVideoUrl } from '@/lib/video';

interface AssessmentQuestionModalProps {
  isOpen: boolean;
  zone: BodyZone | null;
  existingEntry?: PainEntry | null;
  onSave: (entry: PainEntry) => void;
  onRemove?: (bodyPartId: string) => void;
  onClose: () => void;
}

export function AssessmentQuestionModal({
  isOpen,
  zone,
  existingEntry,
  onSave,
  onRemove,
  onClose,
}: AssessmentQuestionModalProps) {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen || !zone) return;
    const frame = requestAnimationFrame(() => {
      setLoading(true);
      setCurrentStep(0);
      getAssessmentQuestions().then((result) => {
        const qs = result.data;
        setQuestions(qs);
        if (existingEntry?.answers) {
          const restored: Record<string, string> = {};
          for (const ans of existingEntry.answers) {
            restored[ans.question_id] = ans.selected_option;
          }
          setAnswers(restored);
        } else {
          setAnswers({});
        }
        setLoading(false);
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, zone, existingEntry]);

  if (!isOpen || !zone) return null;

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const isFirstStep = currentStep === 0;

  const selectedOption = currentQuestion ? answers[currentQuestion.id] || '' : '';

  const handleNext = () => {
    if (!selectedOption || !currentQuestion) return;
    if (isLastStep) {
      finishAssessment();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  function finishAssessment() {
    if (!zone || !currentQuestion) return;

    const painLevelAnswer = answers[questions[0]?.id];
    const durationAnswer = answers[questions[1]?.id];

    const painLevel = painLevelAnswer ? parseInt(painLevelAnswer.split(' ')[0], 10) || 5 : 5;
    const duration = durationAnswer || '1-3 days';

    const entry: PainEntry = {
      id: existingEntry?.id || `entry-${Date.now()}`,
      body_part_id: zone.id,
      body_part_name: zone.name,
      view: zone.view,
      pain_level: painLevel,
      duration,
      symptom_type: existingEntry?.symptom_type,
      notes: existingEntry?.notes,
      created_at: existingEntry?.created_at,
      answers: questions
        .filter((q) => answers[q.id])
        .map((q) => ({
          question_id: q.id,
          selected_option: answers[q.id],
        })),
    };

    onSave(entry);
    onClose();
  }

  const colorMeta = getPainColor(5);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!currentQuestion || questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center">
          <p className="text-sm text-slate-300">No questions configured yet.</p>
          <button onClick={onClose} className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700">
            Close
          </button>
        </div>
      </div>
    );
  }

  const videoUrl = currentQuestion.video_url || '';
  const embedUrl = getEmbedVideoUrl(videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl rounded-3xl glass-panel border border-slate-700/60 shadow-2xl shadow-slate-950 overflow-hidden text-slate-100"
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
                {zone.category} • {zone.view.toUpperCase()} VIEW • Step {currentStep + 1} of {questions.length}
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

        {/* Progress Bar */}
        <div className="h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <VideoColumn question={currentQuestion} embedUrl={embedUrl} />
            <QuestionAnswerColumn
              question={currentQuestion}
              selectedOption={selectedOption}
              onSelect={(opt) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: opt }))}
              isTimeQuestion={currentStep === 1}
            />
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/40">
          <div>
            {!isFirstStep && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {existingEntry && onRemove && isLastStep ? (
              <button
                type="button"
                onClick={() => {
                  onRemove(zone.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors ml-2"
              >
                Remove Pain Point
              </button>
            ) : (
              <div />
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={!selectedOption}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-500/30 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all"
          >
            {isLastStep ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Pain Record</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoColumn({ question, embedUrl }: { question: AssessmentQuestion; embedUrl: string | null }) {
  return (
    <div className="space-y-3">
      {embedUrl ? (
        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black aspect-video">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Instructional video"
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 aspect-video flex items-center justify-center">
          <div className="text-center space-y-2">
            <Play className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-500">No video for this question</p>
          </div>
        </div>
      )}
      {question.is_fixed && (
        <div className="flex items-center gap-2 text-[11px] font-semibold text-amber-400">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Standard Assessment Question
        </div>
      )}
    </div>
  );
}

function QuestionAnswerColumn({
  question,
  selectedOption,
  onSelect,
  isTimeQuestion,
}: {
  question: AssessmentQuestion;
  selectedOption: string;
  onSelect: (opt: string) => void;
  isTimeQuestion: boolean;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-base font-bold text-white mb-2">{question.text}</h4>
        {isTimeQuestion && (
          <p className="text-[11px] text-slate-400 mb-3">
            Select the duration that best describes how long you have been experiencing this pain.
          </p>
        )}
        {!isTimeQuestion && question.is_fixed && question.id.startsWith('11111111') && (
          <p className="text-[11px] text-slate-400 mb-3">
            Rate your pain on a scale of 1 to 10, where 1 is mild discomfort and 10 is the worst pain imaginable.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {question.options.map((opt: string) => {
          const isSelected = selectedOption === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(opt)}
              className={`px-4 py-3 rounded-2xl text-xs font-medium border transition-all text-left ${
                isSelected
                  ? isTimeQuestion
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {selectedOption && question.id.startsWith('11111111') && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Selected Pain Level:</div>
          <span className="text-sm font-bold text-white">{selectedOption}</span>
        </div>
      )}
    </div>
  );
}
