import { supabase } from "@/integrations/supabase/client";
import type { Evento, Mentoria, FiltrosBusca } from "@/lib/types";

type MentorLite = { slug: string | null } | null;

type EventoRow = {
  id: string;
  nome: string;
  resumo: string;
  descricao: string | null;
  local: string;
  estado: string;
  data: string;
  duracao: string;
  valor: number | string;
  ministrante: string;
  banner_url: string;
  modalidade: Evento["modalidade"];
  tipo: Evento["tipo"];
  area: Evento["area"];
  status: Evento["status"];
  created_at: string;
  criado_por: string | null;
  mentor: MentorLite;
};

type MentoriaRow = Omit<EventoRow, "tipo"> & { tipo?: never };

const EVENTO_SELECT =
  "id, nome, resumo, descricao, local, estado, data, duracao, valor, ministrante, banner_url, modalidade, tipo, area, status, created_at, criado_por, mentor:mentores(slug)";

const MENTORIA_SELECT =
  "id, nome, resumo, descricao, local, estado, data, duracao, valor, ministrante, banner_url, modalidade, area, status, created_at, criado_por, mentor:mentores(slug)";

function mapEvento(r: EventoRow): Evento {
  return {
    id: r.id,
    nome: r.nome,
    resumo: r.resumo,
    descricao: r.descricao ?? undefined,
    local: r.local,
    estado: r.estado,
    data: r.data,
    duracao: r.duracao,
    valor: Number(r.valor),
    ministrante: r.ministrante,
    mentorSlug: r.mentor?.slug ?? undefined,
    bannerUrl: r.banner_url,
    modalidade: r.modalidade,
    tipo: r.tipo,
    area: r.area,
    status: r.status,
    criadoEm: r.created_at,
    criadoPor: r.criado_por ?? undefined,
  };
}

function mapMentoria(r: MentoriaRow): Mentoria {
  return {
    id: r.id,
    nome: r.nome,
    resumo: r.resumo,
    descricao: r.descricao ?? undefined,
    local: r.local,
    estado: r.estado,
    data: r.data,
    duracao: r.duracao,
    valor: Number(r.valor),
    ministrante: r.ministrante,
    mentorSlug: r.mentor?.slug ?? undefined,
    bannerUrl: r.banner_url,
    modalidade: r.modalidade,
    area: r.area,
    status: r.status,
    criadoEm: r.created_at,
    criadoPor: r.criado_por ?? undefined,
  };
}

function applyFilters<T>(q: T, f: FiltrosBusca): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = q;
  query = query.eq("status", "aprovado");
  if (f.modalidade && f.modalidade !== "todos") query = query.eq("modalidade", f.modalidade);
  if (f.area && f.area !== "todos") query = query.eq("area", f.area);
  if (f.estado && f.estado !== "todos") query = query.eq("estado", f.estado);
  if (f.pagamento === "gratuito") query = query.eq("valor", 0);
  if (f.pagamento === "pago") query = query.gt("valor", 0);
  if (f.busca && f.busca.trim()) {
    const q = f.busca.trim().replace(/[%,]/g, " ");
    const like = `%${q}%`;
    query = query.or(`nome.ilike.${like},resumo.ilike.${like},ministrante.ilike.${like}`);
  }
  return query as T;
}

export async function fetchEventos(filtros: FiltrosBusca = {}): Promise<Evento[]> {
  const base = supabase.from("eventos").select(EVENTO_SELECT).order("data", { ascending: true });
  const { data, error } = await applyFilters(base, filtros);
  if (error) throw error;
  return (data ?? []).map((r) => mapEvento(r as unknown as EventoRow));
}

export async function fetchMentorias(filtros: FiltrosBusca = {}): Promise<Mentoria[]> {
  const base = supabase.from("mentorias").select(MENTORIA_SELECT).order("data", { ascending: true });
  const { data, error } = await applyFilters(base, filtros);
  if (error) throw error;
  return (data ?? []).map((r) => mapMentoria(r as unknown as MentoriaRow));
}

export async function fetchEventoById(id: string): Promise<Evento | null> {
  const { data, error } = await supabase.from("eventos").select(EVENTO_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapEvento(data as unknown as EventoRow) : null;
}

export async function fetchMentoriaById(id: string): Promise<Mentoria | null> {
  const { data, error } = await supabase.from("mentorias").select(MENTORIA_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapMentoria(data as unknown as MentoriaRow) : null;
}

export async function fetchEventosByMentorSlug(slug: string): Promise<Evento[]> {
  const { data, error } = await supabase
    .from("eventos")
    .select(EVENTO_SELECT)
    .eq("status", "aprovado")
    .eq("mentores.slug", slug)
    .not("mentor_id", "is", null)
    .order("data", { ascending: true });
  if (error) throw error;
  return (data ?? [])
    .map((r) => mapEvento(r as unknown as EventoRow))
    .filter((e) => e.mentorSlug === slug);
}

export async function fetchMentoriasByMentorSlug(slug: string): Promise<Mentoria[]> {
  const { data, error } = await supabase
    .from("mentorias")
    .select(MENTORIA_SELECT)
    .eq("status", "aprovado")
    .not("mentor_id", "is", null)
    .order("data", { ascending: true });
  if (error) throw error;
  return (data ?? [])
    .map((r) => mapMentoria(r as unknown as MentoriaRow))
    .filter((m) => m.mentorSlug === slug);
}
