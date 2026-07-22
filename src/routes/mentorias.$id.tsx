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
import { fetchMentoriaById } from "@/lib/api/catalog";
import { areaLabel } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/mentorias/$id")({
  loader: async ({ params }) => {
    const mentoria = await fetchMentoriaById(params.id);

    if (!mentoria) {
      throw notFound();
    }

    return { mentoria };
  },

  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          {
            title: `${loaderData.mentoria.nome} — ICN Hub`,
          },
          {
            name: "description",
            content: loaderData.mentoria.resumo,
          },
          {
            property: "og:title",
            content: loaderData.mentoria.nome,
          },
          {
            property: "og:description",
            content: loaderData.mentoria.resumo,
          },
          {
            property: "og:image",
            content: loaderData.mentoria.bannerUrl,
          },
        ]
      : [
          {
            title: "Mentoria não encontrada — ICN Hub",
          },
          {
            name: "robots",
            content: "noindex",
          },
        ],
  }),

  component: MentoriaDetalhe,

  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">
          Mentoria não encontrada
        </h1>

        <Button asChild className="mt-6">
          <Link to="/mentorias">
            Ver todas as mentorias
          </Link>
        </Button>
      </div>
    </SiteLayout>
  ),

  errorComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">
          Erro ao carregar a mentoria
        </h1>
      </div>
    </SiteLayout>
  ),
});

function MentoriaDetalhe() {
  const { mentoria } = Route.useLoaderData();

  const {
    userId,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const gratuito = mentoria.valor === 0;
  const data = new Date(mentoria.data);

  const usuarioEhCriador =
    Boolean(userId) && mentoria.criadoPor === userId;

  return (
    <SiteLayout>
      <div
        className="h-64 w-full bg-secondary bg-cover bg-center md:h-96"
        style={{
          backgroundImage: `url(${mentoria.bannerUrl})`,
        }}
      />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          to="/mentorias"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para mentorias
        </Link>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="capitalize"
          >
            {mentoria.modalidade}
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
              : formatarValor(mentoria.valor)}
          </Badge>

          <Badge variant="outline">
            {areaLabel(mentoria.area)}
          </Badge>
        </div>

        <h1 className="mt-4 font-display text-3xl font-semibold md:text-5xl">
          {mentoria.nome}
        </h1>

        <p className="mt-3 text-lg text-muted-foreground">
          {mentoria.resumo}
        </p>

        <div className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-card md:grid-cols-2">
          <Info
            icon={<CalendarDays />}
            label="Início"
            value={data.toLocaleString("pt-BR")}
          />

          <Info
            icon={<Clock />}
            label="Duração"
            value={mentoria.duracao}
          />

          <Info
            icon={<MapPin />}
            label="Local"
            value={`${mentoria.local} · ${mentoria.estado}`}
          />

          <Info
            icon={<User2 />}
            label="Ministrado por"
            value={
              mentoria.mentorSlug ? (
                <Link
                  to="/mentores/$slug"
                  params={{
                    slug: mentoria.mentorSlug,
                  }}
                  className="text-primary hover:underline"
                >
                  {mentoria.ministrante}
                </Link>
              ) : (
                mentoria.ministrante
              )
            }
          />
        </div>

        {mentoria.descricao && (
          <div className="prose prose-neutral mt-8 max-w-none">
            <h2 className="font-display text-2xl font-semibold">
              Sobre a mentoria
            </h2>

            <p className="whitespace-pre-line text-muted-foreground">
              {mentoria.descricao}
            </p>
          </div>
        )}

        <MentoriaCallToAction
          mentoriaId={mentoria.id}
          valor={mentoria.valor}
          isAuthenticated={isAuthenticated}
          authLoading={authLoading}
          usuarioEhCriador={usuarioEhCriador}
        />
      </div>
    </SiteLayout>
  );
}

function MentoriaCallToAction({
  mentoriaId,
  valor,
  isAuthenticated,
  authLoading,
  usuarioEhCriador,
}: {
  mentoriaId: string;
  valor: number;
  isAuthenticated: boolean;
  authLoading: boolean;
  usuarioEhCriador: boolean;
}) {
  if (authLoading) {
    return (
      <CallToActionContainer
        titulo="Quer participar?"
        descricao="Verificando sua conta..."
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <CallToActionContainer
        titulo="Quer participar?"
        descricao="Entre na sua conta para comprar ou reservar sua vaga."
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
        titulo="Esta mentoria foi criada por você"
        descricao="Acompanhe a aprovação e os detalhes da sua mentoria na área de meus envios."
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
        descricao="Esta mentoria é gratuita. A inscrição será liberada quando o sistema de vagas estiver configurado."
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
      titulo="Garanta sua vaga"
      descricao={`Adquira sua vaga nesta mentoria por ${formatarValor(
        valor,
      )}.`}
    >
      <Button
        type="button"
        variant="secondary"
        className="mt-4"
        disabled
        data-mentoria-id={mentoriaId}
      >
        <Ticket className="mr-2 h-4 w-4" />
        Comprar vaga — {formatarValor(valor)}
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