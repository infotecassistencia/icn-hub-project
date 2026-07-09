import type { Mentor } from "./types";

// Perfis públicos de mentores/palestrantes.
// Enquanto a tabela `mentores` do Lovable Cloud não é populada, servimos daqui.
export const MOCK_MENTORES: Mentor[] = [
  {
    id: "mnt-ana-ribeiro",
    slug: "ana-ribeiro",
    nome: "Dra. Ana Ribeiro",
    fotoUrl:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
    crn: "CRN-3 12345",
    especialidade: "Nutrição Clínica",
    bio: "Nutricionista clínica com mais de 15 anos de experiência em condutas baseadas em evidências e atendimento hospitalar.",
    curriculo:
      "Doutora em Ciências pela USP. Coordenadora de nutrição em hospital de alta complexidade. Autora de capítulos em livros de nutrição clínica.",
    formacao:
      "Doutorado — USP · Mestrado em Nutrição Clínica — UNIFESP · Graduação — USP",
    areasAtuacao: ["clinica", "hospitalar"],
    cidade: "São Paulo",
    estado: "SP",
    instagram: "https://instagram.com/draanaribeiro",
    linkedin: "https://linkedin.com/in/anaribeiro",
    site: "https://anaribeiro.com.br",
  },
  {
    id: "mnt-lucas-menezes",
    slug: "lucas-menezes",
    nome: "Prof. Lucas Menezes",
    fotoUrl:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=600&q=80",
    crn: "CRN-4 22987",
    especialidade: "Nutrição Esportiva",
    bio: "Consultor de atletas de endurance e força. Palestrante em congressos nacionais e internacionais de nutrição esportiva.",
    curriculo:
      "Mestre em Nutrição Esportiva. Consultor de equipes olímpicas brasileiras. 10+ anos formando profissionais na área.",
    formacao: "Mestrado — UFRJ · Graduação — UERJ",
    areasAtuacao: ["esporte"],
    cidade: "Rio de Janeiro",
    estado: "RJ",
    instagram: "https://instagram.com/proflucasmenezes",
    linkedin: "https://linkedin.com/in/lucasmenezes",
    site: null,
  },
  {
    id: "mnt-camila-souza",
    slug: "camila-souza",
    nome: "Dra. Camila Souza",
    fotoUrl:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80",
    crn: "CRN-9 33421",
    especialidade: "Saúde da Mulher",
    bio: "Nutricionista dedicada à saúde da mulher em todas as fases: ciclo menstrual, gestação, climatério e menopausa.",
    curriculo:
      "Especialista em Nutrição Funcional e Endocrinológica. Atende consultório particular em BH e ministra cursos nacionais.",
    formacao: "Especialização em Nutrição Endócrina — VP · Graduação — UFMG",
    areasAtuacao: ["saude-mulher", "materno-infantil"],
    cidade: "Belo Horizonte",
    estado: "MG",
    instagram: "https://instagram.com/dracamilasouza",
    linkedin: null,
    site: "https://camilasouza.com.br",
  },
  {
    id: "mnt-paula-andrade",
    slug: "paula-andrade",
    nome: "Nutri. Paula Andrade",
    fotoUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    crn: "CRN-3 45678",
    especialidade: "Gestão de UAN",
    bio: "Nutricionista de UAN com foco em processos, custos e liderança de equipes.",
    curriculo:
      "MBA em Gestão de Serviços de Alimentação. Consultora de redes de restaurantes coletivos.",
    formacao: "MBA — FGV · Graduação — USP",
    areasAtuacao: ["uan", "gestao-marketing"],
    cidade: "São Paulo",
    estado: "SP",
    instagram: "https://instagram.com/paulaandrade.uan",
    linkedin: "https://linkedin.com/in/paulaandrade",
    site: null,
  },
  {
    id: "mnt-isadora-liberato",
    slug: "isadora-liberato",
    nome: "Nutri. Isadora Liberato",
    fotoUrl:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80",
    crn: "CRN-3 55123",
    especialidade: "Gestão & Marketing para Nutricionistas",
    bio: "Ajuda nutricionistas a construírem consultórios de sucesso, do primeiro atendimento à agenda cheia.",
    curriculo:
      "Mentora de +500 nutricionistas. Criadora do programa Consultório de Sucesso.",
    formacao: "Especialização em Marketing Digital — ESPM · Graduação — Mackenzie",
    areasAtuacao: ["gestao-marketing"],
    cidade: "São Paulo",
    estado: "SP",
    instagram: "https://instagram.com/isadoraliberato",
    linkedin: "https://linkedin.com/in/isadoraliberato",
    site: "https://isadoraliberato.com",
  },
  {
    id: "mnt-marina-costa",
    slug: "marina-costa",
    nome: "Dra. Marina Costa",
    fotoUrl:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=600&q=80",
    crn: "CRN-2 66234",
    especialidade: "Materno-Infantil",
    bio: "Especialista em nutrição materno-infantil, com atuação em pré-natal, lactação e introdução alimentar.",
    curriculo:
      "Doutora em Ciências da Saúde. Autora de artigos em revistas indexadas de nutrição pediátrica.",
    formacao: "Doutorado — UFRGS · Graduação — UFRGS",
    areasAtuacao: ["materno-infantil"],
    cidade: "Porto Alegre",
    estado: "RS",
    instagram: "https://instagram.com/dramarinacosta",
    linkedin: "https://linkedin.com/in/marinacosta",
    site: null,
  },
  {
    id: "mnt-rafael-prado",
    slug: "rafael-prado",
    nome: "Dr. Rafael Prado",
    fotoUrl:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
    crn: "CRN-8 77890",
    especialidade: "Nutrição Clínica Funcional",
    bio: "Referência em raciocínio clínico avançado e abordagem funcional integrativa.",
    curriculo:
      "Pós-graduado em Nutrição Funcional e Fitoterapia. Coordena grupos de mentoria clínica há 8 anos.",
    formacao: "Pós — VP · Graduação — PUCPR",
    areasAtuacao: ["clinica"],
    cidade: "Curitiba",
    estado: "PR",
    instagram: "https://instagram.com/drrafaelprado",
    linkedin: "https://linkedin.com/in/rafaelprado",
    site: "https://rafaelprado.com.br",
  },
];

export const findMentorBySlug = (slug: string) =>
  MOCK_MENTORES.find((m) => m.slug === slug);
