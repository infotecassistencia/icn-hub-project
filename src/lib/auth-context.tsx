import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole, Perfil, TipoUsuario } from "./types";

interface AuthState {
  user: Perfil | null;
  userId: string | null;
  roles: AppRole[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isOrganizador: boolean;
  hasRole: (role: AppRole) => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
  data: RegisterData,
) => Promise<{ requiresEmailConfirmation: boolean }>;
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

const AuthContext = createContext<AuthState | undefined>(undefined);

async function loadProfileAndRoles(userId: string): Promise<{ perfil: Perfil | null; roles: AppRole[] }> {
  const [{ data: profile }, { data: rolesRows }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);

  const roles = (rolesRows ?? []).map((r) => r.role as AppRole);
  const perfil: Perfil | null = profile
    ? {
        id: profile.id,
        nome: profile.nome ?? "",
        email: profile.email ?? "",
        telefone: profile.telefone ?? "",
        cpf: profile.cpf ?? "",
        tipo: (profile.tipo ?? "participante") as Perfil["tipo"],
        crn: profile.crn,
        areaAtuacao: profile.area_atuacao,
        instituicao: profile.instituicao,
        semestre: profile.semestre,
        criadoEm: profile.created_at ?? new Date().toISOString(),
      }
    : null;
  return { perfil, roles };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<Perfil | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const hydrate = async (uid: string | null) => {
    setUserId(uid);
    if (!uid) {
      setUser(null);
      setRoles([]);
      return;
    }
    const { perfil, roles: rls } = await loadProfileAndRoles(uid);
    setUser(perfil);
    setRoles(rls);
  };

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      await hydrate(data.session?.user?.id ?? null);
      setIsLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      // Defer supabase calls to avoid deadlock inside the listener.
      setTimeout(() => hydrate(session?.user?.id ?? null), 0);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login: AuthState["login"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register: AuthState["register"] = async (registerData) => {
  const emailRedirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth?tab=login`
      : undefined;

  const { data: signUpData, error } =
    await supabase.auth.signUp({
      email: registerData.email,
      password: registerData.password,

      options: {
        emailRedirectTo,

        data: {
          nome: registerData.nome,
          telefone: registerData.telefone,
          cpf: registerData.cpf,
          tipo: registerData.tipo,

          crn: registerData.crn ?? null,
          area_atuacao: registerData.areaAtuacao ?? null,
          instituicao: registerData.instituicao ?? null,
          semestre: registerData.semestre ?? null,
        },
      },
    });

  if (error) {
    throw error;
  }

  const requiresEmailConfirmation = !signUpData.session;

  if (signUpData.session?.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        crn: registerData.crn ?? null,
        area_atuacao: registerData.areaAtuacao ?? null,
        instituicao: registerData.instituicao ?? null,
        semestre: registerData.semestre ?? null,
      })
      .eq("id", signUpData.session.user.id);

    if (profileError) {
      throw profileError;
    }
  }

  return {
    requiresEmailConfirmation,
  };
};

  const logout: AuthState["logout"] = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserId(null);
    setRoles([]);
  };

  const refresh = async () => {
    if (userId) await hydrate(userId);
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        roles,
        isAuthenticated: !!userId,
        isLoading,
        isAdmin: roles.includes("admin"),
        isOrganizador: roles.includes("organizador"),
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
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
