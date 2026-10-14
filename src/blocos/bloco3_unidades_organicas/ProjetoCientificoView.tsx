import React, { useState, useMemo } from "react";
import { 
  ArrowLeft, 
  BookOpen, 
  Printer, 
  Download, 
  FileText, 
  Layers, 
  CheckCircle,
  Eye,
  Sparkles
} from "lucide-react";
import { getProjetoCientificoSections } from "../../data/projetoCientificoData";
import { SigepLogo } from "../../components/SigepLogo";
// @ts-ignore
import html2pdf from "html2pdf.js";
import { ProcessingCircle } from "../../components/ui/ProcessingCircle";

interface ProjetoCientificoViewProps {
  onBack: () => void;
}

const CapaContent = () => (
  <div className="flex flex-col items-center justify-between min-h-[750px] text-center font-serif p-12 border-2 border-slate-300 bg-white rounded-xl shadow-sm text-slate-900">
    <div className="space-y-4">
      <SigepLogo size="lg" className="mx-auto" />
    </div>

    <div className="my-16 space-y-4">
      <div className="inline-block px-4 py-1 bg-blue-100 text-blue-900 rounded-full font-black text-xs tracking-widest uppercase mb-2">
        Documentação Teórica Oficial
      </div>
      <h2 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-blue-950 font-serif">SIGEP</h2>
      <p className="text-xl md:text-2xl italic text-slate-700 font-serif">Sistema Integrado de Gestão de Processos</p>
      <div className="w-32 h-1 bg-blue-900 mx-auto mt-6 rounded-full"></div>
    </div>

    <div className="mt-auto w-full text-center space-y-2 border-t border-slate-200 pt-8">
      <p className="text-lg font-bold text-slate-900">Autor: <span className="font-serif">Franzissi Tripalonga Vicente (Slaiter Tripas)</span></p>
      <p className="text-sm text-slate-600">Curso: Engenharia Informática / Informática Aplicada</p>
      <p className="text-base font-black text-slate-800 mt-6 font-serif">Songo, Moçambique — 2026</p>
    </div>
  </div>
);

const FolhaRostoContent = () => (
  <div className="flex flex-col items-center justify-between min-h-[750px] text-center font-serif p-12 border-2 border-slate-300 bg-white rounded-xl shadow-sm text-slate-900">
    <div className="space-y-2">
      <SigepLogo size="md" className="mx-auto mb-2" />
      <p className="text-lg font-bold text-slate-900">Franzissi Tripalonga Vicente (Slaiter Tripas)</p>
      <p className="text-xs text-slate-500 uppercase tracking-widest">Autor e Arquiteto de Software</p>
    </div>

    <div className="my-8 space-y-3">
      <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-blue-950">SIGEP</h2>
      <p className="text-lg italic text-slate-700">Sistema Integrado de Gestão de Processos</p>
      <p className="text-sm font-bold text-slate-600">Projeto Científico & Memória Descritiva Oficial</p>
    </div>

    <div className="my-6 text-base max-w-xl text-left border-l-4 border-blue-900 pl-6 py-2 bg-slate-50/80 rounded-r-lg">
      <p className="text-slate-700 leading-relaxed">
        Projeto científico e fundamentação teórica do Sistema Integrado de Gestão de Processos (SIGEP), apresentado ao Instituto Superior Politécnico de Songo, como requisito de validação da arquitetura tecnológica, gestão documental e conformidade com a Lei n.º 8/2024 de Moçambique.
      </p>
      <p className="mt-6 font-bold text-slate-900">Orientador: PhD. Félix Banze</p>
    </div>

    <div className="mt-auto w-full text-center border-t border-slate-200 pt-6">
      <p className="text-base font-bold text-slate-900">Songo, Moçambique — 2026</p>
    </div>
  </div>
);

export default function ProjetoCientificoView({ onBack }: ProjetoCientificoViewProps) {
  const sections = useMemo(() => getProjetoCientificoSections(), []);
  const [activeSectionId, setActiveSectionId] = useState(sections[0].id);
  const [viewMode, setViewMode] = useState<"capitulo" | "completo">("completo");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const activeSection = sections.find(s => s.id === activeSectionId) || sections[0];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setDownloadSuccess(null);

    const printArea = document.getElementById("projeto-cientifico-print-area");
    if (!printArea) {
      window.print();
      setIsGeneratingPdf(false);
      return;
    }

    try {
      const opt: any = {
        margin: [10, 10, 10, 10],
        filename: "SIGEP_Projeto_Cientifico_Parte_Teorica.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };

      await html2pdf().set(opt).from(printArea).save();
      setDownloadSuccess("PDF gerado e descarregado com sucesso!");
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.warn("Falha no html2pdf, redirecionando para a janela de impressão/PDF:", err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadDoc = () => {
    try {
      let docBody = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>SIGEP - Projeto Científico e Parte Teórica</title>
          <style>
            body { font-family: 'Times New Roman', serif; margin: 2cm; color: #000; line-height: 1.6; }
            h1 { font-size: 22pt; text-align: center; text-transform: uppercase; margin-bottom: 24pt; color: #0c2340; }
            h2 { font-size: 16pt; margin-top: 18pt; margin-bottom: 12pt; color: #0c2340; border-bottom: 1pt solid #0c2340; padding-bottom: 4pt; }
            p { font-size: 12pt; text-align: justify; margin-bottom: 12pt; }
            ul { margin-bottom: 12pt; }
            li { font-size: 12pt; margin-bottom: 4pt; }
            .capa { text-align: center; margin-bottom: 50pt; }
            .footer { margin-top: 40pt; font-size: 10pt; text-align: center; color: #666; border-top: 1pt solid #ccc; padding-top: 10pt; }
          </style>
        </head>
        <body>
          <div className="capa">
            <h1>INSTITUTO SUPERIOR POLITÉCNICO DE SONGO</h1>
            <h2>SIGEP - SISTEMA INTEGRADO DE GESTÃO DE PROCESSOS</h2>
            <p><strong>PROJETO CIENTÍFICO E PARTE TEÓRICA OFICIAL</strong></p>
            <p>Autor: Franzissi Tripalonga Vicente (Slaiter Tripas)</p>
            <p>Songo, Moçambique — 2026</p>
          </div>
          <hr />
      `;

      sections.forEach((sec, idx) => {
        docBody += `
          <h2>${idx + 1}. ${sec.title}</h2>
          <div>
            <p>${String(sec.content || "").replace(/\n/g, "</p><p>")}</p>
          </div>
          <br />
        `;
      });

      docBody += `
          <div class="footer">
            SIGEP-ISPS © 2026 — Documento Teórico Oficial do Sistema Integrado de Gestão de Processos
          </div>
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff' + docBody], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "SIGEP_Projeto_Cientifico_Parte_Teorica.doc";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess("Documento (.doc) descarregado com sucesso!");
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error("Erro ao gerar documento .doc:", err);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 overflow-hidden font-sans">
      {/* Dynamic CSS for Clean Printable Document */}
      <style>{`
        @media print {
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
            font-family: 'Times New Roman', Times, serif !important;
          }
          header, nav, .print-hidden, button {
            display: none !important;
          }
          .print-container {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print-page {
            page-break-after: always !important;
            break-after: page !important;
            padding: 20mm 15mm !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            min-height: 0 !important;
          }
        }
      `}</style>

      {/* Header Fixo e Barra de Ações Superior */}
      <header className="bg-slate-900 text-white p-4 md:px-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 shadow-xl z-20 print:hidden flex-none">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl transition shadow-sm cursor-pointer"
            title="Voltar ao Sistema"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black tracking-widest rounded uppercase">
                Parte Teórica
              </span>
              <span className="text-xs text-slate-400 font-bold">• 16 Capítulos</span>
            </div>
            <h2 className="text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
              Projeto Científico & Fundamentação Teórica SIGEP
            </h2>
          </div>
        </div>

        {/* Controlo de Modo e Botões Principais de Impressão e Download */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle de Leitura */}
          <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700">
            <button
              onClick={() => setViewMode("completo")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === "completo"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Layers size={14} />
              <span>Documento Completo</span>
            </button>
            <button
              onClick={() => setViewMode("capitulo")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === "capitulo"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Eye size={14} />
              <span>Por Capítulo</span>
            </button>
          </div>

          {/* BOTÃO IMPRIMIR */}
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-lg active:scale-95 cursor-pointer"
            title="Imprimir todos os documentos da Parte Teórica"
          >
            <Printer size={16} />
            <span>Imprimir Parte Teórica</span>
          </button>

          {/* BOTÃO DESCARREGAR PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Descarregar todos os documentos em PDF"
          >
            {isGeneratingPdf ? (
              <>
                <ProcessingCircle size={16} />
                <span>A Gerar PDF...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Descarregar PDF</span>
              </>
            )}
          </button>

          {/* BOTÃO DESCARREGAR DOC */}
          <button
            onClick={handleDownloadDoc}
            className="px-3 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
            title="Descarregar documento em formato Word (.doc)"
          >
            <FileText size={16} />
            <span className="hidden sm:inline">Descarregar .DOC</span>
          </button>
        </div>
      </header>

      {/* Alerta de Sucesso */}
      {downloadSuccess && (
        <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2 duration-200 print:hidden">
          <span className="flex items-center gap-2">
            <CheckCircle size={16} /> {downloadSuccess}
          </span>
          <button onClick={() => setDownloadSuccess(null)} className="text-emerald-100 hover:text-white font-black">✕</button>
        </div>
      )}

      {/* Corpo Principal da Aplicação */}
      <div className="flex-1 flex overflow-hidden print:block print:overflow-visible">
        {/* Navegação Lateral de Capítulos (Apenas visível na UI) */}
        <aside className="w-72 bg-white border-r border-slate-200 p-4 space-y-1 overflow-y-auto hidden md:block print:hidden shrink-0 shadow-sm">
          <div className="p-2 mb-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase flex items-center gap-1.5">
              <BookOpen size={14} className="text-blue-600" />
              Índice da Parte Teórica
            </span>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
              {sections.length}
            </span>
          </div>

          <div className="space-y-1">
            {sections.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSectionId(section.id);
                  if (viewMode === "completo") {
                    const el = document.getElementById(`section-${section.id}`);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  activeSectionId === section.id
                    ? "bg-blue-900 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="truncate pr-2">{section.title}</span>
                <span className="text-[9px] opacity-70 font-mono">Pág. {idx + 1}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-slate-900 text-white rounded-2xl text-[11px] space-y-2">
            <p className="font-bold flex items-center gap-1 text-blue-400">
              <Sparkles size={14} /> Dica de Impressão
            </p>
            <p className="text-slate-300 leading-relaxed text-[10px]">
              O botão <strong className="text-white">"Imprimir Parte Teórica"</strong> compila automaticamente todos os 16 capítulos com formatação académica em papel A4 e quebras de página oficiais.
            </p>
          </div>
        </aside>

        {/* Área de Leitura e Conteúdo Printable */}
        <main className="flex-1 overflow-y-auto bg-slate-200/80 p-4 md:p-8 print:p-0 print:bg-white print:overflow-visible">
          {/* Printable Element Target */}
          <div 
            id="projeto-cientifico-print-area" 
            className="max-w-[210mm] mx-auto space-y-8 print:space-y-0 print:block print-container"
          >
            {viewMode === "completo" ? (
              /* Modo Documento Completo: Exibe todas as seções sequencialmente */
              sections.map((section, index) => (
                <div
                  key={section.id}
                  id={`section-${section.id}`}
                  className="bg-white shadow-xl rounded-xl border border-slate-200 p-8 md:p-16 min-h-[297mm] flex flex-col justify-between relative print:shadow-none print:border-none print:rounded-none print:m-0 print:p-0 print:min-h-0 print-page"
                >
                  <div className="flex-1 space-y-6 font-serif">
                    {section.id === "capa" ? (
                      <CapaContent />
                    ) : section.id === "folha-rosto" ? (
                      <FolhaRostoContent />
                    ) : (
                      <>
                        <div className="border-b-4 border-double border-blue-900 pb-4 mb-8 bg-gradient-to-r from-blue-50/80 via-white to-transparent p-4 rounded-lg shadow-sm border border-blue-100">
                          <span className="text-xs font-black tracking-widest text-blue-800 uppercase font-serif">
                            SIGEP — Documentação Científica & Memória Descritiva
                          </span>
                          <h3 className="text-2xl md:text-3xl font-black text-blue-950 mt-2 flex items-center gap-3 font-serif">
                            <BookOpen size={28} className="text-blue-900 print:hidden" />
                            {section.title}
                          </h3>
                          <p className="text-xs italic text-slate-600 mt-1 font-serif">Fundamentação Teórica, Arquitetura e Processos Oficiais do SIGEP</p>
                        </div>

                        {section.id === "indice" ? (
                          <div className="space-y-4 font-sans my-8">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                              Estrutura dos Capítulos e Paginação (Início no Resumo)
                            </p>
                            <ul className="divide-y divide-slate-100">
                              {sections.map((s, i) => {
                                const resumoIdx = sections.findIndex(sec => sec.id === "resumo");
                                const pageLabel = i < resumoIdx ? "—" : `Pág. ${i - resumoIdx + 1}`;
                                return (
                                  <li key={s.id} className="py-3 flex justify-between items-center text-slate-800 text-sm font-medium hover:bg-slate-50 px-2 rounded">
                                    <span className="font-bold text-blue-950">{s.title}</span>
                                    <span className="font-mono text-slate-400 text-xs">{pageLabel}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ) : (
                          <div className="text-slate-800 leading-relaxed text-base md:text-lg font-serif text-justify whitespace-pre-line space-y-4">
                            {section.content}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Rodapé Oficial da Página */}
                  <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] font-bold text-slate-400 tracking-widest font-sans">
                    <span>SIGEP — PARTE TEÓRICA & PROJETO CIENTÍFICO</span>
                    <span>
                      {(() => {
                        const resumoIdx = sections.findIndex(sec => sec.id === "resumo");
                        return index < resumoIdx ? "Pré-texto" : `Pág. ${index - resumoIdx + 1}`;
                      })()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              /* Modo Capítulo Único */
              <div className="bg-white shadow-xl rounded-xl border border-slate-200 p-8 md:p-16 min-h-[297mm] flex flex-col justify-between font-serif">
                <div className="flex-1 space-y-6">
                  {activeSectionId === "capa" ? (
                    <CapaContent />
                  ) : activeSectionId === "folha-rosto" ? (
                    <FolhaRostoContent />
                  ) : (
                    <>
                      <div className="border-b-4 border-double border-blue-900 pb-4 mb-8 bg-gradient-to-r from-blue-50/80 via-white to-transparent p-4 rounded-lg shadow-sm border border-blue-100">
                        <span className="text-xs font-black tracking-widest text-blue-800 uppercase font-serif">
                          SIGEP — Capítulo Selecionado & Memória Descritiva
                        </span>
                        <h3 className="text-2xl md:text-3xl font-black text-blue-950 mt-2 flex items-center gap-3 font-serif">
                          <BookOpen size={28} className="text-blue-900" />
                          {activeSection.title}
                        </h3>
                        <p className="text-xs italic text-slate-600 mt-1 font-serif">Visualização Direta de Capítulo Oficial do SIGEP</p>
                      </div>

                      {activeSectionId === "indice" ? (
                        <div className="space-y-4 font-sans my-8">
                          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                            Estrutura dos Capítulos e Paginação (Início no Resumo)
                          </p>
                          <ul className="divide-y divide-slate-100">
                            {sections.map((s, i) => {
                              const resumoIdx = sections.findIndex(sec => sec.id === "resumo");
                              const pageLabel = i < resumoIdx ? "—" : `Pág. ${i - resumoIdx + 1}`;
                              return (
                                <li key={s.id} className="py-3 flex justify-between items-center text-slate-800 text-sm font-medium hover:bg-slate-50 px-2 rounded cursor-pointer" onClick={() => setActiveSectionId(s.id)}>
                                  <span className="font-bold text-blue-950">{s.title}</span>
                                  <span className="font-mono text-slate-400 text-xs">{pageLabel}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ) : (
                        <div className="text-slate-800 leading-relaxed text-base md:text-lg font-serif text-justify whitespace-pre-line space-y-4">
                          {activeSection.content}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] font-bold text-slate-400 tracking-widest font-sans">
                  <span>SIGEP — PARTE TEÓRICA</span>
                  <span>
                    {(() => {
                      const activeIdx = sections.findIndex(s => s.id === activeSectionId);
                      const resumoIdx = sections.findIndex(sec => sec.id === "resumo");
                      return activeIdx < resumoIdx ? "Pré-texto (Sem Numeração)" : `Pág. ${activeIdx - resumoIdx + 1}`;
                    })()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer Fixo */}
      <footer className="p-3 bg-white border-t border-slate-200 text-center text-[11px] font-bold text-slate-500 print:hidden">
        Documentação Oficial do Sistema Integrado de Gestão de Processos (SIGEP-ISPS) © 2026 — Songo, Moçambique
      </footer>
    </div>
  );
}
