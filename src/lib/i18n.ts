/**
 * Módulo de Internacionalização (i18n) do SIGEP
 * Suporta Português (pt) e Inglês (en) com aplicação instantânea em todo o sistema e documentos.
 */

import { useState, useEffect } from "react";

export type Language = "pt" | "en";

export const translations = {
  pt: {
    systemTitle: "SIGEP - Sistema Integrado de Gestão Estratégica e Planificação",
    loginTitle: "Acesso ao Sistema",
    loginSubtitle: "Insira as suas credenciais institucionais para aceder",
    identifierLabel: "Identificador (Email, NUIT ou ID)",
    passwordLabel: "Palavra-passe",
    loginButton: "Entrar no Sistema",
    languageLabel: "Idioma / Language",
    forgotPassword: "Esqueceu a palavra-passe?",
    contactAdmin: "Contactar Administrador",
    changePasswordRequired: "Alteração Obrigatória de Palavra-passe",
    newPassword: "Nova Palavra-passe",
    confirmPassword: "Confirmar Palavra-passe",
    savePassword: "Guardar Nova Palavra-passe",
    profileSettings: "Configurações do Perfil",
    languagePreference: "Idioma Preferido",
    portuguese: "Português",
    english: "English (Inglês)",
    save: "Guardar",
    cancel: "Cancelar",
    success: "Sucesso",
    error: "Erro",
    workspace: "Área de Trabalho",
    sync: "Sincronizar",
    database: "Base de Dados",
    minimize: "Minimizar",
    fullscreen: "Ecrã Completo",
    restoreScreen: "Restaurar Ecrã",
    logout: "Terminar Sessão",
    back: "Voltar",
    online: "ON-LINE",
    userConnected: "Utilizador Conectado",
    institution: "Instituição",
    loggedInstitution: "INSTITUIÇÃO LOGADA",
    integratedSystem: "SISTEMA DE GESTÃO INTEGRADA",
    generalAdminPanel: "PAINEL ADMINISTRADOR GERAL",
    changePassword: "Alterar Palavra-passe",
    version: "Versão 2026.9.1 Quântica",
    developedBy: "Desenvolvido por Slaiter Tripas",
    systemFooterTitle: "SIGEP - Sistema Integrado de Gestão de Processo",
    repMozambique: "República de Moçambique",
    minEducation: "Ministério da Educação e Cultura",
    dirHigherEd: "Direcção Nacional de Ensino Superior",
    fiscalYear: "Exercício Económico:",
    date: "Data:",
    subject: "Assunto:",
    to: "Ao:",
    from: "De:",
    ourRef: "N/Ref:",
    infoProposta: "INFORMAÇÃO / PROPOSTA",
    infoPropostaNum: "Informação Proposta Nº",
    parecerDicosafa: "1. Parecer Técnico & Homologação (DICOSAFA)",
    despachoGDG: "2. Despacho & Homologação (Diretor-Geral)",
    detalhesDeslocacao: "Detalhes da Deslocação:",
    actividade: "Actividade:",
    local: "Local:",
    datas: "Datas:",
    participantes: "Participante(s):",
    tabelaCustos: "Tabela de Custos / Abonos:",
    ordemServico: "ORDEM DE SERVIÇO",
    ordemServicoNum: "ORDEM DE SERVIÇO Nº",
    transferenciaFuncionario: "A transferência do funcionário:",
    guiaApresentacao: "GUIA DE APRESENTAÇÃO INTERNA",
    pedidoDispensa: "PEDIDO DE DISPENSA",
    justificacaoFaltas: "JUSTIFICAÇÃO DE FALTAS",
    pedidoDispensaOuFaltas: "PEDIDO DE DISPENSA OU JUSTIFICAÇÃO DE FALTAS",
    nomeFuncionario: "Nome do(a) Funcionário(a):",
    categoriaCarreira: "Categoria / Carreira:",
    departamentoDirecao: "Departamento / Direção:",
    reparticaoSeccao: "Repartição / Secção:",
    parecerChefe: "PARECER DO CHEFE HIERÁRQUICO",
    infoDRH: "INFORMAÇÃO DO DEPARTAMENTO DOS RECURSOS HUMANOS [DRH]",
    despacho: "DESPACHO",
    planoActividade: "Plano de Actividade",
    planoActividades: "Plano de Actividades",
    requerimentoFerias: "REQUERIMENTO DE FÉRIAS",
    orgaoDirecaoGestao: "Órgão de Direção e Gestão",
    servicosCentrais: "Serviços Centrais",
    unidadeOrganica: "Unidade Orgânica",
    diretorGeral: "Diretor-Geral",
    diretorDicosafa: "Director da DICOSAFA",
    chefeGabinete: "Chefe do Gabinete",
    chefeDepartamento: "Chefe do Departamento",
    chefeReparticao: "Chefe da Repartição",
    responsavelSetor: "Responsável do Setor",
    pagina: "Pág.",
    campusPrincipal: "Campus Principal",
    distritoDe: "Distrito de",
    provinciaDe: "Província de",
    caixaPostal: "Caixa Postal nº",
    paginaOficial: "Página oficial:",
    cliqueParaAssinar: "Clique para assinar",
    areaEmBrancoParecer: "Área em branco (aguarda parecer)",
    areaEmBrancoDespacho: "Área em branco (aguarda despacho)",
    imprimirPdf: "Imprimir / PDF",
    guardarSistema: "Guardar no Sistema",
    voltar: "Voltar",
    registadoSucesso: "Registado com Sucesso!",
    aguarde: "Aguarde...",
    aGuardar: "A guardar...",
    geral: "Geral",
    selecioneDocumento: "Selecione o Documento Normativo",
    selecioneUmDoc: "Selecione um documento...",
    modelosFormulariosOficiais: "Modelos e Formulários Oficiais",
    modelosDesc: "Selecione o documento normativo desejado na lista abaixo para preenchimento e emissão",
    cumprase: "Cumpra-se.",
    efeitosImediatos: "A presente Ordem de Serviço produz efeitos imediatos",
    guiaTransferenciaBens: "GUIA DE TRANSFERÊNCIA DE BENS",
    requisicaoInterna: "REQUISIÇÃO INTERNA",
    fichaInventarioMovel: "FICHA DE CADASTRO DE INVENTÁRIO DE BENS MÓVEIS",
    totalGeral: "Total Geral (MZN)",
    valorTotal: "Valor Total (MZN)",
    valorDiario: "Valor Diário",
    dias: "Dias",
    descricao: "Descrição",
    beneficiario: "Nome do Beneficiário",
    ord: "Ord.",
    justificacao: "Justificação:",
    anexos: "Anexos:",
    verAnexoOficial: "Ver / Abrir Anexo Oficial:",
    fechoCortesia: "Na expectativa da vossa aprovação, apresento os meus melhores cumprimentos.",
    chefeMaximoDept: "O CHEFE DO DEPARTAMENTO",
    secretariaGeral: "1. SECRETARIA GERAL",
    parecerDpep: "2. PARECER DO DPEP",
    parecerDaf: "3. PARECER DO DAF",
    repTransporte: "4. REP. TRANSPORTE",
    emBranco: "Em branco",
    assinar: "Assinar",
    favoravel: "Favorável",
    desfavoravel: "Desfavorável",
    autorizado: "Autorizado",
    naoAutorizado: "Não Autorizado",
    propostaActividadesPESO: "PROPOSTA DE ATIVIDADES PARA O PESO",
    actividadesPlanificadas: "Actividades Planificadas",
    novaActividade: "Nova Actividade",
    organizarPorMes: "Organizar por Mês & Ordem",
    pesquisar: "Pesquisar",
    filtros: "Filtros",
    todos: "Todos",
    dashboard: "Painel de Controlo",
    planning: "Planificação",
    reports: "Relatórios",
    settings: "Configurações",
    users: "Utilizadores",
    institutions: "Instituições",
    analytics: "Análise",
    backup: "Cópia de Segurança",
    audit: "Auditoria",
    system: "Sistema"
  },
  en: {
    systemTitle: "SIGEP - Integrated Strategic Management and Planning System",
    loginTitle: "System Login",
    loginSubtitle: "Enter your institutional credentials to access",
    identifierLabel: "Identifier (Email, NUIT or ID)",
    passwordLabel: "Password",
    loginButton: "Sign In",
    languageLabel: "Language",
    forgotPassword: "Forgot password?",
    contactAdmin: "Contact Administrator",
    changePasswordRequired: "Mandatory Password Change",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    savePassword: "Save New Password",
    profileSettings: "Profile Settings",
    languagePreference: "Preferred Language",
    portuguese: "Portuguese (Português)",
    english: "English",
    save: "Save",
    cancel: "Cancel",
    success: "Success",
    error: "Error",
    workspace: "Workspace",
    sync: "Sync",
    database: "Database",
    minimize: "Minimize",
    fullscreen: "Fullscreen",
    restoreScreen: "Restore Screen",
    logout: "Sign Out",
    back: "Back",
    online: "ONLINE",
    userConnected: "Connected User",
    institution: "Institution",
    loggedInstitution: "LOGGED INSTITUTION",
    integratedSystem: "INTEGRATED MANAGEMENT SYSTEM",
    generalAdminPanel: "GENERAL ADMIN PANEL",
    changePassword: "Change Password",
    version: "Quantum Version 2026.9.1",
    developedBy: "Developed by Slaiter Tripas",
    systemFooterTitle: "SIGEP - Integrated Process Management System",
    repMozambique: "Republic of Mozambique",
    minEducation: "Ministry of Education and Culture",
    dirHigherEd: "National Directorate of Higher Education",
    fiscalYear: "Financial Year:",
    date: "Date:",
    subject: "Subject:",
    to: "To:",
    from: "From:",
    ourRef: "Our Ref:",
    infoProposta: "INFORMATION / PROPOSAL",
    infoPropostaNum: "Information Proposal No.",
    parecerDicosafa: "1. Technical Opinion & Approval (DICOSAFA)",
    despachoGDG: "2. Dispatch & Approval (Director-General)",
    detalhesDeslocacao: "Travel Details:",
    actividade: "Activity:",
    local: "Location:",
    datas: "Dates:",
    participantes: "Participant(s):",
    tabelaCustos: "Cost Table / Allowances:",
    ordemServico: "SERVICE ORDER",
    ordemServicoNum: "SERVICE ORDER No.",
    transferenciaFuncionario: "Transfer of employee:",
    guiaApresentacao: "INTERNAL PRESENTATION LETTER",
    pedidoDispensa: "DISPENSATION REQUEST",
    justificacaoFaltas: "JUSTIFICATION OF ABSENCES",
    pedidoDispensaOuFaltas: "DISPENSATION REQUEST OR ABSENCE JUSTIFICATION",
    nomeFuncionario: "Employee Name:",
    categoriaCarreira: "Category / Career:",
    departamentoDirecao: "Department / Directorate:",
    reparticaoSeccao: "Section / Office:",
    parecerChefe: "OPINION OF HIERARCHICAL SUPERIOR",
    infoDRH: "INFORMATION FROM HUMAN RESOURCES DEPARTMENT [DRH]",
    despacho: "DISPATCH",
    planoActividade: "Activity Plan",
    planoActividades: "Activities Plan",
    requerimentoFerias: "VACATION REQUEST",
    orgaoDirecaoGestao: "Governance and Management Body",
    servicosCentrais: "Central Services",
    unidadeOrganica: "Organic Unit",
    diretorGeral: "Director-General",
    diretorDicosafa: "Director of DICOSAFA",
    chefeGabinete: "Head of Cabinet",
    chefeDepartamento: "Head of Department",
    chefeReparticao: "Head of Section",
    responsavelSetor: "Sector Manager",
    pagina: "Page",
    campusPrincipal: "Main Campus",
    distritoDe: "District of",
    provinciaDe: "Province of",
    caixaPostal: "P.O. Box No.",
    paginaOficial: "Official website:",
    cliqueParaAssinar: "Click to sign",
    areaEmBrancoParecer: "Blank area (awaiting opinion)",
    areaEmBrancoDespacho: "Blank area (awaiting dispatch)",
    imprimirPdf: "Print / PDF",
    guardarSistema: "Save to System",
    voltar: "Back",
    registadoSucesso: "Successfully Registered!",
    aguarde: "Please wait...",
    aGuardar: "Saving...",
    geral: "General",
    selecioneDocumento: "Select Normative Document",
    selecioneUmDoc: "Select a document...",
    modelosFormulariosOficiais: "Official Templates & Forms",
    modelosDesc: "Select the desired normative document from the list below to fill and issue",
    cumprase: "Let it be executed.",
    efeitosImediatos: "This Service Order takes immediate effect",
    guiaTransferenciaBens: "ASSET TRANSFER LETTER",
    requisicaoInterna: "INTERNAL REQUISITION",
    fichaInventarioMovel: "MOVABLE ASSETS INVENTORY FORM",
    totalGeral: "Grand Total (MZN)",
    valorTotal: "Total Amount (MZN)",
    valorDiario: "Daily Rate",
    dias: "Days",
    descricao: "Description",
    beneficiario: "Beneficiary Name",
    ord: "No.",
    justificacao: "Justification:",
    anexos: "Attachments:",
    verAnexoOficial: "View / Open Official Attachment:",
    fechoCortesia: "Looking forward to your approval, I extend my best regards.",
    chefeMaximoDept: "THE HEAD OF DEPARTMENT",
    secretariaGeral: "1. GENERAL SECRETARIAT",
    parecerDpep: "2. DPEP OPINION",
    parecerDaf: "3. DAF OPINION",
    repTransporte: "4. TRANSPORT SECTION",
    emBranco: "Blank",
    assinar: "Sign",
    favoravel: "Favorable",
    desfavoravel: "Unfavorable",
    autorizado: "Authorized",
    naoAutorizado: "Not Authorized",
    propostaActividadesPESO: "PROPOSAL OF ACTIVITIES FOR PESO",
    actividadesPlanificadas: "Planned Activities",
    novaActividade: "New Activity",
    organizarPorMes: "Organize by Month & Order",
    pesquisar: "Search",
    filtros: "Filters",
    todos: "All",
    dashboard: "Dashboard",
    planning: "Planning",
    reports: "Reports",
    settings: "Settings",
    users: "Users",
    institutions: "Institutions",
    analytics: "Analytics",
    backup: "Backup",
    audit: "Audit",
    system: "System"
  }
};

export function getTranslation(lang: Language = "pt", key: keyof typeof translations.pt): string {
  const dict = translations[lang] || translations.pt;
  return dict[key] || translations.pt[key] || String(key);
}

export function getCurrentLanguage(): Language {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sigep_language");
      if (stored === "en" || stored === "pt") {
        return stored as Language;
      }
      const user = JSON.parse(localStorage.getItem("sigep_logged_in_user") || "null");
      if (user && (user.idioma === "en" || user.idioma === "pt")) {
        return user.idioma as Language;
      }
    }
  } catch (e) {}
  return "pt";
}

export function setLanguagePreference(lang: Language) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("sigep_language", lang);
      const userStr = localStorage.getItem("sigep_logged_in_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.idioma = lang;
        localStorage.setItem("sigep_logged_in_user", JSON.stringify(user));
      }
      // Notificar todos os componentes no DOM imediatamente
      window.dispatchEvent(new CustomEvent("sigep_language_changed", { detail: { lang } }));
    }
  } catch (e) {}
}

/**
 * Hook do React para sincronização instantânea de idioma em qualquer componente
 */
export function useCurrentLanguage(): Language {
  const [lang, setLang] = useState<Language>(() => getCurrentLanguage());

  useEffect(() => {
    const handleLangChange = (e: any) => {
      const newLang = e?.detail?.lang || getCurrentLanguage();
      setLang(newLang);
    };

    window.addEventListener("sigep_language_changed", handleLangChange);
    return () => {
      window.removeEventListener("sigep_language_changed", handleLangChange);
    };
  }, []);

  return lang;
}

/**
 * Tradutor de frases institucionais, cargos e nomes de documentos comuns
 */
export function translateInstitutionalText(text: string, lang: Language): string {
  if (!text || lang === "pt") return text;

  const t = text.trim();
  const lower = t.toLowerCase();

  // Mapeamentos diretos
  if (lower === "informação / proposta" || lower === "informacao / proposta" || lower === "informação proposta" || lower === "informacao proposta") {
    return "INFORMATION / PROPOSAL";
  }
  if (lower === "ordem de serviço" || lower === "ordem de servico") {
    return "SERVICE ORDER";
  }
  if (lower === "ordem de serviço: transferência interna" || lower === "ordem de servico: transferencia interna") {
    return "SERVICE ORDER: INTERNAL TRANSFER";
  }
  if (lower === "guia de apresentação interna" || lower === "guia de apresentacao interna" || lower === "guia de apresentação") {
    return "INTERNAL PRESENTATION LETTER";
  }
  if (lower === "pedido de dispensa") {
    return "DISPENSATION REQUEST";
  }
  if (lower === "justificação de faltas" || lower === "justificacao de faltas") {
    return "JUSTIFICATION OF ABSENCES";
  }
  if (lower === "pedido de dispensa ou justificação de faltas" || lower === "pedido de dispensa ou justificacao de faltas" || lower === "pedido de dispensa / justificativa de faltas") {
    return "DISPENSATION REQUEST OR ABSENCE JUSTIFICATION";
  }
  if (lower === "guia de transferência de bens" || lower === "guia de transferencia de bens" || lower === "pedido de transferência interna") {
    return "ASSET TRANSFER LETTER";
  }
  if (lower === "requisição interna" || lower === "requisicao interna") {
    return "INTERNAL REQUISITION";
  }
  if (lower === "minuta de pedido de férias" || lower === "requerimento de férias" || lower === "requerimento de ferias") {
    return "VACATION REQUEST";
  }
  if (lower === "documentos normativos") {
    return "Normative Documents";
  }
  if (lower.startsWith("plano de actividade") || lower.startsWith("plano de atividade")) {
    return t.replace(/plano de actividade(s)? de/i, "Activity Plan of").replace(/plano de atividade(s)? de/i, "Activity Plan of").replace(/plano de actividade(s)?/i, "Activity Plan").replace(/plano de atividade(s)?/i, "Activity Plan");
  }
  if (lower === "órgão de direção e gestão" || lower === "orgao de direcao e gestao") {
    return "Governance and Management Body";
  }
  if (lower === "serviços centrais" || lower === "servicos centrais") {
    return "Central Services";
  }
  if (lower === "unidade orgânica" || lower === "unidade organica") {
    return "Organic Unit";
  }
  if (lower === "gabinete do diretor-geral" || lower === "gabinete do diretor geral") {
    return "Office of the Director-General";
  }
  if (lower.includes("unidade gestora e executora de aquisições") || lower.includes("ugea")) {
    return t.replace(/unidade gestora e executora de aquisições/i, "Procurement Management and Executing Unit");
  }
  if (lower.includes("departamento de recursos humanos") || lower.includes("drh")) {
    return t.replace(/departamento de recursos humanos/i, "Human Resources Department");
  }
  if (lower.includes("departamento de administração e finanças") || lower.includes("daf")) {
    return t.replace(/departamento de administração e finanças/i, "Administration and Finance Department").replace(/departamento de administracao e financas/i, "Administration and Finance Department");
  }
  if (lower.includes("departamento de registo académico") || lower.includes("dra")) {
    return t.replace(/departamento de registo académico/i, "Academic Registry Department").replace(/departamento de registo academico/i, "Academic Registry Department");
  }
  if (lower.includes("repartição de pessoal") || lower.includes("reparticao de pessoal")) {
    return t.replace(/repartição de pessoal/i, "Personnel Section").replace(/reparticao de pessoal/i, "Personnel Section");
  }
  if (lower.includes("repartição de transporte") || lower.includes("reparticao de transporte")) {
    return t.replace(/repartição de transporte/i, "Transport Section").replace(/reparticao de transporte/i, "Transport Section");
  }
  if (lower === "chefe do departamento") return "Head of Department";
  if (lower === "chefe da repartição" || lower === "chefe da reparticao") return "Head of Section";
  if (lower === "responsável do setor" || lower === "responsavel do setor") return "Sector Manager";
  if (lower === "chefe do gabinete") return "Head of Cabinet";
  if (lower === "diretor" || lower === "director") return "Director";
  if (lower === "diretor-geral" || lower === "director-geral") return "Director-General";
  if (lower === "república de moçambique" || lower === "republica de mocambique") {
    return "Republic of Mozambique";
  }
  if (lower === "ministério da educação e cultura" || lower === "ministerio da educacao e cultura") {
    return "Ministry of Education and Culture";
  }
  if (lower === "direcção nacional de ensino superior" || lower === "direccao nacional de ensino superior") {
    return "National Directorate of Higher Education";
  }
  if (lower.startsWith("província de") || lower.startsWith("provincia de")) {
    return t.replace(/província de/i, "Province of").replace(/provincia de/i, "Province of");
  }
  if (lower.startsWith("distrito de")) {
    return t.replace(/distrito de/i, "District of");
  }

  return text;
}

/**
 * Hook personalizado useTranslation para tradução instantânea em tempo real em todos os componentes de interface (menus, tabelas, modais)
 */
export function useTranslation() {
  const lang = useCurrentLanguage();
  const t = (key: keyof typeof translations.pt) => getTranslation(lang, key);
  const changeLanguage = (newLang: Language) => setLanguagePreference(newLang);

  return {
    t,
    lang,
    changeLanguage,
    translateText: (text: string) => translateInstitutionalText(text, lang),
  };
}

