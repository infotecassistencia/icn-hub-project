import {
  createFileRoute,
  Navigate,
} from "@tanstack/react-router";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { EventSubmissionForm } from "@/components/events/EventSubmissionForm";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/eventos/novo")({
  head: () => ({
    meta: [
      {
        title: "Divulgar evento — ICN Hub",
      },
      {
        name: "description",
        content:
          "Cadastre seu curso, congresso ou workshop e alcance uma comunidade qualificada da nutrição.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),

  component: NovoEvento,
});

function NovoEvento() {
  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return <CarregandoPagina />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth"
        search={{
          tab: "login",
        }}
        replace
      />
    );
  }

  if (!user) {
    return <CarregandoPagina />;
  }

  if (user.tipo === "estudante") {
    return (
      <Navigate
        to="/eventos"
        replace
      />
    );
  }

  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-gradient-hero">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <h1 className="font-display text-4xl font-semibold">
            Divulgue seu evento
          </h1>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            Preencha os detalhes abaixo. Nossa equipe faz a
            validação e retorna em até{" "}
            <strong>3 horas</strong>.
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

function CarregandoPagina() {
  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-gradient-hero">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="mt-3 h-5 w-full max-w-xl" />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-10">
          <div className="space-y-5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-11 w-40" />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}