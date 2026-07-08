import type { AreaNutricao, TipoEvento, TipoUsuario } from "./types";

export const AREAS_NUTRICAO: { value: AreaNutricao; label: string }[] = [
  { value: "clinica", label: "Clínica" },
  { value: "esporte", label: "Esporte" },
  { value: "saude-mulher", label: "Saúde da Mulher" },
  { value: "materno-infantil", label: "Materno Infantil" },
  { value: "oncologia", label: "Oncologia" },
  { value: "uan", label: "UAN" },
  { value: "social", label: "Social" },
  { value: "gestao-marketing", label: "Gestão e Marketing" },
  { value: "hospitalar", label: "Hospitalar" },
  { value: "outros", label: "Outros" },
];

export const TIPOS_EVENTO: { value: TipoEvento; label: string }[] = [
  { value: "curso", label: "Curso" },
  { value: "congresso", label: "Congresso" },
  { value: "workshop", label: "Workshop" },
  { value: "jornada", label: "Jornada Científica" },
  { value: "encontro", label: "Encontro" },
  { value: "outro", label: "Outro" },
];

export const TIPOS_USUARIO: { value: TipoUsuario; label: string }[] = [
  { value: "nutricionista", label: "Nutricionista" },
  { value: "tecnico", label: "Técnico em Nutrição" },
  { value: "estudante", label: "Estudante" },
];

export const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export const areaLabel = (a: string) =>
  AREAS_NUTRICAO.find((x) => x.value === a)?.label ?? a;

export const tipoEventoLabel = (t: string) =>
  TIPOS_EVENTO.find((x) => x.value === t)?.label ?? t;
