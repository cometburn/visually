import { supabase, isSupabaseConfigured } from './supabase';
import { AssessmentSubmissionPayload, PainAssessment, Patient, PainEntry, AssessmentQuestion } from '@/types/database';
import { getLocalQuestions, saveLocalQuestions } from './questions';

const LOCAL_STORAGE_KEY = 'visually_pain_assessments';

// Seed demo data for initial load if local storage is empty
const INITIAL_DEMO_ASSESSMENTS: PainAssessment[] = [
  {
    id: 'demo-assess-1',
    patient_id: 'demo-pat-1',
    overall_severity: 'Severe',
    status: 'Submitted',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    patient: {
      id: 'demo-pat-1',
      name: 'Eleanor Vance',
      age: 34,
      gender: 'Female',
      notes: 'Frequent desk work, posture issues',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    entries: [
      {
        id: 'entry-101',
        body_part_id: 'lower-back',
        body_part_name: 'Lower Back',
        view: 'posterior',
        pain_level: 8,
        duration: '1-6 months',
        symptom_type: 'Throbbing',
        notes: 'Radiating down left hip when sitting long hours',
      },
      {
        id: 'entry-102',
        body_part_id: 'neck',
        body_part_name: 'Neck',
        view: 'posterior',
        pain_level: 6,
        duration: '1-2 weeks',
        symptom_type: 'Stiffness',
        notes: 'Upper trapezius tight',
      },
    ],
  },
  {
    id: 'demo-assess-2',
    patient_id: 'demo-pat-2',
    overall_severity: 'Moderate',
    status: 'Submitted',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    patient: {
      id: 'demo-pat-2',
      name: 'Marcus Chen',
      age: 45,
      gender: 'Male',
      notes: 'Post-workout joint stiffness',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    entries: [
      {
        id: 'entry-201',
        body_part_id: 'knee-right',
        body_part_name: 'Right Knee',
        view: 'anterior',
        pain_level: 7,
        duration: '1-3 days',
        symptom_type: 'Sharp',
        notes: 'Pain upon deep flexion',
      },
      {
        id: 'entry-202',
        body_part_id: 'shoulder-right',
        body_part_name: 'Right Shoulder',
        view: 'anterior',
        pain_level: 4,
        duration: '< 24 hours',
        symptom_type: 'Aching',
        notes: 'Slight overhead discomfort',
      },
    ],
  },
  {
    id: 'demo-assess-3',
    patient_id: 'demo-pat-3',
    overall_severity: 'Mild',
    status: 'Reviewed',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    patient: {
      id: 'demo-pat-3',
      name: 'Sam Taylor',
      age: 28,
      gender: 'Non-binary',
      notes: 'Recent runner injury',
      created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    },
    entries: [
      {
        id: 'entry-301',
        body_part_id: 'ankle-left',
        body_part_name: 'Left Ankle',
        view: 'anterior',
        pain_level: 3,
        duration: '1-2 weeks',
        symptom_type: 'Dull',
        notes: 'Mild sprain during trail run',
      },
    ],
  },
];

// Helper to get local data safely
function getLocalStorageAssessments(): PainAssessment[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_ASSESSMENTS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ASSESSMENTS));
      return INITIAL_DEMO_ASSESSMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_ASSESSMENTS;
  }
}

function saveLocalStorageAssessments(assessments: PainAssessment[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(assessments));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
}

// Calculate overall severity based on max pain level
export function calculateOverallSeverity(entries: PainEntry[]): 'Mild' | 'Moderate' | 'Severe' | 'Critical' {
  if (entries.length === 0) return 'Mild';
  const maxPain = Math.max(...entries.map((e) => e.pain_level));
  if (maxPain >= 9) return 'Critical';
  if (maxPain >= 7) return 'Severe';
  if (maxPain >= 4) return 'Moderate';
  return 'Mild';
}

/**
 * Submit a full assessment payload (patient info + body pain entries)
 */
export async function savePainAssessment(payload: AssessmentSubmissionPayload): Promise<{
  success: boolean;
  assessmentId: string;
  source: 'supabase' | 'local';
  error?: string;
}> {
  const overallSeverity = calculateOverallSeverity(payload.entries);

  // 1. Try Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      // Insert Patient
      const { data: patientData, error: patientErr } = await supabase
        .from('patients')
        .insert({
          name: payload.patient.name,
          age: payload.patient.age,
          gender: payload.patient.gender,
          notes: payload.patient.notes || null,
        })
        .select()
        .single();

      if (patientErr) throw patientErr;

      // Insert Assessment
      const { data: assessData, error: assessErr } = await supabase
        .from('pain_assessments')
        .insert({
          patient_id: patientData.id,
          overall_severity: overallSeverity,
          status: 'Submitted',
        })
        .select()
        .single();

      if (assessErr) throw assessErr;

      // Insert Pain Entries
      const entryIds: string[] = [];
      if (payload.entries.length > 0) {
        const entriesToInsert = payload.entries.map((entry) => ({
          assessment_id: assessData.id,
          body_part_id: entry.body_part_id,
          body_part_name: entry.body_part_name,
          view: entry.view,
          pain_level: entry.pain_level,
          duration: entry.duration,
          symptom_type: entry.symptom_type || 'Aching',
          notes: entry.notes || null,
        }));

        const { data: insertedEntries, error: entriesErr } = await supabase
          .from('pain_entries')
          .insert(entriesToInsert)
          .select('id');

        if (entriesErr) throw entriesErr;
        if (insertedEntries) {
          for (const ent of insertedEntries) {
            entryIds.push(ent.id);
          }
        }
      }

      // Insert Answers
      if (entryIds.length > 0) {
        const answersToInsert: Array<{ entry_id: string; question_id: string; selected_option: string }> = [];
        for (let i = 0; i < payload.entries.length; i++) {
          const entry = payload.entries[i];
          const entryId = entryIds[i];
          if (entry.answers && entryId) {
            for (const ans of entry.answers) {
              answersToInsert.push({
                entry_id: entryId,
                question_id: ans.question_id,
                selected_option: ans.selected_option,
              });
            }
          }
        }

        if (answersToInsert.length > 0) {
          const { error: answersErr } = await supabase.from('pain_entry_answers').insert(answersToInsert);
          if (answersErr) throw answersErr;
        }
      }

      return {
        success: true,
        assessmentId: assessData.id,
        source: 'supabase',
      };
    } catch (err) {
      console.warn('Supabase insert error, falling back to local database store:', err);
    }
  }

  // 2. Fallback to LocalStorage Store
  const newPatientId = 'pat-' + Date.now();
  const newAssessmentId = 'assess-' + Date.now();
  const nowStr = new Date().toISOString();

  const newPatient: Patient = {
    id: newPatientId,
    name: payload.patient.name,
    age: payload.patient.age,
    gender: payload.patient.gender,
    notes: payload.patient.notes,
    created_at: nowStr,
  };

  const newEntries: PainEntry[] = payload.entries.map((entry, idx) => ({
    ...entry,
    id: `entry-${Date.now()}-${idx}`,
    assessment_id: newAssessmentId,
    created_at: nowStr,
  }));

  const newAssessment: PainAssessment = {
    id: newAssessmentId,
    patient_id: newPatientId,
    overall_severity: overallSeverity,
    status: 'Submitted',
    created_at: nowStr,
    patient: newPatient,
    entries: newEntries,
  };

  const current = getLocalStorageAssessments();
  const updated = [newAssessment, ...current];
  saveLocalStorageAssessments(updated);

  return {
    success: true,
    assessmentId: newAssessmentId,
    source: 'local',
  };
}

/**
 * Get all assessments for Admin Dashboard
 */
export async function getAllAssessments(): Promise<{
  data: PainAssessment[];
  source: 'supabase' | 'local';
}> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: assessments, error: assessErr } = await supabase
        .from('pain_assessments')
        .select(`
          id,
          patient_id,
          overall_severity,
          status,
          created_at,
          patient:patients(*),
          entries:pain_entries(*, answers:pain_entry_answers(*, question:assessment_questions(*)))
        `)
        .order('created_at', { ascending: false });

      if (!assessErr && assessments) {
        const processed = assessments.map((a) => {
          const entries = (a.entries || []).map((e) => ({
            ...e,
            answers: (e.answers || []).map((ans: { question_id: string; selected_option: string; question?: { text?: string } }) => ({
              question_id: ans.question_id,
              selected_option: ans.selected_option,
              question_text: ans.question?.text,
            })),
          }));
          return {
            id: a.id,
            patient_id: a.patient_id,
            overall_severity: a.overall_severity,
            status: a.status,
            created_at: a.created_at,
            patient: a.patient,
            entries,
          };
        });
        return {
          data: processed as unknown as PainAssessment[],
          source: 'supabase',
        };
      }
    } catch (err) {
      console.warn('Error fetching from Supabase, loading local database records:', err);
    }
  }

  return {
    data: getLocalStorageAssessments().map((assessment) => ({
      ...assessment,
      entries: assessment.entries?.map((entry) => ({
        ...entry,
        answers: entry.answers?.map((ans) => {
          const questions = getLocalQuestions();
          const q = questions.find((q) => q.id === ans.question_id);
          return {
            ...ans,
            question_text: q?.text,
          };
        }),
      })),
    })),
    source: 'local',
  };
}

/**
 * Delete assessment record (admin action)
 */
export async function deleteAssessmentRecord(assessmentId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('pain_assessments').delete().eq('id', assessmentId);
      if (!error) return true;
    } catch (err) {
      console.error('Failed to delete from Supabase', err);
    }
  }

  const current = getLocalStorageAssessments();
  const filtered = current.filter((item) => item.id !== assessmentId);
  saveLocalStorageAssessments(filtered);
  return true;
}

/**
 * Get all active assessment questions sorted by sort_order
 */
export async function getAssessmentQuestions(): Promise<{
  data: AssessmentQuestion[];
  source: 'supabase' | 'local';
}> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: questions, error } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && questions) {
        return {
          data: questions as unknown as AssessmentQuestion[],
          source: 'supabase',
        };
      }
    } catch (err) {
      console.warn('Error fetching questions from Supabase:', err);
    }
  }

  const local = getLocalQuestions().filter((q) => q.is_active).sort((a, b) => a.sort_order - b.sort_order);
  return {
    data: local,
    source: 'local',
  };
}

/**
 * Admin: Update assessment questions (replaces all active questions)
 */
export async function updateAssessmentQuestions(questions: AssessmentQuestion[]): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const fixedQuestions = questions.filter((q) => q.is_fixed);
      const customQuestions = questions.filter((q) => !q.is_fixed);

      if (customQuestions.length > 0) {
        const { error: delErr } = await supabase
          .from('assessment_questions')
          .delete()
          .eq('is_fixed', false);

        if (delErr) throw delErr;

        const { error: insErr } = await supabase.from('assessment_questions').insert(
          customQuestions.map((q) => ({
            id: q.id,
            text: q.text,
            question_type: q.question_type,
            options: q.options,
            video_url: q.video_url || null,
            sort_order: q.sort_order,
            is_active: q.is_active,
            is_fixed: q.is_fixed,
          }))
        );

        if (insErr) throw insErr;
      }

      const { error: updErr } = await supabase
        .from('assessment_questions')
        .upsert(
          fixedQuestions.map((q) => ({
            id: q.id,
            text: q.text,
            question_type: q.question_type,
            options: q.options,
            video_url: q.video_url || null,
            sort_order: q.sort_order,
            is_active: q.is_active,
            is_fixed: q.is_fixed,
          })),
          { onConflict: 'id' }
        );

      if (updErr) throw updErr;
      return { success: true };
    } catch (err) {
      console.warn('Supabase questions update error:', err);
      return { success: false, error: (err as Error).message };
    }
  }

  saveLocalQuestions(questions);
  return { success: true };
}

/**
 * Admin: Toggle question active status
 */
export async function toggleQuestionActive(questionId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('assessment_questions')
        .update({ is_active: isActive })
        .eq('id', questionId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  const questions = getLocalQuestions();
  const updated = questions.map((q) => (q.id === questionId ? { ...q, is_active: isActive } : q));
  saveLocalQuestions(updated);
  return { success: true };
}

/**
 * Admin: Delete custom question
 */
export async function deleteCustomQuestion(questionId: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('assessment_questions')
        .delete()
        .eq('id', questionId)
        .eq('is_fixed', false);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  const questions = getLocalQuestions().filter((q) => q.id !== questionId && !q.is_fixed);
  saveLocalQuestions(questions);
  return { success: true };
}

