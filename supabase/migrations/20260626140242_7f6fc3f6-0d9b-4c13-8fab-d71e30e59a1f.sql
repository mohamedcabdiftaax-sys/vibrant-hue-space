
-- Helper for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- STUDENTS
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  dob DATE,
  gender TEXT,
  photo_url TEXT,
  father_name TEXT,
  mother_name TEXT,
  contact_primary TEXT,
  contact_secondary TEXT,
  home_address TEXT,
  program_xanaano BOOLEAN NOT NULL DEFAULT false,
  program_boarding BOOLEAN NOT NULL DEFAULT false,
  program_quran BOOLEAN NOT NULL DEFAULT false,
  grade_level INT,
  uses_bus BOOLEAN NOT NULL DEFAULT false,
  bus_route TEXT,
  bus_number TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO anon, authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_students_updated BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CLASSROOMS
CREATE TABLE public.classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_level INT NOT NULL UNIQUE,
  teacher_name TEXT,
  room TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classrooms TO anon, authenticated;
GRANT ALL ON public.classrooms TO service_role;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open" ON public.classrooms FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_classrooms_updated BEFORE UPDATE ON public.classrooms FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CLASS SCHEDULES
CREATE TABLE public.class_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_level INT NOT NULL,
  day_of_week INT NOT NULL,
  period INT NOT NULL,
  subject TEXT,
  teacher TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(grade_level, day_of_week, period)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_schedules TO anon, authenticated;
GRANT ALL ON public.class_schedules TO service_role;
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open" ON public.class_schedules FOR ALL USING (true) WITH CHECK (true);

-- BUS ROUTES
CREATE TABLE public.bus_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name TEXT NOT NULL,
  bus_number TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bus_routes TO anon, authenticated;
GRANT ALL ON public.bus_routes TO service_role;
ALTER TABLE public.bus_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open" ON public.bus_routes FOR ALL USING (true) WITH CHECK (true);

-- EXAM SCORES
CREATE TABLE public.exam_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  grade_level INT NOT NULL,
  subject TEXT NOT NULL,
  exam_name TEXT,
  score NUMERIC,
  max_score NUMERIC DEFAULT 100,
  exam_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_scores TO anon, authenticated;
GRANT ALL ON public.exam_scores TO service_role;
ALTER TABLE public.exam_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open" ON public.exam_scores FOR ALL USING (true) WITH CHECK (true);

-- INCIDENTS
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  incident_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  fine_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.incidents TO anon, authenticated;
GRANT ALL ON public.incidents TO service_role;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open" ON public.incidents FOR ALL USING (true) WITH CHECK (true);

-- TUITION PAYMENTS
CREATE TABLE public.tuition_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  paid BOOLEAN NOT NULL DEFAULT false,
  payment_date DATE,
  month TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tuition_payments TO anon, authenticated;
GRANT ALL ON public.tuition_payments TO service_role;
ALTER TABLE public.tuition_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open" ON public.tuition_payments FOR ALL USING (true) WITH CHECK (true);

-- EXPENSES
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO anon, authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

-- CALENDAR EVENTS
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'event',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO anon, authenticated;
GRANT ALL ON public.calendar_events TO service_role;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open" ON public.calendar_events FOR ALL USING (true) WITH CHECK (true);

-- QURAN RECORDS
CREATE TABLE public.quran_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  dars_surah TEXT,
  dars_ayah_from INT,
  dars_ayah_to INT,
  muraja_ayah_from INT,
  muraja_ayah_to INT,
  muraja_quality TEXT,
  sabaa_ayah_from INT,
  sabaa_ayah_to INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, record_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quran_records TO anon, authenticated;
GRANT ALL ON public.quran_records TO service_role;
ALTER TABLE public.quran_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open" ON public.quran_records FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_quran_updated BEFORE UPDATE ON public.quran_records FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- FARBAR RECORDS
CREATE TABLE public.farbar_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reading_lesson TEXT,
  reading_quality TEXT,
  writing_lesson TEXT,
  writing_quality TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, record_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.farbar_records TO anon, authenticated;
GRANT ALL ON public.farbar_records TO service_role;
ALTER TABLE public.farbar_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open" ON public.farbar_records FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_farbar_updated BEFORE UPDATE ON public.farbar_records FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- DELETED ITEMS (Recycle Bin)
CREATE TABLE public.deleted_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  table_name TEXT NOT NULL,
  payload JSONB NOT NULL,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_by TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deleted_items TO anon, authenticated;
GRANT ALL ON public.deleted_items TO service_role;
ALTER TABLE public.deleted_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open" ON public.deleted_items FOR ALL USING (true) WITH CHECK (true);

-- Seed grades 1..12
INSERT INTO public.classrooms (grade_level, teacher_name, room)
SELECT g, NULL, NULL FROM generate_series(1,12) g
ON CONFLICT (grade_level) DO NOTHING;
