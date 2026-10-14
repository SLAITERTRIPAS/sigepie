/**
 * Componente OrganizationalStructureManager em /src/modules/admin/OrganizationalStructureManager.tsx
 * Gestão de Estrutura Organizacional e Modelos Institucionais do SIGEP.
 * Estilo visual com cores oficiais do logótipo SIGEP (#050b38 e #FFB800),
 * textura de fundo industrial/tecnológico e seletores deslizantes para hierarquia e permissões.
 */

import React, { useState, useEffect } from "react";
import {
  Building2,
  GraduationCap,
  Briefcase,
  Landmark,
  Shield,
  Layers,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  FolderTree,
  Users,
  RefreshCw,
  Award,
  Lock,
  Cpu,
  Sliders,
} from "lucide-react";
import { organizationService, OrgUnit } from "../organization/services/organizationService";
import { db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

interface OrganizationalStructureManagerProps {
  currentUser: any;
  institutionId?: string;
}

const INSTITUTION_MODELS = [
  {
    id: "universidade",
    name: "Universidade",
    icon: GraduationCap,
    description: "Modelo para Ensino Superior Universitário com Reitoria, Faculdades, Departamentos e Centros de Investigação.",
    units: [
      { name: "Reitoria", type: "Orgao", children: ["Reitor", "Vice-Reitores", "Secretaria Executiva", "Gabinete Jurídico", "Gabinete de Cooperação"] },
      { name: "Conselho Universitário", type: "Orgao", children: ["Secretaria do Conselho"] },
      { name: "Faculdades", type: "Direcao", children: ["Departamentos", "Cursos", "Laboratórios", "Centros Académicos"] },
      { name: "Escolas Superiores", type: "Direcao", children: ["Direção da Escola", "Serviços Administrativos"] },
      { name: "Centros de Investigação", type: "Direcao", children: ["Núcleos de Investigação", "Projetos Científicos"] },
      { name: "Biblioteca Central", type: "Departamento", children: ["Gestão de Acervo", "Serviços de Leitura"] },
      { name: "Serviços Administrativos", type: "Departamento", children: ["Recursos Humanos", "Finanças", "Património", "TIC"] },
    ],
    permissions: ["Reitor: Acesso Total", "Decanos: Gestão de Faculdade", "Chefe UGEA: Gestão Orçamental Setorial"],
    workflows: ["Aprovação Académica", "Contratação Pública UGEA", "Submissão de Planificação"],
  },
  {
    id: "instituto_politecnico",
    name: "Instituto Politécnico",
    icon: Building2,
    description: "Modelo Politécnico com Conselhos, Direções Académicas e Administrativas e Aprovisionamento.",
    units: [
      { name: "Conselho de Administração", type: "Orgao", children: ["Presidente / Diretor-Geral"] },
      { name: "Conselho Científico", type: "Orgao", children: [] },
      { name: "Conselho Pedagógico", type: "Orgao", children: [] },
      { name: "Direção Académica", type: "Direcao", children: ["Registo Académico", "Assuntos Estudantis", "Biblioteca"] },
      { name: "Direção Administrativa e Financeira", type: "Direcao", children: ["Recursos Humanos", "Finanças", "Aprovisionamento", "Património", "TIC"] },
      { name: "Escolas Superiores", type: "Direcao", children: ["Departamentos Académicos", "Cursos"] },
      { name: "Centro de Investigação, Inovação e Extensão", type: "Centro", children: [] },
    ],
    permissions: ["Presidente: Acesso Total", "Diretor Administrativo: Gestão Financeira", "Chefes de Departamento: Gestão Setorial"],
    workflows: ["Aprovação Politécnica", "Gestão de Aprovisionamento", "Relatórios de Extensão"],
  },
  {
    id: "escola",
    name: "Escola / Instituto Médio",
    icon: Landmark,
    description: "Estrutura para Ensino Secundário e Médio com Direção Pedagógica, Secretaria e Coordenações.",
    units: [
      { name: "Direção", type: "Orgao", children: [] },
      { name: "Direção Pedagógica", type: "Direcao", children: [] },
      { name: "Secretaria", type: "Departamento", children: [] },
      { name: "Coordenações", type: "Departamento", children: [] },
      { name: "Cursos", type: "Setor", children: [] },
      { name: "Biblioteca", type: "Departamento", children: [] },
      { name: "Recursos Humanos", type: "Setor", children: [] },
      { name: "Administração e Finanças", type: "Departamento", children: [] },
      { name: "TIC", type: "Setor", children: [] },
    ],
    permissions: ["Diretor: Acesso Total", "Diretor Pedagógico: Gestão Escolar", "Secretaria: Gestão de Matrículas"],
    workflows: ["Avaliação Pedagógica", "Matrículas e Registos", "Gestão de Pessoal Escolar"],
  },
  {
    id: "ministerio",
    name: "Ministério",
    icon: Shield,
    description: "Estrutura governamental central com Gabinete do Ministro, Direções Nacionais e Departamentos.",
    units: [
      { name: "Ministro", type: "Orgao", children: [] },
      { name: "Vice-Ministro", type: "Orgao", children: [] },
      { name: "Secretário Permanente", type: "Orgao", children: [] },
      { name: "Gabinete do Ministro", type: "Departamento", children: [] },
      { name: "Direções Nacionais", type: "Direcao", children: ["Departamentos", "Repartições", "Secções"] },
    ],
    permissions: ["Ministro: Acesso Total Governamental", "Diretores Nacionais: Gestão Setorial", "Chefes de Departamento: Execução"],
    workflows: ["Aprovação Ministerial", "Propostas de Decreto", "Auditoria de Contas Nacionais"],
  },
  {
    id: "empresa",
    name: "Empresa Pública ou Privada",
    icon: Briefcase,
    description: "Estrutura corporativa com Conselho de Administração e Direções funcionais.",
    units: [
      { name: "Conselho de Administração", type: "Orgao", children: ["Presidente do Conselho"] },
      { name: "Direções", type: "Direcao", children: ["Financeira", "Comercial", "Operações", "Recursos Humanos", "TIC"] },
      { name: "Departamentos", type: "Departamento", children: ["Setores"] },
    ],
    permissions: ["Administração: Acesso Corporativo Total", "Diretor Financeiro: Orçamento e Tesouraria", "RH: Gestão de Colaboradores"],
    workflows: ["Aprovação Orçamental Corporativa", "Contratos Comerciais", "Avaliação de Desempenho"],
  },
  {
    id: "ong",
    name: "ONG e Organizações Internacionais",
    icon: Users,
    description: "Estrutura orientada a Programas, Projetos de Cooperação e Monitoria.",
    units: [
      { name: "Direção Executiva", type: "Orgao", children: [] },
      { name: "Conselho Fiscal", type: "Orgao", children: [] },
      { name: "Programas e Projetos", type: "Direcao", children: ["Monitoria e Avaliação"] },
      { name: "Finanças e Administração", type: "Departamento", children: [] },
      { name: "Recursos Humanos", type: "Departamento", children: [] },
      { name: "Comunicação", type: "Departamento", children: [] },
    ],
    permissions: ["Diretor Executivo: Acesso de Programas", "Gestores de Projeto: Acesso Restrito a Projetos", "Finanças: Prestação de Contas"],
    workflows: ["Aprovação de Projetos", "Prestação de Contas a Doadores", "Monitoria de Impacto"],
  },
];

export default function OrganizationalStructureManager({
  currentUser,
  institutionId = "inst_default",
}: OrganizationalStructureManagerProps) {
  const [selectedModelId, setSelectedModelId] = useState<string>("universidade");
  const [existingUnits, setExistingUnits] = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [customUnitName, setCustomUnitName] = useState("");
  const [customUnitType, setCustomUnitType] = useState<OrgUnit["type"]>("Departamento");

  // Seletores deslizantes interativos (Sliders) solicitados
  const [hierarchyDepth, setHierarchyDepth] = useState<number>(4); // 1 a 5
  const [permissionRigidity, setPermissionRigidity] = useState<number>(5); // 1 a 5
  const [workflowLevel, setWorkflowLevel] = useState<number>(4); // 1 a 4

  const effectiveInstId = currentUser?.instituicaoId || institutionId;
  const currentModel = INSTITUTION_MODELS.find((m) => m.id === selectedModelId) || INSTITUTION_MODELS[0];

  useEffect(() => {
    fetchUnits();
  }, [effectiveInstId]);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const units = await organizationService.getOrgUnits(effectiveInstId);
      setExistingUnits(units);
    } catch (e: any) {
      setErrorMessage("Erro ao carregar estruturas: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyModel = async () => {
    const model = currentModel;
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const timestamp = Date.now();
      let count = 0;

      for (const unit of model.units) {
        const unitId = `org_${effectiveInstId}_${timestamp}_${count++}`;
        const orgData: OrgUnit = {
          id: unitId,
          name: unit.name,
          type: (unit.type as any) || "Departamento",
          institutionId: effectiveInstId,
        };
        await organizationService.saveOrgUnit(orgData);

        if (unit.children && unit.children.length > 0) {
          for (const child of unit.children) {
            const childId = `org_${effectiveInstId}_${timestamp}_${count++}`;
            const childData: OrgUnit = {
              id: childId,
              name: child,
              type: "Setor",
              institutionId: effectiveInstId,
              parentId: unitId,
            };
            await organizationService.saveOrgUnit(childData);
          }
        }
      }

      await setDoc(doc(db, "institutions", effectiveInstId), {
        id: effectiveInstId,
        tipoInstituicao: model.name,
        modelId: model.id,
        permissions: model.permissions,
        workflows: model.workflows,
        sliderConfig: {
          hierarchyDepth,
          permissionRigidity,
          workflowLevel,
        },
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setSuccessMessage(`Modelo organizacional "${model.name}" aplicado com sucesso! Estrutura hierárquica (Profundidade: ${hierarchyDepth}), permissões (Rigor: ${permissionRigidity}/5) e workflows gravados no Firestore.`);
      await fetchUnits();
    } catch (err: any) {
      setErrorMessage("Erro ao aplicar modelo: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUnitName.trim()) return;

    try {
      const newUnit: OrgUnit = {
        id: `org_custom_${Date.now()}`,
        name: customUnitName.trim(),
        type: customUnitType,
        institutionId: effectiveInstId,
      };
      await organizationService.saveOrgUnit(newUnit);
      setCustomUnitName("");
      setSuccessMessage("Unidade organizacional personalizada adicionada com sucesso!");
      await fetchUnits();
    } catch (err: any) {
      setErrorMessage("Erro ao adicionar unidade: " + err.message);
    }
  };

  const handleDeleteUnit = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta unidade organizacional?")) return;
    try {
      await organizationService.deleteOrgUnit(id);
      setSuccessMessage("Unidade removida com sucesso.");
      await fetchUnits();
    } catch (err: any) {
      setErrorMessage("Erro ao remover unidade: " + err.message);
    }
  };

  return (
    <div className="relative overflow-hidden space-y-8 p-6 md:p-10 bg-[#050b38] text-slate-100 rounded-3xl shadow-2xl border border-[#FFB800]/40 max-w-7xl mx-auto">
      {/* Textura de fundo industrial/tecnológico com grelha e efeitos metálicos */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d15_1px,transparent_1px),linear-gradient(to_bottom,#1f293d15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFB800]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header com identidade visual oficial SIGEP (#050b38 e #FFB800) */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#FFB800]/30 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3.5 py-1.5 bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/50 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-md">
              <Award className="w-4 h-4 text-[#FFB800]" /> SIGEP Core Industrial & Tecnológico
            </span>
            <span className="px-3.5 py-1.5 bg-[#081247] text-blue-200 border border-blue-500/40 rounded-full text-xs font-semibold">
              Isolamento Organizacional Rigoroso
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3 tracking-wide">
            <FolderTree className="w-9 h-9 text-[#FFB800]" />
            Gestão de Estrutura Organizacional
          </h2>
          <p className="text-slate-300 mt-1.5 max-w-3xl text-sm md:text-base">
            Selecione o modelo institucional e utilize os seletores deslizantes para configurar a hierarquia e permissões oficiais no SIGEP.
          </p>
        </div>
        <button
          onClick={fetchUnits}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-[#081247] hover:bg-blue-900 text-white font-bold rounded-xl border border-[#FFB800]/40 transition shadow-lg shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar Unidades
        </button>
      </div>

      {successMessage && (
        <div className="relative z-10 p-4 bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 rounded-2xl flex items-center gap-3 shadow-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="relative z-10 p-4 bg-rose-950/90 border border-rose-500/60 text-rose-200 rounded-2xl flex items-center gap-3 shadow-xl">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Seletor Visual de Modelos com cores oficiais SIGEP (#050b38 e #FFB800) */}
      <div className="relative z-10 space-y-4">
        <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Layers className="w-6 h-6 text-[#FFB800]" />
          Modelos Institucionais do SIGEP (Seletores Visuais)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {INSTITUTION_MODELS.map((model) => {
            const IconComponent = model.icon;
            const isSelected = selectedModelId === model.id;
            return (
              <div
                key={model.id}
                onClick={() => setSelectedModelId(model.id)}
                className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex flex-col justify-between group relative overflow-hidden ${
                  isSelected
                    ? "border-[#FFB800] bg-gradient-to-br from-[#081247] to-[#050b38] shadow-2xl ring-4 ring-[#FFB800]/30 scale-[1.02]"
                    : "border-blue-950/85 bg-[#050b38]/90 hover:border-[#FFB800]/60 hover:bg-[#081247]/60"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFB800] to-amber-300" />
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-4 rounded-xl transition-transform group-hover:scale-110 shadow-md ${
                        isSelected
                          ? "bg-gradient-to-br from-[#FFB800] to-amber-500 text-[#050b38] font-black"
                          : "bg-[#081247] text-[#FFB800] border border-[#FFB800]/30"
                      }`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    {isSelected && (
                      <span className="flex items-center gap-1.5 text-xs font-extrabold px-3.5 py-1 bg-[#FFB800]/20 text-[#FFB800] rounded-full border border-[#FFB800]/50 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FFB800]" /> Ativo
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-white text-lg mb-1.5">{model.name}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{model.description}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-blue-900/60 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Blocos Hierárquicos:</span>
                    <span className="font-bold text-[#FFB800]">{model.units.length} direções/órgãos</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Workflows de Aprovação:</span>
                    <span className="font-bold text-blue-200">{model.workflows.length} fluxos</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Seletores Deslizantes (Sliders) para Hierarquia e Permissões */}
        <div className="p-6 md:p-8 bg-[#050b38]/95 border border-[#FFB800]/40 rounded-3xl shadow-2xl space-y-6 backdrop-blur-md">
          <div className="flex items-center gap-3 border-b border-blue-950 pb-4">
            <Sliders className="w-6 h-6 text-[#FFB800]" />
            <div>
              <h4 className="text-lg font-black text-white">Parâmetros Avançados (Seletores Deslizantes)</h4>
              <p className="text-xs text-slate-300">Ajuste a profundidade estrutural e o rigor de segurança e permissões da instituição.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Slider 1: Profundidade Hierárquica */}
            <div className="p-5 bg-[#081247]/80 border border-blue-900/80 rounded-2xl shadow-inner space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                <span>Profundidade Hierárquica:</span>
                <span className="text-[#FFB800] font-black text-sm">{hierarchyDepth} Níveis</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={hierarchyDepth}
                onChange={(e) => setHierarchyDepth(Number(e.target.value))}
                className="w-full accent-[#FFB800] cursor-pointer bg-[#050b38] h-2 rounded-lg"
              />
              <div className="text-[11px] text-slate-400">
                {hierarchyDepth === 1 && "Apenas Setores Básicos"}
                {hierarchyDepth === 2 && "Setores e Repartições"}
                {hierarchyDepth === 3 && "Setores, Repartições e Departamentos"}
                {hierarchyDepth === 4 && "Estrutura Completa até Direções"}
                {hierarchyDepth === 5 && "Estrutura Máxima (Órgãos Centrais e Conselhos)"}
              </div>
            </div>

            {/* Slider 2: Rigor de Permissões */}
            <div className="p-5 bg-[#081247]/80 border border-blue-900/80 rounded-2xl shadow-inner space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                <span>Rigor de Isolamento:</span>
                <span className="text-[#FFB800] font-black text-sm">{permissionRigidity} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={permissionRigidity}
                onChange={(e) => setPermissionRigidity(Number(e.target.value))}
                className="w-full accent-[#FFB800] cursor-pointer bg-[#050b38] h-2 rounded-lg"
              />
              <div className="text-[11px] text-slate-400">
                {permissionRigidity <= 2 && "Isolamento Moderado"}
                {permissionRigidity === 3 && "Isolamento Departamental"}
                {permissionRigidity === 4 && "Isolamento Estrito por Setor"}
                {permissionRigidity === 5 && "Segurança Máxima e Autonomia Total por Unidade"}
              </div>
            </div>

            {/* Slider 3: Nível de Workflow */}
            <div className="p-5 bg-[#081247]/80 border border-blue-900/80 rounded-2xl shadow-inner space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                <span>Níveis de Aprovação:</span>
                <span className="text-[#FFB800] font-black text-sm">{workflowLevel} Etapas</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                value={workflowLevel}
                onChange={(e) => setWorkflowLevel(Number(e.target.value))}
                className="w-full accent-[#FFB800] cursor-pointer bg-[#050b38] h-2 rounded-lg"
              />
              <div className="text-[11px] text-slate-400">
                {workflowLevel === 1 && "Aprovação Direta Setorial"}
                {workflowLevel === 2 && "Setor -> Chefe de Departamento"}
                {workflowLevel === 3 && "Setor -> Departamento -> Direção"}
                {workflowLevel === 4 && "Fluxo Ascendente Completo até DPEP / Superior"}
              </div>
            </div>
          </div>

          {/* Resumo e Ação de Gravação */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-blue-950">
            <div>
              <span className="text-xs font-bold text-[#FFB800] tracking-wider uppercase">Modelo Selecionado para Gravação</span>
              <h4 className="text-2xl font-black text-white flex items-center gap-2 mt-0.5">
                <Cpu className="w-6 h-6 text-[#FFB800]" />
                {currentModel.name}
              </h4>
            </div>
            <button
              onClick={handleApplyModel}
              disabled={loading}
              className="px-8 py-3.5 bg-gradient-to-r from-[#FFB800] to-amber-500 hover:from-amber-400 hover:to-amber-400 text-[#050b38] font-black rounded-2xl shadow-xl transition transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-5 h-5" />
              {loading ? "A gravar no Firestore..." : "Aplicar Modelo, Permissões e Workflows"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 bg-[#081247]/70 border border-blue-900/80 rounded-2xl shadow-inner">
              <h5 className="text-xs font-black text-[#FFB800] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#FFB800]" /> Permissões Padrão de Acesso
              </h5>
              <ul className="space-y-2 text-sm text-slate-200">
                {currentModel.permissions.map((p, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#FFB800]" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-5 bg-[#081247]/70 border border-blue-900/80 rounded-2xl shadow-inner">
              <h5 className="text-xs font-black text-[#FFB800] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FFB800]" /> Fluxos de Aprovação (Workflows)
              </h5>
              <div className="flex flex-wrap gap-2">
                {currentModel.workflows.map((w, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-[#050b38] border border-[#FFB800]/40 text-blue-100 rounded-xl text-xs font-bold shadow-sm">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Adicionar Unidade Personalizada */}
      <div className="relative z-10 border-t border-[#FFB800]/30 pt-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-[#FFB800]" />
          Adicionar Unidade ou Setor Personalizado
        </h3>
        <form onSubmit={handleAddCustomUnit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Nome da Unidade / Setor</label>
            <input
              type="text"
              value={customUnitName}
              onChange={(e) => setCustomUnitName(e.target.value)}
              placeholder="Ex: Gabinete de Inovação Tecnológica"
              className="w-full px-4 py-3 bg-[#081247] border border-blue-900 text-white rounded-xl focus:ring-2 focus:ring-[#FFB800] focus:outline-none placeholder-slate-400"
            />
          </div>
          <div className="w-full md:w-64">
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Tipo Hierárquico</label>
            <select
              value={customUnitType}
              onChange={(e) => setCustomUnitType(e.target.value as any)}
              className="w-full px-4 py-3 bg-[#081247] border border-blue-900 text-white rounded-xl focus:ring-2 focus:ring-[#FFB800] focus:outline-none"
            >
              <option value="Orgao" className="bg-[#050b38]">Órgão Superior</option>
              <option value="Direcao" className="bg-[#050b38]">Direção / Faculdade</option>
              <option value="Departamento" className="bg-[#050b38]">Departamento</option>
              <option value="Reparticao" className="bg-[#050b38]">Repartição</option>
              <option value="Setor" className="bg-[#050b38]">Setor</option>
              <option value="Centro" className="bg-[#050b38]">Centro</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-[#081247] hover:bg-blue-900 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg border border-[#FFB800]/50 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#FFB800]" />
            Adicionar
          </button>
        </form>
      </div>

      {/* Lista de Unidades Atuais no Firestore */}
      <div className="relative z-10 border-t border-[#FFB800]/30 pt-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#FFB800]" />
          Estrutura Ativa na Instituição ({existingUnits.length} registos no Firestore)
        </h3>

        {existingUnits.length === 0 ? (
          <div className="p-8 text-center bg-[#081247]/50 rounded-2xl border border-dashed border-[#FFB800]/30 text-slate-300">
            Nenhuma estrutura organizacional carregada. Selecione um modelo acima e clique em "Aplicar Modelo, Permissões e Workflows".
          </div>
        ) : (
          <div className="overflow-x-auto border border-blue-900 rounded-2xl shadow-2xl bg-[#050b38]/80 backdrop-blur-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#081247] border-b border-blue-900 text-slate-200 text-sm">
                  <th className="py-4 px-5 font-bold">Nome da Unidade</th>
                  <th className="py-4 px-5 font-bold">Tipo Hierárquico</th>
                  <th className="py-4 px-5 font-bold">ID Instituição</th>
                  <th className="py-4 px-5 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/60 text-sm text-slate-200">
                {existingUnits.map((u) => (
                  <tr key={u.id} className="hover:bg-[#081247]/40 transition">
                    <td className="py-4 px-5 font-semibold text-white">{u.name}</td>
                    <td className="py-4 px-5">
                      <span className="px-3 py-1 bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/40 rounded-full text-xs font-bold">
                        {u.type}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-400 font-mono text-xs">{u.institutionId}</td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleDeleteUnit(u.id)}
                        className="p-2 text-rose-400 hover:bg-rose-950/80 rounded-xl transition border border-rose-900/40 cursor-pointer"
                        title="Remover Unidade"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
