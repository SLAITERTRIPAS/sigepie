import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, CheckCircle2, ShieldCheck, User, Building, Briefcase, Calendar, Sparkles } from "lucide-react";
import { isSuperBossUser } from "../lib/auth";
import { getActiveInstitutionLogo, getActiveInstitutionName, getActiveProvinceName } from "../lib/documentLogoUtils";

interface LoginSplashSequenceProps {
  user: any;
  instituicao?: any;
  onComplete: () => void;
}

export const LoginSplashSequence: React.FC<LoginSplashSequenceProps> = ({
  user,
  instituicao,
  onComplete,
}) => {
  // 3 Páginas solicitadas:
  // Página 1: Apresentação do SIGEP
  // Página 2: Logótipo da Instituição do Utilizador Logado
  // Página 3: Notas de Boas-Vindas com Nome do Colaborador, Cargo e por baixo o Ano Atual
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState(0);

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const isSuperAdmin = useMemo(() => {
    return isSuperBossUser(user) || user?.isOwner || user?.role === "Proprietário" || user?.role === "Administrador do Sistema";
  }, [user]);

  const realUserName = useMemo(() => {
    const raw =
      user?.nomeReal ||
      user?.nomeCompleto ||
      user?.nome ||
      user?.name ||
      user?.displayName;

    if (raw && String(raw).toLowerCase().trim() !== "novo utilizador") {
      return String(raw).trim();
    }
    if (isSuperAdmin || (user?.email && user.email.toLowerCase().trim() === "slaitertripas@gmail.com")) {
      return "Slaiter Tripas";
    }
    return user?.email ? user.email.split("@")[0] : "Colaborador Institucional";
  }, [user, isSuperAdmin]);

  const realUserCargo = useMemo(() => {
    return (
      user?.cargoChefia ||
      user?.cargo ||
      user?.funcao ||
      user?.title ||
      user?.categoria ||
      (isSuperAdmin ? "Programador e Desenvolvedor do SIGEP" : "Técnico Superior / Funcionário")
    );
  }, [user, isSuperAdmin]);

  const realUserSetor = useMemo(() => {
    return (
      user?.departamento ||
      user?.setor ||
      user?.direcao ||
      user?.unidadeOrganica ||
      "Setor Institucional"
    );
  }, [user]);

  const instNome = useMemo(() => {
    return getActiveInstitutionName(instituicao, user);
  }, [instituicao, user]);

  const instProvincia = useMemo(() => {
    return getActiveProvinceName(instituicao, user);
  }, [instituicao, user]);

  const instLogoUrl = useMemo(() => {
    return getActiveInstitutionLogo(instituicao, user);
  }, [instituicao, user]);

  // Temporizador total de 6.6 segundos (2.2s por página)
  useEffect(() => {
    const totalDuration = 6600;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentPct = Math.min(100, Math.floor((elapsed / totalDuration) * 100));
      setProgress(currentPct);

      if (elapsed < 2200) {
        setStep(1);
      } else if (elapsed < 4400) {
        setStep(2);
      } else {
        setStep(3);
      }

      if (elapsed >= totalDuration) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 150);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999999] bg-gradient-to-br from-slate-900 via-[#0a1128] to-[#040817] text-white flex flex-col items-center justify-center p-4 sm:p-8 select-none overflow-hidden font-sans">
      {/* Botão de Avanço Imediato */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer backdrop-blur-md border border-white/20 shadow-lg"
        title="Avançar diretamente para o sistema"
      >
        <span>{step === 3 ? "Entrar no Sistema" : "Avançar"}</span>
        <ArrowRight size={14} />
      </button>

      {/* Conteúdo Principal dos Passos */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[460px] relative">
        <AnimatePresence mode="wait">
          {/* ======================================================== */}
          {/* PÁGINA 1: APRESENTAÇÃO DO SIGEP                          */}
          {/* ======================================================== */}
          {step === 1 && (
            <motion.div
              key="step-1-sigep"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -15 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="flex flex-col items-center justify-center text-center w-full px-4"
            >
              {/* Emblema do SIGEP */}
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-white/10 border-2 border-blue-400/30 p-5 flex items-center justify-center backdrop-blur-xl shadow-[0_0_50px_rgba(59,130,246,0.3)] mb-6">
                <img
                  src="/sigep-logo.svg"
                  alt="SIGEP"
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/isps-logo.svg";
                  }}
                />
              </div>

              {/* Título de Apresentação */}
              <div className="inline-block px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-widest mb-3">
                Plataforma Governamental & Institucional
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-md">
                S I G E P
              </h1>
              <p className="text-sm sm:text-lg text-blue-200/90 font-medium max-w-2xl mt-2 leading-relaxed">
                Sistema Integrado de Gestão de Processos, Planificação Estratégica e Recursos Humanos
              </p>

              {/* Anel de sincronização */}
              <div className="mt-8 flex items-center gap-3 text-xs text-blue-300/80 font-bold tracking-widest uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                A inicializar módulos institucionais...
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* PÁGINA 2: LOGÓTIPO DA INSTITUIÇÃO DO UTILIZADOR LOGADO   */}
          {/* ======================================================== */}
          {step === 2 && (
            <motion.div
              key="step-2-instituicao"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -15 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="flex flex-col items-center justify-center text-center w-full px-4"
            >
              {/* Moldura com o logótipo da instituição */}
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-white p-5 border-4 border-blue-500/40 shadow-[0_0_60px_rgba(59,130,246,0.35)] flex items-center justify-center mb-6">
                <img
                  src={instLogoUrl}
                  alt={instNome}
                  className="w-full h-full object-contain filter drop-shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/sigep-logo.svg";
                  }}
                />
              </div>

              <div className="inline-block px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-2">
                Instituição Conectada
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white max-w-3xl leading-tight">
                {instNome}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-semibold mt-2">
                {instProvincia} — República de Moçambique
              </p>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* PÁGINA 3: BOAS-VINDAS: NOME DO COLABORADOR, CARGO E ANO  */}
          {/* ======================================================== */}
          {step === 3 && (
            <motion.div
              key="step-3-usuario"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -15 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="flex flex-col items-center justify-center text-center w-full max-w-2xl px-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white mb-4 shadow-xl">
                <Sparkles size={32} />
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Bem-vindo ao SIGEP
              </h1>

              {/* Cartão de Identificação do Colaborador */}
              <div className="w-full mt-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-left shadow-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/20 text-blue-300 rounded-xl shrink-0 mt-1 border border-blue-400/20">
                    <User size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest block">
                      Colaborador Logado
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white truncate">
                      {realUserName}
                    </h3>
                    
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Cargo / Função
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-emerald-300">
                          {realUserCargo}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Setor / Afetação
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-slate-200">
                          {realUserSetor}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ano Atual por Baixo */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Calendar size={16} />
                    <span>Exercício Económico & Planificação:</span>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 font-black text-sm">
                    Ano {currentYear}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Barra de Progresso e Paginação Inferior */}
      <div className="w-full max-w-md mt-6 flex flex-col items-center gap-3">
        {/* Barra de Progresso */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400"
            style={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
        </div>

        {/* Indicadores de Página (1, 2, 3) Clicáveis */}
        <div className="flex items-center gap-3 mt-2">
          {[
            { id: 1, label: "Pág 1: SIGEP" },
            { id: 2, label: "Pág 2: Instituição" },
            { id: 3, label: "Pág 3: Boas-Vindas" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStep(item.id as 1 | 2 | 3)}
              className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all cursor-pointer ${
                step === item.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginSplashSequence;
