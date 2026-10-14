import {
  LayoutGrid,
  FileText,
  DollarSign,
  Calendar,
  MessageSquare,
  Pen,
  FolderOpen,
  BarChart3,
  TrendingUp,
  CheckSquare,
  Users,
  GraduationCap,
  Building2,
  Box,
  Car,
  ClipboardList,
  Archive,
  Clock,
  BookMarked,
  BookOpen,
  FlaskConical,
  Wrench,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";

export interface SectorSidebarSubItem {
  id: string;
  title: string;
  icon?: any;
  description?: string;
}

export interface SectorSidebarItem {
  id: string;
  title: string;
  icon?: any;
  description?: string;
  subItems?: SectorSidebarSubItem[];
}

/**
 * Retorna ESTRITAMENTE e EXCLUSIVAMENTE os menus do menu lateral esquerdo
 * pertencentes ao setor especificado.
 * Não inclui menus de outros setores ou blocos globais não atribuídos ao setor.
 */
export function getSectorSidebarItems(
  sectorTitle: string,
  user?: any
): SectorSidebarItem[] {
  const safeTitle = sectorTitle || "";
  const upperTitle = safeTitle.toUpperCase().trim();
  const upperUserRole = (
    (user?.cargo || "") + " " +
    (user?.cargoChefia || "") + " " +
    (user?.title || "") + " " +
    (user?.role || "") + " " +
    (user?.funcao || "") + " " +
    (user?.departamento || "") + " " +
    (user?.areaDeAfetacao || "")
  ).toUpperCase();

  const isDPEP =
    upperTitle.includes("DPEP") ||
    upperTitle.includes("PLANIFICAÇÃO") ||
    upperTitle.includes("PLANIFICACAO") ||
    upperTitle.includes("PLANEAMENTO");

  // Itens padrão do menu lateral para qualquer setor / direção / departamento
  const baseItems: SectorSidebarItem[] = [
    {
      id: "visao_geral",
      title: "Visão Geral",
      icon: LayoutGrid,
      description: "Painel central de resumo e indicadores do setor"
    },
    {
      id: isDPEP ? "gestao_planos" : "plano",
      title: isDPEP ? "Gestão de Planos" : "Plano",
      icon: FileText,
      description: isDPEP
        ? "Gestão e planeamento de planos e atividades institucionais"
        : "Plano de atividades e tarefas operacionais do setor"
    },
    {
      id: "acao_orcamental",
      title: "Ação Orçamental",
      icon: DollarSign,
      description: "Execução orçamental, despesas e dotações do setor"
    },
    {
      id: "calendario",
      title: "Calendário",
      icon: Calendar,
      description: "Agenda de reuniões, prazos e eventos do setor"
    },
    {
      id: "mensagens",
      title: "Caixa de Mensagens",
      icon: MessageSquare,
      description: "Comunicação interna, notificações e despachos"
    },
    {
      id: "assinatura_digital",
      title: "Assinatura Digital",
      icon: Pen,
      description: "Assinatura eletrónica de documentos do setor"
    },
    {
      id: "gestao_expediente",
      title: "Gestão de Expediente",
      icon: FolderOpen,
      description: "Gestão de correspondência, circulação e despacho de expediente",
      subItems: [
        {
          id: "historico_documentos",
          title: "Histórico de Documentos",
          icon: FolderOpen,
          description: "Histórico geral de expediente e correspondência"
        },
        {
          id: "documentos_normativos",
          title: "Documentos Normativos",
          icon: FileText,
          description: "Regulamentos, ordens de serviço e despachos"
        },
        {
          id: "relatorios",
          title: "Relatórios",
          icon: BarChart3,
          description: "Relatórios periódicos de atividades e dados"
        },
        {
          id: "relatorio_acessos",
          title: "Auditoria de Acessos",
          icon: ShieldAlert,
          description: "Padrões de tentativas de intrusão por departamento (D3)"
        },
        {
          id: "balanco",
          title: "Balanço",
          icon: TrendingUp,
          description: "Balanço institucional do setor"
        },
        {
          id: "assinatura_digital_sub",
          title: "Assinatura Digital",
          icon: Pen,
          description: "Validação por assinatura digital nos documentos"
        }
      ]
    },
    {
      id: "atribuir_atividade",
      title: "Atribuir Atividade",
      icon: CheckSquare,
      description: "Distribuição e monitoria de tarefas aos colaboradores do setor"
    }
  ];

  // Setor: Repartição de Pessoal / Recursos Humanos
  const isReparticaoPessoal =
    upperTitle.includes("PESSOAL") ||
    upperTitle.includes("RH") ||
    upperTitle.includes("RECURSOS HUMANOS") ||
    upperUserRole.includes("PESSOAL") ||
    upperUserRole.includes("RECURSOS HUMANOS");

  if (isReparticaoPessoal) {
    return [
      ...baseItems,
      {
        id: "gestao_pessoal",
        title: "Gestão de Pessoal",
        icon: Users,
        description: "Controlo de colaboradores, processos individuais, licenças e assiduidade"
      }
    ];
  }

  // Setor: Estatística
  const isEstatisticaMain =
    upperTitle.includes("ESTATÍSTICA") ||
    upperTitle.includes("ESTATISTICA");

  if (isEstatisticaMain) {
    return [
      ...baseItems,
      {
        id: "corpo_discente",
        title: "Corpo discente",
        icon: GraduationCap,
        description: "Indicadores e dados do corpo discente"
      },
      {
        id: "estatistica_pessoal",
        title: "Estatística da Repartição de Pessoal",
        icon: Users,
        description: "Métricas estatísticas de colaboradores"
      },
      {
        id: "recursos_financeiros",
        title: "Recursos financeiro",
        icon: DollarSign,
        description: "Estatística financeira do setor"
      },
      {
        id: "infraestruturas",
        title: "Infraestruturas",
        icon: Building2,
        description: "Métricas e dados de infraestruturas físicas"
      },
      {
        id: "previsao_n1",
        title: "Previsão n+1",
        icon: TrendingUp,
        description: "Projeções e planeamento para o ciclo n+1"
      }
    ];
  }

  // Setor: UGEA (Aquisições e Contratações)
  const isUGEA =
    upperTitle.includes("UGEA") ||
    upperTitle.includes("AQUISIÇÃO") ||
    upperTitle.includes("AQUISICAO") ||
    upperTitle.includes("CONTRATAÇÃO") ||
    upperTitle.includes("CONTRATACAO");

  if (isUGEA) {
    return [
      {
        id: "plano",
        title: "Plano",
        icon: FileText,
        description: "Plano de atividades da UGEA"
      },
      {
        id: "acao_orcamental",
        title: "Ação Orçamental",
        icon: DollarSign,
        description: "Orçamento para aquisições"
      },
      {
        id: "calendario",
        title: "Calendário",
        icon: Calendar,
        description: "Prazos e cronograma de concursos"
      },
      {
        id: "mensagens",
        title: "Caixa de Mensagens",
        icon: MessageSquare,
        description: "Comunicações internas da UGEA"
      },
      {
        id: "assinatura_digital",
        title: "Assinatura Digital",
        icon: Pen,
        description: "Assinatura de contratos e pareceres"
      },
      {
        id: "gestao_expediente",
        title: "Gestão de Expediente",
        icon: FolderOpen,
        description: "Expediente documental de aquisições",
        subItems: [
          { id: "historico_documentos", title: "Histórico de Documentos", icon: FolderOpen },
          { id: "documentos_normativos", title: "Documentos Normativos", icon: FileText },
          { id: "relatorios", title: "Relatórios", icon: BarChart3 },
          { id: "balanco", title: "Balanço", icon: TrendingUp },
          { id: "assinatura_digital_sub", title: "Assinatura Digital", icon: Pen }
        ]
      },
      {
        id: "atribuir_atividade",
        title: "Atribuir Atividade",
        icon: CheckSquare,
        description: "Atribuição de tarefas da UGEA"
      },
      {
        id: "produtos_precos",
        title: "Gestão de Produtos e Preços",
        icon: Box,
        description: "Catálogo de bens, produtos e tabela de preços"
      },
      {
        id: "gestao_fornecedores",
        title: "Gestão de Fornecedores",
        icon: Users,
        description: "Cadastro, homologação e histórico de fornecedores"
      },
      {
        id: "plano_aquisicao",
        title: "Plano de Aquisição",
        icon: FileText,
        description: "Plano institucional de aquisição de bens e serviços"
      },
      {
        id: "plano_contratacao",
        title: "Plano de Contratação",
        icon: FileText,
        description: "Plano geral de contratação pública"
      }
    ];
  }

  const items = [...baseItems];

  // Setor: Transportes / Frota / Viaturas
  const isChefeTransportes =
    upperTitle.includes("TRANSPOR") ||
    upperTitle.includes("FROTA") ||
    upperTitle.includes("VIATURA") ||
    upperUserRole.includes("TRANSPOR") ||
    upperUserRole.includes("FROTA") ||
    upperUserRole.includes("VIATURA");

  if (isChefeTransportes) {
    if (!items.some((i) => i.title === "Gestão de Frota")) {
      items.push({
        id: "gestao_frota",
        title: "Gestão de Frota",
        icon: Car,
        description: "Gestão do parque automóvel e abastecimento"
      });
    }
    if (!items.some((i) => i.title === "Gestão de Viatura")) {
      items.push({
        id: "gestao_viatura",
        title: "Gestão de Viatura",
        icon: ClipboardList,
        description: "Manutenção, revisões e ordens de marcha das viaturas"
      });
    }
  }

  // Setor: Bolsa de Estudos
  if (upperTitle.includes("BOLSA")) {
    items.unshift({
      id: "bolsa_estudos",
      title: "Bolsa de Estudos",
      icon: GraduationCap,
      description: "Controlo de bolsas, candidaturas e subsídios"
    });
  }

  // Setor: Repartição de Arquivo
  if (upperTitle.includes("ARQUIVO")) {
    items.splice(1, 0, {
      id: "reparticao_arquivo",
      title: "Repartição de Arquivo",
      icon: Archive,
      description: "Arquivo morto, custódia e digitalização de processos"
    });
  }

  // Setores Académicos / Cursos / Departamentos de Engenharia / Disciplinas Gerais
  const isRHUser =
    upperTitle.includes("RECURSOS HUMANOS") ||
    upperTitle.includes("RH") ||
    upperTitle.includes("PESSOAL");

  const isUserCourseDirector =
    upperUserRole.includes("DIRETOR DO CURSO") ||
    upperUserRole.includes("DIRETOR DE CURSO") ||
    upperUserRole.includes("DIRECTOR DO CURSO") ||
    upperUserRole.includes("DIRECTOR DE CURSO") ||
    upperUserRole.includes("DIRETOR DOS CURSOS") ||
    upperUserRole.includes("DIRECTOR DOS CURSOS");

  const isCourseOrAcademicTitle =
    upperTitle.includes("CURSO") ||
    upperTitle.includes("ENGENHARIA") ||
    upperTitle.includes("DEPARTAMENTO DE ENGENHARIA") ||
    upperTitle.includes("DEPARTAMENTO DE PESQUISA") ||
    upperTitle.includes("DIVISÃO DE ENGENHARIA") ||
    upperTitle.includes("DIVISAO DE ENGENHARIA") ||
    upperTitle.includes("DEE") ||
    upperTitle.includes("DECC") ||
    upperTitle.includes("DECM") ||
    upperTitle.includes("DPE") ||
    upperTitle.includes("ELETROTÉCNICA") ||
    upperTitle.includes("ELETROTECNICA") ||
    upperTitle.includes("ELETRÓNICA") ||
    upperTitle.includes("ELETRONICA") ||
    upperTitle.includes("TELECOMUNICAÇÕES") ||
    upperTitle.includes("TELECOMUNICACOES") ||
    upperTitle.includes("CONSTRUÇÃO CIVIL") ||
    upperTitle.includes("CONSTRUCO CIVIL") ||
    upperTitle.includes("CONSTRUÇÃO MECÂNICA") ||
    upperTitle.includes("CONSTRUCAO MECANICA") ||
    upperTitle.includes("HIDRÁULICA") ||
    upperTitle.includes("HIDRAULICA") ||
    upperTitle.includes("TERMOTÉCNICA") ||
    upperTitle.includes("TERMOTECNICA") ||
    upperTitle.includes("ENERGIAS RENOVÁVEIS") ||
    upperTitle.includes("ENERGIAS RENOVAVEIS") ||
    upperTitle.includes("DISCIPLINAS GERAIS") ||
    upperTitle.includes("DDG") ||
    upperTitle.includes("LICENCIATURA");

  const isAuthorizedAcademic = !isRHUser && (isUserCourseDirector || isCourseOrAcademicTitle);

  if (isAuthorizedAcademic) {
    if (!items.some((i) => i.title === "Gestão Académica")) {
      items.push({
        id: "gestao_academica",
        title: "Gestão Académica",
        icon: GraduationCap,
        description: "Organização pedagógica e letiva do departamento / curso",
        subItems: [
          { id: "docentes", title: "Docentes", icon: Users, description: "Corpo docente e afetação" },
          { id: "alocacao", title: "Alocação", icon: ClipboardList, description: "Alocação a turmas e módulos" },
          { id: "horario", title: "Horário", icon: Clock, description: "Distribuição de horários das aulas" },
          { id: "calendario_exame", title: "Calendário de Exame", icon: BookMarked, description: "Épocas e exames letivos" },
          { id: "graduados", title: "Graduados", icon: GraduationCap, description: "Registo e dados de finalistas" },
          { id: "disciplina", title: "Disciplina", icon: BookOpen, description: "Fichas e programas de disciplinas" },
          { id: "blocos_sala", title: "Blocos e Sala de Aula", icon: Building2, description: "Salas de aula e blocos letivos" },
          { id: "laboratorio", title: "Laboratório", icon: FlaskConical, description: "Laboratórios e práticas" },
          { id: "oficinas", title: "Oficinas", icon: Wrench, description: "Oficinas técnicas e práticas" }
        ]
      });
    }
  }

  // Setor: Registo Académico / DRA
  const isDRA =
    upperTitle.includes("DRA") ||
    upperTitle.includes("REGISTO ACADÉMICO") ||
    upperTitle.includes("REGISTO ACADEMICO") ||
    upperUserRole.includes("REGISTO ACADÉMICO") ||
    upperUserRole.includes("REGISTO ACADEMICO") ||
    upperUserRole.includes("DRA");

  if (isDRA) {
    if (!items.some((i) => i.title === "Gestão Estudantil")) {
      items.push({
        id: "gestao_estudantil",
        title: "Gestão Estudantil",
        icon: GraduationCap,
        description: "Fichas, matrículas e processos discentes"
      });
    }
  }

  return items;
}
