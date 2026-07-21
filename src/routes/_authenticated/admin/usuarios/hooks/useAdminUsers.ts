import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/types";

import type { UserRow } from "../types";

export function useAdminUsers() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],

    queryFn: async (): Promise<UserRow[]> => {
      const { data, error } = await supabase
        .from("admin_users")
        .select("id, nome, email, tipo, created_at, roles")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? [])
        .filter(
          (user): user is typeof user & { id: string } =>
            user.id !== null,
        )
        .map((user) => ({
          id: user.id,
          nome: user.nome ?? "",
          email: user.email ?? "",
          tipo: user.tipo ?? "",
          created_at: user.created_at ?? "",
          roles: (user.roles ?? []) as AppRole[],
        }));
    },
  });

  const grantRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: AppRole;
    }) => {
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role,
      });

      if (error) {
        throw error;
      }
    },

    onSuccess: async () => {
      toast.success("Papel atribuído com sucesso");

      await queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });
    },

    onError: (error: Error) => {
      const duplicateRole =
        error.message.toLowerCase().includes("duplicate") ||
        error.message.toLowerCase().includes("unique");

      toast.error(
        duplicateRole
          ? "O usuário já possui esse papel"
          : "Não foi possível atribuir o papel",
      );
    },
  });

  const revokeRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: AppRole;
    }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) {
        throw error;
      }
    },

    onSuccess: async () => {
      toast.success("Papel removido com sucesso");

      await queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });
    },

    onError: () => {
      toast.error("Não foi possível remover o papel");
    },
  });

  return {
    users: usersQuery.data ?? [],
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,

    grantRole: grantRoleMutation.mutate,
    revokeRole: revokeRoleMutation.mutate,

    isGrantingRole: grantRoleMutation.isPending,
    isRevokingRole: revokeRoleMutation.isPending,
  };
}