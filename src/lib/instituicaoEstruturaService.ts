import { useState, useEffect } from "react";
import { LayoutGrid, Building2, Briefcase, Settings, Layers } from "lucide-react";
import { firestoreService } from "./firestoreService";
import { baseMenuItems } from "../constants/menuHierarchy";

export interface ReparticaoModel {
  id?: string;
  nome: string;
  isCustom?: boolean;
}

export interface DepartamentoModel {
  id?: string;
  nome: string;
  reparticoes: string[];
  isCustom?: boolean;
}

export interface DirecaoModel {
  id?: string;
  nome: string;
  rawTitle: string;
  sigla?: string;
  responsavel?: string;
  email?: string;
  telefone?: string;
  dataInicio?: string;
  missao?: string;
  departamentos: DepartamentoModel[];
  isCustom?: boolean;
}

export interface OrgaoModel {
  id?: string;
  nome: string;
  tipo: string;
  direcoes: DirecaoModel[];
  isCustom?: boolean;
}

/**
 * Estrutura Base Canónica da Gestão das Instituições (ISPS / Geral)
 * Esta estrutura espelha a base organizada por ÓRGÃO -> DIREÇÃO -> DEPARTAMENTO -> REPARTIÇÃO/SETOR.
 */
export const ESTRUTURA_BASE_GESTAO_INSTITUICOES = [
  {
    nome: "Órgão de Direção e Gestão",
    tipo: "Unidade Estrutural Principal",
    direcoes: [
      {
        nome: "Conselho de Representantes",
        departamentos: [],
      },
      {
        nome: "Gabinete do Diretor-Geral",
        departamentos: [
          {
            nome: "Departamento de Planificação, Estudos e Projetos",
            reparticoes: [
              "Repartição de Planificação",
              "Repartição de Estatística",
              "Setor de Relatório",
              "Setor de Monitoria",
            ],
          },
          {
            nome: "Unidade Gestora e Executora de Aquisições",
            reparticoes: [],
          },
          {
            nome: "Departamento de Cooperação e Relações Exteriores",
            reparticoes: [
              "Setor de Imagem Institucional",
            ],
          },
          {
            nome: "Departamento de Controlo Técnico e de Qualidade",
            reparticoes: [
              "Setor de Controlo Técnico",
            ],
          },
          {
            nome: "Departamento Jurídico",
            reparticoes: [
              "Setor de Pareceres",
            ],
          },
        ],
      },
      {
        nome: "Conselho Administrativo e de Gestão",
        departamentos: [],
      },
      {
        nome: "Conselho Técnico e de Qualidade",
        departamentos: [],
      },
    ],
  },
  {
    nome: "Unidade Orgânica",
    tipo: "Unidade Estrutural",
    direcoes: [
      {
        nome: "Divisão de Engenharia",
        departamentos: [
          {
            nome: "Departamento de Pesquisa e Extensão",
            reparticoes: ["Repartição de Pesquisa", "Repartição de Extensão"],
          },
          {
            nome: "Departamento de Engenharia Eletrotécnica",
            reparticoes: [],
          },
          {
            nome: "Departamento de Engenharia de Construção Civil",
            reparticoes: [],
          },
          {
            nome: "Departamento de Engenharia de Construção Mecânica",
            reparticoes: [],
          },
          {
            nome: "Departamento de Disciplinas Gerais",
            reparticoes: ["Repartição de Apoio Pedagógico"],
          },
          {
            nome: "Departamento Técnico e de Apoio",
            reparticoes: ["Repartição de Laboratórios"],
          },
        ],
      },
      {
        nome: "Centro de Incubação de Empresas",
        departamentos: [
          {
            nome: "Departamento de Práticas de Geração de Negócio e Desenvolvimento Empresarial",
            reparticoes: [],
          },
          {
            nome: "Departamento de Consultoria, Estudos, Projetos e Angariação de Fundos",
            reparticoes: [],
          },
          {
            nome: "Departamento de Prospecção de Oportunidades de Negócio",
            reparticoes: [],
          },
        ],
      },
    ],
  },
  {
    nome: "Serviços Centrais",
    tipo: "Unidade Estrutural",
    direcoes: [
      {
        nome: "DICOSAFA",
        departamentos: [
          {
            nome: "Recursos Humanos",
            reparticoes: [
              "Repartição de Pessoal",
              "Repartição de Formação",
              "Repartição de Apoio Social",
            ],
          },
          {
            nome: "Finanças",
            reparticoes: [
              "Repartição de Plano e Orçamento",
              "Repartição de Tesouraria",
              "Setor de Estatística",
            ],
          },
          {
            nome: "Património",
            reparticoes: [
              "Repartição de E-Património",
              "Repartição de Infraestrutura e Manutenção",
              "Repartição de Transporte",
            ],
          },
          {
            nome: "Secretaria-Geral",
            reparticoes: ["Secretaria", "SIC"],
          },
          {
            nome: "Departamento TIC",
            reparticoes: [
              "Setor de Rede de Computadores",
              "Setor de Manutenção",
              "Reprografia",
              "Oficina de TIC",
            ],
          },
          {
            nome: "Departamento Lar de Estudantes",
            reparticoes: [
              "Repartição de Alojamento",
              "Repartição de Eventos",
              "Economato",
            ],
          },
          {
            nome: "Departamento de Produção Alimentar",
            reparticoes: [
              "Repartição de Produção Animal",
              "Repartição de Produção Vegetal",
              "Armazém de Thaka",
            ],
          },
        ],
      },
      {
        nome: "DICOSSER",
        departamentos: [
          {
            nome: "Registo Académico",
            reparticoes: [
              "Atendimento Estudantil",
              "Repartição de Certificação",
              "Repartição de Exames de Admissão",
              "Repartição de Matrículas",
            ],
          },
          {
            nome: "Assuntos Estudantis",
            reparticoes: [
              "Repartição de Bolsa de Estudos",
              "Repartição de Desporto e Recreação",
            ],
          },
          {
            nome: "Biblioteca",
            reparticoes: [
              "Biblioteca",
              "Repartição de Documentos",
              "Repartição de Arquivo",
            ],
          },
        ],
      },
    ],
  },
];

// Estado global em memória da estrutura organizacional sincronizada
let cachedCustomOrgaos: any[] = [];
let cachedCustomDirecoes: any[] = [];
let cachedAdicionais: any[] = [];
let cachedDeletedDirections: any[] = [];
let cachedInstituicoes: any[] = [];
let cachedRenames: any[] = [];
let isServiceInitialized = false;

/**
 * Aplica renomeações cadastradas em tempo real a qualquer elemento estrutural
 */
export function applyRename(
  name: string,
  instituicaoId?: string,
  type?: "orgao" | "direcao" | "departamento" | "reparticao"
): string {
  if (!name || typeof name !== "string") return name;
  const instId = instituicaoId || getActiveInstituicaoId();
  if (!cachedRenames || cachedRenames.length === 0) return name.trim();

  let currentName = name.trim();
  let depth = 0;
  while (depth < 10) {
    const found = cachedRenames.find(
      (r) =>
        (r.instituicaoId === instId || !r.instituicaoId || r.instituicaoId === "all") &&
        r.oldName &&
        r.oldName.trim().toLowerCase() === currentName.toLowerCase() &&
        (!type || !r.type || r.type === type)
    );
    if (found && found.newName && found.newName.trim() !== currentName) {
      currentName = found.newName.trim();
      depth++;
    } else {
      break;
    }
  }
  return currentName;
}

/**
 * Regista ou atualiza uma renomeação de setor/departamento/direção/órgão em tempo real
 */
export async function addEstruturaElement(
  instituicaoId: string,
  type: "orgao" | "direcao" | "departamento" | "reparticao",
  name: string,
  parentId?: string
) {
  const cleanName = name.trim();
  const docId = `${type}_${instituicaoId}_${Date.now()}`;
  
  const data: any = {
    id: docId,
    type,
    name: cleanName,
    instituicaoId,
    createdAt: new Date().toISOString(),
  };
  
  if (parentId) data.parentId = parentId;

  if (type === "orgao") await firestoreService.orgaos_custom.set(docId, { ...data, title: name });
  else if (type === "direcao") await firestoreService.direcoes_organicas.set(docId, { ...data, title: name });
  else await firestoreService.estrutura_adicionais.set(docId, data);

  notifyEstruturaUpdated();
}

export interface ModeloOrganograma {
  id: string;
  titulo: string;
  descricao: string;
  texto: string;
}

export const MODELOS_ORGANOGRAMA: ModeloOrganograma[] = [
  {
    id: "academico",
    titulo: "Ensino Superior / Politécnico / Universitário",
    descricao: "Reitoria, Faculdades/Divisões, Departamentos de Ensino e Pesquisa, Serviços Centrais",
    texto: `Universidade -> Reitoria -> Reitor -> Secretaria Executiva
Universidade -> Reitoria -> Vice-Reitores -> Gabinete de Apoio
Universidade -> Reitoria -> Conselho Universitário -> Secretaria do Conselho
Universidade -> Faculdades -> Departamentos -> Laboratórios
Universidade -> Faculdades -> Cursos -> Gestão Académica
Universidade -> Escolas Superiores -> Direção de Escola -> Serviços Administrativos
Universidade -> Centros de Investigação -> Núcleo de Investigação -> Projetos
Universidade -> Biblioteca Central -> Gestão de Acervo -> Serviços de Leitura
Universidade -> Serviços Administrativos -> Direção de Administração -> Repartições

Instituto Politécnico -> Conselho de Administração -> Presidente/Diretor-Geral
Instituto Politécnico -> Conselho Científico -> Conselho Pedagógico
Instituto Politécnico -> Conselho Fiscal ou Consultivo
Instituto Politécnico -> Direção Académica -> Registo Académico
Instituto Politécnico -> Direção Administrativa e Financeira -> Recursos Humanos -> Aprovisionamento e Património
Instituto Politécnico -> Escolas Superiores -> Departamentos Académicos -> Cursos
Instituto Politécnico -> Centro de Investigação, Inovação e Extensão
Instituto Politécnico -> Biblioteca
Instituto Politécnico -> Gabinete de Planificação, Qualidade e Cooperação
Instituto Politécnico -> Serviços de TIC`
  },
  {
    id: "empresa",
    titulo: "Empresa Pública / Privada",
    descricao: "Conselho de Administração, Direção Geral, Direções de Operações, Finanças e RH",
    texto: `Conselho de Administração -> Gabinete da Administração -> Secretaria Executiva
Direção Geral -> Gabinete do Diretor Executivo -> Assessoria e Auditoria
Direção de Operações e Produção -> Departamento de Produção -> Setor de Controlo de Qualidade
Direção de Operações e Produção -> Departamento de Logística -> Repartição de Armazém
Direção Administrativa e Financeira -> Departamento Financeiro -> Repartição de Contabilidade
Direção Administrativa e Financeira -> Departamento Financeiro -> Repartição de Tesouraria
Direção Administrativa e Financeira -> Departamento de Recursos Humanos -> Repartição de Gestão de Pessoal
Direção Comercial e Marketing -> Departamento de Vendas -> Setor de Atendimento ao Cliente
Direção de Tecnologia e Inovação -> Departamento de Sistemas -> Suporte Técnico e Infraestruturas`
  },
  {
    id: "governo",
    titulo: "Instituto Governamental / Setor Público",
    descricao: "Conselho Diretivo, Direção Geral, Planificação, Administração e Serviços Técnicos",
    texto: `Conselho Diretivo -> Gabinete do Diretor Geral -> Secretaria Geral
Direção de Planificação e Monitoria -> Departamento de Estudos e Projetos -> Repartição de Estatística
Direção de Administração e Finanças -> Departamento de Finanças -> Repartição de Orçamento
Direção de Administração e Finanças -> Departamento de Recursos Humanos -> Repartição de Pessoal
Direção de Administração e Finanças -> Departamento de Património -> Setor de Logística e Transporte
Direção de Serviços Técnicos -> Departamento de Fiscalização -> Repartição de Vistorias Técnicas`
  },
  {
    id: "saude",
    titulo: "Unidade Hospitalar / Saúde",
    descricao: "Direção Geral Hospitalar, Direção Clínica, Direção de Enfermagem, Administração",
    texto: `Conselho de Administração Hospitalar -> Gabinete do Diretor Hospitalar -> Secretaria
Direção Clínica -> Departamento de Medicina Interna -> Enfermarias de Especialidade
Direção Clínica -> Departamento de Cirurgia -> Bloco Operatório
Direção Clínica -> Departamento de Meios de Diagnóstico -> Laboratório de Análises Clínicas
Direção de Enfermagem -> Departamento de Cuidados Gerais -> Repartição de Escalas e Turnos
Direção Administrativa e Financeira -> Departamento de Recursos Humanos -> Repartição de Pessoal
Direção Administrativa e Financeira -> Departamento de Farmácia e Aprovisionamento -> Armazém Central de Medicamentos`
  }
];

/**
 * Converte qualquer texto de Organograma ou Composição estruturada em modelos de Órgão -> Direção -> Departamento -> Repartição
 */
export function parseOrganogramaToEstrutura(
  organogramaText?: string,
  composicaoText?: string
): OrgaoModel[] {
  const textToParse = (organogramaText || "").trim() || (composicaoText || "").trim();
  if (!textToParse) return [];

  const lines = textToParse
    .split(/\r?\n|;/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("//") && !l.startsWith("#"));

  const orgaosMap = new Map<string, {
    nome: string;
    tipo: string;
    direcoesMap: Map<string, {
      nome: string;
      rawTitle: string;
      departamentosMap: Map<string, Set<string>>;
    }>;
  }>();

  const getOrCreateOrgao = (orgaoNome: string, tipo = "Unidade Estrutural") => {
    const clean = orgaoNome.trim() || "Estrutura Geral";
    if (!orgaosMap.has(clean)) {
      orgaosMap.set(clean, {
        nome: clean,
        tipo,
        direcoesMap: new Map(),
      });
    }
    return orgaosMap.get(clean)!;
  };

  const getOrCreateDirecao = (
    orgaoObj: ReturnType<typeof getOrCreateOrgao>,
    direcaoNome: string
  ) => {
    const clean = direcaoNome.trim() || "Direção Geral";
    if (!orgaoObj.direcoesMap.has(clean)) {
      orgaoObj.direcoesMap.set(clean, {
        nome: clean,
        rawTitle: clean,
        departamentosMap: new Map(),
      });
    }
    return orgaoObj.direcoesMap.get(clean)!;
  };

  const addDepartamentoEReparticao = (
    dirObj: ReturnType<typeof getOrCreateDirecao>,
    deptNome?: string,
    repNome?: string
  ) => {
    if (!deptNome) return;
    const cleanDept = deptNome.trim();
    if (!cleanDept) return;

    if (!dirObj.departamentosMap.has(cleanDept)) {
      dirObj.departamentosMap.set(cleanDept, new Set());
    }

    if (repNome && repNome.trim()) {
      dirObj.departamentosMap.get(cleanDept)!.add(repNome.trim());
    }
  };

  for (const rawLine of lines) {
    // 1. Verificar se a linha usa divisores explícitos (->, >, =>, /, |)
    const arrowDelim = rawLine.includes("->")
      ? "->"
      : rawLine.includes("-->")
      ? "-->"
      : rawLine.includes("=>")
      ? "=>"
      : rawLine.includes(">")
      ? ">"
      : rawLine.includes("|")
      ? "|"
      : null;

    if (arrowDelim) {
      const parts = rawLine.split(arrowDelim).map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 4) {
        // [0] Órgão, [1] Direção, [2] Departamento, [3...] Repartições
        const org = getOrCreateOrgao(parts[0]);
        const dir = getOrCreateDirecao(org, parts[1]);
        addDepartamentoEReparticao(dir, parts[2], parts[3]);
      } else if (parts.length === 3) {
        const p0Low = parts[0].toLowerCase();
        if (p0Low.includes("órgão") || p0Low.includes("orgao") || p0Low.includes("conselho") || p0Low.includes("unidade")) {
          // Órgão -> Direção -> Departamento
          const org = getOrCreateOrgao(parts[0]);
          const dir = getOrCreateDirecao(org, parts[1]);
          addDepartamentoEReparticao(dir, parts[2]);
        } else {
          // Direção -> Departamento -> Repartição
          const org = getOrCreateOrgao("Órgão de Direção e Gestão");
          const dir = getOrCreateDirecao(org, parts[0]);
          addDepartamentoEReparticao(dir, parts[1], parts[2]);
        }
      } else if (parts.length === 2) {
        const p0Low = parts[0].toLowerCase();
        if (p0Low.includes("órgão") || p0Low.includes("orgao") || p0Low.includes("conselho")) {
          const org = getOrCreateOrgao(parts[0]);
          getOrCreateDirecao(org, parts[1]);
        } else {
          const org = getOrCreateOrgao("Órgão de Direção e Gestão");
          const dir = getOrCreateDirecao(org, parts[0]);
          addDepartamentoEReparticao(dir, parts[1]);
        }
      } else if (parts.length === 1) {
        const org = getOrCreateOrgao("Órgão de Direção e Gestão");
        getOrCreateDirecao(org, parts[0]);
      }
      continue;
    }

    // 2. Verificar se a linha contém dois pontos (ex: "Faculdade: Departamento 1, Departamento 2")
    if (rawLine.includes(":")) {
      const colonParts = rawLine.split(":");
      const head = colonParts[0].trim();
      const tail = colonParts.slice(1).join(":").trim();
      const subItems = tail.split(/,|\//).map((s) => s.trim()).filter(Boolean);

      const headLow = head.toLowerCase();
      if (headLow.includes("órgão") || headLow.includes("orgao")) {
        const org = getOrCreateOrgao(head);
        subItems.forEach((item) => getOrCreateDirecao(org, item));
      } else {
        const org = getOrCreateOrgao("Órgão de Direção e Gestão");
        const dir = getOrCreateDirecao(org, head);
        subItems.forEach((item) => addDepartamentoEReparticao(dir, item));
      }
      continue;
    }

    // 3. Linhas simples ou com marcadores (- Direção Geral, * Departamento)
    const cleanLine = rawLine.replace(/^[-*•\d.)\s]+/, "").trim();
    if (!cleanLine) continue;

    const lower = cleanLine.toLowerCase();
    if (lower.includes("órgão") || lower.includes("conselho de administração") || lower.includes("conselho diretivo")) {
      getOrCreateOrgao(cleanLine, "Unidade Estrutural Principal");
    } else if (lower.includes("direção") || lower.includes("gabinete") || lower.includes("divisão") || lower.includes("reitoria") || lower.includes("faculdade")) {
      const org = getOrCreateOrgao("Órgão de Direção e Gestão");
      getOrCreateDirecao(org, cleanLine);
    } else if (lower.includes("departamento") || lower.includes("centro")) {
      const org = getOrCreateOrgao("Órgão de Direção e Gestão");
      const dir = getOrCreateDirecao(org, "Direção Geral");
      addDepartamentoEReparticao(dir, cleanLine);
    } else {
      const org = getOrCreateOrgao("Órgão de Direção e Gestão");
      getOrCreateDirecao(org, cleanLine);
    }
  }

  // Se não foi identificado nenhum órgão, mas existe texto, criar órgão padrão
  if (orgaosMap.size === 0 && textToParse.length > 0) {
    const org = getOrCreateOrgao("Órgão de Direção e Gestão");
    getOrCreateDirecao(org, "Direção Executiva");
  }

  // Converter o mapa para o formato OrgaoModel[]
  const result: OrgaoModel[] = [];
  orgaosMap.forEach((orgData, orgNome) => {
    const finalOrgNome = applyRename(orgNome, "", "orgao");
    const direcoesList: DirecaoModel[] = [];
    orgData.direcoesMap.forEach((dirData, dirNome) => {
      const finalDirNome = applyRename(dirNome, "", "direcao");
      const deptsList: DepartamentoModel[] = [];
      dirData.departamentosMap.forEach((repsSet, deptNome) => {
        const finalDeptNome = applyRename(deptNome, "", "departamento");
        const finalRepsList = Array.from(repsSet).map((r) => applyRename(r, "", "reparticao"));
        deptsList.push({
          nome: finalDeptNome,
          reparticoes: finalRepsList,
          isCustom: true,
        });
      });

      direcoesList.push({
        nome: finalDirNome,
        rawTitle: dirData.rawTitle ? applyRename(dirData.rawTitle, "", "direcao") : finalDirNome,
        departamentos: deptsList,
        isCustom: true,
      });
    });

    result.push({
      nome: finalOrgNome,
      tipo: orgData.tipo,
      direcoes: direcoesList,
      isCustom: true,
    });
  });

  return result;
}

/**
 * Persiste no Firestore a estrutura completa gerada a partir do organograma de uma nova instituição
 */
export async function persistEstruturaFromOrganograma(
  instituicaoId: string,
  organogramaText: string,
  composicaoText?: string
): Promise<{ orgaosCount: number; direcoesCount: number; deptsCount: number; repsCount: number }> {
  if (!instituicaoId) throw new Error("ID da instituição é obrigatório para persistir a estrutura.");
  const parsedOrgaos = parseOrganogramaToEstrutura(organogramaText, composicaoText);
  if (!parsedOrgaos || parsedOrgaos.length === 0) {
    return { orgaosCount: 0, direcoesCount: 0, deptsCount: 0, repsCount: 0 };
  }

  let orgaosCount = 0;
  let direcoesCount = 0;
  let deptsCount = 0;
  let repsCount = 0;

  for (const org of parsedOrgaos) {
    const orgSlug = org.nome.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 30);
    const orgDocId = `org_${instituicaoId}_${orgSlug}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    await firestoreService.orgaos_custom.set(orgDocId, {
      id: orgDocId,
      title: org.nome,
      type: org.tipo || "Unidade Estrutural",
      instituicaoId: instituicaoId,
      createdAt: new Date().toISOString(),
    });
    orgaosCount++;

    for (const dir of org.direcoes) {
      const dirSlug = dir.nome.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 30);
      const dirDocId = `dir_${instituicaoId}_${dirSlug}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      await firestoreService.direcoes_organicas.set(dirDocId, {
        id: dirDocId,
        title: dir.nome,
        rawTitle: dir.rawTitle || dir.nome,
        unitType: org.nome,
        instituicaoId: instituicaoId,
        createdAt: new Date().toISOString(),
      });
      direcoesCount++;

      for (const dept of dir.departamentos) {
        const deptDocId = `dept_${instituicaoId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await firestoreService.estrutura_adicionais.set(deptDocId, {
          id: deptDocId,
          type: "departamento",
          name: dept.nome,
          directionTitle: dir.rawTitle || dir.nome,
          instituicaoId: instituicaoId,
          createdAt: new Date().toISOString(),
        });
        deptsCount++;

        for (const rep of dept.reparticoes) {
          const repDocId = `rep_${instituicaoId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await firestoreService.estrutura_adicionais.set(repDocId, {
            id: repDocId,
            type: "reparticao",
            name: rep,
            directionTitle: dir.rawTitle || dir.nome,
            parentDepartmentTitle: dept.nome,
            instituicaoId: instituicaoId,
            createdAt: new Date().toISOString(),
          });
          repsCount++;
        }
      }
    }
  }

  notifyEstruturaUpdated();
  return { orgaosCount, direcoesCount, deptsCount, repsCount };
}

// Subscrição única ao Firestore
export function initEstruturaService() {
  if (isServiceInitialized) return;
  isServiceInitialized = true;

  try {
    firestoreService.orgaos_custom.subscribe((data) => {
      cachedCustomOrgaos = data || [];
      notifyEstruturaUpdated();
    });

    firestoreService.direcoes_organicas.subscribe((data) => {
      cachedCustomDirecoes = data || [];
      notifyEstruturaUpdated();
    });

    firestoreService.estrutura_adicionais.subscribe((data) => {
      cachedAdicionais = data || [];
      notifyEstruturaUpdated();
    });

    firestoreService.direcoes_excluidas.subscribe((data) => {
      cachedDeletedDirections = data || [];
      notifyEstruturaUpdated();
    });

    firestoreService.instituicoes.subscribe((data) => {
      cachedInstituicoes = data || [];
      notifyEstruturaUpdated();
    });

    firestoreService.estrutura_renames.subscribe((data) => {
      cachedRenames = data || [];
      notifyEstruturaUpdated();
    });
  } catch (err) {
    console.warn("initEstruturaService offline ou fallback:", err);
  }
}

export function notifyEstruturaUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sigep_estrutura_updated"));
  }
}

/**
 * Constrói a árvore hierárquica completa organizada por ÓRGÃO da Gestão das Instituições
 */
export function buildEstruturaInstituicao(targetInstId?: string): OrgaoModel[] {
  const instId = targetInstId || getActiveInstituicaoId();

  const filteredCustomOrgaos = cachedCustomOrgaos.filter(
    (co) => (co.instituicaoId || "isps") === instId || (instId === "isps" && !co.instituicaoId)
  );
  const filteredCustomDirecoes = cachedCustomDirecoes.filter(
    (cd) => (cd.instituicaoId || "isps") === instId || (instId === "isps" && !cd.instituicaoId)
  );
  const filteredAdicionais = cachedAdicionais.filter(
    (a) => (a.instituicaoId || "isps") === instId || (instId === "isps" && !a.instituicaoId)
  );
  const filteredDeletedDirections = cachedDeletedDirections.filter(
    (d) => (d.instituicaoId || "isps") === instId || (instId === "isps" && !d.instituicaoId)
  );

  const excludedTitles = new Set(
    filteredDeletedDirections.map((d) => String(d.title || "").trim().toUpperCase())
  );

  // 1. Órgãos da Instituição: dados dinâmicos da Gestão das Instituições
  const currentInst = cachedInstituicoes.find((i) => i.id === instId);
  if (currentInst && (currentInst.organograma || currentInst.composicao) && filteredCustomOrgaos.length === 0) {
    const parsedFromOrganograma = parseOrganogramaToEstrutura(
      currentInst.organograma,
      currentInst.composicao
    );
    if (parsedFromOrganograma.length > 0) {
      return parsedFromOrganograma.map((org) => {
        const finalOrgName = applyRename(org.nome, instId, "orgao");
        return {
          ...org,
          nome: finalOrgName,
          direcoes: (org.direcoes || [])
            .filter((d: any) => !excludedTitles.has(String(d.nome || d.rawTitle || "").trim().toUpperCase()))
            .map((dir: any) => {
              const rawDirTitle = dir.rawTitle || dir.nome;
              const finalDirTitle = applyRename(rawDirTitle, instId, "direcao");
              return {
                ...dir,
                nome: dir.sigla ? `${finalDirTitle} (${dir.sigla})` : finalDirTitle,
                rawTitle: finalDirTitle,
                departamentos: (dir.departamentos || []).map((dept: any) => {
                  const finalDeptTitle = applyRename(dept.nome, instId, "departamento");
                  return {
                    ...dept,
                    nome: finalDeptTitle,
                    reparticoes: (dept.reparticoes || []).map((r: any) =>
                      applyRename(typeof r === "string" ? r : r.name || "", instId, "reparticao")
                    ),
                  };
                }),
              };
            }),
        };
      });
    }
  }

  // Base padrão da estrutura como modelo inicial
  let baseOrgans: typeof ESTRUTURA_BASE_GESTAO_INSTITUICOES = ESTRUTURA_BASE_GESTAO_INSTITUICOES;

  const rawOrgaos: {
    id?: string;
    nome: string;
    tipo: string;
    isCustom?: boolean;
    direcoes: any[];
  }[] = [
    ...baseOrgans.map((o) => ({
      nome: o.nome,
      tipo: o.tipo,
      isCustom: false,
      direcoes: o.direcoes,
    })),
    ...filteredCustomOrgaos.map((co) => ({
      id: co.id,
      nome: co.title,
      tipo: co.type || "Unidade Estrutural Adicional",
      isCustom: true,
      direcoes: co.direcoes || [],
    })),
  ];

  // 2. Mapeamento e enriquecimento de cada Órgão com as suas Direções, Departamentos e Repartições
  const consolidatedOrgaos: OrgaoModel[] = rawOrgaos.map((org) => {
    const rawOrgName = org.nome;
    const finalOrgName = applyRename(rawOrgName, instId, "orgao");

    // Direções estáticas do órgão que não foram excluídas
    const staticDirs = (org.direcoes || [])
      .filter((d: any) => !excludedTitles.has(String(d.nome || d.title || "").trim().toUpperCase()))
      .map((d: any) => ({
        id: d.id,
        nome: d.nome || d.title,
        rawTitle: d.nome || d.title,
        sigla: d.sigla,
        responsavel: d.responsavel,
        email: d.email,
        telefone: d.telefone,
        dataInicio: d.dataInicio,
        missao: d.missao,
        departamentos: d.departamentos || [],
        isCustom: false,
      }));

    // Direções customizadas adicionadas na Gestão das Instituições para este órgão
    const customDirs = filteredCustomDirecoes
      .filter(
        (cd) =>
          (cd.unitType === rawOrgName || applyRename(cd.unitType || "", instId, "orgao") === finalOrgName) &&
          !excludedTitles.has(String(cd.title || "").trim().toUpperCase())
      )
      .map((cd) => ({
        id: cd.id,
        nome: cd.title + (cd.sigla ? ` (${cd.sigla})` : ""),
        rawTitle: cd.title,
        sigla: cd.sigla,
        responsavel: cd.responsavel,
        email: cd.email,
        telefone: cd.telefone,
        dataInicio: cd.dataInicio,
        missao: cd.missao,
        departamentos: cd.departamentos || [],
        isCustom: true,
      }));

    const allDirsForOrg = [...staticDirs, ...customDirs];

    // Para cada Direção, enriquecer com Departamentos e Repartições
    const enrichedDirs: DirecaoModel[] = allDirsForOrg.map((dir: any) => {
      const rawDirTitle = dir.rawTitle || dir.nome.split(" (")[0] || dir.nome;
      const finalDirTitle = applyRename(rawDirTitle, instId, "direcao");
      const finalDirName = dir.sigla ? `${finalDirTitle} (${dir.sigla})` : finalDirTitle;

      // Departamentos dinâmicos adicionados nesta direção
      const customDeptsForDir = filteredAdicionais
        .filter(
          (a) =>
            a.type === "departamento" &&
            (a.directionTitle === rawDirTitle || applyRename(a.directionTitle || "", instId, "direcao") === finalDirTitle)
        )
        .map((a) => ({
          id: a.id,
          nome: a.name,
          reparticoes: [],
          isCustom: true,
        }));

      const rawDepts = [...(dir.departamentos || []), ...customDeptsForDir];

      const enrichedDepts: DepartamentoModel[] = rawDepts.map((dept: any) => {
        const rawDeptTitle = dept.nome || dept.title;
        const finalDeptTitle = applyRename(rawDeptTitle, instId, "departamento");

        // Repartições dinâmicas adicionadas neste departamento
        const customRepsForDept = filteredAdicionais
          .filter(
            (a) =>
              a.type === "reparticao" &&
              (a.directionTitle === rawDirTitle || applyRename(a.directionTitle || "", instId, "direcao") === finalDirTitle) &&
              (a.parentDepartmentTitle === rawDeptTitle || applyRename(a.parentDepartmentTitle || "", instId, "departamento") === finalDeptTitle)
          )
          .map((a) => a.name);

        const staticReps = (dept.reparticoes || []).map((r: any) =>
          typeof r === "string" ? r : r.name || r.title || ""
        );

        const allRawReps = [...staticReps, ...customRepsForDept];
        const renamedReps = allRawReps.map((r) => applyRename(r, instId, "reparticao"));
        const mergedReps = Array.from(new Set(renamedReps)).filter(Boolean);

        return {
          id: dept.id,
          nome: finalDeptTitle,
          reparticoes: mergedReps,
          isCustom: dept.isCustom || false,
        };
      });

      return {
        id: dir.id,
        nome: finalDirName,
        rawTitle: finalDirTitle,
        sigla: dir.sigla,
        responsavel: dir.responsavel,
        email: dir.email,
        telefone: dir.telefone,
        dataInicio: dir.dataInicio,
        missao: dir.missao,
        departamentos: enrichedDepts,
        isCustom: dir.isCustom || false,
      };
    });

    return {
      id: org.id,
      nome: finalOrgName,
      tipo: org.tipo,
      direcoes: enrichedDirs,
      isCustom: org.isCustom || false,
    };
  });

  return consolidatedOrgaos;
}

/**
 * Obter todos os Órgãos da Gestão das Instituições
 */
export function getOrgaosFromGestaoInstituicoes(instituicaoId?: string): OrgaoModel[] {
  initEstruturaService();
  return buildEstruturaInstituicao(instituicaoId);
}

/**
 * Obter nomes de todos os Órgãos
 */
export function getOrgaosNomes(instituicaoId?: string): string[] {
  const orgaos = getOrgaosFromGestaoInstituicoes(instituicaoId);
  return orgaos.map((o) => o.nome);
}

/**
 * Obter Direções de um determinado Órgão (ou todas as direções se o órgão não for informado)
 */
export function getDirecoesPorOrgao(orgaoNome?: string, instituicaoId?: string): string[] {
  const orgaos = getOrgaosFromGestaoInstituicoes(instituicaoId);
  if (!orgaoNome) {
    const allDirs: string[] = [];
    orgaos.forEach((o) => {
      o.direcoes.forEach((d) => {
        if (!allDirs.includes(d.nome)) allDirs.push(d.nome);
        if (d.rawTitle && !allDirs.includes(d.rawTitle)) allDirs.push(d.rawTitle);
      });
    });
    return allDirs;
  }

  const cleanOrg = orgaoNome.trim().toLowerCase();
  const matched = orgaos.find(
    (o) =>
      o.nome.toLowerCase() === cleanOrg ||
      o.nome.toLowerCase().includes(cleanOrg) ||
      cleanOrg.includes(o.nome.toLowerCase())
  );

  if (!matched) return [];
  return matched.direcoes.map((d) => d.nome);
}

/**
 * Obter Departamentos de uma Direção a partir da Gestão das Instituições
 */
export function getDepartamentosPorDirecao(direcaoNome?: string, instituicaoId?: string): string[] {
  if (!direcaoNome) return [];
  const orgaos = getOrgaosFromGestaoInstituicoes(instituicaoId);
  const cleanDir = direcaoNome.trim().toLowerCase();

  for (const org of orgaos) {
    for (const dir of org.direcoes) {
      const match =
        dir.nome.toLowerCase() === cleanDir ||
        dir.rawTitle.toLowerCase() === cleanDir ||
        dir.nome.toLowerCase().includes(cleanDir) ||
        cleanDir.includes(dir.rawTitle.toLowerCase());

      if (match) {
        return dir.departamentos.map((dept) => dept.nome);
      }
    }
  }

  return [];
}

/**
 * Obter Repartições / Setores de um Departamento a partir da Gestão das Instituições (com escopo estrito de Direção)
 */
export function getReparticoesPorDepartamento(departamentoNome?: string, direcaoNomeOrInstId?: string, instituicaoId?: string): string[] {
  if (!departamentoNome) return [];
  let instId = instituicaoId;
  let dirName = direcaoNomeOrInstId;
  if (direcaoNomeOrInstId && (direcaoNomeOrInstId.startsWith("inst_") || direcaoNomeOrInstId === "isps")) {
    instId = direcaoNomeOrInstId;
    dirName = undefined;
  }

  const orgaos = getOrgaosFromGestaoInstituicoes(instId);
  const cleanDept = departamentoNome.trim().toLowerCase();
  const cleanDir = dirName ? dirName.trim().toLowerCase() : "";

  for (const org of orgaos) {
    for (const dir of org.direcoes) {
      if (cleanDir) {
        const dirMatch =
          dir.nome.toLowerCase() === cleanDir ||
          dir.rawTitle.toLowerCase() === cleanDir ||
          dir.nome.toLowerCase().includes(cleanDir) ||
          cleanDir.includes(dir.rawTitle.toLowerCase());
        if (!dirMatch) continue;
      }
      for (const dept of dir.departamentos) {
        const match =
          dept.nome.toLowerCase() === cleanDept ||
          dept.nome.toLowerCase().includes(cleanDept) ||
          cleanDept.includes(dept.nome.toLowerCase());

        if (match) {
          return dept.reparticoes;
        }
      }
    }
  }

  return [];
}

/**
 * Descobre o Órgão ao qual pertence uma determinada Direção
 */
export function findOrgaoPorDirecao(direcaoNome?: string, instituicaoId?: string): string | null {
  if (!direcaoNome) return null;
  const orgaos = getOrgaosFromGestaoInstituicoes(instituicaoId);
  const cleanDir = direcaoNome.trim().toLowerCase();

  for (const org of orgaos) {
    for (const dir of org.direcoes) {
      if (
        dir.nome.toLowerCase() === cleanDir ||
        dir.rawTitle.toLowerCase() === cleanDir ||
        dir.nome.toLowerCase().includes(cleanDir) ||
        cleanDir.includes(dir.rawTitle.toLowerCase())
      ) {
        return org.nome;
      }
    }
  }
  return null;
}

/**
 * Descobre a Direção e o Órgão aos quais pertence um Departamento
 */
export function findDirecaoPorDepartamento(
  departamentoNome?: string,
  instituicaoId?: string
): { direcao: string | null; orgao: string | null } {
  if (!departamentoNome) return { direcao: null, orgao: null };
  const orgaos = getOrgaosFromGestaoInstituicoes(instituicaoId);
  const cleanDept = departamentoNome.trim().toLowerCase();

  for (const org of orgaos) {
    for (const dir of org.direcoes) {
      for (const dept of dir.departamentos) {
        if (
          dept.nome.toLowerCase() === cleanDept ||
          dept.nome.toLowerCase().includes(cleanDept) ||
          cleanDept.includes(dept.nome.toLowerCase())
        ) {
          return { direcao: dir.nome, orgao: org.nome };
        }
      }
    }
  }
  return { direcao: null, orgao: null };
}

/**
 * Hook React para consumir a estrutura da Gestão das Instituições em tempo real
 */
export function useInstituicaoEstrutura(targetInstId?: string) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    initEstruturaService();

    const handleUpdate = () => {
      setVersion((v) => v + 1);
    };

    window.addEventListener("sigep_estrutura_updated", handleUpdate);
    window.addEventListener("instituicao_updated", handleUpdate);

    return () => {
      window.removeEventListener("sigep_estrutura_updated", handleUpdate);
      window.removeEventListener("instituicao_updated", handleUpdate);
    };
  }, []);

  const orgaos = buildEstruturaInstituicao(targetInstId);
  const orgaosNomes = orgaos.map((o) => o.nome);

  const getDirecoes = (orgaoNome?: string): string[] => {
    return getDirecoesPorOrgao(orgaoNome, targetInstId);
  };

  const getDepartamentos = (direcaoNome?: string): string[] => {
    return getDepartamentosPorDirecao(direcaoNome, targetInstId);
  };

  const getReparticoes = (departamentoNome?: string): string[] => {
    return getReparticoesPorDepartamento(departamentoNome, targetInstId);
  };

  return {
    orgaos,
    orgaosNomes,
    getDirecoes,
    getDepartamentos,
    getReparticoes,
    findOrgao: (direcao: string) => findOrgaoPorDirecao(direcao, targetInstId),
    findDirecaoEOrgao: (departamento: string) =>
      findDirecaoPorDepartamento(departamento, targetInstId),
    refresh: () => setVersion((v) => v + 1),
  };
}

/**
 * Obtém o ID da instituição atualmente selecionada no sistema
 */
export function getActiveInstituicaoId(): string {
  if (typeof window === "undefined") return "";
  const storedId = localStorage.getItem("sigep_active_instituicao_id");
  if (storedId && storedId !== "isps") return storedId;
  
  // Priorizar instituição ativa cadastrada na Gestão das Instituições
  if (cachedInstituicoes && cachedInstituicoes.length > 0) {
    const validInst = cachedInstituicoes.find((i) => i.id !== "isps") || cachedInstituicoes[0];
    if (validInst?.id) return validInst.id;
  }
  return storedId || "instituicao_principal";
}

/**
 * Obtém os dados completos da instituição ativa a partir da Gestão das Instituições
 */
export function getActiveInstituicao(): any {
  const activeId = getActiveInstituicaoId();
  if (cachedInstituicoes && cachedInstituicoes.length > 0) {
    const found = cachedInstituicoes.find((i) => i.id === activeId);
    if (found) return found;
    return cachedInstituicoes[0];
  }
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("sigep_active_instituicao");
      if (stored) return JSON.parse(stored);
    } catch (_) {}
  }
  return null;
}

/**
 * Define a instituição ativa globalmente no sistema e notifica todos os componentes
 */
export function setActiveInstituicaoId(instituicaoId: string) {
  if (typeof window === "undefined") return;
  const cleanId = instituicaoId || "instituicao_principal";
  localStorage.setItem("sigep_active_instituicao_id", cleanId);
  window.dispatchEvent(
    new CustomEvent("instituicao_changed", { detail: { instituicaoId: cleanId } })
  );
  window.dispatchEvent(new CustomEvent("sigep_estrutura_updated"));
}

/**
 * Constrói dinamicamente os itens de menu e submenus para a instituição ativa ou especificada.
 * Garante que qualquer nova Direção, Departamento ou Setor cadastrado na Gestão das Instituições
 * esteja imediatamente visível no menu para a sua operação.
 */
export function buildMenuItemsForInstituicao(targetInstId?: string) {
  const instId = targetInstId || getActiveInstituicaoId();
  const isDefaultInst = !instId || instId === "original" || instId === "isps";

  // Obter a estrutura completa e atualizada da instituição
  const orgaos = getOrgaosFromGestaoInstituicoes(instId);

  // Bloco Sistema fixo padrão em todas as instituições
  const sistemaBlock = {
    title: "Sistema",
    icon: Settings,
    color: "bg-black",
    items: [],
  };

  if (isDefaultInst) {
    // Para o ISPS, usamos a hierarquia base e enriquecemos com quaisquer direções / departamentos novos adicionados
    const enrichedBase = baseMenuItems.map((block) => {
      if (block.title === "Sistema") return block;

      // Localizar o órgão correspondente na estrutura dinâmica
      const matchedOrgan = orgaos.find(
        (o) =>
          o.nome.toLowerCase() === block.title.toLowerCase() ||
          o.nome.toLowerCase().includes(block.title.toLowerCase()) ||
          block.title.toLowerCase().includes(o.nome.toLowerCase())
      );

      if (!matchedOrgan) return block;

      // Identificar direções customizadas adicionadas dinamicamente
      const customDirs = matchedOrgan.direcoes.filter((d) => d.isCustom);
      if (customDirs.length === 0) return block;

      const dynamicDirItems = customDirs.map((d) => ({
        title: d.rawTitle || d.nome,
        subItems: d.departamentos.map((dept) => ({
          title: dept.nome,
          subItems: (dept.reparticoes || []).map((r) => ({
            title: typeof r === "string" ? r : (r as any).name || (r as any).title || "",
          })),
        })),
      }));

      // Evitar duplicados por título
      const existingTitles = new Set((block.items || []).map((i) => i.title.toUpperCase()));
      const filteredNew = dynamicDirItems.filter((i) => !existingTitles.has(i.title.toUpperCase()));

      return {
        ...block,
        items: [...(block.items || []), ...filteredNew],
      };
    });

    // Se houver órgãos totalmente customizados adicionados à instituição padrão
    const customExtraOrgans = orgaos.filter((o) => o.isCustom);
    const extraBlocks = customExtraOrgans.map((org) => ({
      title: org.nome,
      icon: Layers,
      color: "bg-indigo-900",
      items: org.direcoes.map((d) => ({
        title: d.rawTitle || d.nome,
        subItems: d.departamentos.map((dept) => ({
          title: dept.nome,
          subItems: (dept.reparticoes || []).map((r) => ({
            title: typeof r === "string" ? r : (r as any).name || (r as any).title || "",
          })),
        })),
      })),
    }));

    return [...enrichedBase.filter((b) => b.title !== "Sistema"), ...extraBlocks, sistemaBlock];
  }

  // Para NOVAS INSTITUIÇÕES: A estrutura é 100% baseada no seu organograma e órgãos cadastrados
  const organBlocks = orgaos.map((org, index) => {
    let icon = LayoutGrid;
    let color = "bg-blue-900";

    if (index === 1) {
      icon = Building2;
      color = "bg-red-800";
    } else if (index === 2) {
      icon = Briefcase;
      color = "bg-gray-700";
    } else if (index > 2) {
      icon = Layers;
      color = "bg-indigo-900";
    }

    const items = org.direcoes.map((d) => {
      const dirTitle = d.rawTitle || d.nome;
      const deptItems = (d.departamentos || []).map((dept) => ({
        title: dept.nome,
        subItems: (dept.reparticoes || []).map((r) => ({
          title: typeof r === "string" ? r : (r as any).name || (r as any).title || "",
        })),
      }));

      return {
        title: dirTitle,
        subItems: deptItems,
      };
    });

    return {
      title: org.nome,
      icon,
      color,
      items,
    };
  });

  return [...organBlocks, sistemaBlock];
}

/**
 * Localiza a hierarquia institucional completa (Instituição, Unidade Orgânica, Direção, Departamento, Repartição e Setor)
 * para qualquer setor ou nível navegado na instituição.
 */
export function findFullHierarchyForSector(
  sectorOrTitle?: string,
  targetInstId?: string
): {
  instituicao: any;
  instituicaoNome: string;
  instituicaoLogo: string | null;
  unidadeOrganica: string | null;
  direcao: string | null;
  departamento: string | null;
  reparticao: string | null;
  setor: string | null;
} {
  const activeInst = getActiveInstituicao();
  const instId = targetInstId || activeInst?.id || getActiveInstituicaoId();
  const orgaos = getOrgaosFromGestaoInstituicoes(instId);

  const clean = String(sectorOrTitle || "").trim().toLowerCase();

  let unidadeOrganica: string | null = null;
  let direcao: string | null = null;
  let departamento: string | null = null;
  let reparticao: string | null = null;
  let setor: string | null = null;

  if (clean) {
    outer: for (const org of orgaos) {
      // Verificar se é o órgão
      if (org.nome.toLowerCase() === clean || org.nome.toLowerCase().includes(clean)) {
        unidadeOrganica = org.nome;
        break outer;
      }

      for (const dir of org.direcoes) {
        const dirNome = dir.rawTitle || dir.nome;
        if (
          dirNome.toLowerCase() === clean ||
          dir.nome.toLowerCase() === clean ||
          dirNome.toLowerCase().includes(clean)
        ) {
          unidadeOrganica = org.nome;
          direcao = dirNome;
          break outer;
        }

        for (const dept of dir.departamentos) {
          if (
            dept.nome.toLowerCase() === clean ||
            dept.nome.toLowerCase().includes(clean) ||
            clean.includes(dept.nome.toLowerCase())
          ) {
            unidadeOrganica = org.nome;
            direcao = dirNome;
            departamento = dept.nome;
            break outer;
          }

          for (const rep of dept.reparticoes) {
            const rNome = typeof rep === "string" ? rep : (rep as any).name || (rep as any).title || "";
            if (
              rNome.toLowerCase() === clean ||
              rNome.toLowerCase().includes(clean) ||
              clean.includes(rNome.toLowerCase())
            ) {
              unidadeOrganica = org.nome;
              direcao = dirNome;
              departamento = dept.nome;
              reparticao = rNome;
              break outer;
            }
          }
        }
      }
    }
  }

  return {
    instituicao: activeInst,
    instituicaoNome: activeInst?.nome || "INSTITUIÇÃO PÚBLICA",
    instituicaoLogo: activeInst?.logo && !activeInst.logo.includes("11zvvpOpZARM1yk_irEDpjJ-qBKlTlhad") ? activeInst.logo : null,
    unidadeOrganica,
    direcao,
    departamento,
    reparticao,
    setor: setor || (reparticao ? sectorOrTitle : null),
  };
}

/**
 * Valida e organiza a estrutura hierárquica (Órgão -> Direção -> Departamento -> Repartição -> Setor)
 * garantindo que cada ação ou plano esteja estritamente vinculado ao setor/utilizador logado,
 * evitando desvios na estrutura organizacional da instituição.
 */
export function validarEOrganizarHierarquia(item: any, user: any): any {
  if (!item) return item;

  const userDept = user?.departamento || user?.setor || user?.reparticao || "";
  const userDir = user?.direcao || "";
  const userOrg = user?.orgao || "Órgão de Direção e Gestão";

  const isGlobalAdmin =
    user?.isOwner === true ||
    user?.role === "Administrador" ||
    String(user?.email || "").toLowerCase() === "slaitertripas@gmail.com";

  let validatedItem = { ...item };

  if (!isGlobalAdmin && user) {
    if (userDept && (!validatedItem.departamento || validatedItem.departamento === "Geral" || validatedItem.departamento === "-")) {
      validatedItem.departamento = userDept;
    }
    if (userDir && (!validatedItem.direcao || validatedItem.direcao === "Geral" || validatedItem.direcao === "-")) {
      validatedItem.direcao = userDir;
    }
    if (userOrg && (!validatedItem.orgao || validatedItem.orgao === "Geral")) {
      validatedItem.orgao = userOrg;
    }
  }

  return validatedItem;
}

