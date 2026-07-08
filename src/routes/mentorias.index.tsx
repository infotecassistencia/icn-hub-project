import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { EventCard } from "@/components/events/EventCard";
import { EventFilters, aplicarFiltros } from "@/components/events/EventFilters";
import { MOCK_MENTORIAS } from "@/lib/mock-data";
import type { FiltrosBusca } from "@/lib/types";

export const Route = createFileRoute("/mentorias/")({
  head: () => ({
    meta: [
      { title: "Mentorias em nutrição — ICN Hub" },
      { name: "description", content: "Mentorias individuais e em grupo com nutricionistas de referência em todo o Brasil." },
      { property: "og:title", content: "Mentorias em nutrição — ICN Hub" },
      { property: "og:description", content: "Aprenda com quem já trilhou o caminho." },
    ],
  }),
  component: MentoriasIndex,
});

function MentoriasIndex() {
  const [filtros, setFiltros] = useState<FiltrosBusca>({});
  const filtrados = useMemo(() => aplicarFiltros(MOCK_MENTORIAS, filtros), [filtros]);

  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-semibold md:text-5xl">Mentorias</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Programas de desenvolvimento profissional para diferentes fases da carreira.
              </p>
            </div>
            <Button asChild><Link to="/mentorias/nova">Anuncie sua mentoria</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <EventFilters value={filtros} onChange={setFiltros} />

        <div className="mt-6 text-sm text-muted-foreground">
          {filtrados.length} mentoria{filtrados.length !== 1 ? "s" : ""} encontrada{filtrados.length !== 1 ? "s" : ""}
        </div>

        {filtrados.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            Nenhuma mentoria corresponde aos filtros selecionados.
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((m) => (
              <EventCard key={m.id} item={m} basePath="/mentorias" />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
