import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { EventSubmissionForm } from "@/components/events/EventSubmissionForm";

export const Route = createFileRoute("/mentorias/nova")({
  head: () => ({
    meta: [
      { title: "Anuncie sua mentoria — ICN Hub" },
      { name: "description", content: "Cadastre sua mentoria e conecte-se a uma comunidade qualificada de nutricionistas e estudantes." },
    ],
  }),
  component: NovaMentoria,
});

function NovaMentoria() {
  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-gradient-hero">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <h1 className="font-display text-4xl font-semibold">Anuncie sua mentoria</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Preencha os dados abaixo. Nossa equipe valida em até <strong>3 horas</strong>.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-10">
          <EventSubmissionForm variant="mentoria" />
        </div>
      </section>
    </SiteLayout>
  );
}
