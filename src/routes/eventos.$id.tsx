import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Clock, User2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { fetchEventoById } from "@/lib/api/catalog";
import { areaLabel, tipoEventoLabel } from "@/lib/constants";

export const Route = createFileRoute("/eventos/$id")({
  loader: async ({ params }) => {
    const evento = await fetchEventoById(params.id);
    if (!evento) throw notFound();
    return { evento };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.evento.nome} — ICN Hub` },
          { name: "description", content: loaderData.evento.resumo },
          { property: "og:title", content: loaderData.evento.nome },
          { property: "og:description", content: loaderData.evento.resumo },
          { property: "og:image", content: loaderData.evento.bannerUrl },
        ]
      : [{ title: "Evento não encontrado — ICN Hub" }, { name: "robots", content: "noindex" }],
  }),
  component: EventoDetalhe,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Evento não encontrado</h1>
        <Button asChild className="mt-6"><Link to="/eventos">Ver todos os eventos</Link></Button>
      </div>
    </SiteLayout>
  ),
  errorComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Erro ao carregar o evento</h1>
      </div>
    </SiteLayout>
  ),
});

function EventoDetalhe() {
  const { evento } = Route.useLoaderData();
  const gratuito = evento.valor === 0;
  const data = new Date(evento.data);

  return (
    <SiteLayout>
      <div
        className="h-64 w-full bg-secondary bg-cover bg-center md:h-96"
        style={{ backgroundImage: `url(${evento.bannerUrl})` }}
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link to="/eventos" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar para eventos
        </Link>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize">{evento.modalidade}</Badge>
          <Badge className={gratuito ? "bg-accent text-accent-foreground" : "bg-primary"}>
            {gratuito ? "Gratuito" : `R$ ${evento.valor.toLocaleString("pt-BR")}`}
          </Badge>
          <Badge variant="outline">{areaLabel(evento.area)}</Badge>
          <Badge variant="outline">{tipoEventoLabel(evento.tipo)}</Badge>
        </div>

        <h1 className="mt-4 font-display text-3xl font-semibold md:text-5xl">{evento.nome}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{evento.resumo}</p>

        <div className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-card md:grid-cols-2">
          <Info icon={<CalendarDays />} label="Data" value={data.toLocaleString("pt-BR")} />
          <Info icon={<Clock />} label="Duração" value={evento.duracao} />
          <Info icon={<MapPin />} label="Local" value={`${evento.local} · ${evento.estado}`} />
          <Info
            icon={<User2 />}
            label="Ministrado por"
            value={
              evento.mentorSlug ? (
                <Link
                  to="/mentores/$slug"
                  params={{ slug: evento.mentorSlug }}
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
            <h2 className="font-display text-2xl font-semibold">Sobre o evento</h2>
            <p className="text-muted-foreground">{evento.descricao}</p>
          </div>
        )}

        <div className="mt-10 rounded-2xl bg-gradient-primary p-8 text-primary-foreground">
          <h3 className="font-display text-xl font-semibold">Interessou?</h3>
          <p className="mt-1 text-sm text-primary-foreground/80">
            Salve na sua conta para receber lembretes e novidades sobre este evento.
          </p>
          <Button asChild variant="secondary" className="mt-4">
            <Link to="/auth">Entrar para salvar</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
