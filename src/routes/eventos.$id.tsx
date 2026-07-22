import {
  createFileRoute,
  notFound,
  Link,
} from "@tanstack/react-router";
import {
  CalendarDays,
  MapPin,
  Clock,
  User2,
  ArrowLeft,
  Ticket,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { fetchEventoById } from "@/lib/api/catalog";
import {
  areaLabel,
  tipoEventoLabel,
} from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/eventos/$id")({
  loader: async ({ params }) => {
    const evento = await fetchEventoById(params.id);

    if (!evento) {
      throw notFound();
    }

    return { evento };
  },

  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          {
            title: `${loaderData.evento.nome} — ICN Hub`,
          },
          {
            name: "description",
            content: loaderData.evento.resumo,
          },
          {
            property: "og:title",
            content: loaderData.evento.nome,
          },
          {
            property: "og:description",
            content: loaderData.evento.resumo,
          },
          {
            property: "og:image",
            content: loaderData.evento.bannerUrl,
          },
        ]
      : [
          {
            title: "Evento não encontrado — ICN Hub",
          },
          {
            name: "robots",
            content: "noindex",
          },
        ],
  }),

  component: EventoDetalhe,

  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">
          Evento não encontrado
        </h1>

        <Button asChild className="mt-6">
          <Link to="/eventos">
            Ver todos os eventos
          </Link>
        </Button>
      </div>
    </SiteLayout>
  ),

  errorComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">
          Erro ao carregar o evento
        </h1>
      </div>
    </SiteLayout>
  ),
});

function EventoDetalhe() {
  const { evento } = Route.useLoaderData();

  const {
    userId,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const gratuito = evento.valor === 0;
  const data = new Date(evento.data);

  const usuarioEhCriador =
    Boolean(userId) && evento.criadoPor === userId;

  return (
    <SiteLayout>
      <div
        className="h-64 w-full bg-secondary bg-cover bg-center md:h-96"
        style={{
          backgroundImage: `url(${evento.bannerUrl})`,
        }}
      />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          to="/eventos"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para eventos
        </Link>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="capitalize"
          >
            {evento.modalidade}
          </Badge>

          <Badge
            className={
              gratuito
                ? "bg-accent text-accent-foreground"
                : "bg-primary"
            }
          >
            {gratuito
              ? "Gratuito"
              : formatarValor(evento.valor)}
          </Badge>

          <Badge variant="outline">
            {areaLabel(evento.area)}
          </Badge>

          <Badge variant="outline">
            {tipoEventoLabel(evento.tipo)}
          </Badge>
        </div>

        <h1 className="mt-4 font-display text-3xl font-semibold md:text-5xl">
          {evento.nome}
        </h1>

        <p className="mt-3 text-lg text-muted-foreground">
          {evento.resumo}
        </p>

        <div className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-card md:grid-cols-2">
          <Info
            icon={<CalendarDays />}
            label="Data"
            value={data.toLocaleString("pt-BR")}
          />

          <Info
            icon={<Clock />}
            label="Duração"
            value={evento.duracao}
          />

          <Info
            icon={<MapPin />}
            label="Local"
            value={`${evento.local} · ${evento.estado}`}
          />

          <Info
            icon={<User2 />}
            label="Ministrado por"
            value={
              evento.mentorSlug ? (
                <Link
                  to="/mentores/$slug"
                  params={{
                    slug: evento.mentorSlug,
                  }}
                  className="text-primary hover:underline"
                >
                  {evento.ministrante}
                </Link>
              ) : (
                evento.ministrante
              )
            }
          />
        </div>

        {evento.descricao && (
          <div className="prose prose-neutral mt-8 max-w-none">
            <h2 className="font-display text-2xl font-semibold">
              Sobre o evento
            </h2>

            <p className="whitespace-pre-line text-muted-foreground">
              {evento.descricao}
            </p>
          </div>
        )}

        <EventoCallToAction
          eventoId={evento.id}
          valor={evento.valor}
          isAuthenticated={isAuthenticated}
          authLoading={authLoading}
          usuarioEhCriador={usuarioEhCriador}
        />
      </div>
    </SiteLayout>
  );
}

function EventoCallToAction({
  eventoId,
  valor,
  isAuthenticated,
  authLoading,
  usuarioEhCriador,
}: {
  eventoId: string;
  valor: number;
  isAuthenticated: boolean;
  authLoading: boolean;
  usuarioEhCriador: boolean;
}) {
  if (authLoading) {
    return (
      <CallToActionContainer
        titulo="Interessou?"
        descricao="Verificando sua conta..."
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <CallToActionContainer
        titulo="Interessou?"
        descricao="Entre na sua conta para comprar ou reservar seu ingresso."
      >
        <Button
          asChild
          variant="secondary"
          className="mt-4"
        >
          <Link
            to="/auth"
            search={{
              tab: "login",
            }}
          >
            Entrar para continuar
          </Link>
        </Button>
      </CallToActionContainer>
    );
  }

  if (usuarioEhCriador) {
    return (
      <CallToActionContainer
        titulo="Este evento foi criado por você"
        descricao="Acompanhe a aprovação e os detalhes do seu evento na área de meus envios."
      >
        <Button
          asChild
          variant="secondary"
          className="mt-4"
        >
          <Link to="/meus-eventos">
            Ver meus envios
          </Link>
        </Button>
      </CallToActionContainer>
    );
  }

  if (valor === 0) {
    return (
      <CallToActionContainer
        titulo="Inscrição gratuita"
        descricao="Este evento é gratuito. A inscrição será liberada quando o sistema de ingressos estiver configurado."
      >
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          disabled
        >
          <Ticket className="mr-2 h-4 w-4" />
          Inscrição em breve
        </Button>
      </CallToActionContainer>
    );
  }

  return (
    <CallToActionContainer
      titulo="Garanta seu ingresso"
      descricao={`Adquira seu ingresso para este evento por ${formatarValor(
        valor,
      )}.`}
    >
      <Button
        type="button"
        variant="secondary"
        className="mt-4"
        disabled
        data-evento-id={eventoId}
      >
        <Ticket className="mr-2 h-4 w-4" />
        Comprar ingresso — {formatarValor(valor)}
      </Button>

      <p className="mt-3 text-xs text-primary-foreground/75">
        O botão será habilitado após a configuração segura do
        checkout.
      </p>
    </CallToActionContainer>
  );
}

function CallToActionContainer({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mt-10 rounded-2xl bg-gradient-primary p-8 text-primary-foreground">
      <h3 className="font-display text-xl font-semibold">
        {titulo}
      </h3>

      <p className="mt-1 text-sm text-primary-foreground/80">
        {descricao}
      </p>

      {children}
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </div>

        <div className="text-sm font-medium">
          {value}
        </div>
      </div>
    </div>
  );
}

function formatarValor(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}