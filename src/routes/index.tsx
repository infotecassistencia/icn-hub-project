import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Sparkles,
  Filter,
  GraduationCap,
  Megaphone,
  Compass,
  MousePointerClick,
  Users,
  CheckCircle2,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { EventCard } from "@/components/events/EventCard";
import { MOCK_EVENTOS, MOCK_MENTORIAS } from "@/lib/mock-data";
import { areaLabel } from "@/lib/constants";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const eventosDestaque = MOCK_EVENTOS.slice(0, 3);
  const mentoriasDestaque = MOCK_MENTORIAS.slice(0, 3);
  const heroPreview = MOCK_EVENTOS.slice(0, 3);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="pointer-events-none absolute inset-0 bg-grid-soft opacity-70" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-[26rem] w-[26rem] rounded-full bg-accent/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <Badge variant="secondary" className="mb-5 gap-1.5 border border-primary/15">
              <Sparkles className="h-3.5 w-3.5" /> Plataforma da nutrição
            </Badge>
            <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.05] md:text-6xl">
              Ponto de encontro entre <span className="text-primary">teoria</span>,{" "}
              <span className="text-primary">prática</span> e{" "}
              <span className="text-primary">carreira</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Cursos, congressos, mentorias e eventos da nutrição em todo o Brasil —
              reunidos em um só lugar, com filtros pensados para a sua trajetória.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-soft">
                <Link to="/eventos">
                  Encontrar meu próximo evento <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/eventos/novo">Divulgar evento</Link>
              </Button>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-border/60 pt-6">
              <HeroStat value={`${MOCK_EVENTOS.length}+`} label="Eventos ativos" />
              <HeroStat value={`${MOCK_MENTORIAS.length}+`} label="Mentorias" />
              <HeroStat value="Brasil" label="Cobertura nacional" />
            </dl>
          </div>

          {/* Preview card — dá densidade e mostra o produto */}
          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-primary/30 blur-2xl" />
            <div className="relative rounded-3xl border border-border/70 bg-card/90 p-4 shadow-elevated backdrop-blur">
              <div className="flex items-center justify-between px-2 pb-3 pt-1">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                  <div className="h-2.5 w-2.5 rounded-full bg-primary/70" />
                </div>
                <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  Próximos eventos
                </span>
              </div>
              <ul className="space-y-2">
                {heroPreview.map((e) => {
                  const gratuito = e.valor === 0;
                  return (
                    <li
                      key={e.id}
                      className="group flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 p-3 transition-colors hover:border-primary/40 hover:bg-background"
                    >
                      <div
                        className="h-14 w-14 flex-none rounded-lg bg-secondary bg-cover bg-center"
                        style={{ backgroundImage: `url(${e.bannerUrl})` }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                            {areaLabel(e.area)}
                          </span>
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                              gratuito
                                ? "bg-accent text-accent-foreground"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {gratuito ? "Grátis" : `R$ ${e.valor.toLocaleString("pt-BR")}`}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-sm font-medium">{e.nome}</p>
                        <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {new Date(e.data).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {e.estado}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PILARES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
        <div className="mb-10 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Por que ICN Hub
          </p>
          <h2 className="mt-1 font-display text-3xl font-semibold md:text-4xl">
            A plataforma feita para a comunidade da nutrição
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <Pillar
            icon={<Filter />}
            tag="Busca inteligente"
            title="Encontre seu próximo evento"
            text="Filtre por online ou presencial, gratuito ou pago, área da nutrição, mentoria, workshop, congresso e muito mais."
          />
          <Pillar
            icon={<GraduationCap />}
            tag="Atualização constante"
            title="Formação contínua"
            text="Acompanhe oportunidades de educação continuada para diferentes fases da carreira em nutrição."
          />
          <Pillar
            icon={<Megaphone />}
            tag="Para organizadores"
            title="Divulgue seu evento"
            text="Instituições, professores e organizadores alcançam uma comunidade qualificada de nutricionistas e estudantes."
          />
        </div>
      </section>

      {/* EVENTOS DESTAQUE */}
      <section className="border-y border-border/60 bg-secondary/40 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Em alta
              </p>
              <h2 className="mt-1 font-display text-3xl font-semibold md:text-4xl">
                Eventos em destaque
              </h2>
              <p className="mt-2 text-muted-foreground">
                Selecionados para o próximo passo da sua carreira.
              </p>
            </div>
            <Button asChild variant="ghost" className="group">
              <Link to="/eventos">
                Ver todos{" "}
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {eventosDestaque.map((e) => (
              <EventCard key={e.id} item={e} basePath="/eventos" />
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Fluxo
          </p>
          <h2 className="mt-1 font-display text-3xl font-semibold md:text-4xl">
            Como funciona
          </h2>
          <p className="mt-3 text-muted-foreground">
            Três passos para conectar você às oportunidades certas.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Step n="1" icon={<Compass />} title="Explore"
            text="Use os filtros inteligentes para encontrar eventos alinhados aos seus objetivos." />
          <Step n="2" icon={<MousePointerClick />} title="Escolha"
            text="Compare formatos, datas, áreas e investimento em poucos cliques." />
          <Step n="3" icon={<Users />} title="Conecte-se"
            text="Participe de experiências que aproximam teoria, prática e oportunidades de carreira." />
        </div>
      </section>

      {/* MENTORIAS */}
      <section className="bg-gradient-hero py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Mentorias
              </p>
              <h2 className="mt-1 font-display text-3xl font-semibold md:text-4xl">
                Aprenda com quem já trilhou o caminho
              </h2>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/mentorias">Ver mentorias</Link>
              </Button>
              <Button asChild>
                <Link to="/mentorias/nova">Anunciar mentoria</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mentoriasDestaque.map((m) => (
              <EventCard key={m.id} item={m} basePath="/mentorias" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-8 text-primary-foreground shadow-elevated md:p-14">
          <div className="pointer-events-none absolute inset-0 bg-grid-soft opacity-20" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="font-display text-3xl font-semibold leading-tight md:text-4xl">
                Um só lugar para aprender, conectar e evoluir.
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Descubra eventos que fazem sentido para a sua trajetória e encontre o próximo
                passo da sua carreira em nutrição.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/auth" search={{ tab: "cadastro" }}>Criar minha conta</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link to="/sobre">Conhecer o ICN Hub</Link>
                </Button>
              </div>
            </div>
            <ul className="grid gap-2.5 text-sm">
              {[
                "Cursos e capacitações",
                "Congressos e jornadas científicas",
                "Mentorias e programas de desenvolvimento",
                "Eventos presenciais e online",
                "Oportunidades gratuitas e pagas",
                "Segmentado por área da nutrição",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 rounded-lg px-1 py-0.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-display text-2xl font-semibold text-foreground md:text-3xl">{value}</dt>
      <dd className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">{label}</dd>
    </div>
  );
}

function Pillar({ icon, tag, title, text }: { icon: React.ReactNode; tag: string; title: string; text: string }) {
  return (
    <div className="group relative rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">{tag}</div>
      <h3 className="mt-1 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function Step({ n, icon, title, text }: { n: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-6 pt-8 shadow-card">
      <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary font-display text-sm font-semibold text-primary-foreground shadow-soft">
        {n}
      </div>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/40 text-accent-foreground">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
