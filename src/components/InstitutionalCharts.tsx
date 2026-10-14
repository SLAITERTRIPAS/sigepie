import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, Users, FileText, ClipboardList, GraduationCap } from "lucide-react";

interface InstitutionalChartsProps {
  processos?: any[];
  colaboradores?: any[];
  serviceRequests?: any[];
}

export default function InstitutionalCharts({
  processos = [],
  colaboradores = [],
  serviceRequests = [],
}: InstitutionalChartsProps) {
  const stats = useMemo(() => {
    const pendingProcessos = processos.filter((p) => p.status === "Pendente").length;
    const activeColaboradores = colaboradores.length;
    const pendingRequests = serviceRequests.filter((r) => r.status === "Pendente" || !r.status).length;
    const completedProcessos = processos.filter((p) => p.status === "Concluído" || p.status === "Validado").length;

    return {
      pendingProcessos,
      activeColaboradores,
      pendingRequests,
      completedProcessos,
    };
  }, [processos, colaboradores, serviceRequests]);

  const barData = [
    { name: "Proc. Pendentes", value: stats.pendingProcessos, fill: "#ef4444" },
    { name: "Solic. Pendentes", value: stats.pendingRequests, fill: "#f59e0b" },
    { name: "Proc. Concluídos", value: stats.completedProcessos, fill: "#10b981" },
  ];

  const pieData = [
    { name: "Docentes", value: colaboradores.filter(c => c.tipo === "Docente").length },
    { name: "CTA", value: colaboradores.filter(c => c.tipo === "CTA").length },
    { name: "Outros", value: colaboradores.filter(c => c.tipo !== "Docente" && c.tipo !== "CTA").length },
  ];

  // Projeções Académicas por Ano
  const academicProjectionData = [
    { ano: "2023", ingressos: 450, matriculados: 1200, graduados: 280 },
    { ano: "2024", ingressos: 520, matriculados: 1450, graduados: 340 },
    { ano: "2025", ingressos: 610, matriculados: 1780, graduados: 410 },
    { ano: "2026 (Proj.)", ingressos: 750, matriculados: 2150, graduados: 530 },
  ];

  // Distribuição de Colaboradores por Nível Académico
  const nivelAcademicoData = useMemo(() => {
    const map: Record<string, number> = {};
    colaboradores.forEach(c => {
      const niv = c.nivelAcademico || c.grauAcademico || "Licenciado";
      map[niv] = (map[niv] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).slice(0, 5);
  }, [colaboradores]);

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-8 animate-fadeIn">
      {/* Chart 1: Projeções Académicas (AreaChart) */}
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-[8px_8px_0px_0px_#0f172a]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 text-indigo-900 rounded-xl">
            <GraduationCap size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight">Projeções Académicas</h3>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Evolução de Ingressos, Matrículas e Graduações</p>
          </div>
        </div>
        
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={academicProjectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="ano" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }} />
              <Tooltip contentStyle={{ borderRadius: "16px", border: "2px solid #0f172a", boxShadow: "4px 4px 0px #0f172a" }} />
              <Area type="monotone" dataKey="matriculados" name="Matriculados" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={3} />
              <Area type="monotone" dataKey="ingressos" name="Ingressos" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={3} />
              <Area type="monotone" dataKey="graduados" name="Graduados" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={3} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Distribuição de Colaboradores por Nível Académico (BarChart) */}
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-[8px_8px_0px_0px_#1e3a8a]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 text-blue-900 rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight">Colaboradores por Nível Académico</h3>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Distribuição estatística de qualificações</p>
          </div>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nivelAcademicoData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }} />
              <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.1)" }} contentStyle={{ borderRadius: "16px", border: "2px solid #0f172a", boxShadow: "4px 4px 0px #0f172a" }} />
              <Bar dataKey="value" name="Colaboradores" radius={[8, 8, 0, 0]} barSize={35}>
                {nivelAcademicoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Desempenho Institucional (BarChart) */}
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-[8px_8px_0px_0px_#0f172a]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight">Desempenho Institucional</h3>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Métricas em tempo real</p>
          </div>
        </div>
        
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }} />
              <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.1)" }} contentStyle={{ borderRadius: "16px", border: "2px solid #0f172a", boxShadow: "4px 4px 0px #0f172a" }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Distribuição de Colaboradores por Categoria (PieChart) */}
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-[8px_8px_0px_0px_#1e3a8a]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 text-indigo-900 rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight">Distribuição de Colaboradores</h3>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Por categoria de quadro</p>
          </div>
        </div>

        <div className="h-[250px] w-full flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "16px", border: "2px solid #0f172a", boxShadow: "4px 4px 0px #0f172a" }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="hidden sm:flex flex-col gap-4 ml-4">
            <div className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Geral</span>
              <span className="text-2xl font-black text-slate-900">{stats.activeColaboradores}</span>
            </div>
            <div className="p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl">
              <span className="block text-[10px] font-black text-blue-400 uppercase tracking-widest">Ativos Hoje</span>
              <span className="text-2xl font-black text-blue-900">{stats.activeColaboradores}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
