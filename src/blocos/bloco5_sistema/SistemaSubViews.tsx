import React, { lazy, Suspense, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Network,
  ChevronRight,
  Database,
  ShieldCheck,
  Zap,
  FileText,
  Settings,
  RefreshCw,
  CheckSquare,
  Users,
  Plus,
  Trash2,
  ArrowLeft,
  Maximize2,
  Info,
  Clock,
  User,
  Download,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Printer,
  Edit2,
  Search,
  Building2,
  Calendar,
  Award,
  X,
  Save,
  Filter,
  Sparkles,
  Building,
  Briefcase,
  Layers,
} from "lucide-react";
import { collection, getDocs, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { firestoreService } from "../../lib/firestoreService";
import { isSuperBossUser } from "../../lib/auth";
import { ProcessingCircle } from "../../components/ui/ProcessingCircle";
import { InstitutionalHeader } from "../../components/InstitutionalHeader";
import { HistoricoChefiasGraficos, parseRegiaoEProvincia } from "../../components/HistoricoChefiasGraficos";
import { openPrintDocumentWindow } from "../../lib/printUtils";
import { formatRelativeTime } from "../../lib/utils";
import { safeJSONStringify } from "../../lib/utils";
import blueprint from "../../../firebase-blueprint.json";
const MonografiaView = lazy(() => import("../bloco3_unidades_organicas/MonografiaView"));
import { getUnifiedProducts, saveUnifiedProduct, deleteUnifiedProduct } from "../../lib/unifiedManager";
import { RUBRICAS, getNecessidadesOptions, formatNecessidadeWithCode, PRODUTOS_POR_NECESSIDADE } from "../../constants/formOptions";

// --- CPANEL VIEW ---
export function CPanelView({
  version,
  currentDate,
}: {
  version: string;
  currentDate: string;
}) {
  const [cPanelActive, setCPanelActive] = useState("Entidades (Schema)");

  const renderCPanelDetails = () => {
    switch (cPanelActive) {
      case "Entidades (Schema)":
        return (
          <div className="space-y-6">
            <p className="text-gray-500 font-medium italic">
              Exploração de Entidades Definidas no Blueprint do Sistema (Lógica
              de Negócio)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries((blueprint as any).entities).map(
                ([name, entity]: [string, any]) => (
                  <div
                    key={name}
                    className="bg-gray-50 border border-gray-100 p-6 rounded-2xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-black text-blue-900 border-b-2 border-blue-600 pb-1">
                        {name}
                      </h4>
                      <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-black tracking-widest">
                        {entity.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mb-4 italic">
                      "{entity.description}"
                    </p>
                    <div className="space-y-2">
                      {Object.entries(entity.properties).map(
                        ([propName, prop]: [string, any]) => (
                          <div
                            key={propName}
                            className="flex items-center justify-between group"
                          >
                            <span className="text-gray-600 group-hover:text-blue-600 transition-colors">
                              {propName}
                            </span>
                            <div className="flex items-center gap-2">
                              {prop.enum && (
                                <span className="text-[8px] bg-amber-100 text-amber-700 font-bold px-1 rounded tracking-tighter">
                                  Enum
                                </span>
                              )}
                              <span className="text-gray-400 opacity-60">
                                ::
                              </span>
                              <span className="text-blue-500 font-bold">
                                {prop.type}
                              </span>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        );
      case "Base de Dados (JSON)":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900 text-blue-300 p-4 rounded-xl mb-4">
              <div className="flex items-center gap-2">
                <ProcessingCircle
                  size={10}
                  strokeWidth={12}
                  className="opacity-80"
                />
                <span className="text-[10px] font-black tracking-widest">
                  Live Firestore Connector
                </span>
              </div>
              <span className="text-[9px] font-mono opacity-50">
                PROD_ENV_SIGEP_X01
              </span>
            </div>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-green-400 overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              <pre className="text-[10px] leading-relaxed">
                {safeJSONStringify(
                  {
                    config: {
                      sync_interval: "realtime",
                      persistence: "enabled",
                      version: version,
                      last_checkpoint: currentDate,
                    },
                    collections: Object.keys(
                      (blueprint as any).firestore || {},
                    ).map((c) => ({
                      path: c,
                      schema: (blueprint as any).firestore[c].schema,
                      status: "active",
                      encrypted: true,
                    })),
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 text-gray-500 italic">
            Módulo em desenvolvimento ou indisponível.
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-blue-300 text-xs font-bold tracking-widest opacity-80">
            Gestão e Atualização Técnica do Sistema
          </p>
        </div>
        <Network
          size={48}
          className="text-white/10 absolute right-8 top-1/2 -translate-y-1/2 scale-150"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 tracking-widest mb-4">
              Módulos do Sistema
            </h3>
            <div className="space-y-2">
              {[
                "Entidades (Schema)",
                "Base de Dados (JSON)",
                "Constantes do Sistema",
                "Código Fonte (V1)",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => setCPanelActive(item)}
                  className={`w-full text-left p-4 rounded-2xl text-xs font-bold tracking-widest transition-all flex items-center justify-between ${cPanelActive === item ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                >
                  {item}
                  <ChevronRight
                    size={14}
                    className={
                      cPanelActive === item ? "text-white" : "text-gray-300"
                    }
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={cPanelActive}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[500px] overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                <h3 className="text-xl font-black text-slate-900 tracking-tighter">
                  {cPanelActive}
                </h3>
              </div>
              <div className="flex-1 p-8 overflow-auto font-mono text-[11px]">
                {renderCPanelDetails()}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --- RECENT ACTIVITY LOG ---
export function RecentActivityLog({
  colaboradores = [],
}: {
  colaboradores: any[];
}) {
  const sortedActivities = [...colaboradores]
    .filter((c) => c.updatedAt)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 15);

  const lastUpdated =
    sortedActivities.length > 0
      ? new Date(
          Math.max(
            ...sortedActivities.map((a) => new Date(a.updatedAt).getTime()),
          ),
        ).toLocaleString("pt-PT", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "---";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-black text-blue-900 tracking-tight">
          Registo de Actividade Recente
        </h2>
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 tracking-widest">
          <Clock size={14} /> Atualizado em: {lastUpdated}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {sortedActivities.length === 0 ? (
            <div className="py-20 text-center">
              <Zap size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold tracking-widest italic text-xs">
                Nenhuma actividade recente detetada no sistema.
              </p>
            </div>
          ) : (
            sortedActivities.map((activity, idx) => (
              <div
                key={activity.id || idx}
                className="p-6 hover:bg-blue-50/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0 group-hover:border-blue-200 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">
                      {activity.updatedBy?.substring(0, 2).toUpperCase() || (
                        <User size={16} />
                      )}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-black text-gray-900">
                        {activity.updatedBy || "Utilizador do Sistema"}
                      </p>
                      <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full tracking-tighter tabular-nums">
                        {formatRelativeTime(activity.updatedAt)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Atualizou os dados de{" "}
                        <span className="font-bold text-blue-900">
                          {activity.nome}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {activity.unidade && (
                          <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold tracking-widest">
                            {activity.unidade}
                          </span>
                        )}
                        {activity.cargoChefia &&
                          activity.cargoChefia !== "Nenhum" && (
                            <span className="text-[9px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-bold tracking-widest border border-amber-100">
                              {activity.cargoChefia}
                            </span>
                          )}
                        {activity.confiavel && (
                          <span className="text-[9px] bg-green-50 text-green-600 px-2 py-0.5 rounded font-bold tracking-widest border border-green-100">
                            VALIDADO (CHEFE RH)
                          </span>
                        )}
                        {activity.validadoPorRH && (
                          <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold tracking-widest border border-blue-100">
                            Confirmado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {sortedActivities.length > 0 && (
          <div className="p-6 bg-gray-50/50 border-t border-gray-100 text-center">
            <p className="text-[10px] font-black text-gray-400 tracking-widest italic">
              A mostrar as últimas 15 atualizações globais.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
export function DatabaseView({
  stats,
  tableData,
  onExtrairCompleta,
  isExtracting,
  onSeedCollaborators,
}: {
  stats: { totalRecords: number; dbSizeFormatted: string; currentDate: string };
  tableData: any[];
  onExtrairCompleta?: (format: "excel" | "json") => void;
  isExtracting?: boolean;
  onSeedCollaborators?: () => void;
}) {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const handleRunAuditAndSync = async () => {
    setIsAuditing(true);
    setAuditResult(null);
    try {
      const res = await firestoreService.runDatabaseAuditAndSync();
      setAuditResult(res);
    } catch (err: any) {
      alert(
        `Erro ao executar varredura: ${err?.message || "Tente novamente."}`,
      );
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-gray-500 text-xs leading-[1.5]">
            Visualização e diagnóstico em tempo real das tabelas e registos do
            sistema.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            disabled={isAuditing}
            onClick={handleRunAuditAndSync}
            className="bg-blue-600 text-white hover:bg-blue-700 border border-blue-700 px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Executar varredura do sistema para identificar e resolver conflitos sem apagar dados de utilizadores"
          >
            {isAuditing ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              <Activity size={12} />
            )}
            {isAuditing
              ? "VARREDURA EM CURSO..."
              : "VARREDURA DE ANOMALIAS E CONFLITOS"}
          </button>
          {onSeedCollaborators && (
            <button
              onClick={onSeedCollaborators}
              className="bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 hover:bg-purple-100 transition-colors shadow-sm"
              title="Garantir que todos os colaboradores do Efetivo Geral estão na base de dados"
            >
              <Users size={12} />
              SINC. EFETIVO GERAL
            </button>
          )}
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-green-200">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            CONECTADO
          </div>
        </div>
      </div>

      {auditResult && (
        <div className="mb-6 bg-white border border-blue-200 rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2 text-blue-900 font-black text-sm">
              <CheckCircle2 className="text-emerald-500" size={18} />
              Relatório de Varredura e Resolução de Conflitos
            </div>
            <button
              onClick={() => setAuditResult(null)}
              className="text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              Fechar
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-400">
                Coleções Analisadas
              </p>
              <p className="text-lg font-black text-gray-800">
                {auditResult.collectionsScanned}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-[10px] font-bold text-blue-500">
                Registos Auditados
              </p>
              <p className="text-lg font-black text-blue-800">
                {auditResult.totalDocsScanned}
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-[10px] font-bold text-amber-600">
                Anomalias Detetadas
              </p>
              <p className="text-lg font-black text-amber-800">
                {auditResult.anomaliesDetected}
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
              <p className="text-[10px] font-bold text-emerald-600">
                Conflitos Resolvidos
              </p>
              <p className="text-lg font-black text-emerald-800">
                {auditResult.conflictsResolved}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-200 rounded-xl p-4 text-xs font-mono max-h-48 overflow-y-auto space-y-1">
            <p className="text-emerald-400 font-bold mb-1">
              --- REGISTO DE EXECUÇÃO DA VARREDURA ---
            </p>
            {auditResult.logs?.map((l: string, idx: number) => (
              <p key={idx} className="text-slate-300">
                » {l}
              </p>
            ))}
          </div>
          <p className="text-[11px] text-emerald-700 font-bold mt-3 flex items-center gap-1.5">
            <ShieldCheck size={14} />
            Nenhum dado inserido pelos utilizadores foi removido. Todos os
            campos foram mesclados e preservados integralmente.
          </p>
        </div>
      )}

      {onExtrairCompleta && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div>
            <h4 className="text-sm font-black text-blue-900 leading-none mb-1 flex items-center gap-2">
              <Database size={16} className="text-blue-600 animate-pulse" />
              Extração Completa da Base de Dados
            </h4>
            <p className="text-xs text-blue-700/80 font-medium">
              Descarregue todos os registos de todas as tabelas em formato
              unificado.
            </p>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              disabled={isExtracting}
              onClick={() => onExtrairCompleta("excel")}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black tracking-widest transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/15 cursor-pointer"
            >
              {isExtracting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />A EXTRAIR...
                </>
              ) : (
                <>
                  <Download size={14} />
                  EXTRAIR EXCEL (XLSX)
                </>
              )}
            </button>
            <button
              disabled={isExtracting}
              onClick={() => onExtrairCompleta("json")}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-950 hover:bg-blue-900 disabled:opacity-50 text-white rounded-xl text-xs font-black tracking-widest transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-950/15 cursor-pointer"
            >
              {isExtracting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />A EXTRAIR...
                </>
              ) : (
                <>
                  <Download size={14} />
                  EXTRAIR JSON
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          {
            title: "Total De Tabelas",
            value: "5",
            color: "text-blue-600",
            bg: "bg-blue-50/50",
            border: "border-blue-100",
          },
          {
            title: "Total De Registos",
            value: stats.totalRecords.toString(),
            color: "text-purple-600",
            bg: "bg-purple-50/50",
            border: "border-purple-100",
          },
          {
            title: "Tamanho Do Banco",
            value: stats.dbSizeFormatted,
            color: "text-pink-600",
            bg: "bg-pink-50/50",
            border: "border-pink-100",
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className={`${card.bg} border ${card.border} rounded-lg p-4 shadow-sm`}
          >
            <h3
              className={`text-[10px] font-bold tracking-wider ${card.color} mb-4 leading-[1.5]`}
            >
              {card.title}
            </h3>
            <p className={`text-4xl font-bold ${card.color} leading-[1.5]`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-bold tracking-wider border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Nome Da Tabela</th>
              <th className="px-6 py-4">Registos</th>
              <th className="px-6 py-4">Última Alteração</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tableData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-700 flex items-center gap-2">
                  <Database size={14} className="text-gray-400" />
                  {row.name}
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">
                  {row.records}
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {row.lastUpdate}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold">
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// --- USER MANAGEMENT VIEW ---
export function UserManagementView({
  currentUser,
  onRegistarClick,
}: {
  currentUser: any;
  onRegistarClick: () => void;
}) {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [isResetting, setIsResetting] = useState<string | null>(null);
  const [resetConfirmUser, setResetConfirmUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const q = collection(db, "users");
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const rawUsers = snap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        const isSystemOwner = currentUser?.isOwner === true && !currentUser?.instituicaoId || currentUser?.isProgrammer === true || String(currentUser?.email || "").toLowerCase() === "slaitertripas@gmail.com";
        const filtered = isSystemOwner
          ? rawUsers
          : rawUsers.filter((u: any) => u.instituicaoId === currentUser?.instituicaoId);
        setAllUsers(filtered);
        setUsersLoading(false);
      },
      (err: any) => {
        console.warn("Aviso ao carregar utilizadores em tempo real:", err?.message || String(err));
        try {
          const local = localStorage.getItem("sigep_local_users") || localStorage.getItem("sigep_users");
          if (local) {
            const rawUsers = JSON.parse(local);
            const isSystemOwner = currentUser?.isOwner === true && !currentUser?.instituicaoId || currentUser?.isProgrammer === true || String(currentUser?.email || "").toLowerCase() === "slaitertripas@gmail.com";
            const filtered = isSystemOwner
              ? rawUsers
              : rawUsers.filter((u: any) => u.instituicaoId === currentUser?.instituicaoId);
            setAllUsers(filtered);
          }
        } catch (_) {}
        setUsersLoading(false);
      },
    );

    // Update current time every second to refresh duration
    const interval = setInterval(() => setNow(new Date()), 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const isEffectivelyOnline = (u: any) => {
    if (u.isOnline) return true;
    if (!u.lastSeenAt) return false;
    const lastSeen = new Date(u.lastSeenAt).getTime();
    const tenMinutesAgo = now.getTime() - 10 * 60 * 1000;
    return lastSeen > tenMinutesAgo;
  };

  const calculateDuration = (loginAt: string) => {
    if (!loginAt) return "---";
    const start = new Date(loginAt).getTime();
    const diff = Math.max(0, now.getTime() - start);

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleResetPassword = (id: string, name: string) => {
    setResetConfirmUser({ id, name });
  };

  const executeResetPassword = async () => {
    if (!resetConfirmUser) return;
    const { id, name } = resetConfirmUser;
    const userName = name || "Utilizador";
    setResetConfirmUser(null);

    setIsResetting(id);
    try {
      const res = await (firestoreService as any).resetUserPasswordToDefault(
        id,
      );
      if (res && res.success) {
        alert(`Senha de ${userName} resetada com sucesso para '1234'.`);
      } else {
        alert("Erro ao resetar senha: " + (res?.error || "Erro desconhecido"));
      }
    } catch (err: any) {
      console.error("Erro ao resetar senha:", err);
      alert("Erro ao resetar senha: " + (err?.message || String(err)));
    } finally {
      setIsResetting(null);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!isSuperBossUser(currentUser)) {
      alert("Apenas o proprietário pode remover utilizadores.");
      return;
    }
    if (
      confirm(
        "Tem a certeza que deseja remover este utilizador permanentemente? Esta ação é irreversível e sem possibilidade de recuperação.",
      )
    ) {
      try {
        await firestoreService.users.delete(id);
        setAllUsers((prev) => prev.filter((u) => u.id !== id));
        alert("dados excluido com sucesso");
      } catch (err) {
        alert("Erro ao remover utilizador.");
      }
    }
  };

  const handleExportUserReport = () => {
    const contentHtml = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 16px; color: #0f172a;">Relatório de Acessos e Utilizadores do Sistema</h3>
        <p style="font-size: 11px; color: #64748b; margin-bottom: 20px;">Data de Emissão: ${new Date().toLocaleString("pt-PT")}</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 8px; text-align: left;">Nome</th>
              <th style="padding: 8px; text-align: left;">Email / NUIT</th>
              <th style="padding: 8px; text-align: left;">Cargo / Unidade</th>
              <th style="padding: 8px; text-align: left;">Status</th>
              <th style="padding: 8px; text-align: left;">Tempo de Sessão / Último Acesso</th>
            </tr>
          </thead>
          <tbody>
            ${filteredUsers
              .map(
                (u) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px; font-weight: bold;">${u.name || "N/D"}</td>
                <td style="padding: 8px;">${u.email || "---"} <br/><span style="color: #64748b; font-size: 9px;">NUIT: ${u.nuit || "---"}</span></td>
                <td style="padding: 8px;">${u.cargo || "N/D"} <br/><span style="color: #64748b; font-size: 9px;">${u.direcao || u.departamento || "Institucional"}</span></td>
                <td style="padding: 8px;">${isEffectivelyOnline(u) ? "Conectado Agora" : "Desconectado"}</td>
                <td style="padding: 8px;">${isEffectivelyOnline(u) ? calculateDuration(u.lastLoginAt) : (u.lastSeenAt ? new Date(u.lastSeenAt).toLocaleString("pt-PT") : "Inativo")}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        <div style="margin-top: 30px; font-size: 10px; color: #64748b; text-align: right;">
          <p>SIGEP - Instituto Superior Politécnico de Songo</p>
        </div>
      </div>
    `;

    openPrintDocumentWindow({
      title: "Relatório de Gestão de Utilizadores e Acessos",
      subtitle: `Total de Registos: ${filteredUsers.length}`,
      direcao: "Direcção de Serviços Técnicos e Informáticos",
      departamento: "Sistemas e Infraestruturas",
      contentHtml,
      orientation: "portrait",
    });
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.nuit || "").toString().includes(searchTerm),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <h2 className="text-2xl font-black text-blue-900 tracking-tight">
          Gestão de Utilizadores
        </h2>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <input
              type="text"
              placeholder="Pesquisar por nome, email ou NUIT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
            <Users
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
          <button
            onClick={handleExportUserReport}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 shrink-0 inline-flex items-center gap-2"
            title="Extrair Relatório de Acessos e Utilizadores"
          >
            <Printer size={14} /> Relatório
          </button>
          <button
            onClick={onRegistarClick}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 shrink-0"
          >
            + Novo Utilizador
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black text-gray-400 tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-8 py-4">Utilizador</th>
              <th className="px-8 py-4">Cargo / Unidade</th>
              <th className="px-8 py-4">Tempo de Sessão</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {usersLoading ? (
              <tr>
                <td colSpan={5} className="px-8 py-20">
                  <div className="flex flex-col items-center justify-center gap-6">
                    <ProcessingCircle size={60} strokeWidth={1.5} />
                    <p className="text-gray-400 font-black tracking-[0.3em] text-[10px] animate-pulse">
                      A carregar utilizadores...
                    </p>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-8 py-12 text-center text-gray-400 font-bold tracking-widest italic"
                >
                  Nenhum utilizador encontrado para esta pesquisa.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const online = isEffectivelyOnline(u);
                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-gray-50/50 transition-colors ${online ? "bg-blue-50/20" : ""}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`relative w-10 h-10 rounded-full flex items-center justify-center font-black shadow-sm ${online ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
                        >
                          {u.name?.substring(0, 2) ||
                            u.email?.substring(0, 2).toUpperCase()}
                          {online && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 leading-none mb-1">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-black text-gray-600 mb-1">
                        {u.cargo}
                      </p>
                      <p className="text-[9px] text-gray-400 font-medium">
                        {u.isOwner || isSuperBossUser(u)
                          ? "PROPRIETÁRIO / PROGRAMADOR"
                          : u.direcao || u.departamento || "Institucional"}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      {online ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-mono font-black text-blue-600 tabular-nums">
                            {calculateDuration(u.lastLoginAt)}
                          </span>
                          <span className="text-[8px] text-blue-400 font-bold tracking-tighter ">
                            Em actividade contínua
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 font-medium italic">
                            Sessão inativa
                          </span>
                          {u.lastSeenAt && (
                            <span className="text-[8px] text-gray-300 font-bold ">
                              Última vez:{" "}
                              {new Date(u.lastSeenAt).toLocaleString("pt-PT")}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`w-fit px-3 py-1 rounded-full text-[9px] font-black ${online ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}
                        >
                          {online ? "Conectado Agora" : "Desconectado"}
                        </span>
                        {u.isOwner && (
                          <span className="w-fit px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[9px] font-black">
                            Proprietário / Programador
                          </span>
                        )}
                        {u.role === "Administrador" && !u.isOwner && (
                          <span className="w-fit px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black">
                            Admin
                          </span>
                        )}
                        {u.mustChangePassword && (
                          <span className="w-fit px-3 py-1 bg-red-50 text-red-600 rounded-full text-[8px] font-black border border-red-100">
                            Senha Padrão
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right space-x-2">
                      <button
                        disabled={isResetting === u.id}
                        onClick={() => handleResetPassword(u.id, u.name)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="Gerar Senha Padrão (1234)"
                      >
                        {isResetting === u.id ? (
                          <ProcessingCircle size={14} />
                        ) : (
                          <RefreshCw size={16} />
                        )}
                      </button>

                      {isSuperBossUser(currentUser) &&
                        u.email !== currentUser?.email && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remover Utilizador"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {resetConfirmUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100"
            >
              <div className="flex items-center gap-3 text-amber-600 mb-4">
                <AlertTriangle size={28} />
                <h3 className="text-lg font-black text-gray-900">
                  Confirmar Reset de Senha
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Tem a certeza que quer resetar a senha do usuário <strong className="text-gray-950">{resetConfirmUser.name}</strong>?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResetConfirmUser(null)}
                  className="px-4 py-2 text-xs font-black tracking-widest text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Não
                </button>
                <button
                  type="button"
                  onClick={executeResetPassword}
                  className="px-6 py-2 text-xs font-black tracking-widest text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-lg shadow-amber-200"
                >
                  Sim
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- TIPOS E FUNÇÕES DE TEMPO DE MANDATO E HISTÓRICO DE CHEFIAS ---
export interface TempoMandatoResult {
  anos: number;
  meses: number;
  dias: number;
  totalDias: number;
  texto: string;
}

export interface SetorDirigidoItem {
  id: string;
  cargo: string;
  setor: string;
  dataNomeacao: string;
  dataCessacao: string;
  emExercicio: boolean;
}

/**
 * Calcula dinamicamente o tempo de mandato desde a data de nomeação até à data de cessação (ou presente se em exercício).
 */
export function calcularTempoMandato(
  dataInicioStr?: string,
  dataFimStr?: string,
  emExercicio?: boolean
): TempoMandatoResult | null {
  if (!dataInicioStr || !dataInicioStr.trim()) return null;
  const dataInicio = new Date(dataInicioStr);
  if (isNaN(dataInicio.getTime())) return null;

  let dataFim = new Date();
  if (!emExercicio && dataFimStr && dataFimStr.trim() && dataFimStr.toLowerCase() !== "em exercício" && dataFimStr.toLowerCase() !== "cessado") {
    const parsedFim = new Date(dataFimStr);
    if (!isNaN(parsedFim.getTime())) {
      dataFim = parsedFim;
    }
  }

  if (dataFim < dataInicio) {
    return { anos: 0, meses: 0, dias: 0, totalDias: 0, texto: "0 dias" };
  }

  let anos = dataFim.getFullYear() - dataInicio.getFullYear();
  let meses = dataFim.getMonth() - dataInicio.getMonth();
  let dias = dataFim.getDate() - dataInicio.getDate();

  if (dias < 0) {
    meses--;
    const prevMonth = new Date(dataFim.getFullYear(), dataFim.getMonth(), 0);
    dias += prevMonth.getDate();
  }

  if (meses < 0) {
    anos--;
    meses += 12;
  }

  const diffMs = dataFim.getTime() - dataInicio.getTime();
  const totalDias = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  const parts: string[] = [];
  if (anos > 0) parts.push(`${anos} ${anos === 1 ? "Ano" : "Anos"}`);
  if (meses > 0) parts.push(`${meses} ${meses === 1 ? "Mês" : "Meses"}`);
  if (dias > 0 || parts.length === 0) parts.push(`${dias} ${dias === 1 ? "Dia" : "Dias"}`);

  return {
    anos,
    meses,
    dias,
    totalDias,
    texto: parts.join(", "),
  };
}

// --- HISTORICO CHEFIAS VIEW ---
export function HistoricoChefiasView() {
  const [historico, setHistorico] = useState<any[]>([]);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"todos" | "cessados" | "em_exercicio">("todos");
  const [selectedRegiao, setSelectedRegiao] = useState<string | null>(null);
  const [selectedProvincia, setSelectedProvincia] = useState<string | null>(null);
  
  // Modal de Adicionar / Editar
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State com suporte a múltiplos setores dirigidos
  const [formData, setFormData] = useState<{
    colaboradorId: string;
    idMecanografico: string;
    nomeCompleto: string;
    naturalidade: string;
    cargoQueOcupou: string;
    unidadeDirecao: string;
    departamento: string;
    dataNomeacao: string;
    dataCessacao: string;
    emExercicio: boolean;
    despacho: string;
    observacoes: string;
    setoresDirigidos: SetorDirigidoItem[];
  }>({
    colaboradorId: "",
    idMecanografico: "",
    nomeCompleto: "",
    naturalidade: "",
    cargoQueOcupou: "",
    unidadeDirecao: "",
    departamento: "",
    dataNomeacao: "",
    dataCessacao: "",
    emExercicio: false,
    despacho: "",
    observacoes: "",
    setoresDirigidos: [],
  });

  // Carregar histórico de chefias em tempo real
  useEffect(() => {
    const q = collection(db, "historico_chefias");
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
        setHistorico(list);
        setLoading(false);
      },
      (err: any) => {
        console.warn("Aviso ao carregar histórico de chefias:", err?.message || String(err));
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Carregar colaboradores para preenchimento inteligente e sincronização
  useEffect(() => {
    const qColabs = collection(db, "colaboradores");
    const unsubscribeColabs = onSnapshot(
      qColabs,
      (snap) => {
        setColaboradores(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
      },
      (err: any) => {
        console.warn("Aviso ao carregar colaboradores:", err?.message || String(err));
      }
    );
    return () => unsubscribeColabs();
  }, []);

  // Extrair naturalidade limpa de um colaborador
  const formatNaturalidade = (colab: any): string => {
    if (!colab) return "";
    if (typeof colab.naturalidade === "string" && colab.naturalidade.trim()) {
      return colab.naturalidade.trim();
    }
    if (colab.naturalidade && typeof colab.naturalidade === "object") {
      const parts = [
        colab.naturalidade.distrito || colab.naturalidade.cidade,
        colab.naturalidade.provincia,
        colab.naturalidade.pais !== "Moçambique" ? colab.naturalidade.pais : ""
      ].filter(Boolean);
      if (parts.length > 0) return parts.join(" - ");
    }
    if (colab.localNascimento) {
      if (typeof colab.localNascimento === "string") return colab.localNascimento;
      const parts = [
        colab.localNascimento.distrito || colab.localNascimento.cidade,
        colab.localNascimento.provincia,
      ].filter(Boolean);
      if (parts.length > 0) return parts.join(" - ");
    }
    return colab.provincia || colab.distrito || "Moçambique";
  };

  // Sincronização inteligente com colaboradores com histórico de chefia
  const handleSincronizarColaboradores = async () => {
    setSyncing(true);
    setFeedbackMsg(null);
    try {
      let adicionados = 0;

      for (const c of colaboradores) {
        const rawCargo = `${c.cargoChefia || ""} ${c.cargo || ""}`.toLowerCase();
        const temChefia =
          c.cargoChefia ||
          c.isChefia ||
          c.estadoMandato === "Cessado" ||
          rawCargo.includes("diretor") ||
          rawCargo.includes("chefe") ||
          rawCargo.includes("coordenador") ||
          rawCargo.includes("reitor") ||
          rawCargo.includes("presidente");

        if (temChefia) {
          const cargo = c.cargoChefia || c.cargo || "Titular de Cargo de Chefia";
          const nome = c.nomeCompleto || c.nome || "Colaborador";
          const idMec = c.mecanografico || c.numeroDocumento || c.id || "";

          // Verificar se já existe exatamente este colaborador com este mesmo cargo
          const jaExiste = historico.some(
            (h) =>
              (h.colaboradorId === c.id || h.nomeCompleto?.toLowerCase() === nome.toLowerCase()) &&
              h.cargoQueOcupou?.toLowerCase() === cargo.toLowerCase()
          );

          if (!jaExiste) {
            const dataNomeacao = c.dataNomeacao || c.dataMandato || c.inicioMandato || c.dataInicioChefia || c.admissao || "";
            const dataCessacao = c.dataCessacao || c.dataDespromocao || c.dataFimChefia || (c.estadoMandato === "Cessado" ? "Cessado" : "");
            const emExercicio = !dataCessacao && c.estadoMandato !== "Cessado";
            const setorPrincipal = [c.direcao || c.unidade || c.orgao, c.departamento].filter(Boolean).join(" - ");

            const newDocRef = doc(collection(db, "historico_chefias"));
            await setDoc(newDocRef, {
              colaboradorId: c.id,
              idMecanografico: idMec,
              nomeCompleto: nome,
              naturalidade: formatNaturalidade(c),
              cargoQueOcupou: cargo,
              unidadeDirecao: c.direcao || c.unidade || c.orgao || "",
              departamento: c.departamento || "",
              dataNomeacao: dataNomeacao,
              dataCessacao: emExercicio ? "" : dataCessacao,
              emExercicio: emExercicio,
              despacho: c.despacho || "",
              observacoes: c.observacoes || "Sincronizado automaticamente da ficha do colaborador.",
              setoresDirigidos: [
                {
                  id: "setor_1",
                  cargo: cargo,
                  setor: setorPrincipal || "Setor Orgânico",
                  dataNomeacao: dataNomeacao,
                  dataCessacao: emExercicio ? "" : dataCessacao,
                  emExercicio: emExercicio,
                },
              ],
              registadoEm: new Date().toISOString(),
            });
            adicionados++;
          }
        }
      }

      setFeedbackMsg({
        type: "success",
        text: adicionados > 0 
          ? `Sincronização concluída com sucesso! ${adicionados} novo(s) mandato(s) adicionado(s) ao histórico.`
          : "O histórico já se encontra totalmente atualizado com todos os colaboradores com cargos de chefia.",
      });
    } catch (err: any) {
      console.error("Erro na sincronização:", err);
      setFeedbackMsg({
        type: "error",
        text: `Erro ao sincronizar histórico: ${err.message || String(err)}`,
      });
    } finally {
      setSyncing(false);
    }
  };

  // Abrir modal para novo registo
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      colaboradorId: "",
      idMecanografico: "",
      nomeCompleto: "",
      naturalidade: "",
      cargoQueOcupou: "",
      unidadeDirecao: "",
      departamento: "",
      dataNomeacao: "",
      dataCessacao: "",
      emExercicio: false,
      despacho: "",
      observacoes: "",
      setoresDirigidos: [],
    });
    setShowModal(true);
  };

  // Abrir modal para edição
  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    const initialSetores: SetorDirigidoItem[] = Array.isArray(item.setoresDirigidos) && item.setoresDirigidos.length > 0
      ? item.setoresDirigidos
      : item.cargoQueOcupou
        ? [
            {
              id: "s_1",
              cargo: item.cargoQueOcupou || "",
              setor: [item.unidadeDirecao, item.departamento].filter(Boolean).join(" - ") || "",
              dataNomeacao: item.dataNomeacao || item.inicio || "",
              dataCessacao: item.dataCessacao || item.fim || "",
              emExercicio: Boolean(item.emExercicio || (!item.dataCessacao && !item.fim && item.status !== "Cessado")),
            },
          ]
        : [];

    setFormData({
      colaboradorId: item.colaboradorId || "",
      idMecanografico: item.idMecanografico || item.id || "",
      nomeCompleto: item.nomeCompleto || item.nome || "",
      naturalidade: item.naturalidade || "",
      cargoQueOcupou: item.cargoQueOcupou || item.cargo || "",
      unidadeDirecao: item.unidadeDirecao || item.unidade || item.direcao || "",
      departamento: item.departamento || "",
      dataNomeacao: item.dataNomeacao || item.inicio || "",
      dataCessacao: item.dataCessacao || item.fim || "",
      emExercicio: Boolean(item.emExercicio || (!item.dataCessacao && !item.fim && item.status !== "Cessado")),
      despacho: item.despacho || "",
      observacoes: item.observacoes || "",
      setoresDirigidos: initialSetores,
    });
    setShowModal(true);
  };

  // Ao selecionar um colaborador na lista de sugestões do modal
  const handleSelectColaborador = (colabId: string) => {
    const colab = colaboradores.find((c) => c.id === colabId);
    if (colab) {
      const cargo = colab.cargoChefia || colab.cargo || "";
      const setor = [colab.direcao || colab.unidade || "", colab.departamento || ""].filter(Boolean).join(" - ");
      const dataNomeacao = colab.dataNomeacao || colab.dataMandato || colab.inicioMandato || colab.admissao || "";
      const dataCessacao = colab.dataCessacao || colab.dataDespromocao || "";
      const emExercicio = !dataCessacao && colab.estadoMandato !== "Cessado";

      setFormData((prev) => ({
        ...prev,
        colaboradorId: colab.id,
        idMecanografico: colab.mecanografico || colab.numeroDocumento || colab.id || prev.idMecanografico,
        nomeCompleto: colab.nomeCompleto || colab.nome || prev.nomeCompleto,
        naturalidade: formatNaturalidade(colab) || prev.naturalidade,
        cargoQueOcupou: prev.cargoQueOcupou || cargo,
        unidadeDirecao: prev.unidadeDirecao || colab.direcao || colab.unidade || "",
        departamento: prev.departamento || colab.departamento || "",
        dataNomeacao: prev.dataNomeacao || dataNomeacao,
        dataCessacao: prev.dataCessacao || dataCessacao,
        emExercicio: prev.emExercicio || emExercicio,
        setoresDirigidos: prev.setoresDirigidos.length > 0 ? prev.setoresDirigidos : [
          {
            id: `s_${Date.now()}`,
            cargo: cargo || "Diretor / Chefe",
            setor: setor || "Setor Orgânico",
            dataNomeacao: dataNomeacao,
            dataCessacao: emExercicio ? "" : dataCessacao,
            emExercicio: emExercicio,
          }
        ],
      }));
    }
  };

  // Manipular adição e remoção de múltiplos setores dirigidos
  const handleAddSetorDirigido = () => {
    const newSetor: SetorDirigidoItem = {
      id: `setor_${Date.now()}`,
      cargo: "",
      setor: "",
      dataNomeacao: "",
      dataCessacao: "",
      emExercicio: false,
    };
    setFormData((prev) => ({
      ...prev,
      setoresDirigidos: [...prev.setoresDirigidos, newSetor],
    }));
  };

  const handleUpdateSetorDirigido = (index: number, field: keyof SetorDirigidoItem, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.setoresDirigidos];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, setoresDirigidos: updated };
    });
  };

  const handleRemoveSetorDirigido = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      setoresDirigidos: prev.setoresDirigidos.filter((_, i) => i !== index),
    }));
  };

  // Guardar registo (Criar ou Atualizar)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomeCompleto.trim()) {
      alert("Por favor, preencha o Nome Completo do colaborador.");
      return;
    }

    // Se houver setores definidos, garantir que o cargo e datas principais coincidam
    let mainCargo = formData.cargoQueOcupou.trim();
    let mainUnidade = formData.unidadeDirecao.trim();
    let mainDataNomeacao = formData.dataNomeacao;
    let mainDataCessacao = formData.emExercicio ? "" : formData.dataCessacao;
    let mainEmExercicio = formData.emExercicio;

    if (formData.setoresDirigidos.length > 0) {
      if (!mainCargo) {
        mainCargo = formData.setoresDirigidos.map((s) => s.cargo).filter(Boolean).join(" / ");
      }
      if (!mainDataNomeacao) {
        const sortedStart = [...formData.setoresDirigidos]
          .filter((s) => s.dataNomeacao)
          .sort((a, b) => a.dataNomeacao.localeCompare(b.dataNomeacao));
        if (sortedStart.length > 0) mainDataNomeacao = sortedStart[0].dataNomeacao;
      }
      const hasEmExercicio = formData.setoresDirigidos.some((s) => s.emExercicio);
      if (hasEmExercicio) {
        mainEmExercicio = true;
        mainDataCessacao = "";
      }
    }

    if (!mainCargo) {
      alert("Por favor, preencha o Cargo que Ocupou ou adicione pelo menos um setor dirigido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        colaboradorId: formData.colaboradorId || null,
        idMecanografico: formData.idMecanografico.trim() || (formData.colaboradorId ? formData.colaboradorId.substring(0, 8).toUpperCase() : "N/D"),
        nomeCompleto: formData.nomeCompleto.trim(),
        naturalidade: formData.naturalidade.trim() || "Moçambique",
        cargoQueOcupou: mainCargo,
        unidadeDirecao: mainUnidade,
        departamento: formData.departamento.trim(),
        dataNomeacao: mainDataNomeacao,
        dataCessacao: mainEmExercicio ? "" : mainDataCessacao,
        emExercicio: mainEmExercicio,
        despacho: formData.despacho.trim(),
        observacoes: formData.observacoes.trim(),
        setoresDirigidos: formData.setoresDirigidos,
        registadoEm: editingItem?.registadoEm || new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };

      if (editingItem?.id) {
        const docRef = doc(db, "historico_chefias", editingItem.id);
        await updateDoc(docRef, payload);
      } else {
        const newDocRef = doc(collection(db, "historico_chefias"));
        await setDoc(newDocRef, payload);
      }

      setShowModal(false);
      setEditingItem(null);
    } catch (err: any) {
      console.error("Erro ao gravar registo:", err);
      alert(`Erro ao guardar: ${err.message || String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar registo do histórico
  const handleDelete = async (id: string, nome: string, cargo: string) => {
    if (window.confirm(`Tem a certeza que deseja eliminar o registo de chefia de "${nome}" como "${cargo}"?`)) {
      try {
        await deleteDoc(doc(db, "historico_chefias", id));
      } catch (err: any) {
        console.error("Erro ao eliminar:", err);
        alert(`Erro ao eliminar: ${err.message || String(err)}`);
      }
    }
  };

  // Filtragem e ordenação dos dados
  const filteredHistorico = historico
    .filter((item) => {
      const nome = (item.nomeCompleto || item.nome || "").toLowerCase();
      const idMec = (item.idMecanografico || item.id || "").toLowerCase();
      const cargo = (item.cargoQueOcupou || item.cargo || "").toLowerCase();
      const nat = (item.naturalidade || "").toLowerCase();
      const unidade = (item.unidadeDirecao || item.unidade || item.departamento || "").toLowerCase();
      const search = searchTerm.toLowerCase().trim();

      const matchSearch =
        !search ||
        nome.includes(search) ||
        idMec.includes(search) ||
        cargo.includes(search) ||
        nat.includes(search) ||
        unidade.includes(search);

      const isCessado = Boolean(item.dataCessacao || item.fim || (!item.emExercicio && item.status === "Cessado"));
      const isEmExercicio = Boolean(item.emExercicio || (!item.dataCessacao && !item.fim && item.status !== "Cessado"));

      if (filterStatus === "cessados" && !isCessado) return false;
      if (filterStatus === "em_exercicio" && !isEmExercicio) return false;

      // Filtro Geográfico por Região ou Província
      if (selectedRegiao || selectedProvincia) {
        const parsed = parseRegiaoEProvincia(item.naturalidade);
        if (selectedRegiao && parsed.regiao !== selectedRegiao) return false;
        if (selectedProvincia && parsed.provincia !== selectedProvincia) return false;
      }

      return matchSearch;
    })
    .sort((a, b) => {
      const nomeA = (a.nomeCompleto || a.nome || "").toLowerCase();
      const nomeB = (b.nomeCompleto || b.nome || "").toLowerCase();
      return nomeA.localeCompare(nomeB);
    });

  // Estatísticas rápidas
  const totalRegistos = historico.length;
  const totalCessados = historico.filter((h) => h.dataCessacao || h.fim || (!h.emExercicio && h.status === "Cessado")).length;
  const totalEmExercicio = totalRegistos - totalCessados;

  // Função de Impressão Oficial com as Colunas Solicitadas
  const handlePrint = () => {
    const now = new Date();
    const dataHoraStr = now.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) + " " + now.toLocaleTimeString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Contagem por Província e Região para o Resumo Impresso
    const contagemReg: Record<string, number> = { Norte: 0, Centro: 0, Sul: 0, Outros: 0 };
    const contagemProv: Record<string, number> = {};

    historico.forEach((item) => {
      const { provincia, regiao } = parseRegiaoEProvincia(item.naturalidade);
      contagemReg[regiao] = (contagemReg[regiao] || 0) + 1;
      contagemProv[provincia] = (contagemProv[provincia] || 0) + 1;
    });

    const rowsHtml = filteredHistorico
      .map((item, index) => {
        const numOrdem = String(index + 1).padStart(2, "0");
        const idColab = item.idMecanografico || item.id?.substring(0, 8).toUpperCase() || "N/D";
        const nome = item.nomeCompleto || item.nome || "N/D";
        const naturalidade = item.naturalidade || "Moçambique";
        
        // Renderizar vários setores dirigidos com o seu tempo de mandato
        let cargoQueOcupouHtml = "";
        if (Array.isArray(item.setoresDirigidos) && item.setoresDirigidos.length > 0) {
          cargoQueOcupouHtml = item.setoresDirigidos
            .map((s: SetorDirigidoItem) => {
              const tempoSetor = calcularTempoMandato(s.dataNomeacao, s.dataCessacao, s.emExercicio);
              return `
                <div style="margin-bottom: 4px; padding-bottom: 4px; border-bottom: 1px dashed #cbd5e1;">
                  <strong style="color: #0f172a;">${s.cargo}</strong>
                  ${s.setor ? `<div style="color: #1e3a8a; font-size: 10px;">${s.setor}</div>` : ""}
                  ${tempoSetor ? `<div style="color: #b45309; font-size: 9.5px; font-weight: bold;">⏱️ Tempo: ${tempoSetor.texto}</div>` : ""}
                </div>
              `;
            })
            .join("");
        } else {
          const cargo = item.cargoQueOcupou || item.cargo || "N/D";
          const unidade = item.unidadeDirecao || item.unidade || item.departamento ? ` (${item.unidadeDirecao || item.unidade || item.departamento})` : "";
          cargoQueOcupouHtml = `<strong>${cargo}</strong>${unidade}`;
        }
        
        let dataNomeacao = "N/D";
        if (item.dataNomeacao || item.inicio) {
          const raw = item.dataNomeacao || item.inicio;
          dataNomeacao = !isNaN(Date.parse(raw)) ? new Date(raw).toLocaleDateString("pt-PT") : raw;
        }

        const isEmExercicio = Boolean(item.emExercicio || (!item.dataCessacao && !item.fim && item.status !== "Cessado"));
        let dataCessacao = '<span style="color:#047857;font-weight:bold;">Em Exercício</span>';
        if (item.dataCessacao || item.fim) {
          const raw = item.dataCessacao || item.fim;
          dataCessacao = !isNaN(Date.parse(raw)) ? new Date(raw).toLocaleDateString("pt-PT") : raw;
        } else if (!item.emExercicio && item.status === "Cessado") {
          dataCessacao = "Cessado";
        }

        // Cálculo dinâmico do tempo de mandato desde o dia nomeado até ao dia exonerado
        const tempoMandatoObj = calcularTempoMandato(item.dataNomeacao, item.dataCessacao, isEmExercicio);
        const tempoMandatoHtml = tempoMandatoObj 
          ? `<strong style="color: #1e1b4b;">${tempoMandatoObj.texto}</strong><div style="font-size: 9.5px; color: #64748b;">${tempoMandatoObj.totalDias} dias</div>`
          : '<span style="color: #94a3b8;">-</span>';

        return `
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
            <td style="padding: 8px 6px; text-align: center; font-weight: bold; color: #475569;">${numOrdem}</td>
            <td style="padding: 8px 6px; font-family: monospace; font-weight: bold; color: #1e3a8a; text-align: center;">${idColab}</td>
            <td style="padding: 8px 6px; font-weight: bold; color: #0f172a;">${nome}</td>
            <td style="padding: 8px 6px; color: #334155;">${naturalidade}</td>
            <td style="padding: 8px 6px; color: #1e293b;">${cargoQueOcupouHtml}</td>
            <td style="padding: 8px 6px; text-align: center; color: #1e3a8a; font-weight: 500;">${dataNomeacao}</td>
            <td style="padding: 8px 6px; text-align: center;">${dataCessacao}</td>
            <td style="padding: 8px 6px; text-align: center;">${tempoMandatoHtml}</td>
          </tr>
        `;
      })
      .join("");

    const contentHtml = `
      <div style="font-family: Arial, sans-serif; padding: 10px 0;">
        <div style="text-align: center; margin-bottom: 18px;">
          <h2 style="font-size: 14px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">
            COLABORADORES QUE JÁ OCUPARAM CARGOS DE CHEFIA
          </h2>
          <p style="font-size: 10px; color: #64748b; margin: 0;">
            Registo oficial e genealógico de mandatos de chefia com distribuição demográfica, setores dirigidos e tempo de mandato.
          </p>
        </div>

        <!-- QUADRO DEMOGRÁFICO RESUMIDO POR REGIÃO E PROVÍNCIA -->
        <div style="margin-bottom: 14px; padding: 10px 12px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 10px;">
          <strong style="color: #0f172a; font-size: 11px;">DISTRIBUIÇÃO GEOGRÁFICA REGIONAL:</strong>
          <div style="display: flex; justify-content: space-between; margin-top: 6px; color: #334155;">
            <span>• <strong>Região Norte:</strong> ${contagemReg.Norte} chefia(s)</span>
            <span>• <strong>Região Centro:</strong> ${contagemReg.Centro} chefia(s)</span>
            <span>• <strong>Região Sul:</strong> ${contagemReg.Sul} chefia(s)</span>
            <span>• <strong>Total de Registos:</strong> ${totalRegistos}</span>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f1f5f9; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; font-size: 10px; font-weight: 900; color: #0f172a; text-transform: uppercase;">
              <th style="padding: 8px 6px; text-align: center; width: 40px;">N/O</th>
              <th style="padding: 8px 6px; text-align: center; width: 75px;">ID</th>
              <th style="padding: 8px 6px; text-align: left;">NOME COMPLETO</th>
              <th style="padding: 8px 6px; text-align: left; width: 120px;">NATURALIDADE</th>
              <th style="padding: 8px 6px; text-align: left;">CARGO QUE OCUPOU</th>
              <th style="padding: 8px 6px; text-align: center; width: 100px;">DATA DE NOMEAÇÃO</th>
              <th style="padding: 8px 6px; text-align: center; width: 100px;">DATA DE CESSAÇÃO</th>
              <th style="padding: 8px 6px; text-align: center; width: 115px;">TEMPO DE MANDATO</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="8" style="text-align:center; padding: 20px; color: #94a3b8;">Nenhum registo encontrado.</td></tr>`}
          </tbody>
        </table>

        <div style="margin-top: 20px; display: flex; justify-content: space-between; font-size: 10px; color: #475569; border-top: 1px solid #cbd5e1; padding-top: 8px;">
          <span><strong>Total de Registos Listados:</strong> ${filteredHistorico.length}</span>
          <span><strong>Emitido em:</strong> ${dataHoraStr}</span>
        </div>
      </div>
    `;

    openPrintDocumentWindow({
      title: "COLABORADORES QUE JÁ OCUPARAM CARGOS DE CHEFIA",
      subtitle: `Registo Institucional de Histórico de Chefias - ${now.getFullYear()}`,
      orientation: "landscape",
      pageSize: "A4",
      contentHtml: contentHtml,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. CABEÇALHO INSTITUCIONAL OFICIAL */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/80 overflow-hidden">
        <InstitutionalHeader
          year={new Date().getFullYear()}
          title="COLABORADORES QUE JÁ OCUPARAM CARGOS DE CHEFIA"
        />
        
        {/* Banner do Título Oficial */}
        <div className="mt-4 pt-4 border-t border-slate-200 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-6 py-2 rounded-full shadow-md mb-2">
            <Award size={18} className="text-amber-400" />
            <span className="text-sm font-black tracking-wider uppercase">
              COLABORADORES QUE JÁ OCUPARAM CARGOS DE CHEFIA
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium max-w-3xl mx-auto">
            Registo oficial e genealógico de colaboradores que exerceram ou exercem funções de Direção, Chefia ou Coordenação. 
            O nome de um colaborador pode constar múltiplas vezes de acordo com os diferentes cargos ou unidades que já ocupou ao longo da sua carreira.
          </p>
        </div>
      </div>

      {/* 2. BARRA DE ESTATÍSTICAS E AÇÕES RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total de Mandatos</p>
            <p className="text-2xl font-black text-slate-900">{totalRegistos}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Award size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mandatos Cessados</p>
            <p className="text-2xl font-black text-amber-700">{totalCessados}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Em Exercício Atual</p>
            <p className="text-2xl font-black text-emerald-700">{totalEmExercicio}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-4 rounded-2xl shadow-md text-white flex flex-col justify-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs py-2 px-3 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} /> Novo Registo de Chefia
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleSincronizarColaboradores}
              disabled={syncing}
              className="flex-1 bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] py-1.5 px-2 rounded-xl transition border border-white/20 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              title="Importar automaticamente colaboradores com cargo de chefia"
            >
              <RefreshCw size={12} className={syncing ? "animate-spin" : ""} /> Sincronizar
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] py-1.5 px-2 rounded-xl transition border border-white/20 flex items-center justify-center gap-1 cursor-pointer"
              title="Imprimir Relatório Oficial"
            >
              <Printer size={12} /> Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* Feedback message */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 3. GRÁFICOS DE COMPARAÇÃO POR PROVÍNCIA E REGIONAL (NORTE, CENTRO, SUL) */}
      <HistoricoChefiasGraficos
        historico={historico}
        selectedRegiao={selectedRegiao}
        selectedProvincia={selectedProvincia}
        onSelectRegiao={(regiao) => {
          setSelectedRegiao(regiao);
          if (regiao) setSelectedProvincia(null);
        }}
        onSelectProvincia={(prov) => {
          setSelectedProvincia(prov);
          if (prov) setSelectedRegiao(null);
        }}
      />

      {/* 4. BARRA DE FILTROS E PESQUISA */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por Nome, ID, Cargo, Naturalidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Badge de Filtro Geográfico Ativo */}
          {(selectedRegiao || selectedProvincia) && (
            <div className="flex items-center gap-1.5 bg-blue-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs animate-in fade-in whitespace-nowrap">
              <span>{selectedProvincia ? `Província: ${selectedProvincia}` : `Região: ${selectedRegiao}`}</span>
              <button
                onClick={() => {
                  setSelectedRegiao(null);
                  setSelectedProvincia(null);
                }}
                className="hover:bg-white/20 rounded-full p-0.5 ml-1 transition cursor-pointer"
                title="Remover filtro geográfico"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Filtrar:</span>
          <button
            onClick={() => setFilterStatus("todos")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === "todos"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Todos ({totalRegistos})
          </button>
          <button
            onClick={() => setFilterStatus("cessados")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === "cessados"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Cessados ({totalCessados})
          </button>
          <button
            onClick={() => setFilterStatus("em_exercicio")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === "em_exercicio"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Em Exercício ({totalEmExercicio})
          </button>
        </div>
      </div>

      {/* 4. TABELA PRINCIPAL DE HISTÓRICO COM AS COLUNAS REQUISITADAS */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <ProcessingCircle size={36} strokeWidth={2} />
            <p className="text-xs font-bold text-slate-400 tracking-wider animate-pulse">
              A CARREGAR HISTÓRICO DE CHEFIAS...
            </p>
          </div>
        ) : filteredHistorico.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Info size={32} />
            </div>
            <h4 className="text-sm font-black text-slate-700 mb-1">
              Nenhum registo de histórico de chefia encontrado
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              {searchTerm
                ? "Não foram encontrados resultados para a pesquisa realizada."
                : "Utilize o botão '+ Novo Registo de Chefia' ou 'Sincronizar' para preencher a base de dados histórica."}
            </p>
            <button
              onClick={handleSincronizarColaboradores}
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={14} /> Sincronizar com Colaboradores
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
                  <th className="px-4 py-3.5 text-center w-14">N/O</th>
                  <th className="px-4 py-3.5 text-center w-28">ID</th>
                  <th className="px-6 py-3.5">NOME COMPLETO</th>
                  <th className="px-5 py-3.5">NATURALIDADE</th>
                  <th className="px-6 py-3.5">CARGO QUE OCUPOU</th>
                  <th className="px-4 py-3.5 text-center w-36">DATA DE NOMEAÇÃO</th>
                  <th className="px-4 py-3.5 text-center w-36">DATA DE CESSAÇÃO</th>
                  <th className="px-4 py-3.5 text-center w-40">TEMPO DE MANDATO</th>
                  <th className="px-4 py-3.5 text-center w-24">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredHistorico.map((item, idx) => {
                  const numOrdem = String(idx + 1).padStart(2, "0");
                  const idFormatado = item.idMecanografico || item.colaboradorId?.substring(0, 8).toUpperCase() || item.id?.substring(0, 8).toUpperCase() || "N/D";
                  const nome = item.nomeCompleto || item.nome || "N/D";
                  const naturalidade = item.naturalidade || "Moçambique";
                  const cargo = item.cargoQueOcupou || item.cargo || "N/D";
                  const unidade = item.unidadeDirecao || item.unidade || item.departamento || "";

                  // Formatar Data de Nomeação
                  let dataNomeacaoFormatada = "N/D";
                  if (item.dataNomeacao || item.inicio) {
                    const raw = item.dataNomeacao || item.inicio;
                    dataNomeacaoFormatada = !isNaN(Date.parse(raw)) ? new Date(raw).toLocaleDateString("pt-PT") : raw;
                  }

                  // Formatar Data de Cessação
                  const isEmExercicio = Boolean(item.emExercicio || (!item.dataCessacao && !item.fim && item.status !== "Cessado"));
                  let dataCessacaoFormatada = "";
                  if (isEmExercicio) {
                    dataCessacaoFormatada = "Em Exercício";
                  } else if (item.dataCessacao || item.fim) {
                    const raw = item.dataCessacao || item.fim;
                    dataCessacaoFormatada = !isNaN(Date.parse(raw)) ? new Date(raw).toLocaleDateString("pt-PT") : raw;
                  } else {
                    dataCessacaoFormatada = "Cessado";
                  }

                  // Calcular Tempo de Mandato Global
                  const tempoMandatoObj = calcularTempoMandato(item.dataNomeacao, item.dataCessacao, isEmExercicio);

                  return (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* N/O */}
                      <td className="px-4 py-3.5 text-center font-bold text-slate-500 bg-slate-50/50">
                        {numOrdem}
                      </td>

                      {/* ID */}
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-blue-900">
                        <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200">
                          {idFormatado}
                        </span>
                      </td>

                      {/* NOME COMPLETO */}
                      <td className="px-6 py-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-900 to-indigo-800 text-amber-300 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                            {nome.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="leading-tight">{nome}</p>
                            {item.despacho && (
                              <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                                Despacho: {item.despacho}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* NATURALIDADE */}
                      <td className="px-5 py-3.5 text-slate-700 font-medium">
                        {naturalidade}
                      </td>

                      {/* CARGO QUE OCUPOU (COM SUPORTE A MÚLTIPLOS SETORES E TEMPO EM CADA UM) */}
                      <td className="px-6 py-3.5">
                        {Array.isArray(item.setoresDirigidos) && item.setoresDirigidos.length > 0 ? (
                          <div className="space-y-2 py-1">
                            {item.setoresDirigidos.map((s: SetorDirigidoItem, sIdx: number) => {
                              const tempoSetor = calcularTempoMandato(s.dataNomeacao, s.dataCessacao, s.emExercicio);
                              return (
                                <div
                                  key={s.id || sIdx}
                                  className="bg-slate-50/90 hover:bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs transition"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-slate-900 text-xs">
                                      {s.cargo}
                                    </span>
                                    {s.emExercicio && (
                                      <span className="bg-emerald-100 text-emerald-800 text-[9.5px] font-bold px-1.5 py-0.5 rounded-md">
                                        Atual
                                      </span>
                                    )}
                                  </div>
                                  {s.setor && (
                                    <span className="text-[11px] text-blue-800 font-semibold mt-0.5 flex items-center gap-1">
                                      <Building size={11} className="text-blue-500 shrink-0" />
                                      {s.setor}
                                    </span>
                                  )}
                                  {tempoSetor && (
                                    <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60 inline-flex">
                                      <Clock size={10} className="text-amber-600 shrink-0" />
                                      <span>Tempo no Setor: {tempoSetor.texto}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">
                              {cargo}
                            </span>
                            {unidade && (
                              <span className="text-[11px] text-blue-700 font-semibold mt-0.5 flex items-center gap-1">
                                <Building size={11} className="text-blue-500 shrink-0" />
                                {unidade}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* DATA DE NOMEAÇÃO */}
                      <td className="px-4 py-3.5 text-center font-mono text-slate-800 font-semibold">
                        <div className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs">
                          <Calendar size={11} className="text-slate-500" />
                          {dataNomeacaoFormatada}
                        </div>
                      </td>

                      {/* DATA DE CESSAÇÃO */}
                      <td className="px-4 py-3.5 text-center">
                        {isEmExercicio ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[11px] border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Em Exercício
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 font-mono font-semibold px-2 py-0.5 rounded text-xs border border-amber-200">
                            <Clock size={11} className="text-amber-600" />
                            {dataCessacaoFormatada}
                          </span>
                        )}
                      </td>

                      {/* TEMPO DE MANDATO (CALCULADO AUTOMATICAMENTE) */}
                      <td className="px-4 py-3.5 text-center">
                        {tempoMandatoObj ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-950 font-bold px-2.5 py-1 rounded-lg text-xs border border-indigo-200 whitespace-nowrap shadow-2xs">
                              <Clock size={12} className="text-indigo-600 shrink-0" />
                              {tempoMandatoObj.texto}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                              {isEmExercicio ? (
                                <span className="text-emerald-700 font-bold">● Em curso ({tempoMandatoObj.totalDias} dias)</span>
                              ) : (
                                `${tempoMandatoObj.totalDias} dias exercidos`
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">-</span>
                        )}
                      </td>

                      {/* AÇÕES */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                            title="Editar Mandato"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, nome, cargo)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition cursor-pointer"
                            title="Eliminar do Histórico"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Rodapé da tabela com contadores */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 font-medium">
          <span>
            Mostrando <strong>{filteredHistorico.length}</strong> de <strong>{totalRegistos}</strong> registos de chefia
          </span>
          <span className="italic text-[11px] text-slate-400">
            * O mesmo colaborador pode constar múltiplas vezes dependendo dos cargos exercidos.
          </span>
        </div>
      </div>

      {/* 5. MODAL DE ADICIONAR / EDITAR MANDATO DE CHEFIA */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8"
            >
              {/* Header do Modal */}
              <div className="bg-gradient-to-r from-blue-950 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                    <Award size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight">
                      {editingItem ? "Editar Registo de Chefia" : "Novo Registo de Mandato de Chefia"}
                    </h3>
                    <p className="text-[11px] text-blue-200">
                      Preencha os dados do mandato e afetação do colaborador
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Formulário do Modal */}
              <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Seleção de Colaborador Existente (opcional para preenchimento rápido) */}
                {!editingItem && (
                  <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200/80">
                    <label className="block text-[11px] font-bold text-blue-950 uppercase mb-1">
                      Preenchimento Rápido (Selecionar Colaborador Existente)
                    </label>
                    <select
                      value={formData.colaboradorId}
                      onChange={(e) => handleSelectColaborador(e.target.value)}
                      className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="">-- Selecione ou preencha manualmente abaixo --</option>
                      {colaboradores.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nomeCompleto || c.nome} {c.cargoChefia ? `(${c.cargoChefia})` : c.cargo ? `(${c.cargo})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome Completo */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NOME COMPLETO *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Prof. Doutor António Manuel..."
                      value={formData.nomeCompleto}
                      onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* ID / Mecanográfico */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ID / Nº MECANOGRÁFICO
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: MEC-0492 / ID-012"
                      value={formData.idMecanografico}
                      onChange={(e) => setFormData({ ...formData, idMecanografico: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* Naturalidade */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NATURALIDADE
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Tete - Cahora Bassa / Maputo"
                      value={formData.naturalidade}
                      onChange={(e) => setFormData({ ...formData, naturalidade: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* Cargo Que Ocupou */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      CARGO PRINCIPAL QUE OCUPOU *
                    </label>
                    <input
                      type="text"
                      required={formData.setoresDirigidos.length === 0}
                      placeholder="Ex: Diretor de Divisão, Chefe de Departamento, Coordenador..."
                      value={formData.cargoQueOcupou}
                      onChange={(e) => setFormData({ ...formData, cargoQueOcupou: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* SEÇÃO DINÂMICA: VÁRIOS SETORES QUE DIRIGIU COM TEMPO DE MANDATO EM CADA UM */}
                  <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                          <Building size={14} className="text-blue-900" />
                          Vários Setores Dirigidos & Tempo em Cada Setor
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Registe todos os setores que o colaborador dirigiu ao longo da sua carreira e os seus respetivos tempos.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSetorDirigido}
                        className="bg-blue-900 hover:bg-blue-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Plus size={13} /> Adicionar Setor
                      </button>
                    </div>

                    {formData.setoresDirigidos.length === 0 ? (
                      <div className="bg-white/80 p-3 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                        Nenhum setor adicional configurado. Pode registar o cargo e setor padrão abaixo, ou clicar em <strong>"+ Adicionar Setor"</strong> para discriminar múltiplos mandatos.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formData.setoresDirigidos.map((setorItem, sIdx) => {
                          const tempoSetor = calcularTempoMandato(
                            setorItem.dataNomeacao,
                            setorItem.dataCessacao,
                            setorItem.emExercicio
                          );
                          return (
                            <div
                              key={setorItem.id || sIdx}
                              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5 relative"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black uppercase text-blue-950 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                  Setor #{sIdx + 1}
                                </span>
                                <div className="flex items-center gap-2">
                                  {tempoSetor && (
                                    <span className="text-[10.5px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                      ⏱️ {tempoSetor.texto} ({tempoSetor.totalDias} dias)
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSetorDirigido(sIdx)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition cursor-pointer"
                                    title="Remover setor"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                  <label className="block text-[10.5px] font-bold text-slate-600 mb-0.5">
                                    Cargo no Setor *
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Ex: Chefe do Setor de Pessoal..."
                                    value={setorItem.cargo}
                                    onChange={(e) =>
                                      handleUpdateSetorDirigido(sIdx, "cargo", e.target.value)
                                    }
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10.5px] font-bold text-slate-600 mb-0.5">
                                    Nome do Setor / Unidade *
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Ex: Repartição de Recursos Humanos..."
                                    value={setorItem.setor}
                                    onChange={(e) =>
                                      handleUpdateSetorDirigido(sIdx, "setor", e.target.value)
                                    }
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                <div>
                                  <label className="block text-[10.5px] font-bold text-slate-600 mb-0.5">
                                    Data de Nomeação no Setor
                                  </label>
                                  <input
                                    type="date"
                                    value={setorItem.dataNomeacao}
                                    onChange={(e) =>
                                      handleUpdateSetorDirigido(sIdx, "dataNomeacao", e.target.value)
                                    }
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <div className="flex justify-between items-center mb-0.5">
                                    <label className="block text-[10.5px] font-bold text-slate-600">
                                      Data de Cessação
                                    </label>
                                    <label className="inline-flex items-center gap-1 cursor-pointer text-[10.5px] font-bold text-emerald-700">
                                      <input
                                        type="checkbox"
                                        checked={setorItem.emExercicio}
                                        onChange={(e) =>
                                          handleUpdateSetorDirigido(sIdx, "emExercicio", e.target.checked)
                                        }
                                        className="rounded text-emerald-600 focus:ring-emerald-500 h-3 w-3"
                                      />
                                      <span>Em Exercício</span>
                                    </label>
                                  </div>
                                  <input
                                    type="date"
                                    disabled={setorItem.emExercicio}
                                    value={setorItem.dataCessacao}
                                    onChange={(e) =>
                                      handleUpdateSetorDirigido(sIdx, "dataCessacao", e.target.value)
                                    }
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Unidade / Direção */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      DIREÇÃO / UNIDADE ORGÂNICA
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Direção Geral, Divisão de Ensino..."
                      value={formData.unidadeDirecao}
                      onChange={(e) => setFormData({ ...formData, unidadeDirecao: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* Departamento / Repartição */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      DEPARTAMENTO / REPARTIÇÃO
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Departamento de Recursos Humanos..."
                      value={formData.departamento}
                      onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* Data de Nomeação */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      DATA DE NOMEAÇÃO GERAL
                    </label>
                    <input
                      type="date"
                      value={formData.dataNomeacao}
                      onChange={(e) => setFormData({ ...formData, dataNomeacao: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* Data de Cessação ou Em Exercício */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        DATA DE CESSAÇÃO GERAL
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-emerald-700">
                        <input
                          type="checkbox"
                          checked={formData.emExercicio}
                          onChange={(e) => setFormData({ ...formData, emExercicio: e.target.checked })}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Em Exercício</span>
                      </label>
                    </div>
                    <input
                      type="date"
                      disabled={formData.emExercicio}
                      value={formData.dataCessacao}
                      onChange={(e) => setFormData({ ...formData, dataCessacao: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-50 disabled:bg-slate-100"
                    />
                  </div>

                  {/* Despacho / Instrumento Legal */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      DESPACHO / DIPLOMA DE NOMEAÇÃO (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Despacho nº 14/DG/2021"
                      value={formData.despacho}
                      onChange={(e) => setFormData({ ...formData, despacho: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* Observações */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      OBSERVAÇÕES (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Notas adicionais sobre o mandato..."
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Ações do Modal */}
                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 transition shadow-md inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save size={15} />
                    {isSubmitting ? "A gravar..." : editingItem ? "Atualizar Mandato" : "Gravar Mandato"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

