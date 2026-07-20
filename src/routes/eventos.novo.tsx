import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { EventSubmissionForm } from "@/components/events/EventSubmissionForm";

export const Route = createFileRoute("/eventos/novo")({
  head: () => ({
    meta: [
      { title: "Divulgar evento — ICN Hub" },
      { name: "description", content: "Cadastre seu curso, congresso ou workshop e alcance uma comunidade qualificada da nutrição." },
    ],
  }),
  component: NovoEvento,
});

function NovoEvento() {
  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-gradient-hero">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <h1 className="font-display text-4xl font-semibold">Divulgue seu evento</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Preencha os detalhes abaixo. Nossa equipe faz a validação e retorna em até <strong>3 horas</strong>.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-10">
          <EventSubmissionForm variant="evento" />
        </div>
      </section>
    </SiteLayout>
  );
}
