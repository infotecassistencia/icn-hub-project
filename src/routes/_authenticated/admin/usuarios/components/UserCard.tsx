import { useEffect, useState } from "react";
import {
  Edit3,
  MapPin,
  Shield,
  ShieldPlus,
  UserMinus,
  UserRound,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { AppRole } from "@/lib/types";

import {
  ROLE_LABEL,
  ROLE_VARIANT,
  type UserRow,
} from "../types";

interface UserCardProps {
  user: UserRow;
  currentUserId: string | null | undefined;
  isGrantingRole: boolean;
  isRevokingRole: boolean;
  onGrantRole: (userId: string, role: AppRole) => void;
  onRevokeRole: (userId: string, role: AppRole) => void;
  onEditUser: (user: UserRow) => void;
}

const ALL_ROLES: AppRole[] = [
  "admin",
  "organizador",
  "participante",
];

export function UserCard({
  user,
  currentUserId,
  isGrantingRole,
  isRevokingRole,
  onGrantRole,
  onRevokeRole,
  onEditUser,
}: UserCardProps) {
  const availableRoles = ALL_ROLES.filter(
    (role) => !user.roles.includes(role),
  );

  const [selectedRole, setSelectedRole] = useState<
    AppRole | undefined
  >(availableRoles[0]);

  useEffect(() => {
    if (
      selectedRole === undefined ||
      !availableRoles.includes(selectedRole)
    ) {
      setSelectedRole(availableRoles[0]);
    }
  }, [availableRoles, selectedRole]);

  const isCurrentUser = user.id === currentUserId;
  const userInitials = getInitials(user.nome);

  const location = [user.cidade, user.estado]
    .filter(Boolean)
    .join(" - ");

  function handleGrantRole() {
    if (!selectedRole) {
      return;
    }

    onGrantRole(user.id, selectedRole);
  }

  return (
    <div
      className={
        user.ativo
          ? "flex flex-wrap items-start justify-between gap-4 px-5 py-4"
          : "flex flex-wrap items-start justify-between gap-4 bg-muted/30 px-5 py-4 opacity-75"
      }
    >
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <Avatar className="h-12 w-12 shrink-0">
          <AvatarImage
            src={user.avatar_url || undefined}
            alt={user.nome || "Avatar do usuário"}
          />

          <AvatarFallback>
            {userInitials || (
              <UserRound className="h-5 w-5" />
            )}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">
              {user.nome || "(sem nome)"}
            </span>

            {isCurrentUser && (
              <Badge variant="outline">Você</Badge>
            )}

            <Badge
              variant={user.ativo ? "secondary" : "destructive"}
            >
              {user.ativo ? "Ativo" : "Inativo"}
            </Badge>
          </div>

          <div className="truncate text-xs text-muted-foreground">
            {user.email || "Email não informado"}
          </div>

          {location && (
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}

          <div className="mt-2 flex flex-wrap gap-1.5">
            {user.roles.length === 0 && (
              <span className="text-xs text-muted-foreground">
                Sem papéis atribuídos
              </span>
            )}

            {user.roles.map((role) => {
              const cannotRemoveOwnAdmin =
                isCurrentUser && role === "admin";

              return (
                <span
                  key={role}
                  className="inline-flex items-center gap-1"
                >
                  <Badge
                    variant={ROLE_VARIANT[role]}
                    className="gap-1"
                  >
                    <Shield className="h-3 w-3" />
                    {ROLE_LABEL[role]}
                  </Badge>

                  <button
                    type="button"
                    onClick={() =>
                      onRevokeRole(user.id, role)
                    }
                    disabled={
                      isRevokingRole || cannotRemoveOwnAdmin
                    }
                    className="text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Remover ${ROLE_LABEL[role]}`}
                    title={
                      cannotRemoveOwnAdmin
                        ? "Você não pode remover seu próprio papel de administrador"
                        : `Remover papel ${ROLE_LABEL[role]}`
                    }
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {availableRoles.length > 0 && selectedRole && (
          <>
            <Select
              value={selectedRole}
              onValueChange={(value) =>
                setSelectedRole(value as AppRole)
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_LABEL[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isGrantingRole}
              onClick={handleGrantRole}
            >
              <ShieldPlus className="mr-1.5 h-4 w-4" />
              Atribuir
            </Button>
          </>
        )}

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onEditUser(user)}
        >
          <Edit3 className="mr-1.5 h-4 w-4" />
          Editar
        </Button>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  if (!name.trim()) {
    return "";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}