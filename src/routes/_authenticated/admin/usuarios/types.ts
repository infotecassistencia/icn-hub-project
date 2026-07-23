import type { AppRole } from "@/lib/types";

export interface UserRow {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  created_at: string;
  roles: AppRole[];

  avatar_url: string | null;
  cidade: string;
  estado: string;
  ativo: boolean;
}

export type UserRoleFilter = "todos" | AppRole;

export const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Admin",
  organizador: "Organizador",
  participante: "Participante",
};

export const ROLE_VARIANT: Record<
  AppRole,
  "default" | "secondary" | "outline"
> = {
  admin: "default",
  organizador: "secondary",
  participante: "outline",
};