import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, CheckCheck, Mail, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import type { ContactMessage, StatusMensagem } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/mensagens")({
  head: () => ({ meta: [{ title: "Mensagens — Admin" }, { name: "robots", content: "noindex" }] }),
  component: MensagensAdmin,
});

const STATUS_LABEL: Record<StatusMensagem, string> = {
  novo: "Novo",
  respondido: "Respondido",
  arquivado: "Arquivado",
};

const STATUS_VARIANT: Record<StatusMensagem, "default" | "secondary" | "outline"> = {
  novo: "default",
  respondido: "secondary",
  arquivado: "outline",
};

function MensagensAdmin() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusMensagem | "todos">("todos");
  const [openMsg, setOpenMsg] = useState<ContactMessage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("data_envio", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ContactMessage[];
    },
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return messages.filter((m) => {
      if (statusFilter !== "todos" && m.status !== statusFilter) return false;
      if (!term) return true;
      return (
        m.nome.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        m.assunto.toLowerCase().includes(term) ||
        m.mensagem.toLowerCase().includes(term)
      );
    });
  }, [messages, search, statusFilter]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusMensagem }) => {
      const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success(
        vars.status === "respondido"
          ? "Marcada como respondida"
          : vars.status === "arquivado"
            ? "Arquivada"
            : "Atualizada",
      );
      qc.invalidateQueries({ queryKey: ["admin", "messages"] });
      qc.invalidateQueries({ queryKey: ["admin", "overview"] });
      setOpenMsg((cur) => (cur ? { ...cur, status: vars.status } : cur));
    },
    onError: () => toast.error("Não foi possível atualizar"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mensagem excluída");
      qc.invalidateQueries({ queryKey: ["admin", "messages"] });
      qc.invalidateQueries({ queryKey: ["admin", "overview"] });
      setDeleteId(null);
      setOpenMsg(null);
    },
    onError: () => toast.error("Não foi possível excluir"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Mensagens</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mensagens enviadas pelo formulário público de contato.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome, email, assunto ou conteúdo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusMensagem | "todos")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="novo">Novo</SelectItem>
            <SelectItem value="respondido">Respondido</SelectItem>
            <SelectItem value="arquivado">Arquivado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-10 text-center text-muted-foreground">Carregando mensagens...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center text-muted-foreground">
              <Mail className="h-8 w-8" />
              <div>Nenhuma mensagem encontrada.</div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setOpenMsg(m)}
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium">{m.nome}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="truncate text-xs text-muted-foreground">{m.email}</span>
                    </div>
                    <div className="mt-0.5 truncate text-sm">{m.assunto}</div>
                    <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">{m.mensagem}</div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Badge variant={STATUS_VARIANT[m.status]}>{STATUS_LABEL[m.status]}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(m.data_envio).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!openMsg} onOpenChange={(o) => !o && setOpenMsg(null)}>
        <DialogContent className="max-w-2xl">
          {openMsg && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-xl">{openMsg.assunto}</DialogTitle>
                  <Badge variant={STATUS_VARIANT[openMsg.status]}>{STATUS_LABEL[openMsg.status]}</Badge>
                </div>
                <DialogDescription>
                  De <strong>{openMsg.nome}</strong> · {openMsg.email}
                  {openMsg.telefone ? ` · ${openMsg.telefone}` : ""} ·{" "}
                  {new Date(openMsg.data_envio).toLocaleString("pt-BR")}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-lg bg-secondary/50 p-4 text-sm">
                {openMsg.mensagem}
              </div>
              <DialogFooter className="flex-wrap gap-2 sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={openMsg.status === "respondido" || updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ id: openMsg.id, status: "respondido" })}
                  >
                    <CheckCheck className="mr-1.5 h-4 w-4" /> Marcar como respondida
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={openMsg.status === "arquivado" || updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ id: openMsg.id, status: "arquivado" })}
                  >
                    <Archive className="mr-1.5 h-4 w-4" /> Arquivar
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteId(openMsg.id)}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" /> Excluir
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir mensagem?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. A mensagem será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && remove.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
