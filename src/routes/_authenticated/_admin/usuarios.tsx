import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Shield, ShieldPlus, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import type { AppRole } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/_admin/usuarios")({
  head: () => ({ meta: [{ title: "Usuários — Admin" }, { name: "robots", content: "noindex" }] }),
  component: UsuariosAdmin,
});

interface UserRow {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  created_at: string;
  roles: AppRole[];
}

const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Admin",
  organizador: "Organizador",
  participante: "Participante",
};

const ROLE_VARIANT: Record<AppRole, "default" | "secondary" | "outline"> = {
  admin: "default",
  organizador: "secondary",
  participante: "outline",
};

function UsuariosAdmin() {
  const qc = useQueryClient();
  const { userId: myId } = useAuth();
  const [search, setSearch] = useState("");
  const [addRoleFor, setAddRoleFor] = useState<Record<string, AppRole>>({});

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const [{ data: profiles, error: pe }, { data: roles, error: re }] = await Promise.all([
        supabase.from("profiles").select("id, nome, email, tipo, created_at").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (pe) throw pe;
      if (re) throw re;
      const byUser = new Map<string, AppRole[]>();
      for (const r of roles ?? []) {
        const arr = byUser.get(r.user_id) ?? [];
        arr.push(r.role as AppRole);
        byUser.set(r.user_id, arr);
      }
      return (profiles ?? []).map<UserRow>((p) => ({
        id: p.id,
        nome: p.nome ?? "",
        email: p.email ?? "",
        tipo: p.tipo ?? "",
        created_at: p.created_at ?? "",
        roles: byUser.get(p.id) ?? [],
      }));
    },
  });

  const grant = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Papel atribuído");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (e: Error) => toast.error(e.message.includes("duplicate") ? "Usuário já tem esse papel" : "Erro ao atribuir"),
  });

  const revoke = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Papel removido");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: () => toast.error("Erro ao remover"),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) => u.nome.toLowerCase().includes(term) || u.email.toLowerCase().includes(term),
    );
  }, [users, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Usuários</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atribua e remova papéis. Novos cadastros recebem <strong>Participante</strong> automaticamente.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-10 text-center text-muted-foreground">Carregando usuários...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">Nenhum usuário encontrado.</div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((u) => {
                const availableRoles: AppRole[] = (["admin", "organizador", "participante"] as AppRole[]).filter(
                  (r) => !u.roles.includes(r),
                );
                const pendingRole = addRoleFor[u.id] ?? availableRoles[0];
                return (
                  <div key={u.id} className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{u.nome || "(sem nome)"}</span>
                        {u.id === myId && <Badge variant="outline">Você</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {u.roles.length === 0 && (
                          <span className="text-xs text-muted-foreground">Sem papéis atribuídos</span>
                        )}
                        {u.roles.map((r) => (
                          <span key={r} className="inline-flex items-center gap-1">
                            <Badge variant={ROLE_VARIANT[r]} className="gap-1">
                              <Shield className="h-3 w-3" />
                              {ROLE_LABEL[r]}
                            </Badge>
                            <button
                              onClick={() => revoke.mutate({ userId: u.id, role: r })}
                              disabled={revoke.isPending || (u.id === myId && r === "admin")}
                              className="text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={`Remover ${ROLE_LABEL[r]}`}
                              title={u.id === myId && r === "admin" ? "Você não pode remover seu próprio admin" : "Remover"}
                            >
                              <UserMinus className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {availableRoles.length > 0 && (
                        <>
                          <Select
                            value={pendingRole}
                            onValueChange={(v) =>
                              setAddRoleFor((cur) => ({ ...cur, [u.id]: v as AppRole }))
                            }
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRoles.map((r) => (
                                <SelectItem key={r} value={r}>
                                  {ROLE_LABEL[r]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={grant.isPending}
                            onClick={() =>
                              grant.mutate({ userId: u.id, role: pendingRole })
                            }
                          >
                            <ShieldPlus className="mr-1.5 h-4 w-4" /> Atribuir
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
