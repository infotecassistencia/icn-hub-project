import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_MENTORIAS } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/admin/mentorias")({
  head: () => ({ meta: [{ title: "Mentorias — Admin" }, { name: "robots", content: "noindex" }] }),
  component: MentoriasAdmin,
});

function MentoriasAdmin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Mentorias</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lista das mentorias cadastradas. Aprovar, editar e excluir estarão disponíveis quando a
          tabela <code className="mx-1 rounded bg-secondary px-1">mentorias</code> for migrada para o
          banco.
        </p>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {MOCK_MENTORIAS.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <div className="font-medium">{m.nome}</div>
                  <div className="text-xs text-muted-foreground">
                    {m.local} · {new Date(m.data).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={m.status === "aprovado" ? "default" : "secondary"}>{m.status}</Badge>
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
