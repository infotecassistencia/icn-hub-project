import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ConfigAdmin,
});

function ConfigAdmin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Preferências gerais do painel. Novas opções serão adicionadas conforme o produto evolui.
        </p>
      </div>
      <Card className="shadow-card">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Nenhuma configuração disponível ainda.
        </CardContent>
      </Card>
    </div>
  );
}
