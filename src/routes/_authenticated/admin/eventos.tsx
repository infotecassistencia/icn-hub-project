import { createFileRoute, Link } from "@tanstack/react-router";
import { criarNotificacao } from "@/lib/api/notifications";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Eye,
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

export const Route = createFileRoute("/_authenticated/admin/eventos")({
  head: () => ({
    meta: [
      { title: "Eventos — Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EventosAdmin,
});

type StatusEvento = "pendente" | "aprovado" | "recusado";
type FiltroStatus = "todos" | StatusEvento;
type AcaoModeracao = "aprovar" | "recusar";

interface EventoAdmin {
  id: string;
  nome: string;
  ministrante: string;
  local: string;
  estado: string;
  data: string;
  modalidade: "presencial" | "online";
  valor: number;
  status: StatusEvento;
  motivoRecusa: string | null;
  criadoPor: string | null;
  criadoEm: string;
}

interface ModeracaoSelecionada {
  evento: EventoAdmin;
  acao: AcaoModeracao;
}

function EventosAdmin() {
  const [eventos, setEventos] = useState<EventoAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [eventoEmAtualizacao, setEventoEmAtualizacao] =
    useState<string | null>(null);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] =
    useState<FiltroStatus>("todos");

  const [moderacaoSelecionada, setModeracaoSelecionada] =
    useState<ModeracaoSelecionada | null>(null);

  const [motivoRecusa, setMotivoRecusa] = useState("");

  const carregarEventos = useCallback(
    async (carregamentoInicial = true) => {
      if (carregamentoInicial) {
        setCarregando(true);
      } else {
        setAtualizando(true);
      }

      try {
        const { data, error } = await supabase
          .from("eventos")
          .select(`
            id,
            nome,
            ministrante,
            local,
            estado,
            data,
            modalidade,
            valor,
            status,
            motivo_recusa,
            criado_por,
            created_at
          `)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        const eventosMapeados: EventoAdmin[] = (data ?? []).map(
          (evento) => ({
            id: evento.id,
            nome: evento.nome,
            ministrante: evento.ministrante,
            local: evento.local,
            estado: evento.estado,
            data: evento.data,
            modalidade: evento.modalidade,
            valor: Number(evento.valor),
            status: evento.status as StatusEvento,
            motivoRecusa: evento.motivo_recusa,
            criadoPor: evento.criado_por,
            criadoEm: evento.created_at,
          }),
        );

        setEventos(eventosMapeados);
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);

        toast.error("Não foi possível carregar os eventos.", {
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
    void carregarEventos();
  }, [carregarEventos]);

  function abrirModalModeracao(
    evento: EventoAdmin,
    acao: AcaoModeracao,
  ) {
    setModeracaoSelecionada({
      evento,
      acao,
    });

    setMotivoRecusa(
      acao === "recusar"
        ? evento.motivoRecusa ?? ""
        : "",
    );
  }

  function fecharModalModeracao() {
    if (eventoEmAtualizacao) {
      return;
    }

    setModeracaoSelecionada(null);
    setMotivoRecusa("");
  }

  async function confirmarModeracao() {
    if (!moderacaoSelecionada) {
      return;
    }

    const { evento, acao } = moderacaoSelecionada;

    const motivoNormalizado = motivoRecusa.trim();

    if (acao === "recusar" && motivoNormalizado.length < 5) {
      toast.error("Informe o motivo da recusa.", {
        description:
          "O motivo precisa ter pelo menos 5 caracteres.",
      });

      return;
    }

    const novoStatus: StatusEvento =
      acao === "aprovar" ? "aprovado" : "recusado";

    setEventoEmAtualizacao(evento.id);

    try {
      const { data, error } = await supabase
        .from("eventos")
        .update({
          status: novoStatus,
          motivo_recusa:
            novoStatus === "recusado"
              ? motivoNormalizado
              : null,
        })
        .eq("id", evento.id)
        .select("id, status, motivo_recusa")
        .single();

      if (error) {
        throw error;
      }

const { count: eventosPendentes, error: erroContagem } =
  await supabase
    .from("eventos")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("status", "pendente");

if (erroContagem) {
  console.error(
    "Erro ao contar eventos pendentes:",
    erroContagem,
  );
}

if (!erroContagem && (eventosPendentes ?? 0) === 0) {
  const { error: erroLimpeza } = await supabase
    .from("notifications")
    .delete()
    .eq("url_destino", "/admin/eventos");

  if (erroLimpeza) {
    console.error(
      "Erro ao limpar notificações de eventos:",
      erroLimpeza,
    );
  }
}

if (evento.criadoPor) {
  try {
    await criarNotificacao({
      usuarioId: evento.criadoPor,

      titulo:
        novoStatus === "aprovado"
          ? "Evento aprovado"
          : "Evento recusado",

      mensagem:
        novoStatus === "aprovado"
          ? `O evento "${evento.nome}" foi aprovado e já está disponível na plataforma.`
          : `O evento "${evento.nome}" foi recusado. Motivo: ${motivoNormalizado}`,

      tipo:
        novoStatus === "aprovado"
          ? "sucesso"
          : "aviso",

      link: "/meus-eventos",
    });
  } catch (notificationError) {
    console.error(
      "Erro ao criar notificação:",
      notificationError,
    );

    toast.warning(
      "O evento foi atualizado, mas a notificação não pôde ser enviada.",
    );
  }
}

      setEventos((eventosAtuais) =>
        eventosAtuais.map((item) =>
          item.id === data.id
            ? {
                ...item,
                status: data.status as StatusEvento,
                motivoRecusa: data.motivo_recusa,
              }
            : item,
        ),
      );

      toast.success(
        novoStatus === "aprovado"
          ? "Evento aprovado com sucesso."
          : "Evento recusado com sucesso.",
      );

      setModeracaoSelecionada(null);
      setMotivoRecusa("");
    } catch (error) {
      console.error(
        "Erro ao atualizar o status do evento:",
        error,
      );

      toast.error("Não foi possível atualizar o evento.", {
        description:
          error instanceof Error
            ? error.message
            : "Verifique as políticas RLS da tabela eventos.",
      });
    } finally {
      setEventoEmAtualizacao(null);
    }
  }

  const eventosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    return eventos.filter((evento) => {
      const correspondeAoStatus =
        filtroStatus === "todos" ||
        evento.status === filtroStatus;

      if (!correspondeAoStatus) {
        return false;
      }

      if (!termo) {
        return true;
      }

      const conteudoPesquisavel = [
        evento.nome,
        evento.ministrante,
        evento.local,
        evento.estado,
        evento.modalidade,
        evento.motivoRecusa ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      return conteudoPesquisavel.includes(termo);
    });
  }, [busca, eventos, filtroStatus]);

  const totais = useMemo(() => {
    return eventos.reduce(
      (acumulador, evento) => {
        acumulador.total += 1;
        acumulador[evento.status] += 1;

        return acumulador;
      },
      {
        total: 0,
        pendente: 0,
        aprovado: 0,
        recusado: 0,
      },
    );
  }, [eventos]);

  return (
    <>
      <div className="space-y-6">
        <Cabecalho
          atualizando={atualizando}
          aoAtualizar={() => void carregarEventos(false)}
        />

        <ResumoEventos totais={totais} />

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
            ) : eventos.length === 0 ? (
              <EstadoVazio
                titulo="Nenhum evento cadastrado"
                descricao="Os eventos enviados pelos usuários aparecerão aqui."
              />
            ) : eventosFiltrados.length === 0 ? (
              <EstadoVazio
                titulo="Nenhum evento encontrado"
                descricao="Altere os filtros ou o texto pesquisado."
              />
            ) : (
              <ListaEventos
                eventos={eventosFiltrados}
                eventoEmAtualizacao={eventoEmAtualizacao}
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
            eventoEmAtualizacao ===
            moderacaoSelecionada.evento.id
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
          Eventos
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Consulte, aprove ou recuse eventos enviados para
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

interface ResumoEventosProps {
  totais: {
    total: number;
    pendente: number;
    aprovado: number;
    recusado: number;
  };
}

function ResumoEventos({
  totais,
}: ResumoEventosProps) {
  const itens = [
    { titulo: "Total", valor: totais.total },
    { titulo: "Pendentes", valor: totais.pendente },
    { titulo: "Aprovados", valor: totais.aprovado },
    { titulo: "Recusados", valor: totais.recusado },
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
          placeholder="Pesquisar por nome, ministrante ou local..."
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
            Aprovados
          </SelectItem>

          <SelectItem value="recusado">
            Recusados
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

interface ListaEventosProps {
  eventos: EventoAdmin[];
  eventoEmAtualizacao: string | null;
  aoAbrirModeracao: (
    evento: EventoAdmin,
    acao: AcaoModeracao,
  ) => void;
}

function ListaEventos({
  eventos,
  eventoEmAtualizacao,
  aoAbrirModeracao,
}: ListaEventosProps) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
      {eventos.map((evento) => (
        <EventoItem
          key={evento.id}
          evento={evento}
          atualizando={
            eventoEmAtualizacao === evento.id
          }
          aoAbrirModeracao={aoAbrirModeracao}
        />
      ))}
    </div>
  );
}

interface EventoItemProps {
  evento: EventoAdmin;
  atualizando: boolean;
  aoAbrirModeracao: (
    evento: EventoAdmin,
    acao: AcaoModeracao,
  ) => void;
}

function EventoItem({
  evento,
  atualizando,
  aoAbrirModeracao,
}: EventoItemProps) {
  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate font-medium">
            {evento.nome}
          </h2>

          <StatusBadge status={evento.status} />

          <Badge variant="outline" className="capitalize">
            {evento.modalidade}
          </Badge>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Ministrado por {evento.ministrante}
        </p>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Evento: {formatarData(evento.data)}
          </span>

          <span>
            Local: {evento.local} · {evento.estado}
          </span>

          <span>Valor: {formatarValor(evento.valor)}</span>

          <span>
            Enviado em: {formatarData(evento.criadoEm)}
          </span>
        </div>

        {evento.status === "recusado" &&
          evento.motivoRecusa && (
            <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
              <span className="font-medium text-destructive">
                Motivo da recusa:
              </span>{" "}
              <span className="text-muted-foreground">
                {evento.motivoRecusa}
              </span>
            </div>
          )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button asChild size="sm" variant="outline">
          <Link
            to="/eventos/$id"
            params={{ id: evento.id }}
          >
            <Eye className="mr-2 h-4 w-4" />
            Visualizar
          </Link>
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={() =>
            aoAbrirModeracao(evento, "aprovar")
          }
          disabled={
            atualizando || evento.status === "aprovado"
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
            aoAbrirModeracao(evento, "recusar")
          }
          disabled={
            atualizando || evento.status === "recusado"
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
      aria-labelledby="titulo-modal-moderacao"
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
              id="titulo-modal-moderacao"
              className="font-display text-xl font-semibold"
            >
              {recusando
                ? "Recusar evento"
                : "Aprovar evento"}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {moderacao.evento.nome}
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
                Informe ao organizador por que o evento não foi
                aprovado. O motivo ficará visível em Meus envios.
              </p>

              <div className="space-y-2">
                <label
                  htmlFor="motivo-recusa"
                  className="text-sm font-medium"
                >
                  Motivo da recusa
                </label>

                <textarea
                  id="motivo-recusa"
                  value={motivoRecusa}
                  onChange={(event) =>
                    aoAlterarMotivo(event.target.value)
                  }
                  placeholder="Exemplo: faltam informações sobre o local e o horário do evento."
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
              Ao aprovar, o evento ficará disponível nas áreas
              públicas do sistema. Qualquer motivo de recusa
              anterior será removido.
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
  status: StatusEvento;
}) {
  if (status === "aprovado") {
    return <Badge>Aprovado</Badge>;
  }

  if (status === "recusado") {
    return (
      <Badge variant="destructive">
        Recusado
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
          Carregando eventos...
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
        <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />

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

function formatarValor(valor: number) {
  if (valor === 0) {
    return "Gratuito";
  }

  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}