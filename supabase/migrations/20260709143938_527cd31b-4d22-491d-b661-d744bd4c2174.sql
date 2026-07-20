
CREATE TABLE public.mentores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  nome text NOT NULL,
  foto_url text,
  crn text,
  especialidade text,
  bio text,
  curriculo text,
  formacao text,
  areas_atuacao text[] NOT NULL DEFAULT '{}',
  cidade text,
  estado text,
  instagram text,
  linkedin text,
  site text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.mentores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentores TO authenticated;
GRANT ALL ON public.mentores TO service_role;

ALTER TABLE public.mentores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mentores"
  ON public.mentores FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert mentores"
  ON public.mentores FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins or owner can update mentores"
  ON public.mentores FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id)
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

CREATE POLICY "Admins can delete mentores"
  ON public.mentores FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_mentores_updated_at
  BEFORE UPDATE ON public.mentores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
