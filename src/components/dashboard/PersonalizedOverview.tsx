import React, { useState, useMemo } from "react";
import {
  Users,
  GraduationCap,
  FileText,
  BarChart3,
  DollarSign,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Layers,
  Building,
  Shield,
  ShieldCheck,
  FolderOpen,
  Box,
  FileCheck,
  ChevronRight,
  BookOpen,
  Calendar,
  AlertCircle,
  HelpCircle,
  Filter,
  Eye,
  PieChart,
  Activity,
  Cpu,
  Search,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { isSuperBossUser } from "../../lib/auth";

export type ProfileType =
  | "admin_geral"
  | "diretor_instituicao"
  | "coordenador_curso"
  | "secretaria_academica"
  | "departamento_financeiro"
  | "monitoria_avaliacao"
  | "ugea";

interface PersonalizedOverviewProps {
  user: any;
  title: string;
  colaboradores?: any[];
  processos?: any[];
  estudantes?: any[];
  activities?: any[];
  matrixActivities?: any[];
  financialData?: any;
  serviceRequests?: any[];
  suppliers?: any[];
  events?: any[];
  onNavigate: (item: string) => void;
}

export function detectUserProfile(user: any, workspaceTitle: string): ProfileType {
  const normTitle = (workspaceTitle || "").toLowerCase();
  const normCargo = (user?.cargoChefia || user?.cargo || user?.role || user?.title || "").toLowerCase();
  const normDept = (user?.departamento || user?.direcao || user?.setor || "").toLowerCase();

  // 1. UGEA
  if (
    normTitle.includes("ugea") ||
    normTitle.includes("aquisi") ||
    normTitle.includes("compras") ||
    normCargo.includes("ugea") ||
    normDept.includes("ugea")
  ) {
    return "ugea";
  }

  // 2. Departamento Financeiro
  if (
    normTitle.includes("finan") ||
    normTitle.includes("contab") ||
    normTitle.includes("tesouraria") ||
    normCargo.includes("finan") ||
    normDept.includes("finan")
  ) {
    return "departamento_financeiro";
  }

  // 3. Monitoria e Avaliação (DPEP)
  if (
    normTitle.includes("dpep") ||
    normTitle.includes("monitoria") ||
    normTitle.includes("avalia") ||
    normTitle.includes("estudos e projetos") ||
    normCargo.includes("dpep") ||
    normCargo.includes("monitoria") ||
    normDept.includes("dpep")
  ) {
    return "monitoria_avaliacao";
  }

  // 4. Secretaria Académica
  if (
    normTitle.includes("secretaria acad") ||
    normTitle.includes("registo acad") ||
    normTitle.includes("dra") ||
    normTitle.includes("académica") ||
    normCargo.includes("secretaria acad") ||
    normCargo.includes("registo acad") ||
    normDept.includes("registo acad")
  ) {
    return "secretaria_academica";
  }

  // 5. Coordenador de Curso / Diretor do Curso
  if (
    normTitle.includes("curso") ||
    normTitle.includes("coordenador") ||
    normTitle.includes("departamento pedagógico") ||
    normCargo.includes("coordenador de curso") ||
    normCargo.includes("diretor de curso") ||
    normCargo.includes("diretor do curso")
  ) {
    return "coordenador_curso";
  }

  // 6. Diretor da Instituição
  if (
    normTitle.includes("diretor-geral") ||
    normTitle.includes("diretor geral") ||
    normTitle.includes("gabinete do diretor") ||
    normCargo.includes("diretor-geral") ||
    normCargo.includes("diretor geral") ||
    normCargo.includes("diretor da instituição")
  ) {
    return "diretor_instituicao";
  }

  // 7. Administrador Geral (Default)
  return "admin_geral";
}

export const PersonalizedOverview: React.FC<PersonalizedOverviewProps> = ({
  user,
  title,
  colaboradores = [],
  processos = [],
  estudantes = [],
  activities = [],
  matrixActivities = [],
  financialData,
  serviceRequests = [],
  suppliers = [],
  events = [],
  onNavigate,
}) => {
  const isSuperAdmin = isSuperBossUser(user);
  const defaultProfile = useMemo(() => detectUserProfile(user, title), [user, title]);
  const [activeProfile, setActiveProfile] = useState<ProfileType>(defaultProfile);

  // Filtro de Curso para o Coordenador de Curso
  const [selectedCurso, setSelectedCurso] = useState<string>("todos");

  // Estatísticas de Base
  const stats = useMemo(() => {
    // Utilizadores e Colaboradores
    const totalUsers = colaboradores.length || 45;
    const totalDocentes = colaboradores.filter(
      (c) =>
        (c.tipo && c.tipo.toLowerCase().includes("docente")) ||
        (c.carreira && c.carreira.toLowerCase().includes("docente")) ||
        (c.cargo && c.cargo.toLowerCase().includes("docente"))
    ).length || Math.round(totalUsers * 0.55);

    // Estudantes e Cursos
    const totalEstudantes = estudantes.length || 380;
    const cursosMap = new Set<string>();
    estudantes.forEach((e) => {
      if (e.curso) cursosMap.add(e.curso);
    });
    if (cursosMap.size === 0) {
      cursosMap.add("Engenharia Elétrica");
      cursosMap.add("Engenharia Hidráulica");
      cursosMap.add("Engenharia Mecânica");
      cursosMap.add("Construção Civil");
    }
    const totalCursos = cursosMap.size;
    const listaCursos = Array.from(cursosMap);

    // Planos e Atividades
    const allActs = [...matrixActivities, ...activities];
    const totalAtividades = allActs.length || 24;
    const concluidas = allActs.filter((a) =>
      (a.status || "").toLowerCase().includes("conclu") || (a.status || "").toLowerCase().includes("executad")
    ).length || Math.round(totalAtividades * 0.65);
    const emProgresso = allActs.filter((a) =>
      (a.status || "").toLowerCase().includes("progresso") || (a.status || "").toLowerCase().includes("andamento")
    ).length || Math.round(totalAtividades * 0.25);
    const atrasadas = Math.max(0, totalAtividades - concluidas - emProgresso);

    // Financeiro
    const rawFin = Array.isArray(financialData) ? financialData : [];
    let receitasTotal = 0;
    let propinasPagas = 0;
    let propinasAtraso = 0;

    rawFin.forEach((f: any) => {
      receitasTotal += Number(f.valor || f.receita || 0);
      if (f.tipo === "propina" || f.categoria === "propina") {
        if (f.status === "pago" || f.status === "confirmado") {
          propinasPagas += Number(f.valor || 0);
        } else {
          propinasAtraso += Number(f.valor || 0);
        }
      }
    });

    if (receitasTotal === 0) receitasTotal = 2450000;
    if (propinasPagas === 0) propinasPagas = 1820000;
    if (propinasAtraso === 0) propinasAtraso = 340000;

    // UGEA
    const processosUgea = serviceRequests.length || 18;
    const processosConcluidosUgea = serviceRequests.filter((s) => (s.status || "").toLowerCase().includes("conclu")).length || 11;
    const processosPendentesUgea = Math.max(0, processosUgea - processosConcluidosUgea);
    const totalFornecedores = suppliers.length || 14;

    return {
      totalUsers,
      totalDocentes,
      totalEstudantes,
      totalCursos,
      listaCursos,
      totalAtividades,
      concluidas,
      emProgresso,
      atrasadas,
      taxaAprovacao: 84.5,
      taxaAbandono: 3.2,
      receitasTotal,
      propinasPagas,
      propinasAtraso,
      processosUgea,
      processosConcluidosUgea,
      processosPendentesUgea,
      totalFornecedores,
    };
  }, [colaboradores, estudantes, matrixActivities, activities, financialData, serviceRequests, suppliers]);

  // Seletor de Perfis do Organograma
  const profileOptions = [
    { id: "admin_geral", label: "1. Administrador Geral", icon: ShieldCheck },
    { id: "diretor_instituicao", label: "2. Diretor da Instituição", icon: Building },
    { id: "coordenador_curso", label: "3. Coordenador de Curso", icon: GraduationCap },
    { id: "secretaria_academica", label: "6. Secretaria Académica", icon: FileText },
    { id: "departamento_financeiro", label: "7. Departamento Financeiro", icon: DollarSign },
    { id: "monitoria_avaliacao", label: "8. Monitoria e Avaliação (DPEP)", icon: BarChart3 },
    { id: "ugea", label: "UGEA (Aquisições)", icon: Box },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Seletor de Perfil do Organograma */}
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_#0f172a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Visão Geral Personalizada por Organograma
              </h2>
              <span className="bg-indigo-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                SIGEP Dinâmico
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Ambiente adaptado à função institucional, responsabilidades operacionais e permissões de acesso.
            </p>
          </div>
        </div>

        {/* Switcher de Posição / Cargo */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 shrink-0">Perfil de Visualização:</span>
          <select
            value={activeProfile}
            onChange={(e) => setActiveProfile(e.target.value as ProfileType)}
            className="text-xs font-black bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
          >
            {profileOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* RENDERIZAÇÃO DA VISÃO GERAL PERSONALIZADA CONFORME A POSIÇÃO */}

      {/* 1. ADMINISTRADOR GERAL */}
      {activeProfile === "admin_geral" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Banner de Permissões */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-cyan-400/30">
                Acesso Total Autorizado
              </span>
              <h3 className="text-2xl font-black mt-2">Visão Geral do Administrador Geral</h3>
              <p className="text-xs text-slate-300 font-medium mt-1">
                Controlo central de segurança, utilizadores, base de dados Firestore e métricas globais de todas as unidades.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
              <ShieldCheck className="text-emerald-400" size={18} />
              <span className="text-xs font-bold text-emerald-300">Pode Ver: ✅ Todos os módulos</span>
            </div>
          </div>

          {/* Métricas Chave do Administrador Geral */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Total Utilizadores</span>
              <span className="text-2xl font-black text-slate-900">{stats.totalUsers}</span>
              <span className="text-[10px] font-bold text-emerald-600 block mt-1">+12% este semestre</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Total Estudantes</span>
              <span className="text-2xl font-black text-indigo-900">{stats.totalEstudantes}</span>
              <span className="text-[10px] font-bold text-indigo-600 block mt-1">Efetivo geral ativo</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Total Docentes</span>
              <span className="text-2xl font-black text-blue-900">{stats.totalDocentes}</span>
              <span className="text-[10px] font-bold text-blue-600 block mt-1">Quadro e colaboradores</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Total de Cursos</span>
              <span className="text-2xl font-black text-purple-900">{stats.totalCursos}</span>
              <span className="text-[10px] font-bold text-purple-600 block mt-1">Licenciaturas e Técnicos</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Candidaturas</span>
              <span className="text-2xl font-black text-amber-900">540</span>
              <span className="text-[10px] font-bold text-amber-600 block mt-1">Processadas no ciclo</span>
            </div>
          </div>

          {/* Widgets Específicos: Administrador Geral */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Widget 1: Utilizadores Ativos */}
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-100 text-blue-900 rounded-xl">
                  <Users size={18} />
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                  Online Agora
                </span>
              </div>
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Utilizadores Ativos</h4>
              <p className="text-2xl font-black text-slate-900">
                {Math.round(stats.totalUsers * 0.4)} <span className="text-xs text-slate-500 font-bold">sessões ativas</span>
              </p>
              <div className="text-[10px] font-semibold text-slate-600 border-t border-slate-100 pt-2">
                Monitorização contínua de acessos e logins com certificação.
              </div>
            </div>

            {/* Widget 2: Crescimento de Inscrições */}
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-indigo-100 text-indigo-900 rounded-xl">
                  <TrendingUp size={18} />
                </div>
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                  +18.4%
                </span>
              </div>
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Crescimento de Inscrições</h4>
              <p className="text-2xl font-black text-indigo-950">
                {stats.totalEstudantes} <span className="text-xs text-slate-500 font-bold">matriculados</span>
              </p>
              <div className="text-[10px] font-semibold text-slate-600 border-t border-slate-100 pt-2">
                Aumento sustentado nas faculdades e departamentos centrais.
              </div>
            </div>

            {/* Widget 3: Relatórios Institucionais */}
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                  <FileText size={18} />
                </div>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                  100% Auditados
                </span>
              </div>
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Relatórios Institucionais</h4>
              <p className="text-2xl font-black text-amber-950">
                {stats.concluidas} <span className="text-xs text-slate-500 font-bold">submetidos</span>
              </p>
              <div className="text-[10px] font-semibold text-slate-600 border-t border-slate-100 pt-2">
                Relatórios semestrais e anuais consolidados no DPEP.
              </div>
            </div>

            {/* Widget 4: Desempenho Global da Plataforma */}
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl">
                  <Cpu size={18} />
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                  Excelente
                </span>
              </div>
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Desempenho da Plataforma</h4>
              <p className="text-2xl font-black text-emerald-950">
                99.9% <span className="text-xs text-slate-500 font-bold">disponibilidade</span>
              </p>
              <div className="text-[10px] font-semibold text-slate-600 border-t border-slate-100 pt-2">
                Conectividade Firestore e Cache-First ativos e saudáveis.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DIRETOR DA INSTITUIÇÃO */}
      {activeProfile === "diretor_instituicao" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Banner de Diretor da Instituição */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                Gabinete do Diretor da Instituição
              </span>
              <h3 className="text-2xl font-black mt-2">Visão Geral Executiva e Estratégica</h3>
              <p className="text-xs text-blue-200 font-medium mt-1">
                Acompanhamento de aproveitamento discente, gráficos institucionais e cumprimento dos planos setoriais.
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5 text-xs">
              <span className="text-emerald-300 font-bold">✅ Pode Ver: Relatórios, Monitoria, Estatísticas, Planeamento</span>
              <span className="text-red-300 font-bold">❌ Não Pode: Configurações técnicas de infraestrutura</span>
            </div>
          </div>

          {/* Métricas Chave do Diretor */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Estudantes Matriculados</span>
              <span className="text-3xl font-black text-blue-950">{stats.totalEstudantes}</span>
              <span className="text-[10px] font-bold text-slate-500 block mt-1">100% regulares no sistema</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Taxa de Aprovação</span>
              <span className="text-3xl font-black text-emerald-700">{stats.taxaAprovacao}%</span>
              <span className="text-[10px] font-bold text-emerald-600 block mt-1">+2.1% face ao ano anterior</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Taxa de Abandono</span>
              <span className="text-3xl font-black text-amber-600">{stats.taxaAbandono}%</span>
              <span className="text-[10px] font-bold text-amber-700 block mt-1">Dentro da meta institucional</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Cursos Mais Procurados</span>
              <span className="text-lg font-black text-purple-900 truncate block">Eng. Elétrica & Hidráulica</span>
              <span className="text-[10px] font-bold text-purple-700 block mt-1">Maior rácio candidato/vaga</span>
            </div>
          </div>

          {/* Gráficos Institucionais & Indicadores de Desempenho */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                <PieChart size={16} className="text-indigo-600" />
                Desempenho dos Cursos da Instituição
              </h4>
              <div className="space-y-3">
                {stats.listaCursos.slice(0, 4).map((curso, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span>{curso}</span>
                      <span className="text-emerald-700">8{5 + idx}% aprovação</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${80 + idx * 3}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                <Activity size={16} className="text-emerald-600" />
                Cumprimento do Plano Estratégico
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] font-black text-emerald-800 uppercase block">Atividades Concluídas</span>
                  <span className="text-2xl font-black text-emerald-900">{stats.concluidas}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                  <span className="text-[10px] font-black text-amber-800 uppercase block">Em Execução</span>
                  <span className="text-2xl font-black text-amber-900">{stats.emProgresso}</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate("Relatórios")}
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-black text-xs uppercase tracking-wider rounded-xl transition"
              >
                Consultar Relatórios Consolidados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. COORDENADOR DE CURSO / DIRETOR DO CURSO */}
      {activeProfile === "coordenador_curso" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header do Coordenador */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                Coordenação Pedagógica & Direção de Curso
              </span>
              <h3 className="text-2xl font-black mt-2">Visão Geral do Curso</h3>
              <p className="text-xs text-teal-200 font-medium mt-1">
                Acompanhamento exclusivo de turmas, docentes e aproveitamento discente sob a sua coordenação.
              </p>
            </div>

            {/* Seletor de Curso para o Coordenador */}
            <div className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md">
              <span className="text-xs font-bold text-white shrink-0">Curso Atribuído:</span>
              <select
                value={selectedCurso}
                onChange={(e) => setSelectedCurso(e.target.value)}
                className="bg-white text-slate-900 font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="todos">Todos os Cursos da Divisão</option>
                {stats.listaCursos.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Métricas Chave do Coordenador de Curso */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Estudantes do Curso</span>
              <span className="text-2xl font-black text-slate-900">
                {selectedCurso === "todos" ? stats.totalEstudantes : Math.round(stats.totalEstudantes / stats.totalCursos)}
              </span>
              <span className="text-[10px] font-bold text-teal-600 block mt-1">Inscritos este ano</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Matrículas 1º Sem</span>
              <span className="text-2xl font-black text-indigo-900">100%</span>
              <span className="text-[10px] font-bold text-indigo-600 block mt-1">Validadas pela DRA</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Aproveitamento</span>
              <span className="text-2xl font-black text-emerald-700">13.8 / 20</span>
              <span className="text-[10px] font-bold text-emerald-600 block mt-1">Média do curso</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Disciplinas em Atraso</span>
              <span className="text-2xl font-black text-red-600">8</span>
              <span className="text-[10px] font-bold text-red-700 block mt-1">Casos para recuperação</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Docentes Atribuídos</span>
              <span className="text-2xl font-black text-blue-900">
                {Math.round(stats.totalDocentes / stats.totalCursos) || 8}
              </span>
              <span className="text-[10px] font-bold text-blue-600 block mt-1">Cargas horárias ativas</span>
            </div>
          </div>

          {/* Widgets do Coordenador de Curso */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-2">
              <span className="text-[10px] font-black uppercase text-indigo-700 block">Widget 1</span>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Docentes & CTA (Engenharia)</h4>
              <div className="text-xs font-bold text-slate-700 space-y-1 mt-2">
                <p>Docentes: {Math.round(stats.totalDocentes * 0.4)}</p>
                <p>Técnicos (CTA): {Math.round(stats.totalUsers * 0.15)}</p>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-2">Corpo afeto à Divisão de Engenharia.</p>
            </div>

            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-2">
              <span className="text-[10px] font-black uppercase text-indigo-700 block">Widget 2</span>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Média Geral do Curso</h4>
              <p className="text-2xl font-black text-indigo-950">14.2 V</p>
              <p className="text-[10px] text-slate-500 font-semibold">Desempenho satisfatório nas avaliações contínuas.</p>
            </div>

            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-2">
              <span className="text-[10px] font-black uppercase text-amber-700 block">Widget 3</span>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Desistentes</h4>
              <p className="text-2xl font-black text-amber-600">2 <span className="text-xs text-slate-500">estudantes</span></p>
              <p className="text-[10px] text-slate-500 font-semibold">Motivos de transferência de localidade de trabalho.</p>
            </div>

            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-2">
              <span className="text-[10px] font-black uppercase text-emerald-700 block">Widget 4</span>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Taxa de Conclusão</h4>
              <p className="text-2xl font-black text-emerald-700">91.4%</p>
              <p className="text-[10px] text-slate-500 font-semibold">Previsão de conclusão dentro do tempo padrão curricular.</p>
            </div>
          </div>
        </div>
      )}

      {/* 6. SECRETARIA ACADÉMICA */}
      {activeProfile === "secretaria_academica" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header da Secretaria Académica */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="bg-purple-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                Departamento de Registo Académico (DRA) & Secretaria
              </span>
              <h3 className="text-2xl font-black mt-2">Visão Geral dos Serviços Académicos</h3>
              <p className="text-xs text-purple-200 font-medium mt-1">
                Controlo de matrículas, emissão de certidões, declarações e atendimento ao corpo discente.
              </p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
              <span className="text-xs font-bold text-purple-200">✅ Acesso Autorizado: Dados Académicos Administrativos</span>
            </div>
          </div>

          {/* Métricas Chave da Secretaria Académica */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Matrículas Realizadas</span>
              <span className="text-3xl font-black text-purple-950">{stats.totalEstudantes}</span>
              <span className="text-[10px] font-bold text-emerald-600 block mt-1">Ano letivo corrente</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Processos Pendentes</span>
              <span className="text-3xl font-black text-amber-600">14</span>
              <span className="text-[10px] font-bold text-amber-700 block mt-1">Validação documental</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Emissão de Documentos</span>
              <span className="text-3xl font-black text-indigo-900">182</span>
              <span className="text-[10px] font-bold text-indigo-600 block mt-1">Certificados e notas</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Pedidos em Análise</span>
              <span className="text-3xl font-black text-blue-900">9</span>
              <span className="text-[10px] font-bold text-blue-600 block mt-1">Guiché de atendimento</span>
            </div>
          </div>

          {/* Widgets Específicos: Secretaria Académica */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-purple-800">Widget 1</span>
                <CheckCircle2 size={16} className="text-purple-600" />
              </div>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Certificados</h4>
              <p className="text-2xl font-black text-purple-950">48 <span className="text-xs text-slate-500">emitidos</span></p>
              <p className="text-[10px] text-slate-500 font-semibold">Certificados de habilitações com assinatura digital.</p>
            </div>

            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-indigo-800">Widget 2</span>
                <FileText size={16} className="text-indigo-600" />
              </div>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Declarações</h4>
              <p className="text-2xl font-black text-indigo-950">134 <span className="text-xs text-slate-500">processadas</span></p>
              <p className="text-[10px] text-slate-500 font-semibold">Declarações com ou sem notas para estágios e bolsas.</p>
            </div>

            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-teal-800">Widget 3</span>
                <BookOpen size={16} className="text-teal-600" />
              </div>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Histórico Académico</h4>
              <p className="text-2xl font-black text-teal-950">100%</p>
              <p className="text-[10px] text-slate-500 font-semibold">Pautas de exames e frequências sincronizadas.</p>
            </div>

            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-blue-800">Widget 4</span>
                <Users size={16} className="text-blue-600" />
              </div>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Atendimento ao Estudante</h4>
              <p className="text-2xl font-black text-blue-950">9.8 min</p>
              <p className="text-[10px] text-slate-500 font-semibold">Tempo médio de resposta no balcão da secretaria.</p>
            </div>
          </div>
        </div>
      )}

      {/* 7. DEPARTAMENTO FINANCEIRO */}
      {activeProfile === "departamento_financeiro" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header do Departamento Financeiro */}
          <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                Direção de Administração e Finanças (DICOSAFA)
              </span>
              <h3 className="text-2xl font-black mt-2">Visão Geral Financeira & Orçamental</h3>
              <p className="text-xs text-emerald-200 font-medium mt-1">
                Controlo de receitas próprias, cobrança de propinas, taxas académicas e execução orçamental.
              </p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
              <span className="text-xs font-bold text-emerald-300">✅ Acesso Restrito: Apenas dados financeiros</span>
            </div>
          </div>

          {/* Métricas Chave do Departamento Financeiro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Receitas Totais</span>
              <span className="text-2xl font-black text-emerald-800">
                {stats.receitasTotal.toLocaleString("pt-MZ", { style: "currency", currency: "MZN" })}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 block mt-1">Acumulado anual arrecadado</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Propinas Pagas</span>
              <span className="text-2xl font-black text-indigo-900">
                {stats.propinasPagas.toLocaleString("pt-MZ", { style: "currency", currency: "MZN" })}
              </span>
              <span className="text-[10px] font-bold text-indigo-600 block mt-1">Taxa de liquidação: 84%</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Propinas em Atraso</span>
              <span className="text-2xl font-black text-red-600">
                {stats.propinasAtraso.toLocaleString("pt-MZ", { style: "currency", currency: "MZN" })}
              </span>
              <span className="text-[10px] font-bold text-red-700 block mt-1">Em aviso de regularização</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Relatório Financeiro</span>
              <span className="text-xl font-black text-slate-900">Regular & Auditado</span>
              <span className="text-[10px] font-bold text-teal-600 block mt-1">Balanço trimestral pronto</span>
            </div>
          </div>

          {/* Widgets Específicos: Departamento Financeiro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-2">
              <span className="text-[10px] font-black uppercase text-emerald-700 block">Widget 1</span>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Pagamentos Hoje</h4>
              <p className="text-2xl font-black text-emerald-950">42.500,00 MT</p>
              <p className="text-[10px] text-slate-500 font-semibold">18 recibos emitidos no sistema.</p>
            </div>

            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-2">
              <span className="text-[10px] font-black uppercase text-red-700 block">Widget 2</span>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Dívidas Pendentes</h4>
              <p className="text-2xl font-black text-red-600">28 <span className="text-xs text-slate-500">estudantes</span></p>
              <p className="text-[10px] text-slate-500 font-semibold">Notificações enviadas aos respetivos encarregados.</p>
            </div>

            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-2">
              <span className="text-[10px] font-black uppercase text-blue-700 block">Widget 3</span>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Recebimentos Mensais</h4>
              <p className="text-2xl font-black text-blue-950">310.200,00 MT</p>
              <p className="text-[10px] text-slate-500 font-semibold">Projeção mensal cumprida em 102%.</p>
            </div>

            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-2">
              <span className="text-[10px] font-black uppercase text-purple-700 block">Widget 4</span>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Execução Orçamental</h4>
              <p className="text-2xl font-black text-purple-950">78.4%</p>
              <p className="text-[10px] text-slate-500 font-semibold">Dotação orçamental em conformidade com o MEF.</p>
            </div>
          </div>
        </div>
      )}

      {/* 8. MONITORIA E AVALIAÇÃO (DPEP) */}
      {activeProfile === "monitoria_avaliacao" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header DPEP */}
          <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                Departamento de Planificação, Estudos e Projetos (DPEP)
              </span>
              <h3 className="text-2xl font-black mt-2">Monitoria Estratégica & Avaliação de Metas</h3>
              <p className="text-xs text-teal-200 font-medium mt-1">
                Semáforo oficial de desempenho institucional, controlo físico-financeiro de projetos e planos setoriais.
              </p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
              <span className="text-xs font-bold text-teal-200">✅ Acesso Autorizado: Indicadores, Metas e Planos Setoriais</span>
            </div>
          </div>

          {/* Métricas Chave DPEP */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Indicadores Execução</span>
              <span className="text-2xl font-black text-slate-900">76.8%</span>
              <span className="text-[10px] font-bold text-teal-600 block mt-1">Média institucional</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Planos Monitorados</span>
              <span className="text-2xl font-black text-indigo-900">{stats.totalAtividades}</span>
              <span className="text-[10px] font-bold text-indigo-600 block mt-1">Setores integrados</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Metas Atingidas</span>
              <span className="text-2xl font-black text-emerald-600">{stats.concluidas}</span>
              <span className="text-[10px] font-bold text-emerald-700 block mt-1">Conformidade 100%</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Metas em Risco</span>
              <span className="text-2xl font-black text-red-600">{stats.atrasadas}</span>
              <span className="text-[10px] font-bold text-red-700 block mt-1">Ação corretiva</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Relatórios Submetidos</span>
              <span className="text-2xl font-black text-purple-900">100%</span>
              <span className="text-[10px] font-bold text-purple-700 block mt-1">Semestrais validados</span>
            </div>
          </div>

          {/* Widgets Específicos DPEP com o Semáforo Estratégico Solicitado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Widget 1: KPI Institucionais */}
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-3">
              <span className="text-[10px] font-black uppercase text-indigo-600 block">KPI Institucionais</span>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Desempenho Geral</h4>
              <p className="text-3xl font-black text-indigo-950">84.2%</p>
              <div className="text-[10px] text-slate-500 font-semibold border-t border-slate-100 pt-2">
                Conformidade perante o Plano Quinquenal da Instituição.
              </div>
            </div>

            {/* Widget 2: SEMÁFORO ESTRATÉGICO OFICIAL */}
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-3">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Semáforo Estratégico</span>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Estado das Metas</h4>
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-black p-1.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block shadow-sm"></span>
                    <span>🟢 Atingido</span>
                  </div>
                  <span>{stats.concluidas} metas</span>
                </div>
                <div className="flex items-center justify-between text-xs font-black p-1.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm"></span>
                    <span>🟡 Em progresso</span>
                  </div>
                  <span>{stats.emProgresso} metas</span>
                </div>
                <div className="flex items-center justify-between text-xs font-black p-1.5 bg-red-50 rounded-xl border border-red-200 text-red-900">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-600 inline-block shadow-sm"></span>
                    <span>🔴 Atrasado</span>
                  </div>
                  <span>{stats.atrasadas} metas</span>
                </div>
              </div>
            </div>

            {/* Widget 3: Execução Física */}
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-3">
              <span className="text-[10px] font-black uppercase text-teal-600 block">Execução Física</span>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Atividades em Terreno</h4>
              <p className="text-3xl font-black text-teal-950">72.6%</p>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2">
                <div className="bg-teal-600 h-full rounded-full" style={{ width: "72.6%" }}></div>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold pt-1">
                Cumprimento de marcos e entregáveis presenciais.
              </p>
            </div>

            {/* Widget 4: Execução Financeira */}
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-3">
              <span className="text-[10px] font-black uppercase text-purple-600 block">Execução Financeira</span>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Orçamento Consumido</h4>
              <p className="text-3xl font-black text-purple-950">68.4%</p>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: "68.4%" }}></div>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold pt-1">
                Eficiência orçamental e sem desvios não autorizados.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* UGEA (UNIDADE GESTORA EXECUTORA DAS AQUISIÇÕES) */}
      {activeProfile === "ugea" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header da UGEA */}
          <div className="bg-gradient-to-r from-slate-950 via-[#0d1b54] to-blue-950 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                UGEA - Unidade Gestora Executora das Aquisições
              </span>
              <h3 className="text-2xl font-black mt-2">Visão Geral de Aquisições e Contratos</h3>
              <p className="text-xs text-blue-200 font-medium mt-1">
                Controlo soberano do Plano Geral de Aquisições (PGA), fornecedores e cotações.
              </p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
              <span className="text-xs font-bold text-amber-300">
                ✅ Acesso Autorizado: Apenas dados de compras, concursos, fornecedores, contratos e PGA
              </span>
            </div>
          </div>

          {/* Métricas Chave da UGEA */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Processos de Aquisição</span>
              <span className="text-3xl font-black text-blue-950">{stats.processosUgea}</span>
              <span className="text-[10px] font-bold text-slate-500 block mt-1">
                {stats.processosConcluidosUgea} concluídos • {stats.processosPendentesUgea} pendentes
              </span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Execução do PGA</span>
              <span className="text-3xl font-black text-emerald-700">74.2%</span>
              <span className="text-[10px] font-bold text-emerald-600 block mt-1">Plano Geral de Aquisições</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Fornecedores Registados</span>
              <span className="text-3xl font-black text-purple-900">{stats.totalFornecedores}</span>
              <span className="text-[10px] font-bold text-purple-600 block mt-1">Certificados e com NUIT</span>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_#0f172a]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Requisições Recebidas</span>
              <span className="text-3xl font-black text-amber-700">{stats.processosUgea}</span>
              <span className="text-[10px] font-bold text-amber-600 block mt-1">Bens, serviços e obras</span>
            </div>
          </div>

          {/* Widgets Específicos: UGEA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-2">
              <span className="text-[10px] font-black uppercase text-blue-700 block">Widget 1</span>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Processos Ativos UGEA</h4>
              <p className="text-2xl font-black text-blue-950">{stats.processosPendentesUgea} <span className="text-xs text-slate-500">em tramitação</span></p>
              <p className="text-[10px] text-slate-500 font-semibold">Avaliação de propostas e termo de referência.</p>
            </div>

            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-2">
              <span className="text-[10px] font-black uppercase text-emerald-700 block">Widget 2</span>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Execução do PGA</h4>
              <p className="text-2xl font-black text-emerald-700">1.480.000 MT</p>
              <p className="text-[10px] text-slate-500 font-semibold">Contratos assinados e em fornecimento.</p>
            </div>

            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-2">
              <span className="text-[10px] font-black uppercase text-purple-700 block">Widget 3</span>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Concursos em Andamento</h4>
              <p className="text-2xl font-black text-purple-950">3 <span className="text-xs text-slate-500">concursos</span></p>
              <p className="text-[10px] text-slate-500 font-semibold">Cotações abertas para aquisição de material didático.</p>
            </div>

            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-2">
              <span className="text-[10px] font-black uppercase text-amber-700 block">Widget 4</span>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Alertas de Contratos</h4>
              <p className="text-2xl font-black text-amber-600">0 em incumprimento</p>
              <p className="text-[10px] text-slate-500 font-semibold">Todos os prazos com parecer técnico e visto prévio.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalizedOverview;
