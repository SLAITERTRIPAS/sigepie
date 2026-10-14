/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, ReactNode, Component } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  X,
  AlertCircle,
  RefreshCw,
  ShieldAlert,
  ArrowLeft,
  Database,
  Bell,
  AlertTriangle,
  Calendar,
  Clock,
  FileText,
} from "lucide-react";
import SigepLogo from "./components/SigepLogo";
import FirebaseStatusIndicator from "./components/FirebaseStatusIndicator";
import MainHeader from "./blocos/bloco1_apresentacao/MainHeader";
import { AlertModal } from "./components/ui/AlertModal";
import BackupRestoreModal from "./components/modals/BackupRestoreModal";
import FooterInfoModal from "./components/modals/FooterInfoModal";
import { ViewRenderer } from "./components/ViewRenderer";
import { useCurrentLanguage, getTranslation } from "./lib/i18n";
import { EFETIVO_GERAL_DATA } from "./constants/colaboradoresList";
import { runAutomaticBackupIfNeeded, autoRestoreOnStartup } from "./lib/backupService";
import {
  Event,
  Expediente,
  LibraryRegistration,
  BookRegistration,
  ServiceRequest,
  Nota,
  FinancialData,
} from "./types";
import {
  isSuperBossUser,
  isChefeUser,
  isInstitutionalAdminUser,
  isInstitutionalAdminAccount,
  isHRBossUser,
  isPatrimonioBossOrAdmin,
  getUserWorkspace,
  determineUserRole,
  isTechnicianUser,
} from "./lib/auth";
import { wipeAllTestData } from "./lib/firestoreService";
import { clearActivitiesForInstitution, purgeAjudasDeCustoFromDatabase } from "./lib/cleanupService";
import { ProcessingCircle } from "./components/ui/ProcessingCircle";
import { MENU_NAVIGATION_MAP, getMenuNavigationConfig } from "./lib/menuNavigationConfig";
import {
  firestoreService,
  wipeDatabaseExceptExclusions,
  ensureFirebaseAuth,
  fetchUserDataByUid,
} from "./lib/firestoreService";
import { databaseMaintenance } from "./lib/databaseMaintenance";
import {
  generateCollaboratorId,
  isMatch,
  checkIsQuadro,
  classifyTipo,
  mergeColaboradores,
  getCircularReplacer,
  safeJSONStringify,
  verifyAndCleanCache,
} from "./lib/utils";

import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  onSnapshot,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./lib/firebase";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { getSetoresByDepartamento } from "./constants/formOptions";
import DiagnosticPanel from "./components/DiagnosticPanel";
export { ErrorBoundary };

interface NavigationSnapshot {
  view: string;
  dashboardTitle: string;
  subMenuStack: {
    title: string;
    items: { title: string; subItems?: { title: string }[] }[];
  }[];
  dashboardActiveItem?: string | undefined;
  dashboardItems?: any[];
}

import { ActiveAlertsDisplay } from "./components/ActiveAlertsDisplay";
import { ReminderNotificationManager } from "./components/ReminderNotificationManager";

export default function App() {
  // 1. Estados de Base (Dados)
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [historyStack, setHistoryStack] = useState<NavigationSnapshot[]>([]);

  // Efeito de autenticação rigoroso
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Ignorar autenticações anónimas técnicas (não representam uma sessão de utilizador final)
      if (user && user.isAnonymous) {
        setLoadingUser(false);
        return;
      }

      if (user) {
        try {
          setLoadingUser(true);
          const userData = await fetchUserDataByUid(user.uid);
          
          if (!userData.profile && !userData.colaborador) {
            // Se for o Administrador Geral
            if (user.email && user.email.toLowerCase().trim() === "slaitertripas@gmail.com") {
              const adminUser = {
                uid: user.uid,
                email: "slaitertripas@gmail.com",
                name: "Slaiter Tripas",
                nome: "Slaiter Tripas",
                role: "Proprietário",
                status: "Ativo",
                isOwner: true,
                isProgrammer: true
              };
              setCurrentUser(adminUser);
              localStorage.setItem("sigep_logged_in_user", JSON.stringify(adminUser));
            } else {
              // Utilizador registado previamente na sessão local
              const stored = localStorage.getItem("sigep_logged_in_user");
              if (stored) {
                try {
                  const parsed = JSON.parse(stored);
                  if (parsed && parsed.name !== "Novo Utilizador" && parsed.nome !== "Novo Utilizador") {
                    setCurrentUser(parsed);
                  }
                } catch (_) {}
              }
            }
          } else {
            // Combina perfil e colaborador num único objeto de sessão
            const mergedUser: any = {
              uid: user.uid,
              ...userData.profile,
              ...userData.colaborador,
              email: user.email || (userData.profile as any)?.email || (userData.colaborador as any)?.email
            };

            // Garantir que nunca haja "Novo Utilizador" no nome
            if (!mergedUser.name || mergedUser.name === "Novo Utilizador") {
              mergedUser.name = mergedUser.nome || mergedUser.nomeCompleto || mergedUser.nomeReal || (mergedUser.email ? mergedUser.email.split("@")[0] : "Colaborador");
            }
            if (mergedUser.nome === "Novo Utilizador") {
              mergedUser.nome = mergedUser.name;
            }

            setCurrentUser(mergedUser);
            localStorage.setItem("sigep_logged_in_user", JSON.stringify(mergedUser));
          }
        } catch (e) {
          console.error("Erro ao carregar dados do utilizador:", e);
        } finally {
          setLoadingUser(false);
        }
      } else {
        const stored = localStorage.getItem("sigep_logged_in_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed) {
              if (parsed.name === "Novo Utilizador" || parsed.nome === "Novo Utilizador") {
                parsed.name = parsed.nomeCompleto || parsed.nomeReal || (parsed.email ? parsed.email.split("@")[0] : "Colaborador");
                parsed.nome = parsed.name;
                localStorage.setItem("sigep_logged_in_user", JSON.stringify(parsed));
              }
              setCurrentUser(parsed);
            }
          } catch (_) {}
        }
        setLoadingUser(false);
      }
    });
    return unsubscribe;
  }, []);

  // Purga automática de ajudas de custo em toda a base de dados no arranque
  useEffect(() => {
    purgeAjudasDeCustoFromDatabase().catch(err => console.warn("Erro ao purgar ajudas de custo:", err));
  }, []);

  const [rawColaboradores, setRawColaboradores] = useState<any[]>([]);
  const [rawChefiaColaboradores, setRawChefiaColaboradores] = useState<any[]>([]);
  const [processos, setProcessos] = useState<any[]>([]);
  const [instituicoes, setInstituicoes] = useState<any[]>([]);
  const [alocacoes, setAlocacoes] = useState<any[]>([]);
  
  const colaboradores = React.useMemo(() => {
    return mergeColaboradores([...rawChefiaColaboradores, ...rawColaboradores]);
  }, [rawColaboradores, rawChefiaColaboradores]);

  const extendedUser = React.useMemo(() => {
    return currentUser;
  }, [currentUser]);

  // 2. Estados de Navegação e Interface
  const [view, setView] = useState<any>(() => {
    try {
      const storedUserStr =
        localStorage.getItem("sigep_logged_in_user") ||
        localStorage.getItem("sigep_user");
      if (storedUserStr && storedUserStr !== "undefined") {
        const parsed = JSON.parse(storedUserStr);
        if (parsed && isSuperBossUser(parsed)) {
          if (isChefeUser(parsed)) {
            return "admin_role_selection";
          }
          return "dashboard";
        }
      }
    } catch (e) {
      console.error("Erro ao inicializar view:", e);
    }
    return "presentation";
  });
  const [statsActiveItem, setStatsActiveItem] = useState<string | null>(null);
  const [subMenuStack, setSubMenuStack] = useState<
    {
      title: string;
      items: { title: string; subItems?: { title: string }[] }[];
    }[]
  >([]);
  const [dashboardTitle, setDashboardTitle] = useState(() => {
    try {
      const storedUserStr =
        localStorage.getItem("sigep_logged_in_user") ||
        localStorage.getItem("sigep_user");
      if (storedUserStr) {
        const parsed = JSON.parse(storedUserStr);
        if (parsed && isSuperBossUser(parsed)) {
          if (!isChefeUser(parsed)) {
            return "Sistema";
          }
        }
      }
    } catch (e) {}
    return "";
  });
  const [dashboardItems, setDashboardItems] = useState<any[]>([]);
  const [errorStates, setErrorStates] = useState<Record<string, string>>({});
  const [dashboardActiveItem, setDashboardActiveItem] = useState<
    string | undefined
  >(undefined);
  const [modalMessage, setModalMessage] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [notes, setNotes] = useState<Nota[]>([]);
  const [visitorType, setVisitorType] = useState("Estudante");
  const [verifiedVisitor, setVerifiedVisitor] = useState<any>(null);
  const [selectedService, setSelectedService] = useState("");
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]); // Added suppliers state
  const [matrixActivities, setMatrixActivities] = useState<any[]>([]); // Added centralized state for activities
  const [events, setEvents] = useState<Event[]>([]);
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [libraryRegistrations, setLibraryRegistrations] = useState<
    LibraryRegistration[]
  >([]);
  const [bookRegistrations, setBookRegistrations] = useState<
    BookRegistration[]
  >([]);
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [efetivoEscolar, setEfetivoEscolar] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [accessAlerts, setAccessAlerts] = useState<any[]>([]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [activeInst, setActiveInst] = useState<any>(null); // Adicionado

  // Validação de segurança para evitar tela branca por estados inconsistentes
  useEffect(() => {
    if (!view) {
      console.warn("Estado 'view' estava vazio, restaurando para 'presentation'.");
      setView("presentation");
    }
    // Se estiver numa vista protegida mas não houver utilizador, forçar login
    const protectedViews = ["dashboard", "menu", "submenu", "admin_role_selection", "sector_selection"];
    if (protectedViews.includes(view) && !currentUser) {
      console.warn(`Tentativa de aceder à vista protegida '${view}' sem utilizador. Redirecionando para login.`);
      setView("login");
    }
  }, [view, currentUser]);

  useEffect(() => {
    if (currentUser && isSuperBossUser(currentUser)) {
      if (view === "presentation" || view === "login") {
        if (isChefeUser(currentUser)) {
          setDashboardTitle("");
          setView("admin_role_selection");
        } else {
          setDashboardTitle("Sistema");
          setDashboardActiveItem(undefined);
          setView("dashboard");
        }
      }
    }
  }, [currentUser]);

  // Limpeza de base de dados solicitada
  useEffect(() => {
    if (currentUser && isSuperBossUser(currentUser) && activeInst?.id) {
      if (!localStorage.getItem(`sigep_wipe_done_${activeInst.id}`)) {
        console.log(`🔥 Executando limpeza de atividades para instituição: ${activeInst.id}...`);
        clearActivitiesForInstitution(activeInst.id).then(() => {
          localStorage.setItem(`sigep_wipe_done_${activeInst.id}`, "true");
          console.log("✅ Limpeza de atividades concluída.");
        });
      }
    }
  }, [currentUser, activeInst]);

  // Instituição Dinâmica do Utilizador Logado
  useEffect(() => {
    const instId = currentUser?.instituicaoId || currentUser?.instituicao || (typeof window !== "undefined" ? localStorage.getItem("sigep_active_instituicao_id") : null) || "isps";
    let unsub = () => {};
    
    try {
      unsub = firestoreService.instituicoes.subscribe((insts: any[]) => {
        setInstituicoes(insts);
        if (insts && insts.length > 0) {
          const found = insts.find((i) => 
            (instId && (String(i.id).trim() === String(instId).trim() || i.nome?.toLowerCase() === String(instId).toLowerCase())) ||
            (currentUser?.instituicao && (i.id === currentUser.instituicao || i.nome?.toLowerCase() === String(currentUser.instituicao).toLowerCase())) ||
            (currentUser?.instituicaoNome && i.nome?.toLowerCase() === String(currentUser.instituicaoNome).toLowerCase())
          ) || insts[0];
          if (found) {
            setActiveInst(found);
          }
        }
      });
    } catch (e) {
      console.warn("Aviso ao carregar dados da instituição no App:", e);
    }

    const handleInstUpdated = (e: any) => {
      if (e.detail?.payload) {
        setActiveInst((prev: any) => ({ ...(prev || {}), ...e.detail.payload }));
      }
    };
    const handleInstChanged = (e: any) => {
      const activeId = e?.detail?.instituicaoId || (typeof window !== "undefined" ? localStorage.getItem("sigep_active_instituicao_id") : null);
      if (activeId && instituicoes.length > 0) {
        const found = instituicoes.find((i) => i.id === activeId);
        if (found) setActiveInst(found);
      }
    };

    window.addEventListener("instituicao_updated", handleInstUpdated);
    window.addEventListener("instituicao_changed", handleInstChanged);
    window.addEventListener("sigep_estrutura_updated", handleInstChanged);

    return () => {
      unsub();
      window.removeEventListener("instituicao_updated", handleInstUpdated);
      window.removeEventListener("instituicao_changed", handleInstChanged);
      window.removeEventListener("sigep_estrutura_updated", handleInstChanged);
    };
  }, [currentUser?.instituicaoId, currentUser?.instituicao, currentUser?.instituicaoNome]);

  // Aplicar cores como variáveis CSS (adicionar este efeito)
  useEffect(() => {
    if (activeInst) {
      document.documentElement.style.setProperty('--color-primary', activeInst.primaryColor || "#050b38");
      document.documentElement.style.setProperty('--color-secondary', activeInst.secondaryColor || "#070e2d");
      document.documentElement.style.setProperty('--color-accent', activeInst.accentColor || "#FFB800");
    }
  }, [activeInst]);

  const [headerActions, setHeaderActions] = useState<ReactNode>(null);

  const [innerPath, setInnerPath] = useState<string[]>([]);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const currentLang = useCurrentLanguage();
  const [urlParams, setUrlParams] = useState<{
    processoId?: string;
    dept?: string;
    role?: string;
    shared_by?: string;
  }>({});
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showFooterInfoModal, setShowFooterInfoModal] = useState(false);
  const [showQuantumModal, setShowQuantumModal] = useState(false);
  const [showDiagnosticPanel, setShowDiagnosticPanel] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [backupAlert, setBackupAlert] = useState<{ message: string; type: string } | null>(null);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [userNotifications, setUserNotifications] = useState<any[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("sigep_dismissed_alerts");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const [showSectorSelector, setShowSectorSelector] = useState(false);
  const [showLoginSplash, setShowLoginSplash] = useState(false);
  const [postLoginCallback, setPostLoginCallback] = useState<(() => void) | null>(null);
  const [assignedSectorsForLogin, setAssignedSectorsForLogin] = useState<string[]>([]);
  const [selectedSectorForLogin, setSelectedSectorForLogin] = useState<string>("");
  const [sessionTerminatedNotice, setSessionTerminatedNotice] = useState<string | null>(null);

  const handleSelectSector = (sector: string) => {
    if (!sector) return;
    const updatedUser = { ...currentUser, setor: sector };
    setCurrentUser(updatedUser);
    localStorage.setItem("sigep_user", safeJSONStringify(updatedUser));
    localStorage.setItem("sigep_logged_in_user", safeJSONStringify(updatedUser));
    setDashboardTitle(sector);
    setShowSectorSelector(false);
    setView("dashboard");
  };

  const handleConfirmSectorSelection = () => {
    if (!selectedSectorForLogin) return;
    handleSelectSector(selectedSectorForLogin);
  };

  // Sistema de Backup Automático de 12 horas e Restauração Automática no Arranque (Deploy/Remix)
  useEffect(() => {
    // Regra de restauração de base de dados no arranque (após deploy/remix)
    autoRestoreOnStartup().catch((e) =>
      console.warn("Erro ao executar restauração automática no arranque:", e),
    );

    // Verificação inicial ao carregar o sistema
    runAutomaticBackupIfNeeded().catch((e) =>
      console.warn("Erro ao verificar backup automático inicial:", e),
    );

    // Verificação periódica de 15 em 15 minutos enquanto o utilizador estiver logado
    // Isso garante que se o utilizador ficar 12h com o sistema aberto, o backup ocorre.
    const backupInterval = setInterval(() => {
      runAutomaticBackupIfNeeded().catch((e) =>
        console.warn("Erro ao verificar backup automático agendado:", e),
      );
    }, 15 * 60 * 1000); // 15 minutos

    const handleBackupAlert = (event: any) => {
      const detail = event.detail;
      if (detail && detail.message) {
        setBackupAlert({
          message: detail.message,
          type: detail.type || "info",
        });
        setTimeout(() => {
          setBackupAlert(null);
        }, 8000);
      }
    };

    window.addEventListener("sigep_backup_alert", handleBackupAlert);

    // Subscrição de Alertas do Sistema
    const unsubAlerts = firestoreService.systemAlerts.subscribe((alerts: any[]) => {
      // Filtrar apenas alertas ativos e dentro do período de validade
      const now = new Date();
      const active = alerts.filter(a => {
        if (!a.active) return false;
        // Se já foi dispensado nesta sessão/dispositivo, não mostra
        if (dismissedAlerts.includes(a.id)) return false;
        if (a.startDate && new Date(a.startDate) > now) return false;
        if (a.endDate && new Date(a.endDate) < now) return false;
        return true;
      });
      setSystemAlerts(active);
    });

    // Subscrição de Notificações Internas (Institucionais)
    let unsubNotifications: (() => void) | null = null;
    if (currentUser) {
      const userInstId = currentUser.instituicaoId || activeInst?.id;
      if (userInstId) {
        unsubNotifications = firestoreService.notifications.subscribe((notifs: any[]) => {
          // Filtrar por instituição e/ou usuário específico
          // E apenas não lidas
          const activeNotifs = notifs.filter(n => 
            n.instituicaoId === userInstId && 
            (!n.userId || n.userId === currentUser.id) &&
            !n.read
          );
          
          // Mostrar apenas as mais recentes como toasts se necessário, 
          // ou manter no estado para o overlay
          setUserNotifications(activeNotifs);
        });
      }
    }

    return () => {
      window.removeEventListener("sigep_backup_alert", handleBackupAlert);
      clearInterval(backupInterval);
      unsubAlerts();
      if (unsubNotifications) unsubNotifications();
    };
  }, [dismissedAlerts, currentUser, activeInst?.id]);

  const handleSyncData = async () => {
    setModalMessage("Sincronizando todos os dados com o servidor remoto (Firestore)...");
    try {
      const res = await firestoreService.ensureCloudDataInitialized();
      if (isSuperBossUser(extendedUser)) {
        await firestoreService.seedAllCollaborators(EFETIVO_GERAL_DATA);
      }
      setModalMessage("✅ Sucesso! Todos os dados e planos de actividades estão sincronizados com a nuvem e acessíveis em qualquer computador.");
    } catch (error) {
      console.error(error);
      setModalMessage("Erro ao sincronizar dados com o servidor remoto.");
    }
  };

  // Ativação automática e interativa do modo tela cheia ao carregar o sistema
  useEffect(() => {
    const enterFullScreen = () => {
      const docEl = document.documentElement;
      const requestMethod =
        docEl.requestFullscreen ||
        (docEl as any).mozRequestFullScreen ||
        (docEl as any).webkitRequestFullScreen ||
        (docEl as any).msRequestFullscreen;

      if (requestMethod) {
        requestMethod.call(docEl).catch((err) => {
          console.debug(
            "Tentativa de tela cheia automática impedida pelo navegador. Aguardando interação...",
          );
        });
      }
    };

    // Tentar de imediato no carregamento
    enterFullScreen();

    // Registamos um listener de clique/toque único para garantir a ativação na primeira interação
    const handleFirstGesture = () => {
      enterFullScreen();
      document.removeEventListener("click", handleFirstGesture);
      document.removeEventListener("touchstart", handleFirstGesture);
    };

    document.addEventListener("click", handleFirstGesture);
    document.addEventListener("touchstart", handleFirstGesture);

    return () => {
      document.removeEventListener("click", handleFirstGesture);
      document.removeEventListener("touchstart", handleFirstGesture);
    };
  }, []);

  // Clear header actions whenever the main view changes
  useEffect(() => {
    setHeaderActions(null);
    setInnerPath([]);
  }, [view, subMenuStack]);

  // Atalho de teclado para Diagnóstico (Shift + D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toUpperCase() === "D") {
        setShowDiagnosticPanel(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    // Garantir autenticação do Firebase imediatamente no arranque para evitar erros de permissão
    ensureFirebaseAuth();

    // InitialAuthStateCheck de alta velocidade para arranque instantâneo
    const authUnsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          ensureFirebaseAuth();
          return;
        }

        let initialUser: any = null;

        try {
          const storedUserStr =
            localStorage.getItem("sigep_logged_in_user") ||
            localStorage.getItem("sigep_user");
          if (storedUserStr) {
            const storedUser = JSON.parse(storedUserStr);
            if (
              storedUser &&
              (storedUser.email ||
                storedUser.nuit ||
                storedUser.id ||
                storedUser.name)
            ) {
              initialUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                id: firebaseUser.uid,
                name:
                  firebaseUser.displayName ||
                  (firebaseUser.email
                    ? firebaseUser.email.split("@")[0]
                    : "Utilizador"),
                role: "Utilizador",
                status: "Ativo",
                ...storedUser,
              };

              // A capa de entrada inicial ('presentation') deve ser preservada incondicionalmente
              // até que o utilizador clique explicitamente em Entrar no Sistema.
            }
          }
        } catch (e) {
          console.warn("Erro ao recuperar utilizador local:", e);
        }

        if (initialUser) {
          setCurrentUser(initialUser);
          setView((currentView: any) => {
            if (currentView === "presentation") {
              return "presentation";
            }
            return currentView;
          });
        } else {
          setCurrentUser(null);
          setView((currentView: any) => {
            if (currentView === "presentation") {
              return "presentation";
            }
            return "login";
          });
        }
        
        // Background Sync não-bloqueante
        if (initialUser && (initialUser.email || (initialUser as any).nuit)) {
          setTimeout(async () => {
            try {
              const usersRef = collection(db, "users");
              const q = (initialUser as any).email
                ? query(usersRef, where("email", "==", String((initialUser as any).email).toLowerCase().trim()))
                : query(usersRef, where("nuit", "==", String((initialUser as any).nuit).trim()));

              const snap = await Promise.race([
                getDocs(q),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout sync")), 2000))
              ]) as any;

              if (snap && !snap.empty) {
                const latestData = { ...snap.docs[0].data(), id: snap.docs[0].id } as any;
                const refinedRole = determineUserRole(latestData);

                const localSessionToken = localStorage.getItem("sigep_session_token");
                if (
                  latestData.currentSessionToken &&
                  localSessionToken &&
                  latestData.currentSessionToken !== localSessionToken
                ) {
                  console.warn("[SIGEP] Sessão terminada: conta aberta noutro dispositivo.");
                  localStorage.removeItem("sigep_logged_in_user");
                  localStorage.removeItem("sigep_user");
                  localStorage.removeItem("sigep_current_view");
                  localStorage.removeItem("sigep_session_token");
                  sessionStorage.removeItem("session_start");
                  setCurrentUser(null);
                  setView("login");
                  setSessionTerminatedNotice(
                    "A sua conta foi acedida através de outro dispositivo ou navegador. A sessão neste dispositivo foi encerrada automaticamente por segurança."
                  );
                  return;
                }

                if (!localSessionToken && latestData.currentSessionToken) {
                  localStorage.setItem("sigep_session_token", latestData.currentSessionToken);
                } else if (!latestData.currentSessionToken) {
                  const freshToken = localSessionToken || ("sigep_sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 12));
                  localStorage.setItem("sigep_session_token", freshToken);
                  updateDoc(doc(db, "users", latestData.id), { currentSessionToken: freshToken }).catch(() => {});
                }
                
                setCurrentUser((prev: any) => {
                  const updated = { ...prev, ...latestData, role: refinedRole, mustChangePassword: false };
                  localStorage.setItem("sigep_logged_in_user", safeJSONStringify(updated));
                  localStorage.setItem("sigep_user", safeJSONStringify(updated));
                  return updated;
                });
              }
            } catch (syncErr) {
              console.warn("Background sync skipped:", syncErr);
            }
          }, 1000);
        }
      } catch (err) {
        console.error("Erro na inicialização:", err);
      }
    });

    return () => authUnsub();
  }, []);

  // Controlo de Sessão Única em Tempo Real:
  // Se o mesmo utilizador iniciar sessão num segundo dispositivo, o primeiro dispositivo fecha a sessão automaticamente
  useEffect(() => {
    if (!currentUser) return;

    let targetDocId = currentUser.id && !String(currentUser.id).startsWith("local_") ? currentUser.id : null;
    let unsubSnapshot: (() => void) | null = null;
    let isTerminating = false;

    const terminateDeviceSession = (remoteToken: string, localToken: string) => {
      if (isTerminating) return;
      isTerminating = true;

      console.warn(`[SIGEP] Sessão encerrada: utilizador autenticado noutro dispositivo (remoto: ${remoteToken}, local: ${localToken})`);

      // Limpar todos os dados de autenticação locais deste dispositivo
      localStorage.removeItem("sigep_logged_in_user");
      localStorage.removeItem("sigep_user");
      localStorage.removeItem("sigep_current_view");
      localStorage.removeItem("sigep_session_token");
      sessionStorage.removeItem("session_start");

      setCurrentUser(null);
      setView("login");
      setSubMenuStack([]);
      setHistoryStack([]);
      setDashboardTitle("");
      setDashboardItems([]);
      setDashboardActiveItem(undefined);
      setInnerPath([]);
      setSessionTerminatedNotice(
        "A sua conta foi acedida através de outro dispositivo ou navegador. Por motivos de segurança institucional do SIGEP, apenas é permitida uma sessão ativa em simultâneo. A sessão neste dispositivo foi encerrada automaticamente."
      );
    };

    const verifyToken = (remoteToken?: string) => {
      if (!remoteToken) return;
      const localToken = localStorage.getItem("sigep_session_token");
      if (localToken && remoteToken !== localToken) {
        terminateDeviceSession(remoteToken, localToken);
      }
    };

    const setupListener = async () => {
      try {
        let docIdToListen = targetDocId;
        if (!docIdToListen && (currentUser.email || currentUser.nuit)) {
          const usersRef = collection(db, "users");
          const q = currentUser.email
            ? query(usersRef, where("email", "==", String(currentUser.email).toLowerCase().trim()))
            : query(usersRef, where("nuit", "==", String(currentUser.nuit).trim()));
          const snap = await getDocs(q);
          if (!snap.empty) {
            docIdToListen = snap.docs[0].id;
          }
        }

        if (docIdToListen) {
          const userDocRef = doc(db, "users", docIdToListen);
          unsubSnapshot = onSnapshot(
            userDocRef,
            (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data();
                if (data?.currentSessionToken) {
                  verifyToken(data.currentSessionToken);
                }
              }
            },
            (err) => {
              console.warn("Aviso na escuta de sessão única:", err);
            }
          );
        }
      } catch (e) {
        console.warn("Erro ao configurar verificação de sessão única:", e);
      }
    };

    setupListener();

    // Verificação adicional no foco da janela ou retorno do segundo plano
    const checkActiveSession = async () => {
      if (document.visibilityState === "visible") {
        try {
          const localToken = localStorage.getItem("sigep_session_token");
          if (!localToken) return;

          let docId = targetDocId;
          if (!docId && (currentUser.email || currentUser.nuit)) {
            const usersRef = collection(db, "users");
            const q = currentUser.email
              ? query(usersRef, where("email", "==", String(currentUser.email).toLowerCase().trim()))
              : query(usersRef, where("nuit", "==", String(currentUser.nuit).trim()));
            const snap = await getDocs(q);
            if (!snap.empty) docId = snap.docs[0].id;
          }

          if (docId) {
            const snap = await getDoc(doc(db, "users", docId));
            if (snap.exists()) {
              const remoteToken = snap.data()?.currentSessionToken;
              if (remoteToken && remoteToken !== localToken) {
                terminateDeviceSession(remoteToken, localToken);
              }
            }
          }
        } catch (e) {}
      }
    };

    window.addEventListener("focus", checkActiveSession);
    document.addEventListener("visibilitychange", checkActiveSession);

    return () => {
      if (unsubSnapshot) unsubSnapshot();
      window.removeEventListener("focus", checkActiveSession);
      document.removeEventListener("visibilitychange", checkActiveSession);
    };
  }, [currentUser?.id, currentUser?.email, currentUser?.nuit]);

  // Garantir que os dados do Administrador estejam na base de dados de forma assíncrona em segundo plano
  useEffect(() => {
    const timer = setTimeout(() => {
      const seedData = async () => {
        try {
          const usersRef = collection(db, "users");

          const adminData = {
            id: "ST849547771",
            uid: "ST849547771",
            name: "SLAITER TRIPAS",
            nome: "SLAITER TRIPAS",
            designacao: "SLAITER TRIPAS",
            email: "slaitertripas@gmail.com",
            usuario: "slaitertripas@gmail.com",
            tipoUtilizador: "Administrador Global do Sistema",
            role: "Administrador Global do Sistema",
            cargo: "Administrador Global",
            cargoChefia: "-",
            funcao: "Administrador Global",
            categoria: "Administrador Global",
            vinculacaoInstitucional: "Nenhuma",
            participacaoQuadroPessoal: "Não",
            orgao: "-",
            unidade: "-",
            unidadeOrganica: "-",
            direcao: "Nulo",
            departamento: "Nulo",
            reparticao: "Nulo",
            setor: "Nulo",
            instituicaoId: "",
            status: "Ativo",
            efetivo: false,
            isQuadro: false,
            isOwner: true,
            isProgrammer: true,
            isGlobalAdmin: true,
            mustChangePassword: false,
            password: "231383ft",
          };

          const qAdmin = query(
            usersRef,
            where("email", "==", "slaitertripas@gmail.com"),
          );
          const snapAdmin = await getDocs(qAdmin);

          if (snapAdmin.empty) {
            const docRef = doc(db, "users", "ST849547771");
            await setDoc(
              docRef,
              { ...adminData, createdAt: new Date().toISOString() },
              { merge: true },
            );
          } else {
            const docRef = snapAdmin.docs[0].ref;
            await updateDoc(docRef, {
              ...adminData,
              updatedAt: new Date().toISOString(),
            });
          }

          try {
            await deleteDoc(doc(db, "colaboradores", "ST849547771"));
          } catch (_) {}
          
          if (currentUser) {
            const isDeveloper = currentUser.email === "slaitertripas@gmail.com";
            const isAdmin =
              currentUser.role === "Administrador" ||
              currentUser.role === "Admin" ||
              String(currentUser.role).toLowerCase().includes("admin");

            if ((isDeveloper || isAdmin) && currentUser.status !== "Afetado") {
              const updatedUser = { ...currentUser, status: "Afetado" };
              setCurrentUser(updatedUser);
              localStorage.setItem("sigep_user", safeJSONStringify(updatedUser));
              localStorage.setItem("sigep_logged_in_user", safeJSONStringify(updatedUser));

              const q = query(usersRef, where("email", "==", currentUser.email || ""));
              const snap = await getDocs(q);
              if (!snap.empty) {
                await updateDoc(doc(db, "users", snap.docs[0].id), {
                  status: "Afetado",
                  updatedAt: serverTimestamp(),
                });
              }
            }
          }
        } catch (err) {
          console.warn("Aviso na verificação de dados de fundo:", err);
        }
      };

      seedData();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Sincronização automática em segundo plano com a base de dados Firebase
  useEffect(() => {
    const syncTimer = setTimeout(async () => {
      try {
        await firestoreService.ensureCloudDataInitialized();
      } catch (err) {
        console.warn("Aviso na inicialização de fundo da nuvem:", err);
      }
    }, 6000);
    return () => clearTimeout(syncTimer);
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.id && currentUser.email) {
      try {
        // Persistir apenas se for um usuário real
        localStorage.setItem("sigep_last_user_email", currentUser.email);
      } catch (e) {
        console.warn("Failed to persist currentUser data:", e);
      }
    }
  }, [currentUser?.email, currentUser?.id]);

  // Track Active Session (Heartbeat)
  useEffect(() => {
    if (!currentUser || !currentUser.id) return;

    const updateStatus = async (isOnline: boolean) => {
      try {
        await firestoreService.users.update(currentUser.id, {
          lastSeenAt: new Date().toISOString(),
          isOnline: isOnline,
        });
      } catch (e) {
        console.warn("Session tracking error:", e);
      }
    };

    updateStatus(true);
    const interval = setInterval(() => updateStatus(true), 15 * 60 * 1000); // 15 min interval to conserve quota

    const handleVisibility = () => {
      if (document.visibilityState === "visible") updateStatus(true);
    };

    window.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser && view) {
      localStorage.setItem("sigep_current_view", view);
    }
  }, [view, currentUser]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const procId = params.get("processoId") || params.get("processoNo");
      const dept = params.get("dept");
      const role = params.get("role");
      const sharedBy = params.get("shared_by");

      if (procId || dept || role) {
        setUrlParams({
          processoId: procId || undefined,
          dept: dept || undefined,
          role: role || undefined,
          shared_by: sharedBy || undefined,
        });
        setView("colaboradores");
      }
    }

    const handleDataRestored = () => {
      console.log("🔄 Dados restaurados detectados no sistema. A recarregar estados...");
      try {
        const mat = localStorage.getItem("sigep_local_matrix_activities") || localStorage.getItem("sigep_matrix_activities");
        if (mat) setMatrixActivities(JSON.parse(mat));
        const act = localStorage.getItem("sigep_local_actividades") || localStorage.getItem("sigep_actividades");
        if (act) setActivities(JSON.parse(act));
        const colab = localStorage.getItem("sigep_local_colaboradores");
        if (colab) setRawColaboradores(JSON.parse(colab));
        const chef = localStorage.getItem("sigep_local_colaboradores_chefia");
        if (chef) setRawChefiaColaboradores(JSON.parse(chef));
        const supp = localStorage.getItem("sigep_local_suppliers");
        if (supp) setSuppliers(JSON.parse(supp));
        const proc = localStorage.getItem("sigep_local_processos_individuais") || localStorage.getItem("sigep_local_processos");
        if (proc) setProcessos(JSON.parse(proc));
        const exp = localStorage.getItem("sigep_local_expedientes");
        if (exp) setExpedientes(JSON.parse(exp));
        const nots = localStorage.getItem("sigep_local_notes");
        if (nots) setNotes(JSON.parse(nots));
        const evts = localStorage.getItem("sigep_local_calendar_events") || localStorage.getItem("sigep_local_events");
        if (evts) setEvents(JSON.parse(evts));
      } catch (e) {
        console.warn("Aviso ao recarregar dados pós-restauração:", e);
      }
    };

    window.addEventListener("sigep_data_restored", handleDataRestored);
    
    // Ouvinte para mudar de vista globalmente
    const handleOpenViewEvent = (e: any) => {
      if (e.detail?.view) {
        if (e.detail.title) setDashboardTitle(e.detail.title);
        if (e.detail.activeItem) setDashboardActiveItem(e.detail.activeItem);
        handleSetView(e.detail.view);
      }
    };
    window.addEventListener("open_view", handleOpenViewEvent);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && (e.key === "q" || e.key === "Q")) || ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "q" || e.key === "Q"))) {
        e.preventDefault();
        if (!isSuperBossUser(currentUser)) return;
        setShowQuantumModal((prev) => !prev);
      }
    };
    const handleOpenQuantumEvent = () => {
      if (isSuperBossUser(currentUser)) {
        setShowQuantumModal(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open_quantum_copilot", handleOpenQuantumEvent);

    return () => {
      window.removeEventListener("sigep_data_restored", handleDataRestored);
      window.removeEventListener("open_view", handleOpenViewEvent);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open_quantum_copilot", handleOpenQuantumEvent);
    };
  }, []);

  // Removed session invalidation effect to allow multiple concurrent logins.

  useEffect(() => {
    // Firestore Subscriptions - Optimized: Only subscribe to essentials initially
    const handleSubError = (err: any, col: string) => {
      const errStr = (err?.message || String(err)).toLowerCase();
      const errCode = err?.code || "";
      if (
        errCode === "resource-exhausted" ||
        errCode === "unavailable" ||
        errStr.includes("quota") ||
        errStr.includes("resource_exhausted") ||
        errStr.includes("resource-exhausted")
      ) {
        setIsQuotaExceeded(true);
        console.warn(
          `⚠️ Quota atingida para ${col}. Exibindo dados locais/cache.`,
        );
        return;
      }
      console.warn(
        `Erro na subscrição em ${col}:`,
        err?.message || String(err),
      );
      if (errCode === "permission-denied" || errStr.includes("permission")) {
        setErrorStates((prev) => ({
          ...prev,
          [col]: "Acesso restrito ou sem permissão.",
        }));
      }
    };

    // Core data needed for Home/Dashboard/Menu
    let unsubEvents = () => {};
    let unsubNotes = () => {};
    let unsubAccessAlerts = () => {};
    let unsubExp = () => {};
    let unsubLibraryVisits = () => {};
    let unsubLibraryBooks = () => {};
    let unsubServiceReqs = () => {};
    let unsubSuppliers = () => {};
    let unsubMatrix = () => {};
    let unsubActividades = () => {};
    let unsubColaboradores = () => {};
    let unsubChefias = () => {};
    let unsubProcessos = () => {};
    let unsubAlocacoes = () => {};
    let unsubFinancial = () => {};
    let unsubEfetivo = () => {};

    if (currentUser) {
      // Garantir credencial do Firebase para utilizadores autenticados
      ensureFirebaseAuth();

      // Basic data needed across views
      unsubMatrix = firestoreService.matrixActivities.subscribe(
        setMatrixActivities,
        (err) => handleSubError(err, "matrixActivities"),
        null,
      );
      unsubColaboradores = firestoreService.colaboradores.subscribe(
        (data: any[]) => {
          setRawColaboradores(data);
        },
        (err) => handleSubError(err, "colaboradores"),
        null,
      );
      unsubChefias = firestoreService.colaboradoresChefia.subscribe(
        (data: any[]) => {
          setRawChefiaColaboradores(data);
        },
        (err) => handleSubError(err, "colaboradoresChefia"),
        null,
      );
      unsubActividades = firestoreService.actividades.subscribe(
        setActivities,
        (err) => handleSubError(err, "actividades"),
        null,
      );

      if (
        view === "dashboard" ||
        view === "menu" ||
        view === "home" ||
        view === "calendar" ||
        view === "sistema"
      ) {
        unsubEvents = firestoreService.events.subscribe(
          setEvents,
          (err) => handleSubError(err, "events"),
          "createdAt",
          100,
        );
        unsubNotes = firestoreService.notes.subscribe(
          setNotes,
          (err) => handleSubError(err, "notes"),
          "createdAt",
          50,
        );
        unsubAccessAlerts = firestoreService.accessAlerts.subscribe(
          setAccessAlerts,
          (err) => handleSubError(err, "accessAlerts"),
          "createdAt",
          20,
        );
      }

      if (view === "processos" || view === "sistema") {
        unsubProcessos = firestoreService.processos.subscribe(
          setProcessos,
          (err) => handleSubError(err, "processos"),
          "createdAt",
          100,
        );
      }

      if (
        view === "suppliers" ||
        view === "supplier_management" ||
        view === "supplier_form" ||
        view === "dashboard" ||
        view === "sistema"
      ) {
        unsubSuppliers = firestoreService.suppliers.subscribe(
          setSuppliers,
          (err) => handleSubError(err, "suppliers"),
        );
      }

      if (view === "expediente" || view === "sistema") {
        unsubExp = firestoreService.expedientes.subscribe(
          setExpedientes,
          (err) => handleSubError(err, "expedientes"),
          "dataChegada",
          100,
        );
      }

      if (view === "service_requests" || view === "sistema") {
        unsubServiceReqs = firestoreService.serviceRequests.subscribe(
          setServiceRequests,
          (err) => handleSubError(err, "serviceRequests"),
          "createdAt",
          50,
        );
      }

      if (view === "alocacoes" || view === "sistema") {
        unsubAlocacoes = firestoreService.alocacoes_docentes.subscribe(
          setAlocacoes,
          (err) => handleSubError(err, "alocacoes_docentes"),
        );
      }

      if (view === "financial" || view === "sistema") {
        unsubFinancial = firestoreService.financialData.subscribe(
          setFinancialData,
          (err) => handleSubError(err, "financialData"),
        );
      }

      if (view === "efetivo" || view === "sistema") {
        unsubEfetivo = firestoreService.efetivo_escolar.subscribe(
          setEfetivoEscolar,
          (err) => handleSubError(err, "efetivo_escolar"),
        );
      }

      if (
        view === "library_visit" ||
        view === "visitor_services" ||
        view === "visitor_welcome" ||
        view === "library_management" ||
        view === "sistema"
      ) {
        unsubLibraryVisits = firestoreService.libraryVisits.subscribe(
          setLibraryRegistrations,
          (err) => handleSubError(err, "libraryVisits"),
          "createdAt",
          100,
        );
        unsubLibraryBooks = firestoreService.libraryBooks.subscribe(
          setBookRegistrations,
          (err) => handleSubError(err, "libraryBooks"),
          "createdAt",
          100,
        );
      }
    }

    let unsubMessages = () => {};
    if (currentUser?.id && (view === "dashboard" || view === "menu")) {
      unsubMessages = firestoreService.messages.subscribe(
        currentUser.id,
        (msgs: any[]) => {
          const unread = msgs.filter(
            (m) => m.recipientId === currentUser.id && !m.read,
          ).length;
          setUnreadMessagesCount(unread);
        },
      );
    }

    return () => {
      [
        unsubEvents,
        unsubNotes,
        unsubExp,
        unsubLibraryVisits,
        unsubLibraryBooks,
        unsubServiceReqs,
        unsubSuppliers,
        unsubMatrix,
        unsubActividades,
        unsubColaboradores,
        unsubChefias,
        unsubProcessos,
        unsubAlocacoes,
        unsubFinancial,
        unsubEfetivo,
        unsubAccessAlerts,
      ].forEach((unsub) => unsub());
      unsubMessages();
    };
  }, [currentUser, view]);

  useEffect(() => {
    if (!currentUser || isSuperBossUser(currentUser) || !accessAlerts.length) return;

    // Filter alerts meant for this currentUser
    const unreadAlerts = accessAlerts.filter(
      (alert) => !alert.readBy?.includes(currentUser.email),
    );

    const relevantAlerts = unreadAlerts.filter((alert) => {
      const userDept = currentUser.departamento || "";
      const userDir = currentUser.direcao || "";
      const target = alert.targetSector || "";

      const isBoss =
        currentUser.name &&
        (currentUser.name.toLowerCase().includes("diretor") ||
          currentUser.name.toLowerCase().includes("chefe"));
      if (!isBoss) return false;

      return (
        isMatch(userDept, target) ||
        isMatch(userDir, target) ||
        isMatch(currentUser.name, target)
      );
    });

    if (relevantAlerts.length > 0) {
      const messages = relevantAlerts.map(
        (a) =>
          `- O Utilizador ${a.userName} tentou aceder ao seu setor (${a.targetSector}).`,
      );
      setModalMessage(
        "Um ou mais utilizadores tentaram aceder à sua área reservada sem permissão:\n\n" +
          messages.join("\n"),
      );

      // Mark as read
      relevantAlerts.forEach((alert) => {
        firestoreService.accessAlerts
          .update(alert.id, {
            readBy: [...(alert.readBy || []), currentUser.email],
          })
          .catch((err) =>
            console.error(
              "Error marking alert as read:",
              err?.message || String(err),
            ),
          );
      });
    }
  }, [accessAlerts, currentUser]);

  useEffect(() => {
    if (efetivoEscolar.length > 0) {
      const nuits = efetivoEscolar
        .map((estudante) => estudante.nuit)
        .filter(Boolean);
      console.log("NUITs recolhidos:", nuits);
    }
  }, [efetivoEscolar]);

  const handleLogin = async (userData: any) => {
    verifyAndCleanCache();
    let sessionToken = userData.currentSessionToken || localStorage.getItem("sigep_session_token");
    if (!sessionToken) {
      sessionToken = "sigep_sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 12);
    }
    localStorage.setItem("sigep_session_token", sessionToken);

    const userWithToken = { ...userData, currentSessionToken: sessionToken };
    setCurrentUser(userWithToken);
    localStorage.setItem("sigep_logged_in_user", safeJSONStringify(userWithToken));
    localStorage.setItem("sigep_user", safeJSONStringify(userWithToken));

    // Gravar telemetria de login e novo sessionToken no Firestore
    try {
      const nowIso = new Date().toISOString();
      const sessionPayload = {
        lastLoginAt: nowIso,
        lastSeenAt: nowIso,
        isOnline: true,
        currentSessionToken: sessionToken,
      };

      if (userData.id && !String(userData.id).startsWith("local_")) {
        firestoreService.users.update(userData.id, sessionPayload).catch((err: any) => {
          console.warn("Aviso silencioso ao gravar telemetria de login:", err);
        });
      } else if (userData.email || userData.nuit) {
        const usersRef = collection(db, "users");
        const q = userData.email
          ? query(usersRef, where("email", "==", String(userData.email).toLowerCase().trim()))
          : query(usersRef, where("nuit", "==", String(userData.nuit).trim()));
        getDocs(q).then((snap) => {
          if (!snap.empty) {
            updateDoc(doc(db, "users", snap.docs[0].id), sessionPayload).catch(() => {});
          }
        }).catch(() => {});
      }

      sessionStorage.setItem("session_start", nowIso);
    } catch (e: any) {
      console.error("Error tracking login:", e?.message || String(e));
    }

    setHistoryStack([]);

    // Função de redirecionamento executada após a conclusão dos 3 passos do splash de apresentação
    const proceedToDestination = () => {
      setShowLoginSplash(false);

      // Redirecionamento estrito e direto baseado na área de afetação / alocação exata do utilizador
      const assignedArea = userData.areaDeAfetacao || getUserWorkspace(userData);
      
      const isSuperBoss = isSuperBossUser(userData);
      const isInstAdminAccount = isInstitutionalAdminAccount(userData);
      const isHRBoss = isHRBossUser(userData);

      if (isSuperBoss && !userData.areaDeAfetacao) {
        setDashboardTitle("Sistema");
        setDashboardActiveItem(undefined);
        setView("dashboard");
      } else if (assignedArea && assignedArea !== "Nenhum" && assignedArea !== "-") {
        setDashboardTitle(assignedArea);
        setView("dashboard");
      } else if (isInstAdminAccount) {
        setView("admin_role_selection");
      } else if (isHRBoss) {
        setDashboardTitle("Repartição de Pessoal");
        setDashboardActiveItem("Gestão de Pessoal");
        setView("dashboard");
      } else {
        const workspace = getUserWorkspace(userData);
        if (workspace) {
          setDashboardTitle(workspace);
          setView("dashboard");
        } else {
          setView("menu");
        }
      }
    };

    // Ativar o flash de apresentação de 3 páginas (Ano -> Logótipo -> Bem-vindo com dados e barra de %)
    setPostLoginCallback(() => proceedToDestination);
    setShowLoginSplash(true);
  };

  const handleSelectAdminRoleMode = (mode: string) => {
    const targetUser = currentUser || extendedUser;
    if (!targetUser) return;

    const updatedUser = { ...targetUser, activeRoleMode: mode };
    setCurrentUser(updatedUser);
    localStorage.setItem("sigep_user", safeJSONStringify(updatedUser));
    localStorage.setItem("sigep_logged_in_user", safeJSONStringify(updatedUser));

    if (mode === "admin") {
      // Se selecionar administrador, direciona ao painel da instituição
      setDashboardTitle("Sistema");
      setDashboardActiveItem("Gestão das Instituições");
      setView("dashboard");
    } else if (mode === "chefe") {
      // Se escolher como chefe de algum setor / departamento:
      const isHRBoss = isHRBossUser(updatedUser);
      if (isHRBoss) {
        setDashboardTitle("Repartição de Pessoal");
        setDashboardActiveItem("Gestão de Pessoal");
        setView("dashboard");
      } else if (updatedUser.setoresAtribuidos && Array.isArray(updatedUser.setoresAtribuidos) && updatedUser.setoresAtribuidos.length > 1) {
        setAssignedSectorsForLogin(updatedUser.setoresAtribuidos);
        setSelectedSectorForLogin(updatedUser.setoresAtribuidos[0]);
        setDashboardTitle(updatedUser.departamento || updatedUser.direcao || "Área de Chefia");
        setView("sector_selection");
      } else {
        const workspace = getUserWorkspace(updatedUser);
        if (workspace) {
          setDashboardTitle(workspace);
          setView("dashboard");
        } else {
          setDashboardTitle(updatedUser.departamento || updatedUser.direcao || "Painel de Chefia");
          setView("dashboard");
        }
      }
    } else {
      // Se escolher como usuario normal, deve ser direcionado a areas operacionais onde foi alocado
      const isTecnico = isTechnicianUser(updatedUser);

      if (isTecnico) {
        const deptSectors = getSetoresByDepartamento(updatedUser.departamento);
        const available = (updatedUser.setoresAtribuidos && updatedUser.setoresAtribuidos.length > 0)
          ? updatedUser.setoresAtribuidos
          : (deptSectors.length > 0 ? deptSectors : [updatedUser.departamento || ""]);
        setAssignedSectorsForLogin(available);
        setDashboardTitle(updatedUser.departamento || updatedUser.direcao || "Departamento");
        setView("sector_selection");
      } else if (updatedUser.setoresAtribuidos && Array.isArray(updatedUser.setoresAtribuidos) && updatedUser.setoresAtribuidos.length > 1) {
        setAssignedSectorsForLogin(updatedUser.setoresAtribuidos);
        setSelectedSectorForLogin(updatedUser.setoresAtribuidos[0]);
        setDashboardTitle(updatedUser.departamento || updatedUser.direcao || "Área de Trabalho");
        setView("sector_selection");
      } else {
        const workspace = getUserWorkspace(updatedUser);
        if (workspace) {
          setDashboardTitle(workspace);
          setView("dashboard");
        } else {
          setView("menu");
        }
      }
    }
  };

  const handleGlobalSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      // 1. Sync Chefia Accounts
      const result = await firestoreService.syncChefiaAccounts(colaboradores);

      // 2. Migrate System Config if missing in cloud but present in local
      try {
        const cloudConfig = await firestoreService.config.get("main_config");
        if (!cloudConfig) {
          const localName = localStorage.getItem("proprietarioName");
          if (localName) {
            await firestoreService.config.set("main_config", {
              proprietarioName: localName,
              proprietarioCargo:
                localStorage.getItem("proprietarioCargo") || "",
              proprietarioPhoto:
                localStorage.getItem("proprietarioPhoto") || null,
              itEmail: localStorage.getItem("itEmail") || "",
              itWhatsapp: localStorage.getItem("itWhatsapp") || "",
              itLinkedin: localStorage.getItem("itLinkedin") || "",
              itFacebook: localStorage.getItem("itFacebook") || "",
              itWeb: localStorage.getItem("itWeb") || "",
            });
          }
        }
      } catch (e) {
        console.warn("Skip config migration during sync:", e);
      }

      // 3. Migrate Monografia if missing in cloud
      try {
        const cloudMono =
          await firestoreService.monografia.getById("main_mono");
        if (!cloudMono) {
          const localAuthor = localStorage.getItem("mono_authorName");
          if (localAuthor) {
            await firestoreService.monografia.set("main_mono", {
              authorName: localAuthor,
              monoTitle: localStorage.getItem("mono_title") || "",
              orientador: localStorage.getItem("mono_orientador") || "",
              dedicatoriaText:
                localStorage.getItem("mono_dedicatoria_v3") || "",
              agradecimentosText:
                localStorage.getItem("mono_agradecimentos") || "",
              resumoText: localStorage.getItem("mono_resumo_v3") || "",
              abstractText: localStorage.getItem("mono_abstract") || "",
              updatedAt: new Date().toISOString(),
            });
          }
        }
      } catch (e) {
        console.warn("Skip mono migration during sync:", e);
      }

      alert(
        `Sincronização concluída com sucesso!\n\n- Contas de chefia e liderança atualizadas e sincronizadas.\n- Novas contas criadas: ${result.created}\n- Contas existentes atualizadas: ${result.updated}\n- Configurações e dados da monografia sincronizados na nuvem.\n\nAgora todas as atualizações feitas por qualquer utilizador são visíveis em tempo real em ambos os links.`,
      );
    } catch (error) {
      console.error("Erro na sincronização global:", error);
      alert("Erro ao realizar a sincronização. Por favor, tente novamente.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (currentUser?.id) {
        firestoreService.users
          .update(currentUser.id, {
            isOnline: false,
          })
          .catch((e: any) => {
            console.warn("Erro ao definir status offline:", e?.message || String(e));
          });
      }
      sessionStorage.removeItem("session_start");
    } catch (e: any) {
      console.warn("Erro no logout:", e?.message || String(e));
    }

    setCurrentUser(null);
    localStorage.removeItem("sigep_current_view");
    localStorage.removeItem("sigep_logged_in_user");
    localStorage.removeItem("sigep_user");
    localStorage.removeItem("sigep_session_token");
    setSubMenuStack([]);
    setHistoryStack([]);
    setDashboardTitle("");
    setDashboardItems([]);
    setDashboardActiveItem(undefined);
    setInnerPath([]);
    setView("presentation");
  };

  const handleShowAlert = (message: string) => {
    setModalMessage(message);
  };

  const handleRegister = async (data: any) => {
    try {
      // 1. Criar Registo de utilizador para login com senha 123
      const nomeSeguro = String(data.nome || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split(" ")
        .join(".");
      const defaultEmail = `${nomeSeguro}@songo.ac.mz`;
      const emailObj = data.email || defaultEmail;

      const collabId = generateCollaboratorId(data.nome, data.nuit || "");

      const newUserLogin = {
        email: emailObj,
        nuit: data.nuit || "",
        password: "1234",
        mustChangePassword: true,
        name: data.nome,
        role:
          data.cargo === "Administrador do Sistema" ? "Administrador" : "User",
      };

      // 2. Criar Processo Individual
      const newProcesso = {
        id: `PROC-${Math.floor(Math.random() * 10000)}`,
        colaboradorId: collabId,
        colaboradorNome: data.nome,
        dataEntrada: new Date().toISOString().split("T")[0],
        status: "Pendente",
        documentos: ["Ficha de Registo", "BI"],
        unidadeOriginal: data.unidade || "",
        unidadeAtual: data.unidade || "",
        direcao: data.direcao || "",
        departamento: data.departamento || "",
        tipo: "Registo Inicial",
        resumo: `Processo de admissão - ${data.funcao || data.cargo || "Funcionário"}`,
      };

      // 3. Adicionar aos Colaboradores
      const newColaborador = {
        id: collabId,
        numeroProcesso: collabId,
        ord: colaboradores.length + 1,
        nome: data.nome,
        genero: data.genero === "Masculino" || data.genero === "M" ? "M" : "F",
        dataNascimento: data.dataNascimento,
        localNascimento: {
          pais: data.localNascimento?.pais || "",
          provincia: data.localNascimento?.provincia || "",
          distrito: data.localNascimento?.distrito || "",
        },
        nuit: data.nuit,
        numeroBI: data.numeroBI,
        nivelAcademico: data.nivelAcademico,
        areaFormacao: data.areaFormacao,
        funcao: data.funcao,
        tipoContrato: data.tipoContrato,
        tipoRelacaoContractual: data.tipoRelacaoContractual,
        email: emailObj,
        tipo: data.tipo,
        efetivo:
          data.tipoRelacaoContractual?.includes("Quadro") &&
          !data.tipoRelacaoContractual?.includes("Fora"),
        unidade: data.unidade,
        direcao: data.direcao,
        departamento: data.departamento,
        cargo: data.cargo || "",
        validado: false,
      };

      await firestoreService.processos.add(newProcesso);
      await firestoreService.colaboradores.update(collabId, newColaborador);
      await firestoreService.users.set(collabId, {
        id: collabId,
        ...newUserLogin,
      });

      // Validation logic messages
      if (data.tipo === "Docente") {
        handleShowAlert(
          "O registo do docente será validado pela Direção Académica antes de ser incluído na alocação de horários.",
        );
      } else if (data.tipo === "CTA") {
        handleShowAlert(
          "O registo do CTA será validado pelo Chefe de Repartição de Pessoal antes de ser incluído na alocação de horários.",
        );
      } else {
        handleShowAlert(
          "Registo efetuado com sucesso! Aguarde a validação institucional.",
        );
      }

      setView("login");
    } catch (err: any) {
      console.error(err?.message || String(err));
      handleShowAlert("Erro ao processar o registo. Tente novamente.");
    }
  };

  const pushCurrentToHistory = useCallback(() => {
    setHistoryStack((prev) => {
      const currentSnapshot: NavigationSnapshot = {
        view,
        dashboardTitle,
        subMenuStack: subMenuStack,
        dashboardActiveItem,
        dashboardItems: dashboardItems,
      };
      
      const last = prev[prev.length - 1];
      if (
        last &&
        last.view === currentSnapshot.view &&
        last.dashboardTitle === currentSnapshot.dashboardTitle &&
        last.subMenuStack === currentSnapshot.subMenuStack &&
        last.dashboardActiveItem === currentSnapshot.dashboardActiveItem
      ) {
        return prev;
      }
      return [...prev, currentSnapshot];
    });
    try {
      window.history.pushState({ sigepNav: true }, "");
    } catch (e) {
      // Ignore
    }
  }, [view, dashboardTitle, subMenuStack, dashboardActiveItem, dashboardItems]);

  const handleSetView = useCallback((newView: typeof view) => {
    console.log("Navegando para:", newView);
    if (newView !== view) {
      pushCurrentToHistory();
      setView(newView);
    }
  }, [view, pushCurrentToHistory]);

  const handleEventClick = () => {
    pushCurrentToHistory();
    setView("event_detail");
  };

  const handleBackFromEvent = () => {
    setSelectedEvent(null);
    goBack();
  };

  const isCourse = (title: string) => {
    const upperTitle = (title || "").toUpperCase();
    return (
      upperTitle.includes("CURSO") ||
      upperTitle.includes("ENGENHARIA") ||
      upperTitle.includes("PESQUISA") ||
      upperTitle.includes("LICENCIATURA") ||
      upperTitle.includes("MESTRADO") ||
      upperTitle.includes("PÓS-GRADUAÇÃO") ||
      upperTitle.includes("POS-GRADUAÇÃO") ||
      upperTitle.includes("DEE") ||
      upperTitle.includes("DECC") ||
      upperTitle.includes("DECM") ||
      upperTitle.includes("DEPARTAMENTO DE ENGENHARIA") ||
      upperTitle.includes("DEPARTAMENTO DE PESQUISA") ||
      upperTitle.startsWith("DEPARTAMENTO DE")
    );
  };

  const goBack = useCallback(() => {
    setDashboardActiveItem(undefined);

    if (historyStack.length > 0) {
      const prevSnapshot = historyStack[historyStack.length - 1];
      setHistoryStack((prev) => prev.slice(0, -1));

      setView(prevSnapshot.view as any);
      setDashboardTitle(prevSnapshot.dashboardTitle || "");
      setSubMenuStack(prevSnapshot.subMenuStack || []);
      setDashboardActiveItem(prevSnapshot.dashboardActiveItem);
      if (prevSnapshot.dashboardItems) {
        setDashboardItems(prevSnapshot.dashboardItems);
      }
      return;
    }

    // Fallback estrutural se a pilha de histórico estiver vazia
    if (view === "dashboard") {
      if (
        extendedUser?.setoresAtribuidos &&
        Array.isArray(extendedUser.setoresAtribuidos) &&
        extendedUser.setoresAtribuidos.length > 1
      ) {
        setView("sector_selection");
      } else if (subMenuStack.length > 0) {
        setView("submenu");
      } else {
        setView("menu");
      }
    } else if (view === "sector_selection") {
      setView("login");
    } else if (view === "submenu") {
      if (subMenuStack.length > 1) {
        setSubMenuStack((prev) => prev.slice(0, -1));
      } else {
        setSubMenuStack([]);
        setView("menu");
      }
    } else if (view === "menu") {
      setView("login");
    } else if (
      view === "login" ||
      view === "registration_form" ||
      view === "library_visit" ||
      view === "gestao_documentos" ||
      view === "monitoria" ||
      view === "colaboradores" ||
      view === "supplier_management" ||
      view === "plano_aquisicao" ||
      view === "plano_contratacao" ||
      view === "monografia" ||
      view === "economato" ||
      view === "gestao_patrimonial"
    ) {
      if (
        view === "gestao_documentos" ||
        view === "monitoria" ||
        view === "colaboradores" ||
        view === "monografia" ||
        view === "economato" ||
        view === "gestao_patrimonial"
      ) {
        if (dashboardTitle) {
          setView("dashboard");
        } else if (subMenuStack.length > 0) {
          setView("submenu");
        } else {
          setView("menu");
        }
      } else {
        setView(
          view === "supplier_management" ||
            view === "plano_aquisicao" ||
            view === "plano_contratacao"
            ? "menu"
            : "presentation",
        );
      }
    } else {
      setView("presentation");
    }
  }, [historyStack, view, subMenuStack, dashboardTitle]);

  const isAdmin = isSuperBossUser(currentUser) || isInstitutionalAdminUser(currentUser);

  const safeNavigate = (title: string, targetView: string, customDashboardTitle?: string, customDashboardActiveItem?: string) => {
    pushCurrentToHistory();
    setDashboardTitle(customDashboardTitle || title);
    if (customDashboardActiveItem) {
      setDashboardActiveItem(customDashboardActiveItem);
    } else {
      setDashboardActiveItem(undefined);
    }
    setView(targetView as any);
  };

  const openSubMenu = (
    title: string,
    items: { title: string; subItems?: { title: string }[] }[],
  ) => {
    const lower = (title || "").toLowerCase().trim();

    // 1. Verificar configuração explícita e normalizada de submódulo autônomo
    const navConfig = getMenuNavigationConfig(title);
    if (navConfig) {
      safeNavigate(title, navConfig.view, navConfig.dashboardTitle, navConfig.dashboardActiveItem);
      return;
    }

    if (title === "Painel da UGEA" || lower === "ugea" || lower === "chefe da ugea") {
      setDashboardTitle("Unidade Gestora e Executora de Aquisições");
      setDashboardActiveItem(undefined);
      setView("dashboard");
      return;
    }

    // 2. Se possuir sub-itens filhos, deve sempre abrir o submenu da hierarquia
    if (items && items.length > 0) {
      setSubMenuStack((prev) => [...prev, { title, items }]);
      setView("submenu");
      return;
    }

    // 3. Ações específicas e diretas de Planos / PESOE (somente se não tiver sub-itens e nunca para fornecedores/aquisições)
    const isPlan =
      !lower.includes("fornecedor") &&
      !lower.includes("aquisição") &&
      !lower.includes("aquisicao") &&
      !lower.includes("contratação") &&
      !lower.includes("contratacao") &&
      (
        title === "PESOE" ||
        title === "Plano de Actividade da UGEA" ||
        title === "Plano de Atividade da UGEA" ||
        lower === "gestão de planos" ||
        lower === "gestao de planos" ||
        lower === "gestão de planos e actividades" ||
        lower === "gestao de planos e actividades" ||
        lower === "plano" ||
        lower === "planos" ||
        lower === "plano setorial" ||
        lower === "plano de atividades" ||
        lower === "planos de atividades" ||
        lower === "plano de actividades" ||
        lower === "planos de actividades" ||
        lower === "plano de atividade" ||
        lower === "plano de actividade" ||
        lower === "plano do gabinete" ||
        lower === "plano individual" ||
        lower === "meu plano individual" ||
        lower === "plano da direção" ||
        lower === "plano da direccao" ||
        lower === "matriz de atividades" ||
        lower === "matriz de actividades"
      );

    if (isPlan) {
      safeNavigate(title, "plano_workflow", title, "Gestão de Planos");
      return;
    }

    // 4. Setores e Gabinetes gerais: navegação para Dashboard do setor
    setDashboardTitle(title);
    setDashboardActiveItem(title);
    setView("dashboard");
  };

  useEffect(() => {
    const handlePopState = () => {
      goBack();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [goBack]);

  const handleBreadcrumbClick = (index: number, crumbText: string) => {
    pushCurrentToHistory();
    if (crumbText === "Menu principal" || index === 0) {
      setSubMenuStack([]);
      setView("menu");
      return;
    }
    const stackIdx = subMenuStack.findIndex(
      (s) => s.title.toLowerCase() === crumbText.toLowerCase(),
    );
    if (stackIdx !== -1) {
      setSubMenuStack((prev) => prev.slice(0, stackIdx + 1));
      setView("submenu");
    }
  };

  const currentSubMenu =
    subMenuStack.length > 0 ? subMenuStack[subMenuStack.length - 1] : null;

  const filteredEvents = React.useMemo(() => {
    if (!currentUser) return events;
    if (isSuperBossUser(currentUser)) return events;
    const userInstId = currentUser.instituicaoId || activeInst?.id || "isps";
    return events.filter((e: any) => {
      const isNationalHoliday = 
        e.isNationalHoliday || 
        e.scope === "global" || 
        e.scope === "nacional" || 
        String(e.type || "").toLowerCase().includes("feriado nacional") ||
        String(e.category || "").toLowerCase().includes("feriado nacional") ||
        String(e.title || "").toLowerCase().includes("feriado nacional");

      if (isNationalHoliday) return true;

      const eventInstId = e.instituicaoId || e.institutionId || "isps";
      return eventInstId === userInstId;
    });
  }, [events, currentUser, activeInst?.id]);

  return (
    <div
      className={`h-screen w-full flex flex-col font-serif relative ${view === "home" || view === "presentation" ? "bg-[#04092b] text-white" : "bg-white text-black"}`}
    >
      <AnimatePresence mode="wait">
          {!isMinimized ? (
            <motion.div
              key="main-system"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full flex flex-col overflow-hidden"
            >
              {isQuotaExceeded && (
              <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-slate-950 px-4 py-1.5 text-center text-[10px] font-black tracking-widest flex items-center justify-center gap-2 shadow-xl animate-pulse">
                <AlertCircle size={14} />
                LIMITE DE TRÁFEGO DIÁRIO ATINGIDO. O SISTEMA ESTÁ EM MODO DE LEITURA LIMITADA.
                <button onClick={() => setIsQuotaExceeded(false)} className="ml-4 opacity-50 hover:opacity-100">
                  <X size={14} />
                </button>
              </div>
            )}

            {view !== "home" && view !== "presentation" && view !== "login" && view !== "registration_form" && view !== "library_visit" && (
              <MainHeader
                unreadMessagesCount={unreadMessagesCount}
                user={extendedUser}
                activeInst={activeInst}
                colaboradores={colaboradores}
                processos={processos}
                matrixActivities={matrixActivities}
                instituicoes={instituicoes}
                onBack={goBack}
                showBack={historyStack.length > 0 || ((view as string) !== "menu" && (view as string) !== "login" && (view as string) !== "home")}
                onBreadcrumbClick={handleBreadcrumbClick}
                onLogout={handleLogout}
                onOpenMessages={() => {
                  pushCurrentToHistory();
                  setDashboardTitle("Caixa de Mensagens");
                  setView("dashboard");
                }}
                onOpenBackup={() => setShowBackupModal(true)}
                onOpenQuantumAI={() => setShowQuantumModal(true)}
                onMinimize={() => setIsMinimized(true)}
                onSync={handleSyncData}
                onOpenRoleSelector={() => setView("admin_role_selection")}
                breadcrumb={[
                  ...(subMenuStack.length > 0 ? ["Menu principal"] : []),
                  ...(view === "submenu" ? subMenuStack.slice(0, -1).map((s) => s.title) : subMenuStack.map((s) => s.title)),
                  ...(view !== "submenu" && view !== "menu" && dashboardTitle ? [dashboardTitle] : []),
                  ...(innerPath.length > 1 ? innerPath.slice(0, -1) : []),
                ].filter(Boolean)}
                title={innerPath.length > 0 ? innerPath[innerPath.length - 1] : view === "submenu" ? (subMenuStack.length > 0 ? subMenuStack[subMenuStack.length - 1].title : "") : view === "menu" ? "Menu Principal" : dashboardTitle || "Direção"}
                actions={headerActions}
              />
            )}

            <div className={`flex-grow relative flex flex-col min-h-0 overflow-y-auto mt-0 ${(view === "dashboard" || view === "menu") ? "pb-14" : ""}`}>
          <ViewRenderer
            view={view}
            user={currentUser}
            extendedUser={extendedUser}
            dashboardTitle={dashboardTitle}
            dashboardItems={dashboardItems}
            processos={processos}
            colaboradores={colaboradores}
            events={filteredEvents}
            expedientes={expedientes}
            libraryRegistrations={libraryRegistrations}
            bookRegistrations={bookRegistrations}
            notes={notes}
            goBack={goBack}
            onLogout={handleLogout}
            openSubMenu={openSubMenu}
            currentSubMenu={currentSubMenu}
            onShowAlert={handleShowAlert}
            onSetView={handleSetView}
            matrixActivities={matrixActivities}
            activities={activities}
            suppliers={suppliers}
            dashboardActiveItem={dashboardActiveItem}
            setInnerPath={setInnerPath}
            setDashboardTitle={setDashboardTitle}
            financialData={financialData}
            setFinancialData={setFinancialData}
            onNavigate={(title, items) => {
              openSubMenu(title, items || []);
            }}
            onUpdateEvent={(id, data) => firestoreService.events.update(id, data)}
            onDeleteEvent={(id) => firestoreService.events.delete(id)}
            onDeleteExpediente={(id) => firestoreService.expedientes.delete(id)}
            onDeleteBook={(id) => firestoreService.libraryVisits.delete(id)}
            onDeleteNote={(id) => firestoreService.notes.delete(id)}
            onUpdateUser={(id, data) => firestoreService.users.update(id, data)}
            onAddMatrixActivity={(activity: any) => {
              setMatrixActivities((prev) => {
                if (prev.some((a) => a.id === activity.id)) {
                  return prev.map((a) => (a.id === activity.id ? activity : a));
                }
                return [activity, ...prev];
              });
            }}
            onUpdateMatrixActivity={(id: string, data: any) => {
              setMatrixActivities((prev) =>
                prev.map((a) => (a.id === id ? { ...a, ...data } : a))
              );
            }}
            onLogin={handleLogin}
            onSelectAdminRoleMode={handleSelectAdminRoleMode}
            onSelectSector={handleSelectSector}
          />
            </div>

            {/* Rodapé Institucional com Logotipo SIGEP - FIXO E SÓ DISPONÍVEL NA ÁREA DE TRABALHO */}
            {(view === "dashboard" || view === "menu") && (
              <footer
                onClick={() => setShowFooterInfoModal(true)}
                className="fixed bottom-0 left-0 right-0 w-full bg-[#050B35] border-t-2 border-[#FFD700] py-2 overflow-hidden z-[40] flex items-center justify-center select-none shadow-[inset_0_0_20px_rgba(255,215,0,0.25)] cursor-pointer hover:bg-[#080F42] transition-colors group print:hidden"
                title={currentLang === "en" ? "Click to view version and copyright info" : "Clique para ver os detalhes da versão e informações de copyright"}
              >
                <div className="flex items-center justify-center gap-12">
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="flex items-center gap-6 shrink-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 shrink-0">
                          <SigepLogo size="xs" showText={false} className="!w-5 !h-5" />
                        </div>
                        <span 
                          className="text-[10px] font-black tracking-widest uppercase"
                          style={{ 
                            color: "#FFD700",
                            textShadow: "1px 1px 0px #000000",
                          }}
                        >
                          {currentLang === "en"
                            ? "SIGEP - Integrated Process Management System"
                            : "SIGEP - Sistema Integrado de Gestão de processo"}
                        </span>
                      </div>

                      {/* Separador vertical sólido */}
                      <span className="h-4 w-[2px] bg-[#FFD700] shrink-0"></span>

                      <span
                        className="text-[9px] font-black uppercase tracking-widest shrink-0"
                        style={{ 
                          color: "#FFD700",
                          textShadow: "1px 1px 0px #000000",
                        }}
                      >
                        {currentLang === "en"
                          ? "Developed by Slaiter Tripas"
                          : "Desenvolvido por Slaiter Tripas"}
                      </span>

                      {/* Separador vertical sólido */}
                      <span className="h-4 w-[2px] bg-[#FFD700] shrink-0"></span>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className="text-[9px] font-black uppercase tracking-widest"
                          style={{ 
                            color: "#FFD700",
                            textShadow: "1px 1px 0px #000000",
                          }}
                        >
                          {currentLang === "en"
                            ? "Quantum Version 2026.9.1"
                            : "Versão 2026.9.1 Quântica"}
                        </span>
                        <FirebaseStatusIndicator />
                      </div>

                      {/* Separador de transição sólido */}
                      <span className="text-[#FFD700] text-xs font-black px-2 shrink-0">✦</span>
                    </div>
                  ))}
                </div>
              </footer>
            )}
          </motion.div>
        ) : (
          <div className="fixed inset-0 z-[10000] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-slate-100">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-[#FFB800] text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-[#121c60] text-[#FFB800] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <div className="w-6 h-6 bg-[#FFB800] rounded-md animate-pulse"></div>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 font-black text-[10px] uppercase tracking-widest rounded-full mb-3">
                Sistema Minimizado
              </span>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                Ecrã Minimizado
              </h3>
              <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6">
                A aplicação SIGEP está em modo minimizado. Clique no botão abaixo para restaurar a visualização completa do sistema.
              </p>
              <button
                onClick={() => setIsMinimized(false)}
                className="w-full py-3.5 px-6 bg-[#121c60] hover:bg-[#1b2880] text-[#FFB800] rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl border border-[#FFB800]/40 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Restaurar Ecrã Completo</span>
                <div className="w-2 h-2 bg-[#00FF00] rounded-full animate-pulse shadow-[0_0_8px_#00FF00]"></div>
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

        <AlertModal isOpen={!!modalMessage} onClose={() => setModalMessage("")} message={modalMessage} />
        <BackupRestoreModal isOpen={showBackupModal} onClose={() => setShowBackupModal(false)} />
        <FooterInfoModal isOpen={showFooterInfoModal} onClose={() => setShowFooterInfoModal(false)} />
        {showDiagnosticPanel && <DiagnosticPanel onClose={() => setShowDiagnosticPanel(false)} />}
        
        {/* Flash de Apresentação Pós-Login removido */}
        
        {sessionTerminatedNotice && (
          <div className="fixed inset-0 z-[999999] bg-[#0c1236]/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-red-500/30 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 shadow-inner border border-red-100">
                <ShieldAlert size={36} strokeWidth={2.2} />
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-800 font-black text-[10px] uppercase tracking-widest rounded-full mb-3">
                Sessão Concorrente Detectada
              </span>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                Sessão Encerrada Noutro Dispositivo
              </h3>
              <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6">
                {sessionTerminatedNotice}
              </p>
              <button
                onClick={() => setSessionTerminatedNotice(null)}
                className="w-full py-3.5 px-6 bg-[#121c60] hover:bg-[#1a298a] active:scale-95 text-[#FFB800] font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all border border-[#FFB800]/40"
              >
                Compreendido / Ir para o Login
              </button>
            </div>
          </div>
        )}
        {backupAlert && (
          <div className="fixed top-5 right-5 z-[99999] bg-[#121c60] text-white border-2 border-[#FFB800] p-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md animate-bounce">
            <div className="p-2.5 bg-[#FFB800] text-[#121c60] rounded-xl font-bold shrink-0 shadow-md"><Database size={20} /></div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black text-[#FFB800] tracking-widest block mb-0.5">Notificação do Backup</span>
              <p className="text-xs font-bold leading-tight text-white/95">{backupAlert.message}</p>
            </div>
            <button onClick={() => setBackupAlert(null)} className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"><X size={18} /></button>
          </div>
        )}

        {/* Overlay de Alertas do Sistema */}
        <div className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-3 max-w-sm">
          <AnimatePresence>
            {systemAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                className={`p-4 rounded-2xl shadow-2xl border-2 flex items-start gap-3 ${
                  alert.type === "critical" ? "bg-red-600 border-red-400 text-white" :
                  alert.type === "warning" ? "bg-amber-500 border-amber-300 text-slate-900" :
                  alert.type === "holiday" ? "bg-indigo-600 border-indigo-400 text-white" :
                  "bg-blue-600 border-blue-400 text-white"
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${
                  alert.type === "critical" ? "bg-red-700" :
                  alert.type === "warning" ? "bg-amber-600" :
                  alert.type === "holiday" ? "bg-indigo-700" :
                  "bg-blue-700"
                }`}>
                  {alert.type === "critical" ? <ShieldAlert size={20} /> : 
                   alert.type === "warning" ? <AlertTriangle size={20} /> :
                   alert.type === "holiday" ? <Calendar size={20} /> :
                   <Bell size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80 block mb-0.5">
                    {alert.type === "holiday" ? "Feriado / Data Especial" : "Alerta do Sistema"}
                  </span>
                  <h4 className="font-bold text-sm leading-tight mb-1">{alert.title}</h4>
                  <p className="text-xs opacity-90 leading-relaxed">{alert.message}</p>
                </div>
                <button 
                  onClick={() => {
                    const newDismissed = [...dismissedAlerts, alert.id];
                    setDismissedAlerts(newDismissed);
                    localStorage.setItem("sigep_dismissed_alerts", JSON.stringify(newDismissed));
                    setSystemAlerts(prev => prev.filter(a => a.id !== alert.id));
                  }}
                  className="opacity-50 hover:opacity-100 p-1"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Overlay de Notificações Internas (Institucionais) */}
        <div className="fixed top-24 right-5 z-[99999] flex flex-col gap-3 max-w-sm pointer-events-none">
          <AnimatePresence>
            {userNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                className="pointer-events-auto p-4 rounded-2xl shadow-2xl border-2 bg-white border-blue-100 flex items-start gap-3"
              >
                <div className={`p-2 rounded-xl shrink-0 ${
                  notif.type === "activity" ? "bg-amber-100 text-amber-600" :
                  notif.type === "document" ? "bg-emerald-100 text-emerald-600" :
                  "bg-blue-100 text-blue-600"
                }`}>
                  {notif.type === "activity" ? <Clock size={20} /> : 
                   notif.type === "document" ? <FileText size={20} /> :
                   <Bell size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
                    {notif.type === "activity" ? "Nova Atividade" : 
                     notif.type === "document" ? "Documento Pendente" : "Notificação"}
                  </span>
                  <h4 className="font-bold text-sm leading-tight mb-1 text-slate-800">{notif.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                </div>
                <button 
                  onClick={() => firestoreService.notifications.update(notif.id, { read: true })}
                  className="text-slate-300 hover:text-slate-600 p-1"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <ActiveAlertsDisplay />
        <ReminderNotificationManager currentUser={currentUser} />
      </div>
    );
  }

