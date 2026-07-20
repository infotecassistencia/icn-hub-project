-- Padroniza CPF removendo pontos, hífen e demais caracteres
CREATE OR REPLACE FUNCTION public.normalize_cpf(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
STRICT
SET search_path = ''
AS $$
  SELECT regexp_replace(value, '[^0-9]', '', 'g');
$$;

-- Antes de criar a restrição, verifica se já existem CPFs repetidos
DO $$
BEGIN
  IF EXISTS (
    SELECT public.normalize_cpf(cpf)
    FROM public.profiles
    WHERE cpf IS NOT NULL
      AND public.normalize_cpf(cpf) <> ''
    GROUP BY public.normalize_cpf(cpf)
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Existem CPFs duplicados em profiles. Corrija-os antes de aplicar a restrição.';
  END IF;
END;
$$;

-- Impede CPFs iguais, inclusive quando um está formatado e outro não
CREATE UNIQUE INDEX IF NOT EXISTS profiles_cpf_normalized_unique
ON public.profiles (public.normalize_cpf(cpf))
WHERE cpf IS NOT NULL
  AND public.normalize_cpf(cpf) <> '';

-- Função limitada para a tela de cadastro consultar a existência do CPF
CREATE OR REPLACE FUNCTION public.cpf_already_registered(input_cpf text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE public.normalize_cpf(cpf) =
          public.normalize_cpf(input_cpf)
  );
$$;

REVOKE ALL ON FUNCTION public.cpf_already_registered(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cpf_already_registered(text)
TO anon, authenticated;