import { AssessmentQuestion } from '@/types/database';

const QUESTIONS_STORAGE_KEY = 'visually_assessment_questions';

const FIXED_QUESTIONS: AssessmentQuestion[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    text: 'Pain Tolerance',
    question_type: 'multiple_choice',
    options: ['1 (Mild)', '2', '3', '4 (Moderate)', '5', '6', '7 (Severe)', '8', '9', '10 (Worst)'],
    video_url: '',
    sort_order: 1,
    is_active: true,
    is_fixed: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    text: 'How long have you experienced this pain?',
    question_type: 'multiple_choice',
    options: ['< 24 hours', '1-3 days', '1-2 weeks', '1-6 months', 'Chronic (> 6 months)'],
    video_url: '',
    sort_order: 2,
    is_active: true,
    is_fixed: true,
    created_at: new Date().toISOString(),
  },
];

export function getLocalQuestions(): AssessmentQuestion[] {
  if (typeof window === 'undefined') return [...FIXED_QUESTIONS];
  try {
    const raw = localStorage.getItem(QUESTIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(FIXED_QUESTIONS));
      return [...FIXED_QUESTIONS];
    }
    return JSON.parse(raw);
  } catch {
    return [...FIXED_QUESTIONS];
  }
}

export function saveLocalQuestions(questions: AssessmentQuestion[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(questions));
  } catch (e) {
    console.error('Failed to save questions', e);
  }
}

export function resetLocalQuestions() {
  saveLocalQuestions(FIXED_QUESTIONS);
}
