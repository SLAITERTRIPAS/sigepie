import React, { useState } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import { cn } from "../../lib/utils";

interface BiografiaProps {
  onBack: () => void;
}

export default function BiografiaView({ onBack }: BiografiaProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 bg-white rounded-[2.5rem] shadow-sm border border-gray-100">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold mb-8 transition-colors"
      >
        <ArrowLeft size={20} />
        Voltar
      </button>

      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600 border-4 border-white shadow-lg">
            <BookOpen size={48} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            BIOGRAFIA DE FRANZISSI TRIPALONGA VICENTE
          </h1>
        </div>

        <div className={cn("prose prose-blue max-w-none text-gray-700 leading-relaxed transition-all duration-300", !isExpanded && "max-h-[500px] overflow-hidden")}>
          <p>
            Franzissi Tripalonga Vicente é um profissional moçambicano da área de Tecnologias de Informação, com 12 anos de experiência na área de TI e especialização em Informática Aplicada.
          </p>
          <p>
            Natural da Cidade de Tete, é filho de Tripalonga Vicente e Luísa Andrigo Singano. Possui formação e competências técnicas nas áreas de Hardware, Software, Redes de Computadores, Programação, Informática Aplicada, manutenção e reparação de equipamentos informáticos, entre outras áreas técnicas.
          </p>
          <p>
            Ao longo do seu percurso, frequentou instituições como o IFP, Tecnicol, MTIC, Escola Prática de Engenharia Militar (Boquisso) e UNIPUNGUE, onde desenvolveu conhecimentos técnicos e profissionais em diferentes áreas.
          </p>
          <p>
            Atualmente exerce a função de Técnico de Planificação no ISPS, conciliando conhecimentos de tecnologia, planificação e gestão na conceção e desenvolvimento de soluções digitais.
          </p>

          <h3 className="text-xl font-black text-red-600 mt-8 mb-4">Principais Projetos</h3>
          <ul className="space-y-4">
            <li><strong>SIGEP</strong> – Sistema Integrado de Gestão de Processos.</li>
            <li><strong>SIGE</strong> – Sistema Integrado de Gestão Escolar.</li>
            <li><strong>SIGDE</strong> – Sistema Integrado de Gestão e Coleta de Dados Estatísticos.</li>
            <li><strong>Mercado Aberto</strong> – Sistema destinado à gestão de vendas e controlo de stocks.</li>
          </ul>

          <p className="mt-8">
            As suas principais competências incluem tecnologia, desenvolvimento de sistemas, programação, gestão, redes de computadores, manutenção e reparação de meios informáticos e implementação de soluções digitais.
          </p>
          <p>
            O seu percurso caracteriza-se pelo desenvolvimento de soluções tecnológicas direcionadas para problemas concretos da sociedade e das instituições, procurando utilizar a tecnologia como instrumento de modernização, organização, eficiência, controlo, transparência e melhoria dos processos de gestão.
          </p>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center justify-center w-full gap-1 pt-4"
        >
          {isExpanded ? "Ver menos" : "Ver mais detalhes"}
        </button>
      </div>
    </div>
  );
}
