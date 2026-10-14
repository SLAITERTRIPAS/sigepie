import React, { lazy, Suspense, useState, useEffect } from "react";
import { getCircularReplacer, safeJSONStringify } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Maximize2,
  Menu,
  Settings,
  RefreshCw,
  Users,
  FileText,
  Database,
  Calendar,
  HardDrive,
  Trash2,
  Info,
  LogOut,
  Power,
  User,
  Layout,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckSquare,
  UserPlus,
  Zap,
  ShieldCheck,
  Loader2,
  Network,
  Building,
  MessageSquare,
  Box,
  UserCheck,
  AlertCircle,
  Clock,
  BookOpen,
  Download,
  LayoutGrid,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Upload,
  AlertOctagon,
  Bell,
  BellRing,
  ShieldAlert,
} from "lucide-react";
import SigepLogo from "../../components/SigepLogo";
import { getActiveInstituicao } from "../../lib/instituicaoEstruturaService";
import { IntelligentDiagnosticsView } from "./IntelligentDiagnosticsView";
import SobreSistemaView from "./SobreSistemaView";
import { BackgroundRemoverView } from "../../components/BackgroundRemoverView";
import BiografiaView from "./BiografiaView";
import ManualInstrucoesView from "../bloco8_gerais/ManualInstrucoesView";
import CalendarView from "../bloco5_sistema/CalendarView";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import * as XLSX from "xlsx";
import MonografiaView from "../bloco3_unidades_organicas/MonografiaView";
import ProjetoCientificoView from "../bloco3_unidades_organicas/ProjetoCientificoView";
import ResumoTemplateView from "../bloco8_gerais/ResumoTemplateView";
import ReportsView from "../bloco7_relatorios/ReportsView";
import RelatorioAcessoIndevidoView from "../bloco7_relatorios/RelatorioAcessoIndevidoView";
import { ConformidadeNormativaView } from "./ConformidadeNormativaView";
import { SystemLogsView } from "./SystemLogsView";
import HolidaysAlertsManagementView from "./HolidaysAlertsManagementView";
import UniversalRegistrationPicker from "./UniversalRegistrationPicker";
import RegistarGraduadoForm from "../bloco8_gerais/RegistarGraduadoForm";
import RegistarMateriaisBensForm from "../bloco8_gerais/RegistarMateriaisBensForm";
import RegistarEspacoFisicoForm from "../bloco8_gerais/RegistarEspacoFisicoForm";
import RegistarEfetivoEscolarForm from "../bloco8_gerais/RegistarEfetivoEscolarForm";
import RegistarFuncionarioForm from "../bloco8_gerais/RegistarFuncionarioForm";
import RegistarDisciplinaForm from "../bloco8_gerais/RegistarDisciplinaForm";
import RegistarFornecedorForm from "../bloco8_gerais/RegistarFornecedorForm";
import { firestoreService } from "../../lib/firestoreService";
import { optimizeImageForFirestore } from "../../lib/imageUtils";
import { EFETIVO_GERAL_DATA } from "../../constants/colaboradoresList";
import MainHeader from "../bloco1_apresentacao/MainHeader";
import { isSuperBossUser, isInstitutionalAdminUser, isHRBossUser, countInstitutionalAdmins } from "../../lib/auth";
import { ProcessingCircle } from "../../components/ui/ProcessingCircle";
import { FUNCIONARIOS } from "../../constants/formOptions";
import GestaoProdutosPrecosView from "../bloco9_produtos_precos/GestaoProdutosPrecosView";
import {
  DatabaseView,
  UserManagementView,
  RecentActivityLog,
  HistoricoChefiasView,
} from "./SistemaSubViews";
import { isProgrammerData, filterDeleted } from "../../lib/utils";
import { EstruturaExplorer } from "./EstruturaExplorer";
import { EstruturaHierarquicaConfigView } from "./EstruturaHierarquicaConfigView";
import CaixaMensagensView from "./CaixaMensagensView";
import { SystemAlertsAdmin } from "../../components/SystemAlertsAdmin";
import { SistemaLembretesAdmin } from "../../components/SistemaLembretesAdmin";

import SearchableSelect from "../../components/ui/SearchableSelect";
import { exportFullBackup, restoreFullBackup } from "../../lib/backupService";

import { databaseMaintenance } from "../../lib/databaseMaintenance";

export default function SistemaView({
  onBack,
  onLogout,
  events = [],
  expedientes = [],
  libraryRegistrations = [],
  bookRegistrations = [],
  notes = [],
  onDeleteEvent,
  onDeleteExpediente,
  onDeleteBook,
  onDeleteNote,
  onUpdateEvent,
  user,
  colaboradores = [],
  onShowAlert,
  initialActiveItem,
  onNavigateToWorkspace,
}: {
  onBack: () => void;
  onLogout: () => void;
  events?: any[];
  expedientes?: any[];
  libraryRegistrations?: any[];
  bookRegistrations?: any[];
  notes?: any[];
  onDeleteEvent?: (id: string) => Promise<any>;
  onDeleteExpediente?: (id: string) => Promise<any>;
  onDeleteBook?: (id: string) => Promise<any>;
  onDeleteNote?: (id: string) => Promise<any>;
  onUpdateEvent?: (id: string, data: any) => Promise<any>;
  user?: any;
  colaboradores?: any[];
  onShowAlert?: (msg: string, type?: string) => void;
  initialActiveItem?: string;
  onNavigateToWorkspace?: (workspaceTitle: string, instituicaoId?: string) => void;
}) {
  const showAlert = (msg: string, type: "success" | "error" | "info" = "success") => {
    if (onShowAlert) {
      onShowAlert(msg, type);
    } else {
      alert(msg);
    }
  };

  const isGlobalAdmin = isSuperBossUser(user);
  const isInstitutionalAdmin = isInstitutionalAdminUser(user);

  const [activeInstData, setActiveInstData] = useState<any>(null);

  useEffect(() => {
    const handleInstChange = () => {
      setActiveInstData(getActiveInstituicao());
    };
    handleInstChange();
    window.addEventListener("instituicao_changed", handleInstChange);
    window.addEventListener("instituicao_updated", handleInstChange);
    window.addEventListener("sigep_estrutura_updated", handleInstChange);
    return () => {
      window.removeEventListener("instituicao_changed", handleInstChange);
      window.removeEventListener("instituicao_updated", handleInstChange);
      window.removeEventListener("sigep_estrutura_updated", handleInstChange);
    };
  }, []);

  const [isRevealed, setIsRevealed] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState(
    initialActiveItem && initialActiveItem !== "Sistema"
      ? initialActiveItem
      : ""
  );

  useEffect(() => {
    // Reset revealed state if we exit and re-enter
  }, []);

  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [registrationFormType, setRegistrationFormType] = useState<string | null>(null);
  const [pendingInstituicaoId, setPendingInstituicaoId] = useState<string | null>(null);
  const [activeItemClickCount, setActiveItemClickCount] = useState<number>(0);

  useEffect(() => {
    if (initialActiveItem && initialActiveItem !== "Sistema") {
      setActiveItem(initialActiveItem);
      setActiveItemClickCount((prev) => prev + 1);
    }
  }, [initialActiveItem]);

  const canManageUsers = isGlobalAdmin || isInstitutionalAdmin || user?.role === "Administrador";

  const handleFullReset = async () => {
    if (!isSuperBossUser(user)) {
      alert("Apenas o proprietário do sistema pode realizar o reset total.");
      return;
    }

    const confirm = window.confirm(
      "⚠️ AVISO CRÍTICO: Esta acção irá ELIMINAR TODOS OS DADOS de actividades, planos, eventos, notas, mensagens e alertas de todos os anos. Os utilizadores e colaboradores serão mantidos. Deseja continuar?",
    );
    if (!confirm) return;

    const finalConfirm = window.confirm(
      "Deseja MESMO reiniciar a base de dados agora? Esta é a última confirmação.",
    );
    if (!finalConfirm) return;

    setIsCleaning(true);
    setCleaningStep("Iniciando Reinício Total do Sistema...");

    try {
      const result = await databaseMaintenance.fullSystemReset();
      alert(
        `Reinício concluído com sucesso! ${result.totalRemoved} registos removidos.`,
      );
      setActiveItem("Sobre o Sistema");
    } catch (err) {
      console.error("Erro no reset total:", err);
      alert("Houve um erro no reinício total. Verifique a consola.");
    } finally {
      setIsCleaning(false);
      setCleaningStep(null);
    }
  };

  const [showSupport, setShowSupport] = useState(false);
  const [version, setVersion] = useState("SIGEP/V1.00.2025");
  const [isSyncing, setIsSyncing] = useState(false);
  const [ownerPhoto, setOwnerPhoto] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState("SLAITER TRIPAS");
  const [ownerCargo, setOwnerCargo] = useState(
    "Tecnico em Hardware, Software, programacao e designe grafico"
  );
  const [itEmail, setItEmail] = useState("fttripas@gmail.com");
  const [itWhatsapp, setItWhatsapp] = useState("+258 84 9547771");
  const [itLinkedin, setItLinkedin] = useState("linkedin.com/in/fttripas");
  const [itFacebook, setItFacebook] = useState("facebook.com/fttripas");
  const [itWeb, setItWeb] = useState("www.fttripas.com");
  const [systemLogo, setSystemLogo] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleaningStep, setCleaningStep] = useState<string | null>(null);
  const [showOwnerDetails, setShowOwnerDetails] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedCleanupLabels, setSelectedCleanupLabels] = useState<string[]>(
    [],
  );
  const [adminPassword, setAdminPassword] = useState(user?.password || "");

  const filteredColaboradoresForView = React.useMemo(() => {
    return colaboradores;
  }, [colaboradores]);

  useEffect(() => {
    if (user?.password && !adminPassword) {
      setAdminPassword(user.password);
    }
  }, [user]);

  useEffect(() => {
    // Subscribe to system config in real-time
    const unsubscribe = firestoreService.config.subscribe(
      "main_config",
      (data) => {
        if (data) {
          if (data.proprietarioName) setOwnerName(data.proprietarioName);
          if (data.proprietarioCargo) setOwnerCargo(data.proprietarioCargo);
          if (data.proprietarioPhoto) setOwnerPhoto(data.proprietarioPhoto);
          if (data.itEmail) setItEmail(data.itEmail);
          if (data.itWhatsapp) setItWhatsapp(data.itWhatsapp);
          if (data.itLinkedin) setItLinkedin(data.itLinkedin);
          if (data.itFacebook) setItFacebook(data.itFacebook);
          if (data.itWeb) setItWeb(data.itWeb);
          if (data.systemLogo) setSystemLogo(data.systemLogo);
        } else {
          // Fallback to localStorage for migration or defaults
          const savedName = localStorage.getItem("proprietarioName");
          const savedCargo = localStorage.getItem("proprietarioCargo");
          const savedPhoto = localStorage.getItem("proprietarioPhoto");
          const savedEmail = localStorage.getItem("itEmail");
          const savedWhatsapp = localStorage.getItem("itWhatsapp");
          const savedLinkedin = localStorage.getItem("itLinkedin");
          const savedFacebook = localStorage.getItem("itFacebook");
          const savedWeb = localStorage.getItem("itWeb");
          const savedLogo = localStorage.getItem("systemLogo");

          if (savedName) setOwnerName(savedName);
          if (savedCargo) setOwnerCargo(savedCargo);
          if (savedEmail) setItEmail(savedEmail);
          if (savedWhatsapp) setItWhatsapp(savedWhatsapp);
          if (savedLinkedin) setItLinkedin(savedLinkedin);
          if (savedFacebook) setItFacebook(savedFacebook);
          if (savedWeb) setItWeb(savedWeb);

          if (savedPhoto) {
            if (savedPhoto.length > 80000) {
              optimizeImageForFirestore(savedPhoto, 250, 250, 80 * 1024)
                .then((opt) => {
                  setOwnerPhoto(opt);
                  localStorage.setItem("proprietarioPhoto", opt);
                })
                .catch(() => setOwnerPhoto(savedPhoto));
            } else {
              setOwnerPhoto(savedPhoto);
            }
          }

          if (savedLogo) {
            if (savedLogo.length > 100000) {
              optimizeImageForFirestore(savedLogo, 300, 300, 120 * 1024)
                .then((opt) => {
                  setSystemLogo(opt);
                  localStorage.setItem("systemLogo", opt);
                })
                .catch(() => setSystemLogo(savedLogo));
            } else {
              setSystemLogo(savedLogo);
            }
          }

          if (isSuperBossUser(user) && user) {
            if (!savedName || savedName === "Songo")
              setOwnerName(user.name || "Songo");
            if (!savedCargo) setOwnerCargo(user.cargo || user.role || "");
          }
        }
      },
    );

    return () => unsubscribe();
  }, [user]);

  const handleSaveProprietario = async () => {
    const isOwner = isSuperBossUser(user) || canManageUsers;
    if (!isOwner) {
      showAlert(
        "Apenas o proprietário do sistema ou um administrador tem permissão para alterar estas informações.",
        "error"
      );
      return;
    }

    try {
      if (!ownerName.trim()) {
        showAlert("Por favor, insira o nome do proprietário.", "error");
        return;
      }

      setIsSyncing(true);

      // Otimização de segurança prévia para imagens
      let optimizedLogo = systemLogo;
      if (optimizedLogo && optimizedLogo.length > 100000) {
        try {
          optimizedLogo = await optimizeImageForFirestore(optimizedLogo, 300, 300, 120 * 1024);
          setSystemLogo(optimizedLogo);
          localStorage.setItem("systemLogo", optimizedLogo);
        } catch (e) {
          console.warn("Aviso ao otimizar logotipo:", e);
        }
      }

      let optimizedPhoto = ownerPhoto;
      if (optimizedPhoto && optimizedPhoto.length > 80000) {
        try {
          optimizedPhoto = await optimizeImageForFirestore(optimizedPhoto, 250, 250, 80 * 1024);
          setOwnerPhoto(optimizedPhoto);
          localStorage.setItem("proprietarioPhoto", optimizedPhoto);
        } catch (e) {
          console.warn("Aviso ao otimizar foto do proprietário:", e);
        }
      }

      // Update system config
      await firestoreService.config.set("main_config", {
        proprietarioName: ownerName,
        proprietarioCargo: ownerCargo,
        proprietarioPhoto: optimizedPhoto,
        itEmail: itEmail,
        itWhatsapp: itWhatsapp,
        itLinkedin: itLinkedin,
        itFacebook: itFacebook,
        itWeb: itWeb,
        systemLogo: optimizedLogo,
      });

      // Update admin user data de forma segura e não bloqueante
      if (user?.id) {
        try {
          await firestoreService.users.update(user.id, {
            name: ownerName,
            cargo: ownerCargo,
            password: adminPassword,
            updatedAt: new Date().toISOString(),
          });
        } catch (userErr) {
          console.warn("Aviso na atualização do utilizador de login:", userErr);
        }
      }

      // Also update localStorage for offline/backup
      localStorage.setItem("proprietarioName", ownerName);
      localStorage.setItem("proprietarioCargo", ownerCargo);
      if (optimizedPhoto) localStorage.setItem("proprietarioPhoto", optimizedPhoto);
      localStorage.setItem("itEmail", itEmail);
      localStorage.setItem("itWhatsapp", itWhatsapp);
      localStorage.setItem("itLinkedin", itLinkedin);
      localStorage.setItem("itFacebook", itFacebook);
      localStorage.setItem("itWeb", itWeb);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("sigep_system_config_updated", {
            detail: {
              name: ownerName,
              cargo: ownerCargo,
              photo: optimizedPhoto,
            },
          })
        );
      }
      if (optimizedLogo) {
        localStorage.setItem("systemLogo", optimizedLogo);
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("sigep_system_logo_updated", { detail: { logo: optimizedLogo } })
          );
        }
      }

      showAlert(
        "Informações guardadas e sincronizadas com sucesso em todos os links!",
        "success"
      );
    } catch (error: any) {
      console.error("Erro ao guardar config:", error);
      const isSizeError = error?.message?.includes("exceeds the maximum allowed size");
      const errorMsg = isSizeError
        ? "A imagem do logotipo ou foto excede a capacidade da base de dados. Por favor tente com uma imagem menor."
        : "Erro ao guardar as informações na base de dados.";
      showAlert(errorMsg, "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSync = () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 2000);
  };

  const handleSeedCollaborators = async () => {
    if (!isSuperBossUser(user) && !canManageUsers) {
      showAlert(
        "Apenas o proprietário do sistema ou um administrador pode sincronizar o efetivo geral.",
        "error"
      );
      return;
    }

    if (
      !confirm(
        "Deseja sincronizar todos os colaboradores do Efetivo Geral com a base de dados? Registos existentes serão atualizados.",
      )
    ) {
      return;
    }

    try {
      setIsSyncing(true);
      const result =
        await firestoreService.seedAllCollaborators(EFETIVO_GERAL_DATA);
      if (result.success) {
        showAlert(
          `${result.count} colaboradores sincronizados com sucesso na base de dados.`,
          "success"
        );
      } else {
        showAlert("Erro ao sincronizar colaboradores.", "error");
      }
    } catch (error) {
      console.error(error);
      showAlert("Ocorreu um erro durante a sincronização.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBackup = async () => {
    setIsExtracting(true);
    try {
      await exportFullBackup();
      alert(
        "Backup completo do Firestore realizado e descarregado com sucesso!",
      );
    } catch (err: any) {
      console.error("Erro ao realizar backup:", err);
      alert("Erro ao realizar backup: " + (err?.message || err));
    } finally {
      setIsExtracting(false);
    }
  };

  const handleExtrairBaseCompleta = async (format: "excel" | "json") => {
    setIsExtracting(true);
    try {
      const collectionsToFetch = [
        { key: "colaboradores", name: "Colaboradores" },
        { key: "colaboradores_chefia", name: "Colaboradores_Chefia" },
        { key: "historico_chefias", name: "Historico_Chefias" },
        { key: "users", name: "Utilizadores" },
        { key: "matrix_activities", name: "Plano_Actividades" },
        { key: "actividades", name: "Actividades" },
        { key: "plano_actividades", name: "Plano_Actividades_Det" },
        { key: "calendar_events", name: "Eventos" },
        { key: "notes", name: "Notas" },
        { key: "expedientes", name: "Expediente" },
        { key: "documentos_normativos", name: "Documentos_Normativos" },
        { key: "archive_documents", name: "Arquivo_Documentos" },
        { key: "library_visits", name: "Biblioteca_Visitas" },
        { key: "library_books", name: "Biblioteca_Livros" },
        { key: "suppliers", name: "Fornecedores" },
        { key: "financial_data", name: "Orcamento_Financas" },
        { key: "materiais_bens", name: "Inventario_Bens" },
        { key: "processos_individuais", name: "Processos_Recursos_Humanos" },
        { key: "efetivo_escolar", name: "Efetivo_Escolar" },
        { key: "service_requests", name: "Pedidos_Servico" },
        { key: "bolsas", name: "Bolsas_Estudo" },
        { key: "atendimentos_estudantis", name: "Atendimentos_Estudantis" },
        { key: "movimentos_economato", name: "Movimentos_Economato" },
        { key: "inventarios_patrimoniais", name: "Inventarios_Patrimoniais" },
        { key: "requisicoes_internas", name: "Requisicoes_Internas" },
        { key: "assiduidade", name: "Assiduidade" },
        { key: "alocacoes_docentes", name: "Alocacoes_Docentes" },
        { key: "espacos_fisicos", name: "Espacos_Fisicos" },
        { key: "turmas", name: "Turmas" },
        { key: "alunos", name: "Alunos" },
        { key: "matriculas", name: "Matriculas" },
        { key: "messages", name: "Mensagens_Sistema" },
      ];

      const fullDatabase: any = {};

      for (const coll of collectionsToFetch) {
        try {
          const snapshot = await getDocs(collection(db, coll.key));
          const items = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter(
              (item: any) =>
                !item.isDeleted &&
                item.estado !== "Eliminado" &&
                item.estado !== "Deletado" &&
                item.status !== "Deletado",
            );
          fullDatabase[coll.name] = items;
        } catch (err) {
          console.warn(`Erro ao extrair coleção ${coll.key}:`, err);
          fullDatabase[coll.name] = [];
        }
      }

      if (format === "json") {
        const dataStr = safeJSONStringify(fullDatabase, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `SIGEP_BaseDados_Completa_${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert("Extração completa em JSON concluída com sucesso!");
      } else {
        const workbook = XLSX.utils.book_new();

        for (const [sheetName, rows] of Object.entries(fullDatabase)) {
          const cleanRows = (rows as any[]).map((row: any) => {
            const newRow: any = {};
            for (const [key, value] of Object.entries(row)) {
              if (value && typeof value === "object") {
                const valAny = value as any;
                if (valAny.seconds !== undefined) {
                  newRow[key] = new Date(valAny.seconds * 1000).toLocaleString(
                    "pt-PT",
                  );
                } else {
                  newRow[key] = safeJSONStringify(value);
                }
              } else {
                newRow[key] = value;
              }
            }
            return newRow;
          });

          const worksheetData =
            cleanRows.length > 0
              ? cleanRows
              : [{ Info: "Nenhum registo nesta tabela" }];
          const worksheet = XLSX.utils.json_to_sheet(worksheetData);
          XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            sheetName.substring(0, 31),
          );
        }

        XLSX.writeFile(
          workbook,
          `SIGEP_BaseDados_Completa_${new Date().toISOString().split("T")[0]}.xlsx`,
        );
        alert("Extração completa em Excel (.xlsx) concluída com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao extrair base de dados:", error);
      alert("Ocorreu um erro ao extrair os dados da base de dados.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          setIsExtracting(true);
          const content = event.target?.result as string;
          const { totalRestored } = await restoreFullBackup(content);
          alert(
            `Sistema restaurado com sucesso! ${totalRestored} registos foram restaurados com precisão no Firestore e base de dados, garantindo a integridade dos 4 Órgãos do Instituto.`,
          );
          window.location.reload();
        } catch (err: any) {
          console.error("Erro ao restaurar backup:", err);
          alert("Erro ao restaurar backup: " + (err?.message || err));
        } finally {
          setIsExtracting(false);
          if (e.target) e.target.value = "";
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const optimized = await optimizeImageForFirestore(file, 280, 280, 100 * 1024);
        setOwnerPhoto(optimized);
      } catch (err) {
        console.error("Erro ao processar foto do proprietário:", err);
        showAlert("Erro ao processar imagem da foto. Tente outro ficheiro.", "error");
      }
    }
  };

  const totalRecords =
    1 +
    events.length +
    expedientes.length +
    libraryRegistrations.length +
    bookRegistrations.length +
    filteredColaboradoresForView.length;
  // db size approximation without JSON.stringify to avoid circular reference crashes
  const approximateSize = totalRecords * 850; // Approximating 850 bytes per record
  const dbSizeFormatted =
    approximateSize > 1024 * 1024
      ? (approximateSize / (1024 * 1024)).toFixed(2) + " Mb"
      : (approximateSize / 1024).toFixed(2) + " Kb";
  const currentDate = new Date().toLocaleDateString("pt-PT");

  const isHRBoss =
    isHRBossUser(user) ||
    (user?.reparticao || "").toLowerCase().includes("pessoal") ||
    (user?.title || "").toLowerCase().includes("repartição de pessoal") ||
    (user?.cargoChefia || "")
      .toLowerCase()
      .includes("chefe de repartição de pessoal");

  const isUGEAUser =
    (user?.departamento || "").toLowerCase().includes("ugea") ||
    (user?.setor || "").toLowerCase().includes("ugea") ||
    (user?.reparticao || "").toLowerCase().includes("ugea") ||
    (user?.title || "").toLowerCase().includes("ugea") ||
    (user?.cargoChefia || "").toLowerCase().includes("ugea");

  const institutionalAdminMenuItems = [
    { title: "Calendário", icon: Calendar },
    { title: "Configurações", icon: ShieldCheck },
    { title: "Centro de Mensagens", icon: MessageSquare },
    { title: "Sessões Ativas", icon: UserCheck },
    { title: "Log de Actividade", icon: Clock },
    { title: "Gestão de Utilizadores", icon: Users },
    { title: "Gestão de Produtos e Preços", icon: Box },
    { title: "Estrutura Hierárquica", icon: Network },
    { title: "Template de Resumo", icon: Layout },
    { title: "Atualização", icon: Zap },
    { title: "Base de Dados", icon: Database },
    { title: "Parte Teórica", icon: BookOpen, type: "group" },
    { title: "Monografia", icon: FileText, parent: "Parte Teórica" },
    { title: "Projeto Teórico", icon: BookOpen, parent: "Parte Teórica" },
    { title: "Projeto Científico", icon: FileText, parent: "Parte Teórica" },
    { title: "Removedor de Fundo", icon: ImageIcon },
    { title: "Sobre o Sistema", icon: Info },
  ];

  const defaultMenuItems = [
    { title: "Diagnóstico & Autocura", icon: Sparkles, hidden: !isSuperBossUser(user) },
    { title: "Centro de Mensagens", icon: MessageSquare },
    { title: "Sessões Ativas", icon: UserCheck, hidden: isGlobalAdmin ? false : !canManageUsers },
    { title: "Log de Actividade", icon: Clock },
    { title: "Gestão de Utilizadores", icon: Users, hidden: isGlobalAdmin ? false : !canManageUsers },
    { title: "Gestão de Produtos e Preços", icon: Box, hidden: isGlobalAdmin ? false : !(canManageUsers || isUGEAUser) },
    { title: "Estrutura Hierárquica", icon: Network, hidden: !isGlobalAdmin },
    { title: "Atualização", icon: Zap, hidden: isGlobalAdmin ? false : !canManageUsers },
    {
      title: "Registar",
      icon: UserPlus,
      hidden: isGlobalAdmin ? false : !(canManageUsers || isHRBoss),
    },
    { title: "Base de Dados", icon: Database, hidden: isGlobalAdmin ? false : !canManageUsers },
    { title: "Gestão das Instituições", icon: Building, hidden: isGlobalAdmin ? false : !canManageUsers },
    { title: "Conformidade Normativa", icon: ShieldCheck },
    { title: "Alertas do Sistema", icon: Bell },
    { title: "Lembretes e Notificações", icon: BellRing },
    { title: "Monitorização de Sistema", icon: AlertOctagon, hidden: isGlobalAdmin ? false : !canManageUsers },
    { title: "Feriados e Alertas", icon: Bell, hidden: !isGlobalAdmin },
    { title: "Relatórios", icon: FileText },
    { title: "Relatório de Acessos Indevidos", icon: ShieldAlert, hidden: !isGlobalAdmin },
    { title: "Template de Resumo", icon: Layout },
    { title: "Parte Teórica", icon: BookOpen, type: "group" },
    { title: "Monografia", icon: FileText, parent: "Parte Teórica" },
    { title: "Projeto Teórico", icon: BookOpen, parent: "Parte Teórica" },
    { title: "Projeto Científico", icon: FileText, parent: "Parte Teórica" },
    { title: "Calendário", icon: Calendar },
    { title: "Backup", icon: HardDrive, hidden: isGlobalAdmin ? false : !canManageUsers },
    {
      title: "Limpar Base de Dados",
      icon: RefreshCw,
      hidden: isGlobalAdmin ? false : !(canManageUsers || isHRBoss),
    },
    { title: "Configurações", icon: ShieldCheck, hidden: isGlobalAdmin ? false : !canManageUsers },
    { title: "Removedor de Fundo", icon: ImageIcon },
    { title: "Sobre o Sistema", icon: Info },
  ];

  useEffect(() => {
    const handleNavigate = (e: any) => {
      if (e.detail) {
        setActiveItem(e.detail);
      }
    };
    window.addEventListener("navigate_to_item", handleNavigate);
    return () => window.removeEventListener("navigate_to_item", handleNavigate);
  }, []);

  const menuItems = isInstitutionalAdmin ? institutionalAdminMenuItems : defaultMenuItems;

  const tableData = [
    {
      name: "tb_utilizadores",
      records: "1",
      lastUpdate: currentDate,
      status: "Ativo",
    },
    {
      name: "tb_colaboradores",
      records: filteredColaboradoresForView.length.toString(),
      lastUpdate: currentDate,
      status: "Ativo",
    },
    {
      name: "tb_eventos",
      records: events.length.toString(),
      lastUpdate: currentDate,
      status: "Ativo",
    },
    {
      name: "tb_expedientes",
      records: expedientes.length.toString(),
      lastUpdate: currentDate,
      status: "Ativo",
    },
    {
      name: "tb_visitas_biblioteca",
      records: libraryRegistrations.length.toString(),
      lastUpdate: currentDate,
      status: "Ativo",
    },
    {
      name: "tb_livros",
      records: bookRegistrations.length.toString(),
      lastUpdate: currentDate,
      status: "Ativo",
    },
  ];

  const handleGeneralSystemCleanup = async () => {
    const confirmMsg =
      "⚠️ LIMPEZA GERAL DE REPETIÇÃO E SOBREPOSIÇÃO: Esta ação varrerá a base de dados para detetar e remover colaboradores duplicados, actividades duplicadas (resequenciando os códigos) e fornecedores duplicados, preservando rigorosamente todas as informações essenciais. Deseja continuar?";
    if (!window.confirm(confirmMsg)) return;

    setIsCleaning(true);
    setCleaningStep("A executar limpeza profunda de duplicados e obsoletos...");
    try {
      const res = await databaseMaintenance.deepCleanupDuplicatesAndObsolete();
      alert(
        `Limpeza Geral Concluída com Sucesso!\n\n` +
          `- Colaboradores duplicados removidos: ${res.colaboradoresRemoved}\n` +
          `- Actividades removidas/consolidadas: ${res.activitiesRemoved}\n\n` +
          `A base de dados foi higienizada eliminando sobreposições de nomes e códigos obsoletos.`,
      );
      window.location.reload();
    } catch (err: any) {
      console.error("Erro na limpeza geral:", err);
      alert("Erro ao executar limpeza geral: " + (err?.message || err));
    } finally {
      setIsCleaning(false);
      setCleaningStep(null);
    }
  };

  const handleFullSystemReset = async () => {
    const confirmMsg =
      "🚨 LIMPEZA TOTAL DA BASE DE DADOS: Esta ação irá apagar TODOS os dados do sistema (planos, actividades, orçamentos, arquivos, etc.), PRESERVANDO APENAS a lista de colaboradores e utilizadores. Esta é uma ação irreversível usada para iniciar um novo ciclo real. Deseja continuar?";
    if (!window.confirm(confirmMsg)) return;

    const secondConfirm = prompt(
      "Para confirmar a limpeza total (SÓ COLABORADORES PERMANECEM), digite 'LIMPAR TUDO':",
    );
    if (secondConfirm !== "LIMPAR TUDO") {
      alert("Limpeza cancelada. Confirmação incorreta.");
      return;
    }

    setIsCleaning(true);
    setCleaningStep("A reiniciar base de dados (preservando colaboradores)...");
    try {
      const res = await databaseMaintenance.fullSystemReset();
      alert(
        `Limpeza total concluída!\n\n- Registos removidos: ${res.totalRemoved}\n- Colaboradores e utilizadores preservados.\n\nO sistema está pronto para receber dados reais.`,
      );
      window.location.reload();
    } catch (err: any) {
      console.error("Erro na limpeza total:", err);
      alert("Erro ao executar limpeza total: " + (err?.message || err));
    } finally {
      setIsCleaning(false);
      setCleaningStep(null);
    }
  };
 
  useEffect(() => {
    if (activeItem !== "Registar") {
      localStorage.setItem("sigep_last_active_item", activeItem);
    }
  }, [activeItem]);

  const handleClearData = async (categoriesToClear?: any[]) => {
    const confirmMessage =
      "⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL. Todos os dados das categorias selecionadas serão permanentemente excluídos da base de dados sem possibilidade de recuperação. Deseja continuar?";
    if (!window.confirm(confirmMessage)) return;

    setIsCleaning(true);
    setCleaningStep("Iniciando limpeza da base de dados...");

    // Categorias protegidas (não podem ser limpas)
    const protectedLabels = [
      "Funcionários e Colaboradores",
      "Estudantes e Turmas",
      "Gestão de Utilizadores",
    ];

    try {
      const { doc, writeBatch, collection, getDocs } =
        await import("firebase/firestore");
      const targets = categoriesToClear || [];

      if (targets.length === 0) {
        alert("Nenhuma categoria selecionada para limpeza.");
        setIsCleaning(false);
        return;
      }

      for (const cat of targets) {
        if (protectedLabels.includes(cat.label)) {
          console.warn(
            `Tentativa de limpar categoria protegida: ${cat.label}. Ignorado.`,
          );
          continue;
        }

        setCleaningStep(`Limpando ${cat.label}...`);

        if (cat.special && cat.action) {
          await cat.action();
          continue;
        }

        const collections = cat.collections || [cat.collection];
        for (const collName of collections) {
          setCleaningStep(`A processar coleção: ${collName}...`);
          const colSnapshot = await getDocs(collection(db, collName));

          let batch = writeBatch(db);
          let count = 0;

          for (const document of colSnapshot.docs) {
            // Proteção extra para o admin master
            if (
              collName === "users" &&
              document.data().role === "Administrador" &&
              (document.data().name === "Franzíssi Tripalonga" ||
                document.data().name === "SLAITER TRIPAS")
            ) {
              continue;
            }
            if (
              collName === "colaboradores" &&
              (document.data().nome === "Franzíssi Tripalonga" ||
                document.data().nome === "SLAITER TRIPAS")
            ) {
              continue;
            }

            batch.delete(doc(db, collName, document.id));
            count++;

            if (count === 500) {
              await batch.commit();
              batch = writeBatch(db);
              count = 0;
            }
          }
          if (count > 0) {
            await batch.commit();
          }
        }
      }

      setCleaningStep("Finalizando limpeza...");
      alert("dados excluido com sucesso");
    } catch (err) {
      console.error("Erro na limpeza da base de dados:", err);
      alert(
        "Houve um erro ao realizar a limpeza. Verifique se atingiu a quota do Firestore.",
      );
    } finally {
      setIsCleaning(false);
      setCleaningStep(null);
      setShowClearConfirm(false);
      setActiveItem("Sobre o Sistema");
    }
  };

  const handleClearProgrammerData = async () => {
    if (!isSuperBossUser(user) && user?.email !== "slaitertripas@gmail.com") {
      alert(
        "Apenas o administrador master pode executar esta limpeza profunda.",
      );
      return;
    }

    const confirmMsg =
      "⚠️ CONFIRMAÇÃO MODO PROGRAMADOR: Esta acção irá remover PERMANENTEMENTE todos os planos de 2027 e anos anteriores a 2025. Sem volta atrás. Continuar?";
    if (!window.confirm(confirmMsg)) {
      return;
    }

    setIsCleaning(true);
    setCleaningStep("Removendo planos de teste (Modo Programador)...");

    try {
      const { doc, writeBatch, collection, getDocs } =
        await import("firebase/firestore");
      const programmerCollections = [
        "matrix_activities",
        "actividades",
        "plano_actividades",
        "calendar_events",
        "expedientes",
        "notes",
        "service_requests",
        "archive_documents",
        "bolsas",
        "financial_data",
      ];
      let totalDeleted = 0;

      for (const collName of programmerCollections) {
        setCleaningStep(`Limpando ${collName} (Modo Programador)...`);
        const snapshot = await getDocs(collection(db, collName));

        let batch = writeBatch(db);
        let count = 0;

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          const ano = Number(
            data.ano || data.year || data.Year || data.Ano || 0,
          );

          // Critérios rigorosos para dados de teste/programador (2027 ou <= 2024)
          if (ano === 2027 || (ano > 0 && ano <= 2024)) {
            batch.delete(doc(db, collName, docSnap.id));
            count++;
            totalDeleted++;

            if (count === 500) {
              await batch.commit();
              batch = writeBatch(db);
              count = 0;
            }
          }
        }
        if (count > 0) {
          await batch.commit();
        }
      }

      setCleaningStep(
        `Limpeza concluída. ${totalDeleted} registos de teste eliminados.`,
      );
      alert("dados excluido com sucesso");
    } catch (error) {
      console.error("Erro ao limpar dados de programador:", error);
      alert(
        "Erro ao realizar a limpeza de dados de programador. Verifique a quota do Firestore.",
      );
    } finally {
      setIsCleaning(false);
      setCleaningStep(null);
    }
  };

  const handleOpenRegistration = (type: string | null = null) => {
    setRegistrationFormType(type);
    setActiveItem("Registar");
  };

  const renderContent = () => {
    switch (activeItem) {
      case "Diagnóstico & Autocura":
        return <IntelligentDiagnosticsView />;
      case "Centro de Mensagens":
        return (
          <CaixaMensagensView
            departmentTitle="Administração Central"
            user={user}
            colaboradores={filteredColaboradoresForView}
          />
        );
      case "Sessões Ativas":
        return (
          <UserManagementView
            currentUser={user}
            onRegistarClick={() => handleOpenRegistration("user")}
          />
        );
      case "Base de Dados":
        return (
          <DatabaseView
            stats={{ totalRecords, dbSizeFormatted, currentDate }}
            tableData={tableData}
            onExtrairCompleta={handleExtrairBaseCompleta}
            isExtracting={isExtracting}
            onSeedCollaborators={handleSeedCollaborators}
          />
        );
      case "Gestão de Utilizadores":
      case "Gestão de Utilizadors":
      case "Gestão de Utilizador":
        return (
          <UserManagementView
            currentUser={user}
            onRegistarClick={() => handleOpenRegistration("user")}
          />
        );
      case "Gestão de Produtos e Preços":
        return <GestaoProdutosPrecosView />;
      case "Histórico de Chefias":
        return <HistoricoChefiasView />;
      case "Registar":
        if (registrationFormType === "admin_instituicao") {
          return (
            <div className="max-w-5xl mx-auto pt-8">
              <RegistarFuncionarioForm
                user={user}
                initialData={{ instituicaoId: pendingInstituicaoId }}
                onCancel={() => setRegistrationFormType(null)}
                onSubmit={async (finalData) => {
                  try {
                    // 1. Gravar/Atualizar dados do Colaborador como Administrador
                    finalData.role = "Administrador";
                    // Preservar cargoChefia original se existir, caso contrário definir como Administrador
                    const adminTitle = "Administrador da Instituição";
                    if (!finalData.cargoChefia || finalData.cargoChefia === "Nenhum") {
                      finalData.cargoChefia = adminTitle;
                    } else if (!finalData.cargoChefia.includes(adminTitle)) {
                      finalData.cargoChefia = `${finalData.cargoChefia}, ${adminTitle}`;
                    }
                    finalData.instituicaoId = pendingInstituicaoId || finalData.instituicaoId;
                    await firestoreService.colaboradores.update(finalData.id, finalData);

                    // 2. Criar conta de utilizador com papel de Administrador
                    if (finalData.email) {
                      const userMail = finalData.email.toLowerCase().trim();
                      const adminUserData = {
                        id: finalData.id,
                        name: finalData.nome,
                        email: userMail,
                        role: "Administrador",
                        cargoChefia: "Administrador da Instituição",
                        isInstitutionalAdmin: true,
                        instituicaoId: finalData.instituicaoId,
                        isOwner: false,
                        nuit: finalData.nuit || "",
                        bi: finalData.numeroBI || "",
                        password: "123456",
                        mustChangePassword: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      };
                      await firestoreService.users.set(finalData.id, adminUserData);
                    }

                    if (onShowAlert) {
                      onShowAlert("Administrador da Instituição registado com sucesso!", "success");
                    } else {
                      alert("Administrador da Instituição registado com sucesso!");
                    }
                    setRegistrationFormType(null);
                    setPendingInstituicaoId(null);
                    setActiveItem("Gestão de Utilizadores");
                  } catch (err: any) {
                    console.error("Erro no registo de administrador:", err);
                    alert("Erro ao gravar registo de administrador: " + (err?.message || String(err)));
                  }
                }}
              />
            </div>
          );
        }
        if (registrationFormType === "user") {
          return (
            <div className="max-w-5xl mx-auto pt-8">
              <RegistarFuncionarioForm
                user={user}
                onCancel={() => setRegistrationFormType(null)}
                onSubmit={async (finalData) => {
                  try {
                    // 1. Gravar/Atualizar dados do Colaborador
                    await firestoreService.colaboradores.update(finalData.id, finalData);

                    // 2. Registar o processo
                    const formatProcessNumber = (num: number, year: string) => {
                      return `PR-${year}-${num.toString().padStart(3, "0")}`;
                    };
                    const processNo = formatProcessNumber(
                      Math.floor(Math.random() * 899) + 100,
                      new Date().getFullYear().toString()
                    );
                    await firestoreService.processos.add({
                      colaboradorId: finalData.id,
                      colaboradorNome: finalData.nome,
                      nuit: finalData.nuit,
                      status: "Concluído",
                      tipo: "Registo Inicial",
                      dataSubmissao: new Date().toISOString().split("T")[0],
                      processoNo: processNo,
                    });

                    // 3. Sincronizar chefias se aplicável
                    await firestoreService.syncChefiaAccounts([finalData]);

                    // 4. Criar conta de utilizador se tiver email
                    if (finalData.email) {
                      const userMail = finalData.email.toLowerCase().trim();
                      const defaultUserData = {
                        id: finalData.id,
                        name: finalData.nome,
                        email: userMail,
                        role: finalData.role || (finalData.tipo === "Docente" ? "Docente" : "CTA"),
                        isOwner: false,
                        nuit: finalData.nuit || "",
                        bi: finalData.numeroBI || "",
                        instituicaoId: finalData.instituicaoId || user?.instituicaoId || "isps",
                        direcao: finalData.direcao || "",
                        departamento: finalData.departamento || "",
                        reparticao: finalData.reparticao || "",
                        sector: finalData.sector || "",
                        setor: finalData.sector || "",
                        areaDeAfetacao: finalData.areaDeAfetacao || "",
                        status: "Afetado",
                        cargo: finalData.cargo || "",
                        cargoChefia: finalData.cargoChefia || "Nenhum",
                        password: "123456",
                        mustChangePassword: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      };
                      await firestoreService.users.set(finalData.id, defaultUserData);
                    }

                    if (onShowAlert) {
                      onShowAlert("Colaborador registado com sucesso!", "success");
                    } else {
                      alert("Colaborador registado com sucesso!");
                    }
                    setRegistrationFormType(null);
                    setActiveItem("Gestão de Utilizadores");
                  } catch (err: any) {
                    console.error("Erro no registo de colaborador:", err);
                    alert("Erro ao gravar registo de colaborador: " + (err?.message || String(err)));
                  }
                }}
              />
            </div>
          );
        }
        if (registrationFormType === "graduado") {
          return (
            <div className="max-w-5xl mx-auto pt-8">
              <RegistarGraduadoForm
                onCancel={() => setRegistrationFormType(null)}
                onSubmit={async (data) => {
                  try {
                    await firestoreService.graduados.add({
                      ...data,
                      createdAt: new Date().toISOString(),
                    });
                    setRegistrationFormType(null);
                    onShowAlert("Graduado registado com sucesso!");
                  } catch (err: any) {
                    console.error("Erro ao registar graduado:", err);
                    onShowAlert("Erro ao registar graduado no Firebase.");
                  }
                }}
              />
            </div>
          );
        }
        if (registrationFormType === "material") {
          return (
            <div className="max-w-5xl mx-auto pt-8">
              <RegistarMateriaisBensForm
                onCancel={() => setRegistrationFormType(null)}
                onSubmit={async (data) => {
                  try {
                    await firestoreService.materiais_bens.add({
                      ...data,
                      createdAt: new Date().toISOString(),
                    });
                    setRegistrationFormType(null);
                    onShowAlert("Material/Bem registado com sucesso!");
                  } catch (err: any) {
                    console.error("Erro ao registar material:", err);
                    onShowAlert("Erro ao registar material no Firebase.");
                  }
                }}
                user={user}
                local={user?.unidadeOrganica || "ISPS"}
              />
            </div>
          );
        }
        if (registrationFormType === "espaco") {
          return (
            <div className="max-w-5xl mx-auto pt-8">
              <RegistarEspacoFisicoForm
                onCancel={() => setRegistrationFormType(null)}
                onSubmit={async (data) => {
                  try {
                    await firestoreService.espacos_fisicos.add({
                      ...data,
                      createdAt: new Date().toISOString(),
                    });
                    setRegistrationFormType(null);
                    onShowAlert("Espaço físico registado com sucesso!");
                  } catch (err: any) {
                    console.error("Erro ao registar espaço físico:", err);
                    onShowAlert("Erro ao registar espaço físico no Firebase.");
                  }
                }}
              />
            </div>
          );
        }
        if (registrationFormType === "efetivo") {
          return (
            <div className="max-w-5xl mx-auto pt-8">
              <RegistarEfetivoEscolarForm
                onCancel={() => setRegistrationFormType(null)}
                onSubmit={async (data) => {
                  try {
                    await firestoreService.efetivo_escolar.add({
                      ...data,
                      createdAt: new Date().toISOString(),
                    });
                    setRegistrationFormType(null);
                    onShowAlert("Efetivo escolar registado com sucesso!");
                  } catch (err: any) {
                    console.error("Erro ao registar efetivo escolar:", err);
                    onShowAlert("Erro ao registar efetivo escolar no Firebase.");
                  }
                }}
              />
            </div>
          );
        }
        if (registrationFormType === "disciplina") {
          return (
            <div className="max-w-5xl mx-auto pt-8">
              <RegistarDisciplinaForm
                onCancel={() => setRegistrationFormType(null)}
                onSubmit={() => {
                  setRegistrationFormType(null);
                  onShowAlert("Disciplina registada com sucesso!");
                }}
                user={user}
                onShowAlert={onShowAlert}
              />
            </div>
          );
        }
        if (registrationFormType === "produto") {
          return (
             <GestaoProdutosPrecosView isAddingModeOnStart={true} />
          );
        }
        if (registrationFormType === "fornecedor") {
          return (
            <div className="max-w-5xl mx-auto pt-8">
              <RegistarFornecedorForm
                onCancel={() => {
                  setRegistrationFormType(null);
                  setActiveItem("Gestão de Fornecedores");
                }}
                onSubmit={() => {
                  setRegistrationFormType(null);
                  setActiveItem("Gestão de Fornecedores");
                  onShowAlert("Fornecedor registado com sucesso!");
                }}
                user={user}
                onShowAlert={onShowAlert}
              />
            </div>
          );
        }

        // Determinar sugestão baseada no contexto anterior se possível
        let contextHint = "";
        const prevItem = localStorage.getItem("sigep_last_active_item") || "";
        if (prevItem.includes("Utilizador")) contextHint = "user";
        if (prevItem.includes("Produtos")) contextHint = "produto";
        if (prevItem.includes("Património")) contextHint = "material";
        if (prevItem.includes("Graduados")) contextHint = "graduado";
        if (prevItem.includes("Estrutura")) contextHint = "espaco";
        if (prevItem.includes("Fornecedor") || prevItem.includes("UGEA")) contextHint = "fornecedor";

        return (
          <UniversalRegistrationPicker 
            onSelect={(type) => setRegistrationFormType(type)}
            contextHint={contextHint}
          />
        );
      case "Sobre o Sistema":
        return (
          <div className="w-full">
            <SobreSistemaView
              currentLogo={systemLogo}
              onLogoUpdated={(newLogo) => {
                setSystemLogo(newLogo);
                if (newLogo) {
                  localStorage.setItem("systemLogo", newLogo);
                } else {
                  localStorage.removeItem("systemLogo");
                }
              }}
              user={user}
              onShowAlert={(msg, type) => showAlert(msg, type || "success")}
            />
          </div>
        );
      case "Removedor de Fundo":
        return (
          <div className="w-full">
            <BackgroundRemoverView 
              user={user}
              onLogoApplied={(newLogo) => setSystemLogo(newLogo)}
            />
          </div>
        );
      case "Estrutura Hierárquica":
        return (
          <EstruturaHierarquicaConfigView />
        );
      case "Estrutura Geral da Instituição":
      case "Gestão das Instituições":
        return (
          <EstruturaExplorer
            key={`estrutura_explorer_${activeItem}_${activeItemClickCount}`}
            loggedUser={user}
            initialTab={activeItem === "Estrutura Geral da Instituição" ? "estrutura" : "instituicoes"}
            onNavigateToWorkspace={onNavigateToWorkspace}
            onRegistarAdmin={(instId) => {
              setPendingInstituicaoId(instId);
              setRegistrationFormType("admin_instituicao");
              setActiveItem("Registar");
            }}
          />
        );
      case "Conformidade Normativa":
        return (
          <ConformidadeNormativaView
            onNavigateToWorkspace={onNavigateToWorkspace}
          />
        );
      case "Monitorização de Sistema":
      case "Monitorização do Sistema":
      case "Monitorização de Erros":
        return (
          <SystemLogsView />
        );
      case "Lembretes e Notificações":
      case "Lembretes do Sistema":
        return (
          <SistemaLembretesAdmin
            user={user}
            colaboradores={colaboradores}
            onShowAlert={showAlert}
          />
        );
      case "Alertas do Sistema":
      case "Feriados e Alertas":
        return (
          <div className="space-y-8">
            <SistemaLembretesAdmin
              user={user}
              colaboradores={colaboradores}
              onShowAlert={showAlert}
            />
            <div className="border-t border-slate-200 pt-6">
              <SystemAlertsAdmin user={user} />
            </div>
          </div>
        );
      case "Biografia do Proprietário":
        return (
          <BiografiaView
            onBack={() => {
              setShowOwnerDetails(true);
              setActiveItem("Sobre o Sistema");
            }}
          />
        );
      case "Monografia":
        return (
          <MonografiaView
            title="Sistema Mestre"
            onBack={() => setActiveItem("Sobre o Sistema")}
          />
        );
      case "Projeto Teórico":
        return (
          <ManualInstrucoesView
            onBack={() => setActiveItem("Sobre o Sistema")}
          />
        );
      case "Projeto Científico":
        return (
          <ProjetoCientificoView
            onBack={() => setActiveItem("Sobre o Sistema")}
          />
        );
      case "Relatórios":
        return (
          <div className="w-full h-full">
            <ReportsView
              user={user}
              onShowAlert={(msg) => showAlert(msg, "info")}
              initialDirection="Geral"
              onBack={() => setActiveItem("Sobre o Sistema")}
            />
          </div>
        );
      case "Relatório de Acessos Indevidos":
      case "Tentativas de Acesso":
        return (
          <div className="w-full h-full">
            <RelatorioAcessoIndevidoView
              user={user}
              onShowAlert={(msg, type) => showAlert(msg, (type as any) || "info")}
              onBack={() => setActiveItem("Relatórios")}
            />
          </div>
        );
      case "Template de Resumo":
        return (
          <ResumoTemplateView
            onBack={() => setActiveItem("Sobre o Sistema")}
          />
        );
      case "Calendário":
        return (
          <CalendarView
            events={events}
            onUpdateEvent={onUpdateEvent}
            onDeleteEvent={onDeleteEvent}
            onAgendar={() => {}}
            onNota={() => {}}
            title="Sistema"
          />
        );
      case "Log de Actividade":
      case "Log de Atividade":
        return <RecentActivityLog colaboradores={colaboradores} />;
      case "Atualização":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            {isSyncing ? (
              <ProcessingCircle size={64} strokeWidth={1.5} />
            ) : (
              <RefreshCw size={64} />
            )}
            <button
              onClick={handleSync}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black"
            >
              Iniciar Atualização
            </button>
          </div>
        );
      case "Backup":
        return (
          <div className="max-w-4xl mx-auto space-y-8 pt-8">
            <div className="bg-slate-50/50 p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <HardDrive size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-blue-900">
                    Cópia de Segurança
                  </h3>
                  <p className="text-sm text-gray-400">
                    Descarregue todo o sistema e a sua base de dados completo da versão atual (data de hoje).
                  </p>
                </div>
              </div>
              <button
                disabled={isExtracting}
                onClick={handleBackup}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />A Processar...
                  </>
                ) : (
                  "Realizar Backup"
                )}
              </button>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-8 rounded-3xl shadow-sm border border-emerald-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 shrink-0">
                  <Database size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-emerald-900">
                    Extrair Base de Dados (Excel Completo)
                  </h3>
                  <p className="text-sm text-emerald-700/80">
                    Descarregue todos os registos estruturados em abas de folha de cálculo Excel (.xlsx), extraindo todos os dados inseridos pelo utilizador (data de hoje).
                  </p>
                </div>
              </div>
              <button
                disabled={isExtracting}
                onClick={() => handleExtrairBaseCompleta("excel")}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 transition-colors cursor-pointer flex items-center gap-2 shrink-0 w-full md:w-auto justify-center"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />A Extrair...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Extrair em Excel
                  </>
                )}
              </button>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-3xl shadow-sm border border-blue-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-850 shrink-0">
                  <Database size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-blue-900">
                    Extrair Dump Completo (JSON)
                  </h3>
                  <p className="text-sm text-blue-700/80">
                    Descarregue uma cópia integral de todas as coleções em formato de arquivo JSON, extraindo todos os dados inseridos pelo utilizador (data de hoje).
                  </p>
                </div>
              </div>
              <button
                disabled={isExtracting}
                onClick={() => handleExtrairBaseCompleta("json")}
                className="px-8 py-3 bg-blue-950 text-white rounded-xl font-black hover:bg-blue-900 transition-colors cursor-pointer flex items-center gap-2 shrink-0 w-full md:w-auto justify-center"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />A Extrair...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Extrair em JSON
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-50/50 p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                  <RefreshCw size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-orange-900">
                    Restaurar Sistema
                  </h3>
                  <p className="text-sm text-gray-400">
                    Carregue um ficheiro de backup anterior para restaurar e aplicar o backup segundo a extração.
                  </p>
                </div>
              </div>
              <label 
                className={`px-8 py-3 bg-orange-600 text-white rounded-xl font-black hover:bg-orange-700 transition-colors cursor-pointer flex items-center gap-2 ${isExtracting ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
              >
                {isExtracting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />A Restaurar...
                  </>
                ) : (
                  <>
                    Restaurar Dados
                    <input
                      type="file"
                      className="hidden"
                      accept=".json"
                      disabled={isExtracting}
                      onChange={handleRestore}
                    />
                  </>
                )}
              </label>
            </div>
          </div>
        );
      case "Limpar Base de Dados": {
        const cleanupCategories = [
          {
            label: "Mensagens de Utilizadores",
            collection: "messages",
            icon: MessageSquare,
            color: "bg-blue-600",
          },
          {
            label: "Funcionários e Colaboradores",
            collections: ["colaboradores"],
            icon: Users,
            color: "bg-emerald-600",
            protected: true,
          },
          {
            label: "Estudantes e Turmas",
            collections: ["alunos", "turmas", "matriculas", "efetivo_escolar"],
            icon: UserCheck,
            color: "bg-indigo-600",
            protected: true,
          },
          {
            label: "Expedientes e Documentos",
            collections: ["expedientes", "documentos_normativos"],
            icon: FileText,
            color: "bg-amber-600",
          },
          {
            label: "Actividades e Planeamento",
            collections: [
              "actividades",
              "plano_actividades",
              "matrix_activities",
            ],
            icon: Calendar,
            color: "bg-purple-600",
          },
          {
            label: "Limpar Ficheiros Temporários (Lixo do Sistema)",
            special: true,
            action: async () => {
              if (window.confirm("Deseja limpar todos os ficheiros temporários e cache (lixo do sistema)? Esta ação não apagará dados essenciais da base de dados, mas forçará o sistema a sincronizar os dados mais recentes.")) {
                setIsCleaning(true);
                setCleaningStep("A limpar ficheiros temporários...");
                Object.keys(localStorage).forEach((k) => {
                  if (k !== "sigep_logged_in_user" && !k.includes("token")) {
                    localStorage.removeItem(k);
                  }
                });
                Object.keys(sessionStorage).forEach((k) => sessionStorage.removeItem(k));
                setTimeout(() => {
                  setIsCleaning(false);
                  setCleaningStep(null);
                  alert("Ficheiros temporários e lixo do sistema eliminados com sucesso. O sistema vai recarregar.");
                  window.location.reload();
                }, 1000);
              }
            },
            icon: RefreshCw,
            color: "bg-teal-600",
          },
          {
            label: "Limpar Dados de Programador (Testes)",
            special: true,
            action: handleClearProgrammerData,
            icon: RefreshCw,
            color: "bg-red-800",
          },
          {
            label: "Bens e Materiais",
            collections: ["materiais_bens", "suppliers"],
            icon: Box,
            color: "bg-slate-600",
          },
          {
            label: "Eventos e Notas Pessoais",
            collections: ["calendar_events", "notes"],
            icon: Calendar,
            color: "bg-rose-500",
          },
          {
            label: "Biblioteca e Visitas",
            collections: ["library_visits", "library_books"],
            icon: Info,
            color: "bg-cyan-600",
          },
          {
            label: "Gestão de Utilizadores",
            collections: ["users"],
            icon: ShieldCheck,
            color: "bg-gray-800",
            protected: true,
          },
        ];

        const toggleSelection = (label: string) => {
          setSelectedCleanupLabels((prev) =>
            prev.includes(label)
              ? prev.filter((l) => l !== label)
              : [...prev, label],
          );
        };

        const handleGranularClear = async (cat: any) => {
          if (cat.protected) {
            alert(
              "Esta categoria está protegida e não pode ser eliminada para garantir a integridade do sistema.",
            );
            return;
          }
          if (cat.special) {
            await cat.action();
            return;
          }
          const confirm = window.confirm(
            `Tem certeza que deseja eliminar permanentemente os dados de "${cat.label}"? Esta ação não pode ser desfeita.`,
          );
          if (confirm) {
            setIsCleaning(true);
            setCleaningStep(`Limpando ${cat.label}...`);
            try {
              const targets = cat.collections || [cat.collection];
              for (const collName of targets) {
                setCleaningStep(`A processar coleção: ${collName}...`);
                const colSnapshot = await getDocs(collection(db, collName));

                for (const document of colSnapshot.docs) {
                  // Protect admin account
                  if (
                    collName === "users" &&
                    document.data().role === "Administrador" &&
                    (document.data().name === "Franzíssi Tripalonga" ||
                      document.data().name === "SLAITER TRIPAS")
                  ) {
                    continue;
                  }
                  if (
                    collName === "colaboradores" &&
                    (document.data().nome === "Franzíssi Tripalonga" ||
                      document.data().nome === "SLAITER TRIPAS")
                  ) {
                    continue;
                  }

                  const { deleteDoc, doc } = await import("firebase/firestore");
                  await deleteDoc(doc(db, collName, document.id));
                }
              }
              if (cat.label === "Actividades e Planeamento") {
                setCleaningStep("Atualizando configurações de plano...");
                await firestoreService.config.set("pesoe_config", {
                  seedingDisabled: true,
                });
              }
              alert(`Informações de "${cat.label}" eliminadas com sucesso!`);
            } catch (err) {
              console.error("Erro granular:", err);
              alert("Houve um erro ao limpar esta categoria.");
            }
            setIsCleaning(false);
            setCleaningStep(null);
          }
        };

        return (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <Trash2 size={48} className="mx-auto text-red-600 mb-2" />
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                Gestão de Limpeza do Sistema
              </h2>
              <p className="text-gray-500 font-medium">
                Selecione as categorias que deseja remover e clique em Limpeza
                Geral.
              </p>
            </div>

            {/* Limpeza Geral de Repetições e Sobreposições de Nome e Código */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-8 rounded-[2.5rem] shadow-xl text-white space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black tracking-tight mb-1">
                    Limpeza Geral: Excluir Repetição e Sobreposição de Nome e Código
                  </h3>
                  <p className="text-blue-200 text-xs font-medium">
                    Remove duplicados de colaboradores, actividades, matrizes e fornecedores, resequenciando códigos e unificando dados sem perder nenhuma informação essencial.
                  </p>
                </div>
                <button
                  disabled={isCleaning}
                  onClick={handleGeneralSystemCleanup}
                  className="px-6 py-4 bg-white text-blue-900 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {isCleaning ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <RefreshCw size={18} />
                  )}
                  <span>Executar Limpeza de Duplicados</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cleanupCategories.map((cat, idx) => (
                <div
                  key={idx}
                  onClick={() => !cat.protected && toggleSelection(cat.label)}
                  className={`p-6 rounded-3xl border transition-all group flex items-center justify-between cursor-pointer ${
                    cat.protected
                      ? "bg-gray-50 border-gray-100 opacity-60 grayscale"
                      : selectedCleanupLabels.includes(cat.label)
                        ? "bg-red-50 border-red-200 shadow-md ring-2 ring-red-500/20"
                        : "bg-white border-gray-100 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center">
                      {cat.protected ? (
                        <div className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center">
                          <ShieldCheck size={14} className="text-gray-400" />
                        </div>
                      ) : (
                        <div
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            selectedCleanupLabels.includes(cat.label)
                              ? "bg-red-600 border-red-600 text-white"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          {selectedCleanupLabels.includes(cat.label) && (
                            <CheckSquare size={14} />
                          )}
                        </div>
                      )}
                    </div>
                    <div
                      className={`${cat.color} p-3 rounded-2xl text-white shadow-lg shadow-gray-100`}
                    >
                      <cat.icon size={20} />
                    </div>
                    <div>
                      <p className="font-black text-gray-800 text-sm leading-none mb-1">
                        {cat.label}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold tracking-widest">
                        {cat.protected ? "Protegido" : "Selecionável"}
                      </p>
                    </div>
                  </div>

                  {!cat.protected && (
                    <button
                      disabled={isCleaning}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGranularClear(cat);
                      }}
                      className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isSuperBossUser(user) && (
              <div className="p-8 bg-red-950 rounded-[2.5rem] border-4 border-red-600 shadow-2xl space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-red-600 rounded-3xl text-white animate-pulse">
                    <Power size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter">
                      Reinício Total do Sistema
                    </h3>
                    <p className="text-red-200 text-sm font-bold">
                      Esta opção limpa TODA a base de dados de actividades e
                      planos (exceto colaboradores e usuários).
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleFullSystemReset}
                  className="w-full py-6 bg-red-600 hover:bg-red-700 text-white font-black rounded-3xl shadow-xl transition-all tracking-[0.2em] border-b-4 border-red-800 active:border-0 active:translate-y-1"
                >
                  Reiniciar Base de Dados Agora
                </button>
              </div>
            )}

            <div className="pt-6">
              <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 space-y-6 relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <AlertCircle
                    size={32}
                    className="text-red-600 shrink-0 mt-1"
                  />
                  <div>
                    <h3 className="font-black text-red-900">
                      Executar Limpeza dos Itens Selecionados
                    </h3>
                    <p className="text-red-700/70 text-sm font-medium leading-relaxed">
                      Esta ação removerá permanentemente todos os registros das
                      categorias que selecionou acima (
                      {selectedCleanupLabels.length} selecionadas). As
                      categorias protegidas nunca serão eliminadas por esta via.
                    </p>
                  </div>
                </div>

                <button
                  disabled={isCleaning || selectedCleanupLabels.length === 0}
                  onClick={async () => {
                    const confirm1 = window.confirm(
                      `CONFIRMAÇÃO: Deseja eliminar permanentemente os dados das ${selectedCleanupLabels.length} categorias selecionadas?`,
                    );
                    if (confirm1) {
                      const selectedObjects = cleanupCategories.filter((c) =>
                        selectedCleanupLabels.includes(c.label),
                      );
                      await handleClearData(selectedObjects);
                    }
                  }}
                  className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                >
                  {isCleaning ? (
                    <>
                      <Loader2 className="animate-spin" /> {cleaningStep}
                    </>
                  ) : (
                    "Executar Limpeza Geral Do Sistema"
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      }
      case "Configurações":
        return (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-slate-50/50 p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-xs font-black text-gray-400">
                    Informação do Proprietário
                  </label>
                  <div className="space-y-4 p-6 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-white border border-gray-200 rounded-full overflow-hidden flex items-center justify-center relative group">
                        {ownerPhoto ? (
                          <img
                            src={ownerPhoto}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={24} className="text-gray-300" />
                        )}
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                          <Plus size={20} className="text-white" />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChangeCapture={handlePhotoUpload}
                          />
                        </label>
                      </div>
                      <div className="w-16 h-16 bg-white border border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center relative group">
                        {systemLogo ? (
                          <img
                            src={systemLogo}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <Building size={24} className="text-gray-300" />
                        )}
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                          <Plus size={20} className="text-white" />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChangeCapture={async (e) => {
                              const file = e.currentTarget.files?.[0];
                              if (file) {
                                try {
                                  showAlert("A otimizar logotipo...", "info");
                                  const optimized = await optimizeImageForFirestore(file, 300, 300, 120 * 1024);
                                  if (optimized) {
                                    setSystemLogo(optimized);
                                    localStorage.setItem("systemLogo", optimized);
                                    if (typeof window !== "undefined") {
                                      window.dispatchEvent(
                                        new CustomEvent("sigep_system_logo_updated", { detail: { logo: optimized } })
                                      );
                                    }
                                    showAlert("Logotipo selecionado e pronto para guardar.", "success");
                                  }
                                } catch (err) {
                                  console.error("Erro ao otimizar logotipo:", err);
                                  showAlert("Erro ao processar imagem do logotipo.", "error");
                                }
                              }
                            }}
                          />
                        </label>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-700">
                          Foto e Logo
                        </p>
                        <p className="text-[10px] text-gray-400">
                          PROPRIETÁRIO • PROGRAMADOR
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <label className="text-xs font-bold text-gray-600">Link ou URL Direta do Logótipo do SIGEP</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={systemLogo || ""}
                          onChange={(e) => setSystemLogo(e.target.value)}
                          placeholder="Ex: /image.png ou https://exemplo.com/logo.png"
                          className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (systemLogo) {
                              localStorage.setItem("systemLogo", systemLogo);
                              window.dispatchEvent(
                                new CustomEvent("sigep_system_logo_updated", { detail: { logo: systemLogo } })
                              );
                              showAlert("Logotipo aplicado com sucesso em todo o sistema!", "success");
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                        >
                          Aplicar / Confirmar
                        </button>
                      </div>
                    </div>

                    <SearchableSelect
                      value={ownerName}
                      onChange={(val) => setOwnerName(val)}
                      options={[
                        { value: "Songo", label: "Songo (Instituição)" },
                        ...FUNCIONARIOS.map((f) => ({
                          value: f.nome,
                          label: `${f.nome} (${f.cargo})`,
                        })),
                      ]}
                      placeholder="Selecione o Proprietário..."
                      className="w-full text-black"
                    />
                    <input
                      value={ownerCargo}
                      onChange={(e) => setOwnerCargo(e.target.value)}
                      placeholder="Cargo (ex: Diretor-Geral)"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none text-black"
                    />
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 tracking-widest">
                        Senha de Acesso
                      </label>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Nova Senha"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none text-black"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-xs font-black text-gray-400">
                    Informação do Programador IT
                  </label>
                  <div className="space-y-3 p-6 bg-blue-50/50 rounded-2xl">
                    <input
                      value={itEmail}
                      onChange={(e) => setItEmail(e.target.value)}
                      placeholder="Email de Suporte"
                      className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium text-black"
                    />
                    <input
                      value={itWhatsapp}
                      onChange={(e) => setItWhatsapp(e.target.value)}
                      placeholder="WhatsApp / Telefone"
                      className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium text-black"
                    />
                    <input
                      value={itWeb}
                      onChange={(e) => setItWeb(e.target.value)}
                      placeholder="Website"
                      className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium text-black"
                    />
                    <input
                      value={itFacebook}
                      onChange={(e) => setItFacebook(e.target.value)}
                      placeholder="Facebook"
                      className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium text-black"
                    />
                    <input
                      value={itLinkedin}
                      onChange={(e) => setItLinkedin(e.target.value)}
                      placeholder="LinkedIn"
                      className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium text-black"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end">
                <button
                  onClick={handleSaveProprietario}
                  className="px-10 py-4 bg-blue-900 text-white rounded-2xl font-black tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20"
                >
                  Guardar Configurações
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-12 text-center text-gray-400 font-bold italic tracking-widest">
            Selecione uma opção no menu lateral.
          </div>
        );
    }
  };

  if (!isRevealed && isGlobalAdmin) {
    return (
      <div className="flex-1 w-full bg-[#000033] flex flex-col items-center justify-center p-8 text-white animate-in fade-in duration-700">
        <button 
          onClick={() => setIsRevealed(true)}
          className="group flex flex-col items-center cursor-pointer outline-none"
        >
          {/* Logótipo posicionado 5px para cima e com separação nítida em relação aos textos */}
          <div 
            className="w-24 h-24 mb-10 transform -translate-y-[5px] group-hover:scale-110 transition-transform duration-500 relative"
            style={{ transform: "translateY(-5px)" }}
          >
            <SigepLogo 
              size="xl" 
              showText={false} 
              animated 
              instituicaoId={activeInstData?.id}
              instituicaoData={activeInstData}
            />
          </div>

          {/* Textos separados do logótipo com espaçamento harmonioso */}
          <div className="flex flex-col items-center gap-5 mt-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-[0.3em] text-center uppercase transition-all group-hover:text-amber-400" style={{ textShadow: "0 0 20px rgba(0,0,0,0.5)" }}>
              Painel do Administrador Geral
            </h1>
            <div className="h-1 w-24 bg-amber-400 group-hover:w-80 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(251,191,36,0.5)]"></div>
            <div className="flex flex-col items-center gap-2 mt-4">
               <p className="text-[10px] font-black tracking-[0.6em] text-slate-400 uppercase animate-pulse">
                 Clique para Desbloquear Informações
               </p>
               <div className="text-[8px] font-mono text-blue-400/50 uppercase tracking-widest mt-2">
                 Sistema de Gestão Integrada &bull; Acesso Restrito
               </div>
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-[#f8f9fa] flex flex-col font-sans relative overflow-hidden">
      <div className="flex-grow flex overflow-hidden">
        <main
          className={`flex-grow overflow-hidden bg-[#f8f9fa] flex flex-col min-h-0 min-w-0 ${
            ["Centro de Mensagens", "Caixa de Mensagens"].includes(activeItem)
              ? "p-0 h-full"
              : activeItem === "Sobre o Sistema"
              ? "px-[5px] py-2 h-full"
              : "p-2 md:p-4"
          }`}
        >
          <div
            className={`h-full w-full mx-auto flex flex-col min-h-0 ${
              ["Centro de Mensagens", "Caixa de Mensagens"].includes(activeItem)
                ? "max-w-full overflow-hidden"
                : activeItem === "Sobre o Sistema"
                ? "max-w-full scrollbar overflow-y-auto"
                : "max-w-7xl scrollbar overflow-y-auto"
            }`}
          >
            <Suspense fallback={<div className="p-8 text-center text-slate-500">A carregar...</div>}>
          {renderContent()}
        </Suspense>
          </div>
        </main>
        {isMenuOpen && (
          <aside
            className={`bg-[#000066] text-white flex flex-col shadow-2xl relative transition-all duration-300 ${
              isSidebarCollapsed ? "w-20 px-1" : "w-80 px-4"
            }`}
          >
            {/* Botão de minimização/maximização centrado no limite do submenu lateral */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? "Maximizar Menu Lateral" : "Minimizar Menu Lateral"}
              className="hidden md:flex absolute top-1/2 -translate-y-1/2 -left-3.5 z-40 w-7 h-7 bg-white text-[#000066] hover:bg-amber-400 hover:text-slate-900 rounded-full border-2 border-blue-200 shadow-xl items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none cursor-pointer"
            >
              {isSidebarCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>

            {/* Acesso ao Menu Geral da Instituição (Navegar por Todos os Setores) */}
            <div className={`pt-4 pb-2 border-b border-white/10 ${isSidebarCollapsed ? "px-1" : "px-2"}`}>
              <button
                type="button"
                onClick={onBack}
                title="Aceder ao Menu Geral da Instituição para navegar por todos os setores"
                className={`w-full flex items-center gap-3 py-3 px-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-blue-950 font-black text-xs transition-all shadow-md transform hover:scale-[1.02] cursor-pointer ${
                  isSidebarCollapsed ? "justify-center px-1" : "justify-start"
                }`}
              >
                <LayoutGrid size={20} className="shrink-0 text-blue-950" />
                {!isSidebarCollapsed && (
                  <div className="text-left leading-tight">
                    <span className="block text-[11px] font-black tracking-wider uppercase">Menu Geral</span>
                    <span className="block text-[9px] font-bold text-blue-900/80">Navegar pelos Setores</span>
                  </div>
                )}
              </button>
            </div>

            <div className="flex-grow overflow-y-auto py-8 space-y-[1px]">
              {menuItems
                .filter((item) => !(item as any).hidden)
                .map((item, idx) => {
                  if ((item as any).type === "group") {
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setExpandedGroups(prev => 
                            prev.includes(item.title) 
                              ? prev.filter(g => g !== item.title) 
                              : [...prev, item.title]
                          );
                        }}
                        className={`w-full flex items-center justify-between px-6 py-3 text-[10px] font-black text-blue-300 tracking-widest uppercase hover:bg-white/5 transition-all ${isSidebarCollapsed ? "hidden" : ""}`}
                      >
                        {item.title}
                        {expandedGroups.includes(item.title) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    );
                  }
                  if ((item as any).parent && !expandedGroups.includes((item as any).parent)) {
                    return null;
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (item.title === "Registar") {
                          handleOpenRegistration(null);
                        } else {
                          setActiveItem(item.title);
                          setActiveItemClickCount((prev) => prev + 1);
                        }
                      }}
                      title={item.title}
                      className={`w-full flex items-center gap-4 py-4 rounded-2xl text-[11px] font-black tracking-widest transition-all ${
                        isSidebarCollapsed ? "justify-center px-2" : "px-6"
                      } ${activeItem === item.title ? "bg-white text-[#000066]" : "hover:bg-white/10"} ${(item as any).parent ? "pl-12" : ""}`}
                    >
                      <item.icon size={18} className="shrink-0" />
                      {!isSidebarCollapsed && <span>{item.title}</span>}
                    </button>
                  );
                })}
            </div>
            <div className={`p-4 border-t border-white/10 ${isSidebarCollapsed ? "p-2" : "p-8"}`}>
              <button
                onClick={onLogout}
                title="Sair do Sistema"
                className={`group w-full flex items-center gap-4 py-4 rounded-2xl text-[11px] font-black tracking-widest transition-colors hover:text-red-500 hover:bg-white/5 ${
                  isSidebarCollapsed ? "justify-center px-2" : "px-6"
                }`}
              >
                <Power
                  size={18}
                  className="animate-rgb-icon group-hover:!text-red-500 group-hover:animate-none transition-colors shrink-0"
                />{" "}
                {!isSidebarCollapsed && <span>Sair do Sistema</span>}
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
