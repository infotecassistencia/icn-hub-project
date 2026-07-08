import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Perfil, TipoUsuario } from "./types";

// Mock auth provider. Structure mirrors Supabase-style session so it can be
// replaced by @/integrations/supabase/client once Lovable Cloud is enabled.

interface AuthState {
  user: Perfil | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
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

const STORAGE_KEY = "icn-hub:mock-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Perfil | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setIsLoading(false);
  }, []);

  const persist = (u: Perfil | null) => {
    setUser(u);
    if (typeof window === "undefined") return;
    if (u) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else window.localStorage.removeItem(STORAGE_KEY);
  };

  const login: AuthState["login"] = async (email) => {
    // TODO: replace with supabase.auth.signInWithPassword
    const mock: Perfil = {
      id: "mock-user",
      nome: "Usuário Demo",
      email,
      telefone: "",
      cpf: "",
      tipo: "nutricionista",
      crn: "CRN-0/00000",
      areaAtuacao: "Clínica",
      criadoEm: new Date().toISOString(),
    };
    persist(mock);
  };

  const register: AuthState["register"] = async (data) => {
    // TODO: replace with supabase.auth.signUp + profiles insert
    const base = {
      id: crypto.randomUUID(),
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      cpf: data.cpf,
      criadoEm: new Date().toISOString(),
    };
    const perfil: Perfil =
      data.tipo === "estudante"
        ? {
            ...base,
            tipo: "estudante",
            instituicao: data.instituicao ?? "",
            semestre: data.semestre ?? "",
          }
        : {
            ...base,
            tipo: data.tipo,
            crn: data.crn ?? "",
            areaAtuacao: data.areaAtuacao ?? "",
          };
    persist(perfil);
  };

  const logout: AuthState["logout"] = async () => {
    persist(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
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
