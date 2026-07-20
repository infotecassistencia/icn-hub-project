
DROP POLICY IF EXISTS "Public can read mentores rows (via view)" ON public.mentores;

-- Recreate view as SECURITY DEFINER (default) so it can read base table regardless of caller RLS
DROP VIEW IF EXISTS public.mentores_public;
CREATE VIEW public.mentores_public
WITH (security_invoker = false) AS
SELECT id, slug, nome, especialidade, bio, foto_url, formacao,
       areas_atuacao, cidade, estado, instagram, linkedin, site,
       created_at, updated_at
FROM public.mentores;

GRANT SELECT ON public.mentores_public TO anon, authenticated;

-- Revoke direct table SELECT from anon/authenticated (owner/admin policy remains for auth role via RLS + default grants)
REVOKE SELECT ON public.mentores FROM anon;
