-- =========================================================
-- SUPABASE DATABASE SCHEMA FOR VISUALLY BODY PAIN TRACKER
-- =========================================================

-- 1. Create Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    age INT NOT NULL CHECK (age >= 0 AND age <= 120),
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Pain Assessments Table
CREATE TABLE IF NOT EXISTS public.pain_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    overall_severity TEXT DEFAULT 'Moderate',
    status TEXT DEFAULT 'Submitted' CHECK (status IN ('Draft', 'Submitted', 'Reviewed', 'Archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Pain Entries Table (Individual body part pain items)
CREATE TABLE IF NOT EXISTS public.pain_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES public.pain_assessments(id) ON DELETE CASCADE NOT NULL,
    body_part_id TEXT NOT NULL,
    body_part_name TEXT NOT NULL,
    view TEXT NOT NULL CHECK (view IN ('anterior', 'posterior')),
    pain_level INT NOT NULL CHECK (pain_level >= 1 AND pain_level <= 10),
    duration TEXT NOT NULL,
    symptom_type TEXT DEFAULT 'Aching',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON public.patients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pain_assessments_patient ON public.pain_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_pain_entries_assessment ON public.pain_entries(assessment_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pain_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pain_entries ENABLE ROW LEVEL SECURITY;

-- Create Policies (Allow public insertions for patient submission, and reading for admin dashboard)
CREATE POLICY "Allow public read access to patients" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to patients" ON public.patients FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to pain_assessments" ON public.pain_assessments FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to pain_assessments" ON public.pain_assessments FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to pain_entries" ON public.pain_entries FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to pain_entries" ON public.pain_entries FOR INSERT WITH CHECK (true);

-- 4. Create Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admins_user_id ON public.admins(user_id);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access to admins" ON public.admins FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow authenticated admin read access to admins" ON public.admins FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- =========================================================
-- SEED DATA (FOR TESTING ADMIN DASHBOARD)
-- =========================================================

INSERT INTO public.patients (id, name, age, gender, notes) VALUES
('a1b2c3d4-e5f6-47a8-b901-111111111111', 'Eleanor Vance', 34, 'Female', 'Frequent desk work, posture issues'),
('a1b2c3d4-e5f6-47a8-b901-222222222222', 'Marcus Chen', 45, 'Male', 'Post-workout joint stiffness'),
('a1b2c3d4-e5f6-47a8-b901-333333333333', 'Sam Taylor', 28, 'Non-binary', 'Recent runner injury');

INSERT INTO public.pain_assessments (id, patient_id, overall_severity, status) VALUES
('b1c2d3e4-f5a6-47b8-c902-111111111111', 'a1b2c3d4-e5f6-47a8-b901-111111111111', 'Severe', 'Submitted'),
('b1c2d3e4-f5a6-47b8-c902-222222222222', 'a1b2c3d4-e5f6-47a8-b901-222222222222', 'Moderate', 'Submitted'),
('b1c2d3e4-f5a6-47b8-c902-333333333333', 'a1b2c3d4-e5f6-47a8-b901-333333333333', 'Mild', 'Reviewed');

INSERT INTO public.pain_entries (assessment_id, body_part_id, body_part_name, view, pain_level, duration, symptom_type, notes) VALUES
('b1c2d3e4-f5a6-47b8-c902-111111111111', 'lower-back', 'Lower Back', 'posterior', 8, '1-6 months', 'Throbbing', 'Radiating down left side when seated'),
('b1c2d3e4-f5a6-47b8-c902-111111111111', 'neck', 'Neck', 'posterior', 6, '1-2 weeks', 'Stiffness', 'Tension headache accompanied'),
('b1c2d3e4-f5a6-47b8-c902-222222222222', 'knee-right', 'Right Knee', 'anterior', 7, '1-3 days', 'Sharp', 'Pain upon bending after marathon training'),
('b1c2d3e4-f5a6-47b8-c902-222222222222', 'shoulder-right', 'Right Shoulder', 'anterior', 4, '< 24 hours', 'Aching', 'Mild discomfort'),
('b1c2d3e4-f5a6-47b8-c902-333333333333', 'ankle-left', 'Left Ankle', 'anterior', 3, '1-2 weeks', 'Dull', 'Slight sprain');
