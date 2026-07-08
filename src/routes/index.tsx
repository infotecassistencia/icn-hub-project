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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { EventCard } from "@/components/events/EventCard";
import { MOCK_EVENTOS, MOCK_MENTORIAS } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const eventosDestaque = MOCK_EVENTOS.slice(0, 3);
  const mentoriasDestaque = MOCK_MENTORIAS.slice(0, 3);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <Badge variant="secondary" className="mb-5 gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Novidade · Plataforma da nutrição
          </Badge>
          <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight md:text-6xl">
            Ponto de encontro entre <span className="text-primary">teoria</span>,{" "}
            <span className="text-primary">prática</span> e <span className="text-primary">carreira</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            O ICN Hub reúne, em um só lugar, os principais cursos, encontros, congressos,
            mentorias e eventos da nutrição em todo o Brasil.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/eventos">
                Encontrar meu próximo evento <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/eventos/novo">Divulgar evento</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* PILARES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
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
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">Eventos em destaque</h2>
              <p className="mt-2 text-muted-foreground">Selecionados para o próximo passo da sua carreira.</p>
            </div>
            <Button asChild variant="ghost">
              <Link to="/eventos">Ver todos <ArrowRight className="ml-1 h-4 w-4" /></Link>
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
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">Como funciona</h2>
          <p className="mt-3 text-muted-foreground">
            Três passos para conectar você às oportunidades certas.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Step n="1" icon={<Compass />} title="Explore"
            text="Use os filtros inteligentes para encontrar eventos alinhados aos seus objetivos." />
          <Step n="2" icon={<MousePointerClick />} title="Escolha"
            text="Compare formatos, datas, áreas e investimento em poucos cliques." />
          <Step n="3" icon={<Users />} title="Conecte-se"
            text="Participe de experiências que aproximam teoria, prática e oportunidades de carreira." />
        </div>
      </section>

      {/* MENTORIAS */}
      <section className="bg-gradient-hero py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <Badge variant="outline" className="mb-2">Mentorias</Badge>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                Aprenda com quem já trilhou o caminho
              </h2>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline"><Link to="/mentorias">Ver mentorias</Link></Button>
              <Button asChild><Link to="/mentorias/nova">Anunciar mentoria</Link></Button>
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
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="rounded-3xl bg-gradient-primary p-10 text-primary-foreground shadow-soft md:p-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                Um só lugar para aprender, conectar e evoluir.
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Descubra eventos que fazem sentido para a sua trajetória e encontre o próximo passo
                da sua carreira em nutrição.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/auth" search={{ tab: "cadastro" }}>Criar minha conta</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/sobre">Conhecer o ICN Hub</Link>
                </Button>
              </div>
            </div>
            <ul className="grid gap-3 text-sm">
              {[
                "Cursos e capacitações",
                "Congressos e jornadas científicas",
                "Mentorias e programas de desenvolvimento",
                "Eventos presenciais e online",
                "Oportunidades gratuitas e pagas",
                "Segmentado por área da nutrição",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
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

function Pillar({ icon, tag, title, text }: { icon: React.ReactNode; tag: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-soft">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="text-xs font-semibold uppercase tracking-wider text-primary">{tag}</div>
      <h3 className="mt-1 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function Step({ n, icon, title, text }: { n: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-display text-sm font-semibold text-primary-foreground">
        {n}
      </div>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/40 text-accent-foreground">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
