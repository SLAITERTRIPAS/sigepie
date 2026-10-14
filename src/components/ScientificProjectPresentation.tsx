import React from "react";
import { motion } from "motion/react";
import { 
  FileText, 
  Target, 
  Settings, 
  Database, 
  PieChart, 
  CheckCircle, 
  ArrowLeft, 
  Download,
  BookOpen,
  Users,
  Shield,
  Zap
} from "lucide-react";

interface SectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  delay?: number;
}

const Section: React.FC<SectionProps> = ({ title, icon: Icon, children, delay = 0 }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-blue-50 rounded-lg">
        <Icon className="text-blue-900" size={24} />
      </div>
      <h2 className="text-xl font-bold text-slate-800 tracking-tight uppercase">{title}</h2>
    </div>
    <div className="text-slate-600 leading-relaxed space-y-3 font-serif">
      {children}
    </div>
  </motion.section>
);

export default function ScientificProjectPresentation({ onBack }: { onBack: () => void }) {
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12 print:bg-white print:pb-0">
      {/* Header Fixo / Barra de Ação */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-900 transition-colors font-bold text-sm"
        >
          <ArrowLeft size={18} />
          VOLTAR AO SISTEMA
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-xl hover:bg-blue-800 transition-all shadow-lg text-sm font-black tracking-widest"
          >
            <Download size={18} />
            EXPORTAR APRESENTAÇÃO
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Cabeçalho do Poster */}
        <header className="text-center mb-16 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 bg-blue-900 text-white px-6 py-2 rounded-full text-sm font-black tracking-[0.2em] shadow-xl"
          >
            <Shield size={16} />
            SIGEP-ISPS V1.1.2.0
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 font-serif leading-tight max-w-4xl mx-auto">
            SIGEP-ISPS: Plataforma Inteligente de Gestão Estratégica e Projeção Académica
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-serif italic">
            Um ecossistema digital unificado para o Instituto Superior Politécnico de Songo
          </p>

          <div className="flex flex-wrap justify-center gap-8 pt-6">
            <div className="text-center">
              <p className="text-xs font-black text-blue-900 tracking-widest uppercase mb-1">Instituição</p>
              <p className="text-slate-800 font-bold">ISPS - Songo</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-blue-900 tracking-widest uppercase mb-1">Equipa Técnica</p>
              <p className="text-slate-800 font-bold">Direção & Desenvolvimento SIGEP</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-blue-900 tracking-widest uppercase mb-1">Localização</p>
              <p className="text-slate-800 font-bold">Tete, Moçambique</p>
            </div>
          </div>
        </header>

        {/* Grid de Conteúdo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* RESUMO */}
          <Section title="Resumo Executivo" icon={FileText} delay={0.1}>
            <p>
              O <strong>SIGEP-ISPS</strong> representa uma viragem tecnológica na governação do Instituto Superior Politécnico de Songo. 
              A plataforma foi concebida para mitigar a fragmentação de dados institucionais, integrando processos que abrangem desde a gestão de recursos humanos (Efetivo Geral) até à monitoria de planos de atividades e conformidade normativa.
            </p>
            <p>
              Através de uma interface intuitiva e robusta, o sistema permite a visualização de indicadores estratégicos em tempo real, facilitando a tomada de decisões baseada em evidências sólidas e projeções académicas precisas.
            </p>
          </Section>

          {/* INTRODUÇÃO */}
          <Section title="Introdução & Contexto" icon={BookOpen} delay={0.2}>
            <p>
              As Instituições de Ensino Superior enfrentam o desafio constante de gerir fluxos de informação complexos e garantir a transparência administrativa. 
              No ISPS, a necessidade de uma <em>Single Source of Truth</em> (Fonte Única de Verdade) motivou o desenvolvimento desta plataforma.
            </p>
            <p>
              O projeto foca-se na digitalização da tramitação de expedientes, gestão patrimonial e financeira, assegurando que cada setor opere em sintonia com os objetivos estratégicos globais da instituição.
            </p>
          </Section>

          {/* OBJETIVOS */}
          <Section title="Objetivos Estratégicos" icon={Target} delay={0.3}>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Centralização:</strong> Consolidar dados de pessoal, estudantes e ativos em uma única base de dados segura (Firebase).</li>
              <li><strong>Automação:</strong> Digitalizar fluxos de requisição e tramitação de documentos (Workflow SIGEP).</li>
              <li><strong>Projeção:</strong> Desenvolver algoritmos para prever necessidades futuras de contratação e alocação orçamental.</li>
              <li><strong>Transparência:</strong> Gerar relatórios dinâmicos de conformidade e execução de atividades.</li>
            </ul>
          </Section>

          {/* METODOLOGIA */}
          <Section title="Metodologia & Tecnologias" icon={Settings} delay={0.4}>
            <p>
              O desenvolvimento seguiu a metodologia <strong>Ágil (Scrum)</strong>, com ciclos iterativos de feedback institucional.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Zap size={16} className="text-amber-500 mb-2" />
                <p className="text-xs font-bold text-slate-800">Frontend</p>
                <p className="text-[10px] text-slate-500">React 19, Vite, Tailwind CSS</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Database size={16} className="text-blue-500 mb-2" />
                <p className="text-xs font-bold text-slate-800">Backend</p>
                <p className="text-[10px] text-slate-500">Firebase Firestore & Auth</p>
              </div>
            </div>
          </Section>

          {/* ARQUITETURA */}
          <Section title="Arquitetura do Ecossistema" icon={Database} delay={0.5}>
            <p>
              O sistema é composto por blocos modulares que garantem a escalabilidade:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                <span>Gestão Documental (Expedientes e Arquivo)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                <span>Recursos Humanos (Gestão de Pessoal e Processos)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                <span>Património & Economato (Inventário Inteligente)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                <span>Planificação (Matriz de Atividades e Orçamento)</span>
              </div>
            </div>
          </Section>

          {/* RESULTADOS */}
          <Section title="Resultados & Impacto" icon={PieChart} delay={0.6}>
            <p>
              Os resultados preliminares indicam uma otimização significativa nos tempos de resposta administrativa.
            </p>
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>Eficiência Operacional</span>
                  <span>95%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-900 w-[95%]"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>Conformidade Normativa</span>
                  <span>100%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 w-full"></div>
                </div>
              </div>
            </div>
          </Section>

          {/* CONCLUSÃO */}
          <Section title="Conclusão" icon={CheckCircle} delay={0.7}>
            <p>
              O <strong>SIGEP-ISPS</strong> não é apenas um software, mas uma ferramenta estratégica de transformação cultural. 
              Ao unir tecnologia de ponta com as necessidades reais da academia, o projeto estabelece um novo padrão de excelência na gestão universitária em Moçambique.
            </p>
            <p className="font-bold text-blue-900 pt-2">
              "Inovação ao serviço da Educação e do Desenvolvimento."
            </p>
          </Section>

          {/* ÁREA DE UTILIZADORES */}
          <Section title="Alcance do Sistema" icon={Users} delay={0.8}>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-3xl font-black text-blue-900">350+</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Colaboradores</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-3xl font-black text-blue-900">1200+</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Interações/Mês</p>
              </div>
            </div>
          </Section>

        </div>

        {/* Rodapé do Poster */}
        <footer className="mt-16 pt-8 border-t border-slate-200 text-center space-y-4">
          <p className="text-xs font-black text-slate-400 tracking-[0.5em] uppercase">
            Direitos Reservados &copy; {new Date().getFullYear()} - Instituto Superior Politécnico de Songo
          </p>
          <div className="flex justify-center gap-4 opacity-50 grayscale">
             {/* Logo placeholders or small institutional icons can go here */}
          </div>
        </footer>
      </div>
    </div>
  );
}
