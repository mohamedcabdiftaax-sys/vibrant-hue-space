
-- 1) Roles enum + user_roles
CREATE TYPE public.app_role AS ENUM ('maamule', 'macalin', 'maaliyadda');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "roles readable by signed-in" ON public.user_roles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "maamule manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'maamule'))
  WITH CHECK (public.has_role(auth.uid(), 'maamule'));

-- 2) Staff table
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'macalin',
  department TEXT,
  contact TEXT,
  email TEXT,
  hire_date DATE,
  photo_url TEXT,
  salary NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff TO authenticated;
GRANT ALL ON public.staff TO service_role;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER staff_updated BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "staff viewable by signed-in" ON public.staff
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "maamule manage staff" ON public.staff
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'maamule'))
  WITH CHECK (public.has_role(auth.uid(), 'maamule'));

-- 3) classrooms link to teacher
ALTER TABLE public.classrooms ADD COLUMN class_teacher_id UUID REFERENCES public.staff(id) ON DELETE SET NULL;

-- 4) incidents extensions
ALTER TABLE public.incidents
  ADD COLUMN severity TEXT DEFAULT 'fudud',
  ADD COLUMN reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN classroom_id UUID REFERENCES public.classrooms(id) ON DELETE SET NULL;

-- 5) calendar_events extensions for todos + appointments
ALTER TABLE public.calendar_events
  ADD COLUMN item_kind TEXT NOT NULL DEFAULT 'event',
  ADD COLUMN completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN assigned_to UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  ADD COLUMN start_time TEXT,
  ADD COLUMN location TEXT,
  ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 6) Lock down existing public tables to authenticated only (remove anon access if any)
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['students','classrooms','class_schedules','bus_routes','exam_scores','incidents','tuition_payments','expenses','calendar_events','deleted_items','farbar_records','quran_records']) LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    -- drop overly-permissive policies if any exist that allow public
    EXECUTE format('DROP POLICY IF EXISTS "Allow all" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "public read" ON public.%I', t);
  END LOOP;
END$$;

-- Ensure baseline authenticated-only policies exist on each (idempotent best-effort)
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['students','classrooms','class_schedules','bus_routes','exam_scores','tuition_payments','expenses','deleted_items','farbar_records','quran_records']) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "authenticated all" ON public.%I', t);
    EXECUTE format('CREATE POLICY "authenticated all" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
  END LOOP;
END$$;

-- Incidents: role-aware
DROP POLICY IF EXISTS "authenticated all" ON public.incidents;
CREATE POLICY "incidents view" ON public.incidents
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "incidents insert by maamule/macalin" ON public.incidents
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'maamule') OR public.has_role(auth.uid(), 'macalin')
  );
CREATE POLICY "incidents update by maamule" ON public.incidents
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'maamule'))
  WITH CHECK (public.has_role(auth.uid(), 'maamule'));
CREATE POLICY "incidents delete by maamule" ON public.incidents
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'maamule'));

-- Calendar: maaliyadda read-only
DROP POLICY IF EXISTS "authenticated all" ON public.calendar_events;
CREATE POLICY "cal view" ON public.calendar_events
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "cal write maamule/macalin" ON public.calendar_events
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'maamule') OR public.has_role(auth.uid(), 'macalin')
  );
CREATE POLICY "cal update maamule/macalin" ON public.calendar_events
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'maamule') OR public.has_role(auth.uid(), 'macalin')
  ) WITH CHECK (
    public.has_role(auth.uid(), 'maamule') OR public.has_role(auth.uid(), 'macalin')
  );
CREATE POLICY "cal delete maamule" ON public.calendar_events
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'maamule'));
