import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  Bell,
  CalendarCheck,
  CheckCircle2,
  GraduationCap,
  Mail,
  MessageSquare,
  UserPlus,
  XCircle,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth-context";

export type NotificationTipo =
  | "cadastro"
  | "inscricao_evento"
  | "inscricao_mentoria"
  | "evento_aprovado"
  | "evento_rejeitado"
  | "ajustes_solicitados"
  | "mentoria_aprovada"
  | "mentoria_rejeitada"
  | "mensagem_admin"
  | string;

export interface AppNotification {
  id: string;
  user_id: string;
  tipo: NotificationTipo;
  titulo: string;
  mensagem: string;
  url_destino: string | null;
  lida: boolean;
  created_at: string;
}

const NOTIF_KEY = ["notifications"] as const;

export function useNotifications() {
  const { userId, isAuthenticated } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [...NOTIF_KEY, userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as AppNotification[];
    },
  });

  // Realtime subscription for live updates.
  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => qc.invalidateQueries({ queryKey: NOTIF_KEY }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, userId, qc]);

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ lida: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTIF_KEY }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const { error } = await supabase
        .from("notifications")
        .update({ lida: true })
        .eq("user_id", userId)
        .eq("lida", false);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTIF_KEY }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTIF_KEY }),
  });

  const items = query.data ?? [];
  const unreadCount = items.filter((n) => !n.lida).length;

  return { items, unreadCount, isLoading: query.isLoading, markRead, markAllRead, remove };
}

const ICONS: Record<string, LucideIcon> = {
  cadastro: UserPlus,
  inscricao_evento: CalendarCheck,
  inscricao_mentoria: GraduationCap,
  evento_aprovado: CheckCircle2,
  evento_rejeitado: XCircle,
  ajustes_solicitados: AlertTriangle,
  mentoria_aprovada: CheckCircle2,
  mentoria_rejeitada: XCircle,
  mensagem_admin: Mail,
  mensagem: MessageSquare,
};

export function iconForTipo(tipo: string): LucideIcon {
  return ICONS[tipo] ?? Bell;
}

export function colorForTipo(tipo: string): string {
  if (tipo.includes("rejeit")) return "text-destructive bg-destructive/10";
  if (tipo.includes("aprovad")) return "text-emerald-600 bg-emerald-500/10";
  if (tipo.includes("ajustes")) return "text-amber-600 bg-amber-500/10";
  if (tipo.includes("inscricao")) return "text-blue-600 bg-blue-500/10";
  if (tipo === "cadastro") return "text-primary bg-primary/10";
  return "text-muted-foreground bg-muted";
}
