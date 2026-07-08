import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Mail, MessageSquareText, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — ICN Hub" },
      {
        name: "description",
        content:
          "Fale com o ICN Hub. Envie dúvidas, parcerias, sugestões ou reporte problemas — nossa equipe responde em breve.",
      },
      { property: "og:title", content: "Contato — ICN Hub" },
      { property: "og:description", content: "Envie sua mensagem para a equipe do ICN Hub." },
    ],
  }),
  component: ContatoPage,
});

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("Email inválido").max(254),
  telefone: z.string().trim().max(40).optional(),
  assunto: z.string().trim().min(2, "Informe o assunto").max(200),
  mensagem: z.string().trim().min(10, "Mensagem muito curta").max(5000),
});

function ContatoPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      nome: String(form.get("nome") ?? ""),
      email: String(form.get("email") ?? ""),
      telefone: String(form.get("telefone") ?? "") || undefined,
      assunto: String(form.get("assunto") ?? ""),
      mensagem: String(form.get("mensagem") ?? ""),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifique os campos");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      nome: parsed.data.nome,
      email: parsed.data.email,
      telefone: parsed.data.telefone ?? null,
      assunto: parsed.data.assunto,
      mensagem: parsed.data.mensagem,
      status: "novo",
    });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível enviar. Tente novamente.");
      return;
    }
    setSent(true);
  };

  return (
    <SiteLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <MessageSquareText className="h-3.5 w-3.5" /> Fale com a gente
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold md:text-5xl">Contato</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Dúvidas, parcerias, sugestões ou reporte de problemas: envie sua mensagem
              e nossa equipe retornará em breve.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1fr_360px]">
          <Card className="shadow-card">
            <CardContent className="p-6 md:p-8">
              {sent ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-semibold">Mensagem enviada!</h2>
                  <p className="mt-2 max-w-md text-muted-foreground">
                    Obrigado por entrar em contato. Recebemos sua mensagem e responderemos
                    o mais breve possível.
                  </p>
                  <Button className="mt-6" variant="outline" onClick={() => setSent(false)}>
                    Enviar outra mensagem
                  </Button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Nome completo">
                      <Input name="nome" required maxLength={120} />
                    </Field>
                    <Field label="Email">
                      <Input name="email" type="email" required maxLength={254} />
                    </Field>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Telefone (opcional)">
                      <Input name="telefone" maxLength={40} placeholder="(00) 00000-0000" />
                    </Field>
                    <Field label="Assunto">
                      <Input name="assunto" required maxLength={200} />
                    </Field>
                  </div>
                  <Field label="Mensagem">
                    <Textarea name="mensagem" required minLength={10} maxLength={5000} rows={6} />
                  </Field>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Enviando..." : "Enviar mensagem"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <InfoCard
              icon={<Mail className="h-5 w-5" />}
              title="Email"
              text="contato@icnhub.com.br"
            />
            <InfoCard
              icon={<Phone className="h-5 w-5" />}
              title="Atendimento"
              text="Segunda a sexta, das 9h às 18h"
            />
            <InfoCard
              icon={<MessageSquareText className="h-5 w-5" />}
              title="Parcerias e imprensa"
              text="Descreva sua proposta no formulário — retornaremos por email."
            />
          </div>
        </div>
      </section>
    </SiteLayout>
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

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <Card className="shadow-card">
      <CardContent className="flex items-start gap-3 p-5">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-0.5 text-sm text-muted-foreground">{text}</div>
        </div>
      </CardContent>
    </Card>
  );
}
