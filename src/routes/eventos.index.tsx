import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { EventCard } from "@/components/events/EventCard";
import { EventFilters, aplicarFiltros } from "@/components/events/EventFilters";
import { MOCK_EVENTOS } from "@/lib/mock-data";
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
  const filtrados = useMemo(() => aplicarFiltros(MOCK_EVENTOS, filtros), [filtros]);

  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-semibold md:text-5xl">Eventos</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Cursos, congressos, workshops e jornadas científicas em nutrição.
              </p>
            </div>
            <Button asChild><Link to="/eventos/novo">Divulgar evento</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <EventFilters value={filtros} onChange={setFiltros} />

        <div className="mt-6 text-sm text-muted-foreground">
          {filtrados.length} evento{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}
        </div>

        {filtrados.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            Nenhum evento corresponde aos filtros selecionados.
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
