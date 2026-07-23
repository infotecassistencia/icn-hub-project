import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Power,
  Save,
  UserRound,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { UserRow } from "../types";

interface UpdateUserData {
  userId: string;
  nome: string;
  cidade: string;
  estado: string;
  avatarUrl: string | null;
}

interface ToggleUserStatusData {
  userId: string;
  ativo: boolean;
}

interface UserModalProps {
  user: UserRow | null;
  open: boolean;
  isUpdatingUser: boolean;
  isTogglingUserStatus: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateUser: (data: UpdateUserData) => void;
  onToggleUserStatus: (data: ToggleUserStatusData) => void;
}

export function UserModal({
  user,
  open,
  isUpdatingUser,
  isTogglingUserStatus,
  onOpenChange,
  onUpdateUser,
  onToggleUserStatus,
}: UserModalProps) {
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (!user) {
      setNome("");
      setCidade("");
      setEstado("");
      setAvatarUrl("");
      return;
    }

    setNome(user.nome);
    setCidade(user.cidade);
    setEstado(user.estado);
    setAvatarUrl(user.avatar_url ?? "");
  }, [user]);

  const isPending =
    isUpdatingUser || isTogglingUserStatus;

  const normalizedName = nome.trim();
  const canSave =
    normalizedName.length > 0 && !isPending;

  const userInitials = getInitials(user?.nome);

  function handleSave() {
    if (!user || !canSave) {
      return;
    }

    onUpdateUser({
      userId: user.id,
      nome: normalizedName,
      cidade: cidade.trim(),
      estado: estado.trim().toUpperCase(),
      avatarUrl: avatarUrl.trim() || null,
    });
  }

  function handleToggleStatus() {
    if (!user || isPending) {
      return;
    }

    onToggleUserStatus({
      userId: user.id,
      ativo: !user.ativo,
    });
  }

  function handleEstadoChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const value = event.target.value
      .replace(/[^a-zA-Z]/g, "")
      .slice(0, 2)
      .toUpperCase();

    setEstado(value);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isPending) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Editar usuário</DialogTitle>

          <DialogDescription>
            Atualize os dados públicos e o status de acesso do
            usuário.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <>
            <div className="flex items-center gap-4 rounded-lg border border-border/60 p-4">
              <Avatar className="h-14 w-14">
                <AvatarImage
                  src={avatarUrl || undefined}
                  alt={user.nome || "Avatar do usuário"}
                />

                <AvatarFallback>
                  {userInitials || (
                    <UserRound className="h-5 w-5" />
                  )}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {user.nome || "Usuário sem nome"}
                </p>

                <p className="truncate text-sm text-muted-foreground">
                  {user.email || "Email não informado"}
                </p>

                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  {user.ativo ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600">
                        Usuário ativo
                      </span>
                    </>
                  ) : (
                    <>
                      <Power className="h-3.5 w-3.5 text-destructive" />
                      <span className="text-destructive">
                        Usuário desativado
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="admin-user-name">
                  Nome
                </Label>

                <Input
                  id="admin-user-name"
                  value={nome}
                  onChange={(event) =>
                    setNome(event.target.value)
                  }
                  placeholder="Nome completo"
                  disabled={isPending}
                />

                {!normalizedName && (
                  <p className="text-xs text-destructive">
                    O nome é obrigatório.
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="admin-user-avatar">
                  URL do avatar
                </Label>

                <Input
                  id="admin-user-avatar"
                  type="url"
                  value={avatarUrl}
                  onChange={(event) =>
                    setAvatarUrl(event.target.value)
                  }
                  placeholder="https://exemplo.com/avatar.jpg"
                  disabled={isPending}
                />

                <p className="text-xs text-muted-foreground">
                  Por enquanto, informe o endereço público da
                  imagem. O envio de arquivo poderá ser conectado
                  ao Supabase Storage posteriormente.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                <div className="grid gap-2">
                  <Label htmlFor="admin-user-city">
                    Cidade
                  </Label>

                  <Input
                    id="admin-user-city"
                    value={cidade}
                    onChange={(event) =>
                      setCidade(event.target.value)
                    }
                    placeholder="Ex.: Porto Alegre"
                    disabled={isPending}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="admin-user-state">
                    Estado
                  </Label>

                  <Input
                    id="admin-user-state"
                    value={estado}
                    onChange={handleEstadoChange}
                    placeholder="RS"
                    maxLength={2}
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">
                    Tipo de cadastro
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {user.tipo || "Não informado"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Data de cadastro
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {formatCreatedAt(user.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                type="button"
                variant={
                  user.ativo ? "destructive" : "outline"
                }
                disabled={isPending}
                onClick={handleToggleStatus}
              >
                {isTogglingUserStatus ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Power className="mr-2 h-4 w-4" />
                )}

                {user.ativo
                  ? "Desativar usuário"
                  : "Ativar usuário"}
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  disabled={!canSave}
                  onClick={handleSave}
                >
                  {isUpdatingUser ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}

                  Salvar alterações
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getInitials(name?: string) {
  if (!name?.trim()) {
    return "";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatCreatedAt(createdAt: string) {
  if (!createdAt) {
    return "Não informada";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}