import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  FileText,
  Calendar,
  Download,
  Filter,
  ChevronRight,
  History,
  Building2,
  LayoutGrid,
  FileCheck,
  ArrowLeft,
  Send,
  Cloud,
  GitMerge,
  CheckCircle2,
  Lock,
  Users,
  Activity,
  Camera,
  AlertTriangle,
  Upload,
  Trash2,
  Image as ImageIcon,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import StandardReportModel, {
  TechnicalActivityItem,
  SectorStaffing,
  ReportSection as StandardReportSection,
} from "../bloco7_relatorios/StandardReportModel";
import RelatorioAcessoIndevidoView from "./RelatorioAcessoIndevidoView";
import { getRoles, isSuperBossUser } from "../../lib/auth";
import {
  FUNCIONARIOS,
  UNIDADES_ORGANICAS_SISTEMA,
  DEPARTAMENTOS,
  REPARTICOES,
  CURSOS,
  SETORES,
} from "../../constants/formOptions";
import { firestoreService } from "../../lib/firestoreService";
import { ProcessingCircle } from "../../components/ui/ProcessingCircle";

export interface ReportSectionData {
  title: string;
  content: string;
  setorOuUnidade?: string;
  efetivoSetorial?: SectorStaffing;
  activities?: TechnicalActivityItem[];
  dificuldadesConstrangimentos?: string;
  img1?: string;
  legenda1?: string;
  img2?: string;
  legenda2?: string;
  id?: string;
  owner?: string;
}

export interface ReportData {
  id: string;
  title: string;
  direction: string;
  department?: string;
  section?: string;
  setor?: string;
  year: number;
  semester?: number; // 1 or 2
  type: "Anual" | "Semestral";
  level: "setor" | "reparticao" | "departamento" | "direcao" | "institucional";
  status: "draft" | "submitted" | "compiled" | "final";
  coverImage?: string;
  sections: ReportSectionData[];
  efetivoGlobal?: SectorStaffing;
  stats?: {
    cursos?: number;
    novosIngressos?: number;
    matriculados?: number;
    desistentes?: number;
    bolseiros?: number;
    aproveitamento?: number;
    docentesGlobal?: number;
    ctaGlobal?: number;
    orcamentoEstado?: number;
    receitasProprias?: number;
    financiamentoParceiros?: number;
    titulosBiblioteca?: number;
  };
  technicalSheet?: { name: string; role: string }[];
  abbreviations?: { sigla: string; significado: string }[];
  createdBy?: string;
  updatedAt?: any;
  childReports?: string[];
}

export const getUserOrganizationalLevel = (user: any): "setor" | "reparticao" | "departamento" | "direcao" | "institucional" => {
  if (!user) return "setor";
  const role = (user.role || user.cargo || "").toLowerCase();
  const sector = (user.setor || user.sector || user.direcao || user.departamento || "").toLowerCase();
  const dep = (user.departamento || user.department || "").toLowerCase();

  // O Setor de Relatórios no Departamento de Planificação, Estudos e Projetos (DPEP) é o órgão central
  if (
    role.includes("geral") ||
    role.includes("planificacao") ||
    role.includes("planificação") ||
    role.includes("relatorio") ||
    role.includes("relatório") ||
    sector.includes("planificacao") ||
    sector.includes("planificação") ||
    sector.includes("dpep") ||
    sector.includes("estudos") ||
    sector.includes("relatorio") ||
    sector.includes("relatório") ||
    dep.includes("planificacao") ||
    dep.includes("planificação") ||
    dep.includes("dpep") ||
    dep.includes("estudos")
  )
    return "institucional";
  if (role.includes("diretor") || role.includes("director")) return "direcao";
  if (role.includes("chefe de departamento") || role.includes("departamento")) return "departamento";
  if (role.includes("chefe de reparticao") || role.includes("reparticao")) return "reparticao";
  return "setor";
};

export default function ReportsView({
  onShowAlert,
  onBack,
  onSetHeaderActions,
  initialDirection,
  initialMode,
  user,
}: {
  onShowAlert: (msg: string) => void;
  onBack: () => void;
  onSetHeaderActions?: (actions: React.ReactNode) => void;
  initialDirection?: string;
  initialMode?:
    | "type-selection"
    | "action-selection"
    | "consult"
    | "edit-report"
    | "view-report"
    | "workflow"
    | "access-alerts";
  user?: any;
}) {
  const directions = [
    {
      id: "DG",
      name: "Gabinete do Diretor-Geral",
      icon: <Building2 />,
      color: "blue",
    },
    {
      id: "DICOSAFA",
      name: "DICOSAFA (Direção de Coordenação de Serviços de Administração, Finanças e de Apoio)",
      icon: <LayoutGrid />,
      color: "purple",
    },
    {
      id: "DICOSSER",
      name: "DICOSSER (Direção de Coordenação de Serviços Sociais, Estudantis e Registo)",
      icon: <FileCheck />,
      color: "green",
    },
    {
      id: "DE",
      name: "Divisão de Engenharia",
      icon: <Building2 />,
      color: "orange",
    },
  ];

  const currentYear = new Date().getFullYear();

  const [reportType, setReportType] = useState<"Anual" | "Semestral" | null>(null);
  const [mode, setMode] = useState<
    | "type-selection"
    | "action-selection"
    | "consult"
    | "edit-report"
    | "view-report"
    | "workflow"
    | "access-alerts"
  >(initialMode || "type-selection");
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedDirection, setSelectedDirection] = useState<string | null>(
    initialDirection || null
  );
  const [activeReport, setActiveReport] = useState<ReportData | null>(null);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userLevel = getUserOrganizationalLevel(user);

  useEffect(() => {
    const unsubscribe = firestoreService.reports.subscribe((data) => {
      const userDepartment = user?.departamento || user?.department || "";
      const userDirection = user?.direcao || user?.direction || "";

      const filteredData = data.filter((r) => {
        if (userLevel === "institucional") return true;
        return (
          (userDirection && r.direction === userDirection) ||
          (userDepartment && r.department === userDepartment)
        );
      });

      setReports(filteredData as any[]);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (reportType === "Anual") {
      setSelectedYear(currentYear - 1);
    } else if (reportType === "Semestral") {
      setSelectedYear(currentYear);
    }
  }, [reportType]);

  const handleSaveReport = async (data: Partial<ReportData>) => {
    try {
      if (data.id) {
        await firestoreService.reports.update(data.id, {
          ...data,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await firestoreService.reports.add({
          ...data,
          status: "draft",
          level: data.level || userLevel,
          createdBy: user?.id || user?.email,
          updatedAt: new Date().toISOString(),
        });
      }
      onShowAlert("Relatório técnico guardado com sucesso!");
      setMode("consult");
    } catch (error) {
      console.error("Erro ao salvar relatório:", error);
      onShowAlert("Erro ao guardar relatório na base de dados.");
    }
  };

  const handleSubmitReport = async (report: ReportData) => {
    try {
      let targetLabel = "Nível Superior";
      if (report.level === "setor") targetLabel = "Repartição";
      if (report.level === "reparticao") targetLabel = "Departamento";
      if (report.level === "departamento") targetLabel = "Direção";
      if (report.level === "direcao") targetLabel = "Setor de Relatórios (Departamento de Planificação, Estudos e Projetos - DPEP)";

      if (
        !window.confirm(
          `Tem a certeza que deseja enviar este relatório técnico para o ${targetLabel}?`
        )
      )
        return;

      setIsLoading(true);

      // Enviar para o arquivo morto / histórico digital
      await firestoreService.archive_documents.add({
        title: `Relatório Técnico (${report.level.toUpperCase()}): ${report.title} - ${new Date().toLocaleDateString("pt-PT")}`,
        year: new Date().getFullYear(),
        type: "Relatórios de Actividades",
        date: new Date().toISOString().split("T")[0],
        sections: report.sections,
        author: user?.nome || user?.email,
        origin: report.level,
        isDigitalized: true,
      });

      await firestoreService.reports.update(report.id, {
        status: "submitted",
        updatedAt: new Date().toISOString(),
      });

      onShowAlert(`Relatório submetido para a ${targetLabel} com sucesso!`);
    } catch (error) {
      console.error(error);
      onShowAlert("Erro ao submeter relatório.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderWorkflowStatus = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
            Rascunho
          </span>
        );
      case "submitted":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">
            Submetido
          </span>
        );
      case "compiled":
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-[10px] font-bold">
            Compilado
          </span>
        );
      case "final":
        return (
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">
            Aprovado / Final
          </span>
        );
      default:
        return null;
    }
  };

  const renderTypeSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mx-auto mt-8">
      <button
        type="button"
        onClick={() => {
          setReportType("Anual");
          setMode("action-selection");
        }}
        className="group bg-gradient-to-br from-blue-700 to-indigo-800 p-7 rounded-3xl shadow-xl hover:scale-[1.02] transition-all flex flex-col items-center text-center gap-5 text-white border-4 border-white/20 cursor-pointer"
      >
        <div className="p-4 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-colors">
          <GitMerge size={38} />
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2 tracking-tight">
            Relatórios Anuais Escalonados
          </h3>
          <p className="text-blue-100 text-xs leading-relaxed">
            Fluxo progressivo: <strong>Setor → Repartição → Departamento → Direção → Institucional</strong>.
          </p>
          <span className="inline-block mt-3 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider">
            Recomendado
          </span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => {
          setReportType("Semestral");
          setMode("action-selection");
        }}
        className="group bg-white border-2 border-gray-200 p-7 rounded-3xl shadow-sm hover:border-purple-500 hover:shadow-xl transition-all flex flex-col items-center text-center gap-5 cursor-pointer"
      >
        <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
          <Calendar size={38} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
            Relatórios Semestrais
          </h3>
          <p className="text-gray-500 text-xs leading-relaxed">
            Reportes periódicos semestrais com quadros de efetivo e evidências.
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => {
          setActiveReport(null);
          setMode("edit-report");
        }}
        className="group bg-white border-2 border-gray-200 p-7 rounded-3xl shadow-sm hover:border-emerald-500 hover:shadow-xl transition-all flex flex-col items-center text-center gap-5 cursor-pointer"
      >
        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
          <Plus size={38} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
            Novo Relatório Técnico
          </h3>
          <p className="text-gray-500 text-xs leading-relaxed">
            Iniciar rascunho direto de setor, repartição ou departamento.
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => {
          setMode("access-alerts");
        }}
        className="group bg-gradient-to-br from-red-800 to-rose-950 p-7 rounded-3xl shadow-xl hover:scale-[1.02] transition-all flex flex-col items-center text-center gap-5 text-white border-4 border-white/20 cursor-pointer"
      >
        <div className="p-4 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-colors">
          <ShieldAlert size={38} />
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2 tracking-tight">
            Tentativas de Acesso & Intrusão
          </h3>
          <p className="text-rose-100 text-xs leading-relaxed">
            Consolidação dos registos <strong>accessAlerts</strong> com análise de padrões de intrusão por departamento via <strong>D3.js</strong>.
          </p>
          <span className="inline-block mt-3 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider">
            Auditoria / D3
          </span>
        </div>
      </button>
    </div>
  );

  const renderActionSelection = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl mx-auto mt-8 space-y-8"
    >
      <button
        type="button"
        onClick={() => setMode("type-selection")}
        className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-2 cursor-pointer"
      >
        ← Voltar aos tipos de relatório
      </button>

      <div className="text-center mb-6">
        <h3 className="text-3xl font-black text-gray-900">
          Relatórios Técnicos ({reportType})
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          Estrutura organizacional escalonada com métricas de execução e evidências fotográficas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          type="button"
          onClick={() => setMode("consult")}
          className="group bg-white border-2 border-gray-200 p-7 rounded-3xl shadow-sm hover:border-blue-500 hover:shadow-xl transition-all flex flex-col items-center text-center gap-4 cursor-pointer"
        >
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Search size={30} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Consultar & Gerir</h3>
            <p className="text-xs text-gray-500 mt-1">
              Histórico de relatórios salvos e submetidos.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveReport(null);
            setMode("edit-report");
          }}
          className="group bg-white border-2 border-gray-200 p-7 rounded-3xl shadow-sm hover:border-emerald-500 hover:shadow-xl transition-all flex flex-col items-center text-center gap-4 cursor-pointer"
        >
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Plus size={30} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Criar Novo</h3>
            <p className="text-xs text-gray-500 mt-1">
              Elaborar relatório técnico do seu setor/repartição.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMode("workflow")}
          className="group bg-white border-2 border-gray-200 p-7 rounded-3xl shadow-sm hover:border-purple-500 hover:shadow-xl transition-all flex flex-col items-center text-center gap-4 cursor-pointer"
        >
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <GitMerge size={30} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Unificar (Compilação)</h3>
            <p className="text-xs text-gray-500 mt-1">
              Compilar relatórios recebidos dos níveis subordinados.
            </p>
          </div>
        </button>
      </div>
    </motion.div>
  );

  const years = Array.from(
    { length: new Date().getFullYear() - 2010 + 1 },
    (_, i) => 2010 + i
  ).reverse();

  const renderWorkflow = () => {
    // Determinar quais relatórios estão aguardando unificação no nível do utilizador
    const pendingReports = reports.filter((r) => {
      if (r.type !== reportType || r.year !== selectedYear) return false;
      if (r.status !== "submitted") return false;

      if (userLevel === "reparticao") {
        return r.level === "setor";
      }
      if (userLevel === "departamento") {
        return r.level === "reparticao";
      }
      if (userLevel === "direcao") {
        return r.level === "departamento";
      }
      if (userLevel === "institucional") {
        return r.level === "direcao";
      }
      return false;
    });

    const handleCompile = () => {
      if (pendingReports.length === 0) {
        onShowAlert("Não existem relatórios submetidos para compilar no seu nível.");
        return;
      }

      let compiledTitle = `Relatório Técnico Consolidado ${reportType} ${selectedYear}`;
      let targetLevel: "reparticao" | "departamento" | "direcao" | "institucional" = "reparticao";

      if (userLevel === "reparticao") {
        compiledTitle = `Relatório da Repartição de ${user?.reparticao || "Gestão"}`;
        targetLevel = "reparticao";
      } else if (userLevel === "departamento") {
        compiledTitle = `Relatório do Departamento de ${user?.department || user?.departamento || "Serviços"}`;
        targetLevel = "departamento";
      } else if (userLevel === "direcao") {
        compiledTitle = `Relatório da Direção de ${user?.direction || user?.direcao || "Coordenação"}`;
        targetLevel = "direcao";
      } else if (userLevel === "institucional") {
        compiledTitle = `Relatório Institucional de Actividades do ISPS (Songo)`;
        targetLevel = "institucional";
      }

      // Consolidar secções e evidências dos relatórios subordinados
      const compiledSections: ReportSectionData[] = [];

      pendingReports.forEach((r) => {
        r.sections.forEach((sec) => {
          compiledSections.push({
            ...sec,
            setorOuUnidade: r.setor || r.section || r.department || r.direction,
          });
        });
      });

      const newReport: ReportData = {
        id: "",
        title: compiledTitle,
        direction: user?.direction || user?.direcao || "",
        department: user?.department || user?.departamento || "",
        section: user?.reparticao || "",
        setor: user?.setor || "",
        year: selectedYear,
        type: reportType || "Anual",
        level: targetLevel,
        status: "draft",
        sections: compiledSections,
        childReports: pendingReports.map((r) => r.id),
      };

      setActiveReport(newReport);
      setMode("edit-report");
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl mx-auto space-y-8"
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMode("action-selection")}
            className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-2 cursor-pointer"
          >
            ← Voltar às Ações
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-gray-500">
              Ano Selecionado: {selectedYear}
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 bg-purple-50/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Unificação de Relatórios ({userLevel === "institucional" ? "CENTRAL DPEP - RELATÓRIO INSTITUCIONAL" : userLevel.toUpperCase()})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {userLevel === "institucional"
                  ? "Central do Setor de Relatórios (Departamento de Planificação, Estudos e Projetos - DPEP): Recebe todos os relatórios das Direções para elaboração do Relatório Institucional."
                  : "Compilação encadeada de relatórios recebidos do nível inferior."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCompile}
              disabled={pendingReports.length === 0}
              className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-all disabled:opacity-50 shadow-md text-xs cursor-pointer"
            >
              <GitMerge size={18} /> UNIFICAR {pendingReports.length} RELATÓRIOS
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {pendingReports.length === 0 ? (
              <div className="p-12 text-center text-gray-400 italic flex flex-col items-center gap-3">
                <CheckCircle2 size={40} className="text-gray-300" />
                Nenhum relatório pendente de unificação para {selectedYear}.
              </div>
            ) : (
              pendingReports.map((r) => (
                <div
                  key={r.id}
                  className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
                      <FileText size={22} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{r.title}</p>
                      <p className="text-xs text-gray-500">
                        Nível: <strong className="uppercase">{r.level}</strong> • {r.direction} {r.department ? `> ${r.department}` : ""} {r.section ? `> ${r.section}` : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveReport(r);
                      setMode("view-report");
                    }}
                    className="text-blue-600 font-bold text-xs hover:underline px-4 py-2 border border-blue-200 rounded-xl hover:bg-blue-50 cursor-pointer"
                  >
                    Visualizar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderConsult = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-5xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMode("action-selection")}
          className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-2 cursor-pointer"
        >
          ← Voltar às Ações
        </button>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-gray-500">Filtrar Ano:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-white border border-gray-200 px-3 py-1.5 rounded-xl font-bold text-xs text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Histórico & Rascunhos de Relatórios
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Consulte ou continue a edição dos seus relatórios técnicos.
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <ProcessingCircle size={32} />
            </div>
          ) : reports.filter(
              (r) => r.type === reportType && r.year === selectedYear
            ).length === 0 ? (
            <div className="p-12 text-center text-gray-400 italic">
              Nenhum relatório técnico registrado para o ano {selectedYear}.
            </div>
          ) : (
            reports
              .filter((r) => r.type === reportType && r.year === selectedYear)
              .sort(
                (a, b) =>
                  new Date(b.updatedAt || 0).getTime() -
                  new Date(a.updatedAt || 0).getTime()
              )
              .map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 text-gray-500 rounded-xl">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{doc.title}</p>
                        {renderWorkflowStatus(doc.status)}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className="font-bold text-red-600 uppercase">[{doc.level}]</span> • {doc.direction} {doc.department ? `> ${doc.department}` : ""} {doc.section ? `> ${doc.section}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveReport(doc);
                        setMode("view-report");
                      }}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                    >
                      Abrir PDF
                    </button>
                    {doc.status === "draft" && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveReport(doc);
                          setMode("edit-report");
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-200 transition-all cursor-pointer"
                      >
                        Editar
                      </button>
                    )}
                    {doc.status === "draft" && (
                      <button
                        type="button"
                        onClick={() => handleSubmitReport(doc)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Send size={13} /> Submeter
                      </button>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full h-full pb-20">
      {/* Sub-menu Superior de Navegação dos Relatórios */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs sticky top-0 z-20">
        <div className="flex items-center gap-2 flex-wrap">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-all cursor-pointer mr-1"
              title="Voltar ao Sistema"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => {
                if (mode === "access-alerts") setMode("type-selection");
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mode !== "access-alerts"
                  ? "bg-[#050b38] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText size={14} />
              <span>Relatórios Técnicos Periódicos</span>
            </button>

            <button
              onClick={() => setMode("access-alerts")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === "access-alerts"
                  ? "bg-red-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-red-700"
              }`}
            >
              <ShieldAlert size={14} />
              <span>Auditoria de Intrusão & Acesso (D3)</span>
            </button>
          </div>
        </div>

        {mode !== "type-selection" && mode !== "access-alerts" && (
          <button
            onClick={() => setMode("type-selection")}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
          >
            ← Painel Inicial de Relatórios
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {mode === "type-selection" && renderTypeSelection()}
        {mode === "action-selection" && renderActionSelection()}
        {mode === "consult" && renderConsult()}
        {mode === "workflow" && renderWorkflow()}
        {mode === "access-alerts" && (
          <RelatorioAcessoIndevidoView
            onBack={() => setMode("type-selection")}
            user={user}
            onShowAlert={onShowAlert}
          />
        )}
        {mode === "edit-report" && (
          <ReportEditor
            report={activeReport}
            reportType={reportType}
            onBack={() => setMode("action-selection")}
            onSave={handleSaveReport}
            user={user}
          />
        )}
        {mode === "view-report" && activeReport && (
          <StandardReportModel
            direction={activeReport.direction}
            department={activeReport.department}
            section={activeReport.section}
            setor={activeReport.setor}
            year={activeReport.year}
            semester={activeReport.semester}
            level={activeReport.level}
            coverImage={activeReport.coverImage}
            stats={activeReport.stats}
            title={activeReport.title}
            sections={activeReport.sections.map((s) => ({
              title: s.title,
              content: s.content,
              setorOuUnidade: s.setorOuUnidade,
              efetivoSetorial: s.efetivoSetorial,
              activities: s.activities,
              dificuldadesConstrangimentos: s.dificuldadesConstrangimentos,
              img1: s.img1,
              legenda1: s.legenda1,
              img2: s.img2,
              legenda2: s.legenda2,
            }))}
            technicalSheet={activeReport.technicalSheet}
            abbreviations={activeReport.abbreviations}
            onBack={() => setMode("consult")}
            user={user}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ReportEditor({
  report,
  reportType,
  onBack,
  onSave,
  user,
}: {
  report: ReportData | null;
  reportType: string | null;
  onBack: () => void;
  onSave: (data: Partial<ReportData>) => Promise<void>;
  user?: any;
}) {
  const currentYear = new Date().getFullYear();
  const defaultYear =
    report?.year || (reportType === "Anual" ? currentYear - 1 : currentYear);

  const userLevel = getUserOrganizationalLevel(user);

  const [level, setLevel] = useState<"setor" | "reparticao" | "departamento" | "direcao" | "institucional">(
    report?.level || userLevel
  );
  const [direcao, setDirecao] = useState(
    report?.direction || user?.direction || user?.direcao || ""
  );
  const [departamento, setDepartamento] = useState(
    report?.department || user?.department || user?.departamento || ""
  );
  const [reparticao, setReparticao] = useState(
    report?.section || user?.reparticao || ""
  );
  const [setor, setSetor] = useState(
    report?.setor || user?.setor || ""
  );

  const getDefaultTitle = () => {
    if (level === "institucional")
      return `Relatório Técnico Institucional de Actividades ${reportType || ""}`;
    if (level === "direcao")
      return `Relatório Técnico da Direção de ${direcao || "..."}`;
    if (level === "departamento")
      return `Relatório Técnico do Departamento de ${departamento || "..."}`;
    if (level === "reparticao")
      return `Relatório Técnico da Repartição de ${reparticao || "..."}`;
    return `Relatório Técnico do Setor de ${setor || "..."}`;
  };

  const [title, setTitle] = useState(report?.title || "");

  useEffect(() => {
    if (!report?.id && (!title || title.includes("Relatório Técnico"))) {
      setTitle(getDefaultTitle());
    }
  }, [direcao, departamento, reparticao, setor, level]);

  const [year, setYear] = useState(defaultYear);
  const [semester, setSemester] = useState(report?.semester || 1);
  const [coverImage, setCoverImage] = useState<string>(report?.coverImage || "");
  const [isSyncing, setIsSyncing] = useState(false);

  const [sections, setSections] = useState<ReportSectionData[]>(
    report?.sections && report.sections.length > 0
      ? report.sections
      : [
          {
            title: "1. Enquadramento e Atividades do Setor",
            content: "Descreva o enquadramento operacional do setor e os seus objetivos específicos no período.",
            setorOuUnidade: setor || "Setor Operacional",
            efetivoSetorial: {
              tecnicos: 3,
              administrativos: 1,
              auxiliares: 1,
              vagasAbertas: 0,
              observacoes: "Equipa em pleno funcionamento com alocação regular.",
            },
            activities: [
              {
                id: "act-1",
                nome: "Manutenção e inspeção técnica de equipamentos no terreno",
                planificada: true,
                realizada: true,
                meta: "100%",
                taxaExecucao: 90,
                taxaNaoExecucao: 10,
                isCampo: true,
                dificuldadesDesafios: "Acesso a peças de reposição importadas e oscilações na rede de transporte.",
              },
            ],
            dificuldadesConstrangimentos: "Limitação pontual de material técnico durante intervenções de campo.",
            img1: "",
            legenda1: "Evidência 1: Inspeção de campo aos equipamentos técnicos",
            img2: "",
            legenda2: "Evidência 2: Manutenção preventiva realizada pela equipa",
          },
        ]
  );

  const [technicalSheet, setTechnicalSheet] = useState<
    { name: string; role: string }[]
  >(
    report?.technicalSheet || [
      { name: user?.nome || user?.name || "", role: user?.role || user?.cargo || "Técnico Responsável" },
    ]
  );

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    sectionIdx: number,
    imgSlot: 1 | 2
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      const updated = [...sections];
      if (imgSlot === 1) {
        updated[sectionIdx].img1 = base64Url;
      } else {
        updated[sectionIdx].img2 = base64Url;
      }
      setSections(updated);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (sectionIdx: number, imgSlot: 1 | 2) => {
    const updated = [...sections];
    if (imgSlot === 1) {
      updated[sectionIdx].img1 = "";
    } else {
      updated[sectionIdx].img2 = "";
    }
    setSections(updated);
  };

  const addActivityToSection = (sectionIdx: number) => {
    const updated = [...sections];
    const currentActs = updated[sectionIdx].activities || [];
    const newAct: TechnicalActivityItem = {
      id: `act-${Date.now()}`,
      nome: "Nova Atividade Técnica Setorial",
      planificada: true,
      realizada: true,
      meta: "100%",
      taxaExecucao: 100,
      taxaNaoExecucao: 0,
      isCampo: false,
    };
    updated[sectionIdx].activities = [...currentActs, newAct];
    setSections(updated);
  };

  const updateActivity = (
    sectionIdx: number,
    actIdx: number,
    field: keyof TechnicalActivityItem,
    value: any
  ) => {
    const updated = [...sections];
    if (!updated[sectionIdx].activities) return;
    const act = { ...updated[sectionIdx].activities![actIdx], [field]: value };
    
    // Auto calcular % de não execução se % de execução for alterada
    if (field === "taxaExecucao") {
      const exec = Math.min(100, Math.max(0, Number(value)));
      act.taxaExecucao = exec;
      act.taxaNaoExecucao = 100 - exec;
    }

    updated[sectionIdx].activities![actIdx] = act;
    setSections(updated);
  };

  const removeActivity = (sectionIdx: number, actIdx: number) => {
    const updated = [...sections];
    if (!updated[sectionIdx].activities) return;
    updated[sectionIdx].activities = updated[sectionIdx].activities!.filter(
      (_, i) => i !== actIdx
    );
    setSections(updated);
  };

  const handleLocalSave = async () => {
    setIsSyncing(true);
    await onSave({
      id: report?.id,
      title,
      direction: direcao,
      department: departamento,
      section: reparticao,
      setor,
      year,
      semester: reportType === "Semestral" ? semester : undefined,
      type: reportType as any,
      level,
      coverImage,
      sections,
      technicalSheet,
    });
    setIsSyncing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto bg-white shadow-2xl rounded-3xl min-h-screen flex flex-col mb-12 border border-gray-200"
    >
      {/* Top Controls Bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b p-4 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-t-3xl">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 font-bold hover:text-gray-900 text-xs cursor-pointer"
        >
          <ArrowLeft size={16} /> Cancelar Edição
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 uppercase">
            {level.toUpperCase()} • {reportType}
          </span>
          <button
            type="button"
            onClick={handleLocalSave}
            disabled={isSyncing}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 text-xs shadow-lg cursor-pointer"
          >
            {isSyncing ? <ProcessingCircle size={16} /> : <Cloud size={16} />}
            {isSyncing ? "A GUARDAR..." : "GUARDAR RELATÓRIO TÉCNICO"}
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-10 flex-grow space-y-8">
        {/* Nível Organizacional Escalonado (Seleção da Hierarquia) */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Building2 size={16} className="text-red-600" />
              Nível Organizacional do Relatório (Estrutura Escalonada)
            </label>
            <div className="text-[11px] font-bold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              O Seu Nível no Sistema: <span className="text-red-600 font-black uppercase">{userLevel}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
            {[
              { id: "setor", label: "1º SETOR", desc: "Base do Setor" },
              { id: "reparticao", label: "2º REPARTIÇÃO", desc: "Compila Setores" },
              { id: "departamento", label: "3º DEPARTAMENTO", desc: "Compila Repartições" },
              { id: "direcao", label: "4º DIREÇÃO", desc: "Compila Departamentos" },
              { id: "institucional", label: "INSTITUCIONAL (DPEP)", desc: "Setor de Relatórios DPEP" },
            ].map((lvl) => {
              const isUserOwnLevel = userLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setLevel(lvl.id as any)}
                  className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    level === lvl.id
                      ? "bg-red-600 text-white border-red-600 shadow-md font-bold scale-105"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {isUserOwnLevel && (
                    <span
                      className={`absolute -top-2.5 right-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border shadow-xs ${
                        level === lvl.id
                          ? "bg-amber-300 text-slate-900 border-amber-400"
                          : "bg-blue-600 text-white border-blue-700"
                      }`}
                    >
                      ★ O Seu Nível
                    </span>
                  )}
                  <div className="text-xs font-black">{lvl.label}</div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      level === lvl.id ? "text-red-100" : "text-gray-500"
                    }`}
                  >
                    {lvl.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Informações da Estrutura Hierárquica: Setor -> Repartição -> Departamento -> Direção */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-200 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Setor Operacional:</label>
            <input
              type="text"
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              className="w-full p-2 bg-white border border-gray-200 rounded-lg outline-none font-medium"
              placeholder="Ex: Setor de Manutenção Técnica"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">Repartição:</label>
            <input
              type="text"
              value={reparticao}
              onChange={(e) => setReparticao(e.target.value)}
              className="w-full p-2 bg-white border border-gray-200 rounded-lg outline-none font-medium"
              placeholder="Ex: Repartição de Pessoal"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">Departamento:</label>
            <input
              type="text"
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              className="w-full p-2 bg-white border border-gray-200 rounded-lg outline-none font-medium"
              placeholder="Ex: Dep. de Recursos Humanos"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">Direção:</label>
            <input
              type="text"
              value={direcao}
              onChange={(e) => setDirecao(e.target.value)}
              className="w-full p-2 bg-white border border-gray-200 rounded-lg outline-none font-medium"
              placeholder="Ex: DICOSAFA"
            />
          </div>
        </div>

        {/* Título & Ano */}
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl sm:text-3xl font-black w-full outline-none border-b-2 border-gray-200 focus:border-red-600 pb-2 text-gray-900"
            placeholder="Título do Relatório Técnico"
          />

          <div className="flex items-center gap-6 text-sm font-bold text-gray-700">
            <div className="flex items-center gap-2">
              <span>Ano de Exercício:</span>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-20 text-center border-b border-gray-400 font-black p-1"
              />
            </div>
            {reportType === "Semestral" && (
              <div className="flex items-center gap-2">
                <span>Semestre:</span>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="bg-transparent border-b border-gray-400 font-black p-1"
                >
                  <option value={1}>1º Semestre</option>
                  <option value={2}>2º Semestre</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Secções do Relatório (Com Efetivo, Atividades %, Dificuldades e 2 Retângulos de Fotos por Página) */}
        <div className="space-y-10">
          <h3 className="text-lg font-black text-gray-900 border-b pb-2 flex items-center justify-between">
            <span>Secções Técnicas & Evidências do Relatório ({sections.length} Páginas/Módulos)</span>
          </h3>

          {sections.map((sec, secIdx) => (
            <div
              key={secIdx}
              className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-gray-200 shadow-sm space-y-6 relative"
            >
              {/* Título da Página/Secção */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-grow">
                  <span className="w-8 h-8 rounded-xl bg-red-600 text-white font-black flex items-center justify-center shrink-0 text-sm">
                    {secIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={sec.title}
                    onChange={(e) => {
                      const updated = [...sections];
                      updated[secIdx].title = e.target.value;
                      setSections(updated);
                    }}
                    className="text-lg font-bold text-gray-900 w-full border-b border-gray-200 focus:border-red-600 outline-none pb-1"
                    placeholder="Título da Página / Setor"
                  />
                </div>
                {sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSections(sections.filter((_, i) => i !== secIdx))}
                    className="text-red-500 hover:text-red-700 p-2 cursor-pointer"
                    title="Remover esta página/secção"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {/* Descrição Texto */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Relatório Descritivo da Realidade do Setor:
                </label>
                <textarea
                  value={sec.content}
                  onChange={(e) => {
                    const updated = [...sections];
                    updated[secIdx].content = e.target.value;
                    setSections(updated);
                  }}
                  rows={4}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-xs leading-relaxed text-justify"
                  placeholder="Descreva as atividades e a situação operacional do setor..."
                />
              </div>

              {/* Formulário de Efetivo Setorial */}
              <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-2">
                  <Users size={16} className="text-blue-600" />
                  Efetivo Setorial (Quadro de Pessoal do Setor)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600">Pess. Técnico:</label>
                    <input
                      type="number"
                      value={sec.efetivoSetorial?.tecnicos || 0}
                      onChange={(e) => {
                        const updated = [...sections];
                        const ef = updated[secIdx].efetivoSetorial || { tecnicos: 0, administrativos: 0, auxiliares: 0, vagasAbertas: 0 };
                        ef.tecnicos = Number(e.target.value);
                        updated[secIdx].efetivoSetorial = ef;
                        setSections(updated);
                      }}
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600">Pess. Administrativo:</label>
                    <input
                      type="number"
                      value={sec.efetivoSetorial?.administrativos || 0}
                      onChange={(e) => {
                        const updated = [...sections];
                        const ef = updated[secIdx].efetivoSetorial || { tecnicos: 0, administrativos: 0, auxiliares: 0, vagasAbertas: 0 };
                        ef.administrativos = Number(e.target.value);
                        updated[secIdx].efetivoSetorial = ef;
                        setSections(updated);
                      }}
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600">Pess. Auxiliar:</label>
                    <input
                      type="number"
                      value={sec.efetivoSetorial?.auxiliares || 0}
                      onChange={(e) => {
                        const updated = [...sections];
                        const ef = updated[secIdx].efetivoSetorial || { tecnicos: 0, administrativos: 0, auxiliares: 0, vagasAbertas: 0 };
                        ef.auxiliares = Number(e.target.value);
                        updated[secIdx].efetivoSetorial = ef;
                        setSections(updated);
                      }}
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600">Vagas Abertas:</label>
                    <input
                      type="number"
                      value={sec.efetivoSetorial?.vagasAbertas || 0}
                      onChange={(e) => {
                        const updated = [...sections];
                        const ef = updated[secIdx].efetivoSetorial || { tecnicos: 0, administrativos: 0, auxiliares: 0, vagasAbertas: 0 };
                        ef.vagasAbertas = Number(e.target.value);
                        updated[secIdx].efetivoSetorial = ef;
                        setSections(updated);
                      }}
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg text-center font-bold text-red-600"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    value={sec.efetivoSetorial?.observacoes || ""}
                    onChange={(e) => {
                      const updated = [...sections];
                      const ef = updated[secIdx].efetivoSetorial || { tecnicos: 0, administrativos: 0, auxiliares: 0, vagasAbertas: 0 };
                      ef.observacoes = e.target.value;
                      updated[secIdx].efetivoSetorial = ef;
                      setSections(updated);
                    }}
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                    placeholder="Distribuição ou observações sobre o efetivo..."
                  />
                </div>
              </div>

              {/* Atividades Planificadas vs Realizadas (% de Execução e Não Execução) */}
              <div className="space-y-3 bg-gray-50 border border-gray-200 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                    <Activity size={16} className="text-emerald-600" />
                    Atividades Setoriais (% de Execução vs % de Não Execução)
                  </h4>
                  <button
                    type="button"
                    onClick={() => addActivityToSection(secIdx)}
                    className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg hover:bg-emerald-200 transition-all cursor-pointer"
                  >
                    + Adicionar Atividade
                  </button>
                </div>

                {(!sec.activities || sec.activities.length === 0) ? (
                  <p className="text-xs text-gray-400 italic text-center py-2">
                    Nenhuma atividade técnica inserida nesta página ainda.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sec.activities.map((act, actIdx) => (
                      <div
                        key={act.id || actIdx}
                        className="bg-white p-3 rounded-xl border border-gray-200 space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={act.nome}
                            onChange={(e) => updateActivity(secIdx, actIdx, "nome", e.target.value)}
                            className="font-bold text-gray-800 w-full outline-none border-b border-transparent hover:border-gray-200 focus:border-emerald-600"
                            placeholder="Nome da Atividade"
                          />
                          <button
                            type="button"
                            onClick={() => removeActivity(secIdx, actIdx)}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer shrink-0"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                            <input
                              type="checkbox"
                              checked={act.planificada}
                              onChange={(e) => updateActivity(secIdx, actIdx, "planificada", e.target.checked)}
                              className="accent-blue-600 rounded"
                            />
                            Planificada
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                            <input
                              type="checkbox"
                              checked={act.realizada}
                              onChange={(e) => updateActivity(secIdx, actIdx, "realizada", e.target.checked)}
                              className="accent-emerald-600 rounded"
                            />
                            Realizada
                          </label>

                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-emerald-700">% Execução:</span>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={act.taxaExecucao}
                              onChange={(e) => updateActivity(secIdx, actIdx, "taxaExecucao", Number(e.target.value))}
                              className="w-14 p-1 bg-emerald-50 border border-emerald-200 rounded font-black text-center text-emerald-800"
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-red-600">% Não Execução:</span>
                            <span className="w-14 p-1 bg-red-50 border border-red-200 rounded font-black text-center text-red-700 inline-block">
                              {act.taxaNaoExecucao}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-700">
                            <input
                              type="checkbox"
                              checked={act.isCampo || false}
                              onChange={(e) => updateActivity(secIdx, actIdx, "isCampo", e.target.checked)}
                              className="accent-amber-600 rounded"
                            />
                            Atividade de Campo / Terreno
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dificuldades, Desafios e Constrangimentos */}
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
                  <AlertTriangle size={15} className="text-amber-600" />
                  Dificuldades, Desafios e Constrangimentos do Setor (Operações/Campo)
                </label>
                <textarea
                  value={sec.dificuldadesConstrangimentos || ""}
                  onChange={(e) => {
                    const updated = [...sections];
                    updated[secIdx].dificuldadesConstrangimentos = e.target.value;
                    setSections(updated);
                  }}
                  rows={2}
                  className="w-full p-3 bg-white border border-amber-200 rounded-xl outline-none text-xs text-justify"
                  placeholder="Especifique as principais dificuldades, constrangimentos ou limitações enfrentadas pelo setor..."
                />
              </div>

              {/* 2 RETÂNGULOS PARA ANEXAR IMAGEM POR PÁGINA (Galeria Fotográfica) */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                    <Camera size={16} className="text-red-600" />
                    Anexo de Evidências Fotográficas (2 Retângulos de Imagem nesta Página)
                  </label>
                  <span className="text-[10px] text-gray-500 italic">Formatos suportados: PNG, JPG</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Retângulo 1 */}
                  <div className="border border-gray-200 bg-white p-4 rounded-2xl flex flex-col items-center justify-between gap-3 min-h-[180px]">
                    <span className="text-xs font-bold text-gray-700 self-start">
                      Retângulo 1: Imagem da Atividade
                    </span>

                    {sec.img1 ? (
                      <div className="w-full space-y-2 text-center">
                        <img
                          src={sec.img1}
                          alt="Evidência 1"
                          className="h-32 w-full object-cover rounded-xl border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(secIdx, 1)}
                          className="text-xs font-bold text-red-600 hover:underline cursor-pointer flex items-center gap-1 justify-center"
                        >
                          <Trash2 size={13} /> Remover Fotografia
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all text-center p-3">
                        <Upload size={24} className="text-gray-400 mb-1" />
                        <span className="text-xs font-bold text-gray-600">
                          Clique para anexar foto
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, secIdx, 1)}
                        />
                      </label>
                    )}

                    <input
                      type="text"
                      value={sec.legenda1 || ""}
                      onChange={(e) => {
                        const updated = [...sections];
                        updated[secIdx].legenda1 = e.target.value;
                        setSections(updated);
                      }}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                      placeholder="Legenda da Evidência 1..."
                    />
                  </div>

                  {/* Retângulo 2 */}
                  <div className="border border-gray-200 bg-white p-4 rounded-2xl flex flex-col items-center justify-between gap-3 min-h-[180px]">
                    <span className="text-xs font-bold text-gray-700 self-start">
                      Retângulo 2: Imagem da Atividade
                    </span>

                    {sec.img2 ? (
                      <div className="w-full space-y-2 text-center">
                        <img
                          src={sec.img2}
                          alt="Evidência 2"
                          className="h-32 w-full object-cover rounded-xl border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(secIdx, 2)}
                          className="text-xs font-bold text-red-600 hover:underline cursor-pointer flex items-center gap-1 justify-center"
                        >
                          <Trash2 size={13} /> Remover Fotografia
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all text-center p-3">
                        <Upload size={24} className="text-gray-400 mb-1" />
                        <span className="text-xs font-bold text-gray-600">
                          Clique para anexar foto
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, secIdx, 2)}
                        />
                      </label>
                    )}

                    <input
                      type="text"
                      value={sec.legenda2 || ""}
                      onChange={(e) => {
                        const updated = [...sections];
                        updated[secIdx].legenda2 = e.target.value;
                        setSections(updated);
                      }}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                      placeholder="Legenda da Evidência 2..."
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setSections([
                ...sections,
                {
                  title: `Página ${sections.length + 1}: Nova Atividade Setorial`,
                  content: "Descreva a atividade...",
                  setorOuUnidade: setor || "Setor Operacional",
                  efetivoSetorial: { tecnicos: 0, administrativos: 0, auxiliares: 0, vagasAbertas: 0 },
                  activities: [],
                  dificuldadesConstrangimentos: "",
                  img1: "",
                  legenda1: "",
                  img2: "",
                  legenda2: "",
                },
              ])
            }
            className="w-full py-5 border-2 border-dashed border-red-300 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            <Plus size={18} /> Adicionar Nova Página/Secção de Atividade ao Relatório
          </button>
        </div>
      </div>
    </motion.div>
  );
}
