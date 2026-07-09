import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_EVENTOS } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/_admin/eventos")({
  head: () => ({ meta: [{ title: "Eventos — Admin" }, { name: "robots", content: "noindex" }] }),
  component: EventosAdmin,
});

function EventosAdmin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Eventos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lista dos eventos cadastrados. Aprovar, editar e excluir estarão disponíveis quando a tabela
          <code className="mx-1 rounded bg-secondary px-1">eventos</code>for migrada para o banco.
        </p>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {MOCK_EVENTOS.map((e) => (
              <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <div className="font-medium">{e.nome}</div>
                  <div className="text-xs text-muted-foreground">
                    {e.local} · {new Date(e.data).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={e.status === "aprovado" ? "default" : "secondary"}>{e.status}</Badge>
                  <Button size="sm" variant="outline" disabled>
                    Aprovar
                  </Button>
                  <Button size="sm" variant="outline" disabled>
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
