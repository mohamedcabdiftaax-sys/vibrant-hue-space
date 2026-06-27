
CREATE OR REPLACE FUNCTION public.claim_first_maamule()
RETURNS public.app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_uid UUID := auth.uid();
  assigned public.app_role;
BEGIN
  IF current_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = current_uid) THEN
    SELECT role INTO assigned FROM public.user_roles WHERE user_id = current_uid LIMIT 1;
    RETURN assigned;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'maamule') THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (current_uid, 'maamule');
    RETURN 'maamule';
  ELSE
    INSERT INTO public.user_roles(user_id, role) VALUES (current_uid, 'macalin');
    RETURN 'macalin';
  END IF;
END$$;

GRANT EXECUTE ON FUNCTION public.claim_first_maamule() TO authenticated;
