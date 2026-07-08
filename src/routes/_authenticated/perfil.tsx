import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({ meta: [{ title: "Meu perfil — ICN Hub" }, { name: "robots", content: "noindex" }] }),
  component: Perfil,
});

function Perfil() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">Meu perfil</h1>
      <p className="mt-1 text-muted-foreground">Seus dados cadastrais no ICN Hub.</p>

      <Card className="mt-8 shadow-card">
        <CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <Row label="Nome" value={user.nome} />
          <Row label="Email" value={user.email} />
          <Row label="Telefone" value={user.telefone || "—"} />
          <Row label="CPF" value={user.cpf || "—"} />
          <Row label="Perfil" value={<Badge variant="secondary">{user.tipo}</Badge>} />
          {user.tipo === "estudante" ? (
            <>
              <Row label="Instituição" value={user.instituicao} />
              <Row label="Semestre" value={user.semestre} />
            </>
          ) : (
            <>
              <Row label="CRN" value={user.crn} />
              <Row label="Área de atuação" value={user.areaAtuacao} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
