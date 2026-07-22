import { supabase } from "@/integrations/supabase/client";

export type TipoNotificacao =
  | "informacao"
  | "sucesso"
  | "aviso"
  | "erro";

interface CriarNotificacaoParams {
  usuarioId: string;
  titulo: string;
  mensagem: string;
  tipo?: TipoNotificacao;
  link?: string | null;
}

export async function criarNotificacao({
  usuarioId,
  titulo,
  mensagem,
  tipo = "informacao",
  link = null,
}: CriarNotificacaoParams): Promise<void> {
  const { error } = await supabase
    .from("notificacoes")
    .insert({
      usuario_id: usuarioId,
      titulo,
      mensagem,
      tipo,
      link,
      lida: false,
    });

  if (error) {
    throw error;
  }
}

export async function marcarNotificacaoComoLida(
  notificacaoId: string,
): Promise<void> {
  const { error } = await supabase
    .from("notificacoes")
    .update({
      lida: true,
    })
    .eq("id", notificacaoId);

  if (error) {
    throw error;
  }
}

export async function marcarTodasNotificacoesComoLidas(
  usuarioId: string,
): Promise<void> {
  const { error } = await supabase
    .from("notificacoes")
    .update({
      lida: true,
    })
    .eq("usuario_id", usuarioId)
    .eq("lida", false);

  if (error) {
    throw error;
  }
}