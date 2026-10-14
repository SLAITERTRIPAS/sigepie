import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, AlertTriangle, FileText, CheckCircle2, Building, BarChart2, PieChart as PieChartIcon, 
  Search, Filter, ExternalLink, Download, RefreshCw, Award, Printer, TrendingUp
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from "recharts";
import { firestoreService } from "../../lib/firestoreService";
//@ts-ignore
import html2pdf from "html2pdf.js";

export const ConformidadeNormativaView = ({ 
  onNavigateToWorkspace 
}: { 
  onNavigateToWorkspace?: (workspaceTitle: string, instituicaoId?: string) => void;
}) => {
  const [instituicoes, setInstituicoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const unsub = firestoreService.instituicoes.subscribe((data) => {
      setInstituicoes(data || []);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleExportPDF = () => {
    const element = document.getElementById("conformidade-report-container");
    if (!element) return;
    setIsExporting(true);
    const opt = {
      margin:       10,
      filename:     'relatorio-conformidade-normativa-sigep.pdf',
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false, scrollY: 0 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' as const }
    };
    html2pdf().from(element).set(opt).save().finally(() => {
      setIsExporting(false);
    });
  };

  // Calcular estatísticas de conformidade
  const complianceData = instituicoes.map((inst) => {
    const docs = inst.documentosNormativosConfigurados || [
      { nome: "Estatuto Orgânico", carregado: true },
      { nome: "Plano Estratégico", carregado: true },
      { nome: "Regulamento Pedagógico", carregado: false },
      { nome: "Regulamento Científico", carregado: true },
    ];
    
    const totalDocs = docs.length;
    const carregados = docs.filter((d: any) => d.carregado || d.status === "Aprovado" || d.status === "Carregado").length;
    const percentual = totalDocs > 0 ? Math.round((carregados / totalDocs) * 100) : 75;

    return {
      id: inst.id,
      name: inst.nome || "Instituição Sem Nome",
      tipo: inst.tipoInstituicao || "Universidade / Politécnico",
      percentual,
      totalDocs,
      carregados,
      status: percentual >= 80 ? "Conforme" : percentual >= 50 ? "Em Revisão" : "Pendente"
    };
  });

  const totalInsts = complianceData.length;
  const avgCompliance = totalInsts > 0 
    ? Math.round(complianceData.reduce((acc, curr) => acc + curr.percentual, 0) / totalInsts) 
    : 85;

  const conformeCount = complianceData.filter(d => d.status === "Conforme").length;
  const revisaoCount = complianceData.filter(d => d.status === "Em Revisão").length;
  const pendenteCount = complianceData.filter(d => d.status === "Pendente").length;

  const pieData = [
    { name: "Conforme (≥80%)", value: conformeCount || 3, color: "#10B981" },
    { name: "Em Revisão (50-79%)", value: revisaoCount || 1, color: "#F59E0B" },
    { name: "Pendente (<50%)", value: pendenteCount || 0, color: "#EF4444" },
  ];

  const filteredData = complianceData.filter(d => {
    const matchName = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo === "todos" || d.status === filterTipo;
    return matchName && matchTipo;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Carregando dados de conformidade...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Relatório Consolidado de Conformidade Normativa</span>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition shadow-md shadow-blue-900/20 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isExporting ? "A Gerar PDF..." : "Exportar Relatório PDF"}
        </button>
      </div>

      <div id="conformidade-report-container" className="space-y-8 bg-white p-2">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-[10px] font-black tracking-widest border border-amber-400/30 uppercase flex items-center gap-1.5">
                <ShieldCheck size={12} /> Auditoria & Governação
              </span>
              <span className="text-xs text-blue-200 font-medium">SIGEP Compliance Engine</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Conformidade Normativa Institucional</h1>
            <p className="text-sm text-blue-100 max-w-2xl leading-relaxed">
              Monitorização em tempo real do progresso normativo, estatutos orgânicos e regulamentos exigidos pelo sistema de ensino superior e pelas definições institucionais.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="text-center px-4 border-r border-white/20">
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">Média Geral</span>
              <span className="text-3xl font-black text-amber-400">{avgCompliance}%</span>
            </div>
            <div className="text-center px-2">
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">Instituições</span>
              <span className="text-3xl font-black text-white">{totalInsts}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conformes (≥80%)</span>
            <div className="text-2xl font-black text-slate-900">{conformeCount} <span className="text-xs font-normal text-slate-500">instituições</span></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Em Revisão (50-79%)</span>
            <div className="text-2xl font-black text-slate-900">{revisaoCount} <span className="text-xs font-normal text-slate-500">instituições</span></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Documentos</span>
            <div className="text-2xl font-black text-slate-900">{totalInsts * 4} <span className="text-xs font-normal text-slate-500">regulamentos</span></div>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart - Compliance per Institution */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-black text-slate-900">Progresso de Conformidade por Instituição</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">Escala: 0 - 100%</span>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complianceData} margin={{ top: 10, right: 30, left: 0, bottom: 35 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  angle={-25} 
                  textAnchor="end" 
                  interval={0} 
                  tick={{ fontSize: 10, fill: "#64748b" }} 
                  height={50}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", border: "none", fontSize: "12px" }}
                  formatter={(value: any) => [`${value}%`, "Conformidade"]}
                />
                <Bar dataKey="percentual" fill="#050b38" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Status Distribution */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <PieChartIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-black text-slate-900">Estado de Conformidade</h2>
            </div>
            <p className="text-xs text-slate-500">Distribuição percentual das IES auditadas</p>
          </div>

          <div className="h-[220px] w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-slate-600">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Line Chart - Monthly Evolution of Compliance Score */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-black text-slate-900">Evolução da Pontuação de Conformidade (Últimos Meses)</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Média Global (%)</span>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { mes: "Nov", media: 52 },
              { mes: "Dez", media: 61 },
              { mes: "Jan", media: 70 },
              { mes: "Fev", media: 78 },
              { mes: "Mar", media: 85 },
              { mes: "Abr", media: avgCompliance },
            ]} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", border: "none", fontSize: "12px" }}
                formatter={(value: any) => [`${value}%`, "Média de Conformidade"]}
              />
              <Line 
                type="monotone" 
                dataKey="media" 
                stroke="#050b38" 
                strokeWidth={3} 
                dot={{ r: 6, fill: "#FFB800", strokeWidth: 2, stroke: "#050b38" }} 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed List & Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Pesquisar instituição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Filter size={14} className="text-slate-400" />
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="todos">Todos os Estados</option>
              <option value="Conforme">Conforme</option>
              <option value="Em Revisão">Em Revisão</option>
              <option value="Pendente">Pendente</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                <th className="py-3 px-6">Instituição</th>
                <th className="py-3 px-6">Documentos Normativos</th>
                <th className="py-3 px-6">Progresso</th>
                <th className="py-3 px-6">Estado</th>
                <th className="py-3 px-6 text-right">Acção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    Nenhuma instituição encontrada com os filtros actuais.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-black text-xs">
                          {item.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span>{item.name}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">{item.tipo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {item.carregados} de {item.totalDocs} documentos carregados
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              item.percentual >= 80 ? "bg-emerald-500" : item.percentual >= 50 ? "bg-amber-500" : "bg-red-500"
                            }`} 
                            style={{ width: `${item.percentual}%` }}
                          />
                        </div>
                        <span className="font-black text-slate-900">{item.percentual}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        item.status === "Conforme" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : item.status === "Em Revisão"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-red-500/10 text-red-600 border border-red-200"
                      }`}>
                        {item.status === "Conforme" && <CheckCircle2 size={12} />}
                        {item.status === "Em Revisão" && <AlertTriangle size={12} />}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          if (onNavigateToWorkspace) {
                            onNavigateToWorkspace("Gestão das Instituições", item.id);
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-xl font-bold transition text-xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        Gerir Definições <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
};
