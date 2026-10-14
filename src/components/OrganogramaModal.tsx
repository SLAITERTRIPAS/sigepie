import React, { useState, useMemo, useRef } from "react";
import { 
  X, 
  Printer, 
  Download, 
  Building2, 
  Users, 
  Network, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Briefcase, 
  ShieldCheck, 
  GitFork, 
  Filter,
  UserCheck,
  Building,
  Sparkles,
  Maximize2,
  ExternalLink
} from "lucide-react";
import { OrgaoModel, DirecaoModel, DepartamentoModel } from "../lib/instituicaoEstruturaService";

export type OrganogramaType = "instituicao" | "colaboradores";

export interface OrganogramaModalProps {
  isOpen: boolean;
  onClose: () => void;
  instituicao: any;
  estruturaOrgaos: OrgaoModel[];
  colaboradores: any[];
  users: any[];
  initialType?: OrganogramaType;
  onSelectOrgao?: (orgaoNome: string, instId: string) => void;
}

// Interface do nó para a árvore genealógica de colaboradores
interface ColabNode {
  id: string;
  nome: string;
  cargo: string;
  cargoChefia?: string;
  departamento?: string;
  direcao?: string;
  setor?: string;
  email?: string;
  telefone?: string;
  nivelHierarquico: number; // 1: Diretor-Geral / Topo, 2: Diretores Centrais / Serviços, 3: Chefes de Departamento, 4: Chefes de Repartição / Setores, 5: Técnicos, 6: Agentes de Serviço / Apoio
  categoria: "dg" | "direcao" | "departamento" | "reparticao" | "tecnico" | "agente";
  subordinados: ColabNode[];
}

export default function OrganogramaModal({
  isOpen,
  onClose,
  instituicao,
  estruturaOrgaos,
  colaboradores,
  users,
  initialType = "instituicao",
}: OrganogramaModalProps) {
  const [activeType, setActiveType] = useState<OrganogramaType>(initialType);
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("todos");
  
  // Drill-down state for "instituicao" view
  const [drillStack, setDrillStack] = useState<{type: "orgao" | "direcao" | "departamento" | "reparticao", nome: string, data: any}[]>([]);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Unificação de colaboradores e contas de utilizador da instituição
  const unifiedColabs = useMemo(() => {
    const instId = instituicao?.id || "isps";
    const map = new Map<string, any>();

    (colaboradores || []).forEach((c) => {
      const colabInst = c.instituicaoId || "isps";
      if (instId !== "isps" && colabInst !== instId) return;

      const key = (c.id || c.email || c.nuit || c.nome || "").toLowerCase().trim();
      if (!key) return;
      map.set(key, {
        id: c.id || c.docId || key,
        nome: c.nome || c.name || "Colaborador",
        cargo: c.cargo || "Técnico",
        cargoChefia: c.cargoChefia || "",
        departamento: c.departamento || "",
        direcao: c.direcao || "",
        setor: c.setor || c.reparticao || "",
        email: c.email || "",
        telefone: c.telefone || "",
        instituicaoId: colabInst,
      });
    });

    (users || []).forEach((u) => {
      const userInst = u.instituicaoId || "isps";
      if (instId !== "isps" && userInst !== instId) return;

      const key = (u.collabId || u.id || u.email || u.nuit || u.nome || u.name || "").toLowerCase().trim();
      if (!key) return;

      if (map.has(key)) {
        const existing = map.get(key);
        map.set(key, {
          ...existing,
          ...u,
          id: existing.id || u.id,
          nome: existing.nome || u.nome || u.name,
          cargo: existing.cargo || u.cargo,
          cargoChefia: existing.cargoChefia || u.cargoChefia,
          departamento: existing.departamento || u.departamento,
          direcao: existing.direcao || u.direcao,
          setor: existing.setor || u.setor,
        });
      } else {
        map.set(key, {
          id: u.id || key,
          nome: u.nome || u.name || "Utilizador",
          cargo: u.cargo || "Técnico",
          cargoChefia: u.cargoChefia || "",
          departamento: u.departamento || "",
          direcao: u.direcao || "",
          setor: u.setor || u.reparticao || "",
          email: u.email || "",
          telefone: u.telefone || "",
          instituicaoId: userInst,
        });
      }
    });

    return Array.from(map.values());
  }, [colaboradores, users, instituicao]);

  // Função para determinar o nível e categoria hierárquica do colaborador
  const getHierarchyInfo = (colab: any): { nivel: number; categoria: "dg" | "direcao" | "departamento" | "reparticao" | "tecnico" | "agente" } => {
    const raw = `${colab.cargoChefia || ""} ${colab.cargo || ""} ${colab.nome || ""}`.toLowerCase();

    // 1. Topo: Diretor-Geral / Reitor / Presidente
    if (
      raw.includes("diretor geral") ||
      raw.includes("diretor-geral") ||
      raw.includes("diretora geral") ||
      raw.includes("diretora-geral") ||
      raw.includes("presidente") ||
      raw.includes("reitor") ||
      (colab.direcao === "Gabinete do Diretor-Geral" && raw.includes("diretor"))
    ) {
      return { nivel: 1, categoria: "dg" };
    }

    // 2. Diretores Centrais, Divisões e Serviços Centrais
    if (
      raw.includes("diretor de divisao") ||
      raw.includes("diretor da divisao") ||
      raw.includes("diretor de servico") ||
      raw.includes("diretora de divisao") ||
      raw.includes("diretor da dicosafa") ||
      raw.includes("diretor da dicosser") ||
      raw.includes("diretor adjunto") ||
      raw.includes("diretora adjunta") ||
      raw.includes("vice-reitor") ||
      raw.includes("vice presidente") ||
      (colab.direcao && (raw.includes("diretor") || raw.includes("diretora")) && !raw.includes("diretor de curso"))
    ) {
      return { nivel: 2, categoria: "direcao" };
    }

    // 3. Chefias de Departamento
    if (
      raw.includes("chefe de departamento") ||
      raw.includes("chefe do departamento") ||
      raw.includes("chefe da ugea") ||
      raw.includes("chefe do gdg") ||
      raw.includes("chefe dpep") ||
      raw.includes("chefe depto") ||
      raw.includes("chefe dee") ||
      raw.includes("chefe decc") ||
      raw.includes("chefe decm") ||
      raw.includes("chefe ddg") ||
      raw.includes("chefe dta") ||
      raw.includes("chefe dra") ||
      raw.includes("chefe da dicosafa") ||
      (colab.departamento && raw.includes("chefe"))
    ) {
      return { nivel: 3, categoria: "departamento" };
    }

    // 4. Chefias de Repartição / Setores / Coordenadores
    if (
      raw.includes("chefe de reparticao") ||
      raw.includes("chefe da reparticao") ||
      raw.includes("chefe de setor") ||
      raw.includes("chefe do setor") ||
      raw.includes("responsavel de setor") ||
      raw.includes("responsavel do setor") ||
      raw.includes("responsavel") ||
      raw.includes("coordenador") ||
      raw.includes("coordenadora") ||
      raw.includes("diretor do curso") ||
      raw.includes("diretor de curso") ||
      raw.includes("secretaria executiva") ||
      Boolean(colab.cargoChefia && colab.cargoChefia.trim() !== "") ||
      (colab.setor && raw.includes("chefe"))
    ) {
      return { nivel: 4, categoria: "reparticao" };
    }

    // 6. Agentes de Serviço / Apoio Operacional / Motoristas / Auxiliares / Guardas
    if (
      raw.includes("agente de servico") ||
      raw.includes("agente de serviço") ||
      raw.includes("agente") ||
      raw.includes("motorista") ||
      raw.includes("guarda") ||
      raw.includes("auxiliar") ||
      raw.includes("servente") ||
      raw.includes("operador") ||
      raw.includes("seguranca") ||
      raw.includes("segurança") ||
      raw.includes("continuo") ||
      raw.includes("contínuo") ||
      raw.includes("estafeta") ||
      raw.includes("copeiro") ||
      raw.includes("jardineiro")
    ) {
      return { nivel: 6, categoria: "agente" };
    }

    // 5. Colaboradores Técnicos / Docentes / Especialistas / Assistentes Técnicos
    return { nivel: 5, categoria: "tecnico" };
  };

  // Construção da árvore genealógica de colaboradores (Árvore Hierárquica Humana)
  const colabHierarchyTree = useMemo(() => {
    if (unifiedColabs.length === 0) return [];

    // Classificar e mapear nós
    const classifiedList: ColabNode[] = unifiedColabs.map((c) => {
      const info = getHierarchyInfo(c);
      return {
        id: c.id,
        nome: c.nome,
        cargo: c.cargo,
        cargoChefia: c.cargoChefia,
        departamento: c.departamento,
        direcao: c.direcao,
        setor: c.setor,
        email: c.email,
        telefone: c.telefone,
        nivelHierarquico: info.nivel,
        categoria: info.categoria,
        subordinados: [],
      };
    });

    // Separar estritamente por níveis hierárquicos
    const nivel1 = classifiedList.filter((n) => n.nivelHierarquico === 1);
    const nivel2 = classifiedList.filter((n) => n.nivelHierarquico === 2);
    const nivel3 = classifiedList.filter((n) => n.nivelHierarquico === 3);
    const nivel4 = classifiedList.filter((n) => n.nivelHierarquico === 4);
    const nivel5 = classifiedList.filter((n) => n.nivelHierarquico === 5);
    const nivel6 = classifiedList.filter((n) => n.nivelHierarquico === 6);

    // Se não houver nivel 1 explícito, criar um nó institucional topo com o titular da instituição
    let roots: ColabNode[] = [...nivel1];
    if (roots.length === 0) {
      roots = [{
        id: "root_institution_head",
        nome: instituicao?.nome ? `Direção Geral - ${instituicao.nome}` : "Direção Geral da Instituição",
        cargo: "Órgão Superior de Gestão",
        departamento: "Gabinete do Diretor-Geral",
        nivelHierarquico: 1,
        categoria: "dg",
        subordinados: [],
      }];
    }

    // Função de correspondência por texto normalizado
    const isSameText = (a?: string, b?: string) => {
      if (!a || !b) return false;
      const cleanA = a.toLowerCase().trim().replace(/[-_/]/g, " ");
      const cleanB = b.toLowerCase().trim().replace(/[-_/]/g, " ");
      return cleanA === cleanB || cleanA.includes(cleanB) || cleanB.includes(cleanA);
    };

    // 1. Ligar Nível 6 (Agentes de Serviço/Apoio) e Nível 5 (Técnicos) aos seus Chefes imediatos
    const linkOperationalMember = (member: ColabNode) => {
      // 1.1 Tentar ligar ao Chefe de Repartição / Setor (Nível 4) correspondente
      const boss4 = nivel4.find((b) => 
        (member.setor && b.setor && isSameText(member.setor, b.setor)) ||
        (member.departamento && b.departamento && isSameText(member.departamento, b.departamento) && b.setor && member.setor && isSameText(member.setor, b.setor))
      );

      if (boss4) {
        boss4.subordinados.push(member);
        return;
      }

      // 1.2 Se não tiver chefe de repartição, ligar ao Chefe do Departamento (Nível 3)
      const boss3 = nivel3.find((b) => 
        member.departamento && b.departamento && isSameText(member.departamento, b.departamento)
      );

      if (boss3) {
        boss3.subordinados.push(member);
        return;
      }

      // 1.3 Se não tiver chefe de depto, ligar ao Diretor Central (Nível 2)
      const boss2 = nivel2.find((b) => 
        member.direcao && b.direcao && isSameText(member.direcao, b.direcao)
      );

      if (boss2) {
        boss2.subordinados.push(member);
        return;
      }

      // 1.4 Fallback: ligar à Direção Geral (Raiz)
      roots[0].subordinados.push(member);
    };

    // Alocar Técnicos (Nível 5) e Agentes (Nível 6)
    nivel5.forEach(linkOperationalMember);
    nivel6.forEach(linkOperationalMember);

    // 2. Ligar Nível 4 (Chefes de Repartição / Setores) aos Departamentos (Nível 3) ou Direções (Nível 2)
    nivel4.forEach((r) => {
      const boss3 = nivel3.find((b) => 
        r.departamento && b.departamento && isSameText(r.departamento, b.departamento)
      );

      if (boss3) {
        boss3.subordinados.push(r);
        return;
      }

      const boss2 = nivel2.find((b) => 
        r.direcao && b.direcao && isSameText(r.direcao, b.direcao)
      );

      if (boss2) {
        boss2.subordinados.push(r);
        return;
      }

      roots[0].subordinados.push(r);
    });

    // 3. Ligar Nível 3 (Chefes de Departamento) às Direções Centrais (Nível 2)
    nivel3.forEach((d) => {
      const boss2 = nivel2.find((b) => 
        d.direcao && b.direcao && isSameText(d.direcao, b.direcao)
      );

      if (boss2) {
        boss2.subordinados.push(d);
        return;
      }

      roots[0].subordinados.push(d);
    });

    // 4. Ligar Nível 2 (Diretores Centrais) ao Diretor-Geral (Nível 1 / Raiz)
    nivel2.forEach((dir) => {
      roots[0].subordinados.push(dir);
    });

    return roots;
  }, [unifiedColabs, instituicao]);

  // Contadores globais para estatísticas do organograma
  const stats = useMemo(() => {
    let orgaosCount = estruturaOrgaos.length;
    let direcoesCount = 0;
    let deptsCount = 0;
    let reparticoesCount = 0;

    estruturaOrgaos.forEach((org) => {
      direcoesCount += (org.direcoes || []).length;
      (org.direcoes || []).forEach((d) => {
        deptsCount += (d.departamentos || []).length;
        (d.departamentos || []).forEach((dp) => {
          reparticoesCount += (dp.reparticoes || []).length;
        });
      });
    });

    const chefiasCount = unifiedColabs.filter((c) => {
      const info = getHierarchyInfo(c);
      return info.nivel <= 4;
    }).length;

    const tecnicosCount = unifiedColabs.filter((c) => {
      const info = getHierarchyInfo(c);
      return info.nivel === 5;
    }).length;

    const agentesCount = unifiedColabs.filter((c) => {
      const info = getHierarchyInfo(c);
      return info.nivel === 6;
    }).length;

    return {
      orgaosCount,
      direcoesCount,
      deptsCount,
      reparticoesCount,
      totalColaboradores: unifiedColabs.length,
      chefiasCount,
      tecnicosCount,
      agentesCount,
    };
  }, [estruturaOrgaos, unifiedColabs]);

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 bg-slate-950/90 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="bg-white w-screen h-screen rounded-none shadow-none flex flex-col border-0 overflow-hidden m-0">
        
        {/* CABEÇALHO DO MODAL */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-blue-900/60 shrink-0">
          <div className="flex items-center gap-4">
            {instituicao?.logo ? (
              <img
                src={instituicao.logo}
                alt={instituicao.nome}
                referrerPolicy="no-referrer"
                className="w-14 h-14 object-contain rounded-2xl bg-white p-1.5 shadow-md border border-white/20 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-blue-300 backdrop-blur-sm shrink-0 border border-white/10">
                <Building2 size={28} />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  Organograma Oficial
                </span>
                <span className="text-[10px] font-extrabold text-blue-200">
                  {instituicao?.provincia ? `${instituicao.provincia}, Moçambique` : "Estrutura Institucional"}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                {instituicao?.nome || "Instituto Superior Politécnico de Songo"}
              </h2>
              <p className="text-xs text-blue-200/90 font-medium line-clamp-1">
                {instituicao?.tipoActividades || "Ensino Superior e Investigação Científica"}
              </p>
            </div>
          </div>

          {/* SELETOR DE MODALIDADE DE ORGANOGRAMA */}
          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/15 self-stretch sm:self-auto justify-center">
            <button
              type="button"
              onClick={() => setActiveType("instituicao")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeType === "instituicao"
                  ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-400/40"
                  : "text-blue-100 hover:text-white hover:bg-white/10"
              }`}
            >
              <Building size={15} />
              <span>1. Órgãos da Instituição</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveType("colaboradores")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeType === "colaboradores"
                  ? "bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400/40"
                  : "text-blue-100 hover:text-white hover:bg-white/10"
              }`}
            >
              <Users size={15} />
              <span>2. Estrutura dos Colaboradores</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-extrabold">
                Genealógico
              </span>
            </button>
          </div>

          {/* BOTÕES DE FECHAR E IMPRIMIR */}
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer border border-white/10"
              title="Imprimir ou Guardar em PDF"
            >
              <Printer size={18} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 bg-white/10 hover:bg-red-600 text-white rounded-xl transition cursor-pointer border border-white/10"
              title="Fechar Janela"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* BARRA DE CONTROLES, PESQUISA E ZOOM */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeType === "instituicao"
                    ? "Filtrar órgãos, direções, departamentos..."
                    : "Filtrar por nome, cargo, chefia, setor..."
                }
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {activeType === "colaboradores" && (
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="todos">Todos os Níveis Hierárquicos</option>
                <option value="chefias">Apenas Cargos de Chefia (Níveis 1-4)</option>
                <option value="tecnicos">Apenas Técnicos (Nível 5)</option>
                <option value="agentes">Apenas Agentes de Serviço (Nível 6)</option>
              </select>
            )}
          </div>

          {/* BADGES DE ESTATÍSTICAS RÁPIDAS */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold text-slate-600">
            {activeType === "instituicao" ? (
              <>
                <span className="bg-blue-100/80 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-200">
                  {stats.orgaosCount} Órgãos
                </span>
                <span className="bg-indigo-100/80 text-indigo-900 px-2.5 py-1 rounded-lg border border-indigo-200">
                  {stats.direcoesCount} Direções
                </span>
                <span className="bg-emerald-100/80 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {stats.deptsCount} Departamentos
                </span>
                <span className="bg-purple-100/80 text-purple-900 px-2.5 py-1 rounded-lg border border-purple-200">
                  {stats.reparticoesCount} Repartições/Setores
                </span>
              </>
            ) : (
              <>
                <span className="bg-emerald-100/80 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {stats.totalColaboradores} Colaboradores
                </span>
                <span className="bg-amber-100/80 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200">
                  {stats.chefiasCount} Titulares de Chefia
                </span>
                <span className="bg-blue-100/80 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-200">
                  {stats.tecnicosCount} Técnicos
                </span>
                <span className="bg-slate-200/80 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-300">
                  {stats.agentesCount} Agentes de Serviço
                </span>
              </>
            )}

            {/* CONTROLES DE ZOOM */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 ml-2">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
                className="p-1 hover:bg-slate-100 text-slate-600 rounded cursor-pointer"
                title="Reduzir Visualização"
              >
                <ZoomOut size={14} />
              </button>
              <span className="px-1 font-mono text-[10px] text-slate-500 font-extrabold min-w-[38px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
                className="p-1 hover:bg-slate-100 text-slate-600 rounded cursor-pointer"
                title="Ampliar Visualização"
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="p-1 hover:bg-slate-100 text-slate-600 rounded cursor-pointer"
                title="Repor 100%"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ÁREA CENTRAL DE VISUALIZAÇÃO DO ORGANOGRAMA */}
        <div 
          ref={printAreaRef}
          className="flex-1 overflow-auto p-6 sm:p-10 bg-gradient-to-b from-slate-100/70 to-slate-200/50"
        >
          <div 
            style={{ 
              transform: `scale(${zoomLevel})`, 
              transformOrigin: "top center", 
              transition: "transform 0.15s ease-out" 
            }}
            className="w-full flex flex-col items-center"
          >
            
            {/* TIPO 1: ORGANOGRAMA DA INSTITUIÇÃO (ORGANIZADO POR ÓRGÃOS) */}
            {activeType === "instituicao" && (
              <div className="w-full max-w-7xl space-y-8 py-4">
                
                {/* Breadcrumbs for Drill-down */}
                {drillStack.length > 0 && (
                  <div className="flex items-center gap-2 mb-6 bg-white/80 backdrop-blur p-3 rounded-2xl border border-slate-200 shadow-sm w-max self-start sticky top-0 z-50">
                    <button
                      onClick={() => setDrillStack([])}
                      className="text-[11px] font-bold text-slate-500 hover:text-blue-600 transition"
                    >
                      Visão Geral
                    </button>
                    {drillStack.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <ChevronRight size={14} className="text-slate-300" />
                        <button
                          onClick={() => setDrillStack(drillStack.slice(0, idx + 1))}
                          className={`text-[11px] font-bold transition ${
                            idx === drillStack.length - 1 ? "text-blue-700" : "text-slate-500 hover:text-blue-600"
                          }`}
                        >
                          {step.nome}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {(() => {
                  const currentLevel = drillStack.length > 0 ? drillStack[drillStack.length - 1] : null;

                  if (!currentLevel) {
                    // ROOT VIEW: ORGÃOS E DIREÇÕES
                    return estruturaOrgaos.map((org, index) => (
                      <div key={index} className="flex flex-col items-center w-full mb-10">
                        {/* Órgão Top Level */}
                        <div 
                          onClick={() => {
                            setDrillStack([{ type: "orgao", nome: org.nome, data: org }]);
                          }}
                          className="bg-[#070d2b] text-white px-8 py-5 rounded-2xl shadow-2xl border-2 border-amber-400/50 text-center max-w-xl ring-4 ring-blue-950/20 cursor-pointer hover:border-amber-400 hover:scale-[1.01] transition z-10 relative"
                        >
                          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-400 text-slate-950 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 shadow-sm">
                            <Sparkles size={11} />
                            {org.tipo || "Órgão Principal"} (Clique para Expandir)
                          </div>
                          <h3 className="text-base sm:text-lg font-black tracking-tight text-white">{org.nome}</h3>
                        </div>

                        {org.direcoes && org.direcoes.length > 0 && (
                          <>
                            {/* Linha vertical conectora */}
                            <div className="w-1 h-8 bg-blue-500"></div>

                            {/* Nível 2: Direções */}
                            <div className="flex flex-col items-center w-full">
                              <div className={`grid grid-cols-1 ${org.direcoes.length === 1 ? 'md:grid-cols-1 max-w-md' : org.direcoes.length === 2 ? 'md:grid-cols-2 max-w-3xl' : org.direcoes.length === 3 ? 'md:grid-cols-3 max-w-5xl' : 'md:grid-cols-2 lg:grid-cols-4 max-w-7xl'} gap-6 w-full`}>
                                {org.direcoes.map((dir, dirIdx) => {
                                  const dirTitle = (dir as any).rawTitle || dir.nome || (dir as any).title;
                                  return (
                                    <div key={dirIdx} className="flex flex-col items-center w-full">
                                      <div 
                                        onClick={() => {
                                          setDrillStack([
                                            { type: "orgao", nome: org.nome, data: org },
                                            { type: "direcao", nome: dirTitle, data: dir }
                                          ]);
                                        }}
                                        className={`bg-white text-slate-900 p-5 rounded-3xl shadow-xl border-2 hover:border-blue-500 flex flex-col justify-between w-full h-full cursor-pointer hover:scale-[1.01] transition ${(dirTitle || '').toLowerCase().includes('geral') || (dirTitle || '').toLowerCase().includes('presidente') ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'}`}
                                      >
                                        <div>
                                          <div className="bg-[#070d2b] text-white p-3.5 rounded-2xl flex items-center gap-3 mb-4">
                                            <div className={`p-2 rounded-xl text-white shrink-0 ${(dirTitle || '').toLowerCase().includes('geral') ? 'bg-amber-500 text-slate-950' : 'bg-blue-600'}`}>
                                              {(dirTitle || '').toLowerCase().includes('geral') ? <UserCheck size={16} /> : <Network size={16} />}
                                            </div>
                                            <div>
                                              <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 block">Direção / Executivo</span>
                                              <h4 className="font-black text-sm text-white leading-tight">{dirTitle}</h4>
                                            </div>
                                          </div>

                                          {dir.missao && (
                                            <p className="text-[11px] text-slate-600 font-medium mb-3 line-clamp-2">
                                              {dir.missao}
                                            </p>
                                          )}

                                          {dir.departamentos && dir.departamentos.length > 0 && (
                                            <div className="space-y-2 mt-4">
                                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                                                <span className="font-bold text-slate-800 block mb-2 flex items-center justify-between">
                                                  Departamentos:
                                                  <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[9px]">{dir.departamentos.length}</span>
                                                </span>
                                                <ul className="space-y-2 text-[11px] text-slate-600 font-medium">
                                                  {dir.departamentos.map((dept, deptIdx) => (
                                                    <li key={deptIdx} className="group">
                                                      <div 
                                                        onClick={(e) => { 
                                                          e.stopPropagation(); 
                                                          setDrillStack([
                                                            { type: "orgao", nome: org.nome, data: org },
                                                            { type: "direcao", nome: dirTitle, data: dir },
                                                            { type: "departamento", nome: dept.nome || (dept as any).title, data: dept }
                                                          ]);
                                                        }}
                                                        className="flex items-start gap-1.5 hover:text-blue-600 transition"
                                                      >
                                                        <span className="text-blue-400 mt-0.5">•</span>
                                                        <span className="font-semibold group-hover:underline">{dept.nome || (dept as any).title}</span>
                                                      </div>
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-bold flex items-center justify-between shrink-0">
                                          <span>Nível de Direção</span>
                                          <span className="text-blue-600 font-black flex items-center gap-1">Expandir <ChevronDown size={10} /></span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ));
                  } else if (currentLevel.type === "orgao") {
                    // ORGÃO VIEW: DIREÇÕES E SEUS DEPARTAMENTOS
                    const org = currentLevel.data;
                    return (
                      <div className="flex flex-col items-center w-full mb-10">
                        {/* Órgão Top Level */}
                        <div className="bg-[#070d2b] text-white px-8 py-5 rounded-2xl shadow-2xl border-2 border-amber-400/50 text-center max-w-xl ring-4 ring-blue-950/20 z-10 relative">
                          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-400 text-slate-950 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 shadow-sm">
                            <Sparkles size={11} />
                            {org.tipo || "Órgão Principal"}
                          </div>
                          <h3 className="text-base sm:text-lg font-black tracking-tight text-white">{org.nome}</h3>
                        </div>

                        {org.direcoes && org.direcoes.length > 0 && (
                          <>
                            <div className="w-1 h-8 bg-blue-500"></div>
                            <div className="flex flex-col items-center w-full">
                              <div className={`grid grid-cols-1 ${org.direcoes.length === 1 ? 'md:grid-cols-1 max-w-md' : org.direcoes.length === 2 ? 'md:grid-cols-2 max-w-3xl' : org.direcoes.length === 3 ? 'md:grid-cols-3 max-w-5xl' : 'md:grid-cols-2 lg:grid-cols-4 max-w-7xl'} gap-6 w-full`}>
                                {org.direcoes.map((dir: any, dirIdx: number) => {
                                  const dirTitle = dir.rawTitle || dir.nome || dir.title;
                                  return (
                                    <div key={dirIdx} className="flex flex-col items-center w-full">
                                      <div 
                                        onClick={() => {
                                          setDrillStack([...drillStack, { type: "direcao", nome: dirTitle, data: dir }]);
                                        }}
                                        className={`bg-white text-slate-900 p-5 rounded-3xl shadow-xl border-2 hover:border-blue-500 flex flex-col justify-between w-full h-full cursor-pointer hover:scale-[1.01] transition ${(dirTitle || '').toLowerCase().includes('geral') || (dirTitle || '').toLowerCase().includes('presidente') ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'}`}
                                      >
                                        <div>
                                          <div className="bg-[#070d2b] text-white p-3.5 rounded-2xl flex items-center gap-3 mb-4">
                                            <div className={`p-2 rounded-xl text-white shrink-0 ${(dirTitle || '').toLowerCase().includes('geral') ? 'bg-amber-500 text-slate-950' : 'bg-blue-600'}`}>
                                              {(dirTitle || '').toLowerCase().includes('geral') ? <UserCheck size={16} /> : <Network size={16} />}
                                            </div>
                                            <div>
                                              <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 block">Direção / Executivo</span>
                                              <h4 className="font-black text-sm text-white leading-tight">{dirTitle}</h4>
                                            </div>
                                          </div>
                                          {dir.departamentos && dir.departamentos.length > 0 && (
                                            <div className="space-y-2 mt-4">
                                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                                                <span className="font-bold text-slate-800 block mb-2 flex items-center justify-between">
                                                  Departamentos:
                                                  <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[9px]">{dir.departamentos.length}</span>
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-bold flex items-center justify-between shrink-0">
                                          <span>Nível de Direção</span>
                                          <span className="text-blue-600 font-black flex items-center gap-1">Expandir <ChevronDown size={10} /></span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  } else if (currentLevel.type === "direcao") {
                    // DIRECAO VIEW: DEPARTAMENTOS E REPARTIÇÕES
                    const dir = currentLevel.data;
                    return (
                      <div className="flex flex-col items-center w-full mb-10">
                        <div className="bg-blue-900 text-white px-8 py-5 rounded-2xl shadow-xl border-2 border-blue-400/50 text-center max-w-xl z-10 relative">
                          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-blue-800 text-blue-100 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 shadow-sm">
                            <Network size={11} /> Direção / Executivo
                          </div>
                          <h3 className="text-base sm:text-lg font-black tracking-tight text-white">{currentLevel.nome}</h3>
                        </div>

                        {dir.departamentos && dir.departamentos.length > 0 && (
                          <>
                            <div className="w-1 h-8 bg-blue-500"></div>
                            <div className="flex flex-col items-center w-full">
                              <div className={`grid grid-cols-1 ${dir.departamentos.length === 1 ? 'md:grid-cols-1 max-w-md' : dir.departamentos.length === 2 ? 'md:grid-cols-2 max-w-3xl' : dir.departamentos.length === 3 ? 'md:grid-cols-3 max-w-5xl' : 'md:grid-cols-2 lg:grid-cols-4 max-w-7xl'} gap-6 w-full`}>
                                {dir.departamentos.map((dept: any, deptIdx: number) => {
                                  const deptTitle = dept.nome || dept.title;
                                  return (
                                    <div key={deptIdx} className="flex flex-col items-center w-full">
                                      <div 
                                        onClick={() => {
                                          setDrillStack([...drillStack, { type: "departamento", nome: deptTitle, data: dept }]);
                                        }}
                                        className="bg-white text-slate-900 p-5 rounded-3xl shadow-md border-2 border-slate-200 hover:border-indigo-500 flex flex-col justify-between w-full h-full cursor-pointer hover:scale-[1.01] transition"
                                      >
                                        <div>
                                          <div className="bg-indigo-50 text-indigo-950 p-3.5 rounded-2xl flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
                                              <Briefcase size={16} />
                                            </div>
                                            <div>
                                              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-500 block">Departamento</span>
                                              <h4 className="font-black text-sm leading-tight">{deptTitle}</h4>
                                            </div>
                                          </div>
                                          {dept.reparticoes && dept.reparticoes.length > 0 && (
                                            <div className="space-y-2 mt-4">
                                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                                                <span className="font-bold text-slate-800 block mb-2 flex items-center justify-between">
                                                  Setores / Repartições:
                                                  <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[9px]">{dept.reparticoes.length}</span>
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-bold flex items-center justify-between shrink-0">
                                          <span>Nível de Departamento</span>
                                          <span className="text-indigo-600 font-black flex items-center gap-1">Expandir <ChevronDown size={10} /></span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  } else if (currentLevel.type === "departamento") {
                    // DEPARTAMENTO VIEW: REPARTIÇÕES / SETORES
                    const dept = currentLevel.data;
                    return (
                      <div className="flex flex-col items-center w-full mb-10">
                        <div className="bg-indigo-900 text-white px-8 py-5 rounded-2xl shadow-xl border-2 border-indigo-400/50 text-center max-w-xl z-10 relative">
                          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-indigo-800 text-indigo-100 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 shadow-sm">
                            <Briefcase size={11} /> Departamento
                          </div>
                          <h3 className="text-base sm:text-lg font-black tracking-tight text-white">{currentLevel.nome}</h3>
                        </div>

                        {dept.reparticoes && dept.reparticoes.length > 0 && (
                          <>
                            <div className="w-1 h-8 bg-indigo-500"></div>
                            <div className="flex flex-col items-center w-full">
                              <div className={`grid grid-cols-1 ${dept.reparticoes.length === 1 ? 'md:grid-cols-1 max-w-md' : dept.reparticoes.length === 2 ? 'md:grid-cols-2 max-w-3xl' : dept.reparticoes.length === 3 ? 'md:grid-cols-3 max-w-5xl' : 'md:grid-cols-2 lg:grid-cols-4 max-w-7xl'} gap-6 w-full`}>
                                {dept.reparticoes.map((rep: any, repIdx: number) => {
                                  const repName = typeof rep === 'string' ? rep : rep.name || rep.title;
                                  return (
                                    <div key={repIdx} className="flex flex-col items-center w-full">
                                      <div 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDrillStack([...drillStack, { type: "reparticao", nome: repName, data: rep }]);
                                        }}
                                        className="bg-white text-slate-900 p-5 rounded-3xl shadow-sm border-2 border-slate-200 hover:border-emerald-500 flex flex-col justify-between w-full h-full cursor-pointer hover:scale-[1.01] transition"
                                      >
                                        <div className="bg-emerald-50 text-emerald-950 p-3.5 rounded-2xl flex items-center gap-3 mb-4">
                                          <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                                            <GitFork size={16} />
                                          </div>
                                          <div>
                                            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 block">Repartição / Setor</span>
                                            <h4 className="font-black text-sm leading-tight">{repName}</h4>
                                          </div>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-bold flex items-center justify-between shrink-0">
                                          <span>Nível de Setor</span>
                                          <span className="text-emerald-600 font-black flex items-center gap-1">Ver Colaboradores <ExternalLink size={10} /></span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  } else if (currentLevel.type === "reparticao") {
                    // REPARTIÇÃO VIEW: APENAS LISTA COLABORADORES DO SETOR
                    const repColabs = unifiedColabs.filter(c => (c.setor || c.reparticao || "") === currentLevel.nome);
                    return (
                      <div className="flex flex-col items-center w-full mb-10">
                        <div className="bg-emerald-900 text-white px-8 py-5 rounded-2xl shadow-xl border-2 border-emerald-400/50 text-center max-w-xl z-10 relative">
                          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-800 text-emerald-100 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 shadow-sm">
                            <GitFork size={11} /> Repartição / Setor
                          </div>
                          <h3 className="text-base sm:text-lg font-black tracking-tight text-white">{currentLevel.nome}</h3>
                        </div>

                        <div className="w-1 h-8 bg-emerald-500"></div>
                        <div className="flex flex-col items-center w-full max-w-4xl">
                          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 w-full">
                            <h4 className="font-black text-emerald-900 mb-4 flex items-center gap-2">
                              <Users size={16} className="text-emerald-600" /> Colaboradores ({repColabs.length})
                            </h4>
                            {repColabs.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {repColabs.map((colab, idx) => (
                                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-slate-200 text-slate-500 shrink-0 mt-0.5">
                                      <Users size={14} />
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-sm text-slate-800 leading-tight">{colab.nome}</h5>
                                      <p className="text-[11px] text-slate-500 mt-0.5">{colab.cargoChefia ? `${colab.cargoChefia} • ` : ""}{colab.cargo}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400 italic text-center py-4">Nenhum colaborador alocado neste setor.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return null;
                })()}
              </div>
            )}


            {/* TIPO 2: ORGANOGRAMA POR ESTRUTURA DOS COLABORADORES (ÁRVORE GENEALÓGICA) */}
            {activeType === "colaboradores" && (
              <div className="w-[80vw] max-w-[80vw] min-w-[80vw] space-y-8 px-2">
                {/* Banner Informativo da Árvore Genealógica */}
                <div className="bg-emerald-900 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4 border border-emerald-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500 rounded-xl text-white">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-sm">Árvore Genealógica e Hierárquica dos Colaboradores</h3>
                      <p className="text-xs text-emerald-200">
                        Visualização vertical por ordem hierárquica estrita (ocupando 80% do ecrã): Diretor-Geral → Diretores Centrais → Chefes de Departamento → Chefes de Repartição/Setor → Técnicos → Agentes de Serviço.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-xl text-white">
                    {unifiedColabs.length} Membros Registados
                  </span>
                </div>

                {colabHierarchyTree.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl text-center text-slate-400 border border-slate-200">
                    <Users size={32} className="mx-auto mb-2 opacity-40 text-emerald-600" />
                    <p className="font-bold text-sm">Nenhum colaborador encontrado para a árvore hierárquica.</p>
                    <p className="text-xs text-slate-400 mt-1">Registe ou aloque colaboradores na instituição para visualização completa.</p>
                  </div>
                ) : (
                  <div className="space-y-6 w-full">
                    {colabHierarchyTree.map((rootNode) => (
                      <RenderColabTreeNode
                        key={rootNode.id}
                        node={rootNode}
                        searchQuery={searchQuery}
                        categoryFilter={selectedCategoryFilter}
                        expandedNodes={expandedNodes}
                        onToggle={toggleNode}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* RODAPÉ DO MODAL */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-4 text-xs font-bold text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Sistema Integrado de Gestão e Estrutura Institucional (SIGEP)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Printer size={14} className="text-amber-400" />
              <span>Imprimir / Exportar PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Componente recursivo para renderização dos nós da árvore genealógica de colaboradores
interface RenderColabTreeNodeProps {
  node: ColabNode;
  searchQuery: string;
  categoryFilter: string;
  expandedNodes: Record<string, boolean>;
  onToggle: (id: string) => void;
  level?: number;
}

function RenderColabTreeNode({
  node,
  searchQuery,
  categoryFilter,
  expandedNodes,
  onToggle,
  level = 1,
}: RenderColabTreeNodeProps) {
  const isExpanded = expandedNodes[node.id] !== false; // Padrão aberto
  const hasSubordinates = (node.subordinados || []).length > 0;

  // Filtragem de pesquisa e categoria
  const matchesSearch = !searchQuery || 
    node.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.cargo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (node.cargoChefia && node.cargoChefia.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (node.setor && node.setor.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (node.departamento && node.departamento.toLowerCase().includes(searchQuery.toLowerCase()));

  const matchesCategory = 
    categoryFilter === "todos" ||
    (categoryFilter === "chefias" && node.nivelHierarquico <= 4) ||
    (categoryFilter === "tecnicos" && node.nivelHierarquico === 5) ||
    (categoryFilter === "agentes" && node.nivelHierarquico === 6);

  // Estilização baseada no nível hierárquico
  const getNodeStyling = () => {
    switch (node.nivelHierarquico) {
      case 1: // Topo / Diretor-Geral
        return {
          bg: "bg-gradient-to-r from-slate-900 to-blue-950 text-white border-blue-400 shadow-xl",
          badgeBg: "bg-amber-400 text-blue-950",
          badgeText: "1. Diretor-Geral / Topo",
          icon: <ShieldCheck size={16} className="text-amber-400" />,
        };
      case 2: // Diretores Centrais e de Serviços
        return {
          bg: "bg-gradient-to-r from-blue-900 to-indigo-900 text-white border-blue-300 shadow-lg",
          badgeBg: "bg-blue-100 text-blue-900",
          badgeText: "2. Direção Central / Divisão",
          icon: <Building size={14} className="text-blue-200" />,
        };
      case 3: // Chefes de Departamento
        return {
          bg: "bg-white text-slate-900 border-indigo-300 shadow-md",
          badgeBg: "bg-indigo-100 text-indigo-900",
          badgeText: "3. Chefia de Departamento",
          icon: <Briefcase size={14} className="text-indigo-600" />,
        };
      case 4: // Chefes de Repartição / Coordenadores
        return {
          bg: "bg-white text-slate-900 border-emerald-300 shadow-sm",
          badgeBg: "bg-emerald-100 text-emerald-900",
          badgeText: "4. Chefia de Repartição / Setor",
          icon: <GitFork size={14} className="text-emerald-600" />,
        };
      case 5: // Técnicos e Especialistas
        return {
          bg: "bg-slate-50 text-slate-800 border-slate-200 shadow-2xs",
          badgeBg: "bg-blue-50 text-blue-800 border border-blue-200",
          badgeText: "5. Técnico / Especialista",
          icon: <Users size={14} className="text-blue-600" />,
        };
      case 6: // Agentes de Serviço e Apoio Operacional
      default:
        return {
          bg: "bg-slate-50 text-slate-800 border-slate-200 shadow-2xs",
          badgeBg: "bg-slate-200 text-slate-700",
          badgeText: "6. Agente de Serviço / Apoio",
          icon: <Users size={14} className="text-slate-500" />,
        };
    }
  };

  const style = getNodeStyling();

  return (
    <div className="flex flex-col items-center w-full">
      {/* CARD DO COLABORADOR */}
      {matchesSearch && matchesCategory && (
        <div 
          onClick={() => hasSubordinates && onToggle(node.id)}
          className={`w-full max-w-xl p-4 rounded-2xl border-2 transition-all duration-200 ${style.bg} ${hasSubordinates ? "cursor-pointer hover:scale-[1.01]" : ""}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-black/10 shrink-0 mt-0.5">
                {style.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${style.badgeBg}`}>
                    {style.badgeText}
                  </span>
                  {node.setor && (
                    <span className="text-[10px] font-bold opacity-80 bg-black/10 px-2 py-0.5 rounded">
                      {node.setor}
                    </span>
                  )}
                </div>
                <h4 className="font-black text-base tracking-tight leading-tight">{node.nome}</h4>
                <p className="text-xs font-bold opacity-90">
                  {node.cargoChefia ? `${node.cargoChefia} • ` : ""}{node.cargo}
                </p>
                {(node.departamento || node.direcao) && (
                  <p className="text-[11px] opacity-75 font-medium">
                    {node.departamento ? `${node.departamento}` : ""}{node.direcao ? ` (${node.direcao})` : ""}
                  </p>
                )}
              </div>
            </div>

            {hasSubordinates && (
              <div className="flex items-center gap-1 bg-black/10 px-2 py-1 rounded-xl shrink-0 text-xs font-bold">
                <span>{node.subordinados.length}</span>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBORDINADOS (ÁRVORE VERTICAL / GENEALÓGICA) */}
      {hasSubordinates && isExpanded && (
        <div className="w-full flex flex-col items-center">
          {/* Linha vertical conectora da raiz aos filhos */}
          <div className="w-0.5 h-6 bg-slate-300"></div>

          {/* Container dos ramos de subordinados */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t-2 border-slate-300/80">
            {node.subordinados.map((sub) => (
              <RenderColabTreeNode
                key={sub.id}
                node={sub}
                searchQuery={searchQuery}
                categoryFilter={categoryFilter}
                expandedNodes={expandedNodes}
                onToggle={onToggle}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
