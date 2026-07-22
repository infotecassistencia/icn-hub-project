import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, ImageIcon, Loader2 } from "lucide-react";
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
import type {
  Enums,
  Tables,
} from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth-context";
import {
  AREAS_NUTRICAO,
  ESTADOS_BR,
  TIPOS_EVENTO,
} from "@/lib/constants";

interface EventEditFormProps {
  eventId: string;
}

type Evento = Tables<"eventos">;

interface FormularioEvento {
  nome: string;
  ministrante: string;
  resumo: string;
  local: string;
  estado: string;
  data: string;
  duracao: string;
  valor: string;
  modalidade: Enums<"modalidade"> | "";
  area: Enums<"area_nutricao"> | "";
  tipo: Enums<"tipo_evento"> | "";
}

const FORMULARIO_INICIAL: FormularioEvento = {
  nome: "",
  ministrante: "",
  resumo: "",
  local: "",
  estado: "",
  data: "",
  duracao: "",
  valor: "",
  modalidade: "",
  area: "",
  tipo: "",
};

const MAX_BANNER_SIZE = 5 * 1024 * 1024;
const EVENT_BANNER_BUCKET = "event-banners";

export function EventEditForm({
  eventId,
}: EventEditFormProps) {
  const navigate = useNavigate();

  const {
    userId,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const [evento, setEvento] = useState<Evento | null>(
    null,
  );

  const [formulario, setFormulario] =
    useState<FormularioEvento>(FORMULARIO_INICIAL);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [novoBanner, setNovoBanner] =
    useState<File | null>(null);

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarEvento() {
      if (authLoading) {
        return;
      }

      if (!isAuthenticated || !userId) {
        if (componenteAtivo) {
          setErro(
            "Você precisa estar autenticado para editar este evento.",
          );
          setLoading(false);
        }

        return;
      }

      setLoading(true);
      setErro(null);

      try {
        const { data, error } = await supabase
          .from("eventos")
          .select("*")
          .eq("id", eventId)
          .eq("criado_por", userId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error(
            "Evento não encontrado ou você não possui permissão para editá-lo.",
          );
        }

        if (data.status !== "recusado") {
          throw new Error(
            "Somente eventos recusados podem ser editados e reenviados.",
          );
        }

        if (!componenteAtivo) {
          return;
        }

        setEvento(data);

        setFormulario({
          nome: data.nome,
          ministrante: data.ministrante,
          resumo: data.resumo,
          local: data.local,
          estado: data.estado,
          data: converterParaDatetimeLocal(data.data),
          duracao: data.duracao,
          valor: String(data.valor),
          modalidade: data.modalidade,
          area: data.area,
          tipo: data.tipo,
        });
      } catch (error) {
        console.error(
          "Erro ao carregar evento para edição:",
          error,
        );

        if (!componenteAtivo) {
          return;
        }

        const mensagem =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o evento.";

        setErro(mensagem);

        toast.error(
          "Não foi possível abrir a edição do evento.",
          {
            description: mensagem,
          },
        );
      } finally {
        if (componenteAtivo) {
          setLoading(false);
        }
      }
    }

    void carregarEvento();

    return () => {
      componenteAtivo = false;
    };
  }, [
    authLoading,
    eventId,
    isAuthenticated,
    userId,
  ]);

  const atualizarCampo = <
    Campo extends keyof FormularioEvento,
  >(
    campo: Campo,
    valor: FormularioEvento[Campo],
  ) => {
    setFormulario((estadoAtual) => ({
      ...estadoAtual,
      [campo]: valor,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      submitting ||
      authLoading ||
      !isAuthenticated ||
      !userId ||
      !evento
    ) {
      return;
    }

    const nome = formulario.nome.trim();
    const ministrante = formulario.ministrante.trim();
    const resumo = formulario.resumo.trim();
    const local = formulario.local.trim();
    const estado = formulario.estado.trim();
    const duracao = formulario.duracao.trim();

    if (
      !nome ||
      !ministrante ||
      !resumo ||
      !local ||
      !estado ||
      !duracao ||
      !formulario.data ||
      !formulario.modalidade ||
      !formulario.area ||
      !formulario.tipo
    ) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    const dataEvento = new Date(formulario.data);

    if (Number.isNaN(dataEvento.getTime())) {
      toast.error("Informe uma data válida.");
      return;
    }

    const valor = Number(formulario.valor);

    if (Number.isNaN(valor) || valor < 0) {
      toast.error("Informe um valor válido.");
      return;
    }

    if (novoBanner) {
      if (!novoBanner.type.startsWith("image/")) {
        toast.error(
          "O novo banner precisa ser um arquivo de imagem.",
        );
        return;
      }

      if (novoBanner.size > MAX_BANNER_SIZE) {
        toast.error(
          "O novo banner deve possuir no máximo 5 MB.",
        );
        return;
      }
    }

    setSubmitting(true);

    let novoCaminho: string | null = null;
    let novaBannerUrl = evento.banner_url;

    try {
      /*
       * Caso o usuário tenha escolhido um novo banner,
       * primeiro fazemos o upload.
       */
      if (novoBanner) {
        const extensaoOriginal =
          novoBanner.name
            .split(".")
            .pop()
            ?.toLowerCase() ?? "jpg";

        const extensao =
          extensaoOriginal.replace(/[^a-z0-9]/g, "") ||
          "jpg";

        novoCaminho = `${userId}/${generateUniqueId()}.${extensao}`;

        const { error: uploadError } =
          await supabase.storage
            .from(EVENT_BANNER_BUCKET)
            .upload(novoCaminho, novoBanner, {
              cacheControl: "3600",
              contentType: novoBanner.type,
              upsert: false,
            });

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from(EVENT_BANNER_BUCKET)
          .getPublicUrl(novoCaminho);

        novaBannerUrl = publicUrl;
      }

      /*
       * O filtro criado_por protege contra a edição de
       * eventos pertencentes a outro usuário.
       *
       * O filtro status recusado impede reenvio duplicado
       * ou edição de conteúdo já aprovado/pendente.
       */
      const { data: eventoAtualizado, error: updateError } =
        await supabase
          .from("eventos")
          .update({
            nome,
            ministrante,
            resumo,
            local,
            estado,
            data: dataEvento.toISOString(),
            duracao,
            valor,
            modalidade: formulario.modalidade,
            area: formulario.area,
            tipo: formulario.tipo,
            banner_url: novaBannerUrl,
            status: "pendente",
            motivo_recusa: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", evento.id)
          .eq("criado_por", userId)
          .eq("status", "recusado")
          .select("id")
          .maybeSingle();

      if (updateError) {
        throw updateError;
      }

      if (!eventoAtualizado) {
        throw new Error(
          "O evento não pôde ser atualizado. Ele pode já ter sido reenviado ou não pertencer ao usuário atual.",
        );
      }

      /*
       * O banner antigo só é removido depois que o banco
       * foi atualizado com sucesso.
       */
      if (novoCaminho && evento.banner_url) {
        const caminhoAntigo = extrairCaminhoDoBanner(
          evento.banner_url,
        );

        if (
          caminhoAntigo &&
          caminhoAntigo !== novoCaminho
        ) {
          const { error: removeError } =
            await supabase.storage
              .from(EVENT_BANNER_BUCKET)
              .remove([caminhoAntigo]);

          if (removeError) {
            console.warn(
              "O evento foi atualizado, mas o banner antigo não pôde ser removido:",
              removeError,
            );
          }
        }
      }

      toast.success(
        "Evento reenviado para validação!",
        {
          description:
            "As alterações foram salvas e o status voltou para pendente.",
        },
      );

      await navigate({
        to: "/meus-eventos",
      });
    } catch (error) {
      console.error(
        "Erro ao atualizar e reenviar evento:",
        error,
      );

      /*
       * Se o novo banner foi enviado, mas o UPDATE falhou,
       * removemos esse arquivo para não deixá-lo órfão.
       */
      if (novoCaminho) {
        const { error: cleanupError } =
          await supabase.storage
            .from(EVENT_BANNER_BUCKET)
            .remove([novoCaminho]);

        if (cleanupError) {
          console.warn(
            "Não foi possível remover o novo banner após a falha:",
            cleanupError,
          );
        }
      }

      const mensagem =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro desconhecido.";

      if (
        mensagem.toLowerCase().includes(
          "row-level security",
        )
      ) {
        toast.error(
          "Você não possui permissão para editar este evento.",
        );
        return;
      }

      if (
        mensagem
          .toLowerCase()
          .includes("bucket not found")
      ) {
        toast.error(
          "O bucket de banners não foi encontrado.",
        );
        return;
      }

      toast.error(
        "Não foi possível reenviar o evento.",
        {
          description: mensagem,
        },
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />

          <span>Carregando dados do evento...</span>
        </div>
      </div>
    );
  }

  if (erro || !evento) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

          <div>
            <h2 className="font-medium text-destructive">
              Não foi possível editar este evento
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {erro ?? "Evento não encontrado."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {evento.motivo_recusa && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

            <div>
              <div className="text-sm font-medium text-destructive">
                Motivo da recusa
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {evento.motivo_recusa}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome" required>
          <Input
            name="nome"
            required
            disabled={submitting}
            value={formulario.nome}
            onChange={(event) =>
              atualizarCampo("nome", event.target.value)
            }
          />
        </Field>

        <Field label="Quem ministra" required>
          <Input
            name="ministrante"
            required
            disabled={submitting}
            value={formulario.ministrante}
            onChange={(event) =>
              atualizarCampo(
                "ministrante",
                event.target.value,
              )
            }
          />
        </Field>
      </div>

      <Field label="Resumo" required>
        <Textarea
          name="resumo"
          required
          disabled={submitting}
          rows={3}
          value={formulario.resumo}
          onChange={(event) =>
            atualizarCampo("resumo", event.target.value)
          }
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Local" required>
          <Input
            name="local"
            required
            disabled={submitting}
            value={formulario.local}
            onChange={(event) =>
              atualizarCampo("local", event.target.value)
            }
          />
        </Field>

        <Field label="Estado" required>
          <Select
            disabled={submitting}
            value={formulario.estado}
            onValueChange={(valor) =>
              atualizarCampo("estado", valor)
            }
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
            value={formulario.data}
            onChange={(event) =>
              atualizarCampo("data", event.target.value)
            }
          />
        </Field>

        <Field label="Duração" required>
          <Input
            name="duracao"
            required
            disabled={submitting}
            value={formulario.duracao}
            onChange={(event) =>
              atualizarCampo(
                "duracao",
                event.target.value,
              )
            }
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
            value={formulario.valor}
            onChange={(event) =>
              atualizarCampo("valor", event.target.value)
            }
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Modalidade" required>
          <Select
            disabled={submitting}
            value={formulario.modalidade}
            onValueChange={(valor) =>
              atualizarCampo(
                "modalidade",
                valor as Enums<"modalidade">,
              )
            }
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
            disabled={submitting}
            value={formulario.area}
            onValueChange={(valor) =>
              atualizarCampo(
                "area",
                valor as Enums<"area_nutricao">,
              )
            }
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

      <Field label="Tipo de evento" required>
        <Select
          disabled={submitting}
          value={formulario.tipo}
          onValueChange={(valor) =>
            atualizarCampo(
              "tipo",
              valor as Enums<"tipo_evento">,
            )
          }
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

      <Field
        label="Banner do evento"
        hint="A troca é opcional. JPG, PNG ou WebP, com no máximo 5 MB."
      >
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border bg-muted">
            {evento.banner_url ? (
              <img
                src={evento.banner_url}
                alt={`Banner atual do evento ${evento.nome}`}
                className="aspect-[16/6] w-full object-cover"
              />
            ) : (
              <div className="flex min-h-48 items-center justify-center text-muted-foreground">
                <ImageIcon className="mr-2 h-5 w-5" />
                Banner indisponível
              </div>
            )}
          </div>

          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={submitting}
            onChange={(event) => {
              const arquivo =
                event.target.files?.[0] ?? null;

              setNovoBanner(arquivo);
            }}
          />

          {novoBanner && (
            <p className="text-sm text-muted-foreground">
              Novo banner selecionado:{" "}
              <strong>{novoBanner.name}</strong>
            </p>
          )}
        </div>
      </Field>

<div className="rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
  Ao reenviar, o evento voltará para o status{" "}
  <strong>pendente</strong>, e o motivo da recusa será
  removido.
</div>

<Button
  type="submit"
  size="lg"
  disabled={submitting || authLoading}
  className="w-full md:w-auto"
>
  {submitting
    ? "Salvando e reenviando..."
    : "Salvar e reenviar para validação"}
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

function converterParaDatetimeLocal(
  data: string,
): string {
  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return "";
  }

  const deslocamento =
    dataConvertida.getTimezoneOffset() * 60_000;

  return new Date(
    dataConvertida.getTime() - deslocamento,
  )
    .toISOString()
    .slice(0, 16);
}

function generateUniqueId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID ===
      "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 15)}`;
}

function extrairCaminhoDoBanner(
  publicUrl: string,
): string | null {
  try {
    const url = new URL(publicUrl);

    const marcador =
      `/storage/v1/object/public/${EVENT_BANNER_BUCKET}/`;

    const indice = url.pathname.indexOf(marcador);

    if (indice === -1) {
      return null;
    }

    const caminhoCodificado = url.pathname.slice(
      indice + marcador.length,
    );

    return decodeURIComponent(caminhoCodificado);
  } catch {
    return null;
  }
}
