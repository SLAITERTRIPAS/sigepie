import React, { useState, useEffect, useRef } from "react";
import { Search, X, User, FileText, Activity, Building2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GlobalSearchProps {
  colaboradores: any[];
  processos: any[];
  matrixActivities: any[];
  instituicoes: any[];
}

export default function GlobalSearch({
  colaboradores = [],
  processos = [],
  matrixActivities = [],
  instituicoes = [],
}: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<{
    colaboradores: any[];
    processos: any[];
    activities: any[];
    instituicoes: any[];
  }>({
    colaboradores: [],
    processos: [],
    activities: [],
    instituicoes: [],
  });

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ colaboradores: [], processos: [], activities: [], instituicoes: [] });
      return;
    }

    const q = query.toLowerCase();

    const filteredColabs = colaboradores.filter(c => 
      (c.name || "").toLowerCase().includes(q) || 
      (c.nuit || "").toLowerCase().includes(q) ||
      (c.id || "").toLowerCase().includes(q)
    ).slice(0, 5);

    const filteredProcessos = processos.filter(p => 
      (p.title || p.assunto || "").toLowerCase().includes(q) || 
      (p.nrProcesso || "").toLowerCase().includes(q)
    ).slice(0, 5);

    const filteredActivities = matrixActivities.filter(a => 
      (a.title || "").toLowerCase().includes(q) || 
      (a.description || "").toLowerCase().includes(q)
    ).slice(0, 5);

    const filteredInsts = instituicoes.filter(i => 
      (i.nome || i.name || "").toLowerCase().includes(q) || 
      (i.sigla || "").toLowerCase().includes(q)
    ).slice(0, 5);

    setResults({
      colaboradores: filteredColabs,
      processos: filteredProcessos,
      activities: filteredActivities,
      instituicoes: filteredInsts
    });
  }, [query, colaboradores, processos, matrixActivities, instituicoes]);

  const hasResults = results.colaboradores.length > 0 || 
                    results.processos.length > 0 || 
                    results.activities.length > 0 || 
                    results.instituicoes.length > 0;

  const handleNavigate = (type: string, item: any) => {
    setQuery("");
    setIsOpen(false);
    
    // Custom events for navigation across the app
    if (type === "colaborador") {
      window.dispatchEvent(new CustomEvent("open_view", { 
        detail: { 
          view: "dashboard", 
          title: "Gestão de Pessoal",
          activeItem: "Gestão de Pessoal" 
        } 
      }));
    } else if (type === "processo") {
      window.dispatchEvent(new CustomEvent("open_view", { 
        detail: { 
          view: "dashboard", 
          title: "Gestão de Documentos",
          activeItem: "Gestão de Documentos" 
        } 
      }));
    } else if (type === "activity") {
      window.dispatchEvent(new CustomEvent("open_view", { 
        detail: { 
          view: "dashboard", 
          title: "Matriz de Actividades",
          activeItem: "Matriz de Actividades" 
        } 
      }));
    } else if (type === "instituicao") {
      // Se for admin geral, pode querer mudar de instituição
      window.dispatchEvent(new CustomEvent("open_view", { 
        detail: { 
          view: "dashboard", 
          title: "Sistema",
          activeItem: "Visão Geral" 
        } 
      }));
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <div className="absolute left-3 text-white/50 pointer-events-none">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Pesquisar em todo o SIGEP..."
          className="w-full bg-white/10 border-2 border-white/20 rounded-2xl py-2 pl-10 pr-10 text-xs text-white placeholder:text-white/40 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all font-bold"
        />
        {query && (
          <button 
            onClick={() => setQuery("")}
            className="absolute right-3 text-white/50 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.trim().length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 w-full bg-white rounded-3xl shadow-2xl border-2 border-slate-900 overflow-hidden z-[100] max-h-[70vh] overflow-y-auto"
          >
            {!hasResults ? (
              <div className="p-8 text-center">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Nenhum resultado encontrado</p>
                <p className="text-slate-300 text-[10px] mt-1">Tente pesquisar com outros termos</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {/* Colaboradores */}
                {results.colaboradores.length > 0 && (
                  <div className="p-2 border-b border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Colaboradores</span>
                    {results.colaboradores.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleNavigate("colaborador", c)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-blue-50 rounded-xl transition-all group text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                          <User size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{c.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{c.cargo || c.categoria || "Colaborador"}</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Processos */}
                {results.processos.length > 0 && (
                  <div className="p-2 border-b border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Processos</span>
                    {results.processos.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleNavigate("processo", p)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-emerald-50 rounded-xl transition-all group text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <FileText size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{p.title || p.assunto}</p>
                          <p className="text-[10px] text-slate-400 truncate">{p.nrProcesso || "Sem número"}</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Atividades */}
                {results.activities.length > 0 && (
                  <div className="p-2 border-b border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Atividades</span>
                    {results.activities.map(a => (
                      <button
                        key={a.id}
                        onClick={() => handleNavigate("activity", a)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-amber-50 rounded-xl transition-all group text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                          <Activity size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{a.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{a.sector || "Geral"}</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-amber-500" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Instituições */}
                {results.instituicoes.length > 0 && (
                  <div className="p-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Instituições</span>
                    {results.instituicoes.map(i => (
                      <button
                        key={i.id}
                        onClick={() => handleNavigate("instituicao", i)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-purple-50 rounded-xl transition-all group text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                          <Building2 size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{i.nome || i.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{i.sigla || "Instituição"}</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-purple-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
