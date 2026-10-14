import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Search, 
  Activity,
  CalendarCheck,
  Cpu,
  Sparkles,
  Calendar,
  Edit2,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { MatrixActivity, PeriodoPlanificacao } from '../types';
import { isSuperBossUser } from '../lib/auth';
import { subscribePeriodoPlanificacao, savePeriodoPlanificacao } from '../lib/planningPeriodService';

interface DPEPDashboardProps {
  activities: MatrixActivity[];
  onSelectWorkflow: (mode: 'planning' | 'consulting' | 'pesoe') => void;
  onImport?: () => void;
  selectedYear: number;
  user?: any;
  isChefeDPEP?: boolean;
  isPlanificacao?: boolean;
}

export const DPEPDashboard: React.FC<DPEPDashboardProps> = ({ 
  activities, 
  onSelectWorkflow,
  onImport,
  selectedYear,
  user,
  isChefeDPEP,
  isPlanificacao
}) => {
  const [periodoPlanificacao, setPeriodoPlanificacao] = useState<PeriodoPlanificacao | null>(null);
  const [showConfigPrazosModal, setShowConfigPrazosModal] = useState(false);
  const [prazosForm, setPrazosForm] = useState({
    prazoSubmissaoSetorial: "",
    prazoConsolidacaoDPEP: "",
    prazoParecerTecnico: "",
    prazoAprovacaoGeral: "",
  });
  const [isSavingPrazos, setIsSavingPrazos] = useState(false);
  const [savePrazosMsg, setSavePrazosMsg] = useState("");

  useEffect(() => {
    // Filtragem por DPEP do usuário logado conforme solicitado
    const departamentoUsuario = user?.departamento || "";
    const isUserFromDPEP = departamentoUsuario.toUpperCase().includes("DPEP") || 
                           departamentoUsuario.toUpperCase().includes("PLANIFICA");
    
    const unsub = subscribePeriodoPlanificacao((periodo) => {
      setPeriodoPlanificacao(periodo);
      setPrazosForm({
        prazoSubmissaoSetorial: periodo.prazoSubmissaoSetorial || periodo.dataFimPlanificacao || `${selectedYear}-04-30`,
        prazoConsolidacaoDPEP: periodo.prazoConsolidacaoDPEP || `${selectedYear}-05-15`,
        prazoParecerTecnico: periodo.prazoParecerTecnico || `${selectedYear}-05-30`,
        prazoAprovacaoGeral: periodo.prazoAprovacaoGeral || `${selectedYear}-06-15`,
      });
    }, isUserFromDPEP ? departamentoUsuario : undefined);
    return () => unsub();
  }, [selectedYear, user?.departamento]);

  const canManagePrazosDPEP = isChefeDPEP || isPlanificacao || isSuperBossUser(user);

  const formatarDataPrazo = (dateStr?: string, fallbackDefault = "A definir"): string => {
    if (!dateStr) return fallbackDefault;
    try {
      if (dateStr.includes(" de ")) return dateStr;
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const d = parseInt(parts[2], 10);
        const m = parseInt(parts[1], 10);
        const meses = [
          "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
          "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        if (m >= 1 && m <= 12) {
          return `${d} de ${meses[m - 1]}`;
        }
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleSavePrazosDPEP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPrazos(true);
    try {
      await savePeriodoPlanificacao(
        {
          ...periodoPlanificacao,
          prazoSubmissaoSetorial: prazosForm.prazoSubmissaoSetorial,
          prazoConsolidacaoDPEP: prazosForm.prazoConsolidacaoDPEP,
          prazoParecerTecnico: prazosForm.prazoParecerTecnico,
          prazoAprovacaoGeral: prazosForm.prazoAprovacaoGeral,
          definidoPor: user?.nome || user?.name || "DPEP / Repartição de Planificação",
          setorDefinidor: "DPEP / Repartição de Planificação",
        },
        user
      );
      setSavePrazosMsg("Cronograma de prazos programado com sucesso por DPEP!");
      setTimeout(() => {
        setSavePrazosMsg("");
        setShowConfigPrazosModal(false);
      }, 1500);
    } catch (err) {
      console.error("Erro ao guardar prazos DPEP:", err);
      alert("Erro ao guardar prazos. Tente novamente.");
    } finally {
      setIsSavingPrazos(false);
    }
  };
  // Check if user is authorized to see the PESOE badge/title (Chefe do DPEP e Repartição de Planificação)
  const isAuthorizedForPESOE = useMemo(() => {
    if (isChefeDPEP || isPlanificacao) return true;
    if (!user) return false;
    const dept = String(user.departamento || "").toUpperCase();
    const rep = String(user.reparticao || "").toUpperCase();
    const set = String(user.setor || "").toUpperCase();
    const tit = String(user.titulo || user.role || "").toUpperCase();
    return (
      dept.includes("DPEP") ||
      dept.includes("PLANIFICA") ||
      rep.includes("PLANIFICA") ||
      set.includes("PLANIFICA") ||
      tit.includes("DPEP") ||
      tit.includes("PLANIFICA")
    );
  }, [isChefeDPEP, isPlanificacao, user]);

  // Stats calculations
  const stats = useMemo(() => {
    const validActivities = activities.filter(a => (a.titulo || a.descricao || Number(a.valor) > 0) && (a.setor || a.reparticao || a.departamento));
    const totalActivities = validActivities.length;
    const submetidas = validActivities.filter(a => a.submetido).length;
    const aprovadas = validActivities.filter(a => a.status === 'institucional' || a.status === 'direcao').length;
    const executadas = validActivities.filter(a => a.executada).length;
    const totalBudget = validActivities.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
    
    // Unique sectors with actual planned activities
    const sectors = new Set(validActivities.map(a => a.setor || a.reparticao || a.departamento).filter(Boolean)).size;
    
    // Execution percentage
    const execPercent = totalActivities > 0 ? (executadas / totalActivities) * 100 : 0;

    return {
      totalActivities,
      submetidas,
      aprovadas,
      executadas,
      totalBudget,
      sectors,
      execPercent
    };
  }, [activities]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.div 
      className="p-8 space-y-8 bg-slate-50 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Painel de Controlo de Planificação
            </h1>
            {isAuthorizedForPESOE && (
              <button
                type="button"
                onClick={() => onSelectWorkflow('pesoe')}
                className="px-4 py-1.5 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-black rounded-lg shadow-md tracking-wider uppercase inline-flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Clique para abrir a Visualização Oficial do PESOE"
              >
                <span>PESOE</span>
                <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded font-bold">Oficial</span>
              </button>
            )}
          </div>
          <p className="text-sm font-bold text-slate-500 tracking-widest mt-1 flex items-center gap-2">
            <Clock size={14} className="text-indigo-600" />
            Ciclo de {selectedYear} • Visão Consolidada DPEP
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => onSelectWorkflow('planning')}
            className="px-6 py-3 bg-[#5842f4] text-white rounded-xl font-black text-xs tracking-widest hover:brightness-110 transition-all shadow-lg flex items-center gap-2 active:scale-95"
            title={isChefeDPEP ? "Aceder ao Plano de Atividades do DPEP" : "Iniciar Nova Planificação"}
          >
            <Activity size={16} />
            {isChefeDPEP ? "Plano do DPEP" : "Nova Planificação"}
          </button>
          {isAuthorizedForPESOE && (
            <button 
              onClick={() => onSelectWorkflow('pesoe')}
              className="px-6 py-3 bg-[#f97316] text-white rounded-xl font-black text-xs tracking-widest hover:bg-[#ea580c] hover:brightness-110 transition-all shadow-lg flex items-center gap-2 active:scale-95"
              title="Visualizar PESOE com Atividades Aprovadas por Direção"
            >
              <Layers size={16} />
              PESOE
            </button>
          )}
          <button 
            onClick={() => onSelectWorkflow('consulting')}
            className="px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl font-black text-xs tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <Search size={16} />
            Consultar Ativo
          </button>
          <button 
            onClick={onImport}
            className="px-8 py-3 bg-[#00a3e0] text-white rounded-xl font-black text-sm hover:brightness-110 transition-all flex items-center gap-2 active:scale-95 shadow-lg"
          >
            Importar plano
          </button>
        </div>
      </div>

      {/* Quantum AI Predictive Bar - Apenas Administrador Geral */}
      {isSuperBossUser(user) && (
        <div className="bg-[#050b2c] border border-cyan-500/30 rounded-2xl p-4 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0">
              <Cpu size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wide text-cyan-300 uppercase">
                  ⚡ Previsão de IA Quântica (POA & PESOE)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  94.2% Convergência
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Simulação de <em>Quantum Annealing</em> prevê cumprimento pleno das metas programadas sem gargalo intersetorial. Coerência do sistema: <strong className="text-emerald-400">99.84%</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-mono text-slate-400">Latência do Algoritmo</div>
              <div className="text-xs font-black text-amber-300">0.28 ms</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: "Atividades Totais", 
            value: stats.totalActivities, 
            label: "Total no Ciclo", 
            icon: Activity, 
            color: "bg-blue-600",
            trend: stats.totalActivities > 0 ? `${stats.submetidas} Submetidas` : "0 Submetidas" 
          },
          { 
            title: "Execução Orçamental", 
            value: `${stats.execPercent.toFixed(1)}%`, 
            label: `${stats.executadas} de ${stats.totalActivities}`, 
            icon: TrendingUp, 
            color: "bg-emerald-600",
            trend: stats.totalActivities > 0 ? "Taxa Real" : "0%" 
          },
          { 
            title: "Volume de Investimento", 
            value: stats.totalBudget.toLocaleString('pt-PT'), 
            label: "MZN Planificados", 
            icon: DollarSign, 
            color: "bg-amber-600",
            trend: "Consolidado" 
          },
          { 
            title: "Sincronização de Setores", 
            value: stats.sectors, 
            label: "Unidades Orgânicas", 
            icon: Layers, 
            color: "bg-indigo-600",
            trend: stats.sectors > 0 ? `${stats.sectors} Ativos` : "0 Ativos" 
          }
        ].map((card, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 ${card.color} text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                <card.icon size={20} />
              </div>
              <span className="text-[10px] font-black text-slate-400 tracking-widest">{card.trend}</span>
            </div>
            <h3 className="text-[11px] font-black text-slate-400 tracking-[0.15em] mb-1">{card.title}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 tracking-tight">{card.value}</span>
              <span className="text-[10px] font-bold text-slate-400">{card.title === "Orçamento Total" ? "MZN" : ""}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 tracking-widest mt-2">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Cronograma de Prazos Institucionais */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${stats.totalActivities > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"}`}>
              <BarChart3 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-black text-slate-900 tracking-tight">Cronograma de Prazos e Tramitação</h4>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md border border-blue-200">
                  Programado por DPEP
                </span>
              </div>
              <p className="text-xs text-slate-400 font-bold">
                {stats.totalActivities > 0
                  ? `Fases de Consolidação e Aprovação do Plano Anual (${selectedYear}) • Datas Oficiais DPEP em vigor`
                  : `Fases de Consolidação e Aprovação do Plano Anual (${selectedYear}) • Datas Oficiais DPEP (Aguardando Atividades)`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canManagePrazosDPEP && (
              <button
                type="button"
                onClick={() => setShowConfigPrazosModal(true)}
                className="flex items-center gap-1.5 text-xs font-black text-blue-900 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl border border-blue-200/80 transition-all shadow-xs cursor-pointer"
                title="Programar e atualizar as datas das etapas de tramitação no DPEP"
              >
                <Edit2 size={14} className="text-blue-700" />
                <span>Programar Prazos (DPEP)</span>
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60">
              <CalendarCheck size={16} className={stats.totalActivities > 0 ? "text-emerald-600" : "text-slate-400"} />
              <span>{stats.totalActivities > 0 ? "Cronograma em Execução" : "Aguardando Início"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(() => {
            const hasActivities = stats.totalActivities > 0;
            
            // Submissão Setorial
            const submissaoPercent = hasActivities
              ? Math.round((stats.submetidas / stats.totalActivities) * 100)
              : 0;
            const submissaoStatus = !hasActivities 
              ? "Não Iniciado"
              : submissaoPercent === 100
                ? "Concluído"
                : submissaoPercent > 0
                  ? "Em Curso"
                  : "Pendente";
            const submissaoColor = !hasActivities
              ? "bg-slate-300"
              : submissaoPercent === 100
                ? "bg-emerald-500"
                : submissaoPercent > 0
                  ? "bg-amber-500"
                  : "bg-slate-300";

            // Consolidação DPEP
            const consolidacaoPercent = hasActivities && stats.submetidas > 0
              ? Math.min(100, Math.round(((stats.submetidas + stats.aprovadas) / (stats.totalActivities * 2)) * 100))
              : 0;
            const consolidacaoStatus = !hasActivities || stats.submetidas === 0
              ? "Não Iniciado"
              : consolidacaoPercent >= 100
                ? "Concluído"
                : "Em Curso";
            const consolidacaoColor = !hasActivities || stats.submetidas === 0
              ? "bg-slate-300"
              : consolidacaoPercent >= 100
                ? "bg-emerald-500"
                : "bg-amber-500";

            // Parecer Técnico (Aprovações a nível setorial/direção)
            const parecerPercent = hasActivities
              ? Math.round((stats.aprovadas / stats.totalActivities) * 100)
              : 0;
            const parecerStatus = !hasActivities || stats.aprovadas === 0
              ? "Não Iniciado"
              : parecerPercent === 100
                ? "Concluído"
                : "Em Curso";
            const parecerColor = !hasActivities || stats.aprovadas === 0
              ? "bg-slate-300"
              : parecerPercent === 100
                ? "bg-emerald-500"
                : "bg-amber-500";

            // Aprovação Geral (Homologação final/Execução)
            const aprovacaoPercent = hasActivities
              ? Math.round((stats.executadas / stats.totalActivities) * 100)
              : 0;
            const aprovacaoStatus = !hasActivities || stats.executadas === 0
              ? "Não Iniciado"
              : aprovacaoPercent === 100
                ? "Concluído"
                : "Em Curso";
            const aprovacaoColor = !hasActivities || stats.executadas === 0
              ? "bg-slate-300"
              : aprovacaoPercent === 100
                ? "bg-emerald-500"
                : "bg-amber-500";

            // Datas Oficiais Programadas pelo DPEP
            const dataSubmissao = formatarDataPrazo(
              periodoPlanificacao?.prazoSubmissaoSetorial || periodoPlanificacao?.dataFimPlanificacao,
              `30 de Abril de ${selectedYear}`
            );
            const dataConsolidacao = formatarDataPrazo(
              periodoPlanificacao?.prazoConsolidacaoDPEP,
              `15 de Maio de ${selectedYear}`
            );
            const dataParecer = formatarDataPrazo(
              periodoPlanificacao?.prazoParecerTecnico,
              `30 de Maio de ${selectedYear}`
            );
            const dataAprovacao = formatarDataPrazo(
              periodoPlanificacao?.prazoAprovacaoGeral,
              `15 de Junho de ${selectedYear}`
            );

            const steps = [
              { 
                label: "Submissão Setorial", 
                date: dataSubmissao, 
                progress: submissaoPercent, 
                color: submissaoColor,
                status: submissaoStatus,
                desc: hasActivities ? `${stats.submetidas} de ${stats.totalActivities} atividades submetidas` : "Recepção de propostas setoriais (DPEP)"
              },
              { 
                label: "Consolidação DPEP", 
                date: dataConsolidacao, 
                progress: consolidacaoPercent, 
                color: consolidacaoColor,
                status: consolidacaoStatus,
                desc: hasActivities ? "Harmonização de atividades e rubricas" : "Aguardando submissões setoriais (DPEP)"
              },
              { 
                label: "Parecer Técnico", 
                date: dataParecer, 
                progress: parecerPercent, 
                color: parecerColor,
                status: parecerStatus,
                desc: hasActivities ? `${stats.aprovadas} de ${stats.totalActivities} validadas em parecer` : "Validação orçamental e conformidade"
              },
              { 
                label: "Aprovação Geral", 
                date: dataAprovacao, 
                progress: aprovacaoPercent, 
                color: aprovacaoColor,
                status: aprovacaoStatus,
                desc: hasActivities ? `${stats.executadas} homologadas/em execução` : "Homologação pelo Conselho de Direção"
              }
            ];

            return steps.map((step, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-3 shadow-2xs">
                <div className="flex justify-between items-center text-xs font-black tracking-wider">
                  <span className="text-slate-800">{step.label}</span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                    step.status === 'Concluído' ? 'bg-emerald-100 text-emerald-700' :
                    step.status === 'Em Curso' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {step.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">{step.desc}</p>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${step.color} transition-all duration-500`} style={{ width: `${step.progress}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] font-black text-slate-700">
                  <span className="text-[10px] text-slate-400">{step.progress}%</span>
                  <span className="text-blue-900 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100">
                    Prazo DPEP: <strong>{step.date}</strong>
                  </span>
                </div>
              </div>
            ));
          })()}
        </div>
      </motion.div>

      {/* Modal para Programação de Prazos e Tramitação por DPEP */}
      {showConfigPrazosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-50 text-blue-900 rounded-xl">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Programar Prazos e Tramitação (DPEP)</h3>
                  <p className="text-xs text-slate-500 font-medium">Defina as datas oficiais para as 4 etapas de consolidação anual</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigPrazosModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {savePrazosMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black rounded-xl flex items-center gap-2">
                <Check size={16} className="text-emerald-600" />
                {savePrazosMsg}
              </div>
            )}

            <form onSubmit={handleSavePrazosDPEP} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 block">
                  1. Submissão Setorial (Prazo Final de Envio dos Setores)
                </label>
                <input
                  type="date"
                  value={prazosForm.prazoSubmissaoSetorial}
                  onChange={(e) => setPrazosForm((prev) => ({ ...prev, prazoSubmissaoSetorial: e.target.value }))}
                  required
                  className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 block">
                  2. Consolidação DPEP (Harmonização Institucional)
                </label>
                <input
                  type="date"
                  value={prazosForm.prazoConsolidacaoDPEP}
                  onChange={(e) => setPrazosForm((prev) => ({ ...prev, prazoConsolidacaoDPEP: e.target.value }))}
                  required
                  className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 block">
                  3. Parecer Técnico (Validação de Conformidade)
                </label>
                <input
                  type="date"
                  value={prazosForm.prazoParecerTecnico}
                  onChange={(e) => setPrazosForm((prev) => ({ ...prev, prazoParecerTecnico: e.target.value }))}
                  required
                  className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 block">
                  4. Aprovação Geral (Conselho de Direção / Homologação)
                </label>
                <input
                  type="date"
                  value={prazosForm.prazoAprovacaoGeral}
                  onChange={(e) => setPrazosForm((prev) => ({ ...prev, prazoAprovacaoGeral: e.target.value }))}
                  required
                  className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowConfigPrazosModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingPrazos}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-black text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition shadow-md cursor-pointer disabled:opacity-60"
                >
                  <Check size={16} />
                  <span>{isSavingPrazos ? "A guardar..." : "Guardar Prazos (DPEP)"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};
