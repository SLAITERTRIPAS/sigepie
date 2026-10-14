import {
  GraduationCap,
  BookOpen,
  Activity,
  Landmark,
  Briefcase,
  Globe,
  FileText,
  ShieldCheck,
  Stethoscope,
  Scale,
  Calendar,
  Award,
  Users,
  Scroll,
  FileSpreadsheet,
  Building2,
  HeartPulse
} from "lucide-react";

export type TipoInstituicaoId =
  | "ensino_superior"
  | "ensino_geral_tecnico"
  | "saude_hospitalar"
  | "servicos_publicos_governo"
  | "servicos_empresariais_comerciais"
  | "organizacoes_sociais_ong";

export interface DocumentoNormativoConfig {
  id: string;
  nome: string;
  descricao: string;
  categoria: "Estatutos & Criação" | "Regulamentos Internos" | "Operacional & Técnico" | "Recursos Humanos & Ética" | "Académico & Pedagógico" | "Clínico & Sanitário";
  obrigatorio?: boolean;
}

export interface CampoEspecificoConfig {
  id: string;
  label: string;
  placeholder: string;
  tipo: "text" | "select" | "number";
  options?: string[];
}

export interface TipoInstituicaoConfig {
  id: TipoInstituicaoId;
  titulo: string;
  subtitulo: string;
  categoriaGeral: "ensino" | "servicos";
  iconeNome: string;
  corTexto: string;
  corBg: string;
  corBorder: string;
  corBadge: string;
  descricaoAtuacao: string;
  servicosPadrao: string[];
  documentosNormativosPadrao: DocumentoNormativoConfig[];
  modeloOrganogramaId: string;
  camposEspecificos: CampoEspecificoConfig[];
}

export const TIPOS_INSTITUICAO_CONFIG: Record<TipoInstituicaoId, TipoInstituicaoConfig> = {
  ensino_superior: {
    id: "ensino_superior",
    titulo: "Ensino Superior e Universitário",
    subtitulo: "Universidades, Institutos Superiores, Politécnicos, Faculdades e Academias",
    categoriaGeral: "ensino",
    iconeNome: "GraduationCap",
    corTexto: "text-blue-700",
    corBg: "bg-blue-50",
    corBorder: "border-blue-200",
    corBadge: "bg-blue-100 text-blue-800 border-blue-200",
    descricaoAtuacao: "Instituições vocacionadas para formação superior em graduação e pós-graduação, investigação científica avançada e extensão comunitária.",
    servicosPadrao: [
      "Formação de Graduação (Licenciaturas)",
      "Pós-Graduação, Mestrados e Doutoramentos",
      "Investigação Científica e Inovação",
      "Extensão Universitária e Apoio à Comunidade",
      "Cursos de Especialização e Certificação Profissional",
      "Serviços de Registo Académico e Emissão de Diplomas"
    ],
    documentosNormativosPadrao: [
      {
        id: "estatuto_organico_univ",
        nome: "Estatuto Orgânico da Instituição",
        descricao: "Define a natureza jurídica, missão, órgãos de direção e competências institucionais.",
        categoria: "Estatutos & Criação",
        obrigatorio: true
      },
      {
        id: "regulamento_pedagogico",
        nome: "Regulamento Pedagógico e de Avaliação",
        descricao: "Regula o processo de ensino-aprendizagem, assiduidade, regime de provas e cálculo de notas.",
        categoria: "Académico & Pedagógico",
        obrigatorio: true
      },
      {
        id: "regulamento_exames",
        nome: "Regulamento de Exames e Épocas Especiais",
        descricao: "Normas para exames normais, de recurso, exames de melhoria e épocas especiais.",
        categoria: "Académico & Pedagógico"
      },
      {
        id: "regulamento_propinas",
        nome: "Regulamento de Propinas, Taxas e Bolsas de Estudo",
        descricao: "Tabela de emolumentos, critérios de isenção, atribuição de bolsas e prazos de pagamento.",
        categoria: "Regulamentos Internos",
        obrigatorio: true
      },
      {
        id: "calendario_academico",
        nome: "Calendário Académico Oficial Anual",
        descricao: "Cronograma de matrículas, semestres letivos, períodos de exames e pausas académicas.",
        categoria: "Académico & Pedagógico",
        obrigatorio: true
      },
      {
        id: "regulamento_monografia",
        nome: "Regulamento de Trabalhos de Fim de Curso e Monografias",
        descricao: "Diretrizes para elaboração, tutoria, depósito e defesa pública de dissertações e monografias.",
        categoria: "Académico & Pedagógico"
      },
      {
        id: "manual_conduta_estudante",
        nome: "Manual e Código de Conduta do Estudante",
        descricao: "Direitos, deveres, regime disciplinar e convivência cívica da comunidade estudantil.",
        categoria: "Recursos Humanos & Ética"
      },
      {
        id: "regulamento_carreira_docente",
        nome: "Regulamento de Carreira Docente e de Investigação",
        descricao: "Critérios de progressão, categorias académicas, carga horária letiva e produção científica.",
        categoria: "Recursos Humanos & Ética"
      },
      {
        id: "regulamento_conselho_cientifico",
        nome: "Regulamento do Conselho Científico e Pedagógico",
        descricao: "Funcionamento dos órgãos deliberativos científicos e homologação de planos curriculares.",
        categoria: "Estatutos & Criação"
      }
    ],
    modeloOrganogramaId: "academico",
    camposEspecificos: [
      {
        id: "grausConferidos",
        label: "Graus Académicos Conferidos",
        placeholder: "Ex: Licenciatura, Mestrado, Doutoramento",
        tipo: "text"
      },
      {
        id: "regimeAcademico",
        label: "Regime de Organização Curricular",
        placeholder: "Selecione o regime",
        tipo: "select",
        options: ["Semestral", "Anual", "Trimestral / Modular", "Híbrido"]
      },
      {
        id: "registroMinisterial",
        label: "Decreto / Alvará de Criação & Homologação",
        placeholder: "Ex: Decreto nº 14/2012 do Conselho de Ministros",
        tipo: "text"
      },
      {
        id: "capacidadeEstudantes",
        label: "Capacidade Prevista de Estudantes",
        placeholder: "Ex: 2500",
        tipo: "number"
      }
    ]
  },

  ensino_geral_tecnico: {
    id: "ensino_geral_tecnico",
    titulo: "Ensino Geral e Técnico-Profissional",
    subtitulo: "Institutos Médios, Escolas Técnicas, Secundárias, Politécnicos de Nível Médio e Colégios",
    categoriaGeral: "ensino",
    iconeNome: "BookOpen",
    corTexto: "text-emerald-700",
    corBg: "bg-emerald-50",
    corBorder: "border-emerald-200",
    corBadge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    descricaoAtuacao: "Instituições dedicadas à formação geral pré-universitária e formação técnico-profissional para o mercado de trabalho.",
    servicosPadrao: [
      "Ensino Secundário Geral (1º e 2º Ciclos)",
      "Cursos Técnico-Profissionais Médios (3 a 4 Anos)",
      "Formação Modular e Capacitação de Ofícios",
      "Estágios Práticos em Oficinas e Laboratórios",
      "Certificação de Competências Profissionais",
      "Atividades Desportivas e Cívicas Escolares"
    ],
    documentosNormativosPadrao: [
      {
        id: "regulamento_interno_escola",
        nome: "Regulamento Interno da Escola",
        descricao: "Regras de convivência, horários, vestimenta escolar, direitos e deveres dos alunos.",
        categoria: "Regulamentos Internos",
        obrigatorio: true
      },
      {
        id: "regulamento_avaliacao_esg",
        nome: "Regulamento de Avaliação e Passagem de Classe",
        descricao: "Critérios de avaliação contínua, testes sumativos, faltas e regime de passagem.",
        categoria: "Académico & Pedagógico",
        obrigatorio: true
      },
      {
        id: "regulamento_conselho_escola",
        nome: "Regulamento do Conselho de Escola",
        descricao: "Normas de participação de pais, encarregados de educação, docentes e comunidade.",
        categoria: "Estatutos & Criação"
      },
      {
        id: "regulamento_estagios_tecnicos",
        nome: "Regulamento de Estágios Profissionais e Oficinas",
        descricao: "Normas para alocação em empresas, relatórios de estágio e avaliação prática.",
        categoria: "Operacional & Técnico"
      },
      {
        id: "calendario_escolar_oficial",
        nome: "Calendário Escolar Anual",
        descricao: "Trimestres letivos, interrupções, semanas de exames e matrículas escolares.",
        categoria: "Académico & Pedagógico",
        obrigatorio: true
      },
      {
        id: "manual_seguranca_oficinas",
        nome: "Manual de Segurança em Oficinas e Laboratórios",
        descricao: "Equipamentos de proteção individual (EPIs) e prevenção de acidentes nas práticas técnicas.",
        categoria: "Operacional & Técnico"
      }
    ],
    modeloOrganogramaId: "ensino_medio",
    camposEspecificos: [
      {
        id: "niveisEnsino",
        label: "Níveis de Ensino Ministrados",
        placeholder: "Ex: Ensino Secundário Geral (8ª a 12ª) e Técnico-Médio",
        tipo: "text"
      },
      {
        id: "especialidadesTecnicas",
        label: "Cursos e Especialidades Técnicas",
        placeholder: "Ex: Informática, Contabilidade, Eletricidade, Mecânica",
        tipo: "text"
      },
      {
        id: "turnosFuncionamento",
        label: "Turnos de Funcionamento",
        placeholder: "Selecione os turnos",
        tipo: "select",
        options: ["Diurno (Manhã e Tarde)", "Matutino, Vespertino e Noturno", "Diurno Completo"]
      },
      {
        id: "tutelaDistrital",
        label: "Serviço Distrital / Provincial de Tutela",
        placeholder: "Ex: SDEJT de Songo / DPE de Tete",
        tipo: "text"
      }
    ]
  },

  saude_hospitalar: {
    id: "saude_hospitalar",
    titulo: "Prestação de Serviços de Saúde e Hospitalar",
    subtitulo: "Hospitais Centrais, Gerais e Provinciais, Clínicas, Centros de Saúde e Laboratórios",
    categoriaGeral: "servicos",
    iconeNome: "HeartPulse",
    corTexto: "text-rose-700",
    corBg: "bg-rose-50",
    corBorder: "border-rose-200",
    corBadge: "bg-rose-100 text-rose-800 border-rose-200",
    descricaoAtuacao: "Instituições prestadoras de cuidados de saúde, assistência clínica, urgências, diagnóstico e vigilância epidemiológica.",
    servicosPadrao: [
      "Atendimento de Urgência e Triagem 24 Horas",
      "Consultas Externas de Especialidades Médicas",
      "Internamento e Cuidados Cirúrgicos",
      "Meios Auxiliares de Diagnóstico e Laboratório Clínico",
      "Farmácia Hospitalar e Gestão de Medicamentos",
      "Maternidade, Saúde Materno-Infantil e Vacinação"
    ],
    documentosNormativosPadrao: [
      {
        id: "regulamento_interno_hospital",
        nome: "Regulamento Interno Hospitalar",
        descricao: "Estrutura dos serviços clínicos, enfermagem, administração e deveres dos profissionais.",
        categoria: "Regulamentos Internos",
        obrigatorio: true
      },
      {
        id: "protocolos_clinicos_terapeuticos",
        nome: "Protocolos Clínicos e Diretrizes Terapêuticas",
        descricao: "Protocolos normalizados de tratamento médico para as principais patologias e emergências.",
        categoria: "Clínico & Sanitário",
        obrigatorio: true
      },
      {
        id: "manual_biosseguranca",
        nome: "Manual de Biossegurança e Controlo de Infecções Hospitalares",
        descricao: "Normas de esterilização, gestão de resíduos biológicos e prevenção de infecção cruzada.",
        categoria: "Clínico & Sanitário",
        obrigatorio: true
      },
      {
        id: "pop_procedimentos_enfermagem",
        nome: "Procedimentos Operacionais Padrão (POP) de Cuidados de Saúde",
        descricao: "Passo a passo padronizado de procedimentos clínicos, administração de fármacos e pensos.",
        categoria: "Operacional & Técnico",
        obrigatorio: true
      },
      {
        id: "regulamento_escalas_urgencia",
        nome: "Regulamento de Escalas Médicas, de Enfermagem e Bancos de Urgência",
        descricao: "Critérios de distribuição de turnos de urgência, chamadas e substituições de plantão.",
        categoria: "Recursos Humanos & Ética"
      },
      {
        id: "codigo_etica_deontologia",
        nome: "Código de Deontologia Médica e de Enfermagem",
        descricao: "Normas éticas de relação com pacientes, sigilo profissional e consentimento informado.",
        categoria: "Recursos Humanos & Ética"
      },
      {
        id: "manual_farmacovigilancia",
        nome: "Manual de Farmacovigilância e Gestão de Medicamentos Essenciais",
        descricao: "Fluxo de requisição, conservação da cadeia de frio e comunicação de reações adversas.",
        categoria: "Operacional & Técnico"
      }
    ],
    modeloOrganogramaId: "saude",
    camposEspecificos: [
      {
        id: "nivelHospitalar",
        label: "Classificação / Nível Sanitário",
        placeholder: "Selecione a classificação",
        tipo: "select",
        options: ["Hospital Central", "Hospital Geral / Provincial", "Hospital Rural / Distrital", "Centro de Saúde Urbano", "Clínica Privada / Especializada", "Laboratório Clínico"]
      },
      {
        id: "capacidadeCamas",
        label: "Lotação / Capacidade de Camas de Internamento",
        placeholder: "Ex: 180",
        tipo: "number"
      },
      {
        id: "especialidadesMedicas",
        label: "Principais Especialidades Médicas",
        placeholder: "Ex: Medicina Interna, Cirurgia Geral, Pediatria, Ginecologia-Obstetrícia",
        tipo: "text"
      },
      {
        id: "licencaSanitaria",
        label: "Número da Licença Sanitária / Alvará MISAU",
        placeholder: "Ex: Licença Sanitária nº 241/MISAU/2021",
        tipo: "text"
      }
    ]
  },

  servicos_publicos_governo: {
    id: "servicos_publicos_governo",
    titulo: "Serviços Públicos, Governamentais e Autárquicos",
    subtitulo: "Ministérios, Direções Nacionais e Provinciais, Municípios, Autarquias e Institutos Públicos",
    categoriaGeral: "servicos",
    iconeNome: "Landmark",
    corTexto: "text-amber-700",
    corBg: "bg-amber-50",
    corBorder: "border-amber-200",
    corBadge: "bg-amber-100 text-amber-800 border-amber-200",
    descricaoAtuacao: "Órgãos da administração pública vocacionados para a execução de políticas públicas, regulação, fiscalização e atendimento aos cidadãos.",
    servicosPadrao: [
      "Atendimento ao Público e Balcão de Atendimento Único (BAÚ)",
      "Emissão de Licenças, Alvarás e Autorizações Administrativas",
      "Fiscalização e Aplicação de Posturas e Regulamentos Oficiais",
      "Planeamento, Orçamento Público e Gestão de Programas de Desenvolvimento",
      "Gestão do Património Imobiliário e Bens Públicos do Estado",
      "Tramitação de Processos Administrativos, Petições e Audiências Públicas"
    ],
    documentosNormativosPadrao: [
      {
        id: "estatuto_organico_publico",
        nome: "Estatuto Orgânico do Órgão Governamental",
        descricao: "Diploma legal que estabelece a estrutura de direções, competências e quadro de pessoal.",
        categoria: "Estatutos & Criação",
        obrigatorio: true
      },
      {
        id: "manual_procedimentos_administrativos",
        nome: "Manual de Procedimentos Administrativos e Atendimento ao Cidadão",
        descricao: "Fluxos de recepção, registo, despacho e entrega de respostas a expedientes públicos.",
        categoria: "Operacional & Técnico",
        obrigatorio: true
      },
      {
        id: "posturas_tabela_taxas",
        nome: "Posturas e Tabela Geral de Taxas, Licenças e Emolumentos",
        descricao: "Regulamentação de atividades económicas, taxas municipais e sanções aplicáveis.",
        categoria: "Regulamentos Internos",
        obrigatorio: true
      },
      {
        id: "normas_egfae",
        nome: "Manual de Aplicação do EGFAE e Gestão de Carreiras Públicas",
        descricao: "Procedimentos de concursos de ingresso, promoções, progressões e licenças de funcionários.",
        categoria: "Recursos Humanos & Ética",
        obrigatorio: true
      },
      {
        id: "regulamento_contratacao_publica",
        nome: "Regulamento de Contratação de Empreitadas de Obras Públicas e Fornecimento de Bens",
        descricao: "Regras para concursos públicos, júris de contratação e fiscalização de adjudicações.",
        categoria: "Operacional & Técnico"
      },
      {
        id: "plano_desenvolvimento_estrategico",
        nome: "Plano Estratégico de Desenvolvimento Institucional e Territorial",
        descricao: "Diretrizes plurianuais, metas de investimento e indicadores de desempenho público.",
        categoria: "Estatutos & Criação"
      }
    ],
    modeloOrganogramaId: "governo",
    camposEspecificos: [
      {
        id: "esferaAdministrativa",
        label: "Esfera de Administração Pública",
        placeholder: "Selecione a esfera",
        tipo: "select",
        options: ["Administração Central (Ministério / Secretaria de Estado)", "Administração Provincial (Governo Provincial)", "Administração Distrital (Governo Distrital)", "Administração Autárquica (Município / Conselho Municipal)", "Instituto Público Autónomo"]
      },
      {
        id: "orgaoTutela",
        label: "Órgão Tutelar Superior",
        placeholder: "Ex: Ministério da Administração Estatal e Função Pública",
        tipo: "text"
      },
      {
        id: "diplomaCriacao",
        label: "Instrumento Legal de Criação",
        placeholder: "Ex: Lei nº 03/2019 ou Diploma Ministerial nº 45/2020",
        tipo: "text"
      },
      {
        id: "horarioBalcao",
        label: "Horário de Funcionamento do Balcão Público",
        placeholder: "Ex: Segunda a Sexta-feira, das 07h30 às 15h30",
        tipo: "text"
      }
    ]
  },

  servicos_empresariais_comerciais: {
    id: "servicos_empresariais_comerciais",
    titulo: "Prestação de Serviços Empresariais e Corporativos",
    subtitulo: "Empresas Públicas e Privadas, Consultorias, Engenharia, Logística, TI e Serviços Comerciais",
    categoriaGeral: "servicos",
    iconeNome: "Briefcase",
    corTexto: "text-purple-700",
    corBg: "bg-purple-50",
    corBorder: "border-purple-200",
    corBadge: "bg-purple-100 text-purple-800 border-purple-200",
    descricaoAtuacao: "Organizações orientadas para prestação de serviços comerciais, contratos corporativos, projetos de engenharia, TI e fornecimento qualificado.",
    servicosPadrao: [
      "Consultoria Técnica, Gestão e Auditoria de Processos",
      "Prestação de Serviços Contratualizados e Acordos de SLA",
      "Engenharia, Manutenção Preventiva e Operações Técnicas",
      "Soluções Tecnológicas, Telecomunicações e Infraestruturas",
      "Logística Integrada, Distribuição e Gestão de Frota",
      "Atendimento Comercial, Vendas e Suporte Pós-Venda"
    ],
    documentosNormativosPadrao: [
      {
        id: "regulamento_interno_empresa",
        nome: "Regulamento Interno de Trabalho da Empresa",
        descricao: "Direitos, deveres, políticas de pontualidade, benefícios, férias e disciplina laboral.",
        categoria: "Regulamentos Internos",
        obrigatorio: true
      },
      {
        id: "codigo_etica_compliance",
        nome: "Código de Conduta, Ética e Conformidade (Compliance)",
        descricao: "Diretrizes anticorrupção, conflito de interesses e padrões morais nas relações de negócios.",
        categoria: "Recursos Humanos & Ética",
        obrigatorio: true
      },
      {
        id: "politica_sla_servicos",
        nome: "Catálogo Oficial de Serviços e Acordos de Nível de Serviço (SLA)",
        descricao: "Prazos de entrega, tempos de resposta, garantias técnicas e penalidades contratuais.",
        categoria: "Operacional & Técnico",
        obrigatorio: true
      },
      {
        id: "procedimentos_operacionais_sop",
        nome: "Procedimentos Operacionais Padrão (SOP / POP Técnicos)",
        descricao: "Instruções de trabalho detalhadas para garantir uniformidade e excelência nos serviços.",
        categoria: "Operacional & Técnico",
        obrigatorio: true
      },
      {
        id: "politica_seguranca_informacao",
        nome: "Política de Segurança da Informação e Proteção de Dados",
        descricao: "Normas de acesso a sistemas corporativos, backups, confidencialidade e proteção de dados.",
        categoria: "Operacional & Técnico"
      },
      {
        id: "manual_hst_seguranca_trabalho",
        nome: "Manual de Higiene, Segurança e Saúde no Trabalho (HST)",
        descricao: "Prevenção de riscos laborais, uso de equipamentos de segurança e planos de emergência.",
        categoria: "Operacional & Técnico"
      }
    ],
    modeloOrganogramaId: "empresa",
    camposEspecificos: [
      {
        id: "setorEconomico",
        label: "Setor Económico / Ramo de Atividade",
        placeholder: "Ex: Tecnologias de Informação e Telecomunicações",
        tipo: "text"
      },
      {
        id: "nuitEmpresa",
        label: "Número Único de Identificação Tributária (NUIT)",
        placeholder: "Ex: 400123456",
        tipo: "text"
      },
      {
        id: "certificacoesQualidade",
        label: "Certificações de Qualidade e Normas (ISO, etc.)",
        placeholder: "Ex: ISO 9001:2015, ISO 27001",
        tipo: "text"
      },
      {
        id: "porteEmpresarial",
        label: "Porte da Organização",
        placeholder: "Selecione o porte",
        tipo: "select",
        options: ["Grande Empresa / Multinacional", "Média Empresa", "Pequena Empresa", "Startup / Empresa Tecnológica", "Empresa Pública / Mista"]
      }
    ]
  },

  organizacoes_sociais_ong: {
    id: "organizacoes_sociais_ong",
    titulo: "Organizações Sociais, ONGs e Fundações",
    subtitulo: "Associações Comunitárias, Fundações, Entidades Humanitárias, Cooperativas e Institutos Sociais",
    categoriaGeral: "servicos",
    iconeNome: "Globe",
    corTexto: "text-teal-700",
    corBg: "bg-teal-50",
    corBorder: "border-teal-200",
    corBadge: "bg-teal-100 text-teal-800 border-teal-200",
    descricaoAtuacao: "Organizações sem fins lucrativos focadas em projetos de impacto social, capacitação comunitária, ajuda humanitária e sustentabilidade.",
    servicosPadrao: [
      "Implementação de Projetos de Desenvolvimento Comunitário",
      "Apoio Humanitário e Distribuição de Recursos em Emergências",
      "Capacitação, Alfabetização e Treinamento Profissionalizante",
      "Campanhas de Sensibilização, Direitos Cívicos e Advocacia",
      "Assistência Social, Nutricional e Psicológica a Grupos Vulneráveis",
      "Gestão de Voluntariado e Parcerias para o Desenvolvimento"
    ],
    documentosNormativosPadrao: [
      {
        id: "estatutos_sociais_ong",
        nome: "Estatutos Sociais e Instrumento Notarial de Constituição",
        descricao: "Documento oficial de registo que define os fins altruísticos e órgãos de governança social.",
        categoria: "Estatutos & Criação",
        obrigatorio: true
      },
      {
        id: "politica_salvaguarda_protecao",
        nome: "Política de Salvaguarda, Proteção de Crianças e Prevenção de Abusos",
        descricao: "Compromisso inegociável de proteção de beneficiários vulneráveis e canais de denúncia segura.",
        categoria: "Recursos Humanos & Ética",
        obrigatorio: true
      },
      {
        id: "manual_gestao_projetos",
        nome: "Manual de Gestão de Projetos e Monitoria & Avaliação (M&A)",
        descricao: "Metodologias de quadro lógico, planos de ação, monitoria de metas e relatórios para doadores.",
        categoria: "Operacional & Técnico",
        obrigatorio: true
      },
      {
        id: "manual_compras_financeiro_doadores",
        nome: "Manual de Procedimentos Financeiros e Aquisições para Doadores",
        descricao: "Normas de cotação de preços, prestação de contas transparente e auditoria independente.",
        categoria: "Operacional & Técnico",
        obrigatorio: true
      },
      {
        id: "codigo_conduta_humanitaria",
        nome: "Código de Conduta Humanitária e Valores Institucionais",
        descricao: "Princípios de imparcialidade, neutralidade, integridade e respeito cultural nas comunidades.",
        categoria: "Recursos Humanos & Ética"
      },
      {
        id: "regulamento_voluntariado",
        nome: "Regulamento e Termo de Adesão ao Voluntariado",
        descricao: "Direitos, responsabilidades e seguro dos colaboradores voluntários nos projetos de campo.",
        categoria: "Regulamentos Internos"
      }
    ],
    modeloOrganogramaId: "ong_social",
    camposEspecificos: [
      {
        id: "linhasIntervencao",
        label: "Principais Linhas de Intervenção Social",
        placeholder: "Ex: Educação, Água e Saneamento, Saúde Comunitária, Empoderamento Feminino",
        tipo: "text"
      },
      {
        id: "parceirosDoadores",
        label: "Principais Parceiros e Entidades Financiadoras",
        placeholder: "Ex: USAID, União Europeia, Agências da ONU, Fundações Privadas",
        tipo: "text"
      },
      {
        id: "areasCobertura",
        label: "Províncias e Regiões de Atuação Geográfica",
        placeholder: "Ex: Tete (Songo, Cahora Bassa), Manica e Sofala",
        tipo: "text"
      },
      {
        id: "registroNotarial",
        label: "Publicação no Boletim da República / Registo Social",
        placeholder: "Ex: BR nº 28, III Série, de 15 de Março de 2018",
        tipo: "text"
      }
    ]
  }
};

export function getTiposInstituicaoList(): TipoInstituicaoConfig[] {
  return Object.values(TIPOS_INSTITUICAO_CONFIG);
}

export function getTipoInstituicaoConfig(tipoId?: string): TipoInstituicaoConfig {
  if (tipoId && tipoId in TIPOS_INSTITUICAO_CONFIG) {
    return TIPOS_INSTITUICAO_CONFIG[tipoId as TipoInstituicaoId];
  }
  return TIPOS_INSTITUICAO_CONFIG["ensino_superior"];
}

/**
 * Retorna a lista de documentos normativos ativos para uma determinada instituição
 */
export function getDocumentosNormativosPorInstituicao(inst?: any): DocumentoNormativoConfig[] {
  if (!inst) {
    return TIPOS_INSTITUICAO_CONFIG.ensino_superior.documentosNormativosPadrao;
  }

  // Se a instituição possui documentos customizados configurados no registo
  if (
    inst.documentosNormativosConfigurados &&
    Array.isArray(inst.documentosNormativosConfigurados) &&
    inst.documentosNormativosConfigurados.length > 0
  ) {
    return inst.documentosNormativosConfigurados;
  }

  // Se tiver um tipo definido, retorna o padrão desse tipo
  const tipoConfig = getTipoInstituicaoConfig(inst.tipoInstituicao);
  return tipoConfig.documentosNormativosPadrao;
}
