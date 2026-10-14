/**
 * Mapeamento Central de Navegação do SIGEP
 * Define identificadores de vista (view IDs) únicos e inequívocos para evitar
 * sobreposição de rotas e conflitos entre submódulos autônomos.
 */

export interface MenuNavigationConfig {
  view: string;
  dashboardTitle?: string;
  dashboardActiveItem?: string;
}

// Identificadores de vista canónicos e inequívocos
export const VIEW_IDS = {
  SUPPLIER_MANAGEMENT: "supplier_management",
  SUPPLIER_FORM: "supplier_form",
  PLANO_WORKFLOW: "plano_workflow",
  PLANO_AQUISICAO: "plano_aquisicao",
  PLANO_CONTRATACAO: "plano_contratacao",
  PRODUTOS_PRECOS: "produtos_precos",
  GESTAO_DOCUMENTOS: "gestao_documentos",
  DOCUMENTOS_NORMATIVOS: "documentos_normativos",
  ECONOMATO: "economato",
  GESTAO_PATRIMONIAL: "gestao_patrimonial",
  COLABORADORES: "colaboradores",
  RELATORIOS: "relatorios",
  ASSINATURA_DIGITAL: "assinatura_digital",
  REPOSICAO_TESTE: "reposicao_teste",
  LIBRARY_VISIT: "library_visit",
  LIBRARY_MANAGEMENT: "library_management",
  MONOGRAFIA: "monografia",
  MANUAL_INSTRUCOES: "manual_instrucoes",
  PROJETO_CIENTIFICO: "projeto_cientifico",
  DASHBOARD: "dashboard",
} as const;

export const MENU_NAVIGATION_MAP: Record<string, MenuNavigationConfig> = {
  // --- COMUNICAÇÃO E EXPEDIENTE ---
  "caixa de mensagens": { view: VIEW_IDS.DASHBOARD, dashboardTitle: "Caixa de Mensagens", dashboardActiveItem: "Caixa de Mensagens" },
  "assinatura digital": { view: VIEW_IDS.ASSINATURA_DIGITAL, dashboardTitle: "Assinatura Digital" },
  "entrada de expediente": { view: VIEW_IDS.GESTAO_DOCUMENTOS, dashboardTitle: "Entrada de Expediente" },
  "saída de expediente": { view: VIEW_IDS.GESTAO_DOCUMENTOS, dashboardTitle: "Saída de Expediente" },
  "saida de expediente": { view: VIEW_IDS.GESTAO_DOCUMENTOS, dashboardTitle: "Saída de Expediente" },
  "gestão de documentos": { view: VIEW_IDS.GESTAO_DOCUMENTOS, dashboardTitle: "Gestão de Documentos" },
  "gestao de documentos": { view: VIEW_IDS.GESTAO_DOCUMENTOS, dashboardTitle: "Gestão de Documentos" },
  "documentos normativos": { view: VIEW_IDS.DOCUMENTOS_NORMATIVOS, dashboardTitle: "Documentos Normativos" },

  // --- PATRIMÓNIO E ECONOMATO ---
  "economato": { view: VIEW_IDS.ECONOMATO, dashboardTitle: "Gestão de Economato" },
  "gestão de economato": { view: VIEW_IDS.ECONOMATO, dashboardTitle: "Gestão de Economato" },
  "gestao de economato": { view: VIEW_IDS.ECONOMATO, dashboardTitle: "Gestão de Economato" },
  "gestão patrimonial": { view: VIEW_IDS.GESTAO_PATRIMONIAL, dashboardTitle: "Gestão Patrimonial" },
  "gestao patrimonial": { view: VIEW_IDS.GESTAO_PATRIMONIAL, dashboardTitle: "Gestão Patrimonial" },

  // --- RECURSOS HUMANOS E COLABORADORES ---
  "gestão de colaboradores": { view: VIEW_IDS.COLABORADORES, dashboardTitle: "Gestão de Colaboradores", dashboardActiveItem: "Gestão de Pessoal" },
  "gestao de colaboradores": { view: VIEW_IDS.COLABORADORES, dashboardTitle: "Gestão de Colaboradores", dashboardActiveItem: "Gestão de Pessoal" },
  "gestão de pessoal": { view: VIEW_IDS.COLABORADORES, dashboardTitle: "Gestão de Colaboradores", dashboardActiveItem: "Gestão de Pessoal" },
  "gestao de pessoal": { view: VIEW_IDS.COLABORADORES, dashboardTitle: "Gestão de Colaboradores", dashboardActiveItem: "Gestão de Pessoal" },
  "pedido de férias anuais": { view: "pedido_ferias", dashboardTitle: "Pedido de Férias Anuais" },
  "pedido de ferias anuais": { view: "pedido_ferias", dashboardTitle: "Pedido de Férias Anuais" },
  "requerimento de férias": { view: "pedido_ferias", dashboardTitle: "Pedido de Férias Anuais" },
  "requerimento de ferias": { view: "pedido_ferias", dashboardTitle: "Pedido de Férias Anuais" },
  "férias": { view: "pedido_ferias", dashboardTitle: "Pedido de Férias Anuais" },
  "ferias": { view: "pedido_ferias", dashboardTitle: "Pedido de Férias Anuais" },

  // --- RELATÓRIOS ---
  "relatórios": { view: VIEW_IDS.RELATORIOS, dashboardTitle: "Relatórios" },
  "relatorios": { view: VIEW_IDS.RELATORIOS, dashboardTitle: "Relatórios" },

  // --- UGEA: PRODUTOS E PREÇOS ---
  "gestão de produtos e preços": { view: VIEW_IDS.PRODUTOS_PRECOS, dashboardTitle: "Gestão de Produtos e Preços" },
  "gestao de produtos e precos": { view: VIEW_IDS.PRODUTOS_PRECOS, dashboardTitle: "Gestão de Produtos e Preços" },
  "produtos e preços": { view: VIEW_IDS.PRODUTOS_PRECOS, dashboardTitle: "Gestão de Produtos e Preços" },
  "produtos e precos": { view: VIEW_IDS.PRODUTOS_PRECOS, dashboardTitle: "Gestão de Produtos e Preços" },

  // --- UGEA: GESTÃO DE FORNECEDORES (ID Único e Inequívoco: supplier_management) ---
  "gestão de fornecedores": { view: VIEW_IDS.SUPPLIER_MANAGEMENT, dashboardTitle: "Gestão de Fornecedores" },
  "gestao de fornecedores": { view: VIEW_IDS.SUPPLIER_MANAGEMENT, dashboardTitle: "Gestão de Fornecedores" },
  "gestão de fornecedor": { view: VIEW_IDS.SUPPLIER_MANAGEMENT, dashboardTitle: "Gestão de Fornecedores" },
  "gestao de fornecedor": { view: VIEW_IDS.SUPPLIER_MANAGEMENT, dashboardTitle: "Gestão de Fornecedores" },
  "fornecedores": { view: VIEW_IDS.SUPPLIER_MANAGEMENT, dashboardTitle: "Gestão de Fornecedores" },
  "fornecedor": { view: VIEW_IDS.SUPPLIER_MANAGEMENT, dashboardTitle: "Gestão de Fornecedores" },
  "cadastro de fornecedores": { view: VIEW_IDS.SUPPLIER_MANAGEMENT, dashboardTitle: "Gestão de Fornecedores" },
  "cadastro de fornecedor": { view: VIEW_IDS.SUPPLIER_MANAGEMENT, dashboardTitle: "Gestão de Fornecedores" },
  "consulta de fornecedores": { view: VIEW_IDS.SUPPLIER_MANAGEMENT, dashboardTitle: "Gestão de Fornecedores" },
  "consulta de fornecedor": { view: VIEW_IDS.SUPPLIER_MANAGEMENT, dashboardTitle: "Gestão de Fornecedores" },

  // --- UGEA: FORMULÁRIO DE REGISTO DE FORNECEDORES (ID Único e Inequívoco: supplier_form) ---
  "registo de fornecedores": { view: VIEW_IDS.SUPPLIER_FORM, dashboardTitle: "Registo de Fornecedor" },
  "registo de fornecedor": { view: VIEW_IDS.SUPPLIER_FORM, dashboardTitle: "Registo de Fornecedor" },
  "registar fornecedor": { view: VIEW_IDS.SUPPLIER_FORM, dashboardTitle: "Registo de Fornecedor" },
  "registar fornecedores": { view: VIEW_IDS.SUPPLIER_FORM, dashboardTitle: "Registo de Fornecedor" },
  "novo registo de fornecedor": { view: VIEW_IDS.SUPPLIER_FORM, dashboardTitle: "Registo de Fornecedor" },
  "novo registo de fornecedores": { view: VIEW_IDS.SUPPLIER_FORM, dashboardTitle: "Registo de Fornecedor" },
  "novo fornecedor": { view: VIEW_IDS.SUPPLIER_FORM, dashboardTitle: "Registo de Fornecedor" },
  "formulário de registo de fornecedor": { view: VIEW_IDS.SUPPLIER_FORM, dashboardTitle: "Registo de Fornecedor" },
  "formulario de registo de fornecedor": { view: VIEW_IDS.SUPPLIER_FORM, dashboardTitle: "Registo de Fornecedor" },
  "formulário de registo de fornecedores": { view: VIEW_IDS.SUPPLIER_FORM, dashboardTitle: "Registo de Fornecedor" },
  "formulario de registo de fornecedores": { view: VIEW_IDS.SUPPLIER_FORM, dashboardTitle: "Registo de Fornecedor" },

  // --- PLANIFICAÇÃO E GESTÃO DE PLANOS (ID Único e Inequívoco: plano_workflow) ---
  "planificação": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Planificação de Atividades", dashboardActiveItem: "Gestão de Planos" },
  "planificacao": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Planificação de Atividades", dashboardActiveItem: "Gestão de Planos" },
  "planificação de atividades": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Planificação de Atividades", dashboardActiveItem: "Gestão de Planos" },
  "planificacao de atividades": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Planificação de Atividades", dashboardActiveItem: "Gestão de Planos" },
  "planificação de actividades": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Planificação de Atividades", dashboardActiveItem: "Gestão de Planos" },
  "planificacao de actividades": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Planificação de Atividades", dashboardActiveItem: "Gestão de Planos" },
  "gestão de planos": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Gestão de Planos", dashboardActiveItem: "Gestão de Planos" },
  "gestao de planos": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Gestão de Planos", dashboardActiveItem: "Gestão de Planos" },
  "gestão de planos e actividades": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Gestão de Planos", dashboardActiveItem: "Gestão de Planos" },
  "gestao de planos e actividades": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Gestão de Planos", dashboardActiveItem: "Gestão de Planos" },
  "gestão de planos e atividades": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Gestão de Planos", dashboardActiveItem: "Gestão de Planos" },
  "gestao de planos e atividades": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Gestão de Planos", dashboardActiveItem: "Gestão de Planos" },
  "plano setorial": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Plano Setorial", dashboardActiveItem: "Gestão de Planos" },
  "plano de atividades": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Plano de Atividades", dashboardActiveItem: "Gestão de Planos" },
  "planos de atividades": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Plano de Atividades", dashboardActiveItem: "Gestão de Planos" },
  "plano de actividades": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Plano de Actividades", dashboardActiveItem: "Gestão de Planos" },
  "planos de actividades": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Plano de Actividades", dashboardActiveItem: "Gestão de Planos" },
  "plano de atividade": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Plano de Atividade", dashboardActiveItem: "Gestão de Planos" },
  "plano de actividade": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Plano de Actividade", dashboardActiveItem: "Gestão de Planos" },
  "plano de actividade da ugea": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Plano de Actividade da UGEA", dashboardActiveItem: "Gestão de Planos" },
  "plano de atividade da ugea": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Plano de Atividade da UGEA", dashboardActiveItem: "Gestão de Planos" },
  "pesoe": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "PESOE", dashboardActiveItem: "Gestão de Planos" },
  "plano do gabinete": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Plano do Gabinete", dashboardActiveItem: "Gestão de Planos" },
  "matriz de atividades": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Matriz de Atividades", dashboardActiveItem: "Gestão de Planos" },
  "matriz de actividades": { view: VIEW_IDS.PLANO_WORKFLOW, dashboardTitle: "Matriz de Actividades", dashboardActiveItem: "Gestão de Planos" },

  // --- UGEA: PLANOS ESPECÍFICOS DE CONTRATAÇÃO PÚBLICA (IDs Únicos: plano_aquisicao e plano_contratacao) ---
  "plano de aquisição": { view: VIEW_IDS.PLANO_AQUISICAO, dashboardTitle: "Plano de Aquisição" },
  "plano de aquisicao": { view: VIEW_IDS.PLANO_AQUISICAO, dashboardTitle: "Plano de Aquisição" },
  "plano de contratação": { view: VIEW_IDS.PLANO_CONTRATACAO, dashboardTitle: "Plano de Contratação" },
  "plano de contratacao": { view: VIEW_IDS.PLANO_CONTRATACAO, dashboardTitle: "Plano de Contratação" },

  // --- GESTÃO ACADÉMICA E BIBLIOTECA ---
  "reposição de teste": { view: VIEW_IDS.REPOSICAO_TESTE, dashboardTitle: "Reposição de Teste" },
  "reposicao de teste": { view: VIEW_IDS.REPOSICAO_TESTE, dashboardTitle: "Reposição de Teste" },
  "visita à biblioteca": { view: VIEW_IDS.LIBRARY_VISIT, dashboardTitle: "Visita à Biblioteca" },
  "visita a biblioteca": { view: VIEW_IDS.LIBRARY_VISIT, dashboardTitle: "Visita à Biblioteca" },
  "gestão da biblioteca": { view: VIEW_IDS.LIBRARY_MANAGEMENT, dashboardTitle: "Gestão da Biblioteca" },
  "gestao da biblioteca": { view: VIEW_IDS.LIBRARY_MANAGEMENT, dashboardTitle: "Gestão da Biblioteca" },
  "monografia": { view: VIEW_IDS.MONOGRAFIA, dashboardTitle: "Monografia" },
  "gerar monografia": { view: VIEW_IDS.MONOGRAFIA, dashboardTitle: "Monografia" },
  "manual de instruções": { view: VIEW_IDS.MANUAL_INSTRUCOES, dashboardTitle: "Manual de Instruções" },
  "manual de instrucoes": { view: VIEW_IDS.MANUAL_INSTRUCOES, dashboardTitle: "Manual de Instruções" },
  "projeto científico": { view: VIEW_IDS.PROJETO_CIENTIFICO, dashboardTitle: "Projeto Científico" },
  "projeto cientifico": { view: VIEW_IDS.PROJETO_CIENTIFICO, dashboardTitle: "Projeto Científico" },

  // --- ADMINISTRAÇÃO E GESTÃO DAS INSTITUIÇÕES ---
  "gestão das instituições": { view: VIEW_IDS.DASHBOARD, dashboardTitle: "Sistema", dashboardActiveItem: "Gestão das Instituições" },
  "gestao das instituicoes": { view: VIEW_IDS.DASHBOARD, dashboardTitle: "Sistema", dashboardActiveItem: "Gestão das Instituições" },
  "gestão de instituições": { view: VIEW_IDS.DASHBOARD, dashboardTitle: "Sistema", dashboardActiveItem: "Gestão das Instituições" },
  "gestao de instituicoes": { view: VIEW_IDS.DASHBOARD, dashboardTitle: "Sistema", dashboardActiveItem: "Gestão das Instituições" },
  "instituições": { view: VIEW_IDS.DASHBOARD, dashboardTitle: "Sistema", dashboardActiveItem: "Gestão das Instituições" },
  "instituicoes": { view: VIEW_IDS.DASHBOARD, dashboardTitle: "Sistema", dashboardActiveItem: "Gestão das Instituições" },
};

/**
 * Remove acentos e normaliza uma string para comparação de chaves
 */
function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Recupera de forma segura e normalizada a configuração de navegação para um determinado título.
 * Garante que chaves com ou sem acentos encontrem a rota correta sem sobreposição.
 */
export const getMenuNavigationConfig = (title: string): MenuNavigationConfig | null => {
  if (!title) return null;
  const rawKey = title.toLowerCase().trim();
  if (MENU_NAVIGATION_MAP[rawKey]) {
    return MENU_NAVIGATION_MAP[rawKey];
  }
  const normKey = normalizeKey(title);
  if (MENU_NAVIGATION_MAP[normKey]) {
    return MENU_NAVIGATION_MAP[normKey];
  }
  for (const [key, config] of Object.entries(MENU_NAVIGATION_MAP)) {
    if (normalizeKey(key) === normKey) {
      return config;
    }
  }
  return null;
};

/**
 * Verifica se um título ou vista pertence à Gestão de Fornecedores
 */
export const isSupplierManagementRoute = (titleOrView: string): boolean => {
  const norm = normalizeKey(titleOrView || "");
  return norm.includes("fornecedor") && !norm.includes("registo");
};

/**
 * Verifica se um título ou vista pertence ao Registo de Fornecedores
 */
export const isSupplierFormRoute = (titleOrView: string): boolean => {
  const norm = normalizeKey(titleOrView || "");
  return norm.includes("fornecedor") && (norm.includes("registo") || norm.includes("registar") || norm.includes("novo") || norm.includes("formulario"));
};

/**
 * Verifica se um título ou vista pertence estritamente à Planificação
 */
export const isPlanningWorkflowRoute = (titleOrView: string): boolean => {
  const norm = normalizeKey(titleOrView || "");
  // Jamais interceptar rotas de fornecedor
  if (norm.includes("fornecedor") || norm.includes("aquisicao") || norm.includes("contratacao")) {
    return false;
  }
  return norm.includes("planific") || norm.includes("pesoe") || norm === "plano" || norm === "planos" || norm.includes("plano de ativid") || norm.includes("matriz de ativid");
};
