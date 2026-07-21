import { useEffect, useState } from "react";
import { Shield, ShieldPlus, UserMinus } from "lucide-react";

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
}: UserCardProps) {
  const availableRoles = ALL_ROLES.filter(
    (role) => !user.roles.includes(role),
  );

  const [selectedRole, setSelectedRole] = useState<AppRole | undefined>(
    availableRoles[0],
  );

  useEffect(() => {
    if (
      selectedRole === undefined ||
      !availableRoles.includes(selectedRole)
    ) {
      setSelectedRole(availableRoles[0]);
    }
  }, [availableRoles, selectedRole]);

  const isCurrentUser = user.id === currentUserId;

  function handleGrantRole() {
    if (!selectedRole) {
      return;
    }

    onGrantRole(user.id, selectedRole);
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">
            {user.nome || "(sem nome)"}
          </span>

          {isCurrentUser && (
            <Badge variant="outline">
              Você
            </Badge>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          {user.email || "Email não informado"}
        </div>

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
                  onClick={() => onRevokeRole(user.id, role)}
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

      {availableRoles.length > 0 && selectedRole && (
        <div className="flex shrink-0 items-center gap-2">
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
        </div>
      )}
    </div>
  );
}