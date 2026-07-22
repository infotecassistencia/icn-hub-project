import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Clock,
  MapPin,
  User2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { areaLabel } from "@/lib/constants";
import type { Evento, Mentoria } from "@/lib/types";

type Item = Evento | Mentoria;

interface Props {
  item: Item;
  basePath: "/eventos" | "/mentorias";
}

export function EventCard({
  item,
  basePath,
}: Props) {
  const gratuito = item.valor === 0;
  const data = new Date(item.data);

  const to =
    basePath === "/eventos"
      ? "/eventos/$id"
      : "/mentorias/$id";

  const ministranteNome = item.ministrante
    .split("+")[0]
    .trim();

  const preco = gratuito
    ? "Gratuito"
    : `R$ ${item.valor.toLocaleString("pt-BR")}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border/80 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-soft">
      <Link
        to={to}
        params={{ id: item.id }}
        aria-label={`Ver detalhes de ${item.nome}`}
        className="relative block overflow-hidden"
      >
        <div
          className="aspect-[16/10] w-full bg-secondary bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          style={{
            backgroundImage: `url(${item.bannerUrl})`,
          }}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/45 via-transparent to-transparent" />

        <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-4">
          <Badge
            variant="secondary"
            className="rounded-full border border-white/30 bg-background/85 px-3 py-1 text-[10px] font-semibold capitalize text-foreground shadow-none backdrop-blur-md"
          >
            {item.modalidade}
          </Badge>

          <Badge
            className={
              gratuito
                ? "rounded-full border-0 bg-secondary px-3 py-1 text-[10px] font-semibold text-primary shadow-none"
                : "rounded-full border-0 bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground shadow-none"
            }
          >
            {preco}
          </Badge>
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
          {areaLabel(item.area)}
        </div>

        <Link
          to={to}
          params={{ id: item.id }}
          className="mt-2 block"
        >
          <h3 className="line-clamp-2 font-display text-xl font-semibold leading-snug tracking-[-0.02em] text-foreground transition-colors group-hover:text-primary">
            {item.nome}
          </h3>

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {item.resumo}
          </p>
        </Link>

        <div className="mt-auto border-t border-border/70 pt-5">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs text-muted-foreground">
            <EventInfo
              icon={
                <CalendarDays className="h-4 w-4" />
              }
              label={data.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            />

            <EventInfo
              icon={<Clock className="h-4 w-4" />}
              label={item.duracao}
            />

            <EventInfo
              icon={<MapPin className="h-4 w-4" />}
              label={item.estado}
            />

            <div className="flex min-w-0 items-center gap-2">
              <User2 className="h-4 w-4 flex-none text-primary/70" />

              {item.mentorSlug ? (
                <Link
                  to="/mentores/$slug"
                  params={{
                    slug: item.mentorSlug,
                  }}
                  className="truncate transition-colors hover:text-primary hover:underline"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >
                  {ministranteNome}
                </Link>
              ) : (
                <span className="truncate">
                  {ministranteNome}
                </span>
              )}
            </div>
          </dl>
        </div>
      </CardContent>
    </article>
  );
}

function EventInfo({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex-none text-primary/70">
        {icon}
      </span>

      <span className="truncate">
        {label}
      </span>
    </div>
  );
}