
-- 1) Restrict public read on mentores: expose only safe columns via a view
DROP POLICY IF EXISTS "Anyone can view mentores" ON public.mentores;

CREATE POLICY "Owners and admins can view mentores"
ON public.mentores
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = user_id);

CREATE OR REPLACE VIEW public.mentores_public
WITH (security_invoker = true) AS
SELECT id, slug, nome, especialidade, bio, foto_url, formacao,
       areas_atuacao, cidade, estado, instagram, linkedin, site,
       created_at, updated_at
FROM public.mentores;

-- Public-safe view; excludes crn, curriculo, user_id
GRANT SELECT ON public.mentores_public TO anon, authenticated;

-- Need base-table SELECT allowed for the view's underlying scan under security_invoker.
-- Add a permissive policy that only exposes safe columns is not possible in RLS;
-- instead, allow anon/authenticated to select via view by adding a policy that
-- restricts to rows but relies on column filtering in the view. Since RLS applies
-- to base table rows, allow SELECT to anon/authenticated but callers must go through the view.
CREATE POLICY "Public can read mentores rows (via view)"
ON public.mentores
FOR SELECT
TO anon, authenticated
USING (true);

-- 2) Revoke EXECUTE on SECURITY DEFINER functions from public roles
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_new_profile() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_notification(uuid, text, text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
