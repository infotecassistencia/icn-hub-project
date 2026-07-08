
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;

CREATE POLICY "Anyone can submit non-empty contact messages"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(trim(nome)) BETWEEN 1 AND 120
    AND char_length(trim(email)) BETWEEN 3 AND 254
    AND char_length(trim(assunto)) BETWEEN 1 AND 200
    AND char_length(trim(mensagem)) BETWEEN 1 AND 5000
    AND status = 'novo'
  );
