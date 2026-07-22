import { useEffect, useState } from "react";
import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute(
  "/_authenticated/meus-eventos",
)({
  head: () => ({
    meta: [
      {
        title: "Meus envios — ICN Hub",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),

  component: MeusEventos,
});

type StatusEnvio =
  | "pendente"
  | "aprovado"
  | "recusado";

interface Envio {
  id: string;
  nome: string;
  tipo: "evento" | "mentoria";
  status: StatusEnvio;
  criadoEm: string;
  motivoRecusa: string | null;
}

function MeusEventos() {
  const {
    userId,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const [envios, setEnvios] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarEnvios() {
      if (authLoading) {
        return;
      }

      if (!isAuthenticated || !userId) {
        if (componenteAtivo) {
          setEnvios([]);
          setLoading(false);
        }

        return;
      }

      setLoading(true);

      try {
        const [
          resultadoEventos,
          resultadoMentorias,
        ] = await Promise.all([
          supabase
            .from("eventos")
            .select(
              `
                id,
                nome,
                status,
                motivo_recusa,
                created_at
              `,
            )
            .eq("criado_por", userId),

          supabase
            .from("mentorias")
            .select(
              `
                id,
                nome,
                status,
                created_at
              `,
            )
            .eq("criado_por", userId),
        ]);

        if (resultadoEventos.error) {
          throw resultadoEventos.error;
        }

        if (resultadoMentorias.error) {
          throw resultadoMentorias.error;
        }

        const eventos: Envio[] = (
          resultadoEventos.data ?? []
        ).map((evento) => ({
          id: evento.id,
          nome: evento.nome,
          tipo: "evento",
          status: evento.status as StatusEnvio,
          criadoEm: evento.created_at,
          motivoRecusa: evento.motivo_recusa,
        }));

        const mentorias: Envio[] = (
          resultadoMentorias.data ?? []
        ).map((mentoria) => ({
          id: mentoria.id,
          nome: mentoria.nome,
          tipo: "mentoria",
          status: mentoria.status as StatusEnvio,
          criadoEm: mentoria.created_at,
          motivoRecusa: null,
        }));

        const todosOsEnvios = [
          ...eventos,
          ...mentorias,
        ].sort(
          (primeiro, segundo) =>
            new Date(segundo.criadoEm).getTime() -
            new Date(primeiro.criadoEm).getTime(),
        );

        if (componenteAtivo) {
          setEnvios(todosOsEnvios);
        }
      } catch (error) {
        console.error(
          "Erro ao carregar os envios:",
          error,
        );

        if (componenteAtivo) {
          setEnvios([]);

          toast.error(
            "Não foi possível carregar seus envios.",
            {
              description:
                error instanceof Error
                  ? error.message
                  : "Ocorreu um erro desconhecido.",
            },
          );
        }
      } finally {
        if (componenteAtivo) {
          setLoading(false);
        }
      }
    }

    void carregarEnvios();

    return () => {
      componenteAtivo = false;
    };
  }, [
    authLoading,
    isAuthenticated,
    userId,
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">
            Meus envios
          </h1>

          <p className="mt-1 text-muted-foreground">
            Acompanhe o status de validação dos eventos e
            mentorias que você enviou.
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/eventos/novo">
              Novo evento
            </Link>
          </Button>

          <Button asChild>
            <Link to="/mentorias/nova">
              Nova mentoria
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {loading ? (
          <Card className="shadow-card">
            <CardContent className="p-10 text-center text-muted-foreground">
              Carregando seus envios...
            </CardContent>
          </Card>
        ) : envios.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-10 text-center text-muted-foreground">
              Você ainda não enviou nenhum evento ou
              mentoria.
            </CardContent>
          </Card>
        ) : (
          envios.map((envio) => (
            <EnvioCard
              key={`${envio.tipo}-${envio.id}`}
              envio={envio}
            />
          ))
        )}
      </div>
    </div>
  );
}

function EnvioCard({
  envio,
}: {
  envio: Envio;
}) {
  const conteudo = (
    <CardContent className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-medium">
            {envio.nome}
          </div>

          <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
            {envio.tipo === "evento"
              ? "Evento"
              : "Mentoria"}
          </div>

          <div className="mt-1 text-xs text-muted-foreground">
            Enviado em {formatarData(envio.criadoEm)}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={envio.status} />

          {envio.status === "aprovado" && (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              Ver detalhes
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>

{envio.status === "recusado" &&
  envio.tipo === "evento" && (
    <div className="flex justify-end">
      <Button asChild>
        <Link
          to="/eventos/editar/$id"
          params={{
            id: envio.id,
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Editar e reenviar
        </Link>
      </Button>
    </div>
  )}

      {envio.status === "recusado" &&
        envio.motivoRecusa && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

              <div>
                <div className="text-sm font-medium text-destructive">
                  Motivo da recusa
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  {envio.motivoRecusa}
                </p>
              </div>
            </div>
          </div>
        )}
    </CardContent>
  );

  if (envio.status !== "aprovado") {
    return (
      <Card className="shadow-card">
        {conteudo}
      </Card>
    );
  }

  if (envio.tipo === "evento") {
    return (
      <Link
        to="/eventos/$id"
        params={{
          id: envio.id,
        }}
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Card className="shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
          {conteudo}
        </Card>
      </Link>
    );
  }

  return (
    <Link
      to="/mentorias/$id"
      params={{
        id: envio.id,
      }}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
        {conteudo}
      </Card>
    </Link>
  );
}

function StatusBadge({
  status,
}: {
  status: StatusEnvio;
}) {
  if (status === "aprovado") {
    return (
      <Badge variant="default">
        Aprovado
      </Badge>
    );
  }

  if (status === "recusado") {
    return (
      <Badge variant="destructive">
        Recusado
      </Badge>
    );
  }

  return (
    <Badge variant="secondary">
      Pendente
    </Badge>
  );
}

function formatarData(data: string): string {
  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return "data não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(dataConvertida);
}