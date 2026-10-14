import React from "react";

export const getMonografiaSections = (
  authorName: string,
  monoTitle: string,
  orientador: string,
  year: number,
  dedicatoriaText: string,
  agradecimentosText: string,
  resumoText: string,
  abstractText: string
) => [
  {
    id: "capa",
    title: "Capa",
    content: (
      <div className="flex flex-col items-center justify-between h-full min-h-[800px] border-2 border-gray-200 p-16 text-center font-serif">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Universidade Púnguè<br />Extensão de Tete</h1>
          <h2 className="text-xl">Curso de Licenciatura em Informática Aplicada</h2>
        </div>
        <div className="space-y-8 mt-16">
          <p className="text-xl font-bold">{authorName}</p>
        </div>
        <div className="space-y-8 mt-16">
          <h3 className="text-2xl font-black">{monoTitle}</h3>
        </div>
        <div className="space-y-2 mt-auto">
          <p className="text-lg">Tete – Moçambique</p>
          <p className="text-4xl font-bookman-bordado">{year}</p>
        </div>
      </div>
    ),
  },
  {
    id: "folha-rosto",
    title: "Folha de rosto",
    content: (
      <div className="flex flex-col items-center justify-between h-full min-h-[800px] border-2 border-gray-200 p-16 font-serif text-center">
        <p className="text-xl font-bold">{authorName}</p>
        <div className="space-y-6 w-full mt-16">
          <h3 className="text-2xl font-black">{monoTitle}</h3>
          <div className="ml-auto w-1/2 text-left text-sm font-sans p-4 border-l-2 border-gray-300">
            Trabalho de fim de curso apresentado ao curso de Licenciatura em Informática Aplicada da Universidade Púnguè – Extensão de Tete, como requisito parcial para obtenção do grau de Licenciado em Informática Aplicada.<br /><br />
            <strong>Orientador:</strong> {orientador}
          </div>
        </div>
        <div className="text-center space-y-2 mt-auto">
          <p className="text-lg">Tete – Moçambique</p>
          <p className="text-4xl font-bookman-bordado">{year}</p>
        </div>
      </div>
    ),
  },
  {
    id: "dedicatoria",
    title: "Dedicatória",
    content: (
      <div className="space-y-6 font-serif text-justify h-full min-h-[600px] flex items-end justify-end pb-12 pr-6">
        <div className="w-2/3 text-right space-y-3">
          {dedicatoriaText.split("\n").filter(p => p.trim() !== "").map((p, idx) => (
            <p key={idx} className="italic text-base leading-relaxed text-slate-800">{p}</p>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "agradecimentos",
    title: "Agradecimentos",
    content: (
      <div className="space-y-6 font-serif text-justify">
        <h3 className="text-xl font-bold text-center mb-8">Agradecimentos</h3>
        {agradecimentosText.split("\n").filter(p => p.trim() !== "").map((p, idx) => (
          <p key={idx} className="text-base leading-relaxed indent-8 mb-4">{p}</p>
        ))}
      </div>
    ),
  },
  {
    id: "resumo",
    title: "Resumo",
    content: (
      <div className="space-y-6 font-serif text-justify">
        <h3 className="text-xl font-bold text-center mb-8">Resumo</h3>
        <p className="text-base leading-relaxed indent-8">{resumoText}</p>
        <p className="mt-8"><strong>Palavras-chave:</strong> SIGEP, Songo, Gestão académica, Sistemas de informação, Engenharia.</p>
      </div>
    ),
  },
  {
    id: "metodologia",
    title: "3. Metodologia",
    content: (
      <div className="space-y-6 font-serif text-justify">
        <h3 className="text-xl font-bold mb-4">3. METODOLOGIA</h3>
        <p>A presente pesquisa adota uma abordagem qualitativa, fundamentada na análise documental, observação participante e entrevistas estruturadas com os gestores do Instituto Superior Politécnico de Songo.</p>
        <p>Para o desenvolvimento do sistema SIGEP, utilizou-se o modelo de Engenharia de Software baseado em prototipagem evolutiva, permitindo ajustes contínuos conforme as necessidades levantadas pelos utilizadores finais.</p>
      </div>
    ),
  },
  {
    id: "desenvolvimento",
    title: "4. Desenvolvimento do Sistema",
    content: (
      <div className="space-y-6 font-serif text-justify">
        <h3 className="text-xl font-bold mb-4">4. DESENVOLVIMENTO DO SISTEMA</h3>
        <p>O SIGEP foi construído utilizando tecnologias modernas de desenvolvimento Web, focadas em escalabilidade, segurança e usabilidade.</p>
        <p>A arquitetura divide-se em um Frontend em React e um Backend em Firebase, garantindo persistência em tempo real e autenticação segura.</p>
      </div>
    ),
  },
  {
    id: "resultados",
    title: "5. Resultados e Discussão",
    content: (
      <div className="space-y-6 font-serif text-justify">
        <h3 className="text-xl font-bold mb-4">5. RESULTADOS E DISCUSSÃO</h3>
        <p>A implementação do protótipo SIGEP demonstrou uma redução significativa nos tempos de processamento de expedientes administrativos.</p>
        <p>A integração de módulos de recursos humanos e académicos permitiu uma visão consolidada, mitigando as falhas de comunicação interdepartamentais anteriormente observadas.</p>
      </div>
    ),
  },
  {
    id: "conclusao",
    title: "6. Conclusões e Recomendações",
    content: (
      <div className="space-y-6 font-serif text-justify">
        <h3 className="text-xl font-bold mb-4">6. CONCLUSÕES E RECOMENDAÇÕES</h3>
        <p>O desenvolvimento do SIGEP atingiu os objetivos propostos, oferecendo uma solução robusta e adaptada às necessidades específicas do Songo.</p>
        <p>Recomenda-se a continuidade do desenvolvimento com a integração futura de módulos financeiros complexos e uma auditoria de segurança periódica.</p>
      </div>
    ),
  }
];
