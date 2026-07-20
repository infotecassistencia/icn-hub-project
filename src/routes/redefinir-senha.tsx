import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      {
        title: "Redefinir senha — ICN Hub",
      },
      {
        name: "description",
        content: "Crie uma nova senha para sua conta no ICN Hub.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: RedefinirSenhaPage,
});

function RedefinirSenhaPage() {
  const navigate = useNavigate();

  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [sessaoValida, setSessaoValida] = useState(false);

  useEffect(() => {
    let ativo = true;

    const verificarSessao = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!ativo) {
          return;
        }

        if (error) {
          console.error("Erro ao verificar sessão:", error);
          setSessaoValida(false);
          return;
        }

        setSessaoValida(Boolean(data.session));
      } finally {
        if (ativo) {
          setVerificandoSessao(false);
        }
      }
    };

    void verificarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!ativo) {
        return;
      }

      if (
        event === "PASSWORD_RECOVERY" ||
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED"
      ) {
        setSessaoValida(Boolean(session));
        setVerificandoSessao(false);
      }

      if (event === "SIGNED_OUT") {
        setSessaoValida(false);
        setVerificandoSessao(false);
      }
    });

    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (senha.length < 6) {
      toast.error("A nova senha deve possuir pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmacaoSenha) {
      toast.error("As senhas informadas não são iguais.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: senha,
      });

      if (error) {
        throw error;
      }

      toast.success("Senha alterada com sucesso.");

      setSenha("");
      setConfirmacaoSenha("");

      await supabase.auth.signOut();

      await navigate({
        to: "/auth",
        search: {
          tab: "login",
        },
        replace: true,
      });
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);

      const message =
        error instanceof Error ? error.message.toLowerCase() : "";

      if (
        message.includes("same password") ||
        message.includes("different from the old password")
      ) {
        toast.error("A nova senha deve ser diferente da senha anterior.");
        return;
      }

      if (
        message.includes("expired") ||
        message.includes("invalid") ||
        message.includes("session")
      ) {
        toast.error(
          "O link de recuperação expirou ou é inválido. Solicite um novo link.",
        );
        setSessaoValida(false);
        return;
      }

      toast.error(
        "Não foi possível alterar a senha. Tente solicitar um novo link.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (verificandoSessao) {
    return (
      <SiteLayout>
        <section className="bg-gradient-hero">
          <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
            <p className="text-sm text-muted-foreground">
              Verificando o link de recuperação...
            </p>
          </div>
        </section>
      </SiteLayout>
    );
  }

  if (!sessaoValida) {
    return (
      <SiteLayout>
        <section className="bg-gradient-hero">
          <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft md:p-8">
              <h1 className="font-display text-2xl font-semibold">
                Link inválido ou expirado
              </h1>

              <p className="mt-3 text-sm text-muted-foreground">
                Solicite um novo link de recuperação para redefinir sua senha.
              </p>

              <Button
                type="button"
                className="mt-6 w-full"
                onClick={() =>
                  navigate({
                    to: "/auth",
                    search: {
                      tab: "login",
                    },
                  })
                }
              >
                Voltar para o login
              </Button>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
            <h1 className="font-display text-2xl font-semibold">
              Criar nova senha
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Digite e confirme a nova senha de acesso à sua conta.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nova-senha">Nova senha</Label>

                <Input
                  id="nova-senha"
                  type="password"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmar-senha">
                  Confirmar nova senha
                </Label>

                <Input
                  id="confirmar-senha"
                  type="password"
                  value={confirmacaoSenha}
                  onChange={(event) =>
                    setConfirmacaoSenha(event.target.value)
                  }
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Alterando senha..." : "Alterar senha"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
