import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Clock, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { areaLabel } from "@/lib/constants";
import type { Evento, Mentoria } from "@/lib/types";

type Item = Evento | Mentoria;

interface Props {
  item: Item;
  basePath: "/eventos" | "/mentorias";
}

export function EventCard({ item, basePath }: Props) {
  const gratuito = item.valor === 0;
  const data = new Date(item.data);
  const to = basePath === "/eventos" ? "/eventos/$id" : "/mentorias/$id";
  const ministranteNome = item.ministrante.split("+")[0].trim();

  return (
    <article className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-soft">
      <Link to={to} params={{ id: item.id }} className="block">
        <div
          className="aspect-[16/9] w-full bg-secondary bg-cover bg-center"
          style={{ backgroundImage: `url(${item.bannerUrl})` }}
        />
      </Link>
      <CardContent className="p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize">
            {item.modalidade}
          </Badge>
          <Badge className={gratuito ? "bg-accent text-accent-foreground" : "bg-primary"}>
            {gratuito ? "Gratuito" : `R$ ${item.valor.toLocaleString("pt-BR")}`}
          </Badge>
          <Badge variant="outline">{areaLabel(item.area)}</Badge>
        </div>

        <Link to={to} params={{ id: item.id }} className="block">
          <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-primary">
            {item.nome}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.resumo}</p>
        </Link>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {data.toLocaleDateString("pt-BR")}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {item.duracao}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {item.estado}
          </span>
          <span className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            {item.mentorSlug ? (
              <Link
                to="/mentores/$slug"
                params={{ slug: item.mentorSlug }}
                className="truncate hover:text-primary hover:underline"
              >
                {ministranteNome}
              </Link>
            ) : (
              <span className="truncate">{ministranteNome}</span>
            )}
          </span>
        </div>
      </CardContent>
    </article>
  );
}
