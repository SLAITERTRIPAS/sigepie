import React, { useState, useEffect } from "react";
import { getActiveInstituicao } from "../../lib/instituicaoEstruturaService";

export default function Footer({ className = "" }: { className?: string }) {
  const [activeInst, setActiveInst] = useState<any>(null);

  useEffect(() => {
    const handleInstUpdate = () => {
      setActiveInst(getActiveInstituicao());
    };
    handleInstUpdate();
    window.addEventListener("instituicao_changed", handleInstUpdate);
    window.addEventListener("instituicao_updated", handleInstUpdate);
    window.addEventListener("sigep_estrutura_updated", handleInstUpdate);
    return () => {
      window.removeEventListener("instituicao_changed", handleInstUpdate);
      window.removeEventListener("instituicao_updated", handleInstUpdate);
      window.removeEventListener("sigep_estrutura_updated", handleInstUpdate);
    };
  }, []);

  const footerColor = activeInst?.footerColor || activeInst?.accentColor || "#050b38";

  return (
    <div 
      className={`flex flex-col items-center py-1.5 transition-colors duration-500 ${className}`}
      style={{ backgroundColor: footerColor }}
    >
      <div
        className="w-full text-center text-[11px] text-white font-bold tracking-wider"
        style={{
          textShadow:
            "1px 1px 0 #000, 2px 2px 0 #000, 3px 3px 0 #000, 4px 4px 4px rgba(0,0,0,0.5)",
        }}
      >
        Desenvolvido por fttripas - 2025-2026 | @todos os direitos reservados
      </div>
    </div>
  );
}
