import { printElementById } from "../../lib/printUtils";
import { getSystemLogo } from "../../lib/logoService";
import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FileText,
  Download,
  ArrowLeft,
  Printer,
  Stamp,
  Users,
  Activity,
  Camera,
  AlertTriangle,
  Building,
  Layers,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { openPrintDocumentWindow } from "../../lib/printUtils";
import { ReportStudioModal } from "../../components/ReportStudioModal";
import { InstitutionalHeader } from "../../components/InstitutionalHeader";

export interface TechnicalActivityItem {
  id: string;
  nome: string;
  planificada: boolean;
  meta?: string;
  realizada: boolean;
  taxaExecucao: number; // 0 a 100
  taxaNaoExecucao: number; // 0 a 100
  isCampo?: boolean;
  dificuldadesDesafios?: string;
}

export interface SectorStaffing {
  tecnicos: number;
  administrativos: number;
  auxiliares: number;
  vagasAbertas: number;
  observacoes?: string;
}

export interface ReportSection {
  title: string;
  content: React.ReactNode;
  setorOuUnidade?: string;
  level?: "setor" | "reparticao" | "departamento" | "direcao" | "institucional";
  efetivoSetorial?: SectorStaffing;
  activities?: TechnicalActivityItem[];
  dificuldadesConstrangimentos?: string;
  img1?: string;
  legenda1?: string;
  img2?: string;
  legenda2?: string;
}

interface StandardReportModelProps {
  direction: string;
  department?: string;
  section?: string;
  setor?: string;
  year: number;
  semester?: number;
  title: string;
  location?: string;
  date?: string;
  coverImage?: string;
  level?: "setor" | "reparticao" | "departamento" | "direcao" | "institucional";
  technicalSheet?: {
    name: string;
    role: string;
  }[];
  abbreviations?: {
    sigla: string;
    significado: string;
  }[];
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
  sections: ReportSection[];
  onBack: () => void;
  user?: any;
}

export default function StandardReportModel({
  direction,
  department,
  section,
  setor,
  year,
  semester,
  title,
  location = "Songo",
  date = new Date().toLocaleDateString("pt-PT", {
    month: "long",
    year: "numeric",
  }),
  coverImage: initialCoverImage,
  level,
  technicalSheet = [],
  abbreviations = [],
  stats,
  sections,
  onBack,
  user,
}: StandardReportModelProps) {
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [currentCoverImage, setCurrentCoverImage] = useState<string>(initialCoverImage || "");

  const getCoverTitle = () => {
    if (level === "institucional") {
      return "RELATÓRIO INSTITUCIONAL DE ACTIVIDADES DO ISPS";
    }

    if (level === "direcao" || (direction && !department && !setor)) {
      const dirName = direction || user?.direcao || "DIREÇÃO GERAL";
      const cleanName = dirName.toUpperCase().startsWith("DIREÇÃO") || dirName.toUpperCase().startsWith("DIRECCAO")
        ? dirName.toUpperCase()
        : `DIREÇÃO DE ${dirName.toUpperCase()}`;
      return `RELATÓRIO DE ACTIVIDADES DA ${cleanName}`;
    }

    if (level === "departamento" || (department && !setor)) {
      const depName = department || user?.departamento || "DEPARTAMENTO";
      const cleanName = depName.toUpperCase().startsWith("DEPARTAMENTO")
        ? depName.toUpperCase()
        : `DEPARTAMENTO DE ${depName.toUpperCase()}`;
      return `RELATÓRIO DE ACTIVIDADES DO ${cleanName}`;
    }

    if (level === "reparticao" || (section && !setor)) {
      const repName = section || user?.reparticao || "REPARTIÇÃO";
      const cleanName = repName.toUpperCase().startsWith("REPARTIÇÃO") || repName.toUpperCase().startsWith("REPARTICAO")
        ? repName.toUpperCase()
        : `REPARTIÇÃO DE ${repName.toUpperCase()}`;
      return `RELATÓRIO DE ACTIVIDADES DA ${cleanName}`;
    }

    // Setor Level (Padrão ou Nível Base)
    const setorName = setor || user?.setor || user?.sector || "(NOME DO SETOR)";
    let formattedSetor = setorName.toUpperCase();
    if (!formattedSetor.startsWith("SETOR") && !formattedSetor.startsWith("(")) {
      formattedSetor = `SETOR DE ${formattedSetor}`;
    }
    if (formattedSetor.startsWith("(")) {
      return `RELATÓRIO DE ACTIVIDADES DO ${formattedSetor}`;
    }
    return `RELATÓRIO DE ACTIVIDADES DO (${formattedSetor})`;
  };

  const handlePrint = () => {
    const reportElement = document.getElementById("standard-report-content");
    if (reportElement) {
      openPrintDocumentWindow({
        title: title || "Relatório Técnico de Actividades - SIGEP Songo",
        orgao: user?.unidadeOrganica || user?.unidade || "UNIDADE ORGÂNICA",
        direcao: direction || user?.direcao || "DICOSAFA",
        departamento: department || user?.departamento || "",
        reparticao: section || user?.reparticao || "",
        setor: setor || user?.setor || user?.sector || "",
        contentHtml: reportElement.innerHTML,
        orientation: "auto",
        pageSize: "auto",
      });
    } else {
      printElementById("print-area");
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 p-4 md:p-12 print:p-0 print:bg-white font-serif">
      {/* Toolbar - Hidden on print */}
      <div className="max-w-[21cm] mx-auto mb-8 flex items-center justify-between print:hidden">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 bg-white text-blue-900 px-4 py-2 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm border border-gray-200 cursor-pointer text-xs"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setIsStudioOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-5 py-2.5 rounded-xl font-black text-xs shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Stamp size={16} /> ESTÚDIO PROFISSIONAL (INTERATIVO)
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-black text-xs transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Printer size={16} /> IMPRIMIR / GERAR PDF (A4)
          </button>
        </div>
      </div>

      {/* Modal do Estúdio de Relatórios Interativo */}
      <ReportStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        title={title || "Relatório Institucional ISPSongo"}
        subtitle={`Direção: ${direction} • Ano: ${year}`}
        documentNumber={`REL-${direction.substring(0, 4)}-${year}`}
        user={user}
        department={user?.unidadeOrganica || "INSTITUTO SUPERIOR POLITÉCNICO DE SONGO"}
        contentHtml={document.getElementById("standard-report-content")?.innerHTML || ""}
      />

      {/* Report Pages Container */}
      <div id="standard-report-content" className="flex flex-col gap-12 print:gap-0 items-center pb-20">
        {/* Page 1: Cover (Capa do Relatório rigorosamente conforme modelo de referência) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-[21cm] h-[29.7cm] bg-white shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] print:shadow-none flex flex-col items-center justify-between p-[1.8cm] sm:p-[2.2cm] relative overflow-hidden page-break-after-always text-slate-900 font-serif"
        >
          {/* Top Header & Title */}
          <div className="w-full text-center space-y-2 pt-2">
            <img
              src={getSystemLogo() || "/sigep-logo.svg"}
              alt="Logo Institucional"
              className="h-20 sm:h-24 object-contain mx-auto mb-3 filter drop-shadow-sm"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-lg sm:text-xl font-bold text-[#1b365d] tracking-wide uppercase font-serif text-center">
              INSTITUTO SUPERIOR POLITÉCNICO DE SONGO
            </h1>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight font-serif text-center mt-2 px-4">
              {getCoverTitle()}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-widest font-serif text-center mt-1">
              {semester ? `${semester}.º SEMESTRE DE ${year}` : `ANUAL DE ${year}`}
            </p>
          </div>

          {/* Moldura da Imagem de Capa (Border 2px Black + Placeholder / Image) */}
          <div className="w-full flex-1 my-4 border-[2px] border-black flex flex-col items-center justify-center relative bg-white p-2 min-h-[13cm] max-h-[16.5cm] overflow-hidden">
            {currentCoverImage ? (
              <img
                src={currentCoverImage}
                alt="Imagem de Capa do Relatório"
                className="w-full h-full object-contain max-h-[16cm]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full py-20">
                <p className="text-slate-900 italic font-serif text-lg tracking-wider uppercase select-none font-medium">
                  CARREGAR A IMAGEM
                </p>
              </div>
            )}

            {/* Controlo Interativo de Upload de Imagem na Capa */}
            <label className="no-print absolute bottom-4 right-4 bg-slate-900/95 hover:bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 cursor-pointer shadow-xl flex items-center gap-2 transition-all">
              <Camera size={15} className="text-amber-400" />
              {currentCoverImage ? "Alterar Imagem da Capa" : "Carregar Imagem"}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setCurrentCoverImage(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Footer oficial conforme modelo */}
          <div className="w-full text-center space-y-2 pb-1 pt-2">
            <p className="text-[11px] sm:text-xs italic text-slate-800 font-serif leading-relaxed max-w-2xl mx-auto">
              Documento de síntese elaborado a partir dos relatórios semestrais das unidades orgânicas e Direcções Centrais do ISPS
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-900 font-serif pt-0.5">
              Songo, ({location || "Songo"}, {date})
            </p>
          </div>
        </motion.div>

        {/* Page 2: Ficha Técnica & Abreviaturas */}
        <div className="w-[21cm] h-[29.7cm] bg-white shadow-2xl print:shadow-none p-[2.5cm] space-y-10 relative overflow-hidden page-break-after-always text-left">
          <h2 className="text-3xl font-black border-b-4 border-blue-900 pb-3 text-slate-900 tracking-tighter">
            Ficha Técnica Institucional
          </h2>

          <table className="w-full text-xs leading-relaxed border-collapse">
            <tbody>
              <tr>
                <td className="font-bold py-4 pr-6 border-b border-slate-100 w-1/3 align-top text-slate-400 uppercase tracking-widest">
                  Título do Relatório:
                </td>
                <td className="py-4 border-b border-slate-100 font-bold text-slate-900">
                  {title} ({year})
                </td>
              </tr>
              <tr>
                <td className="font-bold py-4 pr-6 border-b border-slate-100 w-1/3 align-top text-slate-400 uppercase tracking-widest">
                  Estrutura Organizacional:
                </td>
                <td className="py-4 border-b border-slate-100">
                  <div className="space-y-1 text-slate-800 font-sans">
                    <p className="font-bold text-sm text-blue-950">
                      Instituto Superior Politécnico de Songo
                    </p>
                    <p><strong>Direção:</strong> {direction || "Geral"}</p>
                    {department && <p><strong>Departamento:</strong> {department}</p>}
                    {section && <p><strong>Repartição:</strong> {section}</p>}
                    {setor && <p><strong>Setor:</strong> {setor}</p>}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="font-bold py-4 pr-6 border-b border-slate-100 w-1/3 align-top text-slate-400 uppercase tracking-widest">
                  Data de Emissão:
                </td>
                <td className="py-4 border-b border-slate-100 capitalize text-slate-800">
                  {date}
                </td>
              </tr>
              {technicalSheet.length > 0 && (
                <tr>
                  <td className="font-bold py-4 pr-6 border-b border-slate-100 w-1/3 align-top text-slate-400 uppercase tracking-widest">
                    Equipa Técnica Elaboradora:
                  </td>
                  <td className="py-4 border-b border-slate-100">
                    <div className="space-y-2">
                      {technicalSheet.map((m, idx) => (
                        <div key={idx} className="flex justify-between border-b border-slate-50 pb-1">
                          <span className="font-bold text-slate-800">{m.name}</span>
                          <span className="text-slate-500 italic">{m.role}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {abbreviations.length > 0 && (
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-lg font-black mb-4 text-slate-900 uppercase tracking-wide">
                Lista de Siglas e Abreviaturas
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                {abbreviations.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="font-bold text-red-600">{item.sigla}:</span>
                    <span className="text-slate-700">{item.significado}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content Sections (Cada página representa um setor/capítulo técnico com 2 retângulos para fotos) */}
        {sections.map((sec, idx) => (
          <div
            key={idx}
            className="w-[21cm] min-h-[29.7cm] bg-white shadow-2xl print:shadow-none p-[2.5cm] space-y-6 relative overflow-hidden page-break-after-always text-left"
          >
            {/* Header da Secção */}
            <div className="border-b-4 border-slate-900 pb-3 flex items-center justify-between">
              <h3 className="text-xl font-black flex items-center gap-3 tracking-tight text-slate-900">
                <span className="bg-slate-900 text-white w-8 h-8 flex items-center justify-center text-sm font-black rounded-lg">
                  {idx + 1}
                </span>
                {sec.title}
              </h3>
              {sec.setorOuUnidade && (
                <span className="text-[10px] font-black text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase tracking-wider">
                  {sec.setorOuUnidade}
                </span>
              )}
            </div>

            {/* Texto Descritivo */}
            <div className="text-justify leading-relaxed text-xs text-slate-800 font-sans whitespace-pre-wrap">
              {sec.content}
            </div>

            {/* Quadro de Efetivo Setorial */}
            {sec.efetivoSetorial && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <h4 className="text-[11px] font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                  <Users size={15} className="text-blue-600" />
                  Quadro de Efetivo Setorial (Recursos Humanos)
                </h4>
                <div className="grid grid-cols-4 gap-3 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="block text-[9px] text-slate-400 font-bold uppercase">Técnicos</span>
                    <span className="text-base font-black text-slate-800">{sec.efetivoSetorial.tecnicos}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="block text-[9px] text-slate-400 font-bold uppercase">Administrativos</span>
                    <span className="text-base font-black text-slate-800">{sec.efetivoSetorial.administrativos}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="block text-[9px] text-slate-400 font-bold uppercase">Auxiliares</span>
                    <span className="text-base font-black text-slate-800">{sec.efetivoSetorial.auxiliares}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="block text-[9px] text-slate-400 font-bold uppercase">Vagas Abertas</span>
                    <span className="text-base font-black text-red-600">{sec.efetivoSetorial.vagasAbertas}</span>
                  </div>
                </div>
                {sec.efetivoSetorial.observacoes && (
                  <p className="text-[11px] text-slate-600 italic mt-1">
                    <strong>Distribuição:</strong> {sec.efetivoSetorial.observacoes}
                  </p>
                )}
              </div>
            )}

            {/* Tabela de Atividades Planificadas vs Realizadas com % Execução e % Não Execução */}
            {sec.activities && sec.activities.length > 0 && (
              <div className="space-y-2 pt-1">
                <h4 className="text-[11px] font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                  <Activity size={15} className="text-emerald-600" />
                  Métricas de Atividades Setoriais (Planificadas vs Realizadas)
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 font-bold text-slate-700 uppercase text-[9px]">
                      <tr>
                        <th className="p-2.5">Atividade / Ação</th>
                        <th className="p-2.5 text-center">Planificada</th>
                        <th className="p-2.5 text-center">Realizada</th>
                        <th className="p-2.5 text-center">% Execução</th>
                        <th className="p-2.5 text-center">% Não Execução</th>
                        <th className="p-2.5 text-center">Campo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sec.activities.map((act) => (
                        <tr key={act.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-semibold text-slate-800">{act.nome}</td>
                          <td className="p-2.5 text-center">
                            {act.planificada ? (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[9px] font-bold">Sim</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px]">Não</span>
                            )}
                          </td>
                          <td className="p-2.5 text-center">
                            {act.realizada ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">Sim</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-[9px] font-bold">Não</span>
                            )}
                          </td>
                          <td className="p-2.5 text-center font-bold text-emerald-700">
                            {act.taxaExecucao}%
                          </td>
                          <td className="p-2.5 text-center font-bold text-red-600">
                            {act.taxaNaoExecucao}%
                          </td>
                          <td className="p-2.5 text-center">
                            {act.isCampo ? (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-bold">Sim</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px]">Não</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Dificuldades, Desafios e Constrangimentos */}
            {sec.dificuldadesConstrangimentos && (
              <div className="bg-amber-50/80 border-l-4 border-amber-500 p-3.5 rounded-r-xl space-y-1">
                <h5 className="text-[10px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-amber-600" />
                  Dificuldades, Desafios e Constrangimentos do Setor
                </h5>
                <p className="text-[11px] text-amber-800 text-justify leading-relaxed">
                  {sec.dificuldadesConstrangimentos}
                </p>
              </div>
            )}

            {/* 2 RETÂNGULOS DE IMAGEM POR PÁGINA (Galeria de Evidências Fotográficas da Atividade) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Camera size={13} className="text-red-600" />
                Evidências Fotográficas da Atividade (2 Retângulos de Imagem por Página)
              </h5>
              <div className="grid grid-cols-2 gap-4">
                {/* Retângulo 1 */}
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 bg-slate-50/80 flex flex-col items-center justify-center min-h-[145px] text-center relative overflow-hidden">
                  {sec.img1 ? (
                    <div className="w-full h-full flex flex-col items-center">
                      <img
                        src={sec.img1}
                        alt="Evidência Fotográfica 1"
                        className="max-h-[125px] w-full object-cover rounded-lg border border-slate-200 shadow-sm"
                      />
                      <span className="text-[9px] font-bold text-slate-600 mt-1.5 bg-white px-2 py-0.5 rounded border border-slate-200 w-full truncate">
                        {sec.legenda1 || "Evidência Fotográfica 1"}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1 text-slate-400 p-2">
                      <Camera size={28} className="mx-auto text-slate-300" />
                      <p className="text-[10px] font-bold text-slate-500">
                        Retângulo 1: Imagem da Atividade
                      </p>
                      <p className="text-[9px] text-slate-400 italic">
                        {sec.legenda1 || "Evidência fotográfica da operação ou ação de campo"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Retângulo 2 */}
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 bg-slate-50/80 flex flex-col items-center justify-center min-h-[145px] text-center relative overflow-hidden">
                  {sec.img2 ? (
                    <div className="w-full h-full flex flex-col items-center">
                      <img
                        src={sec.img2}
                        alt="Evidência Fotográfica 2"
                        className="max-h-[125px] w-full object-cover rounded-lg border border-slate-200 shadow-sm"
                      />
                      <span className="text-[9px] font-bold text-slate-600 mt-1.5 bg-white px-2 py-0.5 rounded border border-slate-200 w-full truncate">
                        {sec.legenda2 || "Evidência Fotográfica 2"}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1 text-slate-400 p-2">
                      <Camera size={28} className="mx-auto text-slate-300" />
                      <p className="text-[10px] font-bold text-slate-500">
                        Retângulo 2: Imagem da Atividade
                      </p>
                      <p className="text-[9px] text-slate-400 italic">
                        {sec.legenda2 || "Evidência fotográfica da operação ou ação de campo"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Page Footer */}
            <div className="absolute bottom-5 left-[2.5cm] right-[2.5cm] flex justify-between items-center text-[9px] text-slate-400 font-sans tracking-widest border-t border-slate-100 pt-2">
              <span>SIGEP • RELATÓRIO TÉCNICO INSTITUCIONAL {year}</span>
              <span className="font-bold">
                Página {idx + 3 + (stats ? 1 : 0)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
