import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  GraduationCap,
  Loader2,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute(
  "/_authenticated/admin/mentorias",
)({
  head: () => ({
    meta: [
      { title: "Mentorias — Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MentoriasAdmin,
});

type StatusMentoria = "pendente" | "aprovado" | "recusado";
type FiltroStatus = "todos" | StatusMentoria;
type AcaoModeracao = "aprovar" | "recusar";

interface MentoriaAdmin {
  id: string;
  nome: string;
  status: StatusMentoria;
  motivoRecusa: string | null;
  criadoPor: string | null;
  criadoEm: string;
}

interface ModeracaoSelecionada {
  mentoria: MentoriaAdmin;
  acao: AcaoModeracao;
}

function MentoriasAdmin() {
  const [mentorias, setMentorias] = useState<MentoriaAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [mentoriaEmAtualizacao, setMentoriaEmAtualizacao] =
    useState<string | null>(null);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] =
    useState<FiltroStatus>("todos");

  const [moderacaoSelecionada, setModeracaoSelecionada] =
    useState<ModeracaoSelecionada | null>(null);

  const [motivoRecusa, setMotivoRecusa] = useState("");

  const carregarMentorias = useCallback(
    async (carregamentoInicial = true) => {
      if (carregamentoInicial) {
        setCarregando(true);
      } else {
        setAtualizando(true);
      }

      try {
        const { data, error } = await supabase
          .from("mentorias")
          .select(`
            id,
            nome,
            status,
            motivo_recusa,
            criado_por,
            created_at
          `)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        const mentoriasMapeadas: MentoriaAdmin[] = (data ?? []).map(
          (mentoria) => ({
            id: mentoria.id,
            nome: mentoria.nome,
            status: mentoria.status as StatusMentoria,
            motivoRecusa: mentoria.motivo_recusa,
            criadoPor: mentoria.criado_por,
            criadoEm: mentoria.created_at,
          }),
        );

        setMentorias(mentoriasMapeadas);
      } catch (error) {
        console.error("Erro ao carregar mentorias:", error);

        toast.error("Não foi possível carregar as mentorias.", {
          description:
            error instanceof Error
              ? error.message
              : "Ocorreu um erro desconhecido.",
        });
      } finally {
        setCarregando(false);
        setAtualizando(false);
      }
    },
    [],
  );

  useEffect(() => {
    void carregarMentorias();
  }, [carregarMentorias]);

  function abrirModalModeracao(
    mentoria: MentoriaAdmin,
    acao: AcaoModeracao,
  ) {
    setModeracaoSelecionada({
      mentoria,
      acao,
    });

    setMotivoRecusa(
      acao === "recusar"
        ? mentoria.motivoRecusa ?? ""
        : "",
    );
  }

  function fecharModalModeracao() {
    if (mentoriaEmAtualizacao) {
      return;
    }

    setModeracaoSelecionada(null);
    setMotivoRecusa("");
  }

  async function criarNotificacaoModeracao(
    mentoria: MentoriaAdmin,
    novoStatus: StatusMentoria,
    motivo: string,
  ) {
    if (!mentoria.criadoPor) {
      return;
    }

    const aprovada = novoStatus === "aprovado";

    const { error } = await supabase
      .from("notifications")
      .insert({
        user_id: mentoria.criadoPor,
        tipo: aprovada
          ? "mentoria_aprovada"
          : "mentoria_rejeitada",
        titulo: aprovada
          ? "Mentoria aprovada"
          : "Mentoria recusada",
        mensagem: aprovada
          ? `A mentoria "${mentoria.nome}" foi aprovada e já está disponível na plataforma.`
          : `A mentoria "${mentoria.nome}" foi recusada. Motivo: ${motivo}`,
        url_destino: "/meus-eventos",
        lida: false,
      });

    if (error) {
      throw error;
    }
  }

  async function confirmarModeracao() {
    if (!moderacaoSelecionada) {
      return;
    }

    const { mentoria, acao } = moderacaoSelecionada;
    const motivoNormalizado = motivoRecusa.trim();

    if (acao === "recusar" && motivoNormalizado.length < 5) {
      toast.error("Informe o motivo da recusa.", {
        description:
          "O motivo precisa ter pelo menos 5 caracteres.",
      });

      return;
    }

    const novoStatus: StatusMentoria =
      acao === "aprovar" ? "aprovado" : "recusado";

    setMentoriaEmAtualizacao(mentoria.id);

    try {
      const { data, error } = await supabase
        .from("mentorias")
        .update({
          status: novoStatus,
          motivo_recusa:
            novoStatus === "recusado"
              ? motivoNormalizado
              : null,
        })
        .eq("id", mentoria.id)
        .select("id, status, motivo_recusa")
        .single();

      if (error) {
        throw error;
      }

      try {
        await criarNotificacaoModeracao(
          mentoria,
          novoStatus,
          motivoNormalizado,
        );
      } catch (notificationError) {
        console.error(
          "Erro ao criar notificação da mentoria:",
          notificationError,
        );

        toast.warning(
          "A mentoria foi atualizada, mas a notificação não pôde ser enviada.",
        );
      }

      setMentorias((mentoriasAtuais) =>
        mentoriasAtuais.map((item) =>
          item.id === data.id
            ? {
                ...item,
                status: data.status as StatusMentoria,
                motivoRecusa: data.motivo_recusa,
              }
            : item,
        ),
      );

      toast.success(
        novoStatus === "aprovado"
          ? "Mentoria aprovada com sucesso."
          : "Mentoria recusada com sucesso.",
      );

      setModeracaoSelecionada(null);
      setMotivoRecusa("");
    } catch (error) {
      console.error(
        "Erro ao atualizar a mentoria:",
        error,
      );

      toast.error("Não foi possível atualizar a mentoria.", {
        description:
          error instanceof Error
            ? error.message
            : "Verifique as políticas RLS da tabela mentorias.",
      });
    } finally {
      setMentoriaEmAtualizacao(null);
    }
  }

  const mentoriasFiltradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    return mentorias.filter((mentoria) => {
      const correspondeAoStatus =
        filtroStatus === "todos" ||
        mentoria.status === filtroStatus;

      if (!correspondeAoStatus) {
        return false;
      }

      if (!termo) {
        return true;
      }

      return [
        mentoria.nome,
        mentoria.motivoRecusa ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(termo);
    });
  }, [busca, filtroStatus, mentorias]);

  const totais = useMemo(() => {
    return mentorias.reduce(
      (acumulador, mentoria) => {
        acumulador.total += 1;
        acumulador[mentoria.status] += 1;

        return acumulador;
      },
      {
        total: 0,
        pendente: 0,
        aprovado: 0,
        recusado: 0,
      },
    );
  }, [mentorias]);

  return (
    <>
      <div className="space-y-6">
        <Cabecalho
          atualizando={atualizando}
          aoAtualizar={() => void carregarMentorias(false)}
        />

        <ResumoMentorias totais={totais} />

        <Card className="shadow-card">
          <CardContent className="space-y-4 p-4 sm:p-5">
            <Filtros
              busca={busca}
              filtroStatus={filtroStatus}
              aoAlterarBusca={setBusca}
              aoAlterarStatus={setFiltroStatus}
            />

            {carregando ? (
              <EstadoCarregando />
            ) : mentorias.length === 0 ? (
              <EstadoVazio
                titulo="Nenhuma mentoria cadastrada"
                descricao="As mentorias enviadas pelos usuários aparecerão aqui."
              />
            ) : mentoriasFiltradas.length === 0 ? (
              <EstadoVazio
                titulo="Nenhuma mentoria encontrada"
                descricao="Altere os filtros ou o texto pesquisado."
              />
            ) : (
              <ListaMentorias
                mentorias={mentoriasFiltradas}
                mentoriaEmAtualizacao={
                  mentoriaEmAtualizacao
                }
                aoAbrirModeracao={abrirModalModeracao}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {moderacaoSelecionada && (
        <ModalModeracao
          moderacao={moderacaoSelecionada}
          motivoRecusa={motivoRecusa}
          atualizando={
            mentoriaEmAtualizacao ===
            moderacaoSelecionada.mentoria.id
          }
          aoAlterarMotivo={setMotivoRecusa}
          aoFechar={fecharModalModeracao}
          aoConfirmar={() => void confirmarModeracao()}
        />
      )}
    </>
  );
}

interface CabecalhoProps {
  atualizando: boolean;
  aoAtualizar: () => void;
}

function Cabecalho({
  atualizando,
  aoAtualizar,
}: CabecalhoProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold">
          Mentorias
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Consulte, aprove ou recuse mentorias enviadas para
          validação.
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={aoAtualizar}
        disabled={atualizando}
      >
        {atualizando ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 h-4 w-4" />
        )}

        Atualizar
      </Button>
    </div>
  );
}

interface ResumoMentoriasProps {
  totais: {
    total: number;
    pendente: number;
    aprovado: number;
    recusado: number;
  };
}

function ResumoMentorias({
  totais,
}: ResumoMentoriasProps) {
  const itens = [
    { titulo: "Total", valor: totais.total },
    { titulo: "Pendentes", valor: totais.pendente },
    { titulo: "Aprovadas", valor: totais.aprovado },
    { titulo: "Recusadas", valor: totais.recusado },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {itens.map((item) => (
        <Card key={item.titulo} className="shadow-card">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">
              {item.titulo}
            </div>

            <div className="mt-1 font-display text-2xl font-semibold">
              {item.valor}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface FiltrosProps {
  busca: string;
  filtroStatus: FiltroStatus;
  aoAlterarBusca: (valor: string) => void;
  aoAlterarStatus: (valor: FiltroStatus) => void;
}

function Filtros({
  busca,
  filtroStatus,
  aoAlterarBusca,
  aoAlterarStatus,
}: FiltrosProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={busca}
          onChange={(event) =>
            aoAlterarBusca(event.target.value)
          }
          placeholder="Pesquisar por nome da mentoria..."
          className="pl-9"
        />
      </div>

      <Select
        value={filtroStatus}
        onValueChange={(valor) =>
          aoAlterarStatus(valor as FiltroStatus)
        }
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="todos">
            Todos os status
          </SelectItem>

          <SelectItem value="pendente">
            Pendentes
          </SelectItem>

          <SelectItem value="aprovado">
            Aprovadas
          </SelectItem>

          <SelectItem value="recusado">
            Recusadas
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

interface ListaMentoriasProps {
  mentorias: MentoriaAdmin[];
  mentoriaEmAtualizacao: string | null;
  aoAbrirModeracao: (
    mentoria: MentoriaAdmin,
    acao: AcaoModeracao,
  ) => void;
}

function ListaMentorias({
  mentorias,
  mentoriaEmAtualizacao,
  aoAbrirModeracao,
}: ListaMentoriasProps) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
      {mentorias.map((mentoria) => (
        <MentoriaItem
          key={mentoria.id}
          mentoria={mentoria}
          atualizando={
            mentoriaEmAtualizacao === mentoria.id
          }
          aoAbrirModeracao={aoAbrirModeracao}
        />
      ))}
    </div>
  );
}

interface MentoriaItemProps {
  mentoria: MentoriaAdmin;
  atualizando: boolean;
  aoAbrirModeracao: (
    mentoria: MentoriaAdmin,
    acao: AcaoModeracao,
  ) => void;
}

function MentoriaItem({
  mentoria,
  atualizando,
  aoAbrirModeracao,
}: MentoriaItemProps) {
  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate font-medium">
            {mentoria.nome}
          </h2>

          <StatusBadge status={mentoria.status} />
        </div>

        <div className="mt-2 text-xs text-muted-foreground">
          Enviada em {formatarData(mentoria.criadoEm)}
        </div>

        {mentoria.status === "recusado" &&
          mentoria.motivoRecusa && (
            <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
              <span className="font-medium text-destructive">
                Motivo da recusa:
              </span>{" "}
              <span className="text-muted-foreground">
                {mentoria.motivoRecusa}
              </span>
            </div>
          )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button asChild size="sm" variant="outline">
          <Link
            to="/mentorias/$id"
            params={{ id: mentoria.id }}
          >
            <Eye className="mr-2 h-4 w-4" />
            Visualizar
          </Link>
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={() =>
            aoAbrirModeracao(mentoria, "aprovar")
          }
          disabled={
            atualizando ||
            mentoria.status === "aprovado"
          }
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Aprovar
        </Button>

        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() =>
            aoAbrirModeracao(mentoria, "recusar")
          }
          disabled={
            atualizando ||
            mentoria.status === "recusado"
          }
        >
          <XCircle className="mr-2 h-4 w-4" />
          Recusar
        </Button>
      </div>
    </div>
  );
}

interface ModalModeracaoProps {
  moderacao: ModeracaoSelecionada;
  motivoRecusa: string;
  atualizando: boolean;
  aoAlterarMotivo: (valor: string) => void;
  aoFechar: () => void;
  aoConfirmar: () => void;
}

function ModalModeracao({
  moderacao,
  motivoRecusa,
  atualizando,
  aoAlterarMotivo,
  aoFechar,
  aoConfirmar,
}: ModalModeracaoProps) {
  const recusando = moderacao.acao === "recusar";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-mentoria"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          aoFechar();
        }
      }}
    >
      <div className="w-full max-w-lg rounded-xl border border-border bg-background shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2
              id="titulo-modal-mentoria"
              className="font-display text-xl font-semibold"
            >
              {recusando
                ? "Recusar mentoria"
                : "Aprovar mentoria"}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {moderacao.mentoria.nome}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={aoFechar}
            disabled={atualizando}
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {recusando ? (
            <>
              <p className="text-sm text-muted-foreground">
                Informe ao responsável por que a mentoria não
                foi aprovada.
              </p>

              <div className="space-y-2">
                <label
                  htmlFor="motivo-recusa-mentoria"
                  className="text-sm font-medium"
                >
                  Motivo da recusa
                </label>

                <textarea
                  id="motivo-recusa-mentoria"
                  value={motivoRecusa}
                  onChange={(event) =>
                    aoAlterarMotivo(event.target.value)
                  }
                  placeholder="Exemplo: faltam informações sobre a duração e o conteúdo da mentoria."
                  rows={5}
                  maxLength={500}
                  disabled={atualizando}
                  className="flex w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />

                <div className="flex justify-between gap-3 text-xs text-muted-foreground">
                  <span>Mínimo de 5 caracteres.</span>
                  <span>{motivoRecusa.length}/500</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Ao aprovar, a mentoria ficará disponível na
              plataforma. Um motivo de recusa anterior será
              removido.
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={aoFechar}
            disabled={atualizando}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant={recusando ? "destructive" : "default"}
            onClick={aoConfirmar}
            disabled={
              atualizando ||
              (recusando &&
                motivoRecusa.trim().length < 5)
            }
          >
            {atualizando ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : recusando ? (
              <XCircle className="mr-2 h-4 w-4" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}

            {atualizando
              ? "Salvando..."
              : recusando
                ? "Confirmar recusa"
                : "Confirmar aprovação"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: StatusMentoria;
}) {
  if (status === "aprovado") {
    return <Badge>Aprovada</Badge>;
  }

  if (status === "recusado") {
    return (
      <Badge variant="destructive">
        Recusada
      </Badge>
    );
  }

  return <Badge variant="secondary">Pendente</Badge>;
}

function EstadoCarregando() {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border">
      <div className="text-center text-muted-foreground">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />

        <p className="mt-3 text-sm">
          Carregando mentorias...
        </p>
      </div>
    </div>
  );
}

function EstadoVazio({
  titulo,
  descricao,
}: {
  titulo: string;
  descricao: string;
}) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border px-6">
      <div className="text-center">
        <GraduationCap className="mx-auto h-8 w-8 text-muted-foreground" />

        <h2 className="mt-3 font-medium">
          {titulo}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {descricao}
        </p>
      </div>
    </div>
  );
}

function formatarData(valor: string) {
  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "Data indisponível";
  }

  return data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}