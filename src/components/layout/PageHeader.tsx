import type { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  compact?: boolean;
}

/**
 * Cabeçalho padronizado para páginas internas.
 * As cores são controladas pelas variáveis globais dos temas claro e escuro.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  compact,
}: Props) {
  return (
    <section className="border-b border-border/60 bg-gradient-hero text-foreground">
      <div
        className={`mx-auto max-w-7xl px-4 sm:px-6 ${
          compact ? "py-8 md:py-10" : "py-10 md:py-14"
        }`}
      >
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0 max-w-3xl">
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                {eyebrow}
              </p>
            ) : null}

            <h1 className="mt-1 font-display text-3xl font-semibold leading-tight text-foreground md:text-4xl">
              {title}
            </h1>

            {description ? (
              <p className="mt-2 max-w-2xl text-base text-muted-foreground md:text-[17px]">
                {description}
              </p>
            ) : null}
          </div>

          {actions ? (
            <div className="flex flex-wrap gap-2">{actions}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}