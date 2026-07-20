import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/meus-eventos")({
  head: () => ({ meta: [{ title: "Meus envios — ICN Hub" }, { name: "robots", content: "noindex" }] }),
  component: MeusEventos,
});

function MeusEventos() {
  // Placeholder — will be populated from Lovable Cloud (`eventos`/`mentorias` where criadoPor = user.id).
  const envios: Array<{ id: string; nome: string; tipo: string; status: "pendente" | "aprovado" | "recusado" }> = [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Meus envios</h1>
          <p className="mt-1 text-muted-foreground">
            Acompanhe o status de validação dos eventos e mentorias que você enviou.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/eventos/novo">Novo evento</Link></Button>
          <Button asChild><Link to="/mentorias/nova">Nova mentoria</Link></Button>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {envios.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-10 text-center text-muted-foreground">
              Você ainda não enviou nenhum evento ou mentoria.
            </CardContent>
          </Card>
        ) : (
          envios.map((e) => (
            <Card key={e.id} className="shadow-card">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">{e.nome}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{e.tipo}</div>
                </div>
                <Badge variant={e.status === "aprovado" ? "default" : "secondary"}>{e.status}</Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
