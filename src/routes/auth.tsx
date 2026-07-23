import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import {
  useEffect,
  useState,
} from "react";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  tab: z.enum(["login", "cadastro"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,

  head: () => ({
    meta: [
      {
        title: "Entrar ou criar conta — ICN Hub",
      },
      {
        name: "description",
        content:
          "Acesse ou crie sua conta no ICN Hub.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),

  beforeLoad: ({ context: _ctx }) => {
    // A verificação de autenticação é feita no componente.
  },

  component: AuthPage,
});

function AuthPage() {
  const { tab } = Route.useSearch();
  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  const navigate = useNavigate();

  const [active, setActive] = useState<
    "login" | "cadastro"
  >(tab ?? "login");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({
        to: "/dashboard",
        replace: true,
      });
    }
  }, [
    isLoading,
    isAuthenticated,
    navigate,
  ]);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          Verificando sua sessão...
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
            <h1 className="font-display text-2xl font-semibold">
              Bem-vindo(a) ao ICN Hub
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Acesse sua conta ou crie uma para salvar
              eventos e divulgar mentorias.
            </p>

            <Tabs
              value={active}
              onValueChange={(value) =>
                setActive(
                  value as "login" | "cadastro",
                )
              }
              className="mt-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">
                  Entrar
                </TabsTrigger>

                <TabsTrigger value="cadastro">
                  Criar conta
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="login"
                className="mt-6"
              >
                <LoginForm />
              </TabsContent>

              <TabsContent
                value="cadastro"
                className="mt-6"
              >
                <RegisterForm
                  onCpfExists={() =>
                    setActive("login")
                  }
                />
              </TabsContent>
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

  const [loading, setLoading] =
    useState(false);

  const [
    forgotPassword,
    setForgotPassword,
  ] = useState(false);

  const [
    recoveryEmail,
    setRecoveryEmail,
  ] = useState("");

  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const form = new FormData(
      event.currentTarget,
    );

    const email = String(
      form.get("email"),
    )
      .trim()
      .toLowerCase();

    const password = String(
      form.get("senha"),
    );

    setLoading(true);

    try {
      await login(email, password);

      toast.success(
        "Login realizado com sucesso.",
      );

      await navigate({
        to: "/dashboard",
        replace: true,
      });
    } catch (error) {
      console.error(
        "Erro no login:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message.toLowerCase()
          : "";

      if (
        message.includes(
          "email not confirmed",
        ) ||
        message.includes(
          "email_not_confirmed",
        )
      ) {
        toast.error(
          "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.",
        );

        return;
      }

      toast.error(
        "E-mail ou senha inválidos.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const email = recoveryEmail
      .trim()
      .toLowerCase();

    if (!email) {
      toast.error(
        "Informe seu e-mail.",
      );

      return;
    }

    setLoading(true);

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/redefinir-senha`,
          },
        );

      if (error) {
        throw error;
      }

      toast.success(
        "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.",
      );

      setForgotPassword(false);
      setRecoveryEmail("");
    } catch (error) {
      console.error(
        "Erro ao enviar recuperação de senha:",
        error,
      );

      toast.error(
        "Não foi possível enviar o link de recuperação.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (forgotPassword) {
    return (
      <form
        onSubmit={
          handleForgotPassword
        }
        className="space-y-4"
      >
        <div>
          <h2 className="font-display text-xl font-semibold">
            Recuperar senha
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Informe o e-mail utilizado no
            cadastro.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="recovery-email">
            E-mail
          </Label>

          <Input
            id="recovery-email"
            type="email"
            value={recoveryEmail}
            onChange={(event) =>
              setRecoveryEmail(
                event.target.value,
              )
            }
            required
            autoComplete="email"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading
            ? "Enviando..."
            : "Enviar link de recuperação"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() =>
            setForgotPassword(false)
          }
          disabled={loading}
        >
          Voltar para o login
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="login-email">
          E-mail
        </Label>

        <Input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">
            Senha
          </Label>

          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
            onClick={() =>
              setForgotPassword(true)
            }
          >
            Esqueci minha senha
          </button>
        </div>

        <Input
          id="login-password"
          name="senha"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading
          ? "Entrando..."
          : "Entrar"}
      </Button>
    </form>
  );
}

function RegisterForm({
  onCpfExists,
}: {
  onCpfExists: () => void;
}) {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [tipo, setTipo] =
    useState<TipoUsuario>(
      "nutricionista",
    );

  const [telefone, setTelefone] =
    useState("");

  const [cpf, setCpf] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleTelefoneChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const formattedPhone =
      formatBrazilianPhone(
        event.target.value,
      );

    setTelefone(formattedPhone);
  };

  const handleCpfChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const formattedCpf = formatCpf(
      event.target.value,
    );

    setCpf(formattedCpf);
  };

  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const form = new FormData(
      event.currentTarget,
    );

    const nome = String(
      form.get("nome"),
    ).trim();

    const email = String(
      form.get("email"),
    )
      .trim()
      .toLowerCase();

    const normalizedPhone =
      normalizePhone(telefone);

    const normalizedCpf =
      normalizeCpf(cpf);

    const password = String(
      form.get("senha"),
    );

    if (!nome) {
      toast.error(
        "Informe seu nome completo.",
      );

      return;
    }

    if (
      !isValidBrazilianPhone(
        normalizedPhone,
      )
    ) {
      toast.error(
        "Informe um telefone válido com DDD.",
      );

      return;
    }

    if (!isValidCpf(normalizedCpf)) {
      toast.error(
        "Informe um CPF válido.",
      );

      return;
    }

    setLoading(true);

    try {
      const {
        data: cpfExists,
        error: cpfCheckError,
      } = await supabase.rpc(
        "cpf_already_registered",
        {
          input_cpf: normalizedCpf,
        },
      );

      if (cpfCheckError) {
        console.error(
          "Erro ao consultar CPF:",
          cpfCheckError,
        );

        toast.error(
          "Não foi possível verificar o CPF. Tente novamente.",
        );

        return;
      }

      if (cpfExists) {
        onCpfExists();

        toast.error(
          "Já existe um cadastro com este CPF. Entre com seu e-mail e senha.",
        );

        return;
      }

      const {
        requiresEmailConfirmation,
      } = await register({
        nome,
        email,
        telefone: normalizedPhone,
        cpf: normalizedCpf,
        password,
        tipo,

        crn: form.get("crn")
          ? String(
              form.get("crn"),
            ).trim()
          : undefined,

        areaAtuacao: form.get(
          "areaAtuacao",
        )
          ? String(
              form.get(
                "areaAtuacao",
              ),
            ).trim()
          : undefined,

        instituicao: form.get(
          "instituicao",
        )
          ? String(
              form.get(
                "instituicao",
              ),
            ).trim()
          : undefined,

        semestre: form.get(
          "semestre",
        )
          ? String(
              form.get("semestre"),
            ).trim()
          : undefined,
      });

      if (
        requiresEmailConfirmation
      ) {
        toast.success(
          "Cadastro realizado. Confirme seu e-mail para acessar a conta.",
        );

        await navigate({
          to: "/confirmar-email",
          search: {
            email,
          },
          replace: true,
        });

        return;
      }

      toast.success(
        "Cadastro criado com sucesso.",
      );

      await navigate({
        to: "/dashboard",
        replace: true,
      });
    } catch (error) {
      console.error(
        "Erro ao cadastrar usuário:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message.toLowerCase()
          : "";

      if (
        message.includes(
          "duplicate",
        ) ||
        message.includes("cpf") ||
        message.includes(
          "database error saving new user",
        )
      ) {
        onCpfExists();

        toast.error(
          "Já existe um cadastro com este CPF. Entre ou recupere sua senha.",
        );

        return;
      }

      toast.error(
        "Não foi possível cadastrar.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4"
    >
      <Field label="Nome completo">
        <Input
          name="nome"
          required
          autoComplete="name"
        />
      </Field>

      <Field label="E-mail">
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Telefone">
          <Input
            name="telefone"
            type="tel"
            value={telefone}
            onChange={
              handleTelefoneChange
            }
            placeholder="(51) 99999-9999"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={15}
            required
          />
        </Field>

        <Field label="CPF">
          <Input
            name="cpf"
            value={cpf}
            onChange={handleCpfChange}
            placeholder="000.000.000-00"
            inputMode="numeric"
            autoComplete="off"
            maxLength={14}
            required
          />
        </Field>
      </div>

      <Field label="Senha">
        <Input
          name="senha"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </Field>

      <Field label="Você é">
        <Select
          value={tipo}
          onValueChange={(value) =>
            setTipo(
              value as TipoUsuario,
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {TIPOS_USUARIO.map(
              (item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </Field>

      {tipo === "estudante" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Instituição de ensino">
            <Input
              name="instituicao"
              required
            />
          </Field>

          <Field label="Semestre do curso">
            <Input
              name="semestre"
              required
            />
          </Field>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="CRN">
            <Input
              name="crn"
              required
              placeholder="Ex: CRN-3/00000"
            />
          </Field>

          <Field label="Área de atuação">
            <Input
              name="areaAtuacao"
              required
            />
          </Field>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading
          ? "Criando conta..."
          : "Criar conta"}
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label}
      </Label>

      {children}
    </div>
  );
}

function normalizeCpf(
  value: string,
): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 11);
}

function formatCpf(
  value: string,
): string {
  const digits = normalizeCpf(value);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(
      0,
      3,
    )}.${digits.slice(3)}`;
  }

  if (digits.length <= 9) {
    return `${digits.slice(
      0,
      3,
    )}.${digits.slice(
      3,
      6,
    )}.${digits.slice(6)}`;
  }

  return `${digits.slice(
    0,
    3,
  )}.${digits.slice(
    3,
    6,
  )}.${digits.slice(
    6,
    9,
  )}-${digits.slice(9)}`;
}

function isValidCpf(
  value: string,
): boolean {
  const cpf = normalizeCpf(value);

  if (cpf.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calculateDigit = (
    base: string,
    factor: number,
  ): number => {
    let total = 0;

    for (
      let index = 0;
      index < base.length;
      index += 1
    ) {
      total +=
        Number(base[index]) *
        (factor - index);
    }

    const remainder =
      (total * 10) % 11;

    return remainder === 10
      ? 0
      : remainder;
  };

  const firstDigit =
    calculateDigit(
      cpf.slice(0, 9),
      10,
    );

  if (
    firstDigit !==
    Number(cpf[9])
  ) {
    return false;
  }

  const secondDigit =
    calculateDigit(
      cpf.slice(0, 10),
      11,
    );

  return (
    secondDigit ===
    Number(cpf[10])
  );
}

function normalizePhone(
  value: string,
): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 11);
}

function formatBrazilianPhone(
  value: string,
): string {
  const digits =
    normalizePhone(value);

  if (digits.length === 0) {
    return "";
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  const ddd = digits.slice(0, 2);
  const number = digits.slice(2);

  if (number.length <= 4) {
    return `(${ddd}) ${number}`;
  }

  if (number.length <= 8) {
    return `(${ddd}) ${number.slice(
      0,
      4,
    )}-${number.slice(4)}`;
  }

  return `(${ddd}) ${number.slice(
    0,
    5,
  )}-${number.slice(5, 9)}`;
}

function isValidBrazilianPhone(
  value: string,
): boolean {
  const phone =
    normalizePhone(value);

  if (
    phone.length !== 10 &&
    phone.length !== 11
  ) {
    return false;
  }

  if (/^(\d)\1+$/.test(phone)) {
    return false;
  }

  const ddd = Number(
    phone.slice(0, 2),
  );

  if (ddd < 11 || ddd > 99) {
    return false;
  }

  const subscriberNumber =
    phone.slice(2);

  if (phone.length === 11) {
    return (
      subscriberNumber[0] === "9"
    );
  }

  return /^[2-5]\d{7}$/.test(
    subscriberNumber,
  );
}

