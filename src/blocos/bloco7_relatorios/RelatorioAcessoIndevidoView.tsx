import React, { useState, useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import {
  ShieldAlert,
  Shield,
  AlertTriangle,
  Users,
  Building2,
  Calendar,
  Search,
  Filter,
  ArrowLeft,
  Download,
  Printer,
  RefreshCw,
  PlusCircle,
  Eye,
  CheckCircle,
  Clock,
  ChevronDown,
  Info,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { firestoreService } from "../../lib/firestoreService";
import { isSuperBossUser } from "../../lib/auth";

export interface AccessAlertItem {
  id?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  userNuit?: string;
  targetSector?: string;
  timestamp?: string;
  readBy?: string[];
  [key: string]: any;
}

interface RelatorioAcessoIndevidoViewProps {
  onBack?: () => void;
  user?: any;
  onShowAlert?: (msg: string, type?: string) => void;
}

export default function RelatorioAcessoIndevidoView({
  onBack,
  user,
  onShowAlert,
}: RelatorioAcessoIndevidoViewProps) {
  const [alerts, setAlerts] = useState<AccessAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState<"all" | "today" | "7days" | "30days" | "year">("all");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("all");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [isAddingTest, setIsAddingTest] = useState(false);
  const [activeTab, setActiveTab] = useState<"grafico" | "tabela">("grafico");
  const [selectedAlertModal, setSelectedAlertModal] = useState<AccessAlertItem | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to real-time access alerts
  useEffect(() => {
    setLoading(true);
    let unsub = () => {};
    try {
      unsub = firestoreService.accessAlerts.subscribe((data: AccessAlertItem[]) => {
        setAlerts(data || []);
        setLoading(false);
      });
    } catch (err) {
      console.error("Erro ao subscrever alertas de acesso:", err);
      setLoading(false);
    }
    return () => unsub();
  }, []);

  // Filter alerts by time range, department, role, search term
  const filteredAlerts = useMemo(() => {
    const now = new Date();

    return alerts.filter((item) => {
      // 1. Time range filter
      if (item.timestamp) {
        const itemDate = new Date(item.timestamp);
        if (selectedTimeRange === "today") {
          const isSameDay =
            itemDate.getDate() === now.getDate() &&
            itemDate.getMonth() === now.getMonth() &&
            itemDate.getFullYear() === now.getFullYear();
          if (!isSameDay) return false;
        } else if (selectedTimeRange === "7days") {
          const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 7) return false;
        } else if (selectedTimeRange === "30days") {
          const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 30) return false;
        } else if (selectedTimeRange === "year") {
          if (itemDate.getFullYear() !== now.getFullYear()) return false;
        }
      }

      // 2. Department filter
      const dept = (item.targetSector || "Não Especificado").trim();
      if (selectedDeptFilter !== "all" && dept !== selectedDeptFilter) {
        return false;
      }

      // 3. Role filter
      const role = (item.userRole || "Não especificado").trim();
      if (selectedRoleFilter !== "all" && role !== selectedRoleFilter) {
        return false;
      }

      // 4. Search query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          (item.userName || "").toLowerCase().includes(q) ||
          (item.userEmail || "").toLowerCase().includes(q) ||
          (item.userNuit || "").toLowerCase().includes(q) ||
          (item.userRole || "").toLowerCase().includes(q) ||
          (item.targetSector || "").toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [alerts, selectedTimeRange, selectedDeptFilter, selectedRoleFilter, searchTerm]);

  // Aggregation for D3 Bar Chart: Attempts grouped by Target Department
  const departmentAggregates = useMemo(() => {
    const map: Record<
      string,
      {
        department: string;
        count: number;
        users: Set<string>;
        roles: Set<string>;
        latestDate?: string;
      }
    > = {};

    filteredAlerts.forEach((a) => {
      const dept = (a.targetSector || "Geral / Não Especificado").trim();
      if (!map[dept]) {
        map[dept] = {
          department: dept,
          count: 0,
          users: new Set(),
          roles: new Set(),
          latestDate: a.timestamp,
        };
      }
      map[dept].count += 1;
      if (a.userName) map[dept].users.add(a.userName);
      if (a.userRole) map[dept].roles.add(a.userRole);
      if (a.timestamp && (!map[dept].latestDate || new Date(a.timestamp) > new Date(map[dept].latestDate!))) {
        map[dept].latestDate = a.timestamp;
      }
    });

    return Object.values(map)
      .map((item) => ({
        department: item.department,
        count: item.count,
        uniqueUsers: item.users.size,
        roles: Array.from(item.roles),
        latestDate: item.latestDate,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredAlerts]);

  // Executive KPI summary calculations
  const kpis = useMemo(() => {
    const total = filteredAlerts.length;
    const uniqueDepts = departmentAggregates.length;
    const uniqueUsersSet = new Set(
      filteredAlerts.map((a) => a.userEmail || a.userNuit || a.userName || "desconhecido")
    );
    const topDept = departmentAggregates[0] || null;

    return {
      total,
      uniqueDepts,
      uniqueUsers: uniqueUsersSet.size,
      topDeptName: topDept ? topDept.department : "Nenhum",
      topDeptCount: topDept ? topDept.count : 0,
      topDeptPercent: total > 0 && topDept ? Math.round((topDept.count / total) * 100) : 0,
    };
  }, [filteredAlerts, departmentAggregates]);

  // Unique lists for filter dropdowns
  const availableDepartments = useMemo(() => {
    const set = new Set<string>();
    alerts.forEach((a) => {
      if (a.targetSector) set.add(a.targetSector.trim());
    });
    return Array.from(set).sort();
  }, [alerts]);

  const availableRoles = useMemo(() => {
    const set = new Set<string>();
    alerts.forEach((a) => {
      if (a.userRole) set.add(a.userRole.trim());
    });
    return Array.from(set).sort();
  }, [alerts]);

  // D3 Rendering Engine for Bar Chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || activeTab !== "grafico") return;

    const data = departmentAggregates;
    const container = containerRef.current;
    const containerWidth = container.clientWidth || 800;
    const margin = { top: 40, right: 30, bottom: 90, left: 60 };
    const width = Math.max(containerWidth, 600) - margin.left - margin.right;
    const height = 420 - margin.top - margin.bottom;

    // Clear previous D3 elements
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("class", "overflow-visible");

    // Defs: Gradients and Filters
    const defs = svg.append("defs");

    // Primary High Threat Gradient
    const gradientHigh = defs
      .append("linearGradient")
      .attr("id", "bar-gradient-high")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    gradientHigh.append("stop").attr("offset", "0%").attr("stop-color", "#ef4444");
    gradientHigh.append("stop").attr("offset", "100%").attr("stop-color", "#991b1b");

    // Moderate Threat Gradient
    const gradientMed = defs
      .append("linearGradient")
      .attr("id", "bar-gradient-med")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    gradientMed.append("stop").attr("offset", "0%").attr("stop-color", "#f59e0b");
    gradientMed.append("stop").attr("offset", "100%").attr("stop-color", "#b45309");

    // Standard Threat Gradient
    const gradientNormal = defs
      .append("linearGradient")
      .attr("id", "bar-gradient-normal")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    gradientNormal.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6");
    gradientNormal.append("stop").attr("offset", "100%").attr("stop-color", "#1e3a8a");

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Empty state handling
    if (data.length === 0) {
      g.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#64748b")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text("Sem registos de tentativas de acesso para o filtro selecionado.");
      return;
    }

    // X Scale: Categorical Band for Departments
    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(data.map((d) => d.department))
      .padding(0.35);

    // Y Scale: Numerical Linear for Attempt Counts
    const maxVal = d3.max(data, (d) => d.count) || 10;
    const y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, Math.ceil(maxVal * 1.2)])
      .nice();

    // Horizontal Grid Lines
    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-dasharray", "3,3");

    // X Axis
    const xAxis = g
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    xAxis
      .selectAll("text")
      .attr("transform", "translate(-10,12)rotate(-35)")
      .style("text-anchor", "end")
      .style("font-size", "11px")
      .style("font-weight", "600")
      .style("fill", "#1e293b")
      .text((d: any) => {
        const str = String(d);
        return str.length > 22 ? str.substring(0, 20) + "..." : str;
      });

    xAxis.select(".domain").attr("stroke", "#cbd5e1");

    // Y Axis
    const yAxis = g.append("g").call(
      d3
        .axisLeft(y)
        .ticks(Math.min(maxVal, 8))
        .tickFormat(d3.format("d"))
    );
    yAxis.select(".domain").attr("stroke", "#cbd5e1");
    yAxis
      .selectAll("text")
      .style("font-size", "11px")
      .style("font-weight", "600")
      .style("fill", "#475569");

    // Y Axis Label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 18)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#475569")
      .attr("font-size", "11px")
      .attr("font-weight", "bold")
      .text("Número de Tentativas de Intrusão");

    // Average Threshold Line
    const avgCount = d3.mean(data, (d) => d.count) || 0;
    if (data.length > 1 && avgCount > 0) {
      g.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(avgCount))
        .attr("y2", y(avgCount))
        .attr("stroke", "#f59e0b")
        .attr("stroke-dasharray", "4,4")
        .attr("stroke-width", 1.5);

      g.append("text")
        .attr("x", width - 5)
        .attr("y", y(avgCount) - 6)
        .attr("text-anchor", "end")
        .attr("fill", "#b45309")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .text(`Média: ${avgCount.toFixed(1)}`);
    }

    // Tooltip Selection
    const tooltip = d3
      .select(container)
      .selectAll(".d3-tooltip")
      .data([null])
      .join("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(15, 23, 42, 0.95)")
      .style("color", "#fff")
      .style("padding", "10px 14px")
      .style("border-radius", "10px")
      .style("font-size", "12px")
      .style("box-shadow", "0 10px 25px rgba(0,0,0,0.25)")
      .style("pointer-events", "none")
      .style("z-index", "100")
      .style("border", "1px solid rgba(255,255,255,0.1)");

    // Bars
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar transition-all cursor-pointer")
      .attr("x", (d) => x(d.department) || 0)
      .attr("width", x.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", (d, i) => {
        if (i === 0 && d.count >= 5) return "url(#bar-gradient-high)";
        if (d.count >= 3) return "url(#bar-gradient-med)";
        return "url(#bar-gradient-normal)";
      })
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 0.8).attr("stroke", "#FFB800").attr("stroke-width", 2);

        const totalAttempts = filteredAlerts.length;
        const pct = totalAttempts > 0 ? ((d.count / totalAttempts) * 100).toFixed(1) : "0";

        tooltip
          .style("visibility", "visible")
          .html(
            `
            <div class="space-y-1">
              <div class="font-black text-amber-300 text-xs border-b border-slate-700 pb-1 mb-1 flex items-center justify-between gap-4">
                <span>${d.department}</span>
                <span class="bg-red-500/30 text-red-300 px-1.5 py-0.5 rounded text-[10px]">${pct}% do total</span>
              </div>
              <div class="flex items-center justify-between gap-4 text-xs font-semibold">
                <span class="text-slate-300">Tentativas Bloqueadas:</span>
                <span class="text-white font-black">${d.count}</span>
              </div>
              <div class="flex items-center justify-between gap-4 text-xs">
                <span class="text-slate-300">Utilizadores Únicos:</span>
                <span class="text-emerald-400 font-bold">${d.uniqueUsers}</span>
              </div>
              ${
                d.roles.length > 0
                  ? `<div class="text-[10px] text-slate-400 pt-1">Perfis: ${d.roles.slice(0, 3).join(", ")}</div>`
                  : ""
              }
            </div>
          `
          );
      })
      .on("mousemove", function (event) {
        const bounds = container.getBoundingClientRect();
        tooltip
          .style("top", `${event.clientY - bounds.top - 70}px`)
          .style("left", `${Math.min(event.clientX - bounds.left + 15, containerWidth - 240)}px`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 1).attr("stroke", "none");
        tooltip.style("visibility", "hidden");
      })
      .on("click", (_event, d) => {
        setSelectedDeptFilter(d.department);
        setActiveTab("tabela");
      })
      .transition()
      .duration(750)
      .delay((_d, i) => i * 40)
      .attr("y", (d) => y(d.count))
      .attr("height", (d) => height - y(d.count));

    // Value Labels on Top of Bars
    g.selectAll(".bar-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", (d) => (x(d.department) || 0) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.count) - 8)
      .attr("text-anchor", "middle")
      .attr("fill", "#0f172a")
      .attr("font-size", "11px")
      .attr("font-weight", "800")
      .attr("opacity", 0)
      .text((d) => d.count)
      .transition()
      .duration(750)
      .delay((_d, i) => i * 40 + 300)
      .attr("opacity", 1);
  }, [departmentAggregates, activeTab, filteredAlerts]);

  // Action: Add Simulated Test Alert for immediate review
  const handleAddTestAlert = async () => {
    setIsAddingTest(true);
    try {
      const sampleDepts = [
        "Unidade Gestora e Executora de Aquisições",
        "Departamento de Recursos Humanos",
        "Departamento de Finanças",
        "Secretaria Geral",
        "Gabinete do Diretor-Geral",
        "Departamento de Biblioteca",
        "Departamento TIC",
      ];
      const randomDept = sampleDepts[Math.floor(Math.random() * sampleDepts.length)];
      const sampleRoles = ["Estudante", "Docente", "Técnico Administrativo", "Colaborador Externo"];
      const randomRole = sampleRoles[Math.floor(Math.random() * sampleRoles.length)];

      await firestoreService.accessAlerts.add({
        userName: user?.name || "Utilizador de Teste Auditoria",
        userEmail: user?.email || "auditoria@sigep.ac.mz",
        userRole: randomRole,
        userNuit: "109876543",
        targetSector: randomDept,
        timestamp: new Date().toISOString(),
        readBy: [],
        note: "Tentativa de acesso simulada para validação de padrões no gráfico D3",
      });

      if (onShowAlert) {
        onShowAlert("Alerta de teste registado com sucesso em 'accessAlerts'!", "success");
      }
    } catch (e: any) {
      console.error("Erro ao simular alerta:", e);
      if (onShowAlert) {
        onShowAlert("Erro ao registar alerta de teste.", "error");
      }
    } finally {
      setIsAddingTest(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredAlerts.length === 0) {
      if (onShowAlert) onShowAlert("Não existem registos para exportar.", "info");
      return;
    }

    const headers = ["Data e Hora", "Utilizador", "Email", "NUIT", "Cargo/Perfil", "Departamento Alvo"];
    const rows = filteredAlerts.map((a) => [
      a.timestamp ? new Date(a.timestamp).toLocaleString("pt-MZ") : "-",
      `"${a.userName || ""}"`,
      `"${a.userEmail || ""}"`,
      `"${a.userNuit || ""}"`,
      `"${a.userRole || ""}"`,
      `"${a.targetSector || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_acessos_indevidos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-6">
      {/* Top Header & Navigation */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all cursor-pointer"
              title="Voltar aos Relatórios"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-red-100 text-red-700 rounded-xl">
                <ShieldAlert size={22} />
              </span>
              <h1 className="text-xl md:text-2xl font-black text-[#050b38] tracking-tight">
                Relatório de Tentativas de Acesso Indevido
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Consolidação analítica de alertas em tempo real (<code className="text-red-700 font-bold">accessAlerts</code>) com identificação de padrões de intrusão por departamento via D3.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleAddTestAlert}
            disabled={isAddingTest}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            title="Adiciona um registo de teste à coleção accessAlerts para validação"
          >
            <PlusCircle size={16} />
            <span>{isAddingTest ? "A Registar..." : "Simular Alerta de Teste"}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#050b38] hover:bg-[#0c186b] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Printer size={16} />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Attempts */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total de Tentativas
            </span>
            <span className="text-2xl font-black text-red-600 mt-1 block">
              {kpis.total}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Bloqueios de acesso registados</span>
          </div>
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>

        {/* Unique Departments */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Departamentos Alvo
            </span>
            <span className="text-2xl font-black text-[#050b38] mt-1 block">
              {kpis.uniqueDepts}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Setores com tentativas registadas</span>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-[#050b38] rounded-2xl flex items-center justify-center">
            <Building2 size={24} />
          </div>
        </div>

        {/* Unique Suspects */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Utilizadores Infratores
            </span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {kpis.uniqueUsers}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Contas e NUITs envolvidos</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        {/* Top Targeted Department */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="overflow-hidden pr-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Setor Mais Visado
            </span>
            <span className="text-base font-black text-red-700 truncate mt-1 block" title={kpis.topDeptName}>
              {kpis.topDeptName}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {kpis.topDeptCount} tentativas ({kpis.topDeptPercent}% do total)
            </span>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full lg:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, email, NUIT ou setor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#050b38] text-slate-800"
            />
          </div>

          {/* Time range buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
              <Calendar size={14} /> Período:
            </span>
            {[
              { id: "all", label: "Tudo" },
              { id: "today", label: "Hoje" },
              { id: "7days", label: "7 Dias" },
              { id: "30days", label: "30 Dias" },
              { id: "year", label: "Este Ano" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTimeRange(t.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedTimeRange === t.id
                    ? "bg-[#050b38] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Second Row: Specific Filters & Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* Department Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <Filter size={13} className="text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500">Setor:</span>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Todos ({availableDepartments.length})</option>
                {availableDepartments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            {availableRoles.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                <Users size={13} className="text-slate-400" />
                <span className="text-[11px] font-bold text-slate-500">Perfil:</span>
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Todos ({availableRoles.length})</option>
                  {availableRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(selectedDeptFilter !== "all" || selectedRoleFilter !== "all" || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedDeptFilter("all");
                  setSelectedRoleFilter("all");
                  setSearchTerm("");
                }}
                className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
              >
                Limpar Filtros
              </button>
            )}
          </div>

          {/* Tab Selector: Gráfico vs Tabela */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl self-end sm:self-auto">
            <button
              onClick={() => setActiveTab("grafico")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "grafico"
                  ? "bg-white text-[#050b38] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TrendingUp size={14} />
              <span>Gráfico de Barras D3</span>
            </button>
            <button
              onClick={() => setActiveTab("tabela")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "tabela"
                  ? "bg-white text-[#050b38] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileSpreadsheet size={14} />
              <span>Registos Detalhados ({filteredAlerts.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Chart or Table */}
      {activeTab === "grafico" ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                <span>Padrão de Tentativas de Intrusão por Departamento</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded-full font-bold">
                  D3.js Interativo
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Passe o rato pelas barras para ver detalhes. Clique numa barra para filtrar a listagem daquele departamento.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-red-600 inline-block" />
                Alto Volume (≥5)
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
                Médio (3-4)
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
                Padrão (1-2)
              </span>
            </div>
          </div>

          {/* D3 SVG Container */}
          <div ref={containerRef} className="w-full relative min-h-[420px] overflow-x-auto">
            {loading ? (
              <div className="h-[420px] flex items-center justify-center">
                <RefreshCw size={32} className="animate-spin text-slate-400" />
              </div>
            ) : (
              <svg ref={svgRef} className="w-full h-[420px]" />
            )}
          </div>

          {/* Chart Insights & Guidance Footer */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-[#050b38] shrink-0" />
              <span>
                <strong>Interpretação de Segurança:</strong> As tentativas acima da linha pontilhada amarela representam anomalias estatísticas com potencial de ataque direcionado ou persistente a áreas restritas.
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-400 shrink-0">
              Atualização em tempo real via Firestore
            </span>
          </div>
        </div>
      ) : (
        /* Detailed Analytical Table */
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-black text-slate-800">
              Registos Consolidados de Tentativas de Acesso ({filteredAlerts.length})
            </h2>
            <button
              onClick={handleExportCSV}
              className="text-xs font-bold text-[#050b38] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} /> Exportar Registos
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Data e Hora</th>
                  <th className="px-5 py-3">Utilizador</th>
                  <th className="px-5 py-3">Email / NUIT</th>
                  <th className="px-5 py-3">Cargo / Perfil</th>
                  <th className="px-5 py-3">Departamento Alvo</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400 font-medium">
                      Nenhum registo de tentativa de acesso encontrado para os critérios selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((item, idx) => {
                    const formattedDate = item.timestamp
                      ? new Date(item.timestamp).toLocaleString("pt-MZ")
                      : "Sem data";
                    const isRead = Array.isArray(item.readBy) && item.readBy.length > 0;

                    return (
                      <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">
                          {item.userName || "Desconhecido"}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-800">{item.userEmail || "-"}</div>
                          {item.userNuit && (
                            <div className="text-[10px] text-slate-400 font-mono">NUIT: {item.userNuit}</div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-600">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-700">
                            {item.userRole || "Não especificado"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-red-700">
                          {item.targetSector || "Geral"}
                        </td>
                        <td className="px-5 py-3.5">
                          {isRead ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle size={10} /> Notificado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                              <Clock size={10} /> Pendente
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => setSelectedAlertModal(item)}
                            className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            title="Ver Detalhes do Alerta"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alert Detail Modal */}
      {selectedAlertModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-red-100 text-red-700 rounded-xl">
                  <ShieldAlert size={20} />
                </span>
                <h3 className="text-base font-black text-[#050b38]">
                  Detalhe da Tentativa de Acesso
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlertModal(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Data e Hora:</span>
                  <span className="font-mono text-slate-800">
                    {selectedAlertModal.timestamp
                      ? new Date(selectedAlertModal.timestamp).toLocaleString("pt-MZ")
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Departamento Alvo:</span>
                  <span className="font-bold text-red-600">{selectedAlertModal.targetSector || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Utilizador:</span>
                  <span className="font-bold text-slate-800">{selectedAlertModal.userName || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Email:</span>
                  <span className="text-slate-700">{selectedAlertModal.userEmail || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">NUIT:</span>
                  <span className="font-mono text-slate-700">{selectedAlertModal.userNuit || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Perfil / Função:</span>
                  <span className="font-semibold text-slate-800">{selectedAlertModal.userRole || "-"}</span>
                </div>
              </div>

              {selectedAlertModal.note && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                  <span className="font-bold block mb-1">Nota de Auditoria:</span>
                  <p>{selectedAlertModal.note}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAlertModal(null)}
                className="px-5 py-2 bg-[#050b38] hover:bg-[#0c186b] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
