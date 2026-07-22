import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarCheck,
  CheckCircle2,
  GraduationCap,
  Mail,
  MessageSquare,
  UserPlus,
  XCircle,
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

function notificationsQueryKey(userId: string | null) {
  return [...NOTIF_KEY, userId] as const;
}

export function useNotifications() {
  const { userId, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = notificationsQueryKey(userId);

  const query = useQuery({
    queryKey,
    enabled: Boolean(userId),

    queryFn: async (): Promise<AppNotification[]> => {
      if (!userId) {
        return [];
      }

      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
            id,
            user_id,
            tipo,
            titulo,
            mensagem,
            url_destino,
            lida,
            created_at
          `,
        )
        .eq("user_id", userId)
        .order("created_at", {
          ascending: false,
        })
        .limit(50);

      if (error) {
        throw error;
      }

      return (data ?? []) as AppNotification[];
    },
  });

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      return;
    }

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: notificationsQueryKey(userId),
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isAuthenticated, userId, queryClient]);

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) {
        throw new Error("Usuário não autenticado.");
      }

      const { data, error } = await supabase
        .from("notifications")
        .update({
          lida: true,
        })
        .eq("id", id)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "A notificação não foi atualizada. Verifique as políticas RLS.",
        );
      }

      return id;
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey,
      });

      const previousItems =
        queryClient.getQueryData<AppNotification[]>(queryKey);

      queryClient.setQueryData<AppNotification[]>(
        queryKey,
        (currentItems = []) =>
          currentItems.map((notification) =>
            notification.id === id
              ? {
                  ...notification,
                  lida: true,
                }
              : notification,
          ),
      );

      return {
        previousItems,
      };
    },

    onError: (error, _id, context) => {
      console.error(
        "Erro ao marcar notificação como lida:",
        error,
      );

      if (context?.previousItems) {
        queryClient.setQueryData(
          queryKey,
          context.previousItems,
        );
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey,
      });
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("Usuário não autenticado.");
      }

      const { data, error } = await supabase
        .from("notifications")
        .update({
          lida: true,
        })
        .eq("user_id", userId)
        .eq("lida", false)
        .select("id");

      if (error) {
        throw error;
      }

      return data ?? [];
    },

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey,
      });

      const previousItems =
        queryClient.getQueryData<AppNotification[]>(queryKey);

      queryClient.setQueryData<AppNotification[]>(
        queryKey,
        (currentItems = []) =>
          currentItems.map((notification) => ({
            ...notification,
            lida: true,
          })),
      );

      return {
        previousItems,
      };
    },

    onError: (error, _variables, context) => {
      console.error(
        "Erro ao marcar todas as notificações como lidas:",
        error,
      );

      if (context?.previousItems) {
        queryClient.setQueryData(
          queryKey,
          context.previousItems,
        );
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey,
      });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) {
        throw new Error("Usuário não autenticado.");
      }

      const { data, error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "A notificação não foi excluída. Verifique as políticas RLS.",
        );
      }

      return id;
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey,
      });

      const previousItems =
        queryClient.getQueryData<AppNotification[]>(queryKey);

      queryClient.setQueryData<AppNotification[]>(
        queryKey,
        (currentItems = []) =>
          currentItems.filter(
            (notification) => notification.id !== id,
          ),
      );

      return {
        previousItems,
      };
    },

    onError: (error, _id, context) => {
      console.error(
        "Erro ao excluir notificação:",
        error,
      );

      if (context?.previousItems) {
        queryClient.setQueryData(
          queryKey,
          context.previousItems,
        );
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey,
      });
    },
  });

  const items = query.data ?? [];

  const unreadCount = items.filter(
    (notification) => !notification.lida,
  ).length;

  return {
    items,
    unreadCount,
    isLoading: query.isLoading,
    markRead,
    markAllRead,
    remove,
  };
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

export function iconForTipo(
  tipo: string,
): LucideIcon {
  return ICONS[tipo] ?? Bell;
}

export function colorForTipo(
  tipo: string,
): string {
  if (tipo.includes("rejeit")) {
    return "text-destructive bg-destructive/10";
  }

  if (tipo.includes("aprovad")) {
    return "text-emerald-600 bg-emerald-500/10";
  }

  if (tipo.includes("ajustes")) {
    return "text-amber-600 bg-amber-500/10";
  }

  if (tipo.includes("inscricao")) {
    return "text-blue-600 bg-blue-500/10";
  }

  if (tipo === "cadastro") {
    return "text-primary bg-primary/10";
  }

  return "text-muted-foreground bg-muted";
}
