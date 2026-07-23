// Core domain types for ICN Hub.

export type Modalidade =
  | "presencial"
  | "online";

export type TipoPagamento =
  | "pago"
  | "gratuito";

export type StatusValidacao =
  | "pendente"
  | "aprovado"
  | "recusado";

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

export type TipoUsuario =
  | "nutricionista"
  | "tecnico"
  | "estudante"
  | "participante";

export type AppRole =
  | "admin"
  | "organizador"
  | "participante";

export type StatusMensagem =
  | "novo"
  | "respondido"
  | "arquivado";

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

export interface Mentor {
  id: string;
  slug: string;
  nome: string;
  fotoUrl?: string | null;
  crn?: string | null;
  especialidade?: string | null;
  bio?: string | null;
  curriculo?: string | null;
  formacao?: string | null;
  areasAtuacao: string[];
  cidade?: string | null;
  estado?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  site?: string | null;
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
  mentorSlug?: string;
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
  mentorSlug?: string;
  bannerUrl: string;
  modalidade: Modalidade;
  area: AreaNutricao;
  status: StatusValidacao;
  criadoEm: string;
  criadoPor?: string;
}

export interface Perfil {
  id: string;

  /**
   * Nome completo cadastrado.
   * Somente administradores poderão alterar.
   */
  nome: string;

  /**
   * Nome público exibido para outros usuários.
   */
  nomeExibicao: string;

  fotoUrl: string | null;

  email: string;
  telefone: string;
  cpf: string;

  tipo: TipoUsuario;

  crn: string | null;
  areaAtuacao: string | null;
  instituicao: string | null;
  semestre: string | null;

  tipoSolicitado:
    | Extract<
        TipoUsuario,
        "nutricionista" | "tecnico"
      >
    | null;

  crnSolicitado: string | null;

  statusValidacao:
    | StatusValidacao
    | null;

  solicitadoEm: string | null;
  analisadoEm: string | null;
  analisadoPor: string | null;

  perfilPublico: boolean;
  mostrarEmail: boolean;
  mostrarTelefone: boolean;

  criadoEm: string;
  atualizadoEm: string;
}

export interface FiltrosBusca {
  modalidade?: Modalidade | "todos";
  pagamento?: TipoPagamento | "todos";
  estado?: string | "todos";
  area?: AreaNutricao | "todos";
  busca?: string;
}