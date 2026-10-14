import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Database,
  Lock,
  Cpu,
  LogIn,
  Globe,
  FolderArchive,
  BarChart3,
  Layers,
  FileCheck2,
  Users2,
  Building,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause
} from "lucide-react";
import SigepLogo from "./SigepLogo";
import { getSystemLogo } from "../lib/logoService";
import { firestoreService } from "../lib/firestoreService";

interface SystemPresentationProps {
  onContinue: () => void;
}

interface SlideItem {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  accentColor: string;
  metrics: { label: string; value: string; desc: string }[];
  highlights: string[];
}

const SLIDES: SlideItem[] = [
  {
    id: 1,
    badge: "PLANIFICAÇÃO E MONITORIAS",
    title: "Planificação & Monitorias",
    subtitle: "Planeamento institucional, acompanhamento das actividades e avaliação contínua dos resultados.",
    description: "Conexão em tempo real de todas as Direções, Departamentos, Repartições e Setores. Eliminação de silos e conformidade administrativa integral.",
    icon: Building,
    accentColor: "blue",
    metrics: [
      { label: "PLANOS DE ACTIVIDADES", value: "Anual / Trimestral", desc: "Metas e actividades por unidade" },
      { label: "MONITORIA", value: "Em tempo real", desc: "Acompanhamento da execução" },
      { label: "AVALIAÇÃO", value: "Indicadores", desc: "Resultados e desempenho institucional" },
    ],
    highlights: [
      "Elaboração e aprovação dos planos de actividades",
      "Monitoria periódica das metas por departamento e sector",
      "Relatórios de progresso, desvios e medidas correctivas"
    ]
  },
  {
    id: 2,
    badge: "Governança & Integração Institucional",
    title: "SIGEP • Sistema Integrado de Gestão",
    subtitle: "Plataforma Centralizada de Processos, Recursos e Decisão Estratégica",
    description: "Conexão em tempo real de todas as Direções, Departamentos, Repartições e Setores.",
    icon: Building,
    accentColor: "blue",
    metrics: [
      { label: "Módulos Integrados", value: "9", desc: "Blocos de Operação" },
      { label: "Sincronização", value: "100%", desc: "Em tempo real" },
      { label: "Governança", value: "ISO", desc: "Conformidade Normativa" },
    ],
    highlights: [
      "Gabinete do Diretor-Geral e Órgãos de Gestão",
      "Hierarquia unificada por Setores e Repartições",
      "Auditoria transparente de todos os atos administrativos"
    ]
  },
  {
    id: 3,
    badge: "Planificação Estratégica & Orçamento",
    title: "PESOE & Matriz de Ação Orçamental",
    subtitle: "Controlo Rigoroso de Dotações, Rúbricas SISTAFE e Atividades Setoriais",
    description: "Cada departamento e setor gere as suas atividades de forma isolada e soberana.",
    icon: BarChart3,
    accentColor: "emerald",
    metrics: [
      { label: "Isolamento Setorial", value: "100%", desc: "Por Departamento/Setor" },
      { label: "Rubricas Oficiais", value: "36", desc: "SISTAFE Moçambique" },
      { label: "Controlo de Tetos", value: "Ativo", desc: "Execução vs Dotação" },
    ],
    highlights: [
      "Cálculo exclusivo de rubricas por unidade selecionada",
      "Gestão de Ajudas de Custo, Bens e Serviços e Remunerações",
      "Tramitação oficial de aprovação e publicação DPEP"
    ]
  },
  {
    id: 4,
    badge: "Recursos Humanos & Gestão de Pessoal",
    title: "Processo Individual & Carreira Técnica",
    subtitle: "Dossiê Digital Completo do Servidor, Assiduidade e Alocação",
    description: "Gestão completa do corpo docente, corpo técnico-administrativo e colaboradores contratados.",
    icon: Users2,
    accentColor: "indigo",
    metrics: [
      { label: "Quadro Efetivo", value: "Central", desc: "Base de Dados Única" },
      { label: "Processos Digitais", value: "100%", desc: "Histórico Individual" },
      { label: "Alocação Setorial", value: "Estrita", desc: "Sem Chefias Duplicadas" },
    ],
    highlights: [
      "Alocação precisa de colaboradores por setor",
      "Nomeação e manutenção manual de chefias autorizadas",
      "Conta técnica do desenvolvedor desacoplada do efetivo"
    ]
  },
  {
    id: 5,
    badge: "Aquisições Públicas & Património",
    title: "UGEA & Gestão de Suprimentos",
    subtitle: "Contratação Pública, Catálogo de Preços e Tramitação Segura",
    description: "Gestão transparente do Plano de Procurement, qualificação de fornecedores e registo de bens.",
    icon: Layers,
    accentColor: "amber",
    metrics: [
      { label: "Contratação", value: "UGEA", desc: "Regime Jurídico Oficial" },
      { label: "Catálogo Mestre", value: "Ativo", desc: "Preços de Referência" },
      { label: "Inventário Patrimonial", value: "Móvel/Fixo", desc: "Controle de Frotas e Bens" },
    ],
    highlights: [
      "Isolamento integral da Ação Orçamental da UGEA",
      "Ajudas de Custo calculadas com exatidão setorial",
      "Tramitação de pareceres e despachos em fluxo digital"
    ]
  }
];

export default function SystemPresentation({ onContinue }: SystemPresentationProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [time, setTime] = useState<Date>(new Date());
  const [systemLogo, setSystemLogo] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("systemLogo") || getSystemLogo() || "/image.png";
    }
    return "/image.png";
  });

  useEffect(() => {
    firestoreService.getSystemLogoUrl().then((url) => {
      if (url) setSystemLogo(url);
    }).catch(() => {});
  }, []);
  const [isPlaying, setIsPlaying] = useState(true);

  // Relógio do sistema
  useEffect(() => {
    const clockTimer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Transição automática a cada 4 segundos (4000ms)
  useEffect(() => {
    if (!isPlaying) return;
    const slideTimer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(slideTimer);
  }, [isPlaying]);

  // Sincronização de logotipo
  useEffect(() => {
    const handleLogoUpdate = (e: any) => {
      setSystemLogo(e?.detail?.logo !== undefined ? e.detail.logo : getSystemLogo());
    };
    window.addEventListener("sigep_system_logo_updated", handleLogoUpdate);

    let unsub: (() => void) | undefined;
    try {
      unsub = firestoreService.config.subscribe("main_config", (data) => {
        if (data && data.systemLogo !== undefined) {
          setSystemLogo(data.systemLogo || null);
        }
      });
    } catch (_) {}

    return () => {
      window.removeEventListener("sigep_system_logo_updated", handleLogoUpdate);
      if (unsub) unsub();
    };
  }, []);

  const slide = SLIDES[currentSlideIndex];
  const SlideIcon = slide.icon;

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  return (
    <div
      id="sigep-cover-fixed"
      className="fixed inset-0 w-full h-full min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans select-none overflow-hidden"
    >
      {/* Barra de Topo Limpa e Moderna */}
      <header className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-slate-200 bg-white shadow-xs z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-100 rounded-xl p-1 overflow-hidden border border-slate-200">
            {systemLogo ? (
              <img
                src={systemLogo}
                alt="Logotipo SIGEP"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <SigepLogo size="sm" showText={false} animated={false} />
            )}
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 tracking-tight leading-tight">
              SIGEP Moçambique
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">
              Apresentação Institucional de Sistemas
            </p>
          </div>
        </div>

        {/* Relógio & Indicador de Status */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-black text-slate-900 font-mono tracking-wider">
              {time.toLocaleTimeString("pt-PT", { hour12: false })}
            </span>
            <span className="text-[10px] text-slate-600 font-mono font-bold tracking-wider">
              {time.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold">Online</span>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer"
            title="Aceder à tela de autenticação"
          >
            <span>Entrar</span>
            <LogIn size={15} />
          </button>
        </div>
      </header>

      {/* Conteúdo Central Full Screen com Transição de 4 Segundos */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-6 flex flex-col justify-center items-center overflow-hidden z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full flex flex-col justify-center gap-6"
          >
            {/* Header do Slide */}
            <div className="text-center space-y-2 max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs">
                <SlideIcon size={13} />
                {slide.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {slide.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
                {slide.description}
              </p>
            </div>

            {/* Painel de Indicadores e Conteúdo do Slide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {slide.metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
                >
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {metric.label}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                    {metric.value}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    {metric.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Destaques Operacionais */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileCheck2 size={16} className="text-blue-600" />
                <span>Capacidades Principais do Módulo</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {slide.highlights.map((hl, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Barra Inferior com Controles e Indicadores dos Slides */}
      <footer className="w-full px-4 sm:px-8 py-3.5 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 z-30 shrink-0">
        {/* Indicadores de Progresso de Slides (4 Segundos cada) */}
        <div className="flex items-center gap-2.5">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentSlideIndex === idx
                  ? "w-8 bg-blue-600"
                  : "w-2.5 bg-slate-200 hover:bg-slate-300"
              }`}
              title={`Ir para o slide ${idx + 1}`}
            />
          ))}
          <span className="text-[11px] font-bold text-slate-400 ml-2">
            Slide {currentSlideIndex + 1} de {SLIDES.length} (4s)
          </span>
        </div>

        {/* Controles de Navegação */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title={isPlaying ? "Pausar apresentação" : "Reproduzir automaticamente"}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            type="button"
            onClick={prevSlide}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Slide anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Próximo slide"
          >
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="ml-3 px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-black flex items-center gap-2 transition shadow-sm cursor-pointer"
          >
            <span>Aceder ao SIGEP</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </footer>
    </div>
  );
}
