import React from "react";

export const getProjetoTeoricoSections = () => [
  {
    id: "capa-sigep",
    title: "Capa SIGEP",
    content: (
      <div className="flex flex-col items-center justify-center h-full min-h-[800px] border-2 border-blue-900 p-16 text-center font-sans bg-blue-50">
        <div className="mb-12 p-6 bg-blue-900 rounded-full text-white">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>
        <h1 className="text-4xl font-black text-blue-950 uppercase tracking-widest mb-4">SIGEP</h1>
        <h2 className="text-xl font-bold text-blue-800 mb-16">Sistema de Gestão Integrada Politécnica</h2>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] mt-auto">Manual Técnico de Arquitetura e Processos</p>
      </div>
    ),
  },
  {
    id: "introducao-projeto",
    title: "1. Introdução ao Sistema",
    content: (
      <div className="space-y-6 font-serif text-justify">
        <h3 className="text-xl font-bold mb-4">1. INTRODUÇÃO AO SIGEP</h3>
        <p>O SIGEP é uma plataforma de gestão integrada desenvolvida para otimizar as operações do Instituto Superior Politécnico de Songo.</p>
        <p>Este manual descreve o passo a passo da sua arquitetura, desde o portal de entrada até a gestão avançada de órgãos e unidades orgânicas.</p>
        <h4 className="font-bold mt-4">1.1 Arquitetura</h4>
        <p>Desenvolvido em React + Vite, utiliza o Firebase para autenticação e persistência de dados em tempo real, garantindo segurança e escalabilidade.</p>
      </div>
    ),
  },
  {
    id: "workflow-auth",
    title: "2. Fluxo de Autenticação",
    content: (
      <div className="space-y-6 font-serif text-justify">
        <h3 className="text-xl font-bold mb-4">2. FLUXO DE AUTENTICAÇÃO</h3>
        <p>O sistema segue um rigoroso controle de acesso baseado em papéis (RBAC):</p>
        <ol className="list-decimal ml-8 space-y-2">
          <li><strong>Login:</strong> Usuário insere credenciais no portal de entrada.</li>
          <li><strong>Verificação:</strong> O Firebase autentica o token JWT.</li>
          <li><strong>Perfil:</strong> O Firestore recupera o papel do usuário (Administrador Global ou Institucional).</li>
          <li><strong>Redirecionamento:</strong> Usuário é enviado ao dashboard correspondente.</li>
        </ol>
      </div>
    ),
  },
  {
    id: "workflow-gestao",
    title: "3. Gestão e Planificação",
    content: (
      <div className="space-y-6 font-serif text-justify">
        <h3 className="text-xl font-bold mb-4">3. GESTÃO E PLANIFICAÇÃO</h3>
        <p>Este módulo centraliza as operações administrativas:</p>
        <ul className="list-disc ml-8 space-y-2">
          <li><strong>Gestão Académica:</strong> Controle de matrículas, turmas e docentes.</li>
          <li><strong>Gestão Documental:</strong> Fluxo completo de entrada/saída de ofícios.</li>
          <li><strong>Gestão de RH:</strong> Processos individuais e históricos de colaboradores.</li>
        </ul>
      </div>
    ),
  },
];
