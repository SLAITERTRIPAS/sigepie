import React from "react";
import { Building2, Layers, Network, ChevronRight, MapPin, Shield } from "lucide-react";
import { getActiveInstituicao } from "../lib/instituicaoEstruturaService";

export interface InstitutionalSectorHeaderProps {
  instituicao?: any;
  unidadeOrganica?: string;
  direcao?: string;
  departamento?: string;
  reparticao?: string;
  setor?: string;
  currentTitle?: string;
  variant?: "banner" | "card" | "compact" | "document";
  onNavigateLevel?: (level: "instituicao" | "unidade" | "direcao" | "departamento" | "reparticao" | "setor", value: string) => void;
  className?: string;
}

export const InstitutionalSectorHeader: React.FC<InstitutionalSectorHeaderProps> = ({
  instituicao: propInstituicao,
  unidadeOrganica,
  direcao,
  departamento,
  reparticao,
  setor,
  currentTitle,
  variant = "banner",
  onNavigateLevel,
  className = "",
}) => {
  const activeInst = propInstituicao || getActiveInstituicao();
  const instNome = activeInst?.nome || "INSTITUIÇÃO PÚBLICA";
  const instLogo = activeInst?.logo;
  const instProvincia = activeInst?.provincia || "";
  const instDistrito = activeInst?.distrito || "";
  const primaryColor = activeInst?.primaryColor || "#050b38";
  const accentColor = activeInst?.accentColor || "#FFB800";

  // Identificar níveis preenchidos
  const niveis = [
    { key: "unidade" as const, label: "Unidade Orgânica", val: unidadeOrganica },
    { key: "direcao" as const, label: "Direção", val: direcao },
    { key: "departamento" as const, label: "Departamento", val: departamento },
    { key: "reparticao" as const, label: "Repartição", val: reparticao },
    { key: "setor" as const, label: "Setor", val: setor },
  ].filter((n) => Boolean(n.val && n.val.trim()));

  if (variant === "compact") {
    return (
      <div className={`bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
            {instLogo ? (
              <img
                src={instLogo}
                alt={`Logotipo da ${instNome}`}
                className="w-full h-full object-contain filter drop-shadow-2xs"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Building2 size={20} className="text-slate-600" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 truncate">
              Instituição: {instNome}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold text-slate-800">
              {niveis.map((n, i) => (
                <React.Fragment key={n.key}>
                  {i > 0 && <ChevronRight size={12} className="text-slate-400 shrink-0" />}
                  <span
                    onClick={() => onNavigateLevel?.(n.key, n.val!)}
                    className={onNavigateLevel ? "hover:text-blue-700 hover:underline cursor-pointer" : ""}
                    title={`${n.label}: ${n.val}`}
                  >
                    {n.val}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-900 via-[#071330] to-slate-900 text-white shadow-md overflow-hidden relative ${className}`}
    >
      {/* Faixa decorativa com as cores institucionais */}
      <div
        className="h-1.5 w-full"
        style={{
          background: `linear-gradient(90deg, ${primaryColor} 0%, ${accentColor} 50%, ${primaryColor} 100%)`,
        }}
      />

      <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Esquerda: Logotipo Institucional e Nome da Instituição */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/95 p-1.5 flex items-center justify-center shrink-0 shadow-lg border-2 border-white/20">
            {instLogo ? (
              <img
                src={instLogo}
                alt={`Logotipo da ${instNome}`}
                className="w-full h-full object-contain filter drop-shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-blue-950 flex flex-col items-center justify-center text-white p-1 text-center">
                <Building2 size={24} className="text-amber-400 mb-0.5" />
                <span className="text-[8px] font-black uppercase tracking-tighter line-clamp-1">
                  {activeInst?.sigla || "INST"}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-amber-400 uppercase font-black px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                Identidade Institucional
              </span>
              {(instProvincia || instDistrito) && (
                <span className="text-[10px] text-slate-300 flex items-center gap-1 font-bold">
                  <MapPin size={11} className="text-amber-400" />
                  {instDistrito ? `${instDistrito}, ` : ""}{instProvincia}
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-lg md:text-xl font-serif font-black tracking-wide text-white leading-tight uppercase mt-1">
              {instNome}
            </h2>

            <p className="text-[11px] text-blue-200/90 font-medium">
              Plataforma Institucional Integrada &bull; Estrutura Setorial
            </p>
          </div>
        </div>

        {/* Direita: Distinção Clara e Título do Setor Ativo */}
        {currentTitle && (
          <div className="self-stretch md:self-auto flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-5 shrink-0">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">Setor em Operação</span>
            <span className="text-xs sm:text-sm font-black text-amber-400 font-sans tracking-wide">
              {currentTitle}
            </span>
          </div>
        )}
      </div>

      {/* Trilho Hierárquico dos Setores: Unidade Orgânica > Direção > Departamento > Repartição */}
      <div className="bg-black/30 border-t border-white/10 px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Layers size={12} className="text-amber-400" />
          Hierarquia Institucional:
        </span>

        {niveis.length === 0 ? (
          <span className="text-slate-400 text-xs italic">
            Navegando pela estrutura geral da instituição
          </span>
        ) : (
          niveis.map((n, idx) => (
            <React.Fragment key={n.key}>
              {idx > 0 && (
                <ChevronRight size={13} className="text-slate-500 shrink-0" />
              )}
              <div
                onClick={() => onNavigateLevel?.(n.key, n.val!)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                  onNavigateLevel
                    ? "hover:bg-white/15 cursor-pointer"
                    : ""
                } ${
                  idx === niveis.length - 1
                    ? "bg-amber-400/20 text-amber-300 font-black border border-amber-400/30"
                    : "bg-white/5 text-slate-200 font-semibold"
                }`}
                title={`${n.label}: ${n.val}`}
              >
                <span className="text-[9px] font-mono text-slate-400 uppercase">{n.label}:</span>
                <span className="truncate max-w-[200px] sm:max-w-xs">{n.val}</span>
              </div>
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
};

export default InstitutionalSectorHeader;
