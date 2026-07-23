import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/types";

import type {
  StatusValidacaoProfissional,
  TipoProfissional,
  UserRow,
} from "../types";

interface UpdateUserInput {
  userId: string;
  nome: string;
  cidade: string;
  estado: string;
  avatarUrl: string | null;
}

interface ToggleUserStatusInput {
  userId: string;
  ativo: boolean;
}

interface ProfessionalRequestInput {
  userId: string;
}

export function useAdminUsers() {
  const queryClient = useQueryClient();

  async function refreshUsers() {
    await queryClient.invalidateQueries({
      queryKey: ["admin", "users"],
    });
  }

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],

    queryFn: async (): Promise<UserRow[]> => {
      const { data, error } = await supabase
        .from("admin_users")
        .select(
          `
            id,
            nome,
            email,
            tipo,
            created_at,
            roles,
            avatar_url,
            cidade,
            estado,
            ativo,
            tipo_solicitado,
            crn_solicitado,
            status_validacao,
            solicitado_em,
            analisado_em,
            analisado_por
          `,
        )
        .order("created_at", {
          ascending: false,
        });

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
          avatar_url: user.avatar_url ?? null,
          cidade: user.cidade ?? "",
          estado: user.estado ?? "",
          ativo: user.ativo ?? true,

          tipo_solicitado:
            (user.tipo_solicitado as TipoProfissional | null) ??
            null,

          crn_solicitado:
            user.crn_solicitado ?? null,

          status_validacao:
            (user.status_validacao as
              | StatusValidacaoProfissional
              | null) ?? null,

          solicitado_em:
            user.solicitado_em ?? null,

          analisado_em:
            user.analisado_em ?? null,

          analisado_por:
            user.analisado_por ?? null,
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
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role,
        });

      if (error) {
        throw error;
      }
    },

    onSuccess: async () => {
      toast.success("Papel atribuído com sucesso");
      await refreshUsers();
    },

    onError: (error: Error) => {
      const normalizedMessage =
        error.message.toLowerCase();

      const duplicateRole =
        normalizedMessage.includes("duplicate") ||
        normalizedMessage.includes("unique");

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
      await refreshUsers();
    },

    onError: () => {
      toast.error("Não foi possível remover o papel");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      nome,
      cidade,
      estado,
      avatarUrl,
    }: UpdateUserInput) => {
      const normalizedName = nome.trim();

      if (!normalizedName) {
        throw new Error(
          "O nome do usuário é obrigatório",
        );
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({
          nome: normalizedName,
          cidade: cidade.trim() || null,
          estado:
            estado.trim().toUpperCase() || null,
          avatar_url: avatarUrl?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select("id")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "O usuário não foi atualizado. Verifique as permissões do administrador.",
        );
      }
    },

    onSuccess: async () => {
      toast.success(
        "Usuário atualizado com sucesso",
      );

      await refreshUsers();
    },

    onError: (error: Error) => {
      toast.error(
        error.message ||
          "Não foi possível atualizar o usuário",
      );
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({
      userId,
      ativo,
    }: ToggleUserStatusInput) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          ativo,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select("id")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "O status não foi alterado. Verifique as permissões do administrador.",
        );
      }
    },

    onSuccess: async (_, variables) => {
      toast.success(
        variables.ativo
          ? "Usuário ativado com sucesso"
          : "Usuário desativado com sucesso",
      );

      await refreshUsers();
    },

    onError: (error: Error) => {
      toast.error(
        error.message ||
          "Não foi possível alterar o status do usuário",
      );
    },
  });

  const approveProfessionalRequestMutation =
    useMutation({
      mutationFn: async ({
        userId,
      }: ProfessionalRequestInput) => {
        const { error } = await supabase.rpc(
          "aprovar_perfil_profissional",
          {
            p_profile_id: userId,
          },
        );

        if (error) {
          throw error;
        }
      },

      onSuccess: async () => {
        toast.success(
          "Solicitação profissional aprovada",
        );

        await refreshUsers();
      },

      onError: (error: Error) => {
        toast.error(
          error.message ||
            "Não foi possível aprovar a solicitação",
        );
      },
    });

  const rejectProfessionalRequestMutation =
    useMutation({
      mutationFn: async ({
        userId,
      }: ProfessionalRequestInput) => {
        const { error } = await supabase.rpc(
          "recusar_perfil_profissional",
          {
            p_profile_id: userId,
          },
        );

        if (error) {
          throw error;
        }
      },

      onSuccess: async () => {
        toast.success(
          "Solicitação profissional recusada",
        );

        await refreshUsers();
      },

      onError: (error: Error) => {
        toast.error(
          error.message ||
            "Não foi possível recusar a solicitação",
        );
      },
    });

  return {
    users: usersQuery.data ?? [],
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,

    grantRole: grantRoleMutation.mutate,
    revokeRole: revokeRoleMutation.mutate,
    updateUser: updateUserMutation.mutate,

    toggleUserStatus:
      toggleUserStatusMutation.mutate,

    approveProfessionalRequest:
      approveProfessionalRequestMutation.mutate,

    rejectProfessionalRequest:
      rejectProfessionalRequestMutation.mutate,

    isGrantingRole:
      grantRoleMutation.isPending,

    isRevokingRole:
      revokeRoleMutation.isPending,

    isUpdatingUser:
      updateUserMutation.isPending,

    isTogglingUserStatus:
      toggleUserStatusMutation.isPending,

    isApprovingProfessionalRequest:
      approveProfessionalRequestMutation.isPending,

    isRejectingProfessionalRequest:
      rejectProfessionalRequestMutation.isPending,
  };
}