import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useAuth } from "@/lib/auth-context";
import { TIPOS_USUARIO } from "@/lib/constants";
import type { TipoUsuario } from "@/lib/types";

const searchSchema = z.object({ tab: z.enum(["login", "cadastro"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — ICN Hub" },
      { name: "description", content: "Acesse ou crie sua conta no ICN Hub." },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: ({ context: _ctx }) => {
    // Client-side guard implemented in component; no server-side check.
  },
  component: AuthPage,
});

function AuthPage() {
  const { tab } = Route.useSearch();
  const [active, setActive] = useState<"login" | "cadastro">(tab ?? "login");

  return (
    <SiteLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
            <h1 className="font-display text-2xl font-semibold">Bem-vindo(a) ao ICN Hub</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Acesse sua conta ou crie uma para salvar eventos e divulgar mentorias.
            </p>

            <Tabs value={active} onValueChange={(v) => setActive(v as "login" | "cadastro")} className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="cadastro">Criar conta</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-6"><LoginForm /></TabsContent>
              <TabsContent value="cadastro" className="mt-6"><RegisterForm /></TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await login(String(form.get("email")), String(form.get("senha")));
      toast.success("Login realizado");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Não foi possível entrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-1.5">
        <Label>Senha</Label>
        <Input name="senha" type="password" required autoComplete="current-password" />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}

function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [tipo, setTipo] = useState<TipoUsuario>("nutricionista");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await register({
        nome: String(form.get("nome")),
        email: String(form.get("email")),
        telefone: String(form.get("telefone")),
        cpf: String(form.get("cpf")),
        password: String(form.get("senha")),
        tipo,
        crn: form.get("crn") ? String(form.get("crn")) : undefined,
        areaAtuacao: form.get("areaAtuacao") ? String(form.get("areaAtuacao")) : undefined,
        instituicao: form.get("instituicao") ? String(form.get("instituicao")) : undefined,
        semestre: form.get("semestre") ? String(form.get("semestre")) : undefined,
      });
      toast.success("Cadastro criado");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Não foi possível cadastrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Nome completo"><Input name="nome" required /></Field>
      <Field label="Email"><Input name="email" type="email" required autoComplete="email" /></Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Telefone"><Input name="telefone" required /></Field>
        <Field label="CPF"><Input name="cpf" required /></Field>
      </div>
      <Field label="Senha"><Input name="senha" type="password" required minLength={6} autoComplete="new-password" /></Field>

      <Field label="Você é">
        <Select value={tipo} onValueChange={(v) => setTipo(v as TipoUsuario)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {TIPOS_USUARIO.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>

      {tipo === "estudante" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Instituição de ensino"><Input name="instituicao" required /></Field>
          <Field label="Semestre do curso"><Input name="semestre" required /></Field>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="CRN"><Input name="crn" required placeholder="Ex: CRN-3/00000" /></Field>
          <Field label="Área de atuação"><Input name="areaAtuacao" required /></Field>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}

// keep `redirect` referenced for future guarded flows without unused-import lint
void redirect;
