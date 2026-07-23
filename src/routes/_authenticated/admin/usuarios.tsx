import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

import { UserCard } from "./usuarios/components/UserCard";
import { UserFilter } from "./usuarios/components/UserFilter";
import { UserModal } from "./usuarios/components/UserModal";
import { UserStats } from "./usuarios/components/UserStats";
import { useAdminUsers } from "./usuarios/hooks/useAdminUsers";
import type {
  UserRoleFilter,
  UserRow,
} from "./usuarios/types";

export const Route = createFileRoute(
  "/_authenticated/admin/usuarios",
)({
  head: () => ({
    meta: [
      {
        title: "Usuários — Admin",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),

  component: UsuariosAdmin,
});

function UsuariosAdmin() {
  const { userId: currentUserId } = useAuth();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] =
    useState<UserRoleFilter>("todos");

  const [selectedUser, setSelectedUser] =
    useState<UserRow | null>(null);

  const {
    users,
    isLoading,
    isError,
    error,

    grantRole,
    revokeRole,
    updateUser,
    toggleUserStatus,

    approveProfessionalRequest,
    rejectProfessionalRequest,

    isGrantingRole,
    isRevokingRole,
    isUpdatingUser,
    isTogglingUserStatus,

    isApprovingProfessionalRequest,
    isRejectingProfessionalRequest,
  } = useAdminUsers();

  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    const updatedSelectedUser = users.find(
      (user) => user.id === selectedUser.id,
    );

    if (updatedSelectedUser) {
      setSelectedUser(updatedSelectedUser);
    }
  }, [users, selectedUser?.id]);

  const pendingProfessionalRequestsCount = useMemo(
    () =>
      users.filter(
        (user) => user.status_validacao === "pendente",
      ).length,
    [users],
  );

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLocaleLowerCase("pt-BR");

    return users
      .filter((user) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          user.nome
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch) ||
          user.email
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch) ||
          user.cidade
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch) ||
          user.estado
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch);

        const matchesRole =
          roleFilter === "todos" ||
          user.roles.includes(roleFilter);

        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        const aPending =
          a.status_validacao === "pendente";
        const bPending =
          b.status_validacao === "pendente";

        if (aPending === bPending) {
          return a.nome.localeCompare(b.nome, "pt-BR");
        }

        return aPending ? -1 : 1;
      });
  }, [users, search, roleFilter]);

  function handleEditUser(user: UserRow) {
    setSelectedUser(user);
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-semibold">
            Usuários
          </h1>

          {pendingProfessionalRequestsCount > 0 && (
            <Badge className="gap-1.5 bg-amber-500 text-white hover:bg-amber-500">
              <Clock3 className="h-3.5 w-3.5" />
              {pendingProfessionalRequestsCount}{" "}
              {pendingProfessionalRequestsCount === 1
                ? "solicitação pendente"
                : "solicitações pendentes"}
            </Badge>
          )}
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie usuários e controle os papéis de acesso ao
          ICN Hub.
        </p>
      </header>

      {pendingProfessionalRequestsCount > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" />

          <div>
            <p className="font-medium text-amber-950 dark:text-amber-100">
              Solicitações profissionais aguardando análise
            </p>

            <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
              {pendingProfessionalRequestsCount === 1
                ? "Há 1 usuário solicitando alteração para um perfil profissional."
                : `Há ${pendingProfessionalRequestsCount} usuários solicitando alteração para um perfil profissional.`}
              {" "}Os pedidos pendentes aparecem primeiro na lista.
            </p>
          </div>
        </div>
      )}

      <UserStats users={users} />

      <UserFilter
        search={search}
        roleFilter={roleFilter}
        onSearchChange={setSearch}
        onRoleFilterChange={setRoleFilter}
      />

      <Card className="shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState error={error} />
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              hasFilters={
                search.trim().length > 0 ||
                roleFilter !== "todos"
              }
            />
          ) : (
            <div className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  currentUserId={currentUserId}
                  isGrantingRole={isGrantingRole}
                  isRevokingRole={isRevokingRole}
                  onGrantRole={(userId, role) => {
                    grantRole({
                      userId,
                      role,
                    });
                  }}
                  onRevokeRole={(userId, role) => {
                    revokeRole({
                      userId,
                      role,
                    });
                  }}
                  onEditUser={handleEditUser}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <UserModal
        user={selectedUser}
        open={Boolean(selectedUser)}
        isUpdatingUser={isUpdatingUser}
        isTogglingUserStatus={isTogglingUserStatus}
        isApprovingProfessionalRequest={
          isApprovingProfessionalRequest
        }
        isRejectingProfessionalRequest={
          isRejectingProfessionalRequest
        }
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUser(null);
          }
        }}
        onUpdateUser={updateUser}
        onToggleUserStatus={toggleUserStatus}
        onApproveProfessionalRequest={
          approveProfessionalRequest
        }
        onRejectProfessionalRequest={
          rejectProfessionalRequest
        }
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3 p-5">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-24 animate-pulse rounded-lg bg-muted/50"
        />
      ))}
    </div>
  );
}

function ErrorState({
  error,
}: {
  error: Error | null;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-5 w-5" />
      </div>

      <p className="text-sm font-medium">
        Não foi possível carregar os usuários
      </p>

      <p className="mt-1 max-w-md text-xs text-muted-foreground">
        {error?.message ||
          "Ocorreu um erro inesperado ao consultar os usuários."}
      </p>
    </div>
  );
}

function EmptyState({
  hasFilters,
}: {
  hasFilters: boolean;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
      <p className="text-sm font-medium">
        {hasFilters
          ? "Nenhum usuário corresponde aos filtros"
          : "Nenhum usuário cadastrado"}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {hasFilters
          ? "Altere a busca ou selecione outro papel."
          : "Os novos cadastros aparecerão nesta página."}
      </p>
    </div>
  );
}