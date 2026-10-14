import React from "react";
import { getSystemLogo } from "../lib/logoService";
import {
  Award,
  Building2,
  CheckCircle2,
  ChevronRight,
  Compass,
  Shield,
  Users,
  Sparkles,
  MapPin,
  GraduationCap,
  ArrowRight,
  BookOpen,
  Building,
  Check,
  FileText,
  Globe,
  Info,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

interface InstitutionalCoverModalProps {
  isOpen: boolean;
  user: any;
  instituicao?: any;
  onConfirm: () => void;
}

export default function InstitutionalCoverModal({
  isOpen,
  user,
  instituicao,
  onConfirm,
}: InstitutionalCoverModalProps) {
  if (!isOpen || !user) return null;

  const instName = instituicao?.nome || "Instituto Superior Politécnico de Songo";
  const userName = user.nome || user.name || user.usuario || "Colaborador(a)";
  const userRole = user.cargo || user.role || user.funcao || `Servidor do ${instituicao?.sigla || 'ISPS'}`;
  const userOrg =
    user.unidadeOrganica ||
    user.orgao ||
    user.direcao ||
    user.departamento ||
    instName;

  return (
    <div className="fixed inset-0 z-[999999] bg-[#030712]/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-screen h-screen sm:w-[96vw] sm:h-[96vh] rounded-none sm:rounded-3xl shadow-2xl border-2 border-amber-400/50 overflow-hidden flex flex-col transition-all text-[12px]">
        
        {/* Banner de Topo com Cores Oficiais e Emblemas */}
      <div className="bg-gradient-to-r from-[#0a0a5a] via-[#121c60] to-[#0a0a5a] text-white p-4 sm:p-6 text-center relative border-b-4 border-amber-400 shrink-0">
          <div className="absolute inset-0 opacity-10 bg-[radial-[#FFB800]_1px,transparent_1px] [background-size:16px_16px] pointer-events-none" />
          
          <div className="relative z-10 space-y-1.5">
            <div className="flex justify-center items-center gap-3 mb-2">
              <div className="p-1 bg-white/95 rounded-xl shadow-lg border border-amber-400/40">
                <img
                  src="https://lh3.googleusercontent.com/d/1wgnb7dls5c0YcO2V_Fh_E6iA09m1v6mX"
                  alt="Emblema de Moçambique"
                  className="h-10 sm:h-12 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex items-center justify-center bg-transparent">
                <img
                  src={instituicao?.logoUrl && !instituicao.logoUrl.includes("11zvvpOpZARM1yk_irEDpjJ-qBKlTlhad") ? instituicao.logoUrl : (getSystemLogo() || "/image.png")}
                  alt="Logo Instituição"
                  className="h-10 sm:h-12 w-auto object-contain filter drop-shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <span className="inline-block px-3 py-0.5 bg-amber-400 text-[#0a0a5a] font-black text-[10px] uppercase tracking-widest rounded-full shadow-sm">
              REPÚBLICA DE MOÇAMBIQUE • MINISTÉRIO DA CIÊNCIA, TECNOLOGIA E ENSINO SUPERIOR
            </span>

            <h1 className="text-base sm:text-xl font-black uppercase tracking-tight text-amber-300 font-serif">
              NOTA INSTITUCIONAL DE APRESENTAÇÃO — SIGEP V1.1.2.0
            </h1>
            <p className="text-[11px] text-slate-300 font-medium">
              Plataforma Inteligente de Gestão Estratégica e Projeção Académica • Moçambique
            </p>
          </div>
        </div>

        {/* Corpo de Apresentação da Instituição e Utilizador */}
        <div className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1 bg-slate-50/50 text-[12px] leading-relaxed text-slate-800 text-justify">
          
          {/* Cartão de Identificação do Utilizador Logado */}
          <div className="bg-gradient-to-r from-blue-50 via-white to-amber-50/40 border-2 border-blue-200/80 rounded-2xl p-4 shadow-sm space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs font-black text-[#0a0a5a] uppercase tracking-wider">
              <UserCheck size={16} className="text-amber-600 shrink-0" />
              <span>Dados do Utilizador Conectado no Sistema</span>
            </div>
            
            <div className="pt-1 border-t border-blue-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Utilizador / Servidor:</p>
                <p className="text-[12px] font-black text-slate-900">{userName}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Cargo / Função:</p>
                <p className="text-[12px] font-bold text-[#0a0a5a]">{userRole}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Órgão / Unidade:</p>
                <p className="text-[12px] font-bold text-slate-700">{userOrg} ({instName})</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 font-sans text-slate-700 text-[12px] text-justify">
            <p>
              O <strong>SIGEP (Sistema Integrado de Gestão de Processos)</strong> é a Plataforma Oficial de Gestão Estratégica, Projeção Académica e Tramitação Eletrónica implementada para assegurar a excelência operacional, a transparência e a celeridade administrativa nas instituições de ensino superior e técnico de Moçambique.
            </p>
            <p>
              Através desta nota institucional, certifica-se que o utilizador autenticado encontra-se devidamente autorizado e enquadrado nos fluxos de trabalho parametrizados, com acesso em tempo real aos órgãos de gestão, diretórios executivos, controlo de expediente, tesouraria, património e relatórios gerenciais automatizados.
            </p>
            <p>
              Todos os prazos, tramitações e despachos executados por este utilizador são auditados e sincronizados com a base de dados central, garantindo o rigor normativo e o cumprimento das metas estratégicas da instituição.
            </p>
          </div>
        </div>

        {/* Rodapé e Ação */}
        <div className="p-4 sm:p-6 bg-slate-100 border-t border-slate-200 text-center space-y-2 shrink-0">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full bg-[#0a0a5a] hover:bg-[#121272] text-amber-400 hover:text-amber-300 py-3.5 px-6 rounded-xl font-black text-xs sm:text-sm tracking-widest uppercase transition-all shadow-xl hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 border-2 border-amber-400/50 cursor-pointer"
          >
            <span>🚀 Confirmar Leitura e Aceder à Área de Trabalho (SIGEP)</span>
            <ArrowRight size={18} className="text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

