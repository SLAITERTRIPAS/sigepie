import React from "react";
import { 
  ShieldCheck, Target, AlertTriangle, 
  ChevronRight, CheckCircle2, GraduationCap, BookOpen, Compass, Printer
} from "lucide-react";
import { ChapterDef } from "./manualContentsTecnica";

export const getChapterContentHumana = (
  chapters: ChapterDef[], 
  setActiveChapter: (id: number) => void
): Record<number, React.ReactNode> => {
  return {
    1: (
      <div className="space-y-6 flex-1">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10.5px] font-bold mb-1">
              <BookOpen className="w-3.5 h-3.5" /> INTRODUÇÃO E RESUMO EXECUTIVO
            </div>
            <h2 className="font-black text-slate-900 text-[13px]">1. Enquadramento Estratégico e Resumo da Governação SIGEP</h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">REVISÃO INSTITUCIONAL 2026</span>
        </div>
        <div className="space-y-4 text-slate-700 text-justify text-[11.5px] leading-relaxed">
          <p>
            O SIGEP foi desenvolvido como uma solução de vanguarda para a modernização administrativa, focada na transparência, celeridade e segurança jurídica dos processos nas Instituições de Ensino Superior em Moçambique.
          </p>
          <div className="p-6 bg-white border-2 border-slate-900 rounded-xl shadow-xl space-y-6">
            <div className="text-center space-y-1.5 border-b border-slate-200 pb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Template Oficial de Resumo Institucional</span>
              <h3 className="font-black text-slate-900 text-lg uppercase">SIGEP: SISTEMA INTEGRADO DE GESTÃO DE PROCESSOS</h3>
            </div>
            <div className="grid grid-cols-2 gap-6 text-[10.5px]">
              <div className="space-y-3">
                <section>
                  <h4 className="font-black text-slate-900 uppercase text-[10px] mb-1">Visão Geral</h4>
                  <p>Plataforma única que integra planeamento, execução e monitoria, eliminando a fragmentação documental e as falhas de comunicação inter-setorial.</p>
                </section>
                <section>
                  <h4 className="font-black text-slate-900 uppercase text-[10px] mb-1">Objetivos</h4>
                  <p>Assegurar a conformidade absoluta com o SISTAFE, otimizar o tempo dos gestores e garantir que cada decisão seja baseada em dados reais e auditáveis.</p>
                </section>
              </div>
              <div className="space-y-3">
                <section>
                  <h4 className="font-black text-slate-900 uppercase text-[10px] mb-1">Impacto Esperado</h4>
                  <p>Desburocratização radical, economia de recursos materiais e fortalecimento da integridade institucional através de fluxos digitais rastreáveis.</p>
                </section>
                <section>
                  <h4 className="font-black text-slate-900 uppercase text-[10px] mb-1">Considerações</h4>
                  <p>O sistema é um pilar da modernização, servindo como modelo de excelência na gestão pública digital universitária em Moçambique.</p>
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[10.5px] font-bold mb-1">
              <GraduationCap className="w-3.5 h-3.5 text-slate-700" /> Fundamentação Sociotécnica e Epistêmica
            </div>
            <h2 className="font-black text-slate-900 text-[13px]">2. Índice Estruturado do Documento (Início da Contagem na Página 3)</h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">17 Capítulos Integrados</span>
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
                <span className="text-[11.5px] text-slate-800 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0 group-hover:bg-slate-900 transition-colors">
                    {c.id < 10 ? `0${c.id}` : c.id}
                  </span>
                  <span className="font-bold">{c.title.replace(/^\d+\.\s*/, '')}</span>
                </span>
                <div className="flex-1 border-b border-dotted border-slate-300 mx-3" />
                <span className="text-[10.5px] font-medium text-slate-500 mr-2">pág. {pageNum}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>
    ),
    3: (
      <div className="space-y-6 flex-1">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded font-bold text-[10.5px]">
            <BookOpen className="w-3.5 h-3.5 text-slate-700" /> Epistemologia dos Sistemas de Informação na Gestão Universitária
          </div>
          <h2 className="font-black text-slate-900 text-[13px]">3. Resumo Executivo: Concepção Sociotécnica e Mediação do Conhecimento Institucional</h2>
        </div>
        
        <div className="space-y-4 text-slate-700 text-justify text-[11.5px] leading-relaxed">
          <p>
            O <strong>SIGEP (Sistema Integrado de Gestão de Processo / SIGEPI)</strong> consubstancia uma abordagem sociotécnica avançada, concebida sob os preceitos fundamentais da Ciência da Informação e da Teoria Geral dos Sistemas. O projeto compreende a tecnologia não como mero fim utilitário, mas como um instrumento emancipador do trabalho humano, destinado a eliminar o desgaste das rotinas burocráticas e devolver tempo de qualidade aos docentes, pesquisadores, discentes e gestores das Instituições de Ensino Superior.
          </p>

          <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-lg space-y-6 print:shadow-none print:border-slate-300">
            <div className="text-center space-y-2 border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Modelo de Resumo para Divulgação Institucional</span>
              <h3 className="font-black text-slate-900 text-lg uppercase tracking-normal">A HUMANIZAÇÃO DA GESTÃO ATRAVÉS DO SIGEP</h3>
              <p className="text-[10px] text-slate-500 font-medium italic">Resumo Executivo para Conselhos e Comunidade Académica</p>
            </div>

            <div className="space-y-5 text-[11px] leading-relaxed">
              <section>
                <h4 className="font-black text-slate-900 flex items-center gap-2 mb-1">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full" /> Visão Geral
                </h4>
                <p className="text-slate-600 text-justify">O SIGEP é uma plataforma de governação digital que prioriza o bem-estar dos profissionais e a transparência pública, transformando a complexidade administrativa em processos simples e fluidos.</p>
              </section>

              <div className="grid grid-cols-2 gap-6">
                <section>
                  <h4 className="font-black text-slate-900 flex items-center gap-2 mb-1">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" /> Valor Humano
                  </h4>
                  <p className="text-slate-600">Elimina a ansiedade burocrática, garante a equidade no tratamento de processos e preserva a memória histórica das carreiras dos servidores.</p>
                </section>
                <section>
                  <h4 className="font-black text-slate-900 flex items-center gap-2 mb-1">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" /> Impacto Social
                  </h4>
                  <p className="text-slate-600">Assegura que os recursos públicos sejam geridos com ética e integridade, revertendo em melhorias diretas na qualidade do ensino e pesquisa.</p>
                </section>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
              <span className="text-[9px] font-medium text-slate-400 italic">SIGEP: Tecnologia ao serviço da Humanidade.</span>
              <button className="text-[9px] font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1 uppercase tracking-wider cursor-pointer">
                <Printer className="w-3 h-3" /> Imprimir Resumo
              </button>
            </div>
          </div>
          
          <p>
            Ao integrar o planeamento orçamentário (PESOE), a administração de recursos humanos, o patrimônio e a tramitação de expedientes num ecossistema digital límpido e transparente, o SIGEP democratiza o acesso à informação, promove a justiça processual e assegura que a tomada de decisões institucionais seja orientada pela clareza ética, rigor pedagógico e conformidade estrita com o SISTAFE.
          </p>
          
          <div className="p-5 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-sm">
            <h4 className="text-emerald-400 font-bold text-[11.5px] mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" /> Princípios Estruturantes da Abordagem de Sistemas de Informação
            </h4>
            <div className="grid grid-cols-2 gap-4 text-[10.5px]">
              <div>
                <span className="text-white font-bold block text-[11px]">Dignidade Laboral & Desoneração</span>
                <span className="text-slate-300">Eliminação de tarefas mecânicas repetitivas, reduzindo a ansiedade funcional e o estresse administrativo.</span>
              </div>
              <div>
                <span className="text-white font-bold block text-[11px]">Ergonomia Cognitiva Universal</span>
                <span className="text-slate-300">Interfaces acessíveis e compreensíveis para todos os níveis de escolaridade e graus de letramento digital.</span>
              </div>
              <div>
                <span className="text-white font-bold block text-[11px]">Transparência e Ética Pública</span>
                <span className="text-slate-300">Visibilidade integral dos trâmites administrativos, coibindo privilégios e assegurando equidade de tratamento.</span>
              </div>
              <div>
                <span className="text-white font-bold block text-[11px]">Memória e Continuidade Institucional</span>
                <span className="text-slate-300">Preservação fidedigna do patrimônio documental e histórico das instituições de ensino superior.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    4: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">4. Apresentação do Sistema: Arquitetura Sociotécnica e Ecologia da Informação dos 9 Blocos</h2>
        <div className="space-y-4 text-slate-700 text-justify text-[11.5px] leading-relaxed">
          <p>
            Sob o prisma da epistemologia dos sistemas, a instituição universitária constitui uma ecologia viva de saberes e relações humanas. O SIGEP estrutura-se em 9 blocos funcionais harmoniosos, concebidos para refletir a organicidade do quotidiano acadêmico: desde a recepção e acolhimento do cidadão até a deliberação estratégica dos órgãos colegiados, a gestão prudente dos bens públicos e a regulação de produtos e tabelas de referência orçamentária.
          </p>
          <div className="grid grid-cols-2 gap-3.5 pt-1">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <h4 className="font-bold text-slate-900 text-[11.5px]">Integração Sistêmica Não-Intrusiva</h4>
              <p className="text-[10.5px] text-slate-600 leading-normal">
                Fluxos de trabalho que respeitam o ritmo natural de análise dos servidores, apoiando a inteligência humana com dados precisos em vez de impor automatismos rígidos descontextualizados.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <h4 className="font-bold text-slate-900 text-[11.5px]">Clareza Comunicacional</h4>
              <p className="text-[10.5px] text-slate-600 leading-normal">
                Terminologia oficial clara e despachos redigidos com precisão vernácula, facilitando o diálogo institucional entre os serviços centrais e as faculdades descentralizadas.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
    5: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">5. Contexto Institucional: A Universidade como Comunidade de Aprendizagem e Serviço</h2>
        <div className="space-y-4 text-slate-700 text-[11.5px] leading-relaxed text-justify">
          <p>
            Historicamente, a fragmentação dos dados entre recursos humanos, contabilidade, gestão de patrimônio e secretarias docentes gerava desconfiança mútua, atrasos na progressão de carreiras e morosidade na emissão de declarações para os estudantes. O SIGEP restabelece os laços de confiança e transparência institucional, conectando a Direção Nacional do Ensino Superior (DNES), a DICOSSER, os corpos diretivos e a comunidade acadêmica num único ambiente colaborativo.
          </p>
          <div className="p-4 bg-slate-800 text-slate-100 rounded-lg border border-slate-700 space-y-2">
            <h4 className="text-emerald-400 font-bold text-[11.5px]">A Missão Humanizadora da Tecnologia</h4>
            <p className="italic text-[11px] text-slate-200 leading-normal">
              "Um sistema de informação universitário alcança a sua excelência quando se torna invisível pela sua facilidade de uso, permitindo que professores eduquem, investigadores descubram e funcionários técnicos sirvam à sociedade com serenidade e reconhecimento profissional."
            </p>
          </div>
        </div>
      </div>
    ),
    6: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">6. Perfis Institucionais e Matriz Ética de Acesso e Responsabilidade</h2>
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          {[
            { role: "Direção Nacional e Órgãos Tutelares", desc: "Acesso a relatórios agregados de gestão, monitorização de indicadores globais de ensino e salvaguarda do cumprimento das metas públicas nacionais." },
            { role: "Diretores de Unidade e Conselhos", desc: "Acompanhamento orçamental humanizado, valorização das condições de trabalho das faculdades e celeridade na tramitação de expedientes discentes." },
            { role: "Técnicos Administrativos e de RH", desc: "Gestão digna e transparente das carreiras docentes e técnicas, processamento seguro de benefícios de assistência médica e registo de efetivos." },
            { role: "Gestores UGEA e Fornecedores", desc: "Relações comerciais orientadas pela integridade, celeridade no pagamento a parceiros e zelo impecável pelo erário público universitário." }
          ].map((item, i) => (
            <div key={i} className="p-3.5 border border-slate-200 bg-white rounded-lg hover:border-slate-400 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">
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
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">7. Justificativa Sociotécnica e Relevância Ético-Institucional</h2>
        <div className="space-y-4 text-slate-700 text-[11.5px] leading-relaxed text-justify">
          <p>
            A implementação do SIGEP fundamenta-se na necessidade urgente de assegurar justiça substantiva, equidade procedimental e salvaguarda do bem público nas Instituições de Ensino Superior:
          </p>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-slate-950 text-[11.5px] mb-0.5">Transparência e Responsabilidade Fiduciária (SISTAFE)</h4>
                <p className="text-slate-600 text-[10.5px] leading-normal">
                  Cada cêntimo do orçamento universitário é rastreado com precisão, garantindo que os recursos da educação cheguem efetivamente às salas de aula, laboratórios e programas de assistência social.
                </p>
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
              <Target className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-slate-950 text-[11.5px] mb-0.5">Segurança Jurídica e Respeito aos Direitos dos Trabalhadores</h4>
                <p className="text-slate-600 text-[10.5px] leading-normal">
                  Registo imutável de atos administrativos que previne perdas de tempo de serviço, omissões em promoções de carreira e desvios patrimoniais.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    8: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">8. Objetivos Estratégicos e Filosofia de Gestão Universitária</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-slate-800 pl-3.5 space-y-1">
            <h4 className="font-black text-slate-900 text-[11.5px] uppercase tracking-wider">Objetivo Geral do Sistema</h4>
            <p className="text-justify text-slate-700 text-[11.5px] italic leading-relaxed">
              "Estabelecer um ambiente informacional integrado, seguro e transparente que fortaleça a governança democrática, agilize o atendimento à comunidade universitária e garanta a excelência no cumprimento da missão pública do Ensino Superior."
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Integração Comunitária", desc: "Comunicação fluida entre departamentos sem barreiras burocráticas ou disputas departamentais." },
              { label: "Celeridade Solidária", desc: "Resolução atempada de pedidos de estudantes, professores e funcionários técnicos com empatia e precisão." },
              { label: "Rastreabilidade Cidadã", desc: "Prestação de contas contínua perante os órgãos de fiscalização do Estado e a sociedade civil." }
            ].map((obj, i) => (
              <div key={i} className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                <h5 className="font-black text-slate-900 text-[11px] mb-1">{obj.label}</h5>
                <p className="text-slate-600 text-justify text-[10px] leading-normal">{obj.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    9: (
      <div className="space-y-6 flex-1">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="font-black text-slate-900 text-[13px]">9. Descrição Funcional dos 9 Blocos Operacionais da Instituição</h2>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
            9 Dimensões de Gestão
          </span>
        </div>
        <div className="space-y-2.5 text-[11px]">
          {[
            { 
              bloco: "Bloco 1: Apresentação e Identificação Institucional", 
              desc: "Acolhimento ao utilizador, autenticação segura multi-papel, personalização de acessos, alternância de setores e orientação clara sobre os serviços disponíveis." 
            },
            { 
              bloco: "Bloco 2: Órgãos Colegiados e Gestão Estratégica", 
              desc: "Painéis executivos para a Reitoria, Direções e DICOSSER, acompanhamento contínuo de deliberações e facilitação de despachos institucionais de alta celeridade." 
            },
            { 
              bloco: "Bloco 3: Planificação e Orçamento Participativo (PESOE)", 
              desc: "Quadros de atividade 1.1, 1.2 e 1.3, controle de rubricas orçamentárias SISTAFE, alocação de docentes e alinhamento com os planos pedagógicos plurianuais." 
            },
            { 
              bloco: "Bloco 4: Serviços Centrais e Vida Institucional", 
              desc: "Gestão integrada de pessoal (Docentes, CTA e Técnicos), Processo Individual, Registo Académico DRA, Apoio ao Estudante DAE com bolsas, património e compras UGEA." 
            },
            { 
              bloco: "Bloco 5: Inteligência Avançada, Workflows e Suporte", 
              desc: "Copiloto inteligente, fluxos de despacho em grafo, diagnóstico preventivo com preservação inegociável de dados e assinaturas digitais com selo de autenticidade." 
            },
            { 
              bloco: "Bloco 6: Emissão e Validação de Atos Oficiais", 
              desc: "Cartões funcionais de identificação com QR Code, declarações de serviço, certidões, guias de marcha e termos de inventário com fé pública no padrão oficial A4." 
            },
            { 
              bloco: "Bloco 7: Indicadores e Conhecimento Organizacional", 
              desc: "Relatórios de desempenho institucional, Business Intelligence, análises de efetivos e subsídios fidedignos para o planeamento estratégico e prestação de contas." 
            },
            { 
              bloco: "Bloco 8: Módulos Gerais e Memória da Universidade", 
              desc: "Cadastros estruturantes de efetivo discente e docente, catálogo de disciplinas, gestão de espaços físicos, graduados, planos individuais de trabalho e Memória Descritiva." 
            },
            { 
              bloco: "Bloco 9: Gestão de Produtos, Preços e Referência Orçamentária", 
              desc: "Catálogo mestre unificado de bens e serviços de consumo, gestão de preços de referência de mercado em Meticais e automação de orçamentação no PESOE e UGEA." 
            }
          ].map((b, i) => (
            <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
              <span className="w-5 h-5 rounded bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
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
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">10. Metodologia de Concepção e Engenharia Sociotécnica</h2>
        <div className="space-y-4 text-slate-700 text-[11.5px] leading-relaxed text-justify">
          <p>
            O desenvolvimento do SIGEP seguiu métodos participativos com escuta ativa de funcionários técnicos, professores e gestores. A engenharia do software adotou tecnologias web modernas que garantem alta acessibilidade, velocidade de carregamento mesmo em conexões de baixa largura de banda e total independência de equipamentos dispendiosos.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <h4 className="font-bold text-slate-900 text-[11px]">Design Centrado na Pessoa Humana</h4>
              <p className="text-[10px] text-slate-600 leading-normal">
                Interface límpida, tipografia legível e contraste balanceado para prevenir a fadiga visual dos profissionais que operam o sistema diariamente.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <h4 className="font-bold text-slate-900 text-[11px]">Segurança e Confidencialidade Ética</h4>
              <p className="text-[10px] text-slate-600 leading-normal">
                Proteção estrita dos dados pessoais e registros médicos dos servidores, em conformidade com as leis de privacidade e direitos individuais.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
    11: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">11. Indicadores de Impacto Humano e Qualidade de Atendimento</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { metric: "100%", title: "Respeito a Prazos Regimentais", desc: "Atenuamento de pendências e resposta célere a requerimentos de docentes e discentes." },
            { metric: "-90%", title: "Desgaste Físico e Deslocações", desc: "Eliminação da necessidade de deslocações constantes entre edifícios para assinaturas." },
            { metric: "Zero Perdas", title: "Integridade de Processos", desc: "Fim do extravio de processos físicos e da necessidade de reinício de pedidos." },
            { metric: "Sustentabilidade", title: "Responsabilidade Ecológica", desc: "Preservação do meio ambiente através da transição definitiva para o modelo sem papel." }
          ].map((k, i) => (
            <div key={i} className="p-3.5 border border-slate-200 bg-white rounded-lg space-y-1">
              <span className="text-xl font-bold text-slate-800 block">{k.metric}</span>
              <h4 className="font-bold text-slate-900 text-[11px]">{k.title}</h4>
              <p className="text-slate-500 text-[10px] leading-tight text-justify">{k.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    12: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">12. Matriz de Gestão de Riscos e Salvaguarda Institucional</h2>
        <div className="overflow-hidden border border-slate-200 rounded-lg text-[10.5px]">
          <table className="w-full text-left">
            <thead className="bg-slate-800 text-white uppercase text-[9.5px] font-bold">
              <tr>
                <th className="px-3 py-2">Desafio Identificado</th>
                <th className="px-3 py-2">Gravidade</th>
                <th className="px-3 py-2">Resposta Humana e Institucional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-3 py-2.5 font-bold text-slate-900">Resistência à Mudança Cultural</td>
                <td className="px-3 py-2.5"><span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded text-[9px] font-bold">RELEVANTE</span></td>
                <td className="px-3 py-2.5 text-slate-600">Capacitação acolhedora, tutoria entre pares e suporte contínuo sem constrangimentos.</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-bold text-slate-900">Assimetrias de Acesso à Internet</td>
                <td className="px-3 py-2.5"><span className="px-1.5 py-0.5 bg-blue-100 text-blue-900 rounded text-[9px] font-bold">MODERADA</span></td>
                <td className="px-3 py-2.5 text-slate-600">Modo offline inteligente que permite continuar o trabalho sem perda de dados digitados.</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-bold text-slate-900">Fadiga por Sobrecarga de Dados</td>
                <td className="px-3 py-2.5"><span className="px-1.5 py-0.5 bg-slate-100 text-slate-900 rounded text-[9px] font-bold">ATENÇÃO</span></td>
                <td className="px-3 py-2.5 text-slate-600">Apresentação progressiva da informação e resumos executivos que poupam tempo de leitura.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
    13: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">13. Sustentabilidade, Manutenção e Cultura Organizacional</h2>
        <div className="space-y-3 text-slate-700 text-[11.5px] leading-relaxed text-justify">
          <p>
            A perenidade do sistema sustenta-se na apropriação coletiva do conhecimento. Ao invés da dependência perpétua de consultorias externas, o SIGEP fortalece as competências locais das equipes técnicas internas através de formação contínua, documentação clara e autonomia institucional.
          </p>
        </div>
      </div>
    ),
    14: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">14. Plano de Adoção e Acompanhamento Pedagógico da Comunidade</h2>
        <div className="space-y-2.5 text-[11px]">
          {[
            { phase: "Fase 01: Sensibilização e Preparação Conjunta", dur: "Mês 01", desc: "Apresentação dialogada com as direções, recolha de necessidades específicas e formação de tutores setoriais." },
            { phase: "Fase 02: Transição Assistida e Prática Supervisionada", dur: "Mês 02", desc: "Uso assistido dos módulos funcionais com acompanhamento diário e acolhimento de dúvidas operacionais." },
            { phase: "Fase 03: Autonomia Plena e Consolidação de Boas Práticas", dur: "Mês 03+", desc: "Incorporação definitiva na rotina universitária e celebração dos resultados de economia de tempo e transparência." }
          ].map((c, i) => (
            <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-800 font-bold">{c.phase}</span>
                <span className="text-[9.5px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">{c.dur}</span>
              </div>
              <p className="text-slate-600 text-[10.5px] text-justify leading-normal">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    15: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">15. Valor Social e Retorno Institucional da Solução</h2>
        <div className="space-y-3 text-slate-700 text-[11.5px] leading-relaxed text-justify">
          <p>
            O retorno do investimento traduz-se no fortalecimento da credibilidade pública da universidade, na celeridade dos serviços prestados à juventude moçambicana e no alívio substancial das cargas de trabalho administrativo, resultando num clima institucional harmonioso e produtivo.
          </p>
        </div>
      </div>
    ),
    16: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">16. Documentação Complementar e Guias de Apoio à Comunidade</h2>
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          {[
            { title: "Manual de Acolhimento e Uso dos Módulos", desc: "Guia passo a passo com linguagem clara e ilustrações explicativas.", type: "PEDAGÓGICO" },
            { title: "Cartilha de Ética e Privacidade da Informação", desc: "Normas de proteção de dados e responsabilidade institucional.", type: "ÉTICA E DIREITO" },
            { title: "Diretrizes de Acessibilidade e Inclusão Digital", desc: "Orientações para o atendimento inclusivo a todos os funcionários.", type: "INCLUSÃO" },
            { title: "Quadro de Boas Práticas na Gestão do PESOE", desc: "Exemplos práticos de planeamento orçamentário participativo.", type: "GOVERNANÇA" }
          ].map((a, i) => (
            <div key={i} className="p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-1">
              <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">{a.type}</span>
              <h4 className="font-bold text-slate-900 text-[11px]">{a.title}</h4>
              <p className="text-slate-500 text-[10.5px] text-justify leading-normal">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    17: (
      <div className="space-y-6 flex-1">
        <h2 className="font-black text-slate-900 border-b border-slate-200 pb-2 text-[13px]">17. Check-list de Prontidão Institucional e Compromisso Ético</h2>
        <div className="space-y-2.5 text-[11px]">
          {[
            "Capacitação e acolhimento das equipes concluídos em todas as unidades",
            "Mecanismos de apoio e tutoria a servidores em pleno funcionamento",
            "Canais de diálogo e sugestões abertos à comunidade acadêmica",
            "Homologação dos relatórios orçamentais em conformidade com o SISTAFE",
            "Formatos de impressão e certidões alinhados com o padrão institucional ABNT",
            "Compromisso permanente com a dignidade do trabalho e a transparência pública"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0" />
              <span className="font-bold text-slate-900 text-[11px]">{item}</span>
            </div>
          ))}
        </div>
      </div>
    )
  };
};
