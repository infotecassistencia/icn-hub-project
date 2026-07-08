import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck2, Heart, Megaphone, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { MOCK_EVENTOS, MOCK_MENTORIAS } from "@/lib/mock-data";
import { EventCard } from "@/components/events/EventCard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ICN Hub" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, isAdmin, isOrganizador, roles } = useAuth();
  const recomendados = MOCK_EVENTOS.slice(0, 3);
  const firstName = (user?.nome || user?.email || "").split(" ")[0] || "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold md:text-4xl">
            Olá, {firstName} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Aqui está um resumo do seu ICN Hub.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {roles.length === 0 ? (
              <Badge variant="outline">Sem papel</Badge>
            ) : (
              roles.map((r) => (
                <Badge key={r} variant={r === "admin" ? "default" : "secondary"} className="capitalize">
                  {r}
                </Badge>
              ))
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <Button asChild variant="outline">
              <Link to="/admin"><Shield className="mr-2 h-4 w-4" />Painel admin</Link>
            </Button>
          )}
          {(isOrganizador || isAdmin) && (
            <>
              <Button asChild variant="outline"><Link to="/eventos/novo">Divulgar evento</Link></Button>
              <Button asChild><Link to="/mentorias/nova">Anunciar mentoria</Link></Button>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Stat icon={<CalendarCheck2 />} label="Eventos disponíveis" value={MOCK_EVENTOS.length.toString()} />
        <Stat icon={<Megaphone />} label="Mentorias ativas" value={MOCK_MENTORIAS.length.toString()} />
        <Stat icon={<Heart />} label="Salvos por você" value="0" />
        <Stat icon={<TrendingUp />} label="Seus envios" value="0" />
      </div>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold">Recomendados para você</h2>
          <Button asChild variant="ghost"><Link to="/eventos">Ver todos</Link></Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recomendados.map((e) => (
            <EventCard key={e.id} item={e} basePath="/eventos" />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="shadow-card">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
        <div>
          <div className="text-2xl font-semibold">{value}</div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
