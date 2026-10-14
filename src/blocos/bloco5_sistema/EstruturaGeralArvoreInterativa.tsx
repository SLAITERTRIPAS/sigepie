import React, { useState, useEffect, useMemo } from "react";
import {
  Building,
  Network,
  FolderTree,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  Users,
  User,
  Mail,
  Phone,
  Shield,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  Layers,
  Briefcase,
  Tag,
  X,
  RefreshCw,
  Info,
  CornerDownRight,
  Printer,
  ChevronUp,
} from "lucide-react";
import { firestoreService } from "../../lib/firestoreService";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

export interface TreeNode {
  id: string;
  title: string;
  rawTitle?: string;
  sigla?: string;
  level: "instituicao" | "orgao" | "direcao" | "departamento" | "setor";
  type?: string;
  responsavel?: string;
  cargoResponsavel?: string;
  email?: string;
  telefone?: string;
  missao?: string;
  isCustom?: boolean;
  parentId?: string;
  parentTitle?: string;
  directionTitle?: string;
  children?: TreeNode[];
}

interface EstruturaGeralArvoreInterativaProps {
  loggedUser?: any;
  defaultInstituicaoId?: string;
  onNavigateToWorkspace?: (context: any) => void;
  onBack?: () => void;
}

export const EstruturaGeralArvoreInterativa: React.FC<EstruturaGeralArvoreInterativaProps> = ({
  loggedUser,
  defaultInstituicaoId,
  onNavigateToWorkspace,
  onBack,
}) => {
  const isGlobalAdmin =
    loggedUser?.role === "superadmin" ||
    loggedUser?.role === "admin" ||
    loggedUser?.email === "slaitertripas@gmail.com";

  // 1. Instituições
  const [instituicoes, setInstituicoes] = useState<any[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>(
    defaultInstituicaoId || loggedUser?.instituicaoId || "isps"
  );

  // 2. Dados brutos da Firestore
  const [customOrgaos, setCustomOrgaos] = useState<any[]>([]);
  const [customDirecoes, setCustomDirecoes] = useState<any[]>([]);
  const [adicionais, setAdicionais] = useState<any[]>([]);
  const [deletedDirections, setDeletedDirections] = useState<any[]>([]);
  const [colaboradoresList, setColaboradoresList] = useState<any[]>([]);
  const [renamesList, setRenamesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 3. Estados de visualização da árvore
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  // 4. Modais de Definição (Adicionar / Editar / Eliminar Nós)
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [nodeToEdit, setNodeToEdit] = useState<TreeNode | null>(null);
  const [targetParentNode, setTargetParentNode] = useState<TreeNode | null>(null);
  
  // Campos do formulário de nó
  const [formLevel, setFormLevel] = useState<"orgao" | "direcao" | "departamento" | "setor">("direcao");
  const [formTitle, setFormTitle] = useState("");
  const [formSigla, setFormSigla] = useState("");
  const [formResponsavel, setFormResponsavel] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formMissao, setFormMissao] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal de eliminação
  const [nodeToDelete, setNodeToDelete] = useState<TreeNode | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Escuta em tempo real do Firestore
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const unsubInst = onSnapshot(collection(db, "instituicoes"), (snap) => {
      if (!isMounted) return;
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setInstituicoes(list);
    });

    const unsubOrgaos = onSnapshot(collection(db, "orgaos_custom"), (snap) => {
      if (!isMounted) return;
      setCustomOrgaos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubDirecoes = onSnapshot(collection(db, "direcoes_organicas"), (snap) => {
      if (!isMounted) return;
      setCustomDirecoes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubAdicionais = onSnapshot(collection(db, "estrutura_adicionais"), (snap) => {
      if (!isMounted) return;
      setAdicionais(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubDeleted = onSnapshot(collection(db, "direcoes_excluidas"), (snap) => {
      if (!isMounted) return;
      setDeletedDirections(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubColab = onSnapshot(collection(db, "colaboradores"), (snap) => {
      if (!isMounted) return;
      setColaboradoresList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    const unsubRenames = onSnapshot(collection(db, "estrutura_renames"), (snap) => {
      if (!isMounted) return;
      setRenamesList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      isMounted = false;
      unsubInst();
      unsubOrgaos();
      unsubDirecoes();
      unsubAdicionais();
      unsubDeleted();
      unsubColab();
      unsubRenames();
    };
  }, []);

  // Helper para renomeações
  const applyRename = (raw: string, type: string) => {
    if (!raw) return "";
    const cleanRaw = raw.trim();
    const found = renamesList.find(
      (r) =>
        (r.instituicaoId === selectedInstId || (!r.instituicaoId && selectedInstId === "isps")) &&
        r.type === type &&
        r.originalTitle?.trim().toLowerCase() === cleanRaw.toLowerCase()
    );
    return found?.newTitle || cleanRaw;
  };

  // Estrutura padrão inicial (caso a instituição seja ISPS ou default)
  const estruturaPadrao = [
    {
      title: "Órgão de Direção e Gestão",
      type: "Unidade Estrutural Principal",
      direcoes: [
        {
          title: "Conselho de Representantes",
          sigla: "CR",
          departamentos: [],
        },
        {
          title: "Gabinete do Diretor-Geral",
          sigla: "GDG",
          departamentos: [
            {
              title: "Diretor-Geral",
              reparticoes: ["Chefe do GDG", "Secretaria Executiva"],
            },
            {
              title: "Departamento de Planificação Estudos e Projetos",
              sigla: "DPEP",
              reparticoes: [
                "Gabinete do Chefe (DPEP)",
                "Repartição de Planificação",
                "Repartição de Estatística",
                "Setor de Relatório",
                "Setor de Monitoria",
              ],
            },
            {
              title: "Unidade Gestora e Executora de Aquisições",
              sigla: "UGEA",
              reparticoes: ["Chefe da UGEA"],
            },
            {
              title: "Departamento de Cooperação e Relações Exteriores",
              sigla: "DCRE",
              reparticoes: ["Chefe do DCRE", "Setor de Imagem Institucional"],
            },
            {
              title: "Departamento de Controlo Técnico e de Qualidade",
              sigla: "DCTQ",
              reparticoes: ["Chefe do DCTQ", "Setor de Controlo Técnico"],
            },
            {
              title: "Departamento Jurídico",
              sigla: "DJ",
              reparticoes: ["Chefe do DJ", "Setor de Pareceres"],
            },
          ],
        },
        {
          title: "Conselho Administrativo e de Gestão",
          sigla: "CAG",
          departamentos: [],
        },
        {
          title: "Conselho Técnico e de Qualidade",
          sigla: "CTQ",
          departamentos: [],
        },
      ],
    },
    {
      title: "Unidade Orgânica",
      type: "Unidade Estrutural Académica",
      direcoes: [
        {
          title: "Divisão de Engenharia",
          sigla: "DE",
          departamentos: [
            {
              title: "Direção da Divisão de Engenharia",
              reparticoes: ["Diretor da Divisão de Engenharia", "Diretor Adjunto Pedagógico"],
            },
            {
              title: "Departamento de Pesquisa e Extensão",
              reparticoes: ["Repartição de Pesquisa", "Repartição de Extensão"],
            },
            {
              title: "Departamento de Engenharia Eletrotécnica",
              reparticoes: [
                "Chefe do DEE",
                "Diretor do Curso de Engenharia Elétrica",
                "Diretor do Curso de Engenharia Eletrónica e Telecomunicações",
                "Diretor do Curso de Engenharia de Energias Renováveis",
              ],
            },
            {
              title: "Departamento de Engenharia Mecânica",
              reparticoes: [
                "Chefe do DEM",
                "Diretor do Curso de Engenharia Mecânica e Produção",
                "Diretor do Curso de Engenharia Termotécnica",
              ],
            },
            {
              title: "Departamento de Geociências",
              reparticoes: [
                "Chefe do DG",
                "Diretor do Curso de Engenharia de Minas",
                "Diretor do Curso de Engenharia Geológica",
              ],
            },
            {
              title: "Departamento de Ciências Básicas",
              reparticoes: ["Chefe do DCB", "Área de Matemática", "Área de Física", "Área de Química"],
            },
            {
              title: "Departamento de Oficinas e Laboratórios",
              reparticoes: ["Chefe do DOL", "Oficina Mecânica", "Laboratório Elétrico"],
            },
          ],
        },
        {
          title: "DICOSAFA",
          sigla: "DICOSAFA",
          departamentos: [
            {
              title: "Direção da DICOSAFA",
              reparticoes: ["Diretor da DICOSAFA"],
            },
            {
              title: "Departamento de Recursos Humanos",
              sigla: "DRH",
              reparticoes: ["Chefe do RH", "Repartição de Pessoal", "Repartição de Formação", "Repartição de Apoio Social"],
            },
            {
              title: "Departamento de Finanças",
              sigla: "DF",
              reparticoes: ["Chefe de Finanças", "Repartição de Plano e Orçamento", "Repartição de Tesouraria", "Setor de Estatística"],
            },
            {
              title: "Departamento de Património",
              sigla: "DP",
              reparticoes: ["Chefe de DP", "Repartição de E-Património", "Repartição de Infraestrutura e Manutenção", "Repartição de Transporte"],
            },
            {
              title: "Secretaria Geral",
              sigla: "SG",
              reparticoes: ["Chefe da SG", "Secretaria", "SIC"],
            },
            {
              title: "Departamento TIC",
              sigla: "DTIC",
              reparticoes: ["Chefe de DTIC", "Setor de Rede de Computadores", "Setor de Manutenção", "Reprografia", "Oficina de TIC"],
            },
            {
              title: "Departamento Lar de Estudantes",
              sigla: "DLE",
              reparticoes: ["Chefe de DLE", "Repartição de Alojamento", "Repartição de Eventos", "Economato"],
            },
            {
              title: "Departamento de Produção Alimentar",
              sigla: "DPA",
              reparticoes: ["Chefe de DPA", "Repartição de Produção Animal", "Repartição de Produção Vegetal", "Armazém de Thaka"],
            },
          ],
        },
        {
          title: "DICOSSER",
          sigla: "DICOSSER",
          departamentos: [
            {
              title: "Direção da DICOSSER",
              reparticoes: ["Diretor da DICOSSER"],
            },
            {
              title: "Departamento de Registo Académico",
              sigla: "DRA",
              reparticoes: ["Chefe do DRA", "Atendimento Estudantil", "Repartição de Certificação", "Repartição de Exames de Admissão", "Repartição de Matrículas"],
            },
            {
              title: "Departamento de Assuntos Estudantis",
              sigla: "DAE",
              reparticoes: ["Chefe do DAE", "Repartição de Bolsa de Estudos", "Repartição de Desporto e Recreação"],
            },
            {
              title: "Departamento de Biblioteca",
              sigla: "DBA",
              reparticoes: ["Chefe de DBA", "Biblioteca", "Repartição de Documentos", "Repartição de Arquivo"],
            },
          ],
        },
      ],
    },
  ];

  // Identificar a instituição atual
  const currentInst = useMemo(() => {
    return instituicoes.find((i) => i.id === selectedInstId) || {
      id: "isps",
      nome: "Instituto Superior Politécnico de Songo",
      sigla: "ISPS",
      logo: "https://lh3.googleusercontent.com/d/1gV1X1XoGq16oVvP0G6uU1yFfH7uV-kCj",
      primaryColor: "#050b38",
      secondaryColor: "#0d1b54",
      accentColor: "#FFB800",
      tipoActividades: "Ensino Superior e Investigação",
    };
  }, [instituicoes, selectedInstId]);

  // Colaboradores alocados por setor / departamento
  const findResponsavelForUnit = (unitName: string) => {
    if (!unitName) return null;
    const clean = unitName.toLowerCase().trim();
    const match = colaboradoresList.find((c) => {
      const cDept = (c.departamento || "").toLowerCase().trim();
      const cDir = (c.direcao || "").toLowerCase().trim();
      const cSetor = (c.setor || c.reparticao || "").toLowerCase().trim();
      const isChief =
        (c.cargoChefia && c.cargoChefia !== "Nenhum") ||
        (c.cargo && (c.cargo.includes("Diretor") || c.cargo.includes("Chefe")));
      return (
        isChief &&
        (cDept.includes(clean) || clean.includes(cDept) ||
         cDir.includes(clean) || clean.includes(cDir) ||
         cSetor.includes(clean) || clean.includes(cSetor))
      );
    });
    return match ? { nome: match.nome, cargo: match.cargo || match.cargoChefia, email: match.email } : null;
  };

  // Construção completa da árvore hierárquica (Root -> Órgãos -> Direções -> Departamentos -> Setores)
  const treeData = useMemo<TreeNode>(() => {
    const isDefaultInst = !selectedInstId || selectedInstId === "original" || selectedInstId === "isps";
    const instFilteredCustomOrgaos = customOrgaos.filter((co) => (co.instituicaoId || "isps") === selectedInstId);
    const instFilteredCustomDirecoes = customDirecoes.filter((cd) => (cd.instituicaoId || "isps") === selectedInstId);
    const instFilteredAdicionais = adicionais.filter((a) => (a.instituicaoId || "isps") === selectedInstId);
    const instFilteredDeleted = new Set(
      deletedDirections.filter((d) => (d.instituicaoId || "isps") === selectedInstId).map((d) => String(d.title || "").toUpperCase())
    );

    // 1. Órgãos Base
    const baseOrgans = isDefaultInst ? estruturaPadrao : [];

    const mergedOrgansList = [
      ...baseOrgans.map((org, oIdx) => ({
        id: `base_org_${oIdx}`,
        title: applyRename(org.title, "orgao"),
        rawTitle: org.title,
        type: org.type,
        direcoes: org.direcoes || [],
        isCustom: false,
      })),
      ...instFilteredCustomOrgaos.map((co) => ({
        id: co.id,
        title: applyRename(co.title, "orgao"),
        rawTitle: co.title,
        type: co.type || "Órgão Personalizado",
        direcoes: co.direcoes || [],
        isCustom: true,
      })),
    ];

    // Se a instituição não for default e não tem órgãos customizados salvos, mas tem organograma
    if (!isDefaultInst && mergedOrgansList.length === 0 && currentInst && (currentInst.organograma || currentInst.composicao)) {
      mergedOrgansList.push({
        id: `org_geral_${currentInst.id}`,
        title: "Estrutura Orgânica Principal",
        rawTitle: "Estrutura Orgânica Principal",
        type: "Unidade Estrutural Geral",
        direcoes: [],
        isCustom: true,
      });
    }

    // 2. Mapeamento de Órgãos para TreeNode
    const orgaosNodes: TreeNode[] = mergedOrgansList.map((org) => {
      const orgId = org.id || `org_${org.title}`;

      // Direções deste órgão
      const orgDirecoes = (org.direcoes || []).filter(
        (d: any) => !instFilteredDeleted.has(String(d.title || d.nome || "").toUpperCase())
      );

      // Direções adicionais criadas na base de dados para este órgão
      const customDirsForThisOrg = instFilteredCustomDirecoes.filter((cd) => {
        const cdUnit = cd.unitType || "";
        return (
          (cdUnit === org.title || cdUnit === org.rawTitle || applyRename(cdUnit, "orgao") === org.title) &&
          !instFilteredDeleted.has(String(cd.title || "").toUpperCase())
        );
      });

      const allDirecoesRaw = [...orgDirecoes, ...customDirsForThisOrg];

      const direcoesNodes: TreeNode[] = allDirecoesRaw.map((dir: any) => {
        const rawDirTitle = dir.rawTitle || dir.title?.split(" (")[0] || dir.title || dir.nome;
        const finalDirTitle = applyRename(rawDirTitle, "direcao");
        const dirId = dir.id || `dir_${finalDirTitle}_${orgId}`;

        // Departamentos estáticos da direção
        const staticDepts = (dir.departamentos || []).map((dp: any) => ({
          id: dp.id || `dep_${dp.title || dp.nome}`,
          title: applyRename(dp.title || dp.nome, "departamento"),
          rawTitle: dp.title || dp.nome,
          sigla: dp.sigla,
          reparticoes: dp.reparticoes || [],
          isCustom: false,
        }));

        // Departamentos customizados adicionados à direção
        const customDepts = instFilteredAdicionais
          .filter(
            (a) =>
              a.type === "departamento" &&
              (a.directionTitle === rawDirTitle || applyRename(a.directionTitle || "", "direcao") === finalDirTitle)
          )
          .map((a) => ({
            id: a.id,
            title: applyRename(a.name, "departamento"),
            rawTitle: a.name,
            sigla: a.sigla,
            reparticoes: [],
            isCustom: true,
          }));

        const allDeptsRaw = [...staticDepts, ...customDepts];

        const departamentosNodes: TreeNode[] = allDeptsRaw.map((dept: any) => {
          const rawDeptTitle = dept.rawTitle || dept.title;
          const finalDeptTitle = applyRename(rawDeptTitle, "departamento");
          const deptId = dept.id || `dep_${finalDeptTitle}_${dirId}`;

          // Setores/Repartições estáticos
          const staticReps = (dept.reparticoes || []).map((r: any) =>
            typeof r === "string" ? r : r.name || r.title || ""
          );

          // Setores/Repartições customizados adicionados ao departamento
          const customReps = instFilteredAdicionais
            .filter(
              (a) =>
                a.type === "reparticao" &&
                (a.directionTitle === rawDirTitle || applyRename(a.directionTitle || "", "direcao") === finalDirTitle) &&
                (a.parentDepartmentTitle === rawDeptTitle ||
                  applyRename(a.parentDepartmentTitle || "", "departamento") === finalDeptTitle)
            )
            .map((a) => a.name);

          const allRepsClean = Array.from(new Set([...staticReps, ...customReps])).filter(Boolean);

          const setoresNodes: TreeNode[] = allRepsClean.map((repName: string, rIdx: number) => {
            const finalRepTitle = applyRename(repName, "reparticao");
            const repResp = findResponsavelForUnit(finalRepTitle);
            return {
              id: `setor_${finalRepTitle}_${deptId}_${rIdx}`,
              title: finalRepTitle,
              rawTitle: repName,
              level: "setor",
              parentId: deptId,
              parentTitle: finalDeptTitle,
              directionTitle: finalDirTitle,
              responsavel: repResp?.nome,
              cargoResponsavel: repResp?.cargo,
              email: repResp?.email,
              isCustom: customReps.includes(repName),
            };
          });

          const deptResp = findResponsavelForUnit(finalDeptTitle);

          return {
            id: deptId,
            title: finalDeptTitle,
            rawTitle: rawDeptTitle,
            sigla: dept.sigla,
            level: "departamento",
            parentId: dirId,
            parentTitle: finalDirTitle,
            directionTitle: finalDirTitle,
            responsavel: dept.responsavel || deptResp?.nome,
            cargoResponsavel: deptResp?.cargo,
            email: dept.email || deptResp?.email,
            isCustom: dept.isCustom,
            children: setoresNodes,
          };
        });

        const dirResp = findResponsavelForUnit(finalDirTitle);

        return {
          id: dirId,
          title: finalDirTitle,
          rawTitle: rawDirTitle,
          sigla: dir.sigla,
          level: "direcao",
          parentId: orgId,
          parentTitle: org.title,
          responsavel: dir.responsavel || dirResp?.nome,
          cargoResponsavel: dirResp?.cargo || "Diretor / Responsável",
          email: dir.email || dirResp?.email,
          telefone: dir.telefone,
          missao: dir.missao,
          isCustom: dir.isCustom,
          children: departamentosNodes,
        };
      });

      return {
        id: orgId,
        title: org.title,
        rawTitle: org.rawTitle,
        level: "orgao",
        type: org.type,
        isCustom: org.isCustom,
        parentId: currentInst.id,
        parentTitle: currentInst.nome,
        children: direcoesNodes,
      };
    });

    // Raiz: Instituição
    return {
      id: currentInst.id,
      title: currentInst.nome,
      sigla: currentInst.sigla || "SIGEP",
      level: "instituicao",
      responsavel: currentInst.diretorGeral || "Direção Geral",
      missao: currentInst.tipoActividades,
      children: orgaosNodes,
    };
  }, [
    selectedInstId,
    currentInst,
    customOrgaos,
    customDirecoes,
    adicionais,
    deletedDirections,
    colaboradoresList,
    renamesList,
  ]);

  // Expandir automaticamente os nós iniciais
  useEffect(() => {
    if (treeData) {
      const initialExpanded: Record<string, boolean> = {
        [treeData.id]: true,
      };
      (treeData.children || []).forEach((org) => {
        initialExpanded[org.id] = true;
        (org.children || []).forEach((dir) => {
          initialExpanded[dir.id] = true;
        });
      });
      setExpandedNodes(initialExpanded);
    }
  }, [treeData.id]);

  // Contagens estatísticas da árvore
  const stats = useMemo(() => {
    let orgaosCount = 0;
    let direcoesCount = 0;
    let deptsCount = 0;
    let setoresCount = 0;

    (treeData.children || []).forEach((org) => {
      orgaosCount++;
      (org.children || []).forEach((dir) => {
        direcoesCount++;
        (dir.children || []).forEach((dep) => {
          deptsCount++;
          setoresCount += (dep.children || []).length;
        });
      });
    });

    return { orgaosCount, direcoesCount, deptsCount, setoresCount, totalNodes: 1 + orgaosCount + direcoesCount + deptsCount + setoresCount };
  }, [treeData]);

  // Alternar nó expandido / recolhido
  const toggleNode = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  // Expandir tudo / Recolher tudo
  const expandAll = () => {
    const all: Record<string, boolean> = { [treeData.id]: true };
    const recurse = (node: TreeNode) => {
      all[node.id] = true;
      if (node.children) {
        node.children.forEach(recurse);
      }
    };
    recurse(treeData);
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    setExpandedNodes({ [treeData.id]: true });
  };

  // Abrir Modal para adicionar nó filho
  const handleOpenAddModal = (parentNode: TreeNode, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTargetParentNode(parentNode);
    setNodeToEdit(null);

    // Sugere o nível com base no pai
    if (parentNode.level === "instituicao") {
      setFormLevel("orgao");
    } else if (parentNode.level === "orgao") {
      setFormLevel("direcao");
    } else if (parentNode.level === "direcao") {
      setFormLevel("departamento");
    } else if (parentNode.level === "departamento") {
      setFormLevel("setor");
    }

    setFormTitle("");
    setFormSigla("");
    setFormResponsavel("");
    setFormEmail("");
    setFormTelefone("");
    setFormMissao("");
    setModalMode("add");
  };

  // Abrir Modal para editar nó existente
  const handleOpenEditModal = (node: TreeNode, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNodeToEdit(node);
    setTargetParentNode(null);
    setFormLevel(node.level as any);
    setFormTitle(node.rawTitle || node.title);
    setFormSigla(node.sigla || "");
    setFormResponsavel(node.responsavel || "");
    setFormEmail(node.email || "");
    setFormTelefone(node.telefone || "");
    setFormMissao(node.missao || "");
    setModalMode("edit");
  };

  // Salvar ou atualizar nó
  const handleSaveNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert("Por favor, insira o nome da unidade.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === "add") {
        if (formLevel === "orgao") {
          await firestoreService.orgaos_custom.add({
            title: formTitle.trim(),
            type: formMissao.trim() || "Unidade Estrutural Principal",
            direcoes: [],
            instituicaoId: selectedInstId || "",
            createdAt: new Date().toISOString(),
          });
        } else if (formLevel === "direcao") {
          const parentOrganTitle = targetParentNode?.title || "Órgão de Direção e Gestão";
          await firestoreService.direcoes_organicas.add({
            title: formTitle.trim(),
            sigla: formSigla.trim(),
            responsavel: formResponsavel.trim(),
            email: formEmail.trim(),
            telefone: formTelefone.trim(),
            missao: formMissao.trim(),
            unitType: parentOrganTitle,
            departamentos: [],
            instituicaoId: selectedInstId || "",
            createdAt: new Date().toISOString(),
          });
        } else if (formLevel === "departamento") {
          const directionTitle = targetParentNode?.title || "";
          await firestoreService.estrutura_adicionais.add({
            directionTitle,
            type: "departamento",
            name: formTitle.trim(),
            sigla: formSigla.trim(),
            instituicaoId: selectedInstId || "",
            createdAt: new Date().toISOString(),
          });
        } else if (formLevel === "setor") {
          const directionTitle = targetParentNode?.directionTitle || "";
          const departmentTitle = targetParentNode?.title || "";
          await firestoreService.estrutura_adicionais.add({
            directionTitle,
            parentDepartmentTitle: departmentTitle,
            type: "reparticao",
            name: formTitle.trim(),
            instituicaoId: selectedInstId || "",
            createdAt: new Date().toISOString(),
          });
        }

        alert(`${formLevel.toUpperCase()} adicionado à Estrutura Geral com sucesso!`);
      } else if (modalMode === "edit" && nodeToEdit) {
        // Gravar renomeação e atualização no Firestore
        await firestoreService.estrutura_renames.set(
          `rename_${selectedInstId}_${nodeToEdit.level}_${encodeURIComponent(nodeToEdit.rawTitle || nodeToEdit.title)}`,
          {
            originalTitle: nodeToEdit.rawTitle || nodeToEdit.title,
            newTitle: formTitle.trim(),
            type: nodeToEdit.level,
            instituicaoId: selectedInstId || "",
            updatedAt: new Date().toISOString(),
          }
        );

        alert(`Unidade atualizada com sucesso!`);
      }

      // Notificar atualização em todo o sistema
      window.dispatchEvent(new CustomEvent("sigep_estrutura_updated"));
      setModalMode(null);
    } catch (err: any) {
      console.error(err);
      alert("Erro ao gravar a alteração na estrutura: " + (err?.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmar exclusão de nó
  const handleConfirmDelete = async () => {
    if (!nodeToDelete) return;
    setIsDeleting(true);
    try {
      if (nodeToDelete.level === "direcao") {
        await firestoreService.deleteDirectionAndCascade(
          nodeToDelete.rawTitle || nodeToDelete.title,
          !!nodeToDelete.isCustom,
          nodeToDelete.id,
          selectedInstId
        );
      } else if (nodeToDelete.level === "departamento" || nodeToDelete.level === "setor") {
        if (nodeToDelete.id && nodeToDelete.id.startsWith("adicional_")) {
          await firestoreService.estrutura_adicionais.delete(nodeToDelete.id);
        } else {
          // Gravar como renomeação ou exclusão
          await firestoreService.direcoes_excluidas.add({
            title: nodeToDelete.rawTitle || nodeToDelete.title,
            type: nodeToDelete.level,
            instituicaoId: selectedInstId,
            deletedAt: new Date().toISOString(),
          });
        }
      } else if (nodeToDelete.level === "orgao" && nodeToDelete.isCustom) {
        await firestoreService.orgaos_custom.delete(nodeToDelete.id);
      }

      window.dispatchEvent(new CustomEvent("sigep_estrutura_updated"));
      alert(`"${nodeToDelete.title}" foi removido da Estrutura Geral.`);
      setNodeToDelete(null);
    } catch (err: any) {
      console.error(err);
      alert("Erro ao eliminar nó: " + (err?.message || err));
    } finally {
      setIsDeleting(false);
    }
  };

  // Exportar a estrutura como JSON formatado
  const exportStructureJSON = () => {
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(treeData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `estrutura_geral_${selectedInstId}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Cores e ícones de acordo com o nível hierárquico
  const getNodeLevelConfig = (level: string) => {
    switch (level) {
      case "instituicao":
        return {
          label: "Instituição Principal",
          bg: "bg-blue-950 text-white border-blue-900 shadow-md",
          iconBg: "bg-amber-400 text-blue-950",
          icon: Building,
          badgeColor: "bg-amber-400/20 text-amber-300 border-amber-400/40",
        };
      case "orgao":
        return {
          label: "Órgão Estrutural",
          bg: "bg-indigo-900/90 text-white border-indigo-700/80 shadow-sm",
          iconBg: "bg-indigo-500 text-white",
          icon: Network,
          badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
        };
      case "direcao":
        return {
          label: "Direção / Divisão",
          bg: "bg-white text-slate-900 border-blue-200 hover:border-blue-400 shadow-sm",
          iconBg: "bg-blue-600 text-white",
          icon: Briefcase,
          badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "departamento":
        return {
          label: "Departamento",
          bg: "bg-slate-50 text-slate-800 border-purple-200 hover:border-purple-400 shadow-xs",
          iconBg: "bg-purple-600 text-white",
          icon: Layers,
          badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "setor":
        return {
          label: "Repartição / Setor",
          bg: "bg-white text-slate-700 border-emerald-200 hover:border-emerald-400 shadow-2xs",
          iconBg: "bg-emerald-600 text-white",
          icon: Tag,
          badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      default:
        return {
          label: "Unidade",
          bg: "bg-white text-slate-800 border-slate-200",
          iconBg: "bg-slate-600 text-white",
          icon: FolderTree,
          badgeColor: "bg-slate-100 text-slate-600 border-slate-300",
        };
    }
  };

  // Renderizador recursivo de cada Nó da Árvore
  const renderTreeNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expandedNodes[node.id] ?? false;
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const config = getNodeLevelConfig(node.level);
    const IconComponent = config.icon;

    // Filtro de pesquisa
    const isMatch = searchTerm.trim()
      ? node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.sigla && node.sigla.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (node.responsavel && node.responsavel.toLowerCase().includes(searchTerm.toLowerCase()))
      : false;

    return (
      <div key={node.id} className="relative group/node">
        {/* Linha vertical conectora para nós filhos */}
        {depth > 0 && (
          <div
            className="absolute left-[-24px] top-6 w-6 border-b-2 border-slate-300 pointer-events-none rounded-bl-lg"
            style={{ borderColor: depth === 1 ? "#6366f1" : depth === 2 ? "#3b82f6" : "#a855f7" }}
          />
        )}

        <div
          onClick={() => {
            setSelectedNode(node);
            if (hasChildren) toggleNode(node.id);
          }}
          className={`relative flex items-center justify-between p-3.5 my-2 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
            config.bg
          } ${
            isMatch ? "ring-2 ring-amber-400 ring-offset-2 scale-[1.01]" : ""
          } ${
            selectedNode?.id === node.id ? "ring-2 ring-blue-500 shadow-md" : ""
          }`}
        >
          {/* Lado Esquerdo: Ícone + Expansor + Nome do Nó */}
          <div className="flex items-center gap-3 min-w-0 pr-3">
            {/* Botão de Expansão / Recolhimento */}
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => toggleNode(node.id, e)}
                className="w-6 h-6 rounded-lg bg-black/10 hover:bg-black/20 flex items-center justify-center transition shrink-0 cursor-pointer"
                title={isExpanded ? "Recolher ramo" : "Expandir ramo"}
              >
                {isExpanded ? (
                  <ChevronDown size={14} className="stroke-[2.5]" />
                ) : (
                  <ChevronRight size={14} className="stroke-[2.5]" />
                )}
              </button>
            ) : (
              <div className="w-6 h-6 flex items-center justify-center text-slate-300 shrink-0">
                <CornerDownRight size={13} />
              </div>
            )}

            {/* Ícone distintivo do nível */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${config.iconBg} shadow-xs`}>
              <IconComponent size={16} />
            </div>

            {/* Título & Sigla & Nível */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-black text-xs md:text-sm tracking-tight truncate">
                  {node.title}
                </h4>
                {node.sigla && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/10 border border-black/15">
                    {node.sigla}
                  </span>
                )}
                {node.isCustom && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-700 border border-amber-300">
                    Definido
                  </span>
                )}
              </div>

              {/* Informações de Apoio (Responsável / Tipo) */}
              <div className="flex items-center gap-3 text-[11px] opacity-80 mt-0.5 flex-wrap">
                <span className="font-semibold">{config.label}</span>
                {node.responsavel && (
                  <span className="flex items-center gap-1 font-bold">
                    <User size={11} /> {node.responsavel}
                  </span>
                )}
                {hasChildren && (
                  <span className="font-bold opacity-75">
                    • {node.children!.length} {node.level === "departamento" ? "setores" : node.level === "direcao" ? "departamentos" : "unidades"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Lado Direito: Ações Rápidas de Gestão */}
          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            {/* Botão Adicionar Subordinado (apenas se não for setor) */}
            {node.level !== "setor" && (
              <button
                type="button"
                onClick={(e) => handleOpenAddModal(node, e)}
                className="p-1.5 rounded-lg bg-black/5 hover:bg-blue-600 hover:text-white transition cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2.5"
                title={`Adicionar subordinado a ${node.title}`}
              >
                <Plus size={13} />
                <span className="hidden sm:inline">Adicionar</span>
              </button>
            )}

            {/* Botão Editar */}
            {node.level !== "instituicao" && (
              <button
                type="button"
                onClick={(e) => handleOpenEditModal(node, e)}
                className="p-1.5 rounded-lg bg-black/5 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                title="Editar nó da árvore"
              >
                <Edit2 size={13} />
              </button>
            )}

            {/* Botão Eliminar */}
            {node.level !== "instituicao" && isGlobalAdmin && (
              <button
                type="button"
                onClick={() => setNodeToDelete(node)}
                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition cursor-pointer"
                title="Remover da estrutura geral"
              >
                <Trash2 size={13} />
              </button>
            )}

            {/* Detalhes Rápidos */}
            <button
              type="button"
              onClick={() => setSelectedNode(node)}
              className="p-1.5 rounded-lg bg-black/5 hover:bg-black/15 transition cursor-pointer"
              title="Ver detalhes da unidade"
            >
              <Info size={13} />
            </button>
          </div>
        </div>

        {/* Ramos Subordinados (Children) com recuo e guia visual */}
        {hasChildren && isExpanded && (
          <div className="pl-7 ml-4 border-l-2 border-slate-300 relative space-y-1 transition-all">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header com Identidade Visual & Seleção de Instituição */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-amber-400 text-blue-950 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 shadow-sm">
                <FolderTree size={12} /> Modelo de Árvore Interativo
              </span>
              <span className="text-xs text-blue-200 font-bold">
                Estrutura Geral Hierárquica
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
              {currentInst.logo && (
                <img
                  src={currentInst.logo}
                  alt={currentInst.nome}
                  className="w-10 h-10 object-contain rounded-xl bg-white/10 p-1 backdrop-blur-sm"
                />
              )}
              <span>{currentInst.nome}</span>
            </h1>

            <p className="text-xs md:text-sm text-blue-100 max-w-3xl leading-relaxed opacity-90">
              Defina, organize e explore a hierarquia organizacional completa de órgãos, direções, departamentos e setores em tempo real.
            </p>
          </div>

          {/* Seletor Rápido de Instituição para Administradores */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {isGlobalAdmin && instituicoes.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 flex items-center gap-2">
                <Building size={16} className="text-amber-400 ml-2 shrink-0" />
                <select
                  value={selectedInstId}
                  onChange={(e) => {
                    setSelectedInstId(e.target.value);
                    setSelectedNode(null);
                  }}
                  className="bg-transparent text-white text-xs font-black outline-none pr-4 cursor-pointer py-1.5"
                >
                  {instituicoes.map((inst) => (
                    <option key={inst.id} value={inst.id} className="text-slate-900 font-bold">
                      {inst.nome} {inst.sigla ? `(${inst.sigla})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Botão de Criação de Novo Órgão */}
            <button
              type="button"
              onClick={() => handleOpenAddModal(treeData)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
            >
              <Plus size={15} />
              <span>Adicionar Órgão</span>
            </button>

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Voltar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Estatísticas da Hierarquia da Instituição */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instituição</p>
            <p className="text-lg font-black text-slate-900">{currentInst.sigla || "1"}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Network size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Órgãos</p>
            <p className="text-lg font-black text-slate-900">{stats.orgaosCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Briefcase size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direções</p>
            <p className="text-lg font-black text-slate-900">{stats.direcoesCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Departamentos</p>
            <p className="text-lg font-black text-slate-900">{stats.deptsCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Tag size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Setores</p>
            <p className="text-lg font-black text-slate-900">{stats.setoresCount}</p>
          </div>
        </div>
      </div>

      {/* 3. Barra de Ferramentas da Árvore (Pesquisa, Expandir, Recolher, Exportar) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Campo de Pesquisa em Tempo Real */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar na árvore hierárquica..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Botões de Ação na Árvore */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={expandAll}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronDown size={14} />
            <span>Expandir Tudo</span>
          </button>

          <button
            type="button"
            onClick={collapseAll}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronUp size={14} />
            <span>Recolher Tudo</span>
          </button>

          <button
            type="button"
            onClick={exportStructureJSON}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Descarregar estrutura em formato JSON"
          >
            <Download size={14} />
            <span>Exportar JSON</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
            title="Imprimir estrutura"
          >
            <Printer size={14} />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* 4. Corpo Principal: Árvore Hierárquica + Painel Lateral de Detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna da Árvore Interativa */}
        <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[500px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <FolderTree size={18} className="text-blue-600" />
              <h3 className="font-black text-slate-900 text-base">Organograma em Árvore Interativa</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              Clique num nó para ver detalhes ou use os botões para definir a estrutura
            </span>
          </div>

          {/* Renderização da Árvore a partir da raiz */}
          <div className="space-y-2 overflow-x-auto pb-4">
            {renderTreeNode(treeData, 0)}
          </div>
        </div>

        {/* Coluna do Painel de Detalhes do Nó Selecionado */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Info size={16} className="text-blue-600" />
                Detalhes da Unidade
              </h4>
              {selectedNode && (
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-4">
                {/* Cabeçalho do Nó */}
                <div className="space-y-1">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getNodeLevelConfig(selectedNode.level).badgeColor}`}>
                    {getNodeLevelConfig(selectedNode.level).label}
                  </span>
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {selectedNode.title}
                  </h3>
                  {selectedNode.sigla && (
                    <p className="text-xs font-bold text-blue-700">Sigla: {selectedNode.sigla}</p>
                  )}
                </div>

                {/* Subordinação / Unidade Pai */}
                {selectedNode.parentTitle && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Unidade Superior / Pai:
                    </span>
                    <span className="font-bold text-slate-800">{selectedNode.parentTitle}</span>
                  </div>
                )}

                {/* Responsável Atribuído */}
                <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-blue-950">
                    <User size={15} className="text-blue-600 shrink-0" />
                    <span>Responsável / Chefia:</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    {selectedNode.responsavel || "Não atribuído formalmente"}
                  </p>
                  {selectedNode.cargoResponsavel && (
                    <p className="text-[11px] text-slate-500 font-medium">
                      Cargo: {selectedNode.cargoResponsavel}
                    </p>
                  )}
                  {selectedNode.email && (
                    <p className="text-[11px] text-blue-700 font-mono flex items-center gap-1">
                      <Mail size={12} /> {selectedNode.email}
                    </p>
                  )}
                  {selectedNode.telefone && (
                    <p className="text-[11px] text-slate-600 font-mono flex items-center gap-1">
                      <Phone size={12} /> {selectedNode.telefone}
                    </p>
                  )}
                </div>

                {/* Missão ou Atividades */}
                {selectedNode.missao && (
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      Missão & Atribuições:
                    </span>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed font-medium">
                      {selectedNode.missao}
                    </p>
                  </div>
                )}

                {/* Subunidades vinculadas */}
                {selectedNode.children && selectedNode.children.length > 0 && (
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                      Subunidades Integradas ({selectedNode.children.length}):
                    </span>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {selectedNode.children.map((ch) => (
                        <div
                          key={ch.id}
                          onClick={() => setSelectedNode(ch)}
                          className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 text-xs font-bold text-slate-700 hover:text-blue-800 flex items-center justify-between cursor-pointer transition"
                        >
                          <span className="truncate">{ch.title}</span>
                          <ChevronRight size={13} className="text-slate-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ações Administrativas no Painel */}
                <div className="pt-2 flex flex-col gap-2">
                  {selectedNode.level !== "setor" && (
                    <button
                      type="button"
                      onClick={() => handleOpenAddModal(selectedNode)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
                    >
                      <Plus size={14} /> Adicionar Subunidade
                    </button>
                  )}
                  {selectedNode.level !== "instituicao" && (
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(selectedNode)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Edit2 size={14} /> Editar Unidade
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <FolderTree size={36} className="mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-bold">Nenhuma unidade selecionada</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Clique em qualquer órgão, direção, departamento ou setor na árvore à esquerda para visualizar suas propriedades completas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Modal de Definição (Adicionar ou Editar Nós na Estrutura) */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  {modalMode === "add" ? (
                    <>
                      <Plus size={18} className="text-blue-600" />
                      Adicionar à Estrutura Geral
                    </>
                  ) : (
                    <>
                      <Edit2 size={18} className="text-blue-600" />
                      Editar Unidade Estrutural
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  {modalMode === "add"
                    ? `Subordinado a: ${targetParentNode?.title || currentInst.nome}`
                    : `Unidade: ${nodeToEdit?.title}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNode} className="space-y-4">
              {/* Nível da Unidade */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Nível Hierárquico *
                </label>
                <select
                  disabled={modalMode === "edit"}
                  value={formLevel}
                  onChange={(e) => setFormLevel(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="orgao">Órgão Estrutural</option>
                  <option value="direcao">Direção / Divisão / Gabinete</option>
                  <option value="departamento">Departamento</option>
                  <option value="setor">Repartição / Setor</option>
                </select>
              </div>

              {/* Título / Nome da Unidade */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Nome da Unidade *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Departamento de Recursos Humanos"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Sigla */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Sigla (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: DRH"
                  value={formSigla}
                  onChange={(e) => setFormSigla(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Responsável / Chefia */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Responsável / Chefe
                </label>
                <input
                  type="text"
                  placeholder="Nome do responsável ou selecione da lista de colaboradores"
                  value={formResponsavel}
                  onChange={(e) => setFormResponsavel(e.target.value)}
                  list="colab-list-suggestions"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <datalist id="colab-list-suggestions">
                  {colaboradoresList.map((c) => (
                    <option key={c.id} value={c.nome}>
                      {c.cargo ? `${c.nome} (${c.cargo})` : c.nome}
                    </option>
                  ))}
                </datalist>
              </div>

              {/* Missão / Atribuições */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Missão / Atribuições da Unidade
                </label>
                <textarea
                  rows={2}
                  placeholder="Breve descrição das competências desta unidade..."
                  value={formMissao}
                  onChange={(e) => setFormMissao(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition shadow cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "A Gravar..." : modalMode === "add" ? "Adicionar Unidade" : "Gravar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal de Confirmação de Eliminação */}
      {nodeToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-5 animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle size={26} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900">Remover da Estrutura Geral?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tem certeza que deseja remover a unidade{" "}
                <span className="font-black text-slate-900">"{nodeToDelete.title}"</span> da
                instituição <span className="font-bold text-blue-900">{currentInst.nome}</span>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setNodeToDelete(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition shadow cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "A Remover..." : "Sim, Remover Unidade"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstruturaGeralArvoreInterativa;
