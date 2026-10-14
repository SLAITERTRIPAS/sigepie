import React from "react";
import { getSystemLogo } from "../../lib/logoService";
import { getActiveInstituicao } from "../../lib/instituicaoEstruturaService";
import { useCurrentLanguage } from "../../lib/i18n";

interface DocumentFooterProps {
  className?: string;
  user?: any;
}

export function DocumentFooter({ className = "", user }: DocumentFooterProps) {
  const currentLang = useCurrentLanguage();
  const isEn = currentLang === "en";

  const activeInst = getActiveInstituicao();
  const instName = activeInst?.nome || user?.instituicaoNome || (user?.instituicaoId ? "" : "INSTITUIÇÃO");
  const rawLogo = activeInst?.logo || user?.instituicaoLogo;
  const instLogo = rawLogo && !rawLogo.includes("11zvvpOpZARM1yk_irEDpjJ-qBKlTlhad") 
    ? rawLogo 
    : (getSystemLogo() || "/sigep-logo.svg");
  const instProvincia = activeInst?.provincia || user?.provincia || "Tete";
  const instDistrito = activeInst?.distrito || user?.distrito || "Songo";

  return (
    <footer
      data-document-footer="true"
      className={`document-footer mt-auto pt-1 border-t-[2px] border-[#800000] flex justify-between items-center text-[7pt] sm:text-[7.5pt] text-slate-800 font-serif leading-tight break-inside-avoid print:break-inside-avoid print:break-before-avoid print:mt-auto print:pt-0.5 print:text-[6.5pt] ${className}`}
      style={{
        borderTopColor: "#800000",
        pageBreakInside: "avoid",
        breakInside: "avoid",
        pageBreakBefore: "avoid",
        breakBefore: "avoid",
      }}
    >
      <div className="leading-tight text-left">
        <div>
          {instName ? `${instName} • ` : ""}
          {isEn
            ? `Main Campus. District of ${instDistrito}, Province of ${instProvincia}. P.O. Box No. 146`
            : `Campus Principal. Distrito de ${instDistrito}, Província de ${instProvincia}. Caixa Postal nº 146`}
        </div>
        <div className="text-[6.5pt] sm:text-[7pt] text-slate-600 print:text-[6pt]">
          Tel: +258 252-82336 • email:{" "}
          <a
            href="mailto:secretariado@ispsongo.ac.mz"
            className="text-blue-700 underline font-normal hover:text-blue-900"
          >
            secretariado@ispsongo.ac.mz
          </a>
          {" "}• {isEn ? "Official website:" : "Página oficial:"}{" "}
          <a
            href="https://www.ispsongo.ac.mz"
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 underline font-normal hover:text-blue-900"
          >
            www.ispsongo.ac.mz
          </a>
        </div>
      </div>
      <div className="ml-3 flex-shrink-0">
        <div className="flex items-center justify-center bg-transparent">
          <img
            src={instLogo}
            alt={`Logotipo ${instName || "Instituição"}`}
            className="h-6 sm:h-7 print:h-5 w-auto object-contain filter drop-shadow-sm"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </footer>
  );
}

export default DocumentFooter;

