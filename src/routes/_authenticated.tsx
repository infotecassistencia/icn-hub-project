import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useAuth } from "@/lib/auth-context";

// Client-only auth gate (mock).
// When Lovable Cloud is enabled, replace with the integration-managed layout
// (ssr: false + supabase.auth.getUser + redirect to /auth).
export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/auth" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted-foreground">
          Verificando sua sessão...
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <Outlet />
    </SiteLayout>
  );
}
