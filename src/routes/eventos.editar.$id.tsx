import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { EventEditForm } from "@/components/events/EventEditForm";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute(
  "/eventos/editar/$id",
)({
  head: () => ({
    meta: [
      {
        title: "Editar evento — ICN Hub",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),

  component: EditarEvento,
});

function EditarEvento() {
  const { id } = Route.useParams();

  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-gradient-hero">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <Button
            asChild
            variant="ghost"
            className="mb-4 -ml-3"
          >
            <Link to="/meus-eventos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para meus envios
            </Link>
          </Button>

          <h1 className="font-display text-4xl font-semibold">
            Corrigir evento
          </h1>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            Confira o motivo da recusa, corrija as
            informações necessárias e reenvie o evento para
            uma nova análise.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-10">
          <EventEditForm eventId={id} />
        </div>
      </section>
    </SiteLayout>
  );
}