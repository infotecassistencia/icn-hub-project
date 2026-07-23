import { useState } from "react";
import type {
  FormEvent,
  ReactNode,
} from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  AREAS_NUTRICAO,
  ESTADOS_BR,
  TIPOS_EVENTO,
} from "@/lib/constants";

import type {
  AreaNutricao,
  Modalidade,
  TipoEvento,
} from "@/lib/types";

interface EventSubmissionFormProps {
  variant: "evento" | "mentoria";
}

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

const MAX_BANNER_SIZE = 5 * 1024 * 1024;

export function EventSubmissionForm({
  variant,
}: EventSubmissionFormProps) {
  const {
    user,
    userId,
    isAuthenticated,
    isLoading,
  } = useAuth();

  const [submitting, setSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    if (!isAuthenticated || !userId || !user) {
      toast.error(
        "Entre em sua conta para realizar o envio.",
      );

      return;
    }

    if (user.tipo === "estudante") {
      toast.error(
        "Você não possui permissão para publicar.",
        {
          description:
            "Contas de estudante podem visualizar eventos e mentorias, mas não podem realizar publicações.",
        },
      );

      return;
    }

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const banner = form.get("banner");

    if (
      !(banner instanceof File) ||
      banner.size === 0
    ) {
      toast.error(
        "Selecione uma imagem para o banner.",
      );

      return;
    }

    if (!banner.type.startsWith("image/")) {
      toast.error(
        "O arquivo selecionado deve ser uma imagem.",
      );

      return;
    }

    if (banner.size > MAX_BANNER_SIZE) {
      toast.error(
        "O banner deve possuir no máximo 5 MB.",
      );

      return;
    }

    const nome = String(
      form.get("nome") ?? "",
    ).trim();

    const ministrante = String(
      form.get("ministrante") ?? "",
    ).trim();

    const resumo = String(
      form.get("resumo") ?? "",
    ).trim();

    const local = String(
      form.get("local") ?? "",
    ).trim();

    const estado = String(
      form.get("estado") ?? "",
    ).trim();

    const duracao = String(
      form.get("duracao") ?? "",
    ).trim();

    if (
      !nome ||
      !ministrante ||
      !resumo ||
      !local ||
      !estado ||
      !duracao
    ) {
      toast.error(
        "Preencha todos os campos obrigatórios.",
      );

      return;
    }

    const dataInformada = String(
      form.get("data") ?? "",
    );

    const dataEvento = new Date(
      dataInformada,
    );

    if (
      !dataInformada ||
      Number.isNaN(dataEvento.getTime())
    ) {
      toast.error("Informe uma data válida.");

      return;
    }

    const valor = Number(
      form.get("valor") ?? 0,
    );

    if (
      Number.isNaN(valor) ||
      valor < 0
    ) {
      toast.error("Informe um valor válido.");

      return;
    }

    const modalidade = String(
      form.get("modalidade") ?? "",
    ) as Modalidade;

    const area = String(
      form.get("area") ?? "",
    ) as AreaNutricao;

    const tipo = String(
      form.get("tipo") ?? "",
    ) as TipoEvento;

    if (!modalidade || !area) {
      toast.error(
        "Preencha todos os campos obrigatórios.",
      );

      return;
    }

    if (
      variant === "evento" &&
      !tipo
    ) {
      toast.error(
        "Selecione o tipo do evento.",
      );

      return;
    }

    setSubmitting(true);

    let bucketEnviado: string | null = null;
    let caminhoEnviado: string | null = null;

    try {
      const bucket =
        variant === "evento"
          ? "event-banners"
          : "mentoria-banners";

      const extensaoOriginal =
        banner.name
          .split(".")
          .pop()
          ?.toLowerCase() ?? "jpg";

      const extensao =
        extensaoOriginal.replace(
          /[^a-z0-9]/g,
          "",
        ) || "jpg";

      const nomeArquivo =
        `${generateUniqueId()}.${extensao}`;

      const caminhoArquivo =
        `${userId}/${nomeArquivo}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from(bucket)
        .upload(
          caminhoArquivo,
          banner,
          {
            cacheControl: "3600",
            contentType: banner.type,
            upsert: false,
          },
        );

      if (uploadError) {
        throw uploadError;
      }

      bucketEnviado = bucket;
      caminhoEnviado = caminhoArquivo;

      const {
        data: {
          publicUrl,
        },
      } = supabase.storage
        .from(bucket)
        .getPublicUrl(caminhoArquivo);

      const dadosBase = {
        nome,
        ministrante,
        resumo,
        local,
        estado,
        data: dataEvento.toISOString(),
        duracao,
        valor,
        modalidade,
        area,
        banner_url: publicUrl,
        criado_por: userId,
        status: "pendente" as const,
      };

      if (variant === "evento") {
        const {
          error,
        } = await supabase
          .from("eventos")
          .insert({
            ...dadosBase,
            tipo,
          });

        if (error) {
          throw error;
        }
      } else {
        const {
          error,
        } = await supabase
          .from("mentorias")
          .insert(dadosBase);

        if (error) {
          throw error;
        }
      }

      formElement.reset();

      toast.success(
        "Envio realizado com sucesso!",
        {
          description:
            "O conteúdo foi enviado para análise da administração.",
        },
      );
    } catch (error) {
      console.error(
        "Erro ao enviar conteúdo:",
        error,
      );

      if (
        bucketEnviado &&
        caminhoEnviado
      ) {
        const {
          error: removeError,
        } = await supabase.storage
          .from(bucketEnviado)
          .remove([
            caminhoEnviado,
          ]);

        if (removeError) {
          console.error(
            "Erro ao remover banner após falha:",
            removeError,
          );
        }
      }

      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro desconhecido.";

      const mensagemNormalizada =
        mensagem.toLowerCase();

      if (
        mensagemNormalizada.includes(
          "bucket not found",
        )
      ) {
        toast.error(
          "O bucket de banners não foi encontrado.",
        );

        return;
      }

      if (
        mensagemNormalizada.includes(
          "row-level security",
        ) ||
        mensagemNormalizada.includes(
          "permission denied",
        ) ||
        mensagemNormalizada.includes(
          "violates row-level security",
        )
      ) {
        toast.error(
          "Você não possui permissão para realizar este envio.",
        );

        return;
      }

      toast.error(
        "Não foi possível realizar o envio.",
        {
          description: mensagem,
        },
      );
    } finally {
      setSubmitting(false);
    }
  }

  const camposDesabilitados =
    submitting ||
    isLoading ||
    !isAuthenticated ||
    user?.tipo === "estudante";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Nome"
          required
        >
          <Input
            name="nome"
            required
            disabled={camposDesabilitados}
            placeholder={
              variant === "evento"
                ? "Nome do evento"
                : "Nome da mentoria"
            }
          />
        </Field>

        <Field
          label="Quem ministra"
          required
        >
          <Input
            name="ministrante"
            required
            disabled={camposDesabilitados}
            placeholder="Ex: Dra. Ana Ribeiro"
          />
        </Field>
      </div>

      <Field
        label="Resumo"
        required
      >
        <Textarea
          name="resumo"
          required
          rows={3}
          disabled={camposDesabilitados}
          placeholder="Descreva em poucas linhas o que os participantes vão vivenciar."
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Local"
          required
        >
          <Input
            name="local"
            required
            disabled={camposDesabilitados}
            placeholder="Cidade, endereço ou Online"
          />
        </Field>

        <Field
          label="Estado"
          required
        >
          <Select
            name="estado"
            required
            disabled={camposDesabilitados}
          >
            <SelectTrigger>
              <SelectValue placeholder="UF" />
            </SelectTrigger>

            <SelectContent>
              {ESTADOS_BR.map((uf) => (
                <SelectItem
                  key={uf}
                  value={uf}
                >
                  {uf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field
          label="Data e hora"
          required
        >
          <Input
            type="datetime-local"
            name="data"
            required
            disabled={camposDesabilitados}
          />
        </Field>

        <Field
          label="Duração"
          required
        >
          <Input
            name="duracao"
            required
            disabled={camposDesabilitados}
            placeholder="Ex: 3 dias, 4 horas"
          />
        </Field>

        <Field
          label="Valor (R$)"
          required
        >
          <Input
            type="number"
            name="valor"
            min="0"
            step="0.01"
            required
            disabled={camposDesabilitados}
            placeholder="0 para gratuito"
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Modalidade"
          required
        >
          <Select
            name="modalidade"
            required
            disabled={camposDesabilitados}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="presencial">
                Presencial
              </SelectItem>

              <SelectItem value="online">
                Online
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Área da nutrição"
          required
        >
          <Select
            name="area"
            required
            disabled={camposDesabilitados}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>

            <SelectContent>
              {AREAS_NUTRICAO.map(
                (areaNutricional) => (
                  <SelectItem
                    key={
                      areaNutricional.value
                    }
                    value={
                      areaNutricional.value
                    }
                  >
                    {
                      areaNutricional.label
                    }
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {variant === "evento" && (
        <Field
          label="Tipo de evento"
          required
        >
          <Select
            name="tipo"
            required
            disabled={camposDesabilitados}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>

            <SelectContent>
              {TIPOS_EVENTO.map(
                (tipoEvento) => (
                  <SelectItem
                    key={tipoEvento.value}
                    value={tipoEvento.value}
                  >
                    {tipoEvento.label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </Field>
      )}

      <Field
        label="Imagem para banner"
        required
        hint="JPG, PNG ou WebP, com no máximo 5 MB."
      >
        <Input
          type="file"
          name="banner"
          accept="image/jpeg,image/png,image/webp"
          required
          disabled={camposDesabilitados}
        />
      </Field>

      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <span>
          Após o envio, o conteúdo ficará como{" "}
          <strong>pendente</strong> até a
          validação da equipe.
        </span>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={camposDesabilitados}
        className="w-full md:w-auto"
      >
        {submitting
          ? "Enviando..."
          : `Enviar ${
              variant === "evento"
                ? "evento"
                : "mentoria"
            } para validação`}
      </Button>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label}{" "}
        {required && (
          <span className="text-destructive">
            *
          </span>
        )}
      </Label>

      {children}

      {hint && (
        <p className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

function generateUniqueId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}