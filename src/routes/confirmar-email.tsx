import { createFileRoute, Link } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/confirmar-email")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { email?: string } => ({
    email:
      typeof search.email === "string"
        ? search.email
        : undefined,
  }),

  head: () => ({
    meta: [
      {
        title: "Confirme seu e-mail — ICN Hub",
      },
    ],
  }),

  component: ConfirmarEmail,
});

function ConfirmarEmail() {
  const { email } = Route.useSearch();

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-lg shadow-card">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="mb-5 rounded-full bg-primary/10 p-4 text-primary">
            <MailCheck className="h-10 w-10" />
          </div>

          <h1 className="font-display text-2xl font-semibold">
            Confirme seu e-mail
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Enviamos uma mensagem de confirmação
            {email ? (
              <>
                {" "}para <strong>{email}</strong>
              </>
            ) : (
              " para o endereço informado"
            )}
            .
          </p>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Abra sua caixa de entrada e clique no botão de confirmação
            para ativar sua conta.
          </p>

          <div className="mt-6 w-full rounded-lg border bg-muted/40 p-4 text-left">
            <p className="text-sm font-medium">
              Não encontrou o e-mail?
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Verifique as pastas de spam, lixo eletrônico e promoções.
            </p>
          </div>

          <Button asChild className="mt-6 w-full">
            <Link to="/auth">
              Voltar para o login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}