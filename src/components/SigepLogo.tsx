import React, { useState, useEffect } from "react";
import { firestoreService } from "../lib/firestoreService";
import { removeImageBackground } from "../lib/imageUtils";

interface SigepLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isDark?: boolean;
  animated?: boolean;
  showText?: boolean;
  customLogo?: string | null;
  forceDefault?: boolean;
  instituicaoId?: string | null;
  instituicaoData?: any;
  isSuperBoss?: boolean;
}

export const SigepLogo: React.FC<SigepLogoProps> = ({ 
  className = "", 
  size = "md",
  isDark = true,
  animated = false,
  showText = true,
  customLogo,
  forceDefault = false,
  instituicaoId = null,
  instituicaoData = null,
  isSuperBoss = false
}) => {
  const [activeSystemLogo, setActiveSystemLogo] = useState<string | null>(() => {
    if (customLogo !== undefined) return customLogo;
    if (typeof window !== "undefined") {
      return localStorage.getItem("systemLogo") || "/image.png";
    }
    return "/image.png";
  });

  useEffect(() => {
    firestoreService.getSystemLogoUrl().then((url) => {
      if (url) setActiveSystemLogo(url);
    }).catch(() => {});
  }, []);

  const [customColors, setCustomColors] = useState<any>(() => {
    if (instituicaoData?.logoCustomColors) return instituicaoData.logoCustomColors;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(instituicaoId ? `logoCustomColors_${instituicaoId}` : "logoCustomColors");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const [selectedColorToApply, setSelectedColorToApply] = useState<string | null>(null);

  useEffect(() => {
    if (instituicaoData?.logoCustomColors) {
      setCustomColors(instituicaoData.logoCustomColors);
    }
  }, [instituicaoData]);

  useEffect(() => {
    if (customLogo !== undefined) {
      if (customLogo) {
        removeImageBackground(customLogo).then(setActiveSystemLogo);
      } else {
        setActiveSystemLogo(null);
      }
      return;
    }

    const handleCustomLogoEvent = (e: any) => {
      if (e.detail && e.detail.logo !== undefined) {
        if (e.detail.logo) {
          removeImageBackground(e.detail.logo).then(setActiveSystemLogo);
        } else {
          setActiveSystemLogo(null);
        }
      } else {
        const stored = localStorage.getItem("systemLogo");
        if (stored) {
          removeImageBackground(stored).then(setActiveSystemLogo);
        } else {
          setActiveSystemLogo(null);
        }
      }
    };

    const handleColorUpdate = (e: any) => {
      if (e.detail && e.detail.colors) {
        if (instituicaoId && e.detail.instituicaoId === instituicaoId) {
          setCustomColors(e.detail.colors);
        } else if (!instituicaoId && !e.detail.instituicaoId) {
          setCustomColors(e.detail.colors);
        }
      }
    };

    window.addEventListener("sigep_system_logo_updated", handleCustomLogoEvent);
    window.addEventListener("sigep_logo_colors_updated", handleColorUpdate);

    // Subscrever às configurações globais do sistema SIGEP (Apenas se não for contexto de instituição)
    let unsubscribe: (() => void) | undefined;
    if (!instituicaoId) {
      try {
        unsubscribe = firestoreService.config.subscribe("main_config", (data) => {
          if (data) {
            if (data.systemLogo !== undefined) {
              setActiveSystemLogo(data.systemLogo || null);
            }
            if (data.logoCustomColors) {
              setCustomColors(data.logoCustomColors);
              localStorage.setItem("logoCustomColors", JSON.stringify(data.logoCustomColors));
            }
          }
        });
      } catch (err) {}
    }

    return () => {
      window.removeEventListener("sigep_system_logo_updated", handleCustomLogoEvent);
      window.removeEventListener("sigep_logo_colors_updated", handleColorUpdate);
      if (unsubscribe) unsubscribe();
    };
  }, [customLogo, instituicaoId]);

  const defaultColors = {
    s: "#16a34a",
    i: "#dc2626",
    g: "#050505",
    e: "#f59e0b",
    p: "#f59e0b",
    ribbonOuter: "#dc2626",
    ribbonMid: "#ffffff",
    ribbonInner: "#16a34a",
    trail1: "#4338ca",
    trail2: "#f59e0b",
    towers: ["#151e2f", "#111827", "#0d1322"],
    windows: "#38bdf8"
  };

  const colors = { ...defaultColors, ...customColors };

  const handleApplyColor = async (part: string) => {
    if (!selectedColorToApply) return;

    const newColors = { ...colors };
    const instUpdates: any = {};

    if (part === "left") {
      newColors.s = selectedColorToApply;
      newColors.ribbonInner = selectedColorToApply;
      newColors.towers = [selectedColorToApply, colors.towers[1], colors.towers[2]];
    } else if (part === "center") {
      newColors.i = selectedColorToApply;
      newColors.g = selectedColorToApply;
      newColors.ribbonMid = selectedColorToApply;
      newColors.towers = [colors.towers[0], selectedColorToApply, colors.towers[2]];
    } else if (part === "right") {
      newColors.e = selectedColorToApply;
      newColors.p = selectedColorToApply;
      newColors.ribbonOuter = selectedColorToApply;
      newColors.towers = [colors.towers[0], colors.towers[1], selectedColorToApply];
    } else if (part === "header") {
      instUpdates.primaryColor = selectedColorToApply;
      instUpdates.headerColor = selectedColorToApply;
    } else if (part === "sidebar") {
      instUpdates.secondaryColor = selectedColorToApply;
      instUpdates.sidebarColor = selectedColorToApply;
    } else if (part === "footer") {
      instUpdates.accentColor = selectedColorToApply;
      instUpdates.footerColor = selectedColorToApply;
    }

    setCustomColors(newColors);
    const storageKey = instituicaoId ? `logoCustomColors_${instituicaoId}` : "logoCustomColors";
    localStorage.setItem(storageKey, JSON.stringify(newColors));
    setSelectedColorToApply(null);

    // Persistir no Firestore
    try {
      if (instituicaoId) {
        // Se for uma instituição, atualizar o documento da instituição
        await firestoreService.instituicoes.update(instituicaoId, {
          logoCustomColors: newColors,
          ...instUpdates
        });
        window.dispatchEvent(new CustomEvent("sigep_logo_colors_updated", { 
          detail: { colors: newColors, instituicaoId } 
        }));
        window.dispatchEvent(new CustomEvent("sigep_estrutura_updated"));
        window.dispatchEvent(new CustomEvent("instituicao_updated"));
      } else {
        // Se não houver instituição (contexto global), salvar no main_config
        await firestoreService.config.set("main_config", {
          logoCustomColors: newColors
        });
        window.dispatchEvent(new CustomEvent("sigep_logo_colors_updated", { detail: { colors: newColors } }));
      }
    } catch (err) {
      console.error("Erro ao salvar cores:", err);
    }
  };

  // Cores únicas existentes no logotipo para a paleta
  const existingColors = Array.from(new Set([
    "#16a34a", "#dc2626", "#050505", "#f59e0b", "#ffffff", "#4338ca", "#38bdf8", "#070e24", "#151e2f"
  ]));

  const dimensions = {
    xs: "w-8 h-8",
    sm: "w-14 h-14",
    md: "w-24 h-24",
    lg: "w-36 h-36",
    xl: "w-56 h-56",
  }[size] || "w-24 h-24";

  // Se houver logotipo personalizado do SIGEP ativo e não for forçado o padrão original ou isSuperBoss
  if (!forceDefault && !isSuperBoss && activeSystemLogo) {
    return (
      <div 
        className={`relative inline-flex items-center justify-center text-center select-none ${dimensions} ${className} ${animated ? "transition-transform duration-300 hover:scale-105" : ""}`}
        title="SIGEP — Sistema Integrado de Gestão e Planeamento"
      >
        <img
          src={activeSystemLogo}
          alt="Logotipo Oficial do Sistema SIGEP"
          className="max-h-full max-w-full object-contain drop-shadow-sm rounded-xl mx-auto my-auto block"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div 
      className={`relative inline-flex flex-col items-center justify-center select-none ${className} ${animated ? "transition-transform duration-300 hover:scale-105" : ""}`}
      title="SIGEP — Sistema Integrado de Gestão e Planeamento"
    >
      <div className={`relative ${dimensions}`}>
      <svg 
        viewBox="0 0 500 500" 
        className="w-full h-full drop-shadow-md overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Background Gradient */}
          <linearGradient id="sigepCompBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#070e24" />
            <stop offset="50%" stopColor="#0a1435" />
            <stop offset="100%" stopColor="#050a1a" />
          </linearGradient>

          {/* Subtle circuit/vertical texture */}
          <pattern id="sigepCompGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="20" stroke="#1e293b" strokeWidth="0.75" strokeOpacity="0.35" />
            <circle cx="10" cy="10" r="0.8" fill="#38bdf8" fillOpacity="0.25" />
          </pattern>

          {/* Drop shadow for G badge */}
          <filter id="sigepCardShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.45" />
          </filter>

          {/* Glow filter */}
          <filter id="sigepSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Card Background (if isDark) */}
        {isDark ? (
          <>
            <rect width="500" height="500" rx="38" fill="url(#sigepCompBg)" stroke="#1e293b" strokeWidth="2" />
            <rect width="500" height="500" rx="38" fill="url(#sigepCompGrid)" />
          </>
        ) : (
          <rect width="500" height="500" rx="38" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
        )}

        {/* TOP GRAPHIC: BUILDINGS & SPEED RIBBON */}
        <g id="graphic-group" transform={showText ? "translate(0, 0)" : "translate(0, 50) scale(1.18) translate(-40, -40)"}>
          {/* 3 BUILDINGS */}
          <g id="buildings">
            {/* Tower 1 (Left - Shortest) */}
            <polygon points="145,175 175,166 175,255 145,255" fill={colors.towers[0]} stroke="#1e2d4a" strokeWidth="1.5" />
            <line x1="147" y1="175" x2="147" y2="253" stroke="#2c3e66" strokeWidth="1.2" />
            <rect x="151" y="195" width="6" height="2" rx="0.5" fill={colors.windows} opacity="0.85" />
            <rect x="163" y="215" width="6" height="2" rx="0.5" fill={colors.windows} opacity="0.85" />
            <rect x="151" y="235" width="6" height="2" rx="0.5" fill={colors.windows} opacity="0.75" />

            {/* Tower 2 (Middle) */}
            <polygon points="185,128 218,118 218,255 185,255" fill={colors.towers[1]} stroke="#1f293d" strokeWidth="1.5" />
            <line x1="187" y1="128" x2="187" y2="253" stroke="#24324f" strokeWidth="1.2" />
            <rect x="191" y="145" width="7" height="2.2" rx="0.5" fill={colors.windows} opacity="0.85" />
            <rect x="204" y="168" width="7" height="2.2" rx="0.5" fill={colors.windows} opacity="0.85" />
            <rect x="191" y="192" width="7" height="2.2" rx="0.5" fill={colors.windows} opacity="0.8" />
            <rect x="204" y="218" width="7" height="2.2" rx="0.5" fill={colors.windows} opacity="0.75" />

            {/* Tower 3 (Right - Tallest) */}
            <polygon points="228,76 262,64 262,255 228,255" fill={colors.towers[2]} stroke="#1b2438" strokeWidth="1.5" />
            <line x1="230" y1="76" x2="230" y2="253" stroke="#23324e" strokeWidth="1.2" />
            <rect x="234" y="98" width="7" height="2.2" rx="0.5" fill={colors.windows} opacity="0.85" />
            <rect x="247" y="125" width="7" height="2.2" rx="0.5" fill={colors.windows} opacity="0.85" />
            <rect x="234" y="152" width="7" height="2.2" rx="0.5" fill={colors.windows} opacity="0.8" />
            <rect x="247" y="180" width="7" height="2.2" rx="0.5" fill={colors.windows} opacity="0.75" />
            <rect x="234" y="210" width="7" height="2.2" rx="0.5" fill={colors.windows} opacity="0.7" />
          </g>

          {/* DYNAMIC SWOOSH / ORBITAL SPEED RIBBON */}
          <g id="swoosh" filter="url(#sigepSoftGlow)">
            {/* Outer Red Ribbon */}
            <path 
              d="M 270 85 C 385 82, 452 135, 442 205 C 432 270, 360 306, 260 310 C 180 314, 120 307, 85 298 C 160 318, 270 318, 350 292 C 415 258, 436 195, 395 130 C 362 82, 290 84, 270 85 Z"
              fill={colors.ribbonOuter} 
            />

            {/* Middle White Ribbon */}
            <path 
              d="M 266 96 C 365 96, 426 142, 418 205 C 410 260, 342 294, 248 297 C 175 300, 115 292, 92 286 C 155 299, 252 299, 325 277 C 385 248, 404 195, 368 140 C 340 102, 282 96, 266 96 Z"
              fill={colors.ribbonMid} 
            />

            {/* Inner Green Ribbon */}
            <path 
              d="M 264 108 C 345 110, 400 150, 392 204 C 385 250, 322 282, 235 284 C 170 286, 115 280, 102 275 C 150 286, 240 285, 305 264 C 360 236, 375 190, 342 146 C 318 116, 276 108, 264 108 Z"
              fill={colors.ribbonInner} 
            />

            {/* Violet speed trail */}
            <path 
              d="M 125 284 C 180 291, 260 290, 320 274 C 265 283, 195 284, 138 280 Z"
              fill={colors.trail1} 
              opacity="0.9" 
            />

            {/* Golden Amber speed trail */}
            <path 
              d="M 105 292 C 165 301, 250 301, 310 285 C 255 294, 180 294, 118 287 Z"
              fill={colors.trail2} 
              opacity="0.95" 
            />

            {/* White fine tip */}
            <path 
              d="M 90 295 C 150 305, 230 305, 290 293 C 235 300, 160 300, 100 292 Z"
              fill="#ffffff" 
              opacity="0.85" 
            />
          </g>
        </g>

        {/* BOTTOM TYPOGRAPHY: SIGEP */}
        {showText && (
          <g id="sigep-letters" transform="translate(0, 30)">
            {/* S (Green) */}
            <text 
              x="115" 
              y="420" 
              fontFamily="'Bookman Old Style', 'Bookman', Georgia, serif" 
              fontSize="82" 
              fontWeight="900" 
              fill={colors.s} 
              textAnchor="middle"
            >
              S
            </text>

            {/* I (Red) */}
            <text 
              x="165" 
              y="420" 
              fontFamily="'Bookman Old Style', 'Bookman', Georgia, serif" 
              fontSize="82" 
              fontWeight="900" 
              fill={colors.i} 
              textAnchor="middle"
            >
              I
            </text>

            {/* G Container (White rounded card with shadow) */}
            <rect 
              x="195" 
              y="348" 
              width="82" 
              height="88" 
              rx="16" 
              fill="#ffffff" 
              filter="url(#sigepCardShadow)" 
            />

            {/* G (Black) inside White Card */}
            <text 
              x="236" 
              y="418" 
              fontFamily="'Bookman Old Style', 'Bookman', Georgia, serif" 
              fontSize="78" 
              fontWeight="900" 
              fill={colors.g} 
              textAnchor="middle"
            >
              G
            </text>

            {/* E (Golden Amber) */}
            <text 
              x="315" 
              y="420" 
              fontFamily="'Bookman Old Style', 'Bookman', Georgia, serif" 
              fontSize="82" 
              fontWeight="900" 
              fill={colors.e} 
              textAnchor="middle"
            >
              E
            </text>

            {/* P (Golden Amber) */}
            <text 
              x="375" 
              y="420" 
              fontFamily="'Bookman Old Style', 'Bookman', Georgia, serif" 
              fontSize="82" 
              fontWeight="900" 
              fill={colors.p} 
              textAnchor="middle"
            >
              P
            </text>
          </g>
        )}
      </svg>
      </div>

      {/* Color Customization Palette - Shown for large logos (like in admin login) */}
      {size === "xl" && (
        <div className="mt-8 flex flex-col items-center gap-4 bg-black/40 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
          <div className="flex gap-2">
            {existingColors.map((c, i) => (
              <button
                key={i}
                onClick={() => setSelectedColorToApply(c)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColorToApply === c ? "border-white scale-125 shadow-[0_0_10px_white]" : "border-transparent hover:scale-110"}`}
                style={{ backgroundColor: c }}
                title={`Cor: ${c}`}
              />
            ))}
          </div>

          {selectedColorToApply && (
            <div className="flex flex-wrap justify-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <button 
                onClick={() => handleApplyColor("left")}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/20 transition-all"
              >
                Aplicar Lado Esquerdo
              </button>
              <button 
                onClick={() => handleApplyColor("center")}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/20 transition-all"
              >
                Aplicar ao Centro
              </button>
              <button 
                onClick={() => handleApplyColor("right")}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/20 transition-all"
              >
                Aplicar Lado Direito
              </button>

              {/* Novos botões de personalização do sistema */}
              <button 
                onClick={() => handleApplyColor("header")}
                className="px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/30 transition-all"
              >
                Aplicar ao Cabeçalho
              </button>
              <button 
                onClick={() => handleApplyColor("sidebar")}
                className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 text-[10px] font-black uppercase tracking-widest rounded-full border border-purple-500/30 transition-all"
              >
                Aplicar à Lateral
              </button>
              <button 
                onClick={() => handleApplyColor("footer")}
                className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-200 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/30 transition-all"
              >
                Aplicar ao Rodapé
              </button>

              <button 
                onClick={() => setSelectedColorToApply(null)}
                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-200 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-500/30 transition-all"
              >
                Cancelar
              </button>
            </div>
          )}
          
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            Personalizar Cores do Logotipo
          </p>
        </div>
      )}
    </div>
  );
};

export default SigepLogo;
