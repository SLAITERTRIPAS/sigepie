import React from "react";
import { X } from "lucide-react";
import { useModalAccessibility } from "../../hooks/useModalAccessibility";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  title?: string;
}

export const AlertModal = ({
  isOpen,
  onClose,
  message,
  title = "Aviso",
}: AlertModalProps) => {
  const modalRef = useModalAccessibility<HTMLDivElement>({
    isOpen,
    onClose,
  });

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
    >
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-black text-[#121c60] uppercase tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-sm">{message}</p>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#121c60] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#1a287a] transition-all active:scale-95 shadow-lg shadow-blue-900/10"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
