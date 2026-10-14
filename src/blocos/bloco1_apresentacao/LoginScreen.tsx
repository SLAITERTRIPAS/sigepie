import React, { useState, useEffect } from "react";
import {
  X,
  Maximize2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  FileText,
  Calendar,
  Building2,
  Clock,
  Coins,
  Target,
  Tag,
  Info,
  Printer,
  BookOpen,
  RotateCcw,
  Key,
  Globe,
} from "lucide-react";
import SobreSistemaView from "../bloco5_sistema/SobreSistemaView";
import { ProcessingCircle } from "../../components/ui/ProcessingCircle";
import {
  withTimeout,
  normalize as n,
  generateCollaboratorId,
  safeJSONStringify,
  safeJSONParse,
} from "../../lib/utils";
import { setLanguagePreference, getCurrentLanguage, Language } from "../../lib/i18n";
import { EFETIVO_GERAL_DATA } from "../../constants/colaboradoresList";
import { printElementById } from "../../lib/printUtils";
import RegistarFuncionarioForm from "../bloco8_gerais/RegistarFuncionarioForm";
import { PasswordRecoveryModal } from "../../components/PasswordRecoveryModal";
import { holidays2026 } from "../../constants/holidays";
import { auth, db } from "../../lib/firebase";
import { signInAnonymously } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  limit,
  serverTimestamp,
  setDoc,
  clearIndexedDbPersistence,
  terminate,
} from "firebase/firestore";
import { firestoreService } from "../../lib/firestoreService";
import { getSystemLogo } from "../../lib/logoService";
import { SigepLogo } from "../../components/SigepLogo";

// Pre-process baseline for O(1) lookups
const EFETIVO_MAP = new Map();
EFETIVO_GERAL_DATA.forEach((c) => {
  if (c.email) EFETIVO_MAP.set(n(c.email), c);
  if (c.nuit) EFETIVO_MAP.set(n(c.nuit), c);
  const genId =
    (c as any).id || generateCollaboratorId(c.nome || "", c.nuit || "");
  if (genId) EFETIVO_MAP.set(n(genId), c);
});

/**
 * Converte um valor (Timestamp Firestore, String ISO ou Date) para objeto Date de forma segura.
 */
const getTimestampDate = (val: any): Date => {
  if (!val) return new Date(0);
  if (val instanceof Date) return val;
  if (typeof val.toDate === "function") return val.toDate();
  if (val.seconds !== undefined) return new Date(val.seconds * 1000);
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date(0) : d;
  } catch {
    return new Date(0);
  }
};

// Helper for local user caching during quota/network constraints
const saveUserToCache = (userData: any) => {
  try {
    const cache = safeJSONParse<any[]>(
      localStorage.getItem("sigep_users_cache"),
      [],
    );
    const emailNorm = (userData.email || "").toLowerCase().trim();
    const idNorm = String(userData.id || "")
      .toLowerCase()
      .trim();
    const nuitNorm = String(userData.nuit || "")
      .toLowerCase()
      .trim();

    const filtered = cache.filter((u: any) => {
      const uEmail = (u.email || "").toLowerCase().trim();
      const uId = String(u.id || "")
        .toLowerCase()
        .trim();
      const uNuit = String(u.nuit || "")
        .toLowerCase()
        .trim();
      if (emailNorm && uEmail === emailNorm) return false;
      if (idNorm && uId === idNorm) return false;
      if (nuitNorm && uNuit === nuitNorm) return false;
      return true;
    });

    filtered.push(userData);
    localStorage.setItem("sigep_users_cache", safeJSONStringify(filtered));
  } catch (e) {
    console.warn("Não foi possível guardar no cache local:", e);
  }
};

const findLocalUser = (lowerInput: string, inputPass?: string) => {
  const normInput = n(lowerInput);
  if (!normInput) return null;

  // 1. Procurar no cache local
  try {
    const cache = safeJSONParse<any[]>(
      localStorage.getItem("sigep_users_cache"),
      [],
    );
    const found = cache.find((u: any) => {
      const eMatch = u.email && n(u.email) === normInput;
      const nMatch = u.nuit && n(u.nuit) === normInput;
      const idMatch = u.id && n(String(u.id)) === normInput;
      const uMatch = u.usuario && n(u.usuario) === normInput;
      const estMatch = u.numeroEstudante && n(u.numeroEstudante) === normInput;
      return eMatch || nMatch || idMatch || uMatch || estMatch;
    });
    if (found) return found;
  } catch (e) {}

  // 2. Procurar no último utilizador autenticado
  try {
    const stored = safeJSONParse<any>(
      localStorage.getItem("sigep_logged_in_user"),
      null,
    );
    if (stored && (stored.email || stored.nuit || stored.id)) {
      const eMatch = stored.email && n(stored.email) === normInput;
      const nMatch = stored.nuit && n(stored.nuit) === normInput;
      const idMatch = stored.id && n(String(stored.id)) === normInput;
      const uMatch = stored.usuario && n(stored.usuario) === normInput;
      if (eMatch || nMatch || idMatch || uMatch) return stored;
    }
  } catch (e) {}

  // 3. Fallback para Administrador do Sistema (SLAITER TRIPAS)
  if (
    normInput === "slaitertripas@gmail.com" ||
    normInput === "st849547771" ||
    normInput === "slaiter tripas" ||
    normInput === "admin@songo.ac.mz" ||
    normInput === "admin"
  ) {
    return {
      id: "ST849547771",
      uid: "ST849547771",
      email: "slaitertripas@gmail.com",
      usuario: "slaitertripas@gmail.com",
      name: "SLAITER TRIPAS",
      nome: "SLAITER TRIPAS",
      designacao: "SLAITER TRIPAS",
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
      password: "231383ft",
      mustChangePassword: false,
    };
  }

  // 4. Procurar na lista estática EFETIVO_MAP
  const generalCol = EFETIVO_MAP.get(normInput);
  if (generalCol) {
    return {
      id:
        (generalCol as any).id ||
        generateCollaboratorId(generalCol.nome || "", generalCol.nuit || ""),
      name: generalCol.nome,
      nome: generalCol.nome,
      email: (
        generalCol.email ||
        `${generalCol.nome.toLowerCase().split(" ").join(".")}@songo.ac.mz`
      ).toLowerCase(),
      nuit: generalCol.nuit,
      role: generalCol.tipo === "Docente" ? "Docente" : "CTA",
      unidade: generalCol.unidade || "",
      direcao: (generalCol as any).direcao || "",
      departamento: (generalCol as any).departamento || "",
      reparticao: (generalCol as any).reparticao || "",
      cargo: generalCol.cargo || "",
      status: generalCol.status || "Ativo",
      areaDeAfetacao: (generalCol as any).areaDeAfetacao || "",
      isFirstAccess: true,
    };
  }

  return null;
};

export default function LoginScreen({
  onClose,
  onLogin,
  onRegisterClick,
  events,
}: {
  onClose: () => void;
  onLogin: (user: any) => void;
  onRegisterClick: () => void;
  events: any[];
}) {
  const [view, setView] = useState<"presentation" | "login" | "create_password">("login");
  const [showSobreSistemaModal, setShowSobreSistemaModal] = useState(false);
  const [systemLogo, setSystemLogo] = useState<string | null>(() => getSystemLogo());

  useEffect(() => {
    const handleLogoUpdate = (e: any) => {
      setSystemLogo(e?.detail?.logo !== undefined ? e.detail.logo : getSystemLogo());
    };
    window.addEventListener("sigep_system_logo_updated", handleLogoUpdate);

    let unsub: (() => void) | undefined;
    try {
      unsub = firestoreService.config.subscribe("main_config", (data) => {
        if (data && data.systemLogo !== undefined) {
          setSystemLogo(data.systemLogo || null);
        }
      });
    } catch (e) {
      // Ignorar falha silenciosamente
    }

    return () => {
      window.removeEventListener("sigep_system_logo_updated", handleLogoUpdate);
      if (unsub) unsub();
    };
  }, []);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loginLanguage, setLoginLanguage] = useState<Language>(() => getCurrentLanguage());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showContactAdmin, setShowContactAdmin] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactId, setContactId] = useState("");
  const [contactText, setContactText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [requestReset, setRequestReset] = useState(false);
  const [showPasswordRecoveryModal, setShowPasswordRecoveryModal] = useState(false);

  const handleRequestReset = async () => {
    if (!identifier) {
      setError("Por favor, insira o seu identificador (email/nuit) para solicitar a redefinição.");
      return;
    }
    setLoading(true);
    try {
      await firestoreService.password_reset_requests.add({
        identifier: identifier,
        status: "Pendente",
        timestamp: new Date(),
      });
      setSuccess("Pedido de redefinição enviado com sucesso. Aguarde a notificação do Administrador.");
      setRequestReset(false);
    } catch (e) {
      setError("Erro ao enviar pedido.");
    } finally {
      setLoading(false);
    }
  };

  // Recover State
  const [recoverNuit, setRecoverNuit] = useState("");

  // Reset State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [dbEstudantes, setDbEstudantes] = useState<any[]>([]);

  // Subscrição de Actividades e Eventos da Base de Dados
  const [dbActivities, setDbActivities] = useState<any[]>([]);
  const [dbCalendarEvents, setDbCalendarEvents] = useState<any[]>([]);
  const [dbInstituicoes, setDbInstituicoes] = useState<any[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>(() => {
    return localStorage.getItem("sigep_active_instituicao") || "";
  });
  const [selectedEventDetail, setSelectedEventDetail] = useState<any | null>(null);

  const currentInst = React.useMemo(() => {
    if (selectedInstId && selectedInstId !== "all" && selectedInstId !== "geral") {
      const found = dbInstituicoes.find((i) => i.id === selectedInstId);
      if (found) return found;
      if (selectedInstId === "isps") {
        return {
          id: "isps",
          nome: "Instituto Superior Politécnico de Songo (ISPS)",
          logo: getSystemLogo() || "/sigep-logo.svg",
          backgroundImage: "https://lh3.googleusercontent.com/d/1Xasp7NB08GDtIE2VEwf-O5iycCdDJKg1"
        };
      }
    }
    return null;
  }, [dbInstituicoes, selectedInstId]);

  useEffect(() => {
    let unsub: any;
    let unsubActs: any;
    let unsubEvents: any;
    let unsubInsts: any;

    const authUnsub = auth.onAuthStateChanged((user) => {
    });
    try {
      unsubEvents = firestoreService.events.subscribe((data: any[]) => {
        if (data && data.length > 0) {
          setDbCalendarEvents(data);
        }
      });
    } catch (e) {
      console.warn("Aviso ao subscrever actividades no LoginScreen:", e);
    }

    try {
      unsubInsts = firestoreService.instituicoes.subscribe((data: any[]) => {
        if (data) {
          setDbInstituicoes(data);
        }
      });
    } catch (e) {
      console.warn("Aviso ao subscrever instituições no LoginScreen:", e);
    }

    try {
      const cached = localStorage.getItem("sigep_matrix_activities_login_cache") || localStorage.getItem("sigep_matrix_activities");
      if (cached) {
        setDbActivities((prev) => (prev.length === 0 ? JSON.parse(cached) : prev));
      }
    } catch (e) {}

    return () => {
      authUnsub();
      if (unsub) unsub();
      if (unsubActs) unsubActs();
      if (unsubEvents) unsubEvents();
    };
  }, []);

  const allFutureEvents = React.useMemo(() => {
    const DEFAULT_SYSTEM_DEADLINES = [
      {
        id: "praz-1",
        title: "Publicação do Plano Institucional Aprovado (PESOE)",
        date: "2026-09-08",
        type: "Publicação de Plano",
        setor: "Conselho de Representantes / DPEP",
        referencia: "PESOE-2026",
      },
      {
        id: "praz-2",
        title: "Início do Ciclo de Execução de Actividades do Mês",
        date: "2026-09-10",
        type: "Execução Mensal",
        setor: "Todas as Direções e Setores",
        referencia: "EXEC-MÊS",
      },
      {
        id: "praz-3",
        title: "Prazo de Submissão de Ajustamentos ao Plano",
        date: "2026-09-15",
        type: "Prazo Definido",
        setor: "Setores e Unidades Orgânicas",
        referencia: "PRAZO-AJUSTE",
      },
      {
        id: "praz-4",
        title: "Prazo de Apresentação de Relatório de Monitoria Mensal",
        date: "2026-09-30",
        type: "Prazo Definido",
        setor: "Setor de Monitoria",
        referencia: "REL-MONITORIA",
      },
    ];

    const mappedActivities = dbActivities
      .filter((act) => act && (act.title || act.actividade || act.nome))
      .map((act, index) => ({
        id: act.id || `act-login-${index}`,
        title: act.title || act.actividade || act.nome,
        date: act.dataRealizacao || act.data || act.dataInicio,
        mes: act.mes || act.dataMes,
        type: "Actividade a Executar",
        setor: act.setor || act.departamento || act.unidade || "Setor Responsável",
        referencia: act.referencia || act.codigo || `ACT-${index + 1}`,
      }));

    const sanitizedCalendarEvents = dbCalendarEvents.map((evt) => {
      const isCyclePeriod =
        evt.isPlanningPeriodEvent ||
        /período oficial|ciclo|abertura|fechamento|planificação/i.test(evt.title || "");
      if (isCyclePeriod && (evt.type === "Feriado Institucional" || !evt.type)) {
        return { ...evt, type: "Início e Fechamento de Actividade" };
      }
      return evt;
    });

    const rawList = [
      ...events,
      ...sanitizedCalendarEvents,
      ...holidays2026,
      ...DEFAULT_SYSTEM_DEADLINES,
      ...mappedActivities,
    ];

    const parseToDate = (dateVal: any, mesVal?: string): Date | null => {
      if (dateVal) {
        if (dateVal instanceof Date) return dateVal;
        if (typeof dateVal === "string" && dateVal.trim() !== "") {
          const trimmed = dateVal.trim();
          if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
            const [y, m, d] = trimmed.split("-").map(Number);
            return new Date(y, m - 1, d);
          }
          if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(trimmed)) {
            const [d, m, y] = trimmed.split("/").map(Number);
            return new Date(y, m - 1, d);
          }
        }
      }
      if (mesVal && typeof mesVal === "string") {
        const monthsPt = [
          "janeiro", "fevereiro", "março", "marco", "abril", "maio", "junho",
          "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
        ];
        const cleanMes = mesVal.toLowerCase().replace(/[^a-z]/g, "");
        const mIdx = monthsPt.findIndex((m) => cleanMes.includes(m));
        if (mIdx !== -1) {
          const currentYear = new Date().getFullYear();
          return new Date(currentYear, mIdx, 10);
        }
      }
      return null;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filterAndFormat = (eventList: any[]) => {
      return eventList
        .map((e) => {
          const eDate = parseToDate(e.date || e.dataRealizacao, e.mes);
          if (!eDate) return null;
          eDate.setHours(0, 0, 0, 0);

          const diffTime = eDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const dateStr = `${String(eDate.getDate()).padStart(2, "0")}/${String(eDate.getMonth() + 1).padStart(2, "0")}/${eDate.getFullYear()}`;

          return { ...e, diffDays, displayDate: dateStr, dateObj: eDate };
        })
        .filter((e): e is NonNullable<typeof e> => {
          if (!e) return false;
          // Mostra apenas itens no futuro ou hoje (diffDays >= 0)
          return e.diffDays >= 0;
        })
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    };

    const formattedAll = filterAndFormat(rawList);

    // Filtrar especificamente para a janela de apresentação de 7 dias (0 a 7 dias antes da execução)
    const activeIn7Days = formattedAll.filter((e) => e.diffDays <= 7);
    const targetList = activeIn7Days.length > 0 ? activeIn7Days : formattedAll.slice(0, 10);

    const prazosEPublicacoes = targetList.filter(
      (e) =>
        e.type === "Publicação de Plano" ||
        e.type === "Prazo Definido" ||
        e.type === "Execução Mensal" ||
        e.type === "Prazo" ||
        e.type === "Início e Fechamento de Actividades" ||
        e.type === "Início e Fechamento de Actividade",
    );

    const actividadesAExecutar = targetList.filter(
      (e) => e.type === "Actividade a Executar" || e.type === "Actividade Aprovada",
    );

    const comemorativas = targetList.filter(
      (e) => e.type === "Data Comemorativa",
    );

    const feriadosNacionais = targetList.filter(
      (e) => e.type === "Feriado Nacional",
    );

    const feriadosInstitucionais = targetList.filter(
      (e) =>
        e.type === "Feriado Institucional" &&
        !e.isPlanningPeriodEvent &&
        !/período oficial|ciclo|abertura|fechamento/i.test(e.title || ""),
    );

    return {
      prazosEPublicacoes,
      actividadesAExecutar,
      comemorativas,
      feriadosNacionais,
      feriadosInstitucionais,
      all: targetList,
    };
  }, [events, dbCalendarEvents, dbActivities]);

  const {
    prazosEPublicacoes,
    actividadesAExecutar,
    comemorativas,
    feriadosNacionais,
    feriadosInstitucionais,
    all: allFutureEventsList,
  } = allFutureEvents;

  const closestEventId =
    allFutureEventsList.length > 0 ? allFutureEventsList[0].id : null;

  const renderEvent = (e: any) => {
    const isClosest = e.id === closestEventId || e.diffDays <= 7;
    const isToday = e.diffDays === 0;

    return (
      <div
        key={e.id}
        onClick={() => setSelectedEventDetail(e)}
        className={`flex justify-between items-start text-xs py-2 px-2.5 rounded-xl transition-all cursor-pointer hover:bg-white/20 hover:scale-[1.01] active:scale-[0.99] border-b border-white/10 last:border-0 ${isClosest ? "font-bold bg-white/10 shadow-sm" : "opacity-85 hover:opacity-100"}`}
        title="Clique para ver todos os detalhes do evento/publicação"
      >
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`font-semibold ${isClosest ? "rgb-blink" : "text-white"}`}>
              {e.title}
            </span>
            {e.referencia && (
              <span className="text-[9px] font-mono bg-blue-900/80 border border-blue-400/40 px-1.5 py-0.5 rounded text-blue-200">
                {e.referencia}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[10px] opacity-80">
            <span>{e.displayDate}</span>
            {e.setor && <span className="text-blue-200 font-medium">&bull; {e.setor}</span>}
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end">
          {isToday ? (
            <div className="text-[9px] font-black tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded whitespace-nowrap animate-pulse shadow-md">
              Hoje em Execução!
            </div>
          ) : e.diffDays <= 7 ? (
            <div className="text-[9px] font-black tracking-wider bg-white text-[#1e1e96] px-2 py-0.5 rounded whitespace-nowrap animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]">
              Faltam {e.diffDays} dia{e.diffDays !== 1 ? "s" : ""}
            </div>
          ) : (
            <div className="text-[9px] font-medium opacity-70 bg-white/10 px-1.5 py-0.5 rounded">
              Em breve
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    let localVersion: any = null;

    const sanitizedIdentifier = String(identifier || "").replace(/\s+/g, " ").trim();
    const lowerInput = sanitizedIdentifier.toLowerCase();
    const upperInput = sanitizedIdentifier.toUpperCase();
    const exactInput = sanitizedIdentifier;
    const normInput = n(lowerInput);

    try {
      // 1. Tentar autenticação anónima com tratamento silencioso de erro
      try {
        if (!auth.currentUser) {
          await withTimeout(signInAnonymously(auth), 4000);
        }
      } catch (authErr) {
        console.warn("Aviso na autenticação anónima (quota/rede):", authErr);
      }

      let user: any = null;
      let matchedDoc: any = null;
      let isQuotaError = false;

      // 2. Tentar consulta no Firestore
      try {
        const usersRef = collection(db, "users");
        const colRef = collection(db, "colaboradores");
        const estRef = collection(db, "efetivo_escolar");

        const isEmail = lowerInput.includes("@");
        const isNumeric = /^\d+$/.test(lowerInput);
        const numericInput = isNumeric ? Number(lowerInput) : null;

        // Otimização de consultas: Dispara apenas as consultas estritamente necessárias conforme o tipo de entrada
        const pEmail = isEmail 
          ? getDocs(query(usersRef, where("email", "==", String(lowerInput))))
          : Promise.resolve({ docs: [] });

        const pNuit = (isNumeric && !isEmail)
          ? getDocs(query(usersRef, where("nuit", "==", String(lowerInput))))
          : Promise.resolve({ docs: [] });

        const pId = (!isEmail && !isNumeric)
          ? getDocs(query(usersRef, where("id", "==", String(lowerInput))))
          : Promise.resolve({ docs: [] });

        const pIdUpper = (!isEmail && !isNumeric)
          ? getDocs(query(usersRef, where("id", "==", String(upperInput))))
          : Promise.resolve({ docs: [] });

        const pIdExact = (!isEmail && !isNumeric)
          ? getDocs(query(usersRef, where("id", "==", String(exactInput))))
          : Promise.resolve({ docs: [] });

        const pUsuario = (!isEmail && !isNumeric)
          ? getDocs(query(usersRef, where("usuario", "==", String(lowerInput))))
          : Promise.resolve({ docs: [] });

        const pColEmail = isEmail
          ? getDocs(query(colRef, where("email", "==", String(lowerInput))))
          : Promise.resolve({ docs: [] });

        const pColNuit = (isNumeric && !isEmail)
          ? getDocs(query(colRef, where("nuit", "==", String(lowerInput))))
          : Promise.resolve({ docs: [] });

        const pColId = (!isEmail && !isNumeric)
          ? getDocs(query(colRef, where("id", "==", String(lowerInput))))
          : Promise.resolve({ docs: [] });

        const pEstId = Promise.resolve({ docs: [] });
        const pEstNuit = Promise.resolve({ docs: [] });

        const pNuitNum = (numericInput !== null && !isEmail)
          ? getDocs(query(usersRef, where("nuit", "==", numericInput)))
          : Promise.resolve({ docs: [] });

        const pColNuitNum = (numericInput !== null && !isEmail)
          ? getDocs(query(colRef, where("nuit", "==", numericInput)))
          : Promise.resolve({ docs: [] });

        const pEstNuitNum = Promise.resolve({ docs: [] });

        const [
          snapEmail,
          snapNuit,
          snapId,
          snapIdUpper,
          snapIdExact,
          snapUsuario,
          snapColEmail,
          snapColNuit,
          snapColId,
          snapEstId,
          snapEstNuit,
          snapNuitNum,
          snapColNuitNum,
          snapEstNuitNum,
        ] = await withTimeout(
          Promise.all([
            pEmail,
            pNuit,
            pId,
            pIdUpper,
            pIdExact,
            pUsuario,
            pColEmail,
            pColNuit,
            pColId,
            pEstId,
            pEstNuit,
            pNuitNum,
            pColNuitNum,
            pEstNuitNum,
          ]),
          10000,
        );

        let allMatchedDocs = [
          ...snapEmail.docs,
          ...snapNuit.docs,
          ...snapId.docs,
          ...snapIdUpper.docs,
          ...snapIdExact.docs,
          ...snapUsuario.docs,
          ...(snapNuitNum ? snapNuitNum.docs : []),
        ];

        if (allMatchedDocs.length === 0) {
          try {
            let directDoc = await firestoreService.users.getById(lowerInput);
            if (!directDoc)
              directDoc = await firestoreService.users.getById(upperInput);
            if (!directDoc)
              directDoc = await firestoreService.users.getById(exactInput);
            if (directDoc) {
              allMatchedDocs = [
                { id: directDoc.id, data: () => directDoc } as any,
              ];
            }
          } catch (e) {}
        }

        allMatchedDocs = allMatchedDocs.filter(
          (v, i, a) => a.findIndex((v2) => v2.id === v.id) === i,
        );

        console.log(`[Login Diagnostic] Documentos encontrados em 'users': ${allMatchedDocs.length}`);
        allMatchedDocs.forEach(d => {
          const data = d.data();
          console.log(`[Login Diagnostic] Doc ID: ${d.id}, mustChangePassword: ${data.mustChangePassword}, senhaPadraoBloqueada: ${data.senhaPadraoBloqueada}, updatedAt: ${data.updatedAt}`);
        });

        allMatchedDocs.sort((a, b) => {
          const aData = a.data();
          const bData = b.data();
          
          // Melhorar a ordenação por tempo de atualização real
          const aTime = getTimestampDate(aData.updatedAt || aData.createdAt || 0).getTime();
          const bTime = getTimestampDate(bData.updatedAt || bData.createdAt || 0).getTime();
          
          if (aTime !== bTime) return bTime - aTime; // Priorizar o registo mais recentemente atualizado

          // Se empatar no tempo, priorizar quem já alterou a senha
          const aChanged = aData.mustChangePassword === false || aData.senhaPadraoBloqueada === true;
          const bChanged = bData.mustChangePassword === false || bData.senhaPadraoBloqueada === true;
          
          if (aChanged && !bChanged) return -1;
          if (!aChanged && bChanged) return 1;
          
          return 0;
        });

        matchedDoc = allMatchedDocs[0];
        user = matchedDoc ? { ...matchedDoc.data(), id: matchedDoc.id } : null;
        if (!user) {
          const matchedColDoc =
            snapColEmail.docs[0] ||
            snapColNuit.docs[0] ||
            snapColId.docs[0] ||
            (snapColNuitNum && snapColNuitNum.docs[0]);

          if (matchedColDoc) {
            const dbCol = matchedColDoc.data();
            const tempUser = {
              id: matchedColDoc.id,
              name: dbCol.nome,
              email: (
                dbCol.email ||
                `${dbCol.nome.toLowerCase().split(" ").join(".")}@songo.ac.mz`
              ).toLowerCase(),
              nuit: dbCol.nuit,
              role: dbCol.tipo === "Docente" ? "Docente" : "CTA",
              unidade: dbCol.unidade || "",
              direcao: dbCol.direcao || "",
              departamento: dbCol.departamento || "",
              reparticao: dbCol.reparticao || "",
              cargo: dbCol.cargo || "",
              status: dbCol.status || "Ativo",
              areaDeAfetacao: dbCol.areaDeAfetacao || "",
            };
            user = {
              ...tempUser,
              password: dbCol.password || "1234",
              mustChangePassword: dbCol.mustChangePassword !== false,
            };
          }
        }
        if (user) {
          try {
            const cache = safeJSONParse<any[]>(
              localStorage.getItem("sigep_users_cache"),
              [],
            );
            const localVersion = cache.find((u: any) => {
              const eMatch = u.email && u.email.toLowerCase().trim() === (user.email || "").toLowerCase().trim();
              const nMatch = u.nuit && String(u.nuit).trim() === String(user.nuit || "").trim();
              const idMatch = u.id && String(u.id).trim() === String(user.id || "").trim();
              return eMatch || nMatch || idMatch;
            });
            if (localVersion) {
              if (localVersion.mustChangePassword === false) {
                user.mustChangePassword = false;
                user.senhaPadraoBloqueada = true;
              }
              if (
                localVersion.password &&
                (!user.password ||
                  user.password === "1234" ||
                  ["admin", "123456", "123", "231383ft"].includes(user.password))
              ) {
                user.password = localVersion.password;
              }
            }
          } catch (e) {
            console.warn("Erro ao mesclar com cache local no LoginScreen:", e);
          }
        }
      } catch (fsErr: any) {
        console.warn(
          "Aviso Firestore na busca do utilizador (possível quota/rede):",
          fsErr,
        );
        const errStr = String(fsErr?.message || fsErr?.code || fsErr || "").toLowerCase();
        isQuotaError = fsErr?.code === "resource-exhausted" || errStr.includes("quota") || errStr.includes("resource-exhausted") || errStr.includes("exceeded");
      }

      // 3. Fallback para cache/base local se não encontrado no Firestore ou se houve erro de quota
      if (!user) {
        const localUser = findLocalUser(lowerInput, password);
        if (localUser) {
          user = localUser;
        } else {
          // Busca flexível no EFETIVO_GERAL_DATA
          const flexibleMatch = EFETIVO_GERAL_DATA.find((c: any) => {
            const cEmail = (c.email || "").toLowerCase();
            const cNuit = String(c.nuit || "");
            const cId = (c as any).id || generateCollaboratorId(c.nome || "", c.nuit || "");
            return (
              (cEmail && n(cEmail) === normInput) ||
              (cNuit && n(cNuit) === normInput) ||
              (cId && n(cId) === normInput)
            );
          });
          if (flexibleMatch) {
            user = {
              id: (flexibleMatch as any).id || generateCollaboratorId(flexibleMatch.nome || "", flexibleMatch.nuit || ""),
              name: flexibleMatch.nome,
              nome: flexibleMatch.nome,
              email: (flexibleMatch.email || `${flexibleMatch.nome.toLowerCase().split(" ").join(".")}@songo.ac.mz`).toLowerCase(),
              nuit: flexibleMatch.nuit,
              role: flexibleMatch.tipo === "Docente" ? "Docente" : "CTA",
              unidade: flexibleMatch.unidade || "",
              direcao: (flexibleMatch as any).direcao || "",
              departamento: (flexibleMatch as any).departamento || "",
              reparticao: (flexibleMatch as any).reparticao || "",
              cargo: flexibleMatch.cargo || "",
              status: flexibleMatch.status || "Ativo",
              areaDeAfetacao: (flexibleMatch as any).areaDeAfetacao || "",
              password: "1234",
              mustChangePassword: true,
            };
          }
        }
      }

      if (!user) {
        if (isQuotaError) {
          setError(
            "O limite de quota diária do Firestore (Plano Gratuito Spark) foi atingido. Para atualizar para quota ilimitada (Plano Blaze), ative a faturação no Console do Firebase.",
          );
        } else {
          setError(
            "Utilizador sem registo no sistema. Acesso negado.",
          );
        }
        setLoading(false);
        return;
      }

        const dbPassword = String(user.password || "");
        const hasChangedPassword = user.mustChangePassword === false || user.senhaPadraoBloqueada === true || user.isFirstAccess === false;
        
        // Bloqueio absoluto: se o utilizador já alterou a senha antes, NUNCA aceita a padrão
        const isDefaultInput = password === "1234" || password === "123" || password === "123456" || password === "admin" || password === "231383ft";
        const isDbDefault = !dbPassword || dbPassword === "1234" || ["admin", "123456", "123"].includes(dbPassword);

        let isCorrect = false;
        let forceChange = false;

        if (hasChangedPassword) {
          // Utilizador já alterou a senha - bloqueia estritamente qualquer senha padrão 
          // e só aceita a senha atual da base de dados (que não deve ser a padrão)
          if (password === dbPassword && !isDefaultInput) {
            isCorrect = true;
          } else if (password === dbPassword && isDefaultInput && !isDbDefault) {
            // Caso raro onde o utilizador escolheu a padrão como nova (não recomendado mas possível se o sistema deixou)
            isCorrect = true;
          } else if (isDefaultInput) {
            setError(
              "A senha padrão foi permanentemente bloqueada para este utilizador. Por favor, utilize a sua senha atual ou contacte o administrador.",
            );
            setLoading(false);
            return;
          }
        } else {
          // Primeiro acesso ou senha resetada pelo administrador
          if (password === dbPassword) {
            isCorrect = true;
            if (isDbDefault) forceChange = true;
          } else if (isDefaultInput && isDbDefault) {
            isCorrect = true;
            forceChange = true;
          }
        }

        
        if (!isCorrect) {
          setError("A senha está incorreta.");
          setLoading(false);
          return;
        }

        // Verifica se o colaborador está afeto a um setor, repartição, departamento ou direção
        const cargoRole = (user.role || user.categoria || user.cargo || "").toLowerCase();
        const isSuperUser = user.email === "slaitertripas@gmail.com";
        
        const dir = (user.direcao || "").trim();
        const dep = (user.departamento || "").trim();
        const rep = (user.reparticao || "").trim();
        const sec = (user.sector || user.setor || "").trim();
        const area = (user.areaDeAfetacao || "").trim();
        const isUnassigned = !dir && !dep && !rep && !sec && !area;

        if (!isSuperUser && isUnassigned) {
          setError("Aguarde a sua afetação.");
          setLoading(false);
          return;
        }


        if (forceChange) {
          setMatchedUser(user);
          setView("create_password");
          setLoading(false);
          return;
        }

        // Login bem sucedido
        user.mustChangePassword = false;

        // Sincronizar dados do Firebase Auth se disponível, mas APENAS atualizar o doc correspondente,
        // sem criar um registo espelhado com o UID
        if (auth.currentUser && matchedDoc && !isQuotaError) {
          try {
            const userUpdateData = {
              authUid: auth.currentUser.uid, // guardamos o UID no doc original em vez de usar como ID
              updatedAt: serverTimestamp(),
            };
            await withTimeout(updateDoc(doc(db, "users", matchedDoc.id), userUpdateData), 4000);
          } catch (err) {
            console.warn("Aviso ao sincronizar UID:", err);
          }
        }

        // Tentar obter dados atualizados do colaborador se sem quota error
        if (!isQuotaError) {
          try {
            if (user.role === "Estudante") {
              const estRef = collection(db, "efetivo_escolar");
              const qEst = query(
                estRef,
                where("numeroEstudante", "==", user.numeroEstudante || ""),
              );
              const snapEst = await withTimeout(getDocs(qEst), 5000);
              if (!snapEst.empty) {
                const freshData = snapEst.docs[0].data();
                user = { ...user, ...freshData, id: user.id };
              }
            } else {
              const colRef = collection(db, "colaboradores");
              const nuitStr = String(user.nuit || "");
              const isNuitNum = /^\d+$/.test(nuitStr);
              const nuitNum = isNuitNum ? Number(nuitStr) : null;

              let snapCol = await withTimeout(
                getDocs(query(colRef, where("nuit", "==", nuitStr))),
                5000,
              );
              if (snapCol.empty && isNuitNum && nuitNum !== null) {
                snapCol = await withTimeout(
                  getDocs(query(colRef, where("nuit", "==", nuitNum))),
                  5000,
                );
              }

              if (!snapCol.empty) {
                const freshData = snapCol.docs[0].data();
                user = {
                  ...user,
                  ...freshData,
                  id: snapCol.docs[0].id || user.id,
                };
              }
            }
          } catch (dataErr) {
            console.warn("Erro ao buscar dados atualizados:", dataErr);
          }
        }

        const calcArea = (cc: any): string => {
          if (
            cc.areaDeAfetacao &&
            cc.areaDeAfetacao !== "Nenhum" &&
            cc.areaDeAfetacao !== "-"
          )
            return cc.areaDeAfetacao;
          if (cc.sector && cc.sector !== "Nenhum" && cc.sector !== "-")
            return cc.sector;
          if (cc.setor && cc.setor !== "Nenhum" && cc.setor !== "-")
            return cc.setor;
          if (
            cc.reparticao &&
            cc.reparticao !== "Nenhum" &&
            cc.reparticao !== "-"
          )
            return cc.reparticao;
          if (
            cc.departamento &&
            cc.departamento !== "Nenhum" &&
            cc.departamento !== "-"
          )
            return cc.departamento;
          if (cc.direcao && cc.direcao !== "Nenhum" && cc.direcao !== "-")
            return cc.direcao;
          return cc.unidade || "";
        };

        // Alocação automática e derivação de área para todos colaboradores afetados
        const isChefia =
          user.cargoChefia &&
          user.cargoChefia !== "Nenhum" &&
          user.cargoChefia !== "-";
        if (isChefia) {
          user.isChefia = true;
          if (user.status !== "Afetado" || !user.areaDeAfetacao) {
            const area = calcArea(user);
            user.status = "Afetado";
            user.areaDeAfetacao = area;

            if (!isQuotaError) {
              try {
                const colRef = collection(db, "colaboradores");
                const nuitStr = String(user.nuit || "");
                const isNuitNum = /^\d+$/.test(nuitStr);
                const nuitNum = isNuitNum ? Number(nuitStr) : null;

                let snapCol = await withTimeout(
                  getDocs(query(colRef, where("nuit", "==", nuitStr))),
                  4000,
                );
                if (snapCol.empty && isNuitNum && nuitNum !== null) {
                  snapCol = await withTimeout(
                    getDocs(query(colRef, where("nuit", "==", nuitNum))),
                    4000,
                  );
                }

                if (!snapCol.empty) {
                  await withTimeout(
                    updateDoc(
                      doc(db, "colaboradores", snapCol.docs[0].id),
                      {
                        status: "Afetado",
                        areaDeAfetacao: area,
                        isChefia: true,
                      },
                    ),
                    4000,
                  );
                }
                if (matchedDoc) {
                  await withTimeout(
                    updateDoc(doc(db, "users", matchedDoc.id), {
                      status: "Afetado",
                      areaDeAfetacao: area,
                      isChefia: true,
                    }),
                    4000,
                  );
                }
              } catch (err) {
                console.warn(
                  "Erro ao alocar automaticamente cargo de chefia no login:",
                  err,
                );
              }
            }
          }
        } else if (!user.areaDeAfetacao) {
          const area = calcArea(user);
          if (area) {
            user.areaDeAfetacao = area;
            user.status = "Afetado";
            if (matchedDoc && !isQuotaError) {
              updateDoc(doc(db, "users", matchedDoc.id), {
                status: "Afetado",
                areaDeAfetacao: area,
              }).catch(console.warn);
            }
          }
        }

        // Verificar alocação (Status 'Afetado' e areaDeAfetacao)
        const isAfetado =
          (user.status === "Afetado" && user.areaDeAfetacao) ||
          Boolean(user.areaDeAfetacao) ||
          Boolean(user.sector || user.setor || user.reparticao || user.departamento || user.direcao);
        const isAdmin =
          user.role === "Administrador" ||
          user.role === "Administrador do Sistema" ||
          user.role === "Administrador da Instituição" ||
          String(user.role).toLowerCase().includes("admin") ||
          String(user.cargoChefia || "").toLowerCase().includes("administrador");
        const isProgrammer = user.email === "slaitertripas@gmail.com";

        if (!isAfetado && !isAdmin && !isProgrammer) {
          setError("Aguarde a sua afetação que será feita pelo RH.");
          setLoading(false);
          return;
        }

        // Garantir que utilizadores autenticados nunca mais precisem de alterar a senha obrigatoriamente
        user.mustChangePassword = false;
        
        // Persistir a alteração de status na base de dados para evitar re-solicitação
        if (matchedDoc && !isQuotaError) {
          updateDoc(doc(db, "users", matchedDoc.id), { 
            mustChangePassword: false,
            senhaPadraoBloqueada: true,
            updatedAt: serverTimestamp() 
          }).catch(console.warn);
        }

        // Gerar token de sessão único para este dispositivo
        const sessionToken = "sigep_sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 12);
        localStorage.setItem("sigep_session_token", sessionToken);
        user.currentSessionToken = sessionToken;

        if (matchedDoc && !isQuotaError) {
          updateDoc(doc(db, "users", matchedDoc.id), {
            mustChangePassword: false,
            isFirstAccess: false,
            currentSessionToken: sessionToken,
            lastLoginAt: new Date().toISOString(),
            lastSeenAt: new Date().toISOString(),
            isOnline: true,
          }).catch(console.warn);
        }

        // Guardar utilizador no cache local
        saveUserToCache({ ...user, password: password || user.password, currentSessionToken: sessionToken });

        setSuccess(`Bem-vindo à SIGEP`);
        setTimeout(() => {
          onLogin({
            ...user,
            idioma: loginLanguage,
            userArea: {
              unidade: user.unidade,
              direcao: user.direcao,
              departamento: user.departamento,
              reparticao: user.reparticao,
              setor: user.setor,
            },
          });
        }, 500);

    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || String(err);
      try {
        if (
          typeof err.message === "string" &&
          err.message.trim().startsWith("{")
        ) {
          const parsed = JSON.parse(err.message);
          errMsg = parsed.error || err.message;
        }
      } catch (_) {}

      const errLower = errMsg.toLowerCase();
      if (
        errLower.includes("quota") ||
        errLower.includes("resource-exhausted") ||
        errLower.includes("resource_exhausted")
      ) {
        const fallbackUser = findLocalUser(lowerInput, password);
        if (fallbackUser) {
          const sessionToken = "sigep_sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 12);
          localStorage.setItem("sigep_session_token", sessionToken);
          fallbackUser.currentSessionToken = sessionToken;
          saveUserToCache({
            ...fallbackUser,
            password: password || fallbackUser.password,
            currentSessionToken: sessionToken,
          });
          setSuccess(`Bem-vindo à SIGEP (Modo Cache Local)`);
          setTimeout(() => {
            onLogin({
              ...fallbackUser,
              currentSessionToken: sessionToken,
              userArea: {
                unidade: fallbackUser.unidade,
                direcao: fallbackUser.direcao,
                departamento: fallbackUser.departamento,
                reparticao: fallbackUser.reparticao,
                setor: fallbackUser.setor,
              },
            });
          }, 500);
          return;
        } else {
          setError(
            "O limite de quota do servidor foi atingido temporariamente. Se já acedeu anteriormente neste dispositivo, tente utilizar as suas credenciais habituais.",
          );
        }
      } else {
        setError("Erro ao autenticar: " + errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (newPassword.length < 4) {
      setError("A palavra-passe deve ter pelo menos 4 caracteres.");
      return;
    }

    setLoading(true);
    try {
      if (matchedUser) {
        const pwdHash = firestoreService.hashPassword(newPassword);
        const newUser = {
          id: matchedUser.id || undefined,
          name: matchedUser.name,
          email: (matchedUser.email || "").toLowerCase().trim(),
          nuit: matchedUser.nuit || "",
          password: newPassword,
          passwordHash: pwdHash,
          passwordExpired: false,
          role: matchedUser.role,
          mustChangePassword: false,
          unidade: matchedUser.unidade || "",
          direcao: matchedUser.direcao || "",
          departamento: matchedUser.departamento || "",
          reparticao: (matchedUser as any).reparticao || "",
          cargo: matchedUser.cargo || "",
          numeroEstudante: matchedUser.numeroEstudante || "",
          createdAt: matchedUser.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Identificadores para busca exaustiva
        const emailStr = String(newUser.email || "").toLowerCase().trim();
        const nuitStr = String(newUser.nuit || "").trim();
        const nuitNum = /^\d+$/.test(nuitStr) ? Number(nuitStr) : null;

        // 1. Encontrar TODOS os documentos em 'users' e 'colaboradores' que correspondem a este utilizador
        const usersRef = collection(db, "users");
        const colRef = collection(db, "colaboradores");

        const queries = [];
        if (emailStr) {
          queries.push(getDocs(query(usersRef, where("email", "==", emailStr))));
          queries.push(getDocs(query(colRef, where("email", "==", emailStr))));
        }
        if (nuitStr) {
          queries.push(getDocs(query(usersRef, where("nuit", "==", nuitStr))));
          queries.push(getDocs(query(colRef, where("nuit", "==", nuitStr))));
        }
        if (nuitNum !== null) {
          queries.push(getDocs(query(usersRef, where("nuit", "==", nuitNum))));
          queries.push(getDocs(query(colRef, where("nuit", "==", nuitNum))));
        }

        const results = await Promise.all(queries);
        const allDocsToUpdate: { ref: any, data: any, collection: string }[] = [];

        results.forEach((snap, idx) => {
          const colName = (idx % 2 === 0) ? (emailStr ? "users" : "colaboradores") : (emailStr ? "colaboradores" : "users");
          // Correction: simple way to track collection
          const actualColName = queries.length > 0 ? (idx % 2 === 0 ? "users" : "colaboradores") : "users";
          
          snap.forEach(d => {
            allDocsToUpdate.push({
              ref: d.ref,
              data: d.data(),
              collection: d.ref.parent.id
            });
          });
        });

        // Adicionar o documento atual se não foi encontrado
        if (allDocsToUpdate.length === 0 && matchedUser.id) {
          allDocsToUpdate.push({
            ref: doc(db, "users", matchedUser.id),
            data: matchedUser,
            collection: "users"
          });
        }

        // Remover duplicados por path
        const uniqueDocs = allDocsToUpdate.filter((v, i, a) => a.findIndex(t => t.ref.path === v.ref.path) === i);

        console.log(`[Password Sync] Atualizando ${uniqueDocs.length} documentos em todas as coleções.`);

        // 2. Atualizar TODOS os documentos encontrados com a nova senha e sinalizadores de bloqueio
        await Promise.all(uniqueDocs.map(item => {
          const isUserCol = item.collection === "users";
          const updateData = {
            password: newPassword,
            mustChangePassword: false,
            isFirstAccess: false,
            senhaPadraoBloqueada: true,
            updatedAt: serverTimestamp(),
          };

          // Se for na coleção users, garantir que temos o perfil completo
          const finalData = isUserCol ? { ...newUser, ...updateData } : updateData;
          
          return setDoc(item.ref, finalData, { merge: true }).catch(err => 
            console.warn(`Erro ao atualizar ${item.ref.path}:`, err)
          );
        }));

        // 3. Atualizar Cache Local e Sessão
        const finalUser = {
          ...newUser,
          password: newPassword,
          mustChangePassword: false,
          isFirstAccess: false,
          senhaPadraoBloqueada: true,
        };
        saveUserToCache(finalUser);

        const sessionToken = "sigep_sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 12);
        localStorage.setItem("sigep_session_token", sessionToken);

        if (auth.currentUser) {
          // Atualizar o primeiro documento encontrado com o vínculo de Auth UID
          const primaryDoc = uniqueDocs.find(d => d.collection === "users") || uniqueDocs[0];
          if (primaryDoc) {
            await updateDoc(primaryDoc.ref, {
              authUid: auth.currentUser.uid,
              currentSessionToken: sessionToken,
              lastLoginAt: new Date().toISOString(),
              lastSeenAt: new Date().toISOString(),
              isOnline: true,
            });
          }
        }

        setSuccess("Senha criada e sincronizada com sucesso em todos os registos!");
        setTimeout(() => {
          onLogin({
            ...finalUser,
            currentSessionToken: sessionToken,
            userArea: {
              unidade: finalUser.unidade,
              direcao: finalUser.direcao,
              departamento: finalUser.departamento,
              reparticao: (matchedUser as any).reparticao || "",
              setor: (matchedUser as any).setor || "",
            },
          });
          setSuccess("");
          setView("login");
          setNewPassword("");
          setConfirmPassword("");
          setMatchedUser(null);
        }, 1000);
      }
    } catch (err: any) {
      console.error(err);
      setError("Erro ao sincronizar senha: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col md:flex-row h-screen w-full bg-white z-[100] overflow-y-auto">
      {/* Left Side - Blue */}
      <div className="hidden md:flex w-full md:w-1/2 bg-[#1e1e96] p-8 md:p-12 flex-col justify-between text-white relative overflow-y-auto">
        {/* Fundo Limpo, Moderno e Profissional */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-[#0a1236] via-[#0f1d52] to-[#18296d]">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_0.5px,transparent_0.5px)] opacity-5 [background-size:24px_24px]" />
        </div>

        <div className="relative z-10 flex flex-col">
          <div className="flex items-center gap-4">
            {(() => {
              const activeLogo = systemLogo || "/image.png";
              return activeLogo ? (
                <div className="flex items-center justify-center bg-transparent overflow-hidden w-12 h-12 shrink-0 rounded-xl">
                  <img
                    src={activeLogo}
                    alt={currentInst?.nome || "Logotipo SIGEP"}
                    className="w-full h-full object-contain filter drop-shadow-sm rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 flex items-center justify-center bg-transparent overflow-hidden shrink-0">
                  <SigepLogo size="sm" showText={false} animated={true} />
                </div>
              );
            })()}
            <div>
              <h1 className="text-sm font-bold tracking-widest leading-tight uppercase text-white">
                {currentInst?.nome ? currentInst.nome : "SERVIÇO DE PLANIFICAÇÃO INSTITUCIONAL"}
              </h1>
              <p className="text-[10px] text-blue-200 tracking-wider">
                {currentInst ? "Plataforma Institucional Integrada" : "SIGEP - Plataforma Multi-Institucional"}
              </p>
            </div>
          </div>

          <div className="mt-[10px] space-y-4">
            <style>{`
              @keyframes rgbBlink {
                0% { color: #ff3b30; text-shadow: 0 0 8px #ff3b30; }
                33% { color: #34c759; text-shadow: 0 0 8px #34c759; }
                66% { color: #007aff; text-shadow: 0 0 8px #007aff; }
                100% { color: #ff3b30; text-shadow: 0 0 8px #ff3b30; }
              }
              .rgb-blink {
                animation: rgbBlink 1s infinite;
              }
            `}</style>
            {prazosEPublicacoes.length > 0 && (
              <div>
                <h2 className="text-[10px] font-black underline mb-2 tracking-widest text-amber-300 flex items-center gap-1">
                  <span>📌 Publicação de Planos & Prazos Definidos</span>
                </h2>
                <div className="space-y-1">
                  {prazosEPublicacoes.map((e) => renderEvent(e))}
                </div>
              </div>
            )}
            {actividadesAExecutar.length > 0 && (
              <div>
                <h2 className="text-[10px] font-black underline mt-3 mb-2 tracking-widest text-emerald-300 flex items-center gap-1">
                  <span>⚡ Actividades a Executar no Mês</span>
                </h2>
                <div className="space-y-1">
                  {actividadesAExecutar.map((e) => renderEvent(e))}
                </div>
              </div>
            )}
            {comemorativas.length > 0 && (
              <div>
                <h2 className="text-[10px] font-black underline mt-3 mb-2 tracking-widest text-blue-200">
                  Datas comemorativas
                </h2>
                <div className="space-y-1">
                  {comemorativas.map((e) => renderEvent(e))}
                </div>
              </div>
            )}
            {feriadosNacionais.length > 0 && (
              <div>
                <h2 className="text-[10px] font-black underline mt-3 mb-2 tracking-widest text-blue-200">
                  Feriados nacionais
                </h2>
                <div className="space-y-1">
                  {feriadosNacionais.map((e) => renderEvent(e))}
                </div>
              </div>
            )}
            {feriadosInstitucionais.length > 0 && (
              <div>
                <h2 className="text-[10px] font-black underline mt-3 mb-2 tracking-widest text-blue-200">
                  Feriados institucionais
                </h2>
                <div className="space-y-1">
                  {feriadosInstitucionais.map((e) => renderEvent(e))}
                </div>
              </div>
            )}
            {prazosEPublicacoes.length === 0 &&
              actividadesAExecutar.length === 0 &&
              comemorativas.length === 0 &&
              feriadosNacionais.length === 0 &&
              feriadosInstitucionais.length === 0 && (
                <p className="text-sm opacity-80">Nenhum evento agendado nos próximos dias.</p>
              )}
          </div>
        </div>

        <div
          className="relative z-10 text-[10px] text-white font-sans font-bold tracking-wider"
          style={{
            textShadow:
              "1px 1px 0 #000, 2px 2px 0 #000, 3px 3px 0 #000, 4px 4px 4px rgba(0,0,0,0.5)",
          }}
        >
          Desenvolvido por Franzíssi Tripalonga - 2025-2026 | @todos os direitos reservados
        </div>

        {/* Top Right Icons */}
        <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
          <button
            type="button"
            onClick={() => setShowSobreSistemaModal(true)}
            title="Sobre o Sistema (Manual do Sistema)"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-all text-white text-xs font-bold cursor-pointer shadow-md hover:scale-105 active:scale-95"
          >
            <BookOpen size={16} />
            <span>Sobre o Sistema</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen?.().catch(() => {});
              } else {
                document.exitFullscreen?.().catch(() => {});
              }
            }}
            title="Maximizar / Ecrã Inteiro"
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <Maximize2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              setIdentifier("");
              setPassword("");
              setError("");
            }}
            title="Limpar formulário"
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Right Side - White */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto bg-white">
        <div className="w-full max-w-md text-center">
          {view === "login" && (
            <>
              {/* Logotipo Central Acima de Bem-vindo */}
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center overflow-hidden">
                  {systemLogo ? (
                    <img
                      src={systemLogo}
                      alt="Logotipo SIGEP"
                      className="w-full h-full object-contain filter drop-shadow-md rounded-2xl"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <SigepLogo size="lg" animated={true} showText={false} />
                  )}
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-[#0a0a5a] mb-2 font-serif tracking-tight">
                Bem-vindo
              </h1>
              <p className="text-base sm:text-lg text-gray-500 italic mb-4 font-serif">
                Insira as suas credenciais de acesso.
              </p>

              {/* Seletor de Idioma no Ecrã de Login */}
              <div className="mb-6 flex items-center justify-center gap-2">
                <Globe size={16} className="text-[#0a0a5a]" />
                <span className="text-xs font-bold text-[#0a0a5a] uppercase tracking-wider">Idioma / Language:</span>
                <select
                  value={loginLanguage}
                  onChange={(e) => {
                    const lang = e.target.value as Language;
                    setLoginLanguage(lang);
                    setLanguagePreference(lang);
                  }}
                  className="bg-gray-100 border border-gray-200 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0a0a5a]/20 text-[#0a0a5a]"
                >
                  <option value="pt">Português</option>
                  <option value="en">English</option>
                </select>
              </div>

              <form className="space-y-8" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-red-700 text-sm animate-shake">
                    <AlertCircle size={20} className="shrink-0" />
                    <div className="flex flex-col text-left">
                      <p className="font-medium">{error}</p>
                      {(error.includes("administrador") ||
                        error.includes("incorreta")) && (
                        <button
                          type="button"
                          onClick={() => {
                            setContactId(identifier);
                            setShowContactAdmin(true);
                            setError("");
                          }}
                          className="text-[#0a0a5a] font-bold hover:underline mt-1 text-xs"
                        >
                          Contactar o Administrador
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex flex-col items-center gap-2 text-green-700 text-sm animate-bounce">
                    <CheckCircle2 size={24} />
                    <p className="font-bold text-center">{success}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-[#0a0a5a] tracking-[0.2em]">
                    ID, NUIT ou E-mail
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="ID, NUIT ou E-mail"
                    className="w-full p-4 bg-gray-100 rounded-xl text-sm text-center placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a0a5a]/20 transition-all"
                    required
                    autoComplete="username"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-[#0a0a5a] tracking-[0.2em]">
                    Palavra-passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••"
                    className="w-full p-4 bg-gray-100 rounded-xl text-sm text-center placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a0a5a]/20 transition-all"
                    required
                    autoComplete="current-password"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!!success || loading}
                    className="w-full bg-[#0a0a5a] text-white py-4 px-8 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#0a0a5a]/90 transition-all shadow-lg shadow-blue-900/20 group disabled:bg-gray-400"
                  >
                    {loading ? (
                      <ProcessingCircle size={20} />
                    ) : (
                      <>
                        <span className="tracking-widest text-sm">
                          Entrar no sistema
                        </span>
                        <ArrowRight
                          size={18}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </>
                    )}
                  </button>
                </div>
              
          </form>


              <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    setError("");
                    try {
                      await terminate(db);
                      await new Promise((resolve) => setTimeout(resolve, 100));
                      await clearIndexedDbPersistence(db);
                      setSuccess(
                        "Cache do sistema limpo com sucesso! A recarregar...",
                      );
                      setTimeout(() => {
                        window.location.reload();
                      }, 1200);
                    } catch (err: any) {
                      setError("Erro ao limpar cache: " + err.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="text-xs text-blue-700 hover:text-blue-900 font-bold transition-colors cursor-pointer hover:underline flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={14} className="text-blue-600 shrink-0" />
                  <span>Resolver problemas de acesso (Limpar Cache)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPasswordRecoveryModal(true)}
                  className="text-xs text-indigo-700 hover:text-indigo-900 font-bold transition-colors cursor-pointer hover:underline flex items-center justify-center gap-1.5 pt-1"
                >
                  <Key size={14} className="text-indigo-600 shrink-0" />
                  <span>Esqueci a minha senha (Validação Dinâmica de Identidade)</span>
                </button>
              </div>
            </>
          )}

          {view === "create_password" && (
            <>
              <h1 className="text-4xl font-bold text-[#0a0a5a] mb-2 font-serif tracking-tight">
                Criar Palavra-passe
              </h1>
              <p className="text-sm text-gray-500 italic mb-8 font-serif">
                Como este é o seu primeiro acesso ao sistema, por favor defina a
                sua palavra-passe de acesso.
              </p>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-800 text-sm mb-6 text-left animate-pulse">
                <AlertCircle
                  className="shrink-0 text-amber-600 mt-0.5"
                  size={20}
                />
                <div>
                  <p className="font-bold">Aviso de Segurança</p>
                  <p>
                    É obrigatório alterar a palavra-passe padrão para garantir a
                    segurança da sua conta.
                  </p>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleCreatePasswordSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-red-700 text-sm animate-shake">
                    <AlertCircle size={20} />
                    <p className="font-medium">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex flex-col items-center gap-2 text-green-700 text-sm animate-bounce">
                    <CheckCircle2 size={24} />
                    <p className="font-bold text-center">{success}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-[#0a0a5a] tracking-[0.2em]">
                    Criar Palavra-passe
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="•••••"
                    className="w-full p-4 bg-gray-100 rounded-xl text-sm text-center placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a0a5a]/20 transition-all"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-[#0a0a5a] tracking-[0.2em]">
                    Confirmar Palavra-passe
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="•••••"
                    className="w-full p-4 bg-gray-100 rounded-xl text-sm text-center placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a0a5a]/20 transition-all"
                    required
                  />
                </div>

                <div className="pt-4 flex flex-col gap-4">
                  <button
                    type="submit"
                    disabled={!!success || loading}
                    className="w-full bg-[#0a0a5a] text-white py-4 px-8 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#0a0a5a]/90 transition-all shadow-lg shadow-blue-900/20 group disabled:bg-gray-400"
                  >
                    {loading ? (
                      <ProcessingCircle size={20} />
                    ) : (
                      <>
                        <span className="tracking-widest text-sm">
                          Criar Senha e Entrar
                        </span>
                        <ArrowRight
                          size={18}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setView("login");
                      setError("");
                      setSuccess("");
                    }}
                    className="text-[10px] font-bold text-gray-500 tracking-widest hover:text-[#0a0a5a]"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Contact Admin Modal */}
      {showContactAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-[#0a0a5a] p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">
                    Contactar Administrador
                  </h3>
                  <p className="text-blue-200 text-sm mt-1">
                    Solicitação de recuperação de acesso ao sistema
                  </p>
                </div>
                <button
                  onClick={() => setShowContactAdmin(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#0a0a5a] tracking-widest">
                    Assunto
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="Recuperação de Senha / Acesso Bloqueado"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#0a0a5a] tracking-widest">
                      Nome do Utilizador
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#0a0a5a]/20 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#0a0a5a] tracking-widest">
                      ID / NUIT
                    </label>
                    <input
                      type="text"
                      value={contactId}
                      onChange={(e) => setContactId(e.target.value)}
                      placeholder="ID ou NUIT"
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#0a0a5a]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#0a0a5a] tracking-widest">
                    Mensagem Adicional
                  </label>
                  <textarea
                    value={contactText}
                    onChange={(e) => setContactText(e.target.value)}
                    placeholder="Explique o problema ao administrador..."
                    rows={4}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#0a0a5a]/20 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={async () => {
                    if (!contactName.trim() || !contactId.trim()) {
                      alert("Por favor, preencha o seu nome e identificação.");
                      return;
                    }

                    setIsSendingMessage(true);
                    try {
                      // Enviar mensagem para o administrador principal
                      await firestoreService.messages.add({
                        senderId: "SYSTEM_LOGIN",
                        senderName: contactName,
                        recipientId: "slaitertripas@gmail.com", // ID do Administrador Principal
                        recipientName: "SLAITER TRIPAS",
                        subject: "Recuperação de Senha / Acesso Bloqueado",
                        content: `Solicitação de recuperação de senha para o utilizador ${contactName} (ID: ${contactId}).\n\nMensagem do utilizador: ${contactText || "Sem mensagem adicional."}`,
                        type: "recovery_request",
                        status: "pendente",
                        createdAt: new Date().toISOString(),
                        read: false,
                      });

                      alert(
                        "Solicitação enviada com sucesso ao administrador. Por favor, aguarde o contacto.",
                      );
                      setShowContactAdmin(false);
                      setContactText("");
                      setContactName("");
                    } catch (err) {
                      console.error(err);
                      alert(
                        "Erro ao enviar mensagem. Tente novamente mais tarde.",
                      );
                    } finally {
                      setIsSendingMessage(false);
                    }
                  }}
                  disabled={isSendingMessage}
                  className="w-full bg-[#0a0a5a] text-white py-4 rounded-2xl font-black text-xs tracking-widest hover:bg-[#0a0a5a]/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                >
                  {isSendingMessage ? (
                    <ProcessingCircle size={16} />
                  ) : (
                    "Enviar Mensagem ao Administrador"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Publicação / Evento / Actividade */}
      {selectedEventDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div id="login-event-detail-print-area" className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600/30 rounded-xl text-blue-400 border border-blue-500/30">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-blue-400 block">
                    {selectedEventDetail.type || "Publicação / Evento Institucional"}
                  </span>
                  <h3 className="text-lg font-black leading-tight text-white">
                    Detalhes do Evento / Publicação
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEventDetail(null)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              {/* Title and Code */}
              <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-base font-black text-slate-900 leading-snug">
                    {selectedEventDetail.title}
                  </h4>
                  {selectedEventDetail.referencia && (
                    <span className="shrink-0 px-2.5 py-1 bg-blue-900 text-blue-100 text-xs font-mono font-bold rounded-md">
                      {selectedEventDetail.referencia}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium pt-1">
                  <span className="flex items-center gap-1 text-blue-800 font-semibold">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    {selectedEventDetail.type || "Publicação"}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 text-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    {selectedEventDetail.setor || selectedEventDetail.departamento || "Serviço de Planificação Institucional"}
                  </span>
                </div>
              </div>

              {/* Status and Execution Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                      Data / Período
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {selectedEventDetail.displayDate || selectedEventDetail.date || selectedEventDetail.mes || "Mês Corrente"}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                      Contagem Decrescente
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {selectedEventDetail.diffDays === 0
                        ? "Hoje em Execução!"
                        : selectedEventDetail.diffDays !== undefined
                        ? `Faltam ${selectedEventDetail.diffDays} dia(s)`
                        : "Ativo no Sistema"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Specs: Budget, Indicators, Responsible */}
              <div className="space-y-3">
                {(selectedEventDetail.orcamento !== undefined || selectedEventDetail.valor !== undefined) && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-emerald-600" />
                      Orçamento Cabimentado / Planificado:
                    </span>
                    <span className="text-sm font-black text-emerald-950">
                      {(Number(selectedEventDetail.orcamento || selectedEventDetail.valor) || 0).toLocaleString("pt-MZ", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} MZN
                    </span>
                  </div>
                )}

                {selectedEventDetail.indicadores && (
                  <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-800 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-purple-600" />
                      Indicadores / Meta:
                    </span>
                    <span className="text-xs font-bold text-purple-950">
                      {selectedEventDetail.indicadores}
                    </span>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-600" />
                    Descrição & Diretrizes de Execução:
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    {selectedEventDetail.descricao ||
                      selectedEventDetail.detalhes ||
                      selectedEventDetail.justificativa ||
                      (selectedEventDetail.type === "Publicação de Plano"
                        ? "Publicação oficial do Plano Económico e Social e Orçamento do Exercício (PESOE). Todos os setores e unidades orgânicas devem consultar o plano aprovado para execução rigorosa das actividades calendarizadas."
                        : selectedEventDetail.type === "Prazo Definido"
                        ? "Prazo regulamentar para submissão de relatórios de monitoria, ajustamentos e prestação de contas institucionais."
                        : "Actividade aprovada do Plano Anual agendada para execução no período de referência sob responsabilidade do setor indicado.")}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => printElementById("login-event-detail-print-area", "Comprovativo do Evento - SIGEP Songo", "portrait", "A4")}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir Comprovativo
              </button>
              <button
                type="button"
                onClick={() => setSelectedEventDetail(null)}
                className="px-6 py-2 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sobre o Sistema / Manual do Sistema */}
      {showSobreSistemaModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[300] flex items-center justify-center p-3 sm:p-6 md:p-10 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto p-6 md:p-10 relative shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 pb-4 mb-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0a0a5a] text-white flex items-center justify-center font-bold shadow-md">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#0a0a5a] tracking-tight">Sobre o Sistema / Manual do Sistema</h2>
                  <p className="text-xs text-gray-500 font-medium">Documentação, Objetivos e Guia de Utilização do SIGEP</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSobreSistemaModal(false)}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 text-xs px-3 shadow-sm hover:scale-105"
              >
                <X size={18} />
                <span>Fechar</span>
              </button>
            </div>

            <SobreSistemaView />
          </div>
        </div>
      )}

      {showPasswordRecoveryModal && (
        <PasswordRecoveryModal
          onClose={() => setShowPasswordRecoveryModal(false)}
          onSuccess={() => setShowPasswordRecoveryModal(false)}
        />
      )}
    </div>
  );
}
