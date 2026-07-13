
-- Enum types
DO $$ BEGIN
  CREATE TYPE public.modalidade AS ENUM ('presencial','online');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.status_validacao AS ENUM ('pendente','aprovado','recusado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.area_nutricao AS ENUM ('clinica','esporte','saude-mulher','materno-infantil','oncologia','uan','social','gestao-marketing','hospitalar','outros');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.tipo_evento AS ENUM ('curso','congresso','workshop','jornada','encontro','outro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- EVENTOS
CREATE TABLE public.eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  resumo TEXT NOT NULL,
  descricao TEXT,
  local TEXT NOT NULL,
  estado TEXT NOT NULL,
  data TIMESTAMPTZ NOT NULL,
  duracao TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  ministrante TEXT NOT NULL,
  mentor_id UUID REFERENCES public.mentores(id) ON DELETE SET NULL,
  banner_url TEXT NOT NULL,
  modalidade public.modalidade NOT NULL,
  tipo public.tipo_evento NOT NULL,
  area public.area_nutricao NOT NULL,
  status public.status_validacao NOT NULL DEFAULT 'pendente',
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.eventos TO authenticated;
GRANT SELECT ON public.eventos TO anon;
GRANT ALL ON public.eventos TO service_role;

ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eventos aprovados são públicos"
  ON public.eventos FOR SELECT
  USING (status = 'aprovado' OR criado_por = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Usuários autenticados podem criar eventos"
  ON public.eventos FOR INSERT TO authenticated
  WITH CHECK (criado_por = auth.uid());

CREATE POLICY "Criador ou admin pode atualizar"
  ON public.eventos FOR UPDATE TO authenticated
  USING (criado_por = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (criado_por = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Criador ou admin pode deletar"
  ON public.eventos FOR DELETE TO authenticated
  USING (criado_por = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON public.eventos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_eventos_status ON public.eventos(status);
CREATE INDEX idx_eventos_mentor ON public.eventos(mentor_id);
CREATE INDEX idx_eventos_data ON public.eventos(data);

-- MENTORIAS
CREATE TABLE public.mentorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  resumo TEXT NOT NULL,
  descricao TEXT,
  local TEXT NOT NULL,
  estado TEXT NOT NULL,
  data TIMESTAMPTZ NOT NULL,
  duracao TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  ministrante TEXT NOT NULL,
  mentor_id UUID REFERENCES public.mentores(id) ON DELETE SET NULL,
  banner_url TEXT NOT NULL,
  modalidade public.modalidade NOT NULL,
  area public.area_nutricao NOT NULL,
  status public.status_validacao NOT NULL DEFAULT 'pendente',
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentorias TO authenticated;
GRANT SELECT ON public.mentorias TO anon;
GRANT ALL ON public.mentorias TO service_role;

ALTER TABLE public.mentorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentorias aprovadas são públicas"
  ON public.mentorias FOR SELECT
  USING (status = 'aprovado' OR criado_por = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Usuários autenticados podem criar mentorias"
  ON public.mentorias FOR INSERT TO authenticated
  WITH CHECK (criado_por = auth.uid());

CREATE POLICY "Criador ou admin pode atualizar mentorias"
  ON public.mentorias FOR UPDATE TO authenticated
  USING (criado_por = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (criado_por = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Criador ou admin pode deletar mentorias"
  ON public.mentorias FOR DELETE TO authenticated
  USING (criado_por = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_mentorias_updated_at BEFORE UPDATE ON public.mentorias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_mentorias_status ON public.mentorias(status);
CREATE INDEX idx_mentorias_mentor ON public.mentorias(mentor_id);
CREATE INDEX idx_mentorias_data ON public.mentorias(data);

-- STORAGE POLICIES (avatars, event-banners, mentoria-banners)
-- Leitura pública
CREATE POLICY "Leitura pública de avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Leitura pública de event-banners"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-banners');

CREATE POLICY "Leitura pública de mentoria-banners"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'mentoria-banners');

-- Upload: usuário autenticado envia para pasta com seu user_id
CREATE POLICY "Usuário autenticado pode enviar avatars"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuário autenticado pode atualizar seus avatars"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuário autenticado pode deletar seus avatars"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuário autenticado pode enviar event-banners"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'event-banners' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuário autenticado pode atualizar seus event-banners"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'event-banners' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuário autenticado pode deletar seus event-banners"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'event-banners' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuário autenticado pode enviar mentoria-banners"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'mentoria-banners' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuário autenticado pode atualizar seus mentoria-banners"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'mentoria-banners' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuário autenticado pode deletar seus mentoria-banners"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'mentoria-banners' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Trigger: notificar admins sobre eventos/mentorias pendentes
CREATE OR REPLACE FUNCTION public.notify_admins_new_pending()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_id UUID;
  tipo_item TEXT;
  url_destino TEXT;
BEGIN
  IF TG_TABLE_NAME = 'eventos' THEN
    tipo_item := 'evento';
    url_destino := '/admin/eventos';
  ELSE
    tipo_item := 'mentoria';
    url_destino := '/admin/mentorias';
  END IF;

  FOR admin_id IN SELECT user_id FROM public.user_roles WHERE role = 'admin' LOOP
    PERFORM public.create_notification(
      admin_id,
      'aprovacao_pendente',
      'Novo ' || tipo_item || ' aguardando aprovação',
      NEW.nome || ' foi submetido para revisão.',
      url_destino
    );
  END LOOP;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.notify_admins_new_pending() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER notify_admins_new_evento
  AFTER INSERT ON public.eventos
  FOR EACH ROW WHEN (NEW.status = 'pendente')
  EXECUTE FUNCTION public.notify_admins_new_pending();

CREATE TRIGGER notify_admins_new_mentoria
  AFTER INSERT ON public.mentorias
  FOR EACH ROW WHEN (NEW.status = 'pendente')
  EXECUTE FUNCTION public.notify_admins_new_pending();

-- Trigger: notificar criador sobre mudança de status
CREATE OR REPLACE FUNCTION public.notify_criador_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tipo_item TEXT;
  url_destino TEXT;
  titulo TEXT;
  mensagem TEXT;
  tipo_notif TEXT;
BEGIN
  IF NEW.criado_por IS NULL OR OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'eventos' THEN
    tipo_item := 'Evento';
    url_destino := '/eventos/' || NEW.id::text;
  ELSE
    tipo_item := 'Mentoria';
    url_destino := '/mentorias/' || NEW.id::text;
  END IF;

  IF NEW.status = 'aprovado' THEN
    tipo_notif := lower(tipo_item) || '_aprovado';
    titulo := tipo_item || ' aprovado';
    mensagem := NEW.nome || ' foi aprovado e está publicado.';
  ELSIF NEW.status = 'recusado' THEN
    tipo_notif := lower(tipo_item) || '_rejeitado';
    titulo := tipo_item || ' recusado';
    mensagem := NEW.nome || ' não foi aprovado.';
  ELSE
    RETURN NEW;
  END IF;

  PERFORM public.create_notification(NEW.criado_por, tipo_notif, titulo, mensagem, url_destino);
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.notify_criador_status_change() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER notify_criador_evento_status
  AFTER UPDATE ON public.eventos
  FOR EACH ROW EXECUTE FUNCTION public.notify_criador_status_change();

CREATE TRIGGER notify_criador_mentoria_status
  AFTER UPDATE ON public.mentorias
  FOR EACH ROW EXECUTE FUNCTION public.notify_criador_status_change();
