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
import { AREAS_NUTRICAO, ESTADOS_BR, TIPOS_EVENTO } from "@/lib/constants";

interface Props {
  variant: "evento" | "mentoria";
}

export function EventSubmissionForm({ variant }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: enviar para Lovable Cloud (tabela `eventos` / `mentorias`, status = pendente)
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    (e.target as HTMLFormElement).reset();
    toast.success("Envio recebido!", {
      description: "Nossa equipe fará a validação e retornará em até 3 horas.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome" required>
          <Input name="nome" required placeholder={variant === "evento" ? "Nome do evento" : "Nome da mentoria"} />
        </Field>
        <Field label="Quem ministra" required>
          <Input name="ministrante" required placeholder="Ex: Dra. Ana Ribeiro" />
        </Field>
      </div>

      <Field label="Resumo" required>
        <Textarea name="resumo" required rows={3} placeholder="Descreva em poucas linhas o que os participantes vão vivenciar." />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Local" required>
          <Input name="local" required placeholder="Cidade, endereço ou 'Online'" />
        </Field>
        <Field label="Estado" required>
          <Select name="estado" required>
            <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
            <SelectContent>
              {ESTADOS_BR.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Data e hora" required>
          <Input type="datetime-local" name="data" required />
        </Field>
        <Field label="Duração" required>
          <Input name="duracao" required placeholder="Ex: 3 dias, 4 horas" />
        </Field>
        <Field label="Valor (R$)" required>
          <Input type="number" name="valor" min="0" step="0.01" required placeholder="0 para gratuito" />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Modalidade" required>
          <Select name="modalidade" required>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="presencial">Presencial</SelectItem>
              <SelectItem value="online">Online</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Área da nutrição" required>
          <Select name="area" required>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {AREAS_NUTRICAO.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {variant === "evento" && (
        <Field label="Tipo de evento" required>
          <Select name="tipo" required>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {TIPOS_EVENTO.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      )}

      <Field label="Imagem para banner" hint="JPG ou PNG, preferência 1200x675">
        <Input type="file" name="banner" accept="image/*" />
      </Field>

      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        Após o envio, nossa equipe faz a validação e retorna em até <strong>3 horas</strong>.
      </div>

      <Button type="submit" size="lg" disabled={submitting} className="w-full md:w-auto">
        {submitting ? "Enviando..." : `Enviar ${variant === "evento" ? "evento" : "mentoria"} para validação`}
      </Button>
    </form>
  );
}

function Field({
  label, required, hint, children,
}: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
