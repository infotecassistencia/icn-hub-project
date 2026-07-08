// Core domain types for ICN Hub.
// Backend (Lovable Cloud / Supabase) not yet wired — these mirror the future schema
// so mock data and components can be swapped for real data with minimal churn.

export type Modalidade = "presencial" | "online";
export type TipoPagamento = "pago" | "gratuito";
export type StatusValidacao = "pendente" | "aprovado" | "recusado";

export type AreaNutricao =
  | "clinica"
  | "esporte"
  | "saude-mulher"
  | "materno-infantil"
  | "oncologia"
  | "uan"
  | "social"
  | "gestao-marketing"
  | "hospitalar"
  | "outros";

export type TipoEvento =
  | "curso"
  | "congresso"
  | "workshop"
  | "jornada"
  | "encontro"
  | "outro";

export type TipoUsuario = "nutricionista" | "tecnico" | "estudante";

export interface Evento {
  id: string;
  nome: string;
  resumo: string;
  descricao?: string;
  local: string;
  estado: string; // sigla UF
  data: string; // ISO
  duracao: string;
  valor: number; // 0 = gratuito
  ministrante: string;
  bannerUrl: string;
  modalidade: Modalidade;
  tipo: TipoEvento;
  area: AreaNutricao;
  status: StatusValidacao;
  criadoEm: string;
  criadoPor?: string;
}

export interface Mentoria {
  id: string;
  nome: string;
  resumo: string;
  descricao?: string;
  local: string;
  estado: string;
  data: string;
  duracao: string;
  valor: number;
  ministrante: string;
  bannerUrl: string;
  modalidade: Modalidade;
  area: AreaNutricao;
  status: StatusValidacao;
  criadoEm: string;
  criadoPor?: string;
}

export interface PerfilBase {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  tipo: TipoUsuario;
  criadoEm: string;
}

export interface PerfilProfissional extends PerfilBase {
  tipo: "nutricionista" | "tecnico";
  crn: string;
  areaAtuacao: string;
}

export interface PerfilEstudante extends PerfilBase {
  tipo: "estudante";
  instituicao: string;
  semestre: string;
}

export type Perfil = PerfilProfissional | PerfilEstudante;

export interface FiltrosBusca {
  modalidade?: Modalidade | "todos";
  pagamento?: TipoPagamento | "todos";
  estado?: string | "todos";
  area?: AreaNutricao | "todos";
  busca?: string;
}
