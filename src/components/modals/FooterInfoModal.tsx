import React from "react";
import { X, ShieldCheck, Cpu, Code2, Award, CheckCircle2, Sparkles } from "lucide-react";
import SigepLogo from "../SigepLogo";
import FirebaseStatusIndicator from "../FirebaseStatusIndicator";
import { useModalAccessibility } from "../../hooks/useModalAccessibility";

interface FooterInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FooterInfoModal: React.FC<FooterInfoModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useModalAccessibility<HTMLDivElement>({
    isOpen,
    onClose,
  });

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-[#121c60] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="bg-[#121c60] px-6 py-5 flex items-center justify-between text-white border-b-4 border-[#FFB800] relative">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center p-1.5 border border-[#FFB800]/40 shadow-inner">
              <SigepLogo size="xs" showText={false} className="!w-7 !h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-wider text-white">
                  SIGEP Institucional
                </h3>
                <span className="bg-[#FFB800] text-[#121c60] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Oficial
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium">
                Detalhes da Versão e Direitos Autorais
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Fechar (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto bg-slate-50/50">
          {/* Card da Versão Atual */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-900 rounded-xl">
                  <Cpu size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Versão do Software
                  </span>
                  <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
                    Versão 2026.9.1 Quântica
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Sparkles size={11} /> Pro
                    </span>
                  </h4>
                </div>
              </div>
              <FirebaseStatusIndicator />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 block">Arquitetura</span>
                <span className="font-extrabold text-slate-700">Cloud Sync Híbrida</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 block">Segurança de Dados</span>
                <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck size={13} /> Firestore Quântico
                </span>
              </div>
            </div>
          </div>

          {/* Card de Autoria & Copyright */}
          <div className="bg-gradient-to-br from-[#121c60]/5 via-white to-amber-500/5 p-4.5 rounded-2xl border border-[#121c60]/15 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="p-2 bg-[#121c60] text-[#FFB800] rounded-xl shadow-xs">
                <Award size={18} />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                  Propriedade Intelectual & Desenvolvimento
                </span>
                <h4 className="text-sm font-black text-[#121c60]">
                  Desenvolvido por Franzíssi Tripalonga (Slaiter Tripas)
                </h4>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <span className="w-1.5 h-1.5 bg-[#FFB800] rounded-full"></span>
                <span>2025 - 2026 | @todos os direitos reservados</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                Desenvolvimento exclusivo do Sistema Integrado de Gestão de Processos (SIGEP), concebido para garantir a integridade, segurança, rastreabilidade e governança eletrónica de expedientes e recursos institucionais.
              </p>
            </div>
          </div>

          {/* Card de Recursos e Módulos Integrados */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Módulos Centrais em Operação
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-700">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span>Gestão de Processos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span>UGEA & Fornecedores</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span>Gestão de Efetivo & RH</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span>Backup Automático em Nuvem</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal com Botão de Ação */}
        <div className="p-4 bg-slate-100/80 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
            <Code2 size={14} className="text-[#121c60]" />
            <span>SIGEP High-Performance Engine</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#121c60] hover:bg-[#1a298a] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md border border-[#FFB800]/50 transition-all cursor-pointer active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FooterInfoModal;
