import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import {
  MapPin,
  Instagram,
  Linkedin,
  Globe,
  GraduationCap,
  Briefcase,
  ArrowLeft,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { EventCard } from "@/components/events/EventCard";
import { findMentorBySlug } from "@/lib/mock-mentores";
import { MOCK_EVENTOS, MOCK_MENTORIAS } from "@/lib/mock-data";
import { areaLabel } from "@/lib/constants";

export const Route = createFileRoute("/mentores/$slug")({
  loader: ({ params }) => {
    const mentor = findMentorBySlug(params.slug);
    if (!mentor) throw notFound();
    const eventos = MOCK_EVENTOS.filter((e) => e.mentorSlug === mentor.slug);
    const mentorias = MOCK_MENTORIAS.filter((m) => m.mentorSlug === mentor.slug);
    return { mentor, eventos, mentorias };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.mentor.nome} — ICN Hub` },
          {
            name: "description",
            content:
              loaderData.mentor.bio ??
              `Perfil de ${loaderData.mentor.nome} no ICN Hub.`,
          },
          { property: "og:title", content: loaderData.mentor.nome },
          {
            property: "og:description",
            content: loaderData.mentor.bio ?? "",
          },
          ...(loaderData.mentor.fotoUrl
            ? [{ property: "og:image", content: loaderData.mentor.fotoUrl }]
            : []),
        ]
      : [
          { title: "Profissional não encontrado — ICN Hub" },
          { name: "robots", content: "noindex" },
        ],
  }),
  component: MentorProfile,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Profissional não encontrado</h1>
        <Button asChild className="mt-6">
          <Link to="/eventos">Ver eventos</Link>
        </Button>
      </div>
    </SiteLayout>
  ),
  errorComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Erro ao carregar o perfil</h1>
      </div>
    </SiteLayout>
  ),
});

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function MentorProfile() {
  const { mentor, eventos, mentorias } = Route.useLoaderData();

  const socials = [
    mentor.instagram && {
      href: mentor.instagram,
      icon: Instagram,
      label: "Instagram",
    },
    mentor.linkedin && {
      href: mentor.linkedin,
      icon: Linkedin,
      label: "LinkedIn",
    },
    mentor.site && { href: mentor.site, icon: Globe, label: "Site" },
  ].filter(Boolean) as { href: string; icon: typeof Instagram; label: string }[];

  return (
    <SiteLayout>
      <div className="bg-gradient-to-b from-secondary/40 to-transparent">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <Link
            to="/eventos"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>

          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <Avatar className="h-32 w-32 border-4 border-background shadow-card md:h-40 md:w-40">
              {mentor.fotoUrl && (
                <AvatarImage src={mentor.fotoUrl} alt={mentor.nome} />
              )}
              <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                {initials(mentor.nome)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <h1 className="font-display text-3xl font-semibold md:text-4xl">
                {mentor.nome}
              </h1>
              {mentor.especialidade && (
                <p className="mt-1 text-lg text-muted-foreground">
                  {mentor.especialidade}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {mentor.crn && <Badge variant="secondary">{mentor.crn}</Badge>}
                {(mentor.cidade || mentor.estado) && (
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {[mentor.cidade, mentor.estado].filter(Boolean).join(" · ")}
                  </Badge>
                )}
              </div>

              {socials.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {socials.map((s) => (
                    <Button
                      key={s.label}
                      asChild
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                    >
                      <a href={s.href} target="_blank" rel="noreferrer">
                        <s.icon className="h-4 w-4" /> {s.label}
                      </a>
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 md:w-56">
              <StatCard
                value={eventos.length}
                label="Eventos"
                icon={<CalendarDays className="h-4 w-4" />}
              />
              <StatCard
                value={mentorias.length}
                label="Mentorias"
                icon={<Sparkles className="h-4 w-4" />}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {mentor.bio && (
            <Section title="Sobre">
              <p className="text-muted-foreground">{mentor.bio}</p>
            </Section>
          )}

          {mentor.curriculo && (
            <Section title="Currículo resumido" icon={<Briefcase className="h-4 w-4" />}>
              <p className="text-muted-foreground">{mentor.curriculo}</p>
            </Section>
          )}

          {mentor.formacao && (
            <Section
              title="Formação acadêmica"
              icon={<GraduationCap className="h-4 w-4" />}
            >
              <p className="text-muted-foreground">{mentor.formacao}</p>
            </Section>
          )}

          {mentor.areasAtuacao.length > 0 && (
            <Section title="Áreas de atuação">
              <div className="flex flex-wrap gap-2">
                {mentor.areasAtuacao.map((a) => (
                  <Badge key={a} variant="outline">
                    {areaLabel(a)}
                  </Badge>
                ))}
              </div>
            </Section>
          )}
        </div>

        <aside className="space-y-6">
          <Card className="shadow-card">
            <CardContent className="p-5">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Contato profissional
              </h3>
              <div className="mt-3 space-y-2 text-sm">
                {socials.length === 0 && (
                  <p className="text-muted-foreground">
                    Nenhuma rede social cadastrada.
                  </p>
                )}
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-foreground hover:text-primary"
                  >
                    <s.icon className="h-4 w-4" />
                    <span className="truncate">{s.href.replace(/^https?:\/\//, "")}</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {(eventos.length > 0 || mentorias.length > 0) && (
        <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          {eventos.length > 0 && (
            <section className="mb-12">
              <h2 className="font-display text-2xl font-semibold">
                Eventos ministrados
              </h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {eventos.map((e) => (
                  <EventCard key={e.id} item={e} basePath="/eventos" />
                ))}
              </div>
            </section>
          )}

          {mentorias.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-semibold">
                Mentorias disponíveis
              </h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {mentorias.map((m) => (
                  <EventCard key={m.id} item={m} basePath="/mentorias" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </SiteLayout>
  );
}

function StatCard({
  value,
  label,
  icon,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center shadow-card">
      <div className="flex items-center justify-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-1 font-display text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-6">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
          {icon}
          {title}
        </h2>
        {children}
      </CardContent>
    </Card>
  );
}
