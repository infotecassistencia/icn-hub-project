import { useState } from "react";
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
import type { Enums } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth-context";
import {
  AREAS_NUTRICAO,
  ESTADOS_BR,
  TIPOS_EVENTO,
} from "@/lib/constants";

interface Props {
  variant: "evento" | "mentoria";
}

const MAX_BANNER_SIZE = 5 * 1024 * 1024;

export function EventSubmissionForm({ variant }: Props) {
  const { userId, isAuthenticated, isLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    if (!isAuthenticated || !userId) {
      toast.error("Entre em sua conta para realizar o envio.");
      return;
    }

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const banner = form.get("banner");

    if (!(banner instanceof File) || banner.size === 0) {
      toast.error("Selecione uma imagem para o banner.");
      return;
    }

    if (!banner.type.startsWith("image/")) {
      toast.error("O arquivo selecionado deve ser uma imagem.");
      return;
    }

    if (banner.size > MAX_BANNER_SIZE) {
      toast.error("O banner deve possuir no máximo 5 MB.");
      return;
    }

    const dataInformada = String(form.get("data") ?? "");
    const dataEvento = new Date(dataInformada);

    if (!dataInformada || Number.isNaN(dataEvento.getTime())) {
      toast.error("Informe uma data válida.");
      return;
    }

    const valor = Number(form.get("valor") ?? 0);

    if (Number.isNaN(valor) || valor < 0) {
      toast.error("Informe um valor válido.");
      return;
    }

    const modalidade = String(
      form.get("modalidade") ?? "",
    ) as Enums<"modalidade">;

    const area = String(
      form.get("area") ?? "",
    ) as Enums<"area_nutricao">;

    const tipo = String(
      form.get("tipo") ?? "",
    ) as Enums<"tipo_evento">;

    if (!modalidade || !area) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    if (variant === "evento" && !tipo) {
      toast.error("Selecione o tipo do evento.");
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
        banner.name.split(".").pop()?.toLowerCase() ?? "jpg";

      const extensao =
        extensaoOriginal.replace(/[^a-z0-9]/g, "") || "jpg";

      const nomeArquivo = `${generateUniqueId()}.${extensao}`;
      const caminhoArquivo = `${userId}/${nomeArquivo}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(caminhoArquivo, banner, {
          cacheControl: "3600",
          contentType: banner.type,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      bucketEnviado = bucket;
      caminhoEnviado = caminhoArquivo;

      const {
        data: { publicUrl },
      } = supabase.storage
        .from(bucket)
        .getPublicUrl(caminhoArquivo);

      const dadosBase = {
        nome: String(form.get("nome") ?? "").trim(),
        ministrante: String(
          form.get("ministrante") ?? "",
        ).trim(),
        resumo: String(form.get("resumo") ?? "").trim(),
        local: String(form.get("local") ?? "").trim(),
        estado: String(form.get("estado") ?? "").trim(),
        data: dataEvento.toISOString(),
        duracao: String(form.get("duracao") ?? "").trim(),
        valor,
        modalidade,
        area,
        banner_url: publicUrl,
        criado_por: userId,
        status: "pendente" as const,
      };

      if (variant === "evento") {
        const { error } = await supabase
          .from("eventos")
          .insert({
            ...dadosBase,
            tipo,
          });

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase
          .from("mentorias")
          .insert(dadosBase);

        if (error) {
          throw error;
        }
      }

      formElement.reset();

      toast.success("Envio realizado com sucesso!", {
        description:
          "O conteúdo foi enviado para análise da administração.",
      });
    } catch (error) {
      console.error("Erro ao enviar conteúdo:", error);

      if (bucketEnviado && caminhoEnviado) {
        await supabase.storage
          .from(bucketEnviado)
          .remove([caminhoEnviado]);
      }

      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro desconhecido.";

      if (mensagem.toLowerCase().includes("bucket not found")) {
        toast.error("O bucket de banners não foi encontrado.");
        return;
      }

      if (
        mensagem.toLowerCase().includes("row-level security")
      ) {
        toast.error(
          "Você não possui permissão para realizar este envio.",
        );
        return;
      }

      toast.error("Não foi possível realizar o envio.", {
        description: mensagem,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome" required>
          <Input
            name="nome"
            required
            disabled={submitting}
            placeholder={
              variant === "evento"
                ? "Nome do evento"
                : "Nome da mentoria"
            }
          />
        </Field>

        <Field label="Quem ministra" required>
          <Input
            name="ministrante"
            required
            disabled={submitting}
            placeholder="Ex: Dra. Ana Ribeiro"
          />
        </Field>
      </div>

      <Field label="Resumo" required>
        <Textarea
          name="resumo"
          required
          rows={3}
          disabled={submitting}
          placeholder="Descreva em poucas linhas o que os participantes vão vivenciar."
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Local" required>
          <Input
            name="local"
            required
            disabled={submitting}
            placeholder="Cidade, endereço ou Online"
          />
        </Field>

        <Field label="Estado" required>
          <Select
            name="estado"
            required
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="UF" />
            </SelectTrigger>

            <SelectContent>
              {ESTADOS_BR.map((uf) => (
                <SelectItem key={uf} value={uf}>
                  {uf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Data e hora" required>
          <Input
            type="datetime-local"
            name="data"
            required
            disabled={submitting}
          />
        </Field>

        <Field label="Duração" required>
          <Input
            name="duracao"
            required
            disabled={submitting}
            placeholder="Ex: 3 dias, 4 horas"
          />
        </Field>

        <Field label="Valor (R$)" required>
          <Input
            type="number"
            name="valor"
            min="0"
            step="0.01"
            required
            disabled={submitting}
            placeholder="0 para gratuito"
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Modalidade" required>
          <Select
            name="modalidade"
            required
            disabled={submitting}
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

        <Field label="Área da nutrição" required>
          <Select
            name="area"
            required
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>

            <SelectContent>
              {AREAS_NUTRICAO.map((area) => (
                <SelectItem
                  key={area.value}
                  value={area.value}
                >
                  {area.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {variant === "evento" && (
        <Field label="Tipo de evento" required>
          <Select
            name="tipo"
            required
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>

            <SelectContent>
              {TIPOS_EVENTO.map((tipoEvento) => (
                <SelectItem
                  key={tipoEvento.value}
                  value={tipoEvento.value}
                >
                  {tipoEvento.label}
                </SelectItem>
              ))}
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
          disabled={submitting}
        />
      </Field>

      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        Após o envio, o conteúdo ficará como{" "}
        <strong>pendente</strong> até a validação da equipe.
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={submitting || isLoading}
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
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label}{" "}
        {required && (
          <span className="text-destructive">*</span>
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

function generateUniqueId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 15)}`;
}