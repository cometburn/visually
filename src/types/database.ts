export type Gender = 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say' | 'Other';

export type BodyPartView = 'anterior' | 'posterior';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  notes?: string;
  created_at: string;
}

export interface PainEntry {
  id?: string;
  assessment_id?: string;
  body_part_id: string;
  body_part_name: string;
  view: BodyPartView;
  pain_level: number; // 1 - 10
  duration: string;   // e.g., '< 24 hours', '1-3 days', '1-2 weeks', '1-6 months', 'Chronic (> 6 months)'
  symptom_type?: string; // Sharp, Throbbing, Aching, Burning, etc.
  notes?: string;
  created_at?: string;
  answers?: QuestionAnswer[];
}

export interface QuestionAnswer {
  question_id: string;
  selected_option: string;
  question_text?: string;
}

export interface PainAssessment {
  id: string;
  patient_id: string;
  overall_severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  status: 'Draft' | 'Submitted' | 'Reviewed' | 'Archived';
  created_at: string;
  patient?: Patient;
  entries?: PainEntry[];
}

export interface AssessmentSubmissionPayload {
  patient: {
    name: string;
    age: number;
    gender: Gender;
    notes?: string;
  };
  entries: PainEntry[];
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  question_type: 'multiple_choice';
  options: string[];
  video_url?: string;
  sort_order: number;
  is_active: boolean;
  is_fixed: boolean;
  created_at: string;
}
