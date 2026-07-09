import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, GraduationCap, Mail, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin — ICN Hub" }, { name: "robots", content: "noindex" }] }),
  component: AdminHome,
});

function AdminHome() {
  const { data } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      const [{ count: novas }, { count: total }, { count: usuarios }] = await Promise.all([
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "novo"),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      return { novas: novas ?? 0, total: total ?? 0, usuarios: usuarios ?? 0 };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Visão geral</h1>
        <p className="mt-1 text-sm text-muted-foreground">Resumo do que está acontecendo no ICN Hub.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Mail />} label="Mensagens novas" value={data?.novas ?? 0} to="/admin/mensagens" />
        <StatCard icon={<Mail />} label="Mensagens (total)" value={data?.total ?? 0} to="/admin/mensagens" />
        <StatCard icon={<Users />} label="Usuários cadastrados" value={data?.usuarios ?? 0} to="/admin/usuarios" />
        <StatCard icon={<CalendarDays />} label="Eventos" value="—" to="/admin/eventos" />
      </div>

      <Card className="shadow-card">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <div className="font-display text-lg font-semibold">Ações rápidas</div>
            <div className="text-sm text-muted-foreground">
              Gerencie mensagens, aprove conteúdos e atribua papéis aos usuários.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/admin/mensagens">Ver mensagens</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/usuarios">Gerenciar usuários</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/eventos">
                <GraduationCap className="mr-2 h-4 w-4" /> Aprovar conteúdos
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  to: "/admin/mensagens" | "/admin/usuarios" | "/admin/eventos" | "/admin/mentorias";
}) {
  return (
    <Link to={to}>
      <Card className="shadow-card transition-shadow hover:shadow-soft">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <div className="text-2xl font-semibold">{value}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
