import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Clock, User2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { fetchMentoriaById } from "@/lib/api/catalog";
import { areaLabel } from "@/lib/constants";

export const Route = createFileRoute("/mentorias/$id")({
  loader: async ({ params }) => {
    const mentoria = await fetchMentoriaById(params.id);
    if (!mentoria) throw notFound();
    return { mentoria };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.mentoria.nome} — ICN Hub` },
          { name: "description", content: loaderData.mentoria.resumo },
          { property: "og:title", content: loaderData.mentoria.nome },
          { property: "og:description", content: loaderData.mentoria.resumo },
          { property: "og:image", content: loaderData.mentoria.bannerUrl },
        ]
      : [{ title: "Mentoria não encontrada — ICN Hub" }, { name: "robots", content: "noindex" }],
  }),
  component: MentoriaDetalhe,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Mentoria não encontrada</h1>
        <Button asChild className="mt-6"><Link to="/mentorias">Ver todas as mentorias</Link></Button>
      </div>
    </SiteLayout>
  ),
  errorComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Erro ao carregar a mentoria</h1>
      </div>
    </SiteLayout>
  ),
});

function MentoriaDetalhe() {
  const { mentoria } = Route.useLoaderData();
  const gratuito = mentoria.valor === 0;
  const data = new Date(mentoria.data);

  return (
    <SiteLayout>
      <div
        className="h-64 w-full bg-secondary bg-cover bg-center md:h-96"
        style={{ backgroundImage: `url(${mentoria.bannerUrl})` }}
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link to="/mentorias" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar para mentorias
        </Link>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize">{mentoria.modalidade}</Badge>
          <Badge className={gratuito ? "bg-accent text-accent-foreground" : "bg-primary"}>
            {gratuito ? "Gratuito" : `R$ ${mentoria.valor.toLocaleString("pt-BR")}`}
          </Badge>
          <Badge variant="outline">{areaLabel(mentoria.area)}</Badge>
        </div>

        <h1 className="mt-4 font-display text-3xl font-semibold md:text-5xl">{mentoria.nome}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{mentoria.resumo}</p>

        <div className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-card md:grid-cols-2">
          <Info icon={<CalendarDays />} label="Início" value={data.toLocaleString("pt-BR")} />
          <Info icon={<Clock />} label="Duração" value={mentoria.duracao} />
          <Info icon={<MapPin />} label="Local" value={`${mentoria.local} · ${mentoria.estado}`} />
          <Info
            icon={<User2 />}
            label="Ministrado por"
            value={
              mentoria.mentorSlug ? (
                <Link
                  to="/mentores/$slug"
                  params={{ slug: mentoria.mentorSlug }}
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

        <div className="mt-10 rounded-2xl bg-gradient-primary p-8 text-primary-foreground">
          <h3 className="font-display text-xl font-semibold">Quer participar?</h3>
          <p className="mt-1 text-sm text-primary-foreground/80">
            Entre na sua conta para acompanhar novidades e reservar sua vaga.
          </p>
          <Button asChild variant="secondary" className="mt-4">
            <Link to="/auth">Entrar</Link>
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
