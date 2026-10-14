import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cpu, Sparkles, Zap, ChevronUp, ChevronDown, RefreshCw, X } from "lucide-react";
import { quantumAI } from "../../lib/quantumAiService";

interface QuantumFloatingOrbProps {
  currentView?: string;
  onOpenCockpit: () => void;
}

export function QuantumFloatingOrb({
  currentView = "Dashboard",
  onOpenCockpit,
}: QuantumFloatingOrbProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [coherence, setCoherence] = useState(99.84);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [quickSuccess, setQuickSuccess] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCoherence(quantumAI.getTelemetry().coherenceRate);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickOptimize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOptimizing(true);
    setQuickSuccess(false);
    try {
      await quantumAI.runQuantumOptimization(currentView);
      setQuickSuccess(true);
      setTimeout(() => setQuickSuccess(false), 3000);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9990] print:hidden font-sans">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            className="mb-2 w-72 rounded-2xl bg-[#050b2c] border border-cyan-500/40 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.8)] text-white space-y-3"
          >
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-400/60 flex items-center justify-center text-cyan-300">
                  <Cpu className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <span className="text-xs font-bold tracking-wide text-cyan-300">
                  IA Quântica SIGDE Ativa
                </span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span>Coerência Vetorial:</span>
                <span className="font-bold text-emerald-400">{coherence}%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Ecrã Atual:</span>
                <span className="font-semibold text-cyan-200 truncate max-w-[130px]">{currentView}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Modo de Execução:</span>
                <span className="text-emerald-400 font-medium">Reativo em Tempo Real</span>
              </div>
            </div>

            {quickSuccess && (
              <div className="p-2 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10.5px] font-medium text-center">
                ✨ Estados Quânticos Otimizados!
              </div>
            )}

            <div className="pt-2 border-t border-white/10 flex gap-2">
              <button
                onClick={handleQuickOptimize}
                disabled={isOptimizing}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isOptimizing ? "animate-spin text-cyan-400" : ""}`} />
                {isOptimizing ? "Ajustando..." : "Otimizar Ecrã"}
              </button>
              <button
                onClick={() => {
                  setIsExpanded(false);
                  onOpenCockpit();
                }}
                className="py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                Abrir Copiloto
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Orb Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (isExpanded) {
            onOpenCockpit();
          } else {
            setIsExpanded(true);
          }
        }}
        className="group relative flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#050b2c] hover:bg-[#07133b] border-2 border-cyan-400/70 shadow-[0_0_20px_rgba(6,182,212,0.4)] text-white cursor-pointer transition-all"
        title="Copiloto de IA Quântica SIGDE"
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>

        <Cpu className="w-4 h-4 text-cyan-300 animate-pulse" />
        <span className="text-xs font-bold text-cyan-200 tracking-tight">
          ⚡ IA Quântica SIGDE
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-emerald-300 font-bold">
          {coherence}%
        </span>
      </motion.button>
    </div>
  );
}
