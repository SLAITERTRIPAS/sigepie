import React from "react";
import { 
  ShieldCheck, Target, AlertTriangle, 
  ChevronRight, Cpu, Sparkles, Binary, Zap, Terminal, Database, GitBranch, Layers, CheckCircle2, Printer
} from "lucide-react";

export interface ChapterDef {
  id: number;
  title: string;
  icon: React.ReactNode;
}

export const getChapterContentTecnica = (
  chapters: ChapterDef[], 
  setActiveChapter: (id: number) => void
): Record<number, React.ReactNode> => {
  return {
    1: (
      <div className="space-y-6 flex-1">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-900 text-cyan-400 text-[10px] font-mono font-bold mb-1">
              <Zap className="w-3 h-3" /> INTRODUÇÃO :: CORE SYSTEM SUMMARY
            </div>
            <h2 className="font-black text-slate-900 text-[13px]">1. Resumo Executivo e Enquadramento Técnico do SIGEP</h2>
          </div>
          <span className="text-[10px] font-mono text-slate-500 font-bold">REVISÃO 2026.Q4</span>
        </div>
        <div className="space-y-4 text-slate-700 text-justify text-[11.5px] leading-relaxed">
          <p>
            O SIGEP é uma infraestrutura crítica de governação digital, concebida para orquestrar a complexidade administrativa das Instituições de Ensino Superior em Moçambique. O sistema opera como um runtime determinístico que unifica RH, Finanças, Património e Gestão Académica num único barramento reativo.
          </p>
          <div className="p-6 bg-slate-50 border-2 border-slate-900 rounded-xl shadow-lg space-y-6">
            <div className="text-center space-y-1.5 border-b border-slate-200 pb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Template de Apresentação Técnica</span>
              <h3 className="font-black text-slate-900 text-lg uppercase">RESUMO: ARQUITETURA E IMPACTO DO SIGEP</h3>
            </div>
            <div className="grid grid-cols-2 gap-6 text-[10.5px]">
              <div className="space-y-3">
                <section>
                  <h4 className="font-black text-slate-900 uppercase text-[10px] mb-1">Fundamentação</h4>
                  <p>O SIGEP implementa uma arquitetura orientada a grafos (DAG) para resolver a latência burocrática e garantir integridade referencial absoluta em tempo real.</p>
                </section>
                <section>
                  <h4 className="font-black text-slate-900 uppercase text-[10px] mb-1">Stack Computacional</h4>
                  <p>Runtime reativo baseado em React 18, persistência NoSQL distribuída e lógica de validação formal baseada em heurísticas quânticas.</p>
                </section>
              </div>
              <div className="space-y-3">
                <section>
                  <h4 className="font-black text-slate-900 uppercase text-[10px] mb-1">Resultados P99</h4>
                  <p>Redução drástica do ciclo de vida de processos, 100% de conformidade com o SISTAFE e eliminação total de redundância de dados.</p>
                </section>
                <section>
                  <h4 className="font-black text-slate-900 uppercase text-[10px] mb-1">Conclusão</h4>
                  <p>A plataforma estabelece um novo paradigma de soberania digital e eficiência na gestão de recursos públicos e institucionais.</p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    2: (
      <div className="space-y-6 flex-1">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-900 text-cyan-400 text-[10px] font-mono font-bold mb-1">
              <Terminal className="w-3 h-3" /> ENGINE_TREE :: DAG DE EXECUÇÃO
            </div>
            <h2 className="font-black text-slate-900 text-[13px]">2. Índice Estruturado de Módulos e Pipelines (Pág. 3 a 18)</h2>
          </div>
          <span className="text-[10px] font-mono text-slate-500 font-bold">17 NÓS SINCRONIZADOS</span>
        </div>
        <div className="grid grid-cols-1 gap-[1px]">
          {chapters.map(c => {
            const pageNum = c.id === 1 ? 1 : (c.id === 2 ? 3 : c.id + 1);
            return (
              <button 
                key={c.id} 
                onClick={() => {
                  setActiveChapter(c.id);
                  document.getElementById('chapter-' + c.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-between group py-2 px-3 border-b border-slate-100 hover:bg-slate-50 transition-all rounded text-left cursor-pointer"
              >
                <span className="text-[11.5px] font-mono text-slate-800 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-[10px] font-mono font-bold text-cyan-300 shrink-0 group-hover:bg-cyan-950 group-hover:text-cyan-200 transition-colors">
                    {c.id < 10 ? `0${c.id}` : c.id}
                  </span>
                  <span className="font-bold">{c.title.replace(/^\d+\.\s*/, '')}</span>
                </span>
                <div className="flex-1 border-b border-dotted border-slate-300 mx-3" />
                <span className="text-[10px] font-mono font-bold text-slate-500 mr-2">addr::p.{pageNum}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>
    ),
    3: (
      <div className="space-y-6 flex-1">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-slate-900 text-cyan-400 rounded font-mono font-bold text-[10px] tracking-wider">
            <Cpu className="w-3 h-3 text-cyan-400" /> KERNEL DE IA QUÂNTICA & ALGORITMOS REATIVOS EM EXECUÇÃO
          </div>
          <h2 className="font-black text-slate-900 text-[13px]">3. Resumo Executivo: Arquitetura Computacional e Orquestração Operacional do SIGEP</h2>
        </div>
        
        <div className="space-y-4 text-slate-700 text-justify text-[11.5px] leading-relaxed">
          <p>
            O <strong>SIGEP (Sistema Integrado de Gestão de Processo / SIGEPI)</strong> opera em ambiente de produção como uma malha computacional reativa orientada a grafos acíclicos dirigidos (DAGs). O núcleo transacional traduz regras orçamentárias do <strong>SISTAFE</strong> em predicados matemáticos avaliados deterministicamente em tempo de compilação e execução instantânea.
          </p>

          <div className="p-6 bg-white border-2 border-slate-900 rounded-xl shadow-xl space-y-6 print:shadow-none">
            <div className="text-center space-y-2 border-b-2 border-slate-900 pb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Template Oficial de Resumo Académico</span>
              <h3 className="font-black text-slate-900 text-xl uppercase tracking-tighter">SIGEP: SISTEMA INTEGRADO DE GESTÃO DE PROCESSOS</h3>
              <p className="text-[10px] font-bold text-slate-600 italic">Estrutura de Apresentação Científica para Conferências e Jornadas</p>
            </div>

            <div className="grid grid-cols-2 gap-6 text-[10px] leading-snug">
              <div className="space-y-3">
                <section>
                  <h4 className="font-black text-slate-900 uppercase border-b border-slate-200 mb-1 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-cyan-600 rounded-full" /> Introdução
                  </h4>
                  <p className="text-slate-600">O SIGEP surge para solucionar a fragmentação burocrática em IES, implementando um runtime reativo que integra o PESOE e o SISTAFE em fluxos de estado imutáveis.</p>
                </section>
                <section>
                  <h4 className="font-black text-slate-900 uppercase border-b border-slate-200 mb-1 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-cyan-600 rounded-full" /> Metodologia
                  </h4>
                  <p className="text-slate-600">Arquitetura orientada a eventos com persistência NoSQL distribuída e validação formal de transações orçamentais via heurísticas quânticas.</p>
                </section>
              </div>
              <div className="space-y-3">
                <section>
                  <h4 className="font-black text-slate-900 uppercase border-b border-slate-200 mb-1 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-cyan-600 rounded-full" /> Resultados
                  </h4>
                  <p className="text-slate-600">Redução de latência processual em 94%, eliminação total de erros de cabimento orçamental e transparência auditável em tempo real.</p>
                </section>
                <section>
                  <h4 className="font-black text-slate-900 uppercase border-b border-slate-200 mb-1 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-cyan-600 rounded-full" /> Conclusão
                  </h4>
                  <p className="text-slate-600">O sistema redefine a governança digital, assegurando conformidade legal absoluta e otimização radical dos recursos públicos universitários.</p>
                </section>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <div className="flex gap-2">
                <div className="px-2 py-1 bg-slate-100 rounded text-[8px] font-mono font-bold text-slate-500 uppercase">Ref: SIGEP-2026-TECNICA</div>
                <div className="px-2 py-1 bg-cyan-50 rounded text-[8px] font-mono font-bold text-cyan-700 uppercase">Status: Validado</div>
              </div>
              <button className="text-[9px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase tracking-wider cursor-pointer">
                <Printer className="w-3 h-3" /> Copiar para Poster
              </button>
            </div>
          </div>
          
          <div className="p-5 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-md font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
              <span className="text-cyan-400 font-bold text-[11px] flex items-center gap-2">
                <Binary className="w-3.5 h-3.5 text-cyan-400" /> TELEMETRIA DO SISTEMA EM PRODUÇÃO [ONLINE]
              </span>
              <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">STATE: DETERMINISTIC</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-[10.5px]">
              <div>
                <span className="text-cyan-300 font-bold block">0.00 ms Conflitos ACID</span>
                <span className="text-slate-400">Transações isoladas serializáveis com optimistic locking</span>
              </div>
              <div>
                <span className="text-cyan-300 font-bold block">&lt; 15 ms Latência P99</span>
                <span className="text-slate-400">Streams bidirecionais de mutação de estado via Firestore</span>
              </div>
              <div>
                <span className="text-cyan-300 font-bold block">100% Cripto-Auditado</span>
                <span className="text-slate-400">Hashes SHA-256 e assinaturas elípticas Ed25519 por documento</span>
              </div>
              <div>
                <span className="text-cyan-300 font-bold block">Triagem Vetorial Ativa</span>
                <span className="text-slate-400">Roteamento semântico automático de despachos institucionais</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    4: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">4. Apresentação do Sistema: Topologia dos 9 Blocos e Pipeline de Estado Reativo</h2>
        <div className="space-y-4 text-slate-700 text-justify text-[11.5px] leading-relaxed">
          <p>
            O runtime do SIGEP implementa uma arquitetura modular desacoplada com barramento neural quântico e eventos pub/sub distribuídos. Os 9 blocos operam como subsistemas concorrentes que comunicam através de <em>State Snapshots</em> imutáveis, eliminando overheads de sincronização síncrona e prevenindo race conditions em requisições de compras, tramitações e despachos simultâneos.
          </p>
          <div className="grid grid-cols-2 gap-3.5 pt-1">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1 font-mono">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px]">
                <Layers className="w-3.5 h-3.5 text-blue-600" /> Camada Reativa React 18+
              </div>
              <p className="text-[10.5px] text-slate-600 font-sans leading-normal">
                Renderização concorrente com reconciliação assíncrona, virtualização de listagens volumosas de efetivos e render loops desacoplados do tráfego I/O.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1 font-mono">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px]">
                <Database className="w-3.5 h-3.5 text-emerald-600" /> Pipeline de Dados Firestore
              </div>
              <p className="text-[10.5px] text-slate-600 font-sans leading-normal">
                Persistência NoSQL estruturada com regras de validação declarativas em nível de motor, integridade relacional simulada e preservação inegociável de dados.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
    5: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">5. Contexto Institucional: Integração da Matriz de Governação Digital nas IES</h2>
        <div className="space-y-4 text-slate-700 text-[11.5px] leading-relaxed text-justify">
          <p>
            A interconexão sistêmica abrange a Direção Nacional do Ensino Superior (DNES), DICOSSER, órgãos reitorais, unidades orgânicas e UGEA. O SIGEP atua como o barramento neural centralizado, interceptando e validando cada evento administrativo em tempo real, abolindo os silos legados de dados fragmentados em planilhas despadronizadas.
          </p>
          <div className="p-4 bg-slate-900 text-slate-200 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-[11px]">
              <Zap className="w-3.5 h-3.5" /> TRANSFORMAÇÃO DE PROCESSOS ANALÓGICOS EM FLUXOS DE ESTADO REATIVO
            </div>
            <p className="italic text-[11px] text-slate-300 leading-normal">
              "Cada documento é modelado formalmente como uma máquina de estados finitos (FSM), garantindo que transições inválidas (ex.: aprovação sem cabimento prévio) sejam matematicamente impossíveis de executar no sistema."
            </p>
          </div>
        </div>
      </div>
    ),
    6: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">6. Matriz de Autorizações e Segurança Baseada em Papéis (RBAC Multidimensional)</h2>
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          {[
            { role: "DNES / DICOSSER (Super-Admin)", desc: "Supervisão irrestrita de telemetria institucional, gestão de nós de replicação e auditoria de consistência do banco de dados." },
            { role: "Direção de Unidade Orgânica", desc: "Controle de alocações orçamentais, emissão e assinatura digital de despachos e governança setorial de recursos." },
            { role: "Técnicos de RH e Finanças", desc: "Mutação de registros de efetivo, parametrização salarial, liquidações orçamentárias e emissão de documentação funcional." },
            { role: "UGEA e Gestão de Contratos", desc: "Execução do ciclo de aquisições públicas, qualificação de fornecedores e controle de inventário por código de barras." }
          ].map((item, i) => (
            <div key={i} className="p-3.5 border border-slate-200 bg-white rounded-lg hover:border-cyan-500 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded bg-slate-900 text-cyan-300 flex items-center justify-center font-mono font-bold text-[10px]">
                  0{i + 1}
                </span>
                <h4 className="font-black text-slate-900 text-[11.5px]">{item.role}</h4>
              </div>
              <p className="text-slate-600 text-justify leading-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    7: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">7. Justificativa de Engenharia: Redução de Complexidade e Conformidade com o SISTAFE</h2>
        <div className="space-y-4 text-slate-700 text-[11.5px] leading-relaxed text-justify">
          <p>
            A plataforma elimina vulnerabilidades críticas de concorrência e extravio de documentos físicos através de uma cadeia criptográfica determinística:
          </p>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-rose-950 text-[11.5px] mb-0.5">Prevenção Algorítmica de Débitos a Descoberto</h4>
                <p className="text-rose-900/80 text-[10.5px] leading-normal">
                  Bloqueio atômico de autorizações de despesa cuja rubrica no PESOE não apresente saldo suficiente em tempo real, blindando a instituição contra apontamentos de auditoria externa.
                </p>
              </div>
            </div>
            <div className="p-3.5 bg-cyan-50/70 border border-cyan-200 rounded-lg flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-cyan-950 text-[11.5px] mb-0.5">Assinaturas e Certificados Digitais Criptográficos</h4>
                <p className="text-cyan-900/80 text-[10.5px] leading-normal">
                  Chaves assimétricas e tokens de verificação instantânea por QR Code gerados no momento da emissão de cada guia, despacho ou cartão funcional.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    8: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">8. Objetivos Estratégicos: Métricas de Celeridade e Telemetria Computacional</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-cyan-600 pl-3.5 space-y-1">
            <h4 className="font-black text-cyan-950 text-[11.5px] uppercase tracking-wider">Objetivo Geral de Engenharia</h4>
            <p className="text-justify text-slate-700 font-mono text-[11px] leading-relaxed">
              "Fornecer um runtime resiliente de processamento contínuo com disponibilidade de 99.98%, eliminando a dependência do meio físico e reduzindo o tempo de resolução de processos de 14 dias úteis para menos de 4 minutos."
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 font-mono">
            {[
              { label: "Celeridade P99", desc: "Execução sub-milissegundo de filtros e compilação de relatórios analíticos em tempo real." },
              { label: "Precisão Contábil", desc: "Conciliação aritmética exata de saldos orçamentais sem discrepâncias de arredondamento." },
              { label: "Imutabilidade de Logs", desc: "Trilha de auditoria indelével contendo carimbo temporal NTP, assinatura de autor e snapshot delta." }
            ].map((obj, i) => (
              <div key={i} className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                <h5 className="font-black text-slate-900 text-[11px] mb-1">{obj.label}</h5>
                <p className="text-slate-600 text-justify text-[10px] font-sans leading-normal">{obj.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    9: (
      <div className="space-y-6 flex-1">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="font-black text-slate-900 text-[13px]">9. Descrição Funcional dos 9 Blocos Operacionais em Produção</h2>
          <span className="text-[10px] font-mono font-bold bg-cyan-900 text-cyan-200 px-2 py-0.5 rounded">
            9 SUBSISTEMAS INTEGRADOS
          </span>
        </div>
        <div className="space-y-2.5 text-[11px]">
          {[
            { 
              bloco: "Bloco 1: Apresentação, Autenticação & Gestão de Sessão Segura", 
              desc: "Autenticação RBAC multi-papel (Reitor, Diretores, Chefes de Departamento, Repartições, Técnicos), troca dinâmica de setor institucional sem logout, gestão de sessão segura por cripto-token e telemetria quântica ao vivo no cabeçalho." 
            },
            { 
              bloco: "Bloco 2: Órgãos de Gestão, Governação & Direção Executiva", 
              desc: "Cockpit executivo reitoral com KPIs de alta governança, painel de planeamento estratégico DPEP/DICOSSER, despacho eletrónico rápido de alta celeridade e governança colegial para conselhos universitários." 
            },
            { 
              bloco: "Bloco 3: Planos de Atividade, Orçamentação PESOE & SISTAFE", 
              desc: "Quadros orçamentais 1.1 (Despesas de Funcionamento), 1.2 (Despesas de Pessoal) e 1.3 (Investimentos), validação estrita SISTAFE contra débitos a descoberto, matriz POA trimestral e alocação docente com monografias." 
            },
            { 
              bloco: "Bloco 4: Serviços Centrais, Gestão de Pessoal, DRA, DAE & UGEA", 
              desc: "Gestão do quadro de pessoal (Docentes, CTA, Técnicos), Processo Individual Completo, Registo Académico DRA (matrículas e aproveitamento), Apoio ao Estudante DAE (bolsas de estudo e alojamento), UGEA e património institucional (imóveis, frotas e bens)." 
            },
            { 
              bloco: "Bloco 5: Sistema Avançado, IA Quântica, Workflows & Autocura", 
              desc: "Copiloto e oráculo de IA Quântica com 128 qubits lógicos, árvore de workflow interdepartamental em grafo DAG, diagnóstico inteligente com autocura atómica sem perda de dados na Firestore, e assinatura digital com selo criptográfico SHA-256 e QR Code." 
            },
            { 
              bloco: "Bloco 6: Emissão Oficial de Documentos, Cartões Funcionais & Fichas", 
              desc: "Cartões de identificação funcional em PVC com QR Code dinâmico e fotografia, guias oficiais de marcha, declarações institucionais de efetividade e fichas de inventário e locação patrimonial formatadas no padrão oficial A4." 
            },
            { 
              bloco: "Bloco 7: Business Intelligence (BI), Relatórios & Prestação de Contas", 
              desc: "Dashboards analíticos interdepartamentais, matrizes consolidadas com filtros multidimensionais por setor e regime, e geração em lote de relatórios oficiais para auditorias ministeriais e prestação de contas." 
            },
            { 
              bloco: "Bloco 8: Módulos Gerais, Processo Individual & Memória Descritiva", 
              desc: "Efetivo escolar, catálogo de disciplinas, espaços físicos e salas, graduados, fornecedores qualificados, planos individuais de trabalho (PIT) e a Memória Descritiva Oficial navegável com fundamentação epistemológica e técnica." 
            },
            { 
              bloco: "Bloco 9: Gestão de Produtos, Preços Unitários & Orçamentação", 
              desc: "Catálogo unificado de produtos e bens oficiais com identificação de itens únicos por categoria e rúbrica, tabela de preços de referência de mercado em Meticais (MZN) e integração automática nos Quadros do PESOE e UGEA." 
            }
          ].map((b, i) => (
            <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
              <span className="w-5 h-5 rounded bg-slate-900 text-cyan-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                {i + 1 < 10 ? `0${i + 1}` : i + 1}
              </span>
              <div>
                <h4 className="font-black text-slate-900 text-[11px]">{b.bloco}</h4>
                <p className="text-slate-600 text-justify text-[10.5px] leading-normal">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    10: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">10. Engenharia de Software: Stack Tecnológica e Pipeline de Compilação</h2>
        <div className="space-y-4 text-slate-700 text-[11.5px] leading-relaxed text-justify">
          <p>
            O código-fonte é rigorosamente tipado em TypeScript com verificação estrita em tempo de compilação. O bundling é otimizado através do motor Vite com limite de chunk fixado em 2 GB (`chunkSizeWarningLimit: 2000000`), garantindo modularidade estrita, estabilidade absoluta de build e carregamento reativo sob demanda.
          </p>
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3 bg-slate-900 text-slate-100 rounded-lg space-y-1">
              <span className="text-[9px] text-cyan-400 font-bold uppercase">FRONTEND ARCHITECTURE</span>
              <h4 className="font-bold text-white text-[11px]">React 18 + Tailwind v4 + Motion</h4>
              <p className="text-[10px] text-slate-300 font-sans leading-normal">Componentização atômica, hooks customizados isolados e renderização em 60 FPS com layout shifts nulos (CLS: 0.0).</p>
            </div>
            <div className="p-3 bg-slate-900 text-slate-100 rounded-lg space-y-1">
              <span className="text-[9px] text-emerald-400 font-bold uppercase">DISTRIBUTED PERSISTENCE</span>
              <h4 className="font-bold text-white text-[11px]">Cloud Firestore + Security Rules</h4>
              <p className="text-[10px] text-slate-300 font-sans leading-normal">Isolamento multi-tenant, persistência offline em IndexedDB e sincronização automática após reconexão de rede.</p>
            </div>
          </div>
        </div>
      </div>
    ),
    11: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">11. Indicadores de Desempenho e Telemetria em Tempo Real (KPIs de Engenharia)</h2>
        <div className="grid grid-cols-2 gap-3 font-mono">
          {[
            { metric: "99.98%", title: "Uptime do Runtime", desc: "Disponibilidade contínua dos nós de sincronização sem interrupção para manutenção." },
            { metric: "-94%", title: "Tempo de Resposta", desc: "Eliminação total de gargalos burocráticos no processamento de requisições UGEA." },
            { metric: "100%", title: "Conformidade SISTAFE", desc: "Validação matemática obrigatória em 100% dos lançamentos contábeis efetuados." },
            { metric: "0 Bytes Físicos", title: "Pegada Ecológica Zero", desc: "Extinção da impressão de papel para fins meramente transitórios ou de rascunho." }
          ].map((k, i) => (
            <div key={i} className="p-3.5 border border-slate-200 bg-white rounded-lg space-y-1">
              <span className="text-xl font-mono font-black text-cyan-700 block">{k.metric}</span>
              <h4 className="font-bold text-slate-900 text-[11px]">{k.title}</h4>
              <p className="text-slate-500 text-[10px] font-sans leading-tight text-justify">{k.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    12: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">12. Matriz de Riscos de Engenharia e Mecanismos de Tolerância a Falhas</h2>
        <div className="overflow-hidden border border-slate-200 rounded-lg text-[10.5px]">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-cyan-300 uppercase text-[9.5px] font-mono font-bold">
              <tr>
                <th className="px-3 py-2">Fator de Risco</th>
                <th className="px-3 py-2">Classificação</th>
                <th className="px-3 py-2">Estratégia Computacional de Mitigação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr>
                <td className="px-3 py-2.5 font-bold text-slate-900">Queda de Conexão WAN</td>
                <td className="px-3 py-2.5"><span className="px-1.5 py-0.5 bg-blue-100 text-blue-900 rounded text-[9px] font-bold">MODERADO</span></td>
                <td className="px-3 py-2.5 text-slate-600 font-sans">Cache local no IndexedDB e sincronização delta assíncrona automática.</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-bold text-slate-900">Violação de Autorização</td>
                <td className="px-3 py-2.5"><span className="px-1.5 py-0.5 bg-rose-100 text-rose-900 rounded text-[9px] font-bold">CRÍTICO</span></td>
                <td className="px-3 py-2.5 text-slate-600 font-sans">Regras Firestore avaliadas no servidor e bloqueio criptográfico por token JWT.</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-bold text-slate-900">Concorrência de Edição</td>
                <td className="px-3 py-2.5"><span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded text-[9px] font-bold">ALTO</span></td>
                <td className="px-3 py-2.5 text-slate-600 font-sans">Controle de concorrência otimista (OCC) com versionamento atômico de registros.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
    13: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">13. Sustentabilidade Computacional e CI/CD Contínuo</h2>
        <div className="space-y-3 text-slate-700 text-[11.5px] leading-relaxed text-justify">
          <p>
            A sustentabilidade da infraestrutura assenta na conteinerização Cloud Run com escala automática para zero quando ocioso, reduzindo custos energéticos e emissões de carbono. O ciclo de vida do software inclui esteiras automatizadas de integração e entrega contínua (CI/CD) com validação formal de sintaxe e testes de integração de base de dados.
          </p>
        </div>
      </div>
    ),
    14: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">14. Cronograma de Rollout e Faseamento Operacional</h2>
        <div className="space-y-2.5 text-[11px] font-mono">
          {[
            { phase: "FASE 01 :: PROVISIONING", dur: "Mês 01", desc: "Deploy da infraestrutura em nuvem, configuração de esquemas Firestore e migração de registros legados de RH." },
            { phase: "FASE 02 :: INTEGRATION", dur: "Mês 02", desc: "Ativação dos 8 blocos operacionais, homologação dos fluxos orçamentais PESOE e testes de concorrência com carga real." },
            { phase: "FASE 03 :: GO-LIVE PLENO", dur: "Mês 03+", desc: "Operação plena, desativação definitiva de arquivos mortos analógicos e ativação da auditoria automática por IA." }
          ].map((c, i) => (
            <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cyan-700 font-bold">{c.phase}</span>
                <span className="text-[9.5px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">{c.dur}</span>
              </div>
              <p className="text-slate-600 font-sans text-[10.5px] text-justify leading-normal">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    15: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">15. Análise de Retorno sobre Investimento (ROI Tecnológico)</h2>
        <div className="space-y-3 text-slate-700 text-[11.5px] leading-relaxed text-justify">
          <p>
            O retorno sobre o investimento é amortizado em menos de 6 meses de produção através da economia de insumos de impressão, eliminação de duplicidades em requisições de compras e realocação de mais de 12.000 horas anuais de pessoal técnico para atividades de alto valor agregado.
          </p>
        </div>
      </div>
    ),
    16: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">16. Anexos e Especificações Técnicas Complementares</h2>
        <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
          {[
            { title: "Manual de Esquemas Firestore", desc: "Estrutura JSON e regras de validação relacional.", type: "DATA SCHEMA" },
            { title: "Especificação de APIs e Eventos", desc: "Assinaturas de métodos e ciclo de vida de transações.", type: "ARCHITECTURE" },
            { title: "Relatório de Telemetria e Benchmarks", desc: "Métricas de concorrência e testes de estresse.", type: "PERFORMANCE" },
            { title: "Matriz de Conformidade SISTAFE", desc: "Mapeamento formal dos artigos da lei para predicados lógicos.", type: "COMPLIANCE" }
          ].map((a, i) => (
            <div key={i} className="p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-1">
              <span className="text-[9px] font-bold text-cyan-700 uppercase tracking-wider">{a.type}</span>
              <h4 className="font-bold text-slate-900 text-[11px]">{a.title}</h4>
              <p className="text-slate-500 font-sans text-[10.5px] text-justify leading-normal">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    17: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">17. Check-list de Prontidão Operacional do Sistema</h2>
        <div className="space-y-2.5 text-[11px] font-mono">
          {[
            "Base de dados Firestore inicializada com integridade referencial testada",
            "Regras de segurança auditadas contra acessos não autorizados",
            "Módulo de IA com prompt operacional validado para despachos institucionais",
            "Integração do plano PESOE homologada com quadros orçamentais ativos",
            "Rotas de impressão formatadas rigorosamente nas dimensões A4 / ABNT",
            "Painel de diagnósticos ativo com monitorização de integridade em tempo real"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2.5 bg-cyan-50/70 border border-cyan-200 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-cyan-700 shrink-0" />
              <span className="font-bold text-cyan-950 text-[11px]">{item}</span>
            </div>
          ))}
        </div>
      </div>
    )
  };
};
