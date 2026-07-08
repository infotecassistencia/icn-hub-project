import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o ICN Hub" },
      { name: "description", content: "Conheça o ICN Hub, a plataforma que conecta estudantes e nutricionistas às melhores oportunidades de desenvolvimento profissional do país." },
      { property: "og:title", content: "Sobre o ICN Hub" },
      { property: "og:description", content: "Um só lugar para aprender, conectar e evoluir." },
    ],
  }),
  component: Sobre,
});

function Sobre() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-24">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Conheça</p>
          <h1 className="mt-2 font-display text-4xl font-semibold md:text-6xl">ICN Hub</h1>
          <p className="mt-3 text-xl text-muted-foreground">Ponto de encontro entre teoria, prática e carreira.</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            A nutrição está em constante evolução, e acompanhar oportunidades de aprendizado nem sempre
            é simples. Cursos, congressos, mentorias, jornadas, encontros científicos e eventos
            profissionais acontecem o tempo todo, mas muitas vezes estão dispersos em diferentes
            plataformas e canais.
          </p>
          <p><strong>O ICN Hub nasceu para mudar essa realidade.</strong></p>
          <p>
            Somos uma plataforma criada para conectar estudantes e nutricionistas às melhores
            oportunidades de desenvolvimento profissional do país, reunindo em um único lugar eventos
            presenciais e online, gratuitos e pagos, de diversas áreas da Nutrição.
          </p>
          <p>
            Aqui, você encontra exatamente o que procura por meio de filtros inteligentes e
            personalizados, alinhados aos seus objetivos, interesses e momento de carreira.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-8 shadow-card">
          <h2 className="font-display text-2xl font-semibold">O que você encontra no ICN Hub</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              "Cursos e capacitações",
              "Congressos e jornadas científicas",
              "Mentorias e programas de desenvolvimento",
              "Eventos presenciais e online",
              "Oportunidades gratuitas e pagas",
              "Segmentado por área da nutrição",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-primary" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 space-y-6 text-lg leading-relaxed text-foreground/90">
          <h2 className="font-display text-2xl font-semibold">Mais do que uma agenda de eventos</h2>
          <p>
            O ICN Hub é um espaço de conexão. Além de encontrar oportunidades para aprender e crescer
            profissionalmente, você também pode divulgar seus próprios eventos e alcançar uma
            comunidade qualificada de estudantes, nutricionistas, professores, pesquisadores e
            profissionais do mercado.
          </p>
          <p>
            Nossa missão é aproximar pessoas, conhecimento e oportunidades, fortalecendo a educação
            continuada e impulsionando carreiras por meio do acesso facilitado à informação.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
