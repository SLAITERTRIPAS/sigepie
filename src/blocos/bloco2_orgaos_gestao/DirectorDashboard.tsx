import React, { useState, lazy, Suspense, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Maximize2,
  LogOut,
  User,
  LayoutGrid,
  FileText,
  Calendar,
  CheckSquare,
  BarChart3,
  Archive,
  FolderOpen,
  Users,
  Plus,
  GraduationCap,
  Briefcase,
  Microscope,
  DollarSign,
  Building2,
  TrendingUp,
  BarChart2,
  Pen,
  MessageSquare,
  Car,
  ClipboardList,
  ShoppingCart,
  Box,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  BookMarked,
  BookOpen,
  FlaskConical,
  Wrench,
  Compass,
  ExternalLink,
  Layers,
  Network,
  X,
  Sliders,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import SectorMenuConfigModal from "../../components/SectorMenuConfigModal";

import BoardOverview from "../bloco2_orgaos_gestao/BoardOverview";
const CalendarView = lazy(() => import("../bloco5_sistema/CalendarView"));
const AssignActivityView = lazy(() => import("../bloco5_sistema/AssignActivityView"));
const MatrixView = lazy(() => import("../bloco5_sistema/MatrixView"));
import { MatrixActivity } from "../../types";
const MyMatrixView = lazy(() => import("../bloco5_sistema/MyMatrixView"));
const ReportsView = lazy(() => import("../bloco7_relatorios/ReportsView"));
const ActivityForm = lazy(() => import("../bloco5_sistema/ActivityForm"));
const IndividualPlanForm = lazy(() => import("../bloco8_gerais/IndividualPlanForm"));
const GestaoDocumentosView = lazy(() => import("../bloco4_servicos_centrais/GestaoDocumentosView"));
const GestaoExpedienteHistoricoView = lazy(() => import("../bloco4_servicos_centrais/GestaoExpedienteHistoricoView"));
const EstatisticaView = lazy(() => import("../bloco7_relatorios/EstatisticaView"));
const DocumentosView = lazy(() => import("../bloco6_documentos/DocumentosView"));
const LibraryManagementView = lazy(() => import("../bloco3_unidades_organicas/LibraryManagementView"));
const GestaoPessoalView = lazy(() => import("../bloco4_servicos_centrais/GestaoPessoalView"));
const GestaoSocialView = lazy(() => import("../bloco4_servicos_centrais/GestaoSocialView"));
import InstitutionalCharts from "../../components/InstitutionalCharts";
import {
  Event,
  Expediente,
  LibraryRegistration,
  BookRegistration,
  Nota,
  FinancialData,
  Supplier,
  ServiceRequest,
} from "../../types";
const RecursosFinanceirosForm = lazy(() => import("../bloco8_gerais/RecursosFinanceirosForm"));
const DRADashboard = lazy(() => import("../bloco4_servicos_centrais/DRADashboard"));
import CentralOverview from "./CentralOverview";
const GestaoFormacaoView = lazy(() => import("../bloco4_servicos_centrais/GestaoFormacaoView"));
const ArchiveView = lazy(() => import("../bloco5_sistema/ArchiveView"));
const GestaoAcademicaView = lazy(() => import("../bloco3_unidades_organicas/GestaoAcademicaView"));
const GestaoAcademicaMainView = lazy(() => import("../bloco3_unidades_organicas/GestaoAcademicaMainView"));
const HorarioView = lazy(() => import("../bloco3_unidades_organicas/HorarioView"));
const ExamesView = lazy(() => import("../bloco3_unidades_organicas/ExamesView"));
const GraduadosView = lazy(() => import("../bloco3_unidades_organicas/GraduadosView"));
const DisciplinasEspacosFisicosView = lazy(() => import("../bloco3_unidades_organicas/DisciplinasEspacosFisicosView"));
import {
  getRoles,
  isSuperBossUser,
  isHRBossUser,
  isPatrimonioBossOrAdmin,
  canAccessArea,
  getAuthorizedActivities,
  isTitularDiretorGeral,
  isInstitutionalAdminUser,
} from "../../lib/auth";
import DepartmentSectorAllocationModal from "../../components/DepartmentSectorAllocationModal";
import { confirmWorkspaceExit } from "../../lib/utils";
const UGEA_PlanView = lazy(() => import("../bloco4_servicos_centrais/UGEA_PlanView"));
const UGEA_SupplierManagementView = lazy(() => import("../bloco4_servicos_centrais/UGEA_SupplierManagementView"));
const UGEA_SupplierRegistrationForm = lazy(() => import("../bloco4_servicos_centrais/UGEA_SupplierRegistrationForm"));
const GestaoProdutosPrecosView = lazy(() => import("../bloco9_produtos_precos/GestaoProdutosPrecosView"));
const AssinaturaDigitalView = lazy(() => import("../bloco5_sistema/AssinaturaDigitalView"));
const CaixaMensagensView = lazy(() => import("../bloco5_sistema/CaixaMensagensView"));
const BalancoMensalView = lazy(() => import("../bloco4_servicos_centrais/BalancoMensalView"));
const BalancoCombustivelView = lazy(() => import("../bloco4_servicos_centrais/BalancoCombustivelView"));
const BalancoInventarioView = lazy(() => import("../bloco4_servicos_centrais/BalancoInventarioView"));
const BalancoAtividadesView = lazy(() => import("../bloco4_servicos_centrais/BalancoAtividadesView"));
const GestaoTransporteView = lazy(() => import("../bloco4_servicos_centrais/GestaoTransporteView"));
const PlanoWorkflowView = lazy(() => import("../bloco5_sistema/PlanoWorkflowView"));
const UniversalRegistrationPicker = lazy(() => import("../bloco5_sistema/UniversalRegistrationPicker"));
const AcaoOrcamentalView = lazy(() => import("../../components/AcaoOrcamentalView"));
import { firestoreService } from "../../lib/firestoreService";
import VisaoGeralCards from "../../components/VisaoGeralCards";
import PersonalizedOverview from "../../components/dashboard/PersonalizedOverview";
import DICOSSEROverview from "./DICOSSEROverview";
import {
  getActiveInstituicaoId,
  setActiveInstituicaoId,
  buildEstruturaInstituicao,
  getDepartamentosPorDirecao,
  getReparticoesPorDepartamento,
  findDirecaoPorDepartamento,
  notifyEstruturaUpdated,
} from "../../lib/instituicaoEstruturaService";
import RHStatView from "../bloco7_relatorios/RHStatisticsWorkflowView";
import BolsasEstudosView from "../bloco4_servicos_centrais/BolsasEstudosView";
import GestaoEstudantilView from "../bloco3_unidades_organicas/GestaoEstudantilView";

export default function DirectorDashboard({
  title = "Painel de Gestão",
  onBack,
  onShowAlert = () => {},
  events = [],
  onDeleteEvent,
  onUpdateEvent,
  expedientes = [],
  onDeleteExpediente,
  onUpdateExpediente,
  libraryRegistrations = [],
  bookRegistrations = [],
  onDeleteBook,
  onUpdateBook,
  financialData = [],
  setFinancialData,
  notes = [],
  onDeleteNote,
  onUpdateNote,
  onLogout = () => {},
  onAgendar = () => {},
  onNota = () => {},
  onGestaoDocumentos,
  activities = [],
  onDeleteActivity,
  matrixActivities = [],
  onDeleteMatrixActivity,
  onUpdateMatrixActivity,
  suppliers = [],
  colaboradores = [],
  processos = [],
  serviceRequests = [],
  user = null,
  onPathChange = () => {},
  setDashboardTitle = () => {},
  initialActiveItem,
}: {
  title: string;
  onBack: () => void;
  onShowAlert: (msg: string, type?: string) => void;
  events: Event[];
  onDeleteEvent?: (id: string) => Promise<any>;
  onUpdateEvent?: (id: string, data: any) => Promise<any>;
  expedientes: Expediente[];
  onDeleteExpediente?: (id: string) => Promise<any>;
  onUpdateExpediente?: (id: string, data: any) => Promise<any>;
  libraryRegistrations?: LibraryRegistration[];
  bookRegistrations?: BookRegistration[];
  onDeleteBook?: (id: string) => Promise<any>;
  onUpdateBook?: (id: string, data: any) => Promise<any>;
  financialData?: FinancialData[];
  setFinancialData?: React.Dispatch<React.SetStateAction<FinancialData[]>>;
  notes: Nota[];
  onDeleteNote?: (id: string) => Promise<any>;
  onUpdateNote?: (id: string, data: any) => Promise<any>;
  onLogout: () => void;
  onAgendar: () => void;
  onNota: () => void;
  onGestaoDocumentos?: () => void;
  activities?: MatrixActivity[];
  onDeleteActivity?: (id: string) => Promise<any>;
  matrixActivities?: MatrixActivity[];
  onDeleteMatrixActivity?: (id: string) => Promise<any>;
  onUpdateMatrixActivity?: (id: string, data: any) => Promise<any>;
  suppliers?: Supplier[];
  colaboradores?: any[];
  processos?: any[];
  serviceRequests?: ServiceRequest[];
  user?: any;
  onPathChange?: (path: string[]) => void;
  setDashboardTitle: (title: string) => void;
  initialActiveItem?: string;
}) {
  const safeTitle = typeof title === "string" ? title : String(title || "Painel de Gestão");
  const upperTitle = safeTitle.toUpperCase();

  const isReparticaoPessoal = upperTitle === "REPARTIÇÃO DE PESSOAL";
  const isEstatisticaMain = upperTitle === "REPARTIÇÃO DE ESTATÍSTICA";
  const isUGEA =
    safeTitle === "Unidade Gestora e Executora de Aquisições" ||
    upperTitle.includes("UGEA") ||
    upperTitle.includes("AQUISIÇ") ||
    upperTitle.includes("AQUISIC") ||
    upperTitle.includes("CONTRATAÇ") ||
    upperTitle.includes("CONTRATAC") ||
    upperTitle.includes("FORNECEDOR");

  const isPatrimonioDept =
    upperTitle.includes("PATRIM") ||
    upperTitle.includes("TRANSPOR") ||
    upperTitle.includes("INFRAESTRUTURA") ||
    upperTitle.includes("DP") ||
    upperTitle.includes("ECONOMATO") ||
    upperTitle.includes("BALANÇO") ||
    upperTitle.includes("BALANCO") ||
    isPatrimonioBossOrAdmin(user, colaboradores, processos);

  const [activeItem, setActiveItem] = useState(
    initialActiveItem ||
      (safeTitle === "Balanço"
        ? "Balanço"
        : safeTitle === "Gestão de Frota"
          ? "Gestão de Frota"
          : safeTitle === "Gestão de Viatura"
            ? "Gestão de Viatura"
            : upperTitle.includes("ARQUIVO")
              ? "Repartição de Arquivo"
              : upperTitle.includes("BOLSA")
                ? "Bolsa de Estudos"
                : isEstatisticaMain
                  ? "Corpo discente"
                  : (upperTitle.includes("PLANO") || upperTitle.includes("PLANIFIC"))
                    ? "Gestão de Planos"
                    : "Visão Geral"),
  );

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Gestão de Expediente", "Gestão Académica"]);

  const [disabledMenus, setDisabledMenus] = useState<string[]>([]);
  const [disabledSubItems, setDisabledSubItems] = useState<string[]>([]);
  const [showSectorMenuModal, setShowSectorMenuModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);

  // Verificação de Diretor-Geral (cabeça da instituição) vs Chefes alocados aos seus setores
  const isDGOrSuperBoss = isTitularDiretorGeral(user) || 
    isSuperBossUser(user) || 
    (user?.cargoChefia || "").toLowerCase().includes("diretor geral") ||
    (user?.cargo || "").toLowerCase().includes("diretor geral") ||
    (user?.cargo || "").toLowerCase().includes("diretor-geral");

  // A opção de Configurar Menus do Setor deve estar disponível apenas para administradores da instituição e geral
  const canConfigureSectorMenus = isSuperBossUser(user) || isInstitutionalAdminUser(user);

  // Setores em que o utilizador (chefe ou técnico) opera
  const userAssignedSectors = useMemo(() => {
    if (!user) return [];
    const set = new Set<string>();
    if (Array.isArray(user.setoresAtribuidos)) {
      user.setoresAtribuidos.forEach((s: string) => {
        if (s && typeof s === "string") set.add(s.trim());
      });
    }
    if (user.setor && typeof user.setor === "string") set.add(user.setor.trim());
    return Array.from(set);
  }, [user]);

  useEffect(() => {
    if (!title) return;
    const instId = user?.instituicaoId || getActiveInstituicaoId() || "default";
    const docId = `${instId}_${title.trim().replace(/\s+/g, "_")}`;

    const loadConfig = async () => {
      try {
        const config = await firestoreService.sector_menu_configs.getById(docId);
        if (config) {
          setDisabledMenus(config.disabledMenus || []);
          setDisabledSubItems(config.disabledSubItems || []);
        } else {
          setDisabledMenus([]);
          setDisabledSubItems([]);
        }
      } catch (_) {}
    };

    loadConfig();

    const handlePermissionsUpdated = (e: any) => {
      if (e.detail?.sectorName?.toLowerCase() === title.toLowerCase()) {
        setDisabledMenus(e.detail.disabledMenus || []);
        setDisabledSubItems(e.detail.disabledSubItems || []);
      }
    };

    window.addEventListener("sigep_sector_permissions_updated", handlePermissionsUpdated);
    return () => {
      window.removeEventListener("sigep_sector_permissions_updated", handlePermissionsUpdated);
    };
  }, [title, user?.instituicaoId]);

  const toggleMenu = (menuTitle: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuTitle)
        ? prev.filter((t) => t !== menuTitle)
        : [...prev, menuTitle]
    );
  };

  React.useEffect(() => {
    if (initialActiveItem) {
      setActiveItem(initialActiveItem);
    }
  }, [initialActiveItem]);

  // Navegação Operacional da Estrutura Institucional (Direções, Departamentos e Setores)
  const [activeInstId, setActiveInstId] = useState<string>(() => getActiveInstituicaoId());
  const [estrutura, setEstrutura] = useState(() => buildEstruturaInstituicao(getActiveInstituicaoId()));
  const [allInstituicoes, setAllInstituicoes] = useState<any[]>([]);
  const [showNavModal, setShowNavModal] = useState(false);

  React.useEffect(() => {
    const handleEstruturaChange = () => {
      const currentInst = getActiveInstituicaoId();
      setActiveInstId(currentInst);
      setEstrutura(buildEstruturaInstituicao(currentInst));
    };
    window.addEventListener("sigep_estrutura_updated", handleEstruturaChange);
    window.addEventListener("instituicao_changed", handleEstruturaChange);

    const unsub = firestoreService.instituicoes.subscribe((list: any[]) => {
      if (list && list.length > 0) {
        setAllInstituicoes(list);
      }
    });

    return () => {
      window.removeEventListener("sigep_estrutura_updated", handleEstruturaChange);
      window.removeEventListener("instituicao_changed", handleEstruturaChange);
      unsub();
    };
  }, []);

  const currentDepartamentos = getDepartamentosPorDirecao(title, activeInstId);
  const parentInfo = findDirecaoPorDepartamento(title, activeInstId);
  const parentDirecao = parentInfo?.direcao || null;
  const currentReparticoes = getReparticoesPorDepartamento(title, activeInstId);
  const isSuperBoss = isSuperBossUser(user);

  const [viewHistory, setViewHistory] = useState<any[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<string | null>(null);
  const [balancoType, setBalancoType] = useState<string | null>(null);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [movements, setMovements] = useState<any[]>([]);
  const [estudantesDb, setEstudantesDb] = useState<any[]>([]);

  useEffect(() => {
    const unsubEst = firestoreService.efetivo_escolar.subscribe((data: any[]) => {
      setEstudantesDb(data || []);
    });
    return () => {
      if (unsubEst) unsubEst();
    };
  }, []);

  const colabNivelAcademico = useMemo(() => {
    const map: Record<string, number> = {};
    (colaboradores || []).forEach(c => {
      const niv = c.nivelAcademico || c.grauAcademico || "Não Especificado";
      map[niv] = (map[niv] || 0) + 1;
    });
    return Object.entries(map).map(([nivel, total]) => ({ nivel, total })).sort((a, b) => b.total - a.total);
  }, [colaboradores]);

  const colabAreaFormacao = useMemo(() => {
    const map: Record<string, number> = {};
    (colaboradores || []).forEach(c => {
      const area = c.areaFormacao || c.area || c.departamento || "Geral";
      map[area] = (map[area] || 0) + 1;
    });
    return Object.entries(map).map(([area, total]) => ({ area, total })).sort((a, b) => b.total - a.total);
  }, [colaboradores]);

  const colabChefia = useMemo(() => {
    let comChefia = 0;
    let semChefia = 0;
    const cargosMap: Record<string, number> = {};
    (colaboradores || []).forEach(c => {
      const cargo = c.cargoChefia || c.cargo || c.funcao || "";
      const isChefe = /diretor|chefe|coordenador|reitor|decano|chefe de departamento|chefe de repartição/i.test(cargo);
      if (isChefe) {
        comChefia++;
        cargosMap[cargo] = (cargosMap[cargo] || 0) + 1;
      } else {
        semChefia++;
      }
    });
    return { comChefia, semChefia, cargosMap };
  }, [colaboradores]);

  const discenteCurso = useMemo(() => {
    const map: Record<string, number> = {};
    (estudantesDb || []).forEach(e => {
      const curso = e.curso || e.cursoNome || e.departamento || "Geral";
      map[curso] = (map[curso] || 0) + 1;
    });
    return Object.entries(map).map(([curso, total]) => ({ curso, total })).sort((a, b) => b.total - a.total);
  }, [estudantesDb]);

  const discenteNaturalidade = useMemo(() => {
    const map: Record<string, number> = {};
    (estudantesDb || []).forEach(e => {
      const nat = e.naturalidade || e.provincia || e.origem || "Não Especificada";
      map[nat] = (map[nat] || 0) + 1;
    });
    return Object.entries(map).map(([naturalidade, total]) => ({ naturalidade, total })).sort((a, b) => b.total - a.total);
  }, [estudantesDb]);

  const discenteNivel = useMemo(() => {
    const map: Record<string, number> = {};
    (estudantesDb || []).forEach(e => {
      const niv = e.nivel || e.ano || e.anoAcademico || "1º Ano";
      map[niv] = (map[niv] || 0) + 1;
    });
    return Object.entries(map).map(([nivel, total]) => ({ nivel, total })).sort((a, b) => b.total - a.total);
  }, [estudantesDb]);

  const planoAtividadesStats = useMemo(() => {
    const allActs = [...(matrixActivities || []), ...(activities || [])];
    let executadas = 0;
    let porExecutar = 0;
    let orcamentoExecutadas = 0;
    let orcamentoPorExecutar = 0;
    let orcamentoTotal = 0;

    allActs.forEach(a => {
      const st = (a.status || "").toLowerCase();
      const val = Number(a.orcamento || a.budget || a.valor || a.custo || 0);
      orcamentoTotal += val;
      if (st.includes("conclu") || st.includes("executad")) {
        executadas++;
        orcamentoExecutadas += val;
      } else {
        porExecutar++;
        orcamentoPorExecutar += val;
      }
    });

    return {
      total: allActs.length,
      executadas,
      porExecutar,
      orcamentoTotal,
      orcamentoExecutadas,
      orcamentoPorExecutar,
    };
  }, [matrixActivities, activities]);

  const navigateTo = (newItem: string, resetSelectedPlan = true) => {
    setViewHistory((prev) => [
      ...prev,
      { activeItem, selectedPlanType, showActivityForm },
    ]);
    setActiveItem(newItem);
    if (resetSelectedPlan) {
      setSelectedPlanType(null);
      setShowActivityForm(false);
    }
  };

  const handleExitWorkspace = (callback: () => void) => {
    callback();
  };

  const selectPlan = (type: string) => {
    setViewHistory((prev) => [
      ...prev,
      { activeItem, selectedPlanType, showActivityForm },
    ]);
    if (type === "Nova matriz") {
      setShowActivityForm(true);
    } else if (type === "Plano de Atividades") {
      setSelectedPlanType("NOVA_ATIVIDADE");
    } else {
      setSelectedPlanType(type);
    }
  };

  const handleBack = () => {
    if (viewHistory.length > 0) {
      const lastState = viewHistory[viewHistory.length - 1];
      setViewHistory((prev) => prev.slice(0, -1));
      setActiveItem(lastState.activeItem);
      setDashboardTitle(lastState.activeItem);
      setSelectedPlanType(lastState.selectedPlanType);
      setShowActivityForm(lastState.showActivityForm);
    } else {
      handleExitWorkspace(onBack);
    }
  };

  const isDepartment =
    upperTitle.includes("DEPARTAMENTO") ||
    upperTitle.includes("DIVISÃO") ||
    upperTitle.includes("DIVISAO") ||
    upperTitle.includes("UNIDADE") ||
    upperTitle.includes("SECRETARIA") ||
    upperTitle.includes("CENTRO") ||
    upperTitle.includes("REPARTIÇÃO") ||
    upperTitle.includes("REPARTICAO") ||
    upperTitle.includes("SETOR") ||
    upperTitle.includes("GDG");

  const nextYear = new Date().getFullYear() + 1;
  const planLabel = isDepartment ? "Plano de Atividades" : "Matriz";

  const hasExpediente = ["SECRETARIA EXECUTIVA", "SECRETARIA GERAL"].includes(
    upperTitle,
  );

  const estatisticaSectors = [
    "PESSOAL",
    "BOLSA DE ESTUDO",
    "FORMAÇÃO",
    "FORMACAO",
    "DRA",
    "REGISTO ACADÉMICO",
    "REGISTO ACADEMICO",
    "BIBLIOTECA",
    "ARQUIVO",
    "ALOJAMENTO",
  ];
  const hasEstatistica = estatisticaSectors.some((s) =>
    upperTitle.includes(s),
  );

  const isExcludedFromNewMenu =
    upperTitle.includes("ESTATÍSTICA") ||
    upperTitle.includes("ESTATISTICA") ||
    upperTitle.includes("RELATÓRIO") ||
    upperTitle.includes("RELATORIO") ||
    upperTitle.includes("PLANO DE ATIVIDADE");

  const {
    isDG,
    isDC,
    isDCC,
    isCD,
    isCR,
    isConsRep,
    isConsAdm,
    isConsTec,
    isDICOSAFA_Dept,
    isGDG,
  } = getRoles(safeTitle);
  const isGestDoc =
    upperTitle === "GESTÃO DE DOCUMENTOS" ||
    upperTitle === "GESTÃO DE DOCUMENTOS" ||
    (["SECRETARIA EXECUTIVA"].includes(upperTitle) &&
      !isDICOSAFA_Dept);
  const isSetor =
    !isDG &&
    !isDC &&
    !isDCC &&
    !isCD &&
    !isCR &&
    !isConsRep &&
    !isConsAdm &&
    !isConsTec &&
    !isGestDoc &&
    !isEstatisticaMain &&
    !isGDG;

  const canAssignActivity =
    isDG ||
    isDC ||
    isCD ||
    (isDICOSAFA_Dept && upperTitle.includes("DEPARTAMENTO")) ||
    upperTitle === "CHEFE DO DPEP";

  const isDPEP =
    upperTitle.includes("DPEP") ||
    upperTitle.includes("PLANIFICAÇÃO") ||
    upperTitle.includes("PLANIFICACAO") ||
    upperTitle.includes("PLANEAMENTO") ||
    (user?.departamento || "").toUpperCase().includes("DPEP") ||
    (user?.departamento || "").toUpperCase().includes("PLANIFICAÇÃO") ||
    (user?.departamento || "").toUpperCase().includes("PLANEAMENTO") ||
    (user?.setor || "").toUpperCase().includes("PLANIFICAÇÃO") ||
    (user?.setor || "").toUpperCase().includes("PLANEAMENTO") ||
    (user?.reparticao || "").toUpperCase().includes("PLANIFICAÇÃO") ||
    (user?.reparticao || "").toUpperCase().includes("PLANEAMENTO");

  const isDAF =
    upperTitle.includes("DAF") ||
    upperTitle === "CHEFE DO DAF" ||
    upperTitle.includes("APOIO FINANCEIRO") ||
    upperTitle.includes("FINANÇAS") ||
    upperTitle.includes("FINANCAS") ||
    (user?.departamento || "").toUpperCase().includes("DAF") ||
    (user?.departamento || "").toUpperCase().includes("APOIO FINANCEIRO") ||
    (user?.departamento || "").toUpperCase().includes("FINANÇAS");

  const getMenuItems = () => {
    // Standard baseline for all sectors according to requirement
    const baseItems = [
      { title: "Visão Geral", icon: LayoutGrid },
      { title: isDPEP ? "Gestão de Planos" : "Plano", icon: FileText },
      { title: "Ação Orçamental", icon: DollarSign },
      { title: "Calendário", icon: Calendar },
      { title: "Caixa de Mensagens", icon: MessageSquare },
      { title: "Assinatura Digital", icon: Pen },
      {
        title: "Gestão de Expediente",
        icon: FolderOpen,
        subItems: [
          { title: "Histórico de Documentos", icon: FolderOpen },
          { title: "Documentos Normativos", icon: FileText },
          { title: "Relatórios", icon: BarChart3 },
          { title: "Balanço", icon: TrendingUp },
          { title: "Assinatura Digital", icon: Pen },
        ],
      },
      { title: "Atribuir Atividade", icon: CheckSquare },
    ];

    if (isReparticaoPessoal) {
      return [
        ...baseItems,
        { title: "Gestão de Pessoal", icon: Users },
      ];
    }

    if (isEstatisticaMain) {
      return [
        ...baseItems,
        { title: "Corpo discente", icon: GraduationCap },
        { title: "Estatística da Repartição de Pessoal", icon: Users },
        { title: "Recursos financeiro", icon: DollarSign },
        { title: "Infraestruturas", icon: Building2 },
        { title: "Previsão n+1", icon: TrendingUp },
      ];
    }

    if (isUGEA) {
      return [
        { title: "Plano", icon: FileText },
        { title: "Ação Orçamental", icon: DollarSign },
        { title: "Calendário", icon: Calendar },
        { title: "Caixa de Mensagens", icon: MessageSquare },
        { title: "Assinatura Digital", icon: Pen },
        {
          title: "Gestão de Expediente",
          icon: FolderOpen,
          subItems: [
            { title: "Histórico de Documentos", icon: FolderOpen },
            { title: "Documentos Normativos", icon: FileText },
            { title: "Relatórios", icon: BarChart3 },
            { title: "Balanço", icon: TrendingUp },
            { title: "Assinatura Digital", icon: Pen },
          ],
        },
        { title: "Atribuir Atividade", icon: CheckSquare },
        { title: "Gestão de Produtos e Preços", icon: Box },
        { title: "Gestão de Fornecedores", icon: Users },
        { title: "Plano de Aquisição", icon: FileText },
        { title: "Plano de Contratação", icon: FileText },
      ];
    }

    let items = [...baseItems];

    const isAdmin = isSuperBossUser(user);

    // Role-specific additions (Only keeping non-department specific ones if absolutely necessary, but prompt says NO DIFFERENCES for departments)
    // To strictly follow "nenhum departamento deve ser diferente desse", we will just use baseItems for typical departments.
    
    // However, some specific operational views might still need their specific tabs if they are not standard departments.
    const upperTitle = title.toUpperCase();
    const upperUserRole = (
      (user?.cargo || "") + " " +
      (user?.cargoChefia || "") + " " +
      (user?.title || "") + " " +
      (user?.role || "") + " " +
      (user?.funcao || "") + " " +
      (user?.departamento || "") + " " +
      (user?.areaDeAfetacao || "")
    ).toUpperCase();

    // Gestão de Frota e Gestão de Viatura (EXCLUSIVO PARA CHEFE DE TRANSPORTES / Repartição de Transporte)
    const isChefeTransportes =
      upperTitle.includes("TRANSPOR") ||
      upperTitle.includes("FROTA") ||
      upperTitle.includes("VIATURA") ||
      upperUserRole.includes("TRANSPOR") ||
      upperUserRole.includes("CHEFE DE TRANSPOR") ||
      upperUserRole.includes("CHEFE DO SECTOR DE TRANSPOR") ||
      upperUserRole.includes("CHEFE DA REPARTIÇÃO DE TRANSPOR") ||
      upperUserRole.includes("CHEFE DA REPARTICAO DE TRANSPOR") ||
      upperUserRole.includes("GESTOR DE FROTA") ||
      upperUserRole.includes("GESTOR DE VIATURA");

    if (isChefeTransportes) {
      if (!items.some((i) => i.title === "Gestão de Frota")) {
        items.push({ title: "Gestão de Frota", icon: Car });
      }
      if (!items.some((i) => i.title === "Gestão de Viatura")) {
        items.push({ title: "Gestão de Viatura", icon: ClipboardList });
      }
    }

    if (upperTitle.includes("BOLSA")) {
      items.unshift({ title: "Bolsa de Estudos", icon: GraduationCap });
    }

    if (upperTitle.includes("ARQUIVO")) {
      items.splice(1, 0, { title: "Repartição de Arquivo", icon: Archive });
    }

    // Verificação abrangente para Diretores de Curso e Chefe de Departamento de Disciplinas Gerais (Exclusivo, nunca no RH)
    const isRHUser =
      upperTitle.includes("RECURSOS HUMANOS") ||
      upperTitle.includes("RH") ||
      upperTitle.includes("PESSOAL") ||
      upperUserRole.includes("RECURSOS HUMANOS") ||
      upperUserRole.includes("RH") ||
      upperUserRole.includes("PESSOAL");

    const isUserCourseDirector =
      upperUserRole.includes("DIRETOR DO CURSO") ||
      upperUserRole.includes("DIRETOR DE CURSO") ||
      upperUserRole.includes("DIRECTOR DO CURSO") ||
      upperUserRole.includes("DIRECTOR DE CURSO") ||
      upperUserRole.includes("DIRETOR DOS CURSOS") ||
      upperUserRole.includes("DIRECTOR DOS CURSOS") ||
      upperUserRole.includes("DIRETOR DE CURSOS") ||
      upperUserRole.includes("DIRECTOR DE CURSOS");

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
      upperTitle.includes("DIRETOR DO CURSO") ||
      upperTitle.includes("DIRETOR DE CURSO") ||
      upperTitle.includes("DIRECTOR DO CURSO") ||
      upperTitle.includes("DIRECTOR DE CURSO") ||
      upperTitle.includes("LICENCIATURA");

    const isHeadGeneralDisciplines =
      upperTitle.includes("DISCIPLINAS GERAIS") ||
      upperTitle.includes("DDG") ||
      upperUserRole.includes("DISCIPLINAS GERAIS") ||
      upperUserRole.includes("DDG");

    const isAuthorizedAcademic = 
      !isRHUser && (isUserCourseDirector || isCourseOrAcademicTitle || isHeadGeneralDisciplines);

    if (isAuthorizedAcademic) {
      if (!items.some((i) => i.title === "Gestão Académica")) {
        items.push({
          title: "Gestão Académica",
          icon: GraduationCap,
          subItems: [
            { title: "Docentes", icon: Users },
            { title: "Alocação", icon: ClipboardList },
            { title: "Horário", icon: Clock },
            { title: "Calendário de Exame", icon: BookMarked },
            { title: "Graduados", icon: GraduationCap },
            { title: "Disciplina", icon: BookOpen },
            { title: "Blocos e Sala de Aula", icon: Building2 },
            { title: "Laboratório", icon: FlaskConical },
            { title: "Oficinas", icon: Wrench },
          ],
        });
      }
    }

    // Add Gestão Estudantil exclusively for DRA / Registo Académico
    const isDRA =
      upperTitle.includes("DRA") ||
      upperTitle.includes("REGISTO ACADÉMICO") ||
      upperTitle.includes("REGISTO ACADEMICO") ||
      upperUserRole.includes("REGISTO ACADÉMICO") ||
      upperUserRole.includes("REGISTO ACADEMICO") ||
      upperUserRole.includes("DRA");

    if (isDRA) {
      if (!items.some((i) => i.title === "Gestão Estudantil")) {
        items.push({ title: "Gestão Estudantil", icon: GraduationCap });
      }
    }

    return items;
  };

  const rawMenuItems = getMenuItems();

  const menuItems = useMemo(() => {
    if (!disabledMenus.length && !disabledSubItems.length) {
      return rawMenuItems;
    }

    const isMatch = (str: string, list: string[]) => {
      if (!str) return false;
      const lower = str.toLowerCase().trim();
      return list.some((disabled) => Boolean(disabled && disabled.toLowerCase().trim() === lower));
    };

    return rawMenuItems
      .filter((item) => !isMatch(item.title, disabledMenus))
      .map((item) => {
        if (item.subItems) {
          const filteredSub = item.subItems.filter(
            (sub) => !isMatch(sub.title, disabledSubItems) && !isMatch(sub.title, disabledMenus)
          );
          return { ...item, subItems: filteredSub };
        }
        return item;
      });
  }, [rawMenuItems, disabledMenus, disabledSubItems]);

  // Se o item ativo atual tiver sido ocultado na configuração deste setor, alterna para o primeiro menu visível
  React.useEffect(() => {
    if (menuItems.length > 0) {
      const lowerActive = (activeItem || "").toLowerCase().trim();
      const isSubView =
        activeItem === "Visão Geral" ||
        lowerActive.includes("fornecedor") ||
        lowerActive.includes("fornecedores") ||
        lowerActive.includes("supplier") ||
        activeItem === "UGEA_SupplierForm" ||
        activeItem === "Registo de Fornecedores" ||
        activeItem === "Registo de Fornecedor" ||
        activeItem === "Formulário de Registo de Fornecedores" ||
        activeItem === "Formulário de Registo de Fornecedor" ||
        activeItem === "SupplierRegistration" ||
        activeItem === "Novo Registo de Fornecedor" ||
        activeItem === "Gestão de Fornecedores" ||
        activeItem === "Gestão de Fornecedor" ||
        activeItem === "Fornecedores" ||
        activeItem === "Fornecedor" ||
        activeItem === "Registar" ||
        activeItem === "Gestão de Produtos e Preços" ||
        activeItem === "Plano de Aquisição" ||
        activeItem === "Plano de Contratação";

      const isCurrentActiveVisible = menuItems.some(
        (item: any) =>
          item.title === activeItem ||
          (item.subItems && item.subItems.some((sub: any) => sub.title === activeItem))
      );
      if (!isCurrentActiveVisible && !isSubView) {
        if (isUGEA || lowerActive.includes("fornecedor")) {
          setActiveItem("Gestão de Fornecedores");
        } else {
          setActiveItem(menuItems[0]?.title || "Visão Geral");
        }
      }
    }
  }, [menuItems, activeItem, isUGEA]);

  const allMenuItems = menuItems;
  console.log("allMenuItems:", allMenuItems);

  const boards = [
    "Conselho De Representantes",
    "Conselho Administrativo E De Gestão",
    "Conselho Técnico E De Qualidade",
  ];

  React.useEffect(() => {
    const isPatrimonioDept =
      upperTitle.includes("PATRIM") ||
      upperTitle.includes("TRANSPOR") ||
      upperTitle.includes("INFRAESTRUTURA") ||
      upperTitle.includes("DP") ||
      upperTitle.includes("ECONOMATO") ||
      upperTitle.includes("BALANÇO") ||
      upperTitle.includes("BALANCO") ||
      isPatrimonioBossOrAdmin(user, colaboradores, processos);

    if (isPatrimonioDept) {
      const unsub =
        firestoreService.movimentos_economato.subscribe(setMovements);
      return () => {
        unsub();
      };
    }
  }, [title, user, colaboradores, processos]);

  React.useEffect(() => {
    const path = [activeItem];
    if (selectedPlanType && selectedPlanType !== "NOVA_ATIVIDADE")
      path.push(selectedPlanType);
    if (showActivityForm)
      path.push(
        activeItem === "Matriz" || activeItem === "Plano"
          ? "Registo de Atividade"
          : "Formulário",
      );
    onPathChange?.(path);
  }, [activeItem, selectedPlanType, showActivityForm, onPathChange]);

  React.useEffect(() => {
    if (!user) return;
    const isAdmin = isSuperBossUser(user);
    if (
      activeItem === "Repartição de Pessoal" ||
      activeItem === "Gestão de Pessoal"
    ) {
      if (!isAdmin && !isHRBossUser(user) && !canAccessArea(user, user.direcao, user.departamento, "Pessoal")) {
        onShowAlert("Acesso não autorizado a esta área.");
        setActiveItem("Visão Geral");
      }
    }
    if (
      activeItem === "Repartição de Arquivo" ||
      activeItem === "Arquivo Morto"
    ) {
      if (!isAdmin && !canAccessArea(user, user.direcao, user.departamento, "Arquivo")) {
        onShowAlert("Acesso não autorizado a esta área.");
        setActiveItem("Visão Geral");
      }
    }
  }, [activeItem, user, onShowAlert]);

  const [individualActivities, setIndividualActivities] = useState<
    MatrixActivity[]
  >([]);
  const [sectorActivities, setSectorActivities] = useState<MatrixActivity[]>(
    [],
  );
  const [reparticaoActivities, setReparticaoActivities] = useState<
    MatrixActivity[]
  >([]);
  const [departmentActivities, setDepartmentActivities] = useState<
    MatrixActivity[]
  >([]);
  const [directionActivities, setDirectionActivities] = useState<
    MatrixActivity[]
  >([]);
  const [institutionalActivities, setInstitutionalActivities] = useState<
    MatrixActivity[]
  >([]);

  React.useEffect(() => {
    if (!matrixActivities) return;

    const isChefeDPEPUser =
      title.toUpperCase().includes("DPEP") ||
      title.toUpperCase() === "CHEFE DO DPEP" ||
      (user?.departamento || "").toUpperCase().includes("DPEP");

    // Individual plans
    const ind = matrixActivities.filter(
      (a) =>
        a.orcamento === "Plano Individual" &&
        canAccessArea(
          user,
          a.direcao || "",
          a.departamento || "",
          a.setor || "",
        ),
    );
    setIndividualActivities(ind);

    // Sectorial Plan (draft / setorial / setor) - visible only by the sector that planned it (or DPEP)
    const sec = matrixActivities.filter((a) => {
      const isSecStatus =
        !a.status ||
        (a.status as any) === "draft" ||
        (a.status as any) === "setorial" ||
        (a.status as any) === "setor";
      if (!isSecStatus) return false;
      return canAccessArea(
        user,
        a.direcao || "",
        a.departamento || "",
        a.setor || "",
      );
    });
    setSectorActivities(sec);

    const normDept = (str: string) =>
      String(str || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/^departamento\s+(de\s+|da\s+|dos\s+|do\s+)?/i, "")
        .trim();

    const isDeptMatch = (d1?: string, d2?: string) => {
      if (!d1 || !d2) return false;
      const n1 = normDept(d1);
      const n2 = normDept(d2);
      if (!n1 || !n2) return false;
      return n1 === n2;
    };

    // Repartição Plan (reparticao)
    const rep = matrixActivities.filter((a) => {
      if (isChefeDPEPUser || isSuperBossUser(user)) return true;
      const isRepStatus = (a.status as any) === "reparticao";
      return (
        isRepStatus ||
        a.reparticao === title ||
        isDeptMatch(a.departamento, user?.departamento) ||
        isDeptMatch(a.departamento, title)
      );
    });
    setReparticaoActivities(rep);

    // Department Plan (departamento)
    const deptVal = matrixActivities.filter((a) => {
      if (isChefeDPEPUser || isSuperBossUser(user)) return true;
      return (
        isDeptMatch(a.departamento, user?.departamento) ||
        isDeptMatch(a.departamento, title) ||
        isDeptMatch(a.unidadeOrganica, title) ||
        canAccessArea(user, a.direcao || "", a.departamento || "", a.setor || "")
      );
    });
    setDepartmentActivities(deptVal);

    // Direction Plan (direcao)
    const dirVal = matrixActivities.filter(
      (a) => (a.status as any) === "direcao",
    );
    setDirectionActivities(dirVal);

    // Institutional Plan (institucional/consolidated)
    const inst = matrixActivities.filter(
      (a) =>
        (a.status as any) === "institucional" ||
        (a.status as any) === "consolidated",
    );
    setInstitutionalActivities(inst);
  }, [matrixActivities, title, user]);
  const [publishedMatrices, setPublishedMatrices] = useState<any[]>([
    {
      id: "MAT-2027-001",
      year: 2027,
      publishedAt: "2026-04-02 11:15",
      activityCount: 8,
      status: "published",
    },
    {
      id: "MAT-2026-005",
      year: 2026,
      activityCount: 12,
      status: "shared",
    },
  ]);

  const handleGeneratePDFReport = () => {
    const doc = new jsPDF();
    const now = new Date();
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const currentMonth = monthNames[now.getMonth()];
    const currentYear = now.getFullYear();

    // Filtro para o mês corrente
    const monthlyActivities = matrixActivities.filter(act => {
      if (!act.createdAt) return false;
      const actDate = new Date(act.createdAt);
      return actDate.getMonth() === now.getMonth() && actDate.getFullYear() === now.getFullYear();
    });

    const pending = monthlyActivities.filter(a => (a.status as string) === "Pendente" || !a.status || (a.status as string) === "Em Curso" || a.status === "draft" || a.status === "submitted");
    const completed = monthlyActivities.filter(a => (a.status as string) === "Concluído" || (a.status as string) === "Validado" || a.status === "executada" || a.status === "pronta");

    doc.setFontSize(18);
    doc.setTextColor(18, 28, 96);
    doc.text(`Relatório Mensal de Atividades - ${currentMonth} ${currentYear}`, 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Instituição: ${user?.instituicaoNome || 'SIGEP'}`, 14, 28);
    doc.text(`Data de Emissão: ${now.toLocaleString()}`, 14, 34);

    // Resumo
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Resumo de Atividades:", 14, 45);
    doc.setFontSize(10);
    doc.text(`- Total no Mês: ${monthlyActivities.length}`, 14, 52);
    doc.text(`- Concluídas: ${completed.length}`, 14, 58);
    doc.text(`- Pendentes/Em Curso: ${pending.length}`, 14, 64);

    // Tabela de Atividades
    const tableData = monthlyActivities.map(act => [
      act.title || "Sem Título",
      act.sector || "N/A",
      act.status || "Pendente",
      act.createdAt ? new Date(act.createdAt).toLocaleDateString() : "N/A"
    ]);

    autoTable(doc, {
      startY: 75,
      head: [["Título da Atividade", "Setor", "Estado", "Data Criação"]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [18, 28, 96], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(`Relatorio_Atividades_${currentMonth}_${currentYear}.pdf`);
  };

  const renderContent = () => {
    if (activeItem === "Gestão de Produtos e Preços") {
      return <GestaoProdutosPrecosView />;
    }

    const lowerActive = (activeItem || "").toLowerCase().trim();

    // 1. Formulário de Registo / Novo Registo de Fornecedor
    const isSupplierReg =
      lowerActive.includes("registo de fornecedor") ||
      lowerActive.includes("registo de fornecedores") ||
      lowerActive.includes("novo registo de fornecedor") ||
      lowerActive.includes("novo registo de fornecedores") ||
      lowerActive.includes("novo fornecedor") ||
      lowerActive.includes("formulário de registo de fornecedor") ||
      lowerActive.includes("formulario de registo de fornecedor") ||
      lowerActive.includes("formulário de registo de fornecedores") ||
      lowerActive.includes("formulario de registo de fornecedores") ||
      lowerActive === "ugea_supplierform" ||
      lowerActive === "supplierregistration" ||
      lowerActive === "supplier_form" ||
      (activeItem === "Registar" && (isUGEA || safeTitle.toLowerCase().includes("ugea") || safeTitle.toLowerCase().includes("fornecedor") || safeTitle.toLowerCase().includes("aquisição") || safeTitle.toLowerCase().includes("aquisicao")));

    if (isSupplierReg) {
      return (
        <div className="absolute inset-0 bg-white z-50 flex flex-col pt-4">
          <UGEA_SupplierRegistrationForm
            onBack={() => setActiveItem("Gestão de Fornecedores")}
            onSubmit={async (supplierData) => {
              try {
                if (supplierData.id) {
                  await firestoreService.suppliers.set(supplierData.id, supplierData);
                } else {
                  await firestoreService.suppliers.add(supplierData);
                }
                if (onShowAlert) {
                  onShowAlert("Fornecedor registado com sucesso!", "success");
                }
              } catch (err) {
                console.error("Erro ao registar fornecedor:", err);
                if (onShowAlert) {
                  onShowAlert("Erro ao registar fornecedor.", "error");
                }
              }
              setActiveItem("Gestão de Fornecedores");
            }}
          />
        </div>
      );
    }

    // 2. Área / Tabela de Gestão de Fornecedores
    const isSupplierManagement =
      lowerActive === "gestão de fornecedores" ||
      lowerActive === "gestao de fornecedores" ||
      lowerActive === "gestão de fornecedor" ||
      lowerActive === "gestao de fornecedor" ||
      lowerActive === "fornecedores" ||
      lowerActive === "fornecedor" ||
      lowerActive === "supplier_management" ||
      lowerActive === "suppliers";

    if (isSupplierManagement) {
      return (
        <div className="absolute inset-0 bg-white z-50 flex flex-col pt-4">
          <UGEA_SupplierManagementView
            onBack={handleBack}
            suppliers={suppliers || []}
            onAddSupplier={() => setActiveItem("Registo de Fornecedor")}
            onShowAlert={onShowAlert}
          />
        </div>
      );
    }

    if (isUGEA) {
      if (activeItem === "Plano de Aquisição") {
        return (
          <UGEA_PlanView
            type="Aquisicão"
            activities={matrixActivities || []}
            user={user}
            onBack={handleBack}
          />
        );
      }
      if (activeItem === "Plano de Contratação") {
        return (
          <UGEA_PlanView
            type="Contratação"
            activities={matrixActivities || []}
            user={user}
            onBack={handleBack}
          />
        );
      }
    }

    if (isEstatisticaMain) {
      if (activeItem === "Estatística da Repartição de Pessoal") {
        return <RHStatView title={title} />;
      }
      return (
        <div className="relative w-full z-[100] flex flex-col overflow-y-auto">
          <EstatisticaView
            onBack={() => onBack()}
            isReadOnly={false}
            title={title}
            hideSidebar={false}
            initialActiveItem={activeItem}
          />
        </div>
      );
    }

    if (
      activeItem === "Repartição de Pessoal" ||
      activeItem === "Gestão de Pessoal"
    ) {
      if (!isSuperBossUser(user) && !isHRBossUser(user) && !canAccessArea(user, user.direcao, user.departamento, "Pessoal")) {
        return (
          <div className="w-full max-w-2xl mx-auto border-2 border-red-200 bg-red-50/50 rounded-2xl p-8 text-center text-slate-700 shadow-sm my-8">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              !
            </div>
            <h3 className="font-bold text-lg text-red-900 mb-2">Acesso Restrito ao Sector</h3>
            <p className="text-sm text-slate-600 mb-6">
              Não possui permissões suficientes para aceder à área de Gestão de Pessoal. Contacte a Administração do Sistema.
            </p>
            <button
              onClick={() => setActiveItem("Visão Geral")}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all shadow-md"
            >
              Voltar à Visão Geral
            </button>
          </div>
        );
      }
      return (
        <GestaoPessoalView
          onBack={() => handleExitWorkspace(() => setActiveItem("Visão Geral"))}
          title={title}
          user={user}
          onLogout={onLogout}
          initialColaboradores={colaboradores}
          initialProcessos={processos}
          hideSidebar={true}
        />
      );
    }

    if (
      activeItem === "Repartição de Arquivo" ||
      activeItem === "Arquivo Morto"
    ) {
      if (!isSuperBossUser(user) && !canAccessArea(user, user.direcao, user.departamento, "Arquivo")) {
        return (
          <div className="w-full max-w-2xl mx-auto border-2 border-red-200 bg-red-50/50 rounded-2xl p-8 text-center text-slate-700 shadow-sm my-8">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              !
            </div>
            <h3 className="font-bold text-lg text-red-900 mb-2">Acesso Restrito ao Sector</h3>
            <p className="text-sm text-slate-600 mb-6">
              Não possui permissões suficientes para aceder à Repartição de Arquivo. Contacte a Administração do Sistema.
            </p>
            <button
              onClick={() => setActiveItem("Visão Geral")}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all shadow-md"
            >
              Voltar à Visão Geral
            </button>
          </div>
        );
      }
      return (
        <Suspense fallback={<div className="p-8 text-center text-slate-500">A carregar...</div>}>
          <ArchiveView
            user={user}
            onBack={() => handleExitWorkspace(() => setActiveItem("Visão Geral"))}
            onShowAlert={onShowAlert}
          />
        </Suspense>
      );
    }

    if (activeItem === "Gestão de Formação") {
      return (
        <GestaoFormacaoView
          onBack={() => handleExitWorkspace(() => setActiveItem("Visão Geral"))}
        />
      );
    }

    if (activeItem === "Gestão de Social") {
      return (
        <GestaoSocialView
          onBack={() => handleExitWorkspace(() => setActiveItem("Visão Geral"))}
        />
      );
    }

    if (
      activeItem === "Gestão de Documentos" ||
      activeItem === "Gestão de Expediente" ||
      activeItem === "Histórico de Documentos" ||
      activeItem === "Histórico de Documentos Internos" ||
      activeItem === "Documentos Normativos" ||
      activeItem === "Relatórios" ||
      activeItem === "Balanço" ||
      (activeItem === "Gestão de Expedientes" && hasExpediente)
    ) {
      return (
        <div className="fixed inset-0 z-50 bg-[#050a1a] w-full h-full flex flex-col">
          <GestaoExpedienteHistoricoView
            onBack={() => handleExitWorkspace(() => setActiveItem("Visão Geral"))}
            expedientes={expedientes}
            onUpdateExpediente={(updated: any) =>
              onUpdateExpediente?.(updated.id, updated)
            }
            user={user}
            title={title}
            initialTab={
              activeItem === "Documentos Normativos" ||
              activeItem === "Relatórios" ||
              activeItem === "Balanço" ||
              (activeItem as string) === "Assinatura Digital" ||
              activeItem === "Histórico de Documentos"
                ? activeItem
                : "Histórico de Documentos"
            }
            activities={matrixActivities || []}
            onNavigate={(item) => {
              setActiveItem(item);
            }}
          />
        </div>
      );
    }

    if (
      activeItem === "Calendário" ||
      activeItem === "Calendario" ||
      activeItem === "Calendar" ||
      activeItem === "Agenda" ||
      activeItem === "Calendário de Atividades" ||
      activeItem === "Calendario de Atividades"
    ) {
      return (
        <CalendarView
          events={events}
          onAddEvent={(evt) => firestoreService.events.add(evt)}
          onUpdateEvent={onUpdateEvent}
          onDeleteEvent={onDeleteEvent}
          onAgendar={onAgendar}
          onNota={onNota}
          title={title}
          notes={notes}
          user={user}
        />
      );
    }

    if (activeItem === "Assinatura Digital") {
      return <AssinaturaDigitalView onBack={handleBack} user={user} />;
    }

    if (activeItem === "Ação Orçamental") {
      return (
        <AcaoOrcamentalView
          user={user}
          title={title}
          activities={matrixActivities || []}
          onShowAlert={onShowAlert}
        />
      );
    }

    if (activeItem === "Caixa de Mensagens") {
      return (
        <CaixaMensagensView
          departmentTitle={title}
          user={user}
          colaboradores={colaboradores}
        />
      );
    }

    if (activeItem === "Atribuir Atividade") {
      return (
        <AssignActivityView
          directorTitle={title}
          colaboradores={colaboradores}
        />
      );
    }

    if (
      !isSupplierReg &&
      !isSupplierManagement &&
      !lowerActive.includes("fornecedor") &&
      (
        activeItem === "Gestão de Planos" ||
        activeItem === "Gestão de Planos e Actividades" ||
        activeItem === "Matriz" ||
        activeItem === "Plano" ||
        activeItem === "Planos" ||
        activeItem === "Plano de Atividades" ||
        activeItem === "Planos de Atividades" ||
        activeItem === "Plano de Actividades" ||
        activeItem === "Planos de Actividades" ||
        activeItem === "Plano de Atividade" ||
        activeItem === "Plano de Actividade" ||
        activeItem === "Plano da Direção" ||
        activeItem === "Meu Plano Individual" ||
        activeItem === "Plano Individual" ||
        activeItem === "Plano do Gabinete" ||
        activeItem === "Plano Setorial" ||
        activeItem === "Planificação" ||
        activeItem === "Planificação de Atividades" ||
        activeItem === "Matriz de Atividades" ||
        activeItem === "Matriz de Actividades" ||
        (activeItem &&
          activeItem.toLowerCase().includes("plano") &&
          !activeItem.toLowerCase().includes("aquisição") &&
          !activeItem.toLowerCase().includes("contratação") &&
          !activeItem.toLowerCase().includes("fornecedor")) ||
        (activeItem && activeItem.toLowerCase().includes("planific") && !activeItem.toLowerCase().includes("fornecedor"))
      )
    ) {
      return (
        <PlanoWorkflowView
          user={user}
          title={title}
          matrixActivities={matrixActivities || []}
          onAddMatrixActivity={(data: any) =>
            firestoreService.matrixActivities.add(data)
          }
          onUpdateMatrixActivity={(id: string, data: any) =>
            firestoreService.matrixActivities.update(id, data)
          }
          onShowAlert={onShowAlert}
          onBack={handleBack}
        />
      );
    }

    if (activeItem === "Minha Matriz") {
      return <MyMatrixView onShowAlert={onShowAlert} />;
    }

    if (activeItem === "Meu Plano Individual") {
      return (
        <MatrixView
          title="Meu Plano Individual"
          isDepartment={isDepartment}
          externalActivities={individualActivities}
          setExternalActivities={setIndividualActivities}
          onActivityAdded={(a) => firestoreService.matrixActivities.add(a)}
          onUpdateActivity={onUpdateMatrixActivity}
          onDeleteActivity={onDeleteMatrixActivity}
        />
      );
    }

    if (activeItem === "Gestão Académica" || activeItem === "Docentes") {
      return (
        <GestaoAcademicaView
          title={title}
          user={user}
          onBack={() => setActiveItem("Visão Geral")}
          initialShowList={true}
        />
      );
    }

    if (activeItem === "Alocação") {
      return (
        <GestaoAcademicaView
          title={title}
          user={user}
          onBack={() => setActiveItem("Visão Geral")}
        />
      );
    }

    if (activeItem === "Horário") {
      return (
        <HorarioView title={title} user={user} />
      );
    }

    if (activeItem === "Calendário de Exame") {
      return (
        <ExamesView user={user} onShowAlert={onShowAlert} />
      );
    }

    if (activeItem === "Graduados") {
      return (
        <GraduadosView />
      );
    }

    if (activeItem === "Disciplina") {
      return (
        <DisciplinasEspacosFisicosView
          user={user}
          onShowAlert={onShowAlert}
          categoria="Disciplinas"
        />
      );
    }

    if (activeItem === "Blocos e Sala de Aula") {
      return (
        <DisciplinasEspacosFisicosView
          user={user}
          onShowAlert={onShowAlert}
          categoria="Blocos e Sala de Aula"
        />
      );
    }

    if (activeItem === "Laboratório") {
      return (
        <DisciplinasEspacosFisicosView
          user={user}
          onShowAlert={onShowAlert}
          categoria="Laboratórios"
        />
      );
    }

    if (activeItem === "Oficinas") {
      return (
        <DisciplinasEspacosFisicosView
          user={user}
          onShowAlert={onShowAlert}
          categoria="Oficinas"
        />
      );
    }

    if (activeItem === "Gestão Estudantil") {
      return (
        <GestaoEstudantilView
          user={user}
          onBack={() => setActiveItem("Visão Geral")}
          title="Gestão Estudantil"
        />
      );
    }

    if (
      activeItem === "Gestão de Frota" ||
      activeItem === "Gestão de Viatura"
    ) {
      return (
        <div className="absolute inset-0 bg-white z-50 flex flex-col pt-4">
          <GestaoTransporteView
            user={user}
            onBack={() => setActiveItem("Visão Geral")}
            initialTab={
              activeItem === "Gestão de Frota"
                ? "gestao_frota"
                : "gestao_viatura"
            }
          />
        </div>
      );
    }

    if (activeItem === "Relatórios") {
      return (
        <ReportsView
          user={user}
          onShowAlert={onShowAlert}
          initialDirection={title}
          onBack={() => setActiveItem("Visão Geral")}
        />
      );
    }

    if (activeItem === "Balanço") {
      return (
        <BalancoAtividadesView
          activities={activities || []}
          user={user}
          onBack={() => setActiveItem("Visão Geral")}
          sectorTitle={title}
        />
      );
    }

    if (activeItem === "Documentos Normativos") {
      return <DocumentosView title={title} user={user} />;
    }

    if (
      activeItem === "Bolsa de Estudos" ||
      (upperTitle.includes("BOLSA") &&
        (activeItem === "Visão Geral" || activeItem === "Bolsa de Estudos"))
    ) {
      return (
        <BolsasEstudosView
          title={safeTitle}
          user={user}
          viewMode={activeItem === "Visão Geral" ? "summary" : "form"}
          onEstatistica={() => navigateTo("Estatística")}
        />
      );
    }

    if (activeItem === "Estatística") {
      const titleUpper = upperTitle;

      // If it's the Finance Head, show the specific form
      if (titleUpper.includes("FINANÇAS")) {
        return (
          <div className="absolute inset-0 bg-white z-50 flex flex-col pt-4">
            <RecursosFinanceirosForm
              onClose={() => setActiveItem("Visão Geral")}
              onSubmit={async (data) => {
                try {
                  await firestoreService.financialData.add(data);
                  if (setFinancialData) {
                    setFinancialData((prev) => [...prev, data]);
                  }
                  onShowAlert(
                    "Dados financeiros enviados com sucesso para a Repartição de Estatística!",
                  );
                  setActiveItem("Visão Geral");
                } catch (error) {
                  console.error("Error adding financial data:", error);
                  onShowAlert(
                    "Erro ao enviar dados financeiros. Tente novamente.",
                  );
                }
              }}
            />
          </div>
        );
      }

      let allowedCategories: string[] | null = null;
      if (titleUpper.includes("PESSOAL"))
        allowedCategories = [
          "Corpo Docente",
          "Corpo Técnico Administrativo",
          "Investigadores",
        ];
      if (titleUpper.includes("BOLSA"))
        allowedCategories = ["Estudantes Bolseiros"];
      if (
        titleUpper.includes("REGISTO ACADÉMICO") ||
        titleUpper.includes("REGISTO ACADEMICO") ||
        titleUpper.includes("DRA")
      )
        allowedCategories = ["Corpo discente (matrícula até graduação)"];
      if (titleUpper.includes("ALOJAMENTO"))
        allowedCategories = [
          "Estudantes internados (por idade, província e gênero)",
        ];
      if (titleUpper.includes("BIBLIOTECA")) allowedCategories = ["Biblioteca"];
      if (titleUpper.includes("ARQUIVO")) allowedCategories = ["Arquivo"];
      if (titleUpper.includes("FORMAÇÃO") || titleUpper.includes("FORMACAO"))
        allowedCategories = ["Formação"];
      if (titleUpper.includes("REPARTIÇÃO DE ESTATÍSTICA")) {
        allowedCategories = [
          "Corpo Discente",
          "Corpo Docente",
          "CTA",
          "Investigadores",
          "Finanças",
          "Previsão N+1",
          "Infraestrutura",
          "Biblioteca",
          "Tic",
        ];
      }

      return (
        <div className="w-full h-full flex flex-col">
          <EstatisticaView
            onBack={() => setActiveItem("Visão Geral")}
            isReadOnly={false}
            allowedCategories={allowedCategories}
            title={title}
            financialData={financialData}
            initialActiveItem={
              title.toUpperCase().includes("BOLSA") ? "Bolsa" : undefined
            }
            hideHeader={true}
            hideFooter={true}
          />
        </div>
      );
    }

    if (activeItem === "Registar") {
      return (
        <div className="p-6 bg-slate-50 min-h-screen">
          <UniversalRegistrationPicker
            onSelect={(formType) => {
              if (formType === "fornecedor") {
                setActiveItem("Registo de Fornecedores");
              } else if (formType === "produto") {
                setActiveItem("Gestão de Produtos e Preços");
              } else {
                setActiveItem("Gestão de Utilizadores");
              }
            }}
            onClose={() => setActiveItem("Gestão de Fornecedores")}
            currentUser={user}
            contextHint={isUGEA ? "fornecedor" : ""}
          />
        </div>
      );
    }

    if (activeItem === "Caixa de Mensagens") {
      return (
        <CaixaMensagensView
          departmentTitle={title}
          user={user}
          colaboradores={colaboradores}
        />
      );
    }

    if (upperTitle === "GESTÃO DE BIBLIOTECA" || upperTitle === "GESTÃO DE BIBLIOTECA") {
      return (
        <LibraryManagementView
          registrations={libraryRegistrations || []}
          bookRegistrations={bookRegistrations || []}
        />
      );
    }

    if (activeItem === "Visão Geral") {
      return (
        <div className="flex flex-col gap-8 w-full">
          <PersonalizedOverview
            user={user}
            title={title}
            colaboradores={colaboradores}
            processos={processos}
            estudantes={estudantesDb}
            activities={activities}
            matrixActivities={matrixActivities}
            financialData={financialData}
            serviceRequests={serviceRequests}
            suppliers={suppliers}
            events={events}
            onNavigate={navigateTo}
          />
          <VisaoGeralCards onNavigate={navigateTo} user={user} title={title} />
          
          {/* Seção Resumo Diretor Geral (Colaboradores, Corpo Discente, Plano de Atividades) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            {/* 1. Resumo dos Colaboradores */}
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#0f172a] space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-blue-100 text-blue-900 rounded-xl">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm tracking-tight">Resumo dos Colaboradores</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Total: {colaboradores.length} colaboradores</p>
                </div>
              </div>
              
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-black text-slate-700 uppercase tracking-wider text-[10px] block mb-1">Por Nível Académico:</span>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                    {colabNivelAcademico.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg font-bold">
                        <span className="text-slate-700 truncate">{item.nivel}</span>
                        <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full text-[10px]">{item.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-black text-slate-700 uppercase tracking-wider text-[10px] block mb-1">Por Área de Formação:</span>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                    {colabAreaFormacao.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg font-bold">
                        <span className="text-slate-700 truncate">{item.area}</span>
                        <span className="bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-full text-[10px]">{item.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center font-black">
                  <span className="text-slate-600 text-[11px]">Com Cargos de Chefia:</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">{colabChefia.comChefia} chefias</span>
                </div>
              </div>
            </div>

            {/* 2. Corpo Discente */}
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#1e3a8a] space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-indigo-100 text-indigo-900 rounded-xl">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm tracking-tight">Corpo Discente</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Total: {estudantesDb.length} estudantes</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-black text-slate-700 uppercase tracking-wider text-[10px] block mb-1">Por Curso:</span>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                    {discenteCurso.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg font-bold">
                        <span className="text-slate-700 truncate">{item.curso}</span>
                        <span className="bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-full text-[10px]">{item.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-black text-slate-700 uppercase tracking-wider text-[10px] block mb-1">Por Naturalidade (Origem):</span>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                    {discenteNaturalidade.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg font-bold">
                        <span className="text-slate-700 truncate">{item.naturalidade}</span>
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[10px]">{item.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-black text-slate-700 uppercase tracking-wider text-[10px] block mb-1">Por Nível / Ano:</span>
                  <div className="flex gap-2 flex-wrap">
                    {discenteNivel.map((item, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-xl font-black text-[10px]">
                        {item.nivel}: {item.total}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Plano de Atividade */}
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#f59e0b] space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm tracking-tight">Plano de Atividades</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Total: {planoAtividadesStats.total} atividades</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
                    <span className="block text-[9px] font-black text-emerald-600 uppercase tracking-wider">Já Executadas</span>
                    <span className="text-xl font-black text-emerald-900">{planoAtividadesStats.executadas}</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl">
                    <span className="block text-[9px] font-black text-amber-600 uppercase tracking-wider">Por Executar</span>
                    <span className="text-xl font-black text-amber-900">{planoAtividadesStats.porExecutar}</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2">
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Análise por Orçamento</span>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Orçamento Total:</span>
                    <span>{planoAtividadesStats.orcamentoTotal.toLocaleString("pt-MZ", { style: "currency", currency: "MZN" })}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700 text-[11px]">
                    <span>Executado:</span>
                    <span>{planoAtividadesStats.orcamentoExecutadas.toLocaleString("pt-MZ", { style: "currency", currency: "MZN" })}</span>
                  </div>
                  <div className="flex justify-between font-bold text-amber-700 text-[11px]">
                    <span>Por Executar:</span>
                    <span>{planoAtividadesStats.orcamentoPorExecutar.toLocaleString("pt-MZ", { style: "currency", currency: "MZN" })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="text-blue-900" size={18} />
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Análise Estatística em Tempo Real</h2>
              </div>
              <button
                onClick={handleGeneratePDFReport}
                className="flex items-center gap-2 bg-blue-900 text-white px-5 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-800 transition-all shadow-[4px_4px_0px_0px_#1e3a8a] active:translate-x-1 active:translate-y-1 active:shadow-none shrink-0"
              >
                <FileText size={16} />
                Gerar Relatório PDF Mensal
              </button>
            </div>
            <InstitutionalCharts 
              processos={processos} 
              colaboradores={colaboradores} 
              serviceRequests={serviceRequests} 
            />
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-4xl border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center text-gray-500">
        <LayoutGrid size={48} className="mx-auto mb-4 opacity-50" />
        <p>
          Bem-vindo ao Gabinete do {title}. Selecione uma opção no menu lateral.
        </p>
      </div>
    );
  };

  return (
    <div className="flex h-full bg-gray-50 flex-col md:flex-row overflow-hidden font-sans relative">
      <div
        className={`bg-slate-900 text-white flex flex-row md:flex-col shadow-xl shrink-0 gap-2 md:gap-0 z-20 transition-all duration-300 relative ${
          isSidebarCollapsed
            ? "w-full md:w-16 p-2 md:p-2 overflow-x-auto md:overflow-y-auto no-scrollbar"
            : "w-full md:w-64 p-2 md:p-4 overflow-x-auto md:overflow-y-auto no-scrollbar"
        }`}
      >
        {/* Botão de minimização/maximização centrado no limite entre o submenu lateral e a área de trabalho */}
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          title={isSidebarCollapsed ? "Maximizar Menu Lateral" : "Minimizar Menu Lateral"}
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 -right-3.5 z-40 w-7 h-7 bg-white text-slate-900 hover:bg-blue-600 hover:text-white rounded-full border-2 border-slate-300 hover:border-blue-600 shadow-xl items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none cursor-pointer"
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="flex-1 flex flex-row md:flex-col space-y-0 md:space-y-2 gap-2 md:gap-0 min-w-max md:min-w-0">
          {isDPEP && !isSidebarCollapsed && (
            <div className="hidden md:block mb-4 px-3">
              <h3 className="text-amber-500 font-black text-[11px] tracking-[0.2em]  border-b border-slate-700/50 pb-2">
                Gestão de Plano
              </h3>
            </div>
          )}
          {menuItems.map((item: any) => {
            const hasChildren = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedMenus.includes(item.title);
            const isParentActive =
              activeItem === item.title ||
              (hasChildren && item.subItems.some((s: any) => s.title === activeItem));

            return (
              <div key={item.title} className="w-full flex flex-col">
                <div className="w-full flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (hasChildren && !isSidebarCollapsed) {
                        toggleMenu(item.title);
                      }
                      navigateTo(item.title);
                    }}
                    title={item.title}
                    className={`w-auto md:w-full flex flex-none items-center justify-between gap-3 p-2 md:p-3 rounded-xl transition-all text-left ${
                      isSidebarCollapsed ? "md:justify-center md:p-2.5" : ""
                    } ${
                      isParentActive
                        ? "bg-slate-800 text-white font-bold"
                        : "bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className="shrink-0" />
                      {!isSidebarCollapsed && (
                        <span className="text-xs md:text-sm whitespace-nowrap md:whitespace-normal">
                          {item.title}
                        </span>
                      )}
                    </div>

                    {!isSidebarCollapsed && hasChildren && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(item.title);
                        }}
                        className="p-1 hover:bg-slate-700 rounded-md transition-colors"
                      >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                    )}
                  </button>
                </div>

                {/* SUBMENU ITEMS */}
                {!isSidebarCollapsed && hasChildren && isExpanded && (
                  <div className="ml-4 pl-3 my-1 border-l-2 border-slate-700/60 flex flex-col space-y-1">
                    {item.subItems.map((sub: any) => {
                      const isSubActive = activeItem === sub.title;
                      const SubIcon = sub.icon;
                      return (
                        <button
                          key={sub.title}
                          type="button"
                          onClick={() => navigateTo(sub.title)}
                          title={sub.title}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left ${
                            isSubActive
                              ? "bg-blue-600 text-white shadow-sm font-bold"
                              : "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/70"
                          }`}
                        >
                          <SubIcon size={14} className={isSubActive ? "text-white" : "text-slate-400"} />
                          <span className="truncate">{sub.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto flex flex-col relative w-full h-full ${
        activeItem === "Caixa de Mensagens" ||
        activeItem === "Estatística" ||
        activeItem === "Bolsa de Estudos"
          ? "p-0"
          : "p-4 md:p-8"
      }`}>
        {(activeItem === "Plano de Atividades" ||
          activeItem === "Plano da Direção") &&
          selectedPlanType &&
          selectedPlanType !== "Plano Individual" && (
            <button
              onClick={handleBack}
              className="mb-6 text-blue-600 font-black text-xs tracking-widest hover:underline flex items-center gap-2 self-start"
            >
              ← Voltar à seleção de plano
            </button>
          )}

        {/* Barra de Navegação Estrutural e Operacional por Direções, Departamentos e Setores */}
        <div className="mb-4 bg-gradient-to-r from-slate-50 to-blue-50/40 p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {parentDirecao && (
              <button
                type="button"
                onClick={() => {
                  setDashboardTitle(parentDirecao);
                  setActiveItem("Visão Geral");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100/80 hover:bg-blue-600 text-blue-900 hover:text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                title={`Voltar à Direção mãe: ${parentDirecao}`}
              >
                <span>← Direção: {parentDirecao}</span>
              </button>
            )}

            {currentDepartamentos.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Layers size={11} className="text-blue-600" />
                  Departamentos:
                </span>
                {currentDepartamentos.map((deptName, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDashboardTitle(deptName);
                      setActiveItem("Visão Geral");
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-blue-600 text-slate-700 hover:text-white border border-slate-200 hover:border-blue-600 rounded-lg font-semibold transition cursor-pointer shadow-xs text-[11px]"
                    title={`Aceder ao Departamento: ${deptName}`}
                  >
                    <span>{deptName}</span>
                    <ExternalLink size={9} className="opacity-60" />
                  </button>
                ))}
              </div>
            )}

            {currentReparticoes.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Network size={11} className="text-indigo-600" />
                  Setores / Repartições:
                </span>
                {currentReparticoes.map((repName, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDashboardTitle(repName);
                      setActiveItem("Visão Geral");
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-indigo-600 text-slate-700 hover:text-white border border-slate-200 hover:border-indigo-600 rounded-lg font-semibold transition cursor-pointer shadow-xs text-[11px]"
                    title={`Aceder ao Setor: ${repName}`}
                  >
                    <span>{repName}</span>
                    <ExternalLink size={9} className="opacity-60" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Seletor de Setores Múltiplos para o Chefe ou Técnico que opera em vários setores */}
          {userAssignedSectors.length > 1 && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 shadow-2xs ml-auto">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Operar em:</span>
              <select
                value={title}
                onChange={(e) => {
                  setDashboardTitle(e.target.value);
                  setActiveItem("Visão Geral");
                }}
                className="text-xs font-black text-blue-900 bg-transparent outline-none cursor-pointer"
                title="Alternar entre os setores atribuídos para operar"
              >
                {userAssignedSectors.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botão de Atribuição de Setores do Departamento (Chefe atribui ao Técnico e a Si Próprio) */}
          <button
            type="button"
            onClick={() => setShowAllocationModal(true)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer ${userAssignedSectors.length > 1 ? "" : "ml-auto"}`}
            title="Atribuir setores que o técnico opera, assim como a si próprio (Chefia do Departamento)"
          >
            <Users size={14} className="text-white" />
            <span className="hidden sm:inline">Atribuir Setores da Equipa</span>
            <span className="sm:hidden">Equipa</span>
          </button>

          {/* Botão de Personalização e Ocultação de Menus do Setor - Disponível apenas para Administradores da Instituição e Geral */}
          {canConfigureSectorMenus && (
            <button
              type="button"
              onClick={() => setShowSectorMenuModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl font-bold transition shadow-xs cursor-pointer"
              title="Personalizar e ocultar/mostrar funcionalidades atribuídas especificamente a este setor (Apenas Administradores)"
            >
              <Sliders size={14} className="text-amber-700 font-bold" />
              <span className="hidden sm:inline">Configurar Menus do Setor</span>
              <span className="sm:hidden">Menus</span>
            </button>
          )}

          {/* Botão de Navegação Geral da Instituição - Apenas Diretor-Geral ou Super Boss */}
          {isDGOrSuperBoss && (
            <button
              type="button"
              onClick={() => setShowNavModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
              title="Navegar por toda a Instituição (Reservado ao Diretor-Geral)"
            >
              <Compass size={13} className="text-amber-400" />
              <span>Navegador Geral</span>
            </button>
          )}
        </div>

        {canConfigureSectorMenus && showSectorMenuModal && (
          <SectorMenuConfigModal
            sectorName={title}
            instituicaoId={user?.instituicaoId || getActiveInstituicaoId()}
            currentUser={user}
            onClose={() => setShowSectorMenuModal(false)}
          />
        )}

        {showAllocationModal && (
          <DepartmentSectorAllocationModal
            isOpen={showAllocationModal}
            onClose={() => setShowAllocationModal(false)}
            currentUser={user}
            departmentName={user?.departamento || (isDepartment ? title : "") || "Departamento"}
            directionName={user?.direcao}
            instituicaoId={user?.instituicaoId || getActiveInstituicaoId()}
            onAllocationUpdated={() => {
              try {
                const refreshed = JSON.parse(localStorage.getItem("sigep_user") || "null");
                if (refreshed?.setor && refreshed.setor !== title) {
                  setDashboardTitle(refreshed.setor);
                }
              } catch (_) {}
            }}
          />
        )}

        {/* Modal de Navegação por Instituição, Direções e Setores */}
        {showNavModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
              <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-600 text-white">
                    <Compass size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-white">Navegador Institucional Completo</h3>
                    <p className="text-xs text-slate-300">
                      Aceda instantaneamente a qualquer Direção, Departamento ou Setor para operação
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNavModal(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Seletor de Instituição para o Administrador Geral */}
              {allInstituicoes.length > 0 && (
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-slate-600">Instituição em Navegação:</span>
                  <select
                    value={activeInstId}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setActiveInstId(newId);
                      setActiveInstituicaoId(newId);
                      setEstrutura(buildEstruturaInstituicao(newId));
                      notifyEstruturaUpdated();
                    }}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-blue-900 shadow-xs focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {allInstituicoes.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Lista Estrutural */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {estrutura && estrutura.length > 0 ? (
                  estrutura.map((orgao, orgaoIdx) => (
                    <div key={orgaoIdx} className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-200">
                        {orgao.nome}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {orgao.direcoes.map((dir, dirIdx) => {
                          const dirNome = dir.rawTitle || dir.nome;
                          return (
                            <div
                              key={dirIdx}
                              className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition space-y-3"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-slate-900 text-sm leading-snug">
                                  {dirNome}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDashboardTitle(dirNome);
                                    setActiveItem("Visão Geral");
                                    setShowNavModal(false);
                                  }}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shrink-0 cursor-pointer"
                                >
                                  Operar
                                </button>
                              </div>

                              {/* Departamentos da Direção */}
                              {dir.departamentos && dir.departamentos.length > 0 && (
                                <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Departamentos:
                                  </span>
                                  <div className="space-y-1">
                                    {dir.departamentos.map((dept, deptIdx) => (
                                      <div
                                        key={deptIdx}
                                        className="flex items-center justify-between text-xs py-1 px-2 bg-white rounded-lg border border-slate-100"
                                      >
                                        <span className="text-slate-700 font-medium truncate mr-2">
                                          {dept.nome}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setDashboardTitle(dept.nome);
                                            setActiveItem("Visão Geral");
                                            setShowNavModal(false);
                                          }}
                                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline shrink-0 cursor-pointer"
                                        >
                                          Aceder
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic text-center py-8">
                    Nenhuma estrutura cadastrada para esta instituição.
                  </p>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowNavModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {activeItem !== "Caixa de Mensagens" && activeItem !== "Estatística" && activeItem !== "Bolsa de Estudos" && (
          <h2 className="text-2xl font-bold text-slate-800 mb-6 font-serif tracking-tight">
            {title} - {activeItem}
          </h2>
        )}

        <div className="flex-1 min-h-0 w-full flex flex-col">
          <Suspense fallback={<div className="flex items-center justify-center p-8 text-slate-500 font-medium">A carregar módulo...</div>}>
            {renderContent()}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
