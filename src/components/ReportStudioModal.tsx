import React, { useState, useRef } from "react";
import {
  X,
  Printer,
  Download,
  ZoomIn,
  ZoomOut,
  Sliders,
  ShieldCheck,
  QrCode,
  Sparkles,
  FileText,
  Search,
  PenTool,
  CheckCircle2,
  Eye,
  Layers,
  FileType,
  Share2,
  Copy,
  Check,
  Palette,
  Maximize2,
  RefreshCw,
  Stamp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { openPrintDocumentWindow, printElementById } from "../lib/printUtils";
import AssinaturaDigitalPad from "./AssinaturaDigitalPad";

export interface ReportStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  documentNumber?: string;
  contentHtml?: string;
  children?: React.ReactNode;
  user?: any;
  department?: string;
  initialSignature?: string;
}

export const ReportStudioModal: React.FC<ReportStudioModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle = "Gerador e Visualizador Avançado de Relatórios Institucionais",
  documentNumber,
  contentHtml,
  children,
  user,
  department = "ISPSongo • Gestão Geral",
  initialSignature,
}) => {
  // Estados de Personalização
  const [paperFormat, setPaperFormat] = useState<"A4_portrait" | "A4_landscape" | "A3_landscape">("A4_portrait");
  const [theme, setTheme] = useState<"songo_official" | "academic_gold" | "executive_dark">("songo_official");
  const [watermark, setWatermark] = useState<string>("CONFIDENCIAL");
  const [showQrAuthentication, setShowQrAuthentication] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(100);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [paperTexture, setPaperTexture] = useState<boolean>(true);
  
  // Estado de Assinatura
  const [activeSignature, setActiveSignature] = useState<{
    img: string;
    nome: string;
    cargo: string;
    data: string;
    hash: string;
  } | null>(
    initialSignature
      ? {
          img: initialSignature,
          nome: user?.name || user?.nome || "Responsável Autorizado",
          cargo: user?.cargo || "Gestor de Processo",
          data: new Date().toLocaleDateString("pt-PT"),
          hash: `SIGEP-AUTH-${Date.now().toString(36).toUpperCase()}`,
        }
      : null
  );
  
  const [showSignaturePad, setShowSignaturePad] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  const reportAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const documentHash = activeSignature?.hash || `SIGEP-REL-${(documentNumber || "2026-001").replace(/[^a-zA-Z0-9]/g, "")}-${Date.now().toString(36).toUpperCase()}`;
  const qrValidationUrl = `https://ispsongo.ac.mz/validar-doc?hash=${documentHash}`;

  const handlePrintDocument = () => {
    const element = reportAreaRef.current;
    if (element) {
      openPrintDocumentWindow({
        title: title || "Relatório Oficial ISPSongo",
        orgao: department || "INSTITUTO SUPERIOR POLITÉCNICO DE SONGO",
        direcao: user?.direcao || "DIREÇÃO GERAL",
        contentHtml: element.innerHTML,
        orientation: paperFormat.includes("landscape") ? "landscape" : "portrait",
        pageSize: paperFormat.startsWith("A3") ? "A3" : "A4",
      });
    } else {
      printElementById("report-studio-content-area");
    }
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(documentHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-7xl h-[94vh] flex flex-col overflow-hidden"
        >
          {/* TOPO: Barra de Título & Controlo Principal */}
          <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-blue-600/20 border border-amber-500/30 text-amber-400">
                <Stamp size={22} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black text-white tracking-wide">
                    {title}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 text-[10px] font-bold border border-blue-700/50">
                    Estúdio de Relatórios Interativo
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  {subtitle} • Ref: <span className="font-mono font-semibold text-slate-300">{documentNumber || "DOC-SIGEP-2026"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintDocument}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-500 hover:to-amber-500 text-white text-xs font-black tracking-wider flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
              >
                <Printer size={16} />
                <span>Imprimir / Gerar PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
                title="Fechar Relatório"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* CORPO DO ESTÚDIO: Barra de Personalização + Área de Visualização */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-900">
            {/* PAINEL LATERAL DE FERRAMENTAS INTERATIVAS (Controlo em Tempo Real) */}
            <div className="w-full lg:w-80 bg-slate-950 border-r border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto shrink-0 select-none">
              <div className="flex items-center gap-2 text-xs font-black text-slate-300 border-b border-slate-800 pb-2">
                <Sliders size={16} className="text-amber-400" />
                <span>Personalização e Formatação</span>
              </div>

              {/* Formato de Papel e Orientação */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Formato da Folha
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setPaperFormat("A4_portrait")}
                    className={`py-1.5 rounded-lg transition-all ${
                      paperFormat === "A4_portrait"
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    A4 Retrato
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperFormat("A4_landscape")}
                    className={`py-1.5 rounded-lg transition-all ${
                      paperFormat === "A4_landscape"
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    A4 Paisagem
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperFormat("A3_landscape")}
                    className={`py-1.5 rounded-lg transition-all ${
                      paperFormat === "A3_landscape"
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    A3 Quadro
                  </button>
                </div>
              </div>

              {/* Tema de Apresentação */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Estilo Visual Institucional
                </label>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTheme("songo_official")}
                    className={`p-2 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      theme === "songo_official"
                        ? "bg-blue-950/80 border-blue-500 text-white font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-800 border border-amber-400" />
                      <span>Oficial Songo (Azul & Ouro)</span>
                    </div>
                    {theme === "songo_official" && <CheckCircle2 size={14} className="text-blue-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("academic_gold")}
                    className={`p-2 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      theme === "academic_gold"
                        ? "bg-amber-950/80 border-amber-500 text-white font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-600 border border-yellow-300" />
                      <span>Nobreza Académica (Dourado)</span>
                    </div>
                    {theme === "academic_gold" && <CheckCircle2 size={14} className="text-amber-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("executive_dark")}
                    className={`p-2 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      theme === "executive_dark"
                        ? "bg-slate-800 border-slate-500 text-white font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-400" />
                      <span>Executivo Minimalista (Grafite)</span>
                    </div>
                    {theme === "executive_dark" && <CheckCircle2 size={14} className="text-slate-300" />}
                  </button>
                </div>
              </div>

              {/* Marca D'Água */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Marca D'Água de Fundo
                </label>
                <select
                  value={watermark}
                  onChange={(e) => setWatermark(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">Nenhuma Marca D'Água</option>
                  <option value="CONFIDENCIAL">CONFIDENCIAL</option>
                  <option value="DOCUMENTO OFICIAL">DOCUMENTO OFICIAL</option>
                  <option value="HOMOLOGADO">HOMOLOGADO</option>
                  <option value="MINUTA / RASCUNHO">MINUTA / RASCUNHO</option>
                  <option value="USO INTERNO">USO INTERNO EXCLUSIVO</option>
                </select>
              </div>

              {/* Autenticação Digital & QR Code */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <QrCode size={15} className="text-amber-400" />
                    <span>Autenticação por QR Code</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showQrAuthentication}
                    onChange={(e) => setShowQrAuthentication(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Inclui o código QR e chancela de validação com hash criptográfico no rodapé de cada folha.
                </p>
              </div>

              {/* Assinatura Digital do Documento */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    <span>Assinatura Digital</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSignaturePad(true)}
                    className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    {activeSignature ? "Alterar" : "Apor Assinatura"}
                  </button>
                </div>

                {activeSignature ? (
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                    <div className="bg-white p-1 rounded border border-slate-700 w-16 h-10 flex items-center justify-center shrink-0">
                      <img src={activeSignature.img} alt="Assinatura" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[11px] font-bold text-white truncate">{activeSignature.nome}</div>
                      <div className="text-[9px] text-slate-400 truncate">{activeSignature.cargo}</div>
                      <div className="text-[8px] text-emerald-400 font-mono mt-0.5">Assinado com Fundo Transparente</div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSignaturePad(true)}
                    className="p-3 rounded-lg border border-dashed border-slate-700 hover:border-amber-400 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <PenTool size={14} className="text-amber-400" />
                    <span>Apor ou Desenhar Assinatura...</span>
                  </button>
                )}
              </div>

              {/* Pesquisa e Filtro Interativo no Documento */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Localizar Termo no Relatório
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filtrar dados ou palavras..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Hash e Partilha */}
              <div className="mt-auto pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-500 truncate max-w-[170px]">
                    Hash: {documentHash}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyHash}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    {copiedHash ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedHash ? "Copiado!" : "Copiar"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ÁREA CENTRAL DE VISUALIZAÇÃO DO PAPEL (LIVE REPORT CANVAS) */}
            <div className="flex-1 bg-slate-950 p-4 sm:p-8 overflow-auto flex flex-col items-center justify-start relative">
              {/* Barra Flutuante de Zoom & Textura */}
              <div className="sticky top-0 z-20 mb-4 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl px-4 py-2 flex items-center justify-between gap-4 shadow-xl select-none text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(50, z - 15))}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                    title="Diminuir Zoom"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span className="font-mono font-bold w-12 text-center text-amber-400">
                    {zoom}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(150, z + 15))}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                    title="Aumentar Zoom"
                  >
                    <ZoomIn size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(100)}
                    className="text-[10px] text-slate-400 hover:text-white font-semibold underline ml-1"
                  >
                    Reset (100%)
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paperTexture}
                      onChange={(e) => setPaperTexture(e.target.checked)}
                      className="accent-amber-500 rounded"
                    />
                    <span>Efeito Textura de Papel</span>
                  </label>
                </div>
              </div>

              {/* RECIPIENTE FÍSICO DA FOLHA A4/A3 */}
              <div
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
                className="transition-transform duration-200"
              >
                <div
                  ref={reportAreaRef}
                  id="report-studio-content-area"
                  className={`bg-white text-slate-900 shadow-2xl relative transition-all duration-300 mx-auto ${
                    paperFormat === "A4_portrait"
                      ? "w-[210mm] min-h-[297mm] p-[18mm]"
                      : paperFormat === "A4_landscape"
                      ? "w-[297mm] min-h-[210mm] p-[16mm]"
                      : "w-[420mm] min-h-[297mm] p-[20mm]"
                  } ${
                    theme === "songo_official"
                      ? "border-t-[10px] border-blue-900 shadow-blue-950/40"
                      : theme === "academic_gold"
                      ? "border-t-[10px] border-amber-600 shadow-amber-950/40"
                      : "border-t-[10px] border-slate-900 shadow-slate-950/40"
                  }`}
                  style={
                    paperTexture
                      ? {
                          backgroundImage:
                            "radial-gradient(#f1f5f9 1px, transparent 1px), radial-gradient(#f8fafc 1px, #ffffff 1px)",
                          backgroundSize: "20px 20px",
                          backgroundPosition: "0 0, 10px 10px",
                        }
                      : {}
                  }
                >
                  {/* MARCA D'ÁGUA EM SEGUNDO PLANO */}
                  {watermark && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 opacity-[0.04]">
                      <div className="text-7xl sm:text-9xl font-black text-slate-900 -rotate-45 tracking-widest text-center uppercase whitespace-nowrap">
                        {watermark}
                      </div>
                    </div>
                  )}

                  {/* CABEÇALHO INSTITUCIONAL DE ELITE */}
                  <div className="relative z-10 border-b-2 border-slate-900 pb-5 mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Emblema da República ou Logo ISPSongo */}
                      <div className="w-16 h-16 shrink-0 flex items-center justify-center border-2 border-slate-800 p-1 rounded-xl bg-slate-50 shadow-sm">
                        <img
                          src="/emblem-mozambique.png"
                          alt="Emblema da República"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            // Fallback caso não encontre imagem
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <span className="text-xs font-black text-slate-800 text-center font-serif leading-tight">
                          REPÚBLICA DE MOÇAMBIQUE
                        </span>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          República de Moçambique • Governo da Província de Tete
                        </div>
                        <h1 className="text-base sm:text-lg font-black font-serif text-slate-900 uppercase tracking-tight">
                          INSTITUTO SUPERIOR POLITÉCNICO DE SONGO
                        </h1>
                        <div className="text-xs font-semibold text-slate-700">
                          {department}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-mono text-slate-500">Documento Oficial</div>
                      <div className="text-xs font-black text-blue-900">{documentNumber || "SIGEP-2026-REL"}</div>
                      <div className="text-[10px] text-slate-600 font-semibold">
                        Songo, {new Date().toLocaleDateString("pt-PT")}
                      </div>
                    </div>
                  </div>

                  {/* TÍTULO CENTRAL DO RELATÓRIO */}
                  <div className="relative z-10 text-center my-6 pb-4 border-b border-slate-200">
                    <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-900 tracking-tight uppercase">
                      {title}
                    </h2>
                    {subtitle && (
                      <p className="text-xs font-medium text-slate-600 mt-1 max-w-2xl mx-auto">
                        {subtitle}
                      </p>
                    )}
                  </div>

                  {/* CONTEÚDO DINÂMICO DO RELATÓRIO OU FILTROS */}
                  <div className="relative z-10 text-xs text-slate-800 space-y-4 leading-relaxed font-serif">
                    {contentHtml ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: contentHtml }}
                        className="prose prose-slate max-w-none prose-table:w-full prose-table:border-collapse prose-td:border prose-td:border-slate-300 prose-td:p-2 prose-th:bg-slate-100 prose-th:p-2 prose-th:font-bold"
                      />
                    ) : (
                      children || (
                        <div className="p-8 text-center text-slate-400 italic">
                          Conteúdo do relatório em preparação...
                        </div>
                      )
                    )}
                  </div>

                  {/* BLOCO DE ASSINATURA & VALIDAÇÃO CRIPTOGRÁFICA NO RODAPÉ */}
                  <div className="relative z-10 mt-12 pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 items-end page-break-inside-avoid">
                    {/* Chancela / QR Code de Autenticação */}
                    {showQrAuthentication && (
                      <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-300">
                        <div className="p-2 bg-white rounded-lg border border-slate-300 shrink-0">
                          <QrCode size={40} className="text-slate-900" />
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-blue-900 tracking-wider uppercase">
                            Chancela de Autenticidade SIGEP Songo
                          </div>
                          <div className="text-[8px] font-mono text-slate-600 break-all my-0.5">
                            Hash: {documentHash}
                          </div>
                          <div className="text-[8px] text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 size={10} />
                            <span>Documento Registado na Base de Dados Oficial</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Assinatura Aposta com Fundo Transparente */}
                    <div className="text-center flex flex-col items-center justify-end col-start-2">
                      {activeSignature ? (
                        <div className="flex flex-col items-center">
                          <div className="h-16 flex items-center justify-center mb-1">
                            <img
                              src={activeSignature.img}
                              alt="Assinatura Aposta"
                              className="max-h-full object-contain filter drop-shadow-sm"
                            />
                          </div>
                          <div className="w-48 border-t border-slate-900 pt-1 text-center">
                            <div className="text-xs font-black text-slate-900">{activeSignature.nome}</div>
                            <div className="text-[10px] font-semibold text-slate-600">{activeSignature.cargo}</div>
                            <div className="text-[8px] text-slate-400 mt-0.5">Assinado em {activeSignature.data}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="h-12" />
                          <div className="w-48 border-t border-slate-900 pt-1 text-center">
                            <div className="text-xs font-black text-slate-900">
                              {user?.name || user?.nome || "O Responsável Autorizado"}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-600">
                              {user?.cargo || "Gestor Institucional"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* MODAL / PAD DE ASSINATURA DIGITAL COM CANVAS AI */}
        {showSignaturePad && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <AssinaturaDigitalPad
              defaultNome={user?.name || user?.nome || "Responsável Autorizado"}
              defaultCargo={user?.cargo || "Gestor de Processo"}
              onSaveAssinatura={(data) => {
                setActiveSignature({
                  img: data.assinaturaImg,
                  nome: data.assinanteNome,
                  cargo: data.assinanteCargo,
                  data: new Date(data.dataAssinatura).toLocaleDateString("pt-PT"),
                  hash: data.hashAutenticacao,
                });
                setShowSignaturePad(false);
              }}
              onCancel={() => setShowSignaturePad(false)}
            />
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
