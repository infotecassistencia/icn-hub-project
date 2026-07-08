// Core domain types for ICN Hub.

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

export type AppRole = "admin" | "organizador" | "participante";

export type StatusMensagem = "novo" | "respondido" | "arquivado";

export interface ContactMessage {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  assunto: string;
  mensagem: string;
  data_envio: string;
  status: StatusMensagem;
}

export interface Evento {
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

export interface Perfil {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  tipo: "nutricionista" | "tecnico" | "estudante" | "participante";
  crn?: string | null;
  areaAtuacao?: string | null;
  instituicao?: string | null;
  semestre?: string | null;
  criadoEm: string;
}

export interface FiltrosBusca {
  modalidade?: Modalidade | "todos";
  pagamento?: TipoPagamento | "todos";
  estado?: string | "todos";
  area?: AreaNutricao | "todos";
  busca?: string;
}
