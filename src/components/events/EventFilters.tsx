import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AREAS_NUTRICAO, ESTADOS_BR } from "@/lib/constants";
import type { FiltrosBusca } from "@/lib/types";

interface Props {
  value: FiltrosBusca;
  onChange: (next: FiltrosBusca) => void;
}

export function EventFilters({ value, onChange }: Props) {
  const set = <K extends keyof FiltrosBusca>(k: K, v: FiltrosBusca[K]) =>
    onChange({ ...value, [k]: v });

  const activeCount = [
    value.modalidade && value.modalidade !== "todos",
    value.pagamento && value.pagamento !== "todos",
    value.estado && value.estado !== "todos",
    value.area && value.area !== "todos",
    Boolean(value.busca),
  ].filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground hover:text-foreground"
            onClick={() => onChange({})}
          >
            <X className="mr-1 h-3.5 w-3.5" /> Limpar
          </Button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-6">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, tema ou ministrante"
            className="pl-9"
            value={value.busca ?? ""}
            onChange={(e) => set("busca", e.target.value)}
          />
        </div>

        <Select
          value={value.modalidade ?? "todos"}
          onValueChange={(v) => set("modalidade", v as FiltrosBusca["modalidade"])}
        >
          <SelectTrigger><SelectValue placeholder="Modalidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas modalidades</SelectItem>
            <SelectItem value="presencial">Presencial</SelectItem>
            <SelectItem value="online">Online</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={value.pagamento ?? "todos"}
          onValueChange={(v) => set("pagamento", v as FiltrosBusca["pagamento"])}
        >
          <SelectTrigger><SelectValue placeholder="Pagamento" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Pago e gratuito</SelectItem>
            <SelectItem value="gratuito">Gratuito</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={value.estado ?? "todos"}
          onValueChange={(v) => set("estado", v)}
        >
          <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os estados</SelectItem>
            {ESTADOS_BR.map((uf) => (
              <SelectItem key={uf} value={uf}>{uf}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.area ?? "todos"}
          onValueChange={(v) => set("area", v as FiltrosBusca["area"])}
        >
          <SelectTrigger><SelectValue placeholder="Área" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as áreas</SelectItem>
            {AREAS_NUTRICAO.map((a) => (
              <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function aplicarFiltros<T extends { nome: string; resumo: string; ministrante: string; modalidade: string; valor: number; estado: string; area: string; status: string }>(
  items: T[],
  f: FiltrosBusca,
): T[] {
  return items.filter((i) => {
    if (i.status !== "aprovado") return false;
    if (f.modalidade && f.modalidade !== "todos" && i.modalidade !== f.modalidade) return false;
    if (f.pagamento === "gratuito" && i.valor !== 0) return false;
    if (f.pagamento === "pago" && i.valor === 0) return false;
    if (f.estado && f.estado !== "todos" && i.estado !== f.estado) return false;
    if (f.area && f.area !== "todos" && i.area !== f.area) return false;
    if (f.busca) {
      const q = f.busca.toLowerCase();
      if (
        !i.nome.toLowerCase().includes(q) &&
        !i.resumo.toLowerCase().includes(q) &&
        !i.ministrante.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });
}
