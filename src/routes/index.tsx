import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Compass,
  Filter,
  GraduationCap,
  MapPin,
  Megaphone,
  MousePointerClick,
  Sparkles,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/EventCard";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { fetchEventos, fetchMentorias } from "@/lib/api/catalog";
import { areaLabel } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { data: eventos = [] } = useQuery({
    queryKey: ["eventos", "public", {}],
    queryFn: () => fetchEventos({}),
  });

const {
  user,
  isAuthenticated,
  isLoading,
} = useAuth();

const podePublicar =
  !isLoading &&
  (!isAuthenticated ||
    user?.tipo !== "estudante");

  const { data: mentorias = [] } = useQuery({
    queryKey: ["mentorias", "public", {}],
    queryFn: () => fetchMentorias({}),
  });

  const eventosDestaque = eventos.slice(0, 3);
  const mentoriasDestaque = mentorias.slice(0, 3);
  const heroPreview = eventos.slice(0, 3);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60 bg-background">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-grid-soft opacity-25"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 top-0 h-[34rem] w-[34rem] rounded-full border border-primary/10"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 top-24 h-[22rem] w-[22rem] rounded-full border border-primary/10"
        />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-28">
          <div>
            <Badge
              variant="secondary"
              className="mb-6 gap-2 rounded-full border border-primary/15 bg-secondary/70 px-4 py-1.5 text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />

              Plataforma de desenvolvimento em Nutrição
            </Badge>

            <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-[4rem]">
              Conectando estudantes, nutricionistas e instituições em um único ambiente.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Descubra cursos, congressos, mentorias e experiências
              que impulsionam sua formação e sua carreira em Nutrição.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full px-6 shadow-soft"
              >
                <Link to="/eventos">
                  Explorar eventos

                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>

              {podePublicar && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-6"
              >
                <Link to="/eventos/novo">
                  Publicar evento
                </Link>
              </Button>
              )}
            </div>

            <dl className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-border/70 pt-6 sm:gap-8">
              <HeroStat
                value={`${eventos.length}+`}
                label="Eventos"
              />

              <HeroStat
                value={`${mentorias.length}+`}
                label="Mentorias"
              />

              <HeroStat
                value="Brasil"
                label="Abrangência"
              />
            </dl>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-border bg-card p-5 shadow-card sm:p-6">
              <div className="flex items-center justify-between border-b border-border/70 pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Agenda ICN
                  </p>

                  <h2 className="mt-1 font-display text-xl font-semibold">
                    Próximas oportunidades
                  </h2>
                </div>

                <CalendarDays className="h-5 w-5 text-primary" />
              </div>

              {heroPreview.length > 0 ? (
                <ul className="divide-y divide-border/70">
                  {heroPreview.map((evento) => {
                    const gratuito = evento.valor === 0;
                    const data = new Date(evento.data);

                    return (
                      <li key={evento.id}>
                        <Link
                          to="/eventos/$id"
                          params={{ id: evento.id }}
                          className="group grid gap-4 py-5 transition-colors sm:grid-cols-[64px_1fr_auto] sm:items-center"
                        >
                          <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-secondary text-center">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                              {data
                                .toLocaleDateString("pt-BR", {
                                  month: "short",
                                })
                                .replace(".", "")}
                            </span>

                            <span className="font-display text-2xl font-semibold leading-none text-foreground">
                              {data.toLocaleDateString("pt-BR", {
                                day: "2-digit",
                              })}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                                {areaLabel(evento.area)}
                              </span>

                              <span className="rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                {evento.modalidade}
                              </span>
                            </div>

                            <p className="mt-1 line-clamp-1 font-medium transition-colors group-hover:text-primary">
                              {evento.nome}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-primary/70" />

                                {evento.estado}
                              </span>

                              <span>
                                {gratuito
                                  ? "Gratuito"
                                  : `R$ ${evento.valor.toLocaleString(
                                      "pt-BR",
                                    )}`}
                              </span>
                            </div>
                          </div>

                          <ArrowRight className="hidden h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary sm:block" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="py-12 text-center">
                  <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/50" />

                  <p className="mt-3 text-sm text-muted-foreground">
                    Novos eventos serão exibidos aqui.
                  </p>
                </div>
              )}

              <div className="border-t border-border/70 pt-4">
                <Button
                  asChild
                  variant="ghost"
                  className="w-full rounded-full"
                >
                  <Link to="/eventos">
                    Ver agenda completa

                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PILARES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionEyebrow>
              Por que ICN Hub
            </SectionEyebrow>

            <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
              Uma plataforma criada para fortalecer a comunidade da Nutrição.
            </h2>

            <p className="mt-5 max-w-lg leading-7 text-muted-foreground">
              Reunimos oportunidades de formação, atualização e
              conexão profissional em uma experiência simples,
              confiável e acessível.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-3">
            <Pillar
              icon={<Filter className="h-5 w-5" />}
              number="01"
              title="Busca direcionada"
              text="Encontre eventos por área, formato, modalidade, localização e investimento."
            />

            <Pillar
              icon={<GraduationCap className="h-5 w-5" />}
              number="02"
              title="Formação contínua"
              text="Acompanhe oportunidades adequadas a diferentes momentos da carreira."
            />

            <Pillar
              icon={<Megaphone className="h-5 w-5" />}
              number="03"
              title="Mais visibilidade"
              text="Organizadores alcançam estudantes e profissionais interessados em Nutrição."
            />
          </div>
        </div>
      </section>

      {/* EVENTOS */}
      <section className="border-y border-border/60 bg-secondary/35 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="Em destaque"
            title="Eventos para o próximo passo da sua trajetória"
            description="Conheça oportunidades selecionadas para ampliar seu conhecimento e sua rede profissional."
            action={
              <Button
                asChild
                variant="ghost"
                className="group rounded-full"
              >
                <Link to="/eventos">
                  Ver todos

                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            }
          />

          {eventosDestaque.length > 0 ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {eventosDestaque.map((evento) => (
                <EventCard
                  key={evento.id}
                  item={evento}
                  basePath="/eventos"
                />
              ))}
            </div>
          ) : (
            <EmptySection message="Nenhum evento disponível no momento." />
          )}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow>
            Como funciona
          </SectionEyebrow>

          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            Encontre oportunidades em três etapas
          </h2>

          <p className="mt-4 leading-7 text-muted-foreground">
            Uma experiência clara para ajudar você a encontrar
            conteúdos alinhados aos seus objetivos profissionais.
          </p>
        </div>

        <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
          <div
            aria-hidden="true"
            className="absolute left-[16.6%] right-[16.6%] top-8 hidden border-t border-dashed border-primary/20 md:block"
          />

          <Step
            number="01"
            icon={<Compass className="h-5 w-5" />}
            title="Explore"
            text="Pesquise eventos e mentorias de acordo com seu interesse."
          />

          <Step
            number="02"
            icon={<MousePointerClick className="h-5 w-5" />}
            title="Compare"
            text="Analise formato, data, área, duração e investimento."
          />

          <Step
            number="03"
            icon={<Users className="h-5 w-5" />}
            title="Conecte-se"
            text="Participe de experiências que aproximam teoria, prática e carreira."
          />
        </div>
      </section>

      {/* MENTORIAS */}
      <section className="border-y border-border/60 bg-background py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="Mentorias"
            title="Aprenda com profissionais que já trilharam esse caminho"
            description="Encontre orientação especializada para acelerar decisões, desenvolver competências e construir sua trajetória."
            action={
              <div className="flex flex-wrap gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full"
                >
                  <Link to="/mentorias">
                    Ver mentorias
                  </Link>
                </Button>

                {podePublicar && (
                <Button
                  asChild
                  className="rounded-full"
                >
                  <Link to="/mentorias/nova">
                    Anunciar mentoria
                  </Link>
                </Button>
                )}
              </div>
            }
          />

          {mentoriasDestaque.length > 0 ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mentoriasDestaque.map((mentoria) => (
                <EventCard
                  key={mentoria.id}
                  item={mentoria}
                  basePath="/mentorias"
                />
              ))}
            </div>
          ) : (
            <EmptySection message="Nenhuma mentoria disponível no momento." />
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-primary-foreground sm:px-10 lg:px-14 lg:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full border border-primary-foreground/10"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full border border-primary-foreground/10"
          />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/65">
                Comunidade ICN Hub
              </p>

              <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
                Faça parte de uma rede dedicada ao desenvolvimento da Nutrição.
              </h2>

              <p className="mt-5 max-w-2xl leading-7 text-primary-foreground/75">
                Acompanhe eventos, mentorias e oportunidades de
                desenvolvimento profissional em um único lugar.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="h-12 rounded-full px-6"
                >
                  <Link
                    to="/auth"
                    search={{ tab: "cadastro" }}
                  >
                    Criar minha conta
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-primary-foreground/30 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link to="/sobre">
                    Conhecer a plataforma
                  </Link>
                </Button>
              </div>
            </div>

            <ul className="grid gap-3 text-sm text-primary-foreground/80 sm:grid-cols-2 lg:grid-cols-1">
              {[
                "Eventos presenciais e online",
                "Cursos e jornadas científicas",
                "Mentorias especializadas",
                "Oportunidades gratuitas e pagas",
                "Conteúdos por área da Nutrição",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary-foreground/10">
                    <Check className="h-3.5 w-3.5" />
                  </span>

                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function SectionEyebrow({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
      {children}
    </p>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      <div className="max-w-3xl">
        <SectionEyebrow>
          {eyebrow}
        </SectionEyebrow>

        <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
          {title}
        </h2>

        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="shrink-0">
        {action}
      </div>
    </div>
  );
}

function HeroStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>
      <dt className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
        {value}
      </dt>

      <dd className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">
        {label}
      </dd>
    </div>
  );
}

function Pillar({
  icon,
  number,
  title,
  text,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
  text: string;
}) {
  return (
    <article className="group relative bg-card p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
          {icon}
        </div>

        <span className="font-display text-sm font-semibold text-primary/45">
          {number}
        </span>
      </div>

      <h3 className="mt-8 font-display text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {text}
      </p>

      <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
    </article>
  );
}

function Step({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="relative text-center">
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-background text-primary shadow-card">
        {icon}

        <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
          {number}
        </span>
      </div>

      <h3 className="mt-6 font-display text-xl font-semibold">
        {title}
      </h3>

      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
        {text}
      </p>
    </article>
  );
}

function EmptySection({
  message,
}: {
  message: string;
}) {
  return (
    <div className="mt-10 rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/50" />

      <p className="mt-3 text-sm text-muted-foreground">
        {message}
      </p>
    </div>
  );
}