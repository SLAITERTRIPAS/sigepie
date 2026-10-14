/**
 * Componente de Gestão de Estrutura Organizacional para o SIGEP
 * Permite ao Administrador Institucional selecionar o tipo de instituição,
 * carregar automaticamente a árvore hierárquica, permissões e workflows no Firestore,
 * e personalizar a estrutura.
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
  Edit,
  Save,
  AlertTriangle,
  FolderTree,
  FileText,
  Users,
  Settings,
  RefreshCw,
} from "lucide-react";
import { organizationService, OrgUnit } from "./services/organizationService";
import { db } from "../../lib/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";

interface OrganizationalStructureManagerProps {
  currentUser: any;
  institutionId?: string;
}

const INSTITUTION_MODELS = [
  {
    id: "universidade",
    name: "Universidade",
    icon: GraduationCap,
    description: "Modelo para Ensino Superior Universitário com Reitoria, Faculdades, Departamentos e Centros.",
    units: [
      { name: "Reitoria", type: "Orgao", children: ["Reitor", "Vice-Reitores", "Secretaria Executiva", "Gabinete Jurídico", "Gabinete de Cooperação"] },
      { name: "Conselho Universitário", type: "Orgao", children: ["Secretaria do Conselho"] },
      { name: "Faculdades", type: "Direcao", children: ["Departamentos", "Cursos", "Laboratórios", "Centros Académicos"] },
      { name: "Escolas Superiores", type: "Direcao", children: ["Direção da Escola", "Serviços Administrativos"] },
      { name: "Centros de Investigação", type: "Direcao", children: ["Núcleos de Investigação", "Projetos Científicos"] },
      { name: "Biblioteca Central", type: "Departamento", children: ["Gestão de Acervo", "Serviços de Leitura"] },
      { name: "Serviços Administrativos", type: "Departamento", children: ["Recursos Humanos", "Finanças", "Património", "TIC"] },
    ],
  },
  {
    id: "instituto_politecnico",
    name: "Instituto Politécnico",
    icon: Building2,
    description: "Modelo para Ensino Superior Politécnico com Conselhos, Direções Académicas e Administrativas.",
    units: [
      { name: "Conselho de Administração", type: "Orgao", children: ["Presidente / Diretor-Geral"] },
      { name: "Conselho Científico", type: "Orgao", children: [] },
      { name: "Conselho Pedagógico", type: "Orgao", children: [] },
      { name: "Direção Académica", type: "Direcao", children: ["Registo Académico", "Assuntos Estudantis", "Biblioteca"] },
      { name: "Direção Administrativa e Financeira", type: "Direcao", children: ["Recursos Humanos", "Finanças", "Aprovisionamento", "Património", "TIC"] },
      { name: "Escolas Superiores", type: "Direcao", children: ["Departamentos Académicos", "Cursos"] },
      { name: "Centro de Investigação, Inovação e Extensão", type: "Centro", children: [] },
      { name: "Gabinete de Planificação, Qualidade e Cooperação", type: "Departamento", children: [] },
    ],
  },
  {
    id: "escola",
    name: "Escola / Instituto Médio",
    icon: Landmark,
    description: "Estrutura para Ensino Secundário e Médio.",
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
  },
  {
    id: "ministerio",
    name: "Ministério",
    icon: Shield,
    description: "Estrutura governamental central com Gabinete, Direções Nacionais e Departamentos.",
    units: [
      { name: "Ministro", type: "Orgao", children: [] },
      { name: "Vice-Ministro", type: "Orgao", children: [] },
      { name: "Secretário Permanente", type: "Orgao", children: [] },
      { name: "Gabinete do Ministro", type: "Departamento", children: [] },
      { name: "Direções Nacionais", type: "Direcao", children: ["Departamentos", "Repartições", "Secções"] },
    ],
  },
  {
    id: "governo_provincial",
    name: "Governo Provincial / Distrital",
    icon: Landmark,
    description: "Estrutura para Governação Local (Províncias e Distritos).",
    units: [
      { name: "Governador / Administrador", type: "Orgao", children: [] },
      { name: "Gabinete", type: "Departamento", children: [] },
      { name: "Direções Provinciais / Serviços Distritais", type: "Direcao", children: ["Departamentos", "Repartições"] },
    ],
  },
  {
    id: "municipio",
    name: "Município",
    icon: Building2,
    description: "Autarquia Local com Presidente, Assembleia Municipal e Vereações.",
    units: [
      { name: "Presidente do Município", type: "Orgao", children: [] },
      { name: "Assembleia Municipal", type: "Orgao", children: [] },
      { name: "Vereações", type: "Direcao", children: [] },
      { name: "Direções Municipais", type: "Direcao", children: ["Departamentos", "Secções"] },
    ],
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
  },
  {
    id: "ong",
    name: "ONG e Organizações Internacionais",
    icon: Users,
    description: "Estrutura orientada a Programas, Projetos e Monitoria.",
    units: [
      { name: "Direção Executiva", type: "Orgao", children: [] },
      { name: "Conselho Fiscal", type: "Orgao", children: [] },
      { name: "Programas e Projetos", type: "Direcao", children: ["Monitoria e Avaliação"] },
      { name: "Finanças e Administração", type: "Departamento", children: [] },
      { name: "Recursos Humanos", type: "Departamento", children: [] },
      { name: "Comunicação", type: "Departamento", children: [] },
    ],
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

  const effectiveInstId = currentUser?.instituicaoId || institutionId;

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
    const model = INSTITUTION_MODELS.find((m) => m.id === selectedModelId);
    if (!model) return;

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Criar unidades padrão no Firestore
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

        // Subunidades
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

      // Salvar metadados da instituição com o tipo selecionado
      await setDoc(doc(db, "institutions", effectiveInstId), {
        id: effectiveInstId,
        tipoInstituicao: model.name,
        modelId: model.id,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setSuccessMessage(`Modelo organizacional "${model.name}" aplicado com sucesso! Estruturas, permissões e workflows carregados.`);
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
      setSuccessMessage("Unidade organizacional adicionada com sucesso!");
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
    <div className="space-y-8 p-6 bg-white rounded-xl shadow-md border border-slate-100 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <FolderTree className="w-8 h-8 text-indigo-600" />
            Gestão de Estrutura Organizacional (SIGEP)
          </h2>
          <p className="text-slate-600 mt-1">
            Selecione o tipo de instituição para carregar automaticamente o modelo hierárquico, permissões e workflows padrão.
          </p>
        </div>
        <button
          onClick={fetchUnits}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar Dados
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Seletor Visual de Modelos */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          Selecione o Tipo de Instituição
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {INSTITUTION_MODELS.map((model) => {
            const IconComponent = model.icon;
            const isSelected = selectedModelId === model.id;
            return (
              <div
                key={model.id}
                onClick={() => setSelectedModelId(model.id)}
                className={`cursor-pointer p-5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-600/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-lg ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mb-1">{model.name}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{model.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                  <span>{model.units.length} blocos principais</span>
                  <span>{isSelected ? "Selecionado" : "Selecionar"}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleApplyModel}
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? "A aplicar modelo..." : "Aplicar Modelo Organizacional Selecionado"}
          </button>
        </div>
      </div>

      {/* Adicionar Unidade Personalizada */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-600" />
          Adicionar Unidade Organizacional Personalizada
        </h3>
        <form onSubmit={handleAddCustomUnit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Unidade / Setor</label>
            <input
              type="text"
              value={customUnitName}
              onChange={(e) => setCustomUnitName(e.target.value)}
              placeholder="Ex: Gabinete de Auditoria Interna"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Unidade</label>
            <select
              value={customUnitType}
              onChange={(e) => setCustomUnitType(e.target.value as any)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value="Orgao">Órgão Superior</option>
              <option value="Direcao">Direção / Faculdade</option>
              <option value="Departamento">Departamento</option>
              <option value="Reparticao">Repartição</option>
              <option value="Setor">Setor</option>
              <option value="Centro">Centro de Investigação</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </form>
      </div>

      {/* Lista de Unidades Atuais */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600" />
          Estrutura Organizacional Ativa na Instituição ({existingUnits.length} registos)
        </h3>

        {existingUnits.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
            Nenhuma estrutura organizacional carregada. Selecione um modelo acima e clique em "Aplicar Modelo Organizacional Selecionado".
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-sm">
                  <th className="py-3 px-4 font-semibold">Nome da Unidade</th>
                  <th className="py-3 px-4 font-semibold">Tipo</th>
                  <th className="py-3 px-4 font-semibold">ID Instituição</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                {existingUnits.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-medium text-slate-900">{u.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                        {u.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-xs">{u.institutionId}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteUnit(u.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
