import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/integrations/supabase/client";

import type {
  AppRole,
  Perfil,
  TipoUsuario,
} from "./types";

interface AuthState {
  user: Perfil | null;
  userId: string | null;
  roles: AppRole[];

  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isOrganizador: boolean;

  hasRole: (
    role: AppRole,
  ) => boolean;

  login: (
    email: string,
    password: string,
  ) => Promise<void>;

  register: (
    data: RegisterData,
  ) => Promise<{
    requiresEmailConfirmation: boolean;
  }>;

  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export interface RegisterData {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  password: string;
  tipo: TipoUsuario;

  crn?: string;
  areaAtuacao?: string;
  instituicao?: string;
  semestre?: string;
}

const AuthContext =
  createContext<AuthState | undefined>(
    undefined,
  );

async function loadProfileAndRoles(
  userId: string,
): Promise<{
  perfil: Perfil | null;
  roles: AppRole[];
}> {
  const [
    profileResult,
    rolesResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(`
        id,
        nome,
        nome_exibicao,
        email,
        telefone,
        cpf,
        tipo,
        crn,
        foto_url,
        area_atuacao,
        instituicao,
        semestre,
        tipo_solicitado,
        crn_solicitado,
        status_validacao,
        solicitado_em,
        analisado_em,
        analisado_por,
        perfil_publico,
        mostrar_email,
        mostrar_telefone,
        created_at,
        updated_at
      `)
      .eq("id", userId)
      .maybeSingle(),

    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId),
  ]);

  if (profileResult.error) {
    throw profileResult.error;
  }

  if (rolesResult.error) {
    throw rolesResult.error;
  }

  const roles =
    (
      rolesResult.data ?? []
    ).map(
      (roleRow) =>
        roleRow.role as AppRole,
    );

  const profile =
    profileResult.data;

  if (!profile) {
    return {
      perfil: null,
      roles,
    };
  }

  const nomeCompleto =
    profile.nome ?? "";

  const nomeExibicao =
    profile.nome_exibicao?.trim() ||
    getFirstName(nomeCompleto) ||
    "Usuário";

  const perfil: Perfil = {
    id: profile.id,

    nome: nomeCompleto,
    nomeExibicao,

    email:
      profile.email ?? "",

    telefone:
      profile.telefone ?? "",

    cpf:
      profile.cpf ?? "",

    tipo:
      (
        profile.tipo ??
        "participante"
      ) as Perfil["tipo"],

    crn:
      profile.crn ?? null,

    fotoUrl:
      profile.foto_url ?? null,

    areaAtuacao:
      profile.area_atuacao ??
      null,

    instituicao:
      profile.instituicao ??
      null,

    semestre:
      profile.semestre ??
      null,

    tipoSolicitado:
      (
        profile.tipo_solicitado ??
        null
      ) as Perfil["tipoSolicitado"],

    crnSolicitado:
      profile.crn_solicitado ??
      null,

    statusValidacao:
      (
        profile.status_validacao ??
        null
      ) as Perfil["statusValidacao"],

    solicitadoEm:
      profile.solicitado_em ??
      null,

    analisadoEm:
      profile.analisado_em ??
      null,

    analisadoPor:
      profile.analisado_por ??
      null,

    perfilPublico:
      profile.perfil_publico ??
      true,

    mostrarEmail:
      profile.mostrar_email ??
      false,

    mostrarTelefone:
      profile.mostrar_telefone ??
      false,

    criadoEm:
      profile.created_at ??
      new Date().toISOString(),

    atualizadoEm:
      profile.updated_at ??
      profile.created_at ??
      new Date().toISOString(),
  };

  return {
    perfil,
    roles,
  };
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    userId,
    setUserId,
  ] = useState<string | null>(
    null,
  );

  const [
    user,
    setUser,
  ] = useState<Perfil | null>(
    null,
  );

  const [
    roles,
    setRoles,
  ] = useState<AppRole[]>(
    [],
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const hydrate = async (
    uid: string | null,
  ) => {
    setUserId(uid);

    if (!uid) {
      setUser(null);
      setRoles([]);
      return;
    }

    try {
      const {
        perfil,
        roles: loadedRoles,
      } =
        await loadProfileAndRoles(
          uid,
        );

      setUser(perfil);
      setRoles(loadedRoles);
    } catch (error) {
      console.error(
        "Erro ao carregar perfil e permissões:",
        error,
      );

      setUser(null);
      setRoles([]);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const {
          data,
          error,
        } =
          await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!mounted) {
          return;
        }

        await hydrate(
          data.session?.user?.id ??
            null,
        );
      } catch (error) {
        console.error(
          "Erro ao carregar sessão:",
          error,
        );

        if (mounted) {
          setUser(null);
          setUserId(null);
          setRoles([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSession();

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (
          event,
          session,
        ) => {
          if (
            event !==
              "SIGNED_IN" &&
            event !==
              "SIGNED_OUT" &&
            event !==
              "USER_UPDATED" &&
            event !==
              "TOKEN_REFRESHED"
          ) {
            return;
          }

          setTimeout(() => {
            void hydrate(
              session?.user?.id ??
                null,
            );
          }, 0);
        },
      );

    return () => {
      mounted = false;

      authListener.subscription.unsubscribe();
    };
  }, []);

  const login: AuthState["login"] =
    async (
      email,
      password,
    ) => {
      const {
        error,
      } =
        await supabase.auth.signInWithPassword(
          {
            email:
              email.trim(),
            password,
          },
        );

      if (error) {
        throw error;
      }
    };

  const register: AuthState["register"] =
    async (
      registerData,
    ) => {
      const emailRedirectTo =
        typeof window !==
        "undefined"
          ? `${window.location.origin}/auth?tab=login`
          : undefined;

      const {
        data: signUpData,
        error,
      } =
        await supabase.auth.signUp(
          {
            email:
              registerData.email.trim(),

            password:
              registerData.password,

            options: {
              emailRedirectTo,

              data: {
                nome:
                  registerData.nome,

                telefone:
                  registerData.telefone,

                cpf:
                  registerData.cpf,

                tipo:
                  registerData.tipo,

                crn:
                  registerData.crn ??
                  null,

                area_atuacao:
                  registerData.areaAtuacao ??
                  null,

                instituicao:
                  registerData.instituicao ??
                  null,

                semestre:
                  registerData.semestre ??
                  null,
              },
            },
          },
        );

      if (error) {
        throw error;
      }

      const requiresEmailConfirmation =
        !signUpData.session;

      if (
        signUpData.session?.user
      ) {
        const {
          error: profileError,
        } =
          await supabase
            .from("profiles")
            .update({
              crn:
                registerData.crn ??
                null,

              area_atuacao:
                registerData.areaAtuacao ??
                null,

              instituicao:
                registerData.instituicao ??
                null,

              semestre:
                registerData.semestre ??
                null,
            })
            .eq(
              "id",
              signUpData.session
                .user.id,
            );

        if (profileError) {
          throw profileError;
        }
      }

      return {
        requiresEmailConfirmation,
      };
    };

  const logout: AuthState["logout"] =
    async () => {
      const {
        error,
      } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);
      setUserId(null);
      setRoles([]);
    };

  const refresh:
    AuthState["refresh"] =
    async () => {
      if (!userId) {
        return;
      }

      await hydrate(userId);
    };

  const hasRole =
    (
      role: AppRole,
    ) =>
      roles.includes(role);

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        roles,

        isAuthenticated:
          Boolean(userId),

        isLoading,

        isAdmin:
          roles.includes(
            "admin",
          ),

        isOrganizador:
          roles.includes(
            "organizador",
          ),

        hasRole,
        login,
        register,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(
      AuthContext,
    );

  if (!context) {
    throw new Error(
      "useAuth deve ser utilizado dentro de AuthProvider.",
    );
  }

  return context;
}

function getFirstName(
  nomeCompleto: string,
): string {
  return (
    nomeCompleto
      .trim()
      .split(/\s+/)
      .filter(Boolean)[0] ??
    ""
  );
}