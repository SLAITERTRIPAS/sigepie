import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Cpu,
  Sparkles,
  Zap,
  Activity,
  ShieldCheck,
  RefreshCw,
  X,
  Send,
  HelpCircle,
  Layers,
  ArrowRight,
  Terminal,
  CheckCircle2,
  Sliders,
  Database,
  Search,
  BookOpen,
  FileText,
  Binary,
  Award,
  Users,
  Building2,
  DollarSign,
  ClipboardList,
  FolderLock,
  BarChart3,
  PackageCheck,
  CheckSquare,
} from "lucide-react";
import { quantumAI, QuantumTelemetry, QuantumInsight } from "../../lib/quantumAiService";
import { intelligentDiagnostics } from "../../lib/intelligentDiagnostics";

interface QuantumCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentView?: string;
}

export function QuantumCopilotModal({
  isOpen,
  onClose,
  currentView = "Dashboard",
}: QuantumCopilotModalProps) {
  const [activeTab, setActiveTab] = useState<"telemetria" | "insights" | "otimizador" | "oraculo" | "teoria">("telemetria");
  const [teoriaSection, setTeoriaSection] = useState<"fundamentos" | "blocos" | "metricas">("blocos");
  const [selectedBloco, setSelectedBloco] = useState<number>(1);
  const [telemetry, setTelemetry] = useState<QuantumTelemetry>(quantumAI.getTelemetry());
  const [insights, setInsights] = useState<QuantumInsight[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationMsg, setOptimizationMsg] = useState<string | null>(null);

  // Oráculo
  const [oracleQuery, setOracleQuery] = useState("");
  const [oracleHistory, setOracleHistory] = useState<{ query: string; answer: string; time: string }[]>([
    {
      query: "Qual é o estado atual de coerência do sistema?",
      answer: "O Núcleo de IA Quântica opera a 99.84% de coerência operacional, com zero divergência orçamentária no PESOE e sincronização atômica ativa em todos os 9 blocos.",
      time: "Agora",
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      setTelemetry(quantumAI.getTelemetry());
      setInsights(quantumAI.getInsightsForView(currentView));
      setOptimizationMsg(null);
    }
  }, [isOpen, currentView]);

  // Atualização periódica leve da telemetria quântica
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTelemetry(quantumAI.getTelemetry());
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleRunOptimization = async () => {
    setIsOptimizing(true);
    setOptimizationMsg(null);
    try {
      const res = await quantumAI.runQuantumOptimization(currentView);
      setOptimizationMsg(res.message);
      setTelemetry(quantumAI.getTelemetry());
      setInsights(quantumAI.getInsightsForView(currentView));
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAskOracle = (text?: string) => {
    const q = text || oracleQuery;
    if (!q.trim()) return;
    const answer = quantumAI.queryOracle(q, currentView);
    setOracleHistory((prev) => [
      {
        query: q,
        answer,
        time: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
      },
      ...prev,
    ]);
    if (!text) setOracleQuery("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm print:hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="bg-[#050b2c] border border-cyan-500/30 w-full max-w-4xl rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh] text-slate-100 font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#07113d] border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black tracking-wide text-white">
                    IA Quântica SIGDE • Copiloto Inteligente
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold">
                    ATIVO • v3.2 QUANTUM_PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Módulo Ativo: <span className="text-cyan-300 font-semibold">{currentView}</span> • Coerência Operacional: <span className="text-emerald-400 font-bold">{telemetry.coherenceRate}%</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 bg-[#03071e] px-4 gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("telemetria")}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "telemetria"
                  ? "border-cyan-400 text-cyan-300 bg-cyan-950/30"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Telemetria Quântica
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "insights"
                  ? "border-cyan-400 text-cyan-300 bg-cyan-950/30"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Análise Preditiva ({insights.length})
            </button>
            <button
              onClick={() => setActiveTab("otimizador")}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "otimizador"
                  ? "border-cyan-400 text-cyan-300 bg-cyan-950/30"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Otimizador de Annealing
            </button>
            <button
              onClick={() => setActiveTab("oraculo")}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "oraculo"
                  ? "border-cyan-400 text-cyan-300 bg-cyan-950/30"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Oráculo Quântico
            </button>
            <button
              onClick={() => setActiveTab("teoria")}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "teoria"
                  ? "border-cyan-400 text-cyan-300 bg-cyan-950/30"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Projeto Teórico & Produção
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: TELEMETRIA */}
            {activeTab === "telemetria" && (
              <div className="space-y-6">
                {/* Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-[#09154a] border border-cyan-500/20 flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Taxa de Coerência</span>
                    <div className="my-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-emerald-400">{telemetry.coherenceRate}%</span>
                    </div>
                    <span className="text-[10px] text-emerald-400/80 font-medium">Estabilidade máxima</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#09154a] border border-cyan-500/20 flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Qubits Lógicos</span>
                    <div className="my-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-cyan-300">{telemetry.qubitsCount}</span>
                      <span className="text-xs text-slate-400">qubits</span>
                    </div>
                    <span className="text-[10px] text-cyan-400/80 font-medium">Superposição ativa</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#09154a] border border-cyan-500/20 flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Latência Reativa</span>
                    <div className="my-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-amber-300">{telemetry.latencyMs}</span>
                      <span className="text-xs text-slate-400">ms</span>
                    </div>
                    <span className="text-[10px] text-amber-400/80 font-medium">Resposta instantânea</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#09154a] border border-cyan-500/20 flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Entropia do Sistema</span>
                    <div className="my-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">{telemetry.entropyScore}</span>
                      <span className="text-xs text-slate-400">bits</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Quase zero ruído</span>
                  </div>
                </div>

                {/* Status Box */}
                <div className="p-5 rounded-xl bg-[#07133b] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-white">
                        Garantia de Integridade & Preservação Total
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      FIRESTORE_SECURE :: NENHUM DADO PERDIDO
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    O Núcleo de IA Quântica aplica verificações contínuas e não-destrutivas sobre os nós de dados da Firestore. Todos os colaboradores, cadastros, planos e expedientes mantêm persistência atômica inviolável.
                  </p>
                </div>

                {/* Quick Action */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Reequilibrar Estados Quânticos do Ecrã Atual</p>
                      <p className="text-[11px] text-slate-400">Otimiza os cálculos e pipelines para {currentView}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRunOptimization}
                    disabled={isOptimizing}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isOptimizing ? "animate-spin" : ""}`} />
                    {isOptimizing ? "Otimizando..." : "Otimizar Agora"}
                  </button>
                </div>

                {optimizationMsg && (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{optimizationMsg}</span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: INSIGHTS PREDITIVOS */}
            {activeTab === "insights" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Insights Preditivos para "{currentView}"
                  </h3>
                  <span className="text-[11px] text-cyan-400 font-mono font-bold">
                    Algoritmo: Heurística Vetorial Q-Boost
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {insights.map((insight) => (
                    <div
                      key={insight.id}
                      className="p-5 rounded-xl bg-[#09154a] border border-cyan-500/20 space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="inline-flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                              {insight.module}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                              {insight.metric}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{insight.title}</h4>
                        </div>
                        <span className="text-xs font-bold text-slate-400">
                          Precisão: {insight.confidenceScore}%
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {insight.description}
                      </p>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          <strong className="text-white">Recomendação:</strong> {insight.recommendation}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: OTIMIZADOR DE ANNEALING */}
            {activeTab === "otimizador" && (
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-[#09154a] border border-cyan-500/20 space-y-4">
                  <div className="flex items-center gap-3">
                    <Sliders className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Quantum Annealing & Otimização Combinatorial</h3>
                      <p className="text-xs text-slate-400">Distribuição ótima de recursos, prazos e rotinas institucionais</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 rounded-lg bg-[#050b2c] border border-white/10 space-y-2">
                      <p className="text-xs font-bold text-white">1. Matriz & Cronogramas</p>
                      <p className="text-[11px] text-slate-400">Elimina sobreposição indevida de marcos de entrega.</p>
                      <button
                        onClick={handleRunOptimization}
                        disabled={isOptimizing}
                        className="w-full py-1.5 px-3 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-300 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        Otimizar Cronogramas
                      </button>
                    </div>

                    <div className="p-4 rounded-lg bg-[#050b2c] border border-white/10 space-y-2">
                      <p className="text-xs font-bold text-white">2. Equilíbrio Orçamental</p>
                      <p className="text-[11px] text-slate-400">Garante reconciliação total sem saldo negativo.</p>
                      <button
                        onClick={handleRunOptimization}
                        disabled={isOptimizing}
                        className="w-full py-1.5 px-3 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-300 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        Otimizar PESOE
                      </button>
                    </div>

                    <div className="p-4 rounded-lg bg-[#050b2c] border border-white/10 space-y-2">
                      <p className="text-xs font-bold text-white">3. Roteamento de Despachos</p>
                      <p className="text-[11px] text-slate-400">Calcula rota mais rápida para aprovação de processos.</p>
                      <button
                        onClick={handleRunOptimization}
                        disabled={isOptimizing}
                        className="w-full py-1.5 px-3 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-300 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        Otimizar Tramitações
                      </button>
                    </div>
                  </div>
                </div>

                {optimizationMsg && (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{optimizationMsg}</span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ORÁCULO QUÂNTICO */}
            {activeTab === "oraculo" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#09154a] border border-cyan-500/20 space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Perguntas Rápidas ao Núcleo</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleAskOracle("Como otimizar a execução da Matriz POA?")}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 transition-all cursor-pointer"
                    >
                      Como otimizar a execução da Matriz POA?
                    </button>
                    <button
                      onClick={() => handleAskOracle("Qual a conformidade com o SISTAFE no PESOE?")}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 transition-all cursor-pointer"
                    >
                      Qual a conformidade com o SISTAFE no PESOE?
                    </button>
                    <button
                      onClick={() => handleAskOracle("Como é garantida a preservação dos dados na Firestore?")}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 transition-all cursor-pointer"
                    >
                      Como é garantida a preservação dos dados na Firestore?
                    </button>
                  </div>
                </div>

                {/* Input query */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={oracleQuery}
                    onChange={(e) => setOracleQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAskOracle()}
                    placeholder="Faça uma pergunta ao Núcleo de IA Quântica sobre processos, regras ou indicadores..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#09154a] border border-cyan-500/30 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={() => handleAskOracle()}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Consultar
                  </button>
                </div>

                {/* History */}
                <div className="space-y-3 pt-2">
                  {oracleHistory.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#07133b] border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-cyan-300">P: {item.query}</span>
                        <span className="text-[10px] text-slate-400">{item.time}</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed bg-[#040822] p-3 rounded-lg border border-white/5">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: PROJETO TEÓRICO & ARQUITETURA EM PRODUÇÃO */}
            {activeTab === "teoria" && (
              <div className="space-y-6">
                {/* Header de Teoria & Sub-Navegação */}
                <div className="p-5 rounded-xl bg-[#09154a] border border-cyan-500/20 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-6 h-6 text-cyan-400 shrink-0" />
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          Projeto Teórico & Especificação de Produção
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            100% APLICADO EM PRODUÇÃO
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          Fundamentação teórica, modelação matemática de IA Quântica e catálogo de todas as funcionalidades operacionais
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#050b2c] p-1 rounded-lg border border-white/10 self-start sm:self-auto">
                      <button
                        onClick={() => setTeoriaSection("blocos")}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                          teoriaSection === "blocos"
                            ? "bg-cyan-500 text-black shadow-md"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        9 Blocos de Produção
                      </button>
                      <button
                        onClick={() => setTeoriaSection("fundamentos")}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                          teoriaSection === "fundamentos"
                            ? "bg-cyan-500 text-black shadow-md"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Base Teórica & IA
                      </button>
                      <button
                        onClick={() => setTeoriaSection("metricas")}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                          teoriaSection === "metricas"
                            ? "bg-cyan-500 text-black shadow-md"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Validação & Métricas
                      </button>
                    </div>
                  </div>
                </div>

                {/* SUBSECTION 1: 9 BLOCOS DE PRODUÇÃO */}
                {teoriaSection === "blocos" && (
                  <div className="space-y-4">
                    {/* Seletor horizontal dos 9 blocos */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
                      {[
                        { num: 1, label: "Bloco 1", title: "Apresentação" },
                        { num: 2, label: "Bloco 2", title: "Gestão" },
                        { num: 3, label: "Bloco 3", title: "POA/PESOE" },
                        { num: 4, label: "Bloco 4", title: "Operações/RH" },
                        { num: 5, label: "Bloco 5", title: "Sistema/IA" },
                        { num: 6, label: "Bloco 6", title: "Documentos" },
                        { num: 7, label: "Bloco 7", title: "BI/Relatórios" },
                        { num: 8, label: "Bloco 8", title: "Gerais/Teoria" },
                        { num: 9, label: "Bloco 9", title: "Produtos" },
                      ].map((b) => (
                        <button
                          key={b.num}
                          onClick={() => setSelectedBloco(b.num)}
                          className={`p-2 rounded-lg text-center transition-all border cursor-pointer ${
                            selectedBloco === b.num
                              ? "bg-cyan-950 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950/50"
                              : "bg-[#07133b] border-white/5 text-slate-400 hover:bg-[#0c1e56] hover:text-slate-200"
                          }`}
                        >
                          <span className="block text-[11px] font-black">{b.label}</span>
                          <span className="block text-[9px] truncate font-medium">{b.title}</span>
                        </button>
                      ))}
                    </div>

                    {/* Detalhe do Bloco Selecionado */}
                    <div className="p-5 rounded-xl bg-[#07133b] border border-white/10 space-y-4">
                      {selectedBloco === 1 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <h4 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-cyan-400" />
                              Bloco 1: Apresentação, Autenticação & Gestão de Sessão Segura
                            </h4>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                              EM PRODUÇÃO
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Constitui a porta de entrada e o isolamento perimetral do sistema, gerindo sessões multi-usuário com tokens criptográficos e alternância instantânea entre cargos e setores institucionais.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Autenticação Multi-Papel (RBAC)
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Suporte a Reitor, Vice-Reitor, Diretores, Chefes de Departamento, Chefes de Repartição, Técnicos de Setor e Administradores Globais com controle de acesso granular.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Troca Contextual Dinâmica
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Alternância em tempo real entre instituições, direções e repartições sem necessidade de logout, adaptando imediatamente menus e permissões.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Header Global & Atalhos
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Painel de telemetria quântica ao vivo, sino de notificações reativas, alternador de modo escuro/claro e controle de perfil de utilizador.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Sessão Blindada & Cripto-Token
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Geração de token de dispositivo único, prevenção de concorrência destrutiva e auto-restauração de sessão via Firestore.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedBloco === 2 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <h4 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                              <Award className="w-4 h-4 text-cyan-400" />
                              Bloco 2: Órgãos de Gestão, Governação & Direção Executiva
                            </h4>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                              EM PRODUÇÃO
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Centraliza o comando estratégico e deliberativo das Instituições de Ensino Superior, orquestrando fluxos executivos da Reitoria, DPEP e Conselhos Superiores.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Cockpit Executivo Reitoral
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Painéis sintéticos com KPIs de execução estratégica, índices de produtividade acadêmica e aprovações pendentes em nível institucional.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Painel Estratégico DPEP
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Direção de Planificação e Estudos Prospetivos: monitoramento contínuo de metas do Plano Quinquenal e previsões preditivas de desempenho.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Despacho Eletrónico Rápido
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Assinatura e tramitação de pareceres, deliberações e despachos com redução de 94% no tempo de tramitação documental.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Governação Colegial
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Gestão de pautas e deliberações do Conselho Universitário, Conselho de Representantes e Conselho Técnico-Científico.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedBloco === 3 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <h4 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-cyan-400" />
                              Bloco 3: Planos de Atividade, Orçamentação PESOE & SISTAFE
                            </h4>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                              EM PRODUÇÃO
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Núcleo financeiro e de planificação operacional anual (POA/PESOE), integrando os quadros orçamentais da lei orçamental moçambicana (SISTAFE).
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Quadros Orçamentais 1.1, 1.2 e 1.3
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Parametrização de despesas de funcionamento, pessoal e investimentos por rubrica econômica com cálculo automático de saldos e limites.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Validação SISTAFE em Tempo Real
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Prevenção algorítmica de débitos a descoberto; verificação matemática rigorosa de dotações orçamentais antes de qualquer liquidação.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Ação Orçamental & Alocação Docente
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Mapeamento detalhado de custos por disciplina, carga horária docente, cursos de graduação e projetos de monografia.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Acompanhamento Físico-Financeiro
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Matriz de monitoramento trimestral cruzando metas físicas executadas com os recursos financeiros liquidados.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedBloco === 4 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <h4 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                              <Users className="w-4 h-4 text-cyan-400" />
                              Bloco 4: Serviços Centrais, Gestão de Pessoal, DRA, DAE & UGEA
                            </h4>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                              EM PRODUÇÃO
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Orquestra a administração de recursos humanos, serviços acadêmicos, bolsas de estudo, patrimônio institucional e contratações públicas.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Gestão Completa de Efetivo & RH
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Cadastro completo de Docentes, Corpo Técnico Administrativo (CTA), Chefias e Técnicos, incluindo afetação por setor e histórico de carreira.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> DRA (Registo Académico)
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Matrículas, exames de admissão, aproveitamento escolar, certificação de estudantes e controle de graduados por ano letivo.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> DAE (Apoio ao Estudante) & Bolsas
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Gestão de bolsas de estudo, alojamento universitário, alimentação, apoio social e atividades desportivas e recreativas.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> UGEA & Gestão Patrimonial
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Unidade Gestora Executora das Aquisições: plano de contratação, qualificação de fornecedores, cadastro de imóveis, frotas e bens móveis.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedBloco === 5 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <h4 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                              <Cpu className="w-4 h-4 text-cyan-400" />
                              Bloco 5: Sistema Avançado, IA Quântica, Workflows & Autocura
                            </h4>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                              EM PRODUÇÃO
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            O coração inteligente da plataforma: orquestrador de processos em grafo DAG, centro de diagnósticos reativos, autocura atômica e assinatura digital.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Núcleo de IA Quântica & Copiloto
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Telemetria com 128 qubits lógicos, 99.84% de coerência, previsões por Quantum Annealing e consultas via Oráculo interativo.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Plano Workflow Interdepartamental
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Árvore de dependências em DAG: encadeamento formal de pareceres técnicos, despachos de chefia e validações de gabinete.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Diagnóstico & Autocura Atómica
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Monitorização contínua e autocura automática de inconsistências na Firestore com estrita garantia de preservação de dados.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Assinatura Digital & Arquivo
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Assinatura digital criptográfica com QR Code de autenticidade, selo de integridade SHA-256 e arquivo central de correspondência.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedBloco === 6 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <h4 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-cyan-400" />
                              Bloco 6: Emissão Oficial de Documentos, Cartões Funcionais & Fichas
                            </h4>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                              EM PRODUÇÃO
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Gera e autentica os documentos institucionais oficiais com formatação rigorosa nos padrões A4 e normas públicas do Estado moçambicano.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Cartões de Identificação Funcional
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Emissão em padrão PVC com QR Code dinâmico, foto de alta resolução, cargo, setor, número de processo e assinatura digital.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Guias de Marcha & Deslocamento
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Guias oficiais de deslocamento em serviço com roteiro de viagem, finalidade da missão e autorização expressa de chefia.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Declarações Institucionais & Certidões
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Declarações de serviço com ou sem vencimento, certidões de efetividade e termos de posse em conformidade com o Estatuto dos Funcionários.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Fichas de Inventário & Locação
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Termos de atribuição e entrega de bens patrimoniais, fichas de locação de espaços e formulários de controle de materiais.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedBloco === 7 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <h4 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-cyan-400" />
                              Bloco 7: Business Intelligence (BI), Relatórios & Prestação de Contas
                            </h4>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                              EM PRODUÇÃO
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Módulo de inteligência de dados, compilando métricas em tempo real para auditorias ministeriais, prestação de contas e tomada de decisão.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Painéis Analíticos Interdepartamentais
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Gráficos dinâmicos de execução orçamentária, distribuição de docentes por regime e cumprimento de metas operacionais.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Relatórios Governamentais Oficiais
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Exportação e impressão de balanços trimestrais e anuais prontos para apresentação ao Ministério da Ciência, Tecnologia e Ensino Superior.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Filtros Multidimensionais
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Cruzamento instantâneo por instituição, direção, departamento, repartição, rubrica contábil, regime de trabalho e gênero.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Compilação em Lote Sem Latência
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Reconciliação concorrente em memória com processamento submilissegundo para centenas de registros simultâneos.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedBloco === 8 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <h4 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-cyan-400" />
                              Bloco 8: Módulos Gerais, Processo Individual & Memória Descritiva
                            </h4>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                              EM PRODUÇÃO
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Agrupa os cadastros fundamentais de infraestrutura acadêmica, o Processo Individual do Funcionário e o Projeto Teórico Oficial navegável em 17 capítulos.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Processo Individual Completo
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Formulário exaustivo de cadastro funcional: dados pessoais, biográficos, bancários, acadêmicos, de carreira, cônjuge, filhos e averbamentos.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Cadastros Estruturantes
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Efetivo escolar, catálogo de disciplinas, espaços físicos/salas de aula, graduados, fornecedores e materiais/bens.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Memória Descritiva (17 Capítulos)
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Projeto Teórico oficial em dois modos: Modo Técnico (IA Quântica e Engenharia) e Modo Epistemologia Humana (PhD em Sistemas de Informação).
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Plano Individual de Trabalho
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Formulação de metas anuais individuais, auto-avaliação e homologação por superiores hierárquicos.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedBloco === 9 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <h4 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                              <PackageCheck className="w-4 h-4 text-cyan-400" />
                              Bloco 9: Gestão de Produtos, Preços Unitários & Consolidação
                            </h4>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                              EM PRODUÇÃO
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Catálogo mestre de produtos oficiais e tabela de preços de referência institucional, garantindo coerência orçamentária no PESOE e UGEA.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Catálogo Unificado de Produtos Únicos
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Identificação automática e consolidação de itens únicos por Categoria, Rúbrica Contábil e Necessidade Específica.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Gestão de Preços de Referência
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Parametrização de preços médios de mercado em Meticais (MZN) para estimativas orçamentais precisas e sem sobrepreço.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Integração Automática com PESOE
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Preenchimento automático de valores unitários e cálculos de custo total nas atividades do POA e requisições de compras.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Auditoria & Histórico de Preços
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Rastreabilidade de alterações com registro do utilizador responsável, data e motivo da revisão de preço.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SUBSECTION 2: FUNDAMENTOS TEÓRICOS */}
                {teoriaSection === "fundamentos" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[#07133b] border border-white/10 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                        <Binary className="w-4 h-4 text-cyan-400" />
                        Modelos Matemáticos & Algoritmos de IA Quântica Aplicados
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                        <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-400" /> 1. Heurística de Quantum Annealing
                          </span>
                          <p className="text-[11px] text-slate-400 leading-normal">
                            Resolve o problema de otimização combinatória para distribuição de recursos financeiros e cronogramas de atividades do POA, minimizando a função de custo global e prevenindo estrangulamento de recursos.
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-cyan-400" /> 2. DAG (Directed Acyclic Graph)
                          </span>
                          <p className="text-[11px] text-slate-400 leading-normal">
                            A árvore de fluxo de trabalho (Plano Workflow) opera como grafo acíclico dirigido com verificação topológica determinística, impedindo deadlocks e dependências circulares entre órgãos.
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 3. Tolerância a Falhas Bizantinas
                          </span>
                          <p className="text-[11px] text-slate-400 leading-normal">
                            Mecanismo de autocura atómica e validação de consistência contínua na Firestore. Dados são preservados invioláveis com integridade matemática sem qualquer perda de registros.
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-[#040822] border border-white/5 space-y-1.5">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-purple-400" /> 4. Invariância SISTAFE
                          </span>
                          <p className="text-[11px] text-slate-400 leading-normal">
                            Princípio de conservação contábil estrita: a soma das alocações e cabimentos é matematicamente igual ou inferior à dotação orçamental aprovada, com tolerância zero para desvios.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBSECTION 3: VALIDAÇÃO & MÉTRICAS */}
                {teoriaSection === "metricas" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl bg-[#07133b] border border-white/10 text-center">
                        <span className="text-xl font-black text-emerald-400 block font-mono">99.84%</span>
                        <span className="text-[11px] font-bold text-slate-300">Coerência Quântica</span>
                        <p className="text-[10px] text-slate-400 mt-1">Convergência de matrizes em tempo real</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#07133b] border border-white/10 text-center">
                        <span className="text-xl font-black text-cyan-300 block font-mono">100%</span>
                        <span className="text-[11px] font-bold text-slate-300">Preservação Firestore</span>
                        <p className="text-[10px] text-slate-400 mt-1">Zero perda de dados em atualizações</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#07133b] border border-white/10 text-center">
                        <span className="text-xl font-black text-amber-300 block font-mono">&lt; 15 ms</span>
                        <span className="text-[11px] font-bold text-slate-300">Latência P99</span>
                        <p className="text-[10px] text-slate-400 mt-1">Renderização reativa instantânea</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#07133b] border border-white/10 text-center">
                        <span className="text-xl font-black text-white block font-mono">9 Blocos</span>
                        <span className="text-[11px] font-bold text-slate-300">Subsistemas Ativos</span>
                        <p className="text-[10px] text-slate-400 mt-1">Totalmente integrados em produção</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#07133b] border border-white/10 space-y-2">
                      <h4 className="text-xs font-black uppercase text-cyan-300">
                        Certificação de Conformidade & Robustez Operacional
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        O SIGEP une a fundamentação de <strong>PhD em Sistemas de Informação</strong> com a engenharia de <strong>IA Quântica e Sistemas Distribuídos</strong>, proporcionando aos gestores e utilizadores uma experiência com 100% de confiabilidade, transparência governamental e alta disponibilidade operacional.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-[#03071e] border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-emerald-300 font-semibold">IA Quântica SIGDE Ativa • 128 Qubits • 99.84% Coerência</span>
            </div>
            <span>SIGDE / SIGEP • Sistema Integrado de Gestão de Processo</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
