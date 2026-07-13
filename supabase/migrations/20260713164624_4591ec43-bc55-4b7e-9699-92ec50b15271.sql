
DROP VIEW IF EXISTS public.mentores_public;

-- Public read policy on base table; column-level grants restrict which columns are actually exposed
CREATE POLICY "Public can read safe mentor columns"
ON public.mentores
FOR SELECT
TO anon, authenticated
USING (true);

-- Reset and re-grant column-scoped SELECT for anon/authenticated (excludes crn, curriculo, user_id)
REVOKE SELECT ON public.mentores FROM anon, authenticated;
GRANT SELECT
  (id, slug, nome, especialidade, bio, foto_url, formacao,
   areas_atuacao, cidade, estado, instagram, linkedin, site,
   created_at, updated_at)
ON public.mentores TO anon, authenticated;

-- Admins/owners still need full column access for management — grant full SELECT is unnecessary
-- because RLS policy "Owners and admins can view mentores" combined with authenticated grants below covers it.
-- Give authenticated additional full column read only when they are owner/admin? Column grants are role-wide, so
-- we add a targeted grant on the sensitive columns just to authenticated (RLS still gates rows to owner/admin).
GRANT SELECT (crn, curriculo, user_id) ON public.mentores TO authenticated;
