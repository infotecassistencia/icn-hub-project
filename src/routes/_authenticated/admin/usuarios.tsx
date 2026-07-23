import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

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

  const [isUserModalOpen, setIsUserModalOpen] =
    useState(false);

  const {
    users,
    isLoading,
    isError,
    error,
    grantRole,
    revokeRole,
    updateUser,
    toggleUserStatus,
    isGrantingRole,
    isRevokingRole,
    isUpdatingUser,
    isTogglingUserStatus,
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

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLocaleLowerCase("pt-BR");

    return users.filter((user) => {
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
    });
  }, [users, search, roleFilter]);

  function handleEditUser(user: UserRow) {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  }

  function handleModalOpenChange(open: boolean) {
    setIsUserModalOpen(open);

    if (!open) {
      setSelectedUser(null);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold">
          Usuários
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie usuários e controle os papéis de acesso ao
          ICN Hub.
        </p>
      </header>

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
        open={isUserModalOpen}
        isUpdatingUser={isUpdatingUser}
        isTogglingUserStatus={isTogglingUserStatus}
        onOpenChange={handleModalOpenChange}
        onUpdateUser={(data) => {
          updateUser(data);
        }}
        onToggleUserStatus={(data) => {
          if (data.userId === currentUserId && !data.ativo) {
            toast.error(
              "Você não pode desativar sua própria conta.",
            );
            return;
          }

          toggleUserStatus(data);
        }}
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
