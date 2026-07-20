import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { EventCard } from "@/components/events/EventCard";
import { EventFilters } from "@/components/events/EventFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchEventos } from "@/lib/api/catalog";
import type { FiltrosBusca } from "@/lib/types";

export const Route = createFileRoute("/eventos/")({
  head: () => ({
    meta: [
      { title: "Eventos de nutrição — ICN Hub" },
      { name: "description", content: "Explore cursos, congressos, workshops e jornadas científicas de nutrição em todo o Brasil." },
      { property: "og:title", content: "Eventos de nutrição — ICN Hub" },
      { property: "og:description", content: "Cursos, congressos e workshops filtrados por área, modalidade e valor." },
    ],
  }),
  component: EventosIndex,
});

function EventosIndex() {
  const [filtros, setFiltros] = useState<FiltrosBusca>({});
  const { data: filtrados = [], isLoading, isError } = useQuery({
    queryKey: ["eventos", "public", filtros],
    queryFn: () => fetchEventos(filtros),
  });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Agenda"
        title="Eventos"
        description="Cursos, congressos, workshops e jornadas científicas em nutrição em todo o Brasil."
        actions={
          <Button asChild>
            <Link to="/eventos/novo">
              <CalendarPlus className="mr-1.5 h-4 w-4" /> Divulgar evento
            </Link>
          </Button>
        }
      />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">
        <EventFilters value={filtros} onChange={setFiltros} />

        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {isLoading ? (
              "Carregando eventos..."
            ) : (
              <>
                <strong className="font-semibold text-foreground">{filtrados.length}</strong> evento
                {filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}
              </>
            )}
          </span>
        </div>

        {isLoading ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-8 rounded-2xl border border-dashed border-destructive/40 bg-card p-12 text-center">
            <p className="font-display text-lg font-semibold">Erro ao carregar eventos</p>
            <p className="mt-2 text-sm text-muted-foreground">Tente novamente em instantes.</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="font-display text-lg font-semibold">Nenhum evento encontrado</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Ajuste os filtros ou limpe a busca para ver mais resultados.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((e) => (
              <EventCard key={e.id} item={e} basePath="/eventos" />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
