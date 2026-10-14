import React, { useState, useEffect } from "react";
import { 
  AlertOctagon, AlertTriangle, Info, Trash2, RefreshCw, Search, Filter, ShieldAlert, CheckCircle, Database, Calendar
} from "lucide-react";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

export const SystemLogsView = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState("todos");
  const [filterDate, setFilterDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const q = query(collection(db, "system_logs"), orderBy("timestamp", "desc"), limit(200));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLogs(items);
        setLoading(false);
      }, (err) => {
        console.warn("Erro ao subscrever system_logs:", err);
        setLoading(false);
      });
    } catch (e) {
      console.warn("Falha ao configurar query em system_logs:", e);
      setLoading(false);
    }
    return () => unsubscribe();
  }, []);

  const handleClearLogs = async () => {
    if (!window.confirm("Tem certeza que deseja apagar todos os logs de monitorização do sistema?")) return;
    setIsClearing(true);
    try {
      const snapshot = await getDocs(collection(db, "system_logs"));
      const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      setLogs([]);
    } catch (e) {
      alert("Erro ao limpar logs: " + (e as any)?.message);
    } finally {
      setIsClearing(false);
    }
  };

  const handleTestLog = async (level: "CRITICAL" | "WARNING" | "INFO") => {
    try {
      const messages = {
        CRITICAL: "Simulação de falha de execução crítica disparada no sistema.",
        WARNING: "Simulação de aviso de desempenho / tempo de resposta elevado.",
        INFO: "Simulação de evento informativo de sincronização de dados efetuada."
      };
      await addDoc(collection(db, "system_logs"), {
        level,
        message: messages[level],
        component: "ModuloMonitorizacao",
        timestamp: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      alert("Erro ao gerar log de teste: " + (e as any)?.message);
    }
  };

  const filteredLogs = logs.filter((log) => {
    // Level matching
    let matchLevel = true;
    if (filterLevel === "CRITICAL") {
      matchLevel = log.level === "CRITICAL" || log.level === "ERROR" || log.level === "Crítico";
    } else if (filterLevel === "WARNING") {
      matchLevel = log.level === "WARNING" || log.level === "Aviso";
    } else if (filterLevel === "INFO") {
      matchLevel = log.level === "INFO" || log.level === "Info";
    }

    // Date matching (YYYY-MM-DD)
    let matchDate = true;
    if (filterDate) {
      const logDateStr = log.timestamp 
        ? new Date(log.timestamp).toISOString().split("T")[0]
        : (log.createdAt?.toDate ? log.createdAt.toDate().toISOString().split("T")[0] : "");
      matchDate = logDateStr === filterDate;
    }

    // Search term matching
    const matchSearch = 
      (log.message || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.component || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.level || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchLevel && matchDate && matchSearch;
  });

  const criticalCount = logs.filter(l => l.level === "CRITICAL" || l.level === "ERROR" || l.level === "Crítico").length;
  const warningCount = logs.filter(l => l.level === "WARNING" || l.level === "Aviso").length;
  const infoCount = logs.filter(l => l.level === "INFO" || l.level === "Info").length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-black tracking-widest border border-blue-500/30 uppercase flex items-center gap-1.5">
                <ShieldAlert size={12} /> Administração Geral
              </span>
              <span className="text-xs text-slate-300 font-medium">Firestore: system_logs</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Monitorização de Sistema</h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Consola em tempo real para rastreio de erros, avisos de desempenho e eventos de execução do SIGEP.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleTestLog("CRITICAL")}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer flex items-center gap-1.5"
              title="Gerar Log Crítico de Teste"
            >
              <AlertOctagon size={14} /> + Crítico
            </button>
            <button
              onClick={() => handleTestLog("WARNING")}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition shadow cursor-pointer flex items-center gap-1.5"
              title="Gerar Aviso de Teste"
            >
              <AlertTriangle size={14} /> + Aviso
            </button>
            <button
              onClick={() => handleTestLog("INFO")}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer flex items-center gap-1.5"
              title="Gerar Log Info de Teste"
            >
              <Info size={14} /> + Info
            </button>
            <button
              onClick={handleClearLogs}
              disabled={isClearing || logs.length === 0}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition shadow cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 size={14} /> {isClearing ? "A Limpar..." : "Limpar"}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertOctagon size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Erros Críticos</span>
            <div className="text-2xl font-black text-slate-900">{criticalCount}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avisos</span>
            <div className="text-2xl font-black text-slate-900">{warningCount}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Info size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Informativos</span>
            <div className="text-2xl font-black text-slate-900">{infoCount}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Database size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Logs</span>
            <div className="text-2xl font-black text-slate-900">{logs.length}</div>
          </div>
        </div>
      </div>

      {/* Log Table & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar por mensagem, componente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters: Level & Date */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Filter size={14} className="text-slate-400" />
              <label className="text-xs font-bold text-slate-600">Nível:</label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="todos">Todos os Níveis</option>
                <option value="CRITICAL">Crítico / Erro</option>
                <option value="WARNING">Aviso (Warning)</option>
                <option value="INFO">Info (Informativo)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Calendar size={14} className="text-slate-400" />
              <label className="text-xs font-bold text-slate-600">Data:</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate("")}
                  className="text-[10px] text-blue-600 hover:underline font-bold ml-1"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-6">Nível</th>
                <th className="py-3.5 px-6">Componente / Módulo</th>
                <th className="py-3.5 px-6">Mensagem / Evento</th>
                <th className="py-3.5 px-6">Data & Hora de Ocorrência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    A carregar registos da coleção <code className="text-slate-600 font-mono">system_logs</code>...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                    Nenhum registo encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const levelUpper = String(log.level || "INFO").toUpperCase();
                  const isCritical = levelUpper === "CRITICAL" || levelUpper === "ERROR" || levelUpper === "CRÍTICO";
                  const isWarning = levelUpper === "WARNING" || levelUpper === "AVISO";

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isCritical
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : isWarning
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {isCritical && <AlertOctagon size={12} />}
                          {isWarning && <AlertTriangle size={12} />}
                          {!isCritical && !isWarning && <Info size={12} />}
                          {isCritical ? "Crítico" : isWarning ? "Aviso" : "Info"}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-800">
                        {log.component || "Sistema Geral"}
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium max-w-md">
                        {log.message}
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {log.timestamp 
                          ? new Date(log.timestamp).toLocaleString("pt-PT") 
                          : log.createdAt?.toDate 
                          ? log.createdAt.toDate().toLocaleString("pt-PT")
                          : "Recente"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
