import { Link } from "@tanstack/react-router";

const FOOTER_NAV = [
  {
    title: "Explore",
    links: [
      { to: "/eventos", label: "Eventos" },
      { to: "/mentorias", label: "Mentorias" },
      { to: "/sobre", label: "Sobre" },
      { to: "/contato", label: "Contato" },
    ],
  },
  {
    title: "Para organizadores",
    links: [
      {
        to: "/eventos/novo",
        label: "Divulgar evento",
      },
      {
        to: "/mentorias/nova",
        label: "Anunciar mentoria",
      },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-primary text-primary-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-[42%] opacity-[0.07]"
      >
        <div className="absolute -right-24 top-8 h-72 w-72 rounded-full border border-primary-foreground/50" />
        <div className="absolute right-10 top-32 h-44 w-44 rounded-full border border-primary-foreground/40" />
        <div className="absolute -right-8 bottom-0 h-56 w-40 rotate-12 rounded-[100%_0_100%_0] bg-primary-foreground/30" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] md:py-16">
        <div>
          <Link
            to="/"
            aria-label="Página inicial do ICN Hub"
            className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/70 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            <img
              src="/brand/icn-hub-logo.png"
              alt="ICN Hub"
              className="h-16 w-auto max-w-[210px] object-contain brightness-0 invert"
            />
          </Link>

          <p className="mt-5 max-w-md text-sm leading-6 text-primary-foreground/72">
            Ponto de encontro entre teoria, prática e
            carreira. Conectamos estudantes e nutricionistas
            às melhores oportunidades de desenvolvimento
            profissional.
          </p>

          <p className="mt-5 text-xs uppercase tracking-[0.18em] text-primary-foreground/55">
            Nutrição · Conexão · Educação · Comunidade
          </p>
        </div>

        {FOOTER_NAV.map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-foreground">
              {section.title}
            </h2>

            <ul className="mt-5 space-y-3">
              {section.links.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-primary-foreground/68 transition-colors hover:text-primary-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="relative border-t border-primary-foreground/12">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-5 text-xs text-primary-foreground/55 sm:flex-row sm:items-center sm:px-6">
          <span>
            © {new Date().getFullYear()} ICN Hub · Isadora
            Liberato
          </span>

          <span>
            Ponto de encontro entre teoria, prática e
            carreira.
          </span>
        </div>
      </div>
    </footer>
  );
}