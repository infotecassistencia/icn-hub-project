import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  GraduationCap,
  Mail,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { format, subMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MOCK_EVENTOS, MOCK_MENTORIAS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Painel — ICN Hub" }, { name: "robots", content: "noindex" }] }),
  component: AdminHome,
});

// Recharts theme colors driven by our design tokens.
const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2, 152 60% 45%))",
  "hsl(var(--chart-3, 32 95% 55%))",
  "hsl(var(--chart-4, 262 60% 60%))",
  "hsl(var(--chart-5, 199 89% 55%))",
];

function AdminHome() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const [
        { count: usuarios },
        { count: organizadores },
        { count: msgTotal },
        { count: msgNovas },
        { data: msgRecentes },
        { data: usuariosRecentes },
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("user_roles")
          .select("user_id", { count: "exact", head: true })
          .eq("role", "organizador"),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
        supabase
          .from("contact_messages")
          .select("id", { count: "exact", head: true })
          .eq("status", "novo"),
        supabase
          .from("contact_messages")
          .select("id, nome, assunto, data_envio, status")
          .order("data_envio", { ascending: false })
          .limit(5),
        supabase
          .from("profiles")
          .select("id, nome, email, tipo, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);
      return {
        usuarios: usuarios ?? 0,
        organizadores: organizadores ?? 0,
        msgTotal: msgTotal ?? 0,
        msgNovas: msgNovas ?? 0,
        msgRecentes: msgRecentes ?? [],
        usuariosRecentes: usuariosRecentes ?? [],
      };
    },
  });

  // Derived event/mentoria stats from mock data (backend not yet wired).
  const now = Date.now();
  const eventos = MOCK_EVENTOS;
  const mentorias = MOCK_MENTORIAS;
  const eventosAtivos = eventos.filter((e) => new Date(e.data).getTime() >= now).length;
  const eventosFuturos = eventos.filter(
    (e) => new Date(e.data).getTime() > now + 7 * 24 * 3600 * 1000,
  ).length;
  const eventosEncerrados = eventos.filter((e) => new Date(e.data).getTime() < now).length;
  const eventosPendentes = eventos.filter((e) => e.status === "pendente").length;
  const mentoriasPendentes = mentorias.filter((m) => m.status === "pendente").length;

  // Monthly trend synthesis (mock — real data can replace once backend has records).
  const monthly = Array.from({ length: 6 }).map((_, i) => {
    const d = startOfMonth(subMonths(new Date(), 5 - i));
    const key = format(d, "MMM", { locale: ptBR });
    return {
      mes: key.charAt(0).toUpperCase() + key.slice(1),
      inscricoes: 20 + Math.round(Math.sin(i) * 10 + i * 8),
      usuarios: 10 + i * 6 + Math.round(Math.cos(i) * 4),
      eventos: 2 + (i % 4) + Math.round(Math.sin(i * 1.3) * 2),
      mentorias: 1 + (i % 3),
    };
  });

  // Distribution charts.
  const porEstado = Object.entries(
    eventos.reduce<Record<string, number>>((acc, e) => {
      acc[e.estado] = (acc[e.estado] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([estado, total]) => ({ estado, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const porModalidade = [
    { name: "Online", value: eventos.filter((e) => e.modalidade === "online").length },
    { name: "Presencial", value: eventos.filter((e) => e.modalidade === "presencial").length },
  ];

  const stats = [
    { icon: Users, label: "Usuários", value: data?.usuarios ?? 0, delta: "+12%", tint: "from-blue-500/20 to-blue-500/5", accent: "text-blue-600" },
    { icon: CalendarDays, label: "Eventos", value: eventos.length, delta: "+3", tint: "from-emerald-500/20 to-emerald-500/5", accent: "text-emerald-600" },
    { icon: GraduationCap, label: "Mentorias", value: mentorias.length, delta: "+2", tint: "from-violet-500/20 to-violet-500/5", accent: "text-violet-600" },
    { icon: CheckCircle2, label: "Eventos ativos", value: eventosAtivos, delta: "", tint: "from-teal-500/20 to-teal-500/5", accent: "text-teal-600" },
    { icon: TrendingUp, label: "Eventos futuros", value: eventosFuturos, delta: "", tint: "from-amber-500/20 to-amber-500/5", accent: "text-amber-600" },
    { icon: Clock, label: "Encerrados", value: eventosEncerrados, delta: "", tint: "from-slate-500/20 to-slate-500/5", accent: "text-slate-600" },
    { icon: UserPlus, label: "Inscrições", value: 148, delta: "+18%", tint: "from-pink-500/20 to-pink-500/5", accent: "text-pink-600" },
    { icon: ShieldCheck, label: "Pendentes", value: eventosPendentes + mentoriasPendentes, delta: "", tint: "from-orange-500/20 to-orange-500/5", accent: "text-orange-600" },
    { icon: Mail, label: "Mensagens", value: data?.msgTotal ?? 0, delta: `${data?.msgNovas ?? 0} novas`, tint: "from-sky-500/20 to-sky-500/5", accent: "text-sky-600" },
    { icon: MessageSquare, label: "Organizadores", value: data?.organizadores ?? 0, delta: "", tint: "from-fuchsia-500/20 to-fuchsia-500/5", accent: "text-fuchsia-600" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Painel administrativo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Indicadores em tempo real do ICN Hub — {format(new Date(), "PPP", { locale: ptBR })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/eventos/novo"><CalendarPlus className="mr-2 h-4 w-4" />Criar evento</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/mentorias/nova"><GraduationCap className="mr-2 h-4 w-4" />Criar mentoria</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/admin/eventos">Aprovar eventos</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/admin/mentorias">Aprovar mentorias</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/admin/usuarios"><Users className="mr-2 h-4 w-4" />Usuários</Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s, i) => (
          <Card
            key={s.label}
            className={cn(
              "group relative overflow-hidden border-border/60 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md animate-fade-in",
            )}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70", s.tint)} />
            <CardContent className="relative p-4">
              <div className="flex items-center justify-between">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-background/70 backdrop-blur", s.accent)}>
                  <s.icon className="h-4 w-4" />
                </div>
                {s.delta && (
                  <span className="text-[10px] font-medium text-muted-foreground">{s.delta}</span>
                )}
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight">
                {isLoading && typeof s.value === "number" && s.value === 0 ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  s.value
                )}
              </div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Atividade mensal</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="inscricoes" name="Inscrições" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="usuarios" name="Usuários" stroke={CHART_COLORS[1]} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="eventos" name="Eventos" stroke={CHART_COLORS[2]} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="mentorias" name="Mentorias" stroke={CHART_COLORS[3]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Modalidade</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={porModalidade} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {porModalidade.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Eventos por estado</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porEstado}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="estado" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="total" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Pendências</CardTitle>
            <Badge variant="secondary">{eventosPendentes + mentoriasPendentes + (data?.msgNovas ?? 0)}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <PendingRow to="/admin/eventos" label="Eventos aguardando" value={eventosPendentes} />
            <PendingRow to="/admin/mentorias" label="Mentorias aguardando" value={mentoriasPendentes} />
            <PendingRow to="/admin/mensagens" label="Mensagens não respondidas" value={data?.msgNovas ?? 0} />
          </CardContent>
        </Card>
      </div>

      {/* Activity feeds */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Últimos usuários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <SkeletonRows />
            ) : (data?.usuariosRecentes ?? []).length === 0 ? (
              <EmptyRow text="Nenhum usuário ainda." />
            ) : (
              data!.usuariosRecentes.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-md p-2 hover:bg-muted/40">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{u.nome || u.email}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">{u.tipo}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Últimas mensagens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <SkeletonRows />
            ) : (data?.msgRecentes ?? []).length === 0 ? (
              <EmptyRow text="Nenhuma mensagem ainda." />
            ) : (
              data!.msgRecentes.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-md p-2 hover:bg-muted/40">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.assunto}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.nome}</p>
                  </div>
                  <Badge variant={m.status === "novo" ? "default" : "secondary"} className="capitalize">
                    {m.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Últimos eventos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {eventos.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-md p-2 hover:bg-muted/40">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{e.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">{e.local}</p>
                </div>
                <Badge variant="outline" className="capitalize">{e.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Últimas mentorias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mentorias.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-md p-2 hover:bg-muted/40">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{m.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.ministrante}</p>
                </div>
                <Badge variant="outline" className="capitalize">{m.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PendingRow({
  to,
  label,
  value,
}: {
  to: "/admin/eventos" | "/admin/mentorias" | "/admin/mensagens";
  label: string;
  value: number;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2 text-sm transition-colors hover:bg-muted/50"
    >
      <span>{label}</span>
      <Badge variant={value > 0 ? "default" : "secondary"}>{value}</Badge>
    </Link>
  );
}

function SkeletonRows() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="py-6 text-center text-xs text-muted-foreground">{text}</p>;
}
