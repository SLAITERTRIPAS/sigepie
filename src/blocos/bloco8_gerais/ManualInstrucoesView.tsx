import React, { useState } from "react";
import { 
  BookOpen, ChevronRight, FileText, Settings, Users, 
  ShieldCheck, PieChart, X, Printer, FileDown, 
  ArrowLeft, Layout, List, Info, Target, Briefcase, 
  BarChart3, AlertTriangle, RefreshCw, Clock, DollarSign, 
  Paperclip, CheckCircle2, Award, Cpu, Sparkles,
  GraduationCap, Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getChapterContentTecnica, getChapterContentHumana } from "./manualContents";
import { printElementById } from "../../lib/printUtils";

const ManualInstrucoesView = ({ onBack }: { onBack: () => void }) => {
  const [activeChapter, setActiveChapter] = useState(1);
  const [readingMode, setReadingMode] = useState<"tecnica" | "humana">("tecnica");

  const chapters = [
    { id: 1, title: "1. Resumo do SIGEP", icon: <Layout className="w-4 h-4" /> },
    { id: 2, title: "2. Índice Geral", icon: <List className="w-4 h-4" /> },
    { id: 3, title: "3. Template de Resumo", icon: <FileText className="w-4 h-4" /> },
    { id: 4, title: "4. Apresentação", icon: <Award className="w-4 h-4" /> },
    { id: 5, title: "5. Contexto", icon: <Info className="w-4 h-4" /> },
    { id: 6, title: "6. Público", icon: <Users className="w-4 h-4" /> },
    { id: 7, title: "7. Justificativa", icon: <Target className="w-4 h-4" /> },
    { id: 8, title: "8. Objetivos", icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 9, title: "9. Plano de trabalho", icon: <Briefcase className="w-4 h-4" /> },
    { id: 10, title: "10. Metodologia", icon: <Settings className="w-4 h-4" /> },
    { id: 11, title: "11. Indicadores", icon: <Clock className="w-4 h-4" /> },
    { id: 12, title: "12. Análise de riscos", icon: <Info className="w-4 h-4" /> },
    { id: 13, title: "13. Sustentabilidade do projeto", icon: <BarChart3 className="w-4 h-4" /> },
    { id: 14, title: "14. Cronograma", icon: <Clock className="w-4 h-4" /> },
    { id: 15, title: "15. Orçamento", icon: <DollarSign className="w-4 h-4" /> },
    { id: 16, title: "16. Anexos", icon: <Paperclip className="w-4 h-4" /> },
    { id: 17, title: "17. Check list", icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const chapterContentTecnica = getChapterContentTecnica(chapters, setActiveChapter);
  const chapterContentHumana = getChapterContentHumana(chapters, setActiveChapter);
  const chapterContent = readingMode === "humana" ? chapterContentHumana : chapterContentTecnica;

  const handlePrint = () => {
    const docTitle = readingMode === "humana"
      ? "SIGIP - Memoria Descritiva (Sistemas de Informacao & Governacao)"
      : "SIGIP - Memoria Descritiva Oficial (IA Quantica & Engenharia)";
    printElementById("manual-instrucoes-print-area", docTitle, "portrait", "A4");
  };

  return (
    <div id="manual-instrucoes-print-area" className="min-h-screen bg-[#F4F7F9] print:bg-white font-sans selection:bg-blue-100 pb-20 print:pb-0">
      <div className="w-full pl-[0.5px] pr-4 md:pr-8 print:w-full print:px-0 py-6 print:py-0">
        
        {/* Top Navigation */}
        <div className="mb-8 print:hidden">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all font-black uppercase tracking-widest shadow-sm text-[13px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </button>
        </div>

        {/* Header Banner */}
        <header className="bg-[#022c22] print:hidden rounded-xl p-4 md:p-8 mb-8 text-white relative overflow-hidden shadow-2xl border border-white/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <div className="h-16 w-px bg-white/10 hidden md:block" />
              <div>
                <h1 className="font-black tracking-tight mb-1 text-[13px]">SIGIP</h1>
                <p className="font-medium text-slate-300 opacity-90 tracking-wide text-[12px]">Sistema Integrada de Gestão de Processos</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 shrink-0">
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group text-[13px] cursor-pointer"
                title="Abrir o documento pronto para impressão oficial ou PDF"
              >
                <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Imprimir Documento
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[25%_1fr] print:block print:w-full gap-8 print:gap-0 items-start">
          
          {/* Índice à Esquerda (25%) */}
          <aside className="space-y-6 print:hidden sticky top-6">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 text-[12px]">
                  <List className="w-3.5 h-3.5" />
                  Capítulos do Documento
                </h3>
              </div>
              <nav className="p-2 flex flex-col divide-y divide-slate-100 max-h-[60vh] overflow-y-auto scrollbar-thin">
                {chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => {
                      setActiveChapter(chapter.id);
                      document.getElementById('chapter-' + chapter.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 transition-all group rounded-lg text-left ${
                      activeChapter === chapter.id 
                      ? "bg-[#0B1222] text-white shadow-md" 
                      : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`${activeChapter === chapter.id ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-600"} transition-colors shrink-0`}>
                        {chapter.icon}
                      </span>
                      <span className="text-[12px] font-bold tracking-tight line-clamp-1">{chapter.title}</span>
                    </div>
                    {activeChapter === chapter.id && (
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Ficha Técnica na Sidebar */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
              <div className="space-y-4 text-[11px]">
                <div>
                  <span className="text-slate-400 font-bold block mb-1 text-[10px] tracking-wider uppercase">TIPO DE PROJETO</span>
                  <span className="font-bold text-slate-800 text-[11px]">
                    {readingMode === "humana" 
                      ? "Sistemas de Informação & Ergonomia Cognitiva" 
                      : "Engenharia de Software & IA Quântica"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-1 text-[10px] tracking-wider uppercase">RESPONSÁVEL TÉCNICO</span>
                  <span className="font-bold text-slate-800 text-[11px]">Fransissi Tripalonga Vicente</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-1 text-[10px] tracking-wider uppercase">E-MAIL</span>
                  <span className="font-bold text-slate-800 text-[11px]">ftripas@gmail.com</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-1 text-[10px] tracking-wider uppercase">CONTACTO</span>
                  <span className="font-bold text-slate-800 text-[11px]">+258849547771 / 827520137</span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-400 font-bold block mb-1.5 text-[10px] tracking-wider uppercase">ESTATUTO</span>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-700 font-black text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {readingMode === "humana" ? "Pesquisa Aplicada & Modernização" : "Núcleo Reativo Operacional"}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area (75%) */}
          <main className="space-y-8 print:space-y-0 print:w-full print:block w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Configuração do Documento:</span>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                  readingMode === "humana"
                    ? "bg-slate-100 text-slate-800 border-slate-300"
                    : "bg-slate-950 text-cyan-300 border-slate-800 font-mono"
                }`}>
                  {readingMode === "humana" 
                    ? "🎓 Modo Sistemas de Informação & Epistemologia Humana (PhD)" 
                    : "🏛️ Modo Técnico Oficial: IA Quântica & Engenharia Reativa"}
                </span>
              </div>
              
              <div className="flex flex-wrap p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1.5">
                <button 
                  onClick={() => setReadingMode("tecnica")}
                  className={`px-4 py-2 rounded-lg text-[12px] font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    readingMode === "tecnica" 
                      ? "bg-[#0B1222] text-cyan-300 shadow-md" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-white"
                  }`}
                  title="Configurar o documento em linguagem super avançada de IA quântica, alta precisão, celeridade e arquitetura em funcionamento"
                >
                  <span>🏛️</span>
                  <span>Técnica Oficial (IA Quântica)</span>
                </button>
                <button 
                  onClick={() => setReadingMode("humana")}
                  className={`px-4 py-2 rounded-lg text-[12px] font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    readingMode === "humana" 
                      ? "bg-[#0B1222] text-white shadow-md" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-white"
                  }`}
                  title="Configurar o documento em linguagem culta e humanista de Sistemas de Informação (PhD em todos os níveis de escolaridade)"
                >
                  <span>🎓</span>
                  <span>Perspetiva de SI & Epistemologia Humana (PhD)</span>
                </button>
              </div>
            </div>

            


              

            
            <div className="w-full flex flex-col space-y-12 print:space-y-0">
              <div 
                key="chapter-1"
                id="chapter-1"
                className="bg-white border border-slate-200 print:border-none w-full max-w-[8.27in] min-h-[11.69in] h-auto mx-auto shadow-xl print:shadow-none relative flex flex-col shrink-0 mb-10 print:mb-0 print:block print:break-after-page page-break-after:always rounded-3xl overflow-visible"
                style={{ paddingTop: '3cm', paddingLeft: '3cm', paddingBottom: '2cm', paddingRight: '2cm' }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-[0.15] pointer-events-none rounded-3xl" />
                <div className="relative z-10 border-[2px] border-slate-900 rounded-2xl h-full p-[0.15rem] bg-white flex flex-col shadow-inner">
                  <div className="w-full h-full border-[1px] border-slate-900 rounded-xl p-8 flex flex-col items-center justify-between bg-white">
                    <div className="w-16 h-0.5 bg-slate-900 mb-10" />
                    <div className="text-center space-y-8 flex-1 flex flex-col items-center justify-center">
                      {readingMode === "humana" ? (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 font-bold text-[12px]">
                          <GraduationCap className="w-4 h-4 text-slate-700" />
                          <span>Memória Descritiva & Fundamentação Sociotécnica</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-cyan-400 font-mono font-bold text-[12px]">
                          <Terminal className="w-4 h-4 text-cyan-400" />
                          <span>MEMÓRIA DESCRITIVA :: ESPECIFICAÇÃO DE IA QUÂNTICA</span>
                        </div>
                      )}
                      <div className="space-y-4">
                        <h1 className="font-black text-slate-900 leading-[1.1] max-w-2xl mx-auto text-[16px] tracking-tight">
                          SIGIP
                        </h1>
                        <p className="text-slate-600 italic font-medium max-w-xl mx-auto leading-relaxed text-[12px]">
                          "Sistema Integrado de Gestão de Processo"
                        </p>
                        <div className="pt-2">
                          <span className={`inline-block text-[11px] font-semibold px-4 py-1.5 rounded-full ${
                            readingMode === "humana"
                              ? "bg-slate-100 text-slate-800 border border-slate-200"
                              : "bg-slate-900 text-cyan-300 font-mono border border-slate-800"
                          }`}>
                            {readingMode === "humana"
                              ? "Abordagem Científica de Sistemas de Informação, Epistemologia da Aprendizagem e Ergonomia Organizacional"
                              : "IA Quântica Vetorial, Computação Reativa Distribuída e Telemetria em Tempo Real"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full pt-4 text-center border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                      SIGEP - Sistema Integrado de Gestão de Processo
                    </div>
                  </div>
                </div>
              </div>

              <div 
                key="chapter-1-contra"
                id="chapter-1-contra"
                className="bg-white border border-slate-200 print:border-none w-full max-w-[8.27in] min-h-[11.69in] h-auto mx-auto shadow-xl print:shadow-none relative flex flex-col shrink-0 mb-10 print:mb-0 print:block print:break-after-page page-break-after:always rounded-3xl overflow-visible"
                style={{ paddingTop: '3cm', paddingLeft: '3cm', paddingBottom: '2cm', paddingRight: '2cm' }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-[0.15] pointer-events-none rounded-3xl" />
                <div className="relative z-10 border-[2px] border-slate-900 rounded-2xl h-full p-[0.15rem] bg-white flex flex-col shadow-inner">
                  <div className="w-full h-full border-[1px] border-slate-900 rounded-xl p-8 flex flex-col bg-white justify-between">
                    <div>
                      <div className="w-full p-4 text-left">
                        <h2 className="font-black text-slate-900 mb-6 border-b pb-3 text-[13px] flex items-center justify-between">
                          <span>
                            {readingMode === "humana" 
                              ? "Contra-Capa (Ficha Técnica & Enquadramento Institucional)" 
                              : "Contra-Capa (Ficha Técnica & Arquitetura Computacional)"}
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                            readingMode === "humana" 
                              ? "bg-slate-100 text-slate-800 border border-slate-200" 
                              : "bg-slate-900 text-cyan-300 font-mono border border-slate-800"
                          }`}>
                            {readingMode === "humana" ? "Sistemas de Informação & Governação" : "ENGINEERING_SPEC :: v2.6.4"}
                          </span>
                        </h2>
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div>
                              <p className="font-black text-slate-400 uppercase tracking-widest mb-1 text-[11px]">TIPO DE PROJETO</p>
                              <p className="font-bold text-slate-800 text-[11px]">
                                {readingMode === "humana" 
                                  ? "Pesquisa em Sistemas de Informação e Mediação Cognitiva" 
                                  : "Engenharia de Software, IA Quântica & Sistemas Distribuídos"}
                              </p>
                            </div>
                            <div>
                              <p className="font-black text-slate-400 uppercase tracking-widest mb-1 text-[11px]">RESPONSÁVEL TÉCNICO</p>
                              <p className="font-bold text-slate-800 text-[11px]">Fransissi Tripalonga Vicente</p>
                            </div>
                            <div>
                              <p className="font-black text-slate-400 uppercase tracking-widest mb-1 text-[11px]">E-MAIL</p>
                              <p className="font-bold text-slate-800 text-[11px]">ftripas@gmail.com</p>
                            </div>
                            <div>
                              <p className="font-black text-slate-400 uppercase tracking-widest mb-1 text-[11px]">CONTACTO</p>
                              <p className="font-bold text-slate-800 text-[11px]">+258849547771 / 827520137</p>
                            </div>
                          </div>
                          <div className="space-y-4 border-l pl-8 border-slate-100">
                            <p className="font-black text-slate-400 uppercase tracking-widest mb-1 text-[11px]">ESTATUTO</p>
                            <div className="flex items-center gap-2 text-[10.5px] text-slate-800 font-bold">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              {readingMode === "humana" 
                                ? "Pesquisa Aplicada & Modernização Académica" 
                                : "Pesquisa Tecnológica Avançada & Núcleo Reativo Operacional"}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full mt-6 pt-6 border-t border-slate-100">
                        <div className="grid grid-cols-3 gap-6 text-left">
                          <div>
                            <p className="text-[11px] font-bold text-slate-400">Classificação</p>
                            <p className="text-[11px] font-bold text-slate-900 mt-0.5">
                              {readingMode === "humana" ? "Uso Institucional e Académico" : "Uso Oficial e Auditoria Técnica SISTAFE"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-400">Distribuição</p>
                            <p className="text-[11px] font-bold text-slate-900 mt-0.5">Autorizada</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-400">Documento ID</p>
                            <p className="text-[11px] font-bold text-slate-900 mt-0.5">
                              {readingMode === "humana" ? "SIGIP-MD-2026-001" : "SIGIP-SYS-2026-001"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full pt-4 text-center border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                      SIGEP - Sistema Integrado de Gestão de Processo
                    </div>
                  </div>
                </div>
              </div>

              {chapters.filter(c => c.id !== 1).map((chapter) => {
                return (
                  <div 
                    key={chapter.id}
                    id={"chapter-" + chapter.id}
                    className="bg-white border border-slate-200 print:border-none w-full max-w-[8.27in] min-h-[11.69in] h-auto mx-auto shadow-xl print:shadow-none relative flex flex-col shrink-0 mb-10 print:mb-0 print:block print:break-after-page page-break-after:always rounded-3xl overflow-visible"
                    style={{ paddingTop: '3cm', paddingLeft: '3cm', paddingBottom: '2cm', paddingRight: '2cm' }}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-[0.15] pointer-events-none rounded-3xl" />
                    <div className="relative z-10 flex-1 w-full flex flex-col justify-between">
                      <div className="flex-1">
                        {chapterContent[chapter.id] || (
                          <div className="space-y-8 flex-1 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2px] flex items-center justify-center mb-6">
                              <Clock className="w-10 h-10 text-slate-300" />
                            </div>
                            <h2 className="font-black text-slate-900 mb-2 text-[13px]">{chapter.title}</h2>
                            <p className="text-slate-400 max-w-sm text-[12px]">Informação detalhada em fase de consolidação para este capítulo técnico.</p>
                          </div>
                        )}
                      </div>
                      <div className="w-full pt-4 text-center border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                        SIGEP - Sistema Integrado de Gestão de Processo
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
export default ManualInstrucoesView;
