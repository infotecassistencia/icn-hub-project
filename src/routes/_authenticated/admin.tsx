import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  Mail,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

// Admin gate: any route under /admin/* is protected client-side by isAdmin.
// Backend RLS also blocks non-admins from reading/mutating admin data, so
// even direct API access is denied.
export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { to: "/admin/mensagens", label: "Mensagens", icon: Mail },
  { to: "/admin/eventos", label: "Eventos", icon: CalendarDays },
  { to: "/admin/mentorias", label: "Mentorias", icon: GraduationCap },
  { to: "/admin/usuarios", label: "Usuários", icon: Users },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
] as const;

function AdminLayout() {
  const { isAdmin, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    if (!isAdmin) {
      toast.error("Acesso restrito à administração");
      navigate({ to: "/dashboard" });
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate]);

  if (isLoading || !isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted-foreground">
        Verificando permissões...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Painel</div>
          <div className="font-display text-xl font-semibold">Administração</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <aside>
          <nav className="flex flex-col gap-1 rounded-xl border border-border bg-card p-2 shadow-card">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
                activeOptions={{ exact: to === "/admin" }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
