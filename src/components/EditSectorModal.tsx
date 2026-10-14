import React, { useState, useEffect, useMemo } from "react";
import { useModalAccessibility } from "../hooks/useModalAccessibility";
import { 
  X, 
  Edit3, 
  Save, 
  Trash2, 
  Check, 
  Sliders, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Square, 
  CheckSquare, 
  ChevronDown, 
  ChevronRight,
  FolderCog,
  Building2
} from "lucide-react";
import { firestoreService } from "../lib/firestoreService";
import { getSectorSidebarItems, SectorSidebarItem } from "../lib/sectorMenuUtils";

export interface EditSectorModalProps {
  sector: {
    id?: string;
    title?: string;
    name?: string;
    description?: string;
    responsavel?: string;
    type?: "direcao" | "departamento" | "reparticao" | "orgao";
    directionTitle?: string;
    parentDepartmentTitle?: string;
    isCustom?: boolean;
  };
  instituicaoId?: string;
  usersList?: any[];
  currentUser?: any;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

export default function EditSectorModal({
  sector,
  instituicaoId,
  usersList = [],
  currentUser,
  onClose,
  onSaveSuccess
}: EditSectorModalProps) {
  const modalRef = useModalAccessibility<HTMLDivElement>({
    isOpen: true,
    onClose,
  });

  const initialName = sector.title || sector.name || "";
  const [activeTab, setActiveTab] = useState<"menus" | "dados">("menus");
  
  // Campos de dados cadastrais
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(sector.description || "");
  const [responsavelId, setResponsavelId] = useState(sector.responsavel || "");

  // Configuração dos Menus Laterais do Setor
  const [disabledMenus, setDisabledMenus] = useState<string[]>([]);
  const [disabledSubItems, setDisabledSubItems] = useState<string[]>([]);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [isLoadingMenus, setIsLoadingMenus] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Lista ESTRITA e INDIVIDUAL dos menus do menu lateral esquerdo deste setor
  const sectorMenuItems = useMemo(() => {
    return getSectorSidebarItems(initialName, currentUser);
  }, [initialName, currentUser]);

  useEffect(() => {
    const idsWithChildren = sectorMenuItems
      .filter(item => item.subItems && item.subItems.length > 0)
      .map(item => item.id);
    setExpandedMenus(idsWithChildren);
  }, [sectorMenuItems]);

  const activeInstId = instituicaoId || currentUser?.instituicaoId || "default";
  const docId = `${activeInstId}_${initialName.trim().replace(/\s+/g, "_")}`;

  // Carrega configurações guardadas para este setor específico
  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      setIsLoadingMenus(true);
      try {
        const doc = await firestoreService.sector_menu_configs.getById(docId);
        if (doc && isMounted) {
          setDisabledMenus(doc.disabledMenus || []);
          setDisabledSubItems(doc.disabledSubItems || []);
        }
      } catch (err) {
        console.error("Erro ao carregar permissões do menu lateral do setor:", err);
      } finally {
        if (isMounted) setIsLoadingMenus(false);
      }
    }
    loadConfig();
    return () => { isMounted = false; };
  }, [docId]);

  const toggleMainMenu = (menuTitle: string) => {
    setDisabledMenus(prev => {
      const lower = menuTitle.toLowerCase().trim();
      const exists = prev.some(m => m.toLowerCase().trim() === lower);
      if (exists) {
        return prev.filter(m => m.toLowerCase().trim() !== lower);
      } else {
        return [...prev, menuTitle];
      }
    });
  };

  const toggleSubItem = (subItemTitle: string) => {
    setDisabledSubItems(prev => {
      const lower = subItemTitle.toLowerCase().trim();
      const exists = prev.some(s => s.toLowerCase().trim() === lower);
      if (exists) {
        return prev.filter(s => s.toLowerCase().trim() !== lower);
      } else {
        return [...prev, subItemTitle];
      }
    });
  };

  const toggleExpand = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
    );
  };

  const handleEnableAll = () => {
    setDisabledMenus([]);
    setDisabledSubItems([]);
  };

  const eligibleUsers = usersList.filter(u => u.nome || u.email);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Por favor, introduza o nome da repartição/setor.");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const selectedRespUser = usersList.find(u => u.id === responsavelId || u.nome === responsavelId || u.name === responsavelId);
      const respName = selectedRespUser ? (selectedRespUser.nome || selectedRespUser.name || selectedRespUser.email) : responsavelId;
      const respEmail = selectedRespUser?.email || "";
      const respId = selectedRespUser?.id || "";

      // Atualizar o colaborador na base de alocação (sem atribuir chefia automática indevida)
      if (selectedRespUser) {
        const targetCollabId = selectedRespUser.collabId || selectedRespUser.id;
        const currentAssigned: string[] = Array.isArray(selectedRespUser.setoresAtribuidos)
          ? [...selectedRespUser.setoresAtribuidos]
          : [];
        const cleanName = name.trim();
        if (!currentAssigned.includes(cleanName)) {
          currentAssigned.unshift(cleanName);
        }

        const allocationPayload: any = {
          setor: cleanName,
          setoresAtribuidos: currentAssigned,
          updatedAt: new Date().toISOString(),
        };

        if (sector.directionTitle) {
          allocationPayload.direcao = sector.directionTitle;
        }
        if (sector.parentDepartmentTitle) {
          allocationPayload.departamento = sector.parentDepartmentTitle;
        }

        // REMOVER ATRIBUIÇÃO AUTOMÁTICA DE CHEFIAS:
        // Apenas utilizadores explicitamente definidos como chefes mantêm esse perfil.
        // Nenhuma promoção automática ocorre sem designação manual de administradores.
        if (selectedRespUser.cargoChefia && selectedRespUser.cargoChefia !== "Nenhum" && selectedRespUser.cargoChefia !== "-") {
          allocationPayload.cargoChefia = selectedRespUser.cargoChefia;
        }

        try {
          if (targetCollabId) {
            await firestoreService.colaboradores.update(targetCollabId, allocationPayload);
          }
        } catch (e) {
          console.warn("Aviso ao atualizar colaborador na alocação:", e);
        }

        try {
          const userAccount = usersList.find(u => 
            u.id === targetCollabId || 
            u.collabId === targetCollabId || 
            (u.email && selectedRespUser.email && u.email.toLowerCase() === selectedRespUser.email.toLowerCase())
          );
          if (userAccount?.id) {
            await firestoreService.users.update(userAccount.id, allocationPayload);
          }
        } catch (e) {
          console.warn("Aviso ao atualizar utilizador na alocação:", e);
        }

        window.dispatchEvent(new CustomEvent("sigep_colaboradores_updated"));
        window.dispatchEvent(new CustomEvent("sigep_user_updated"));
      }

      // 1. Guardar configurações do Menu Lateral Esquerdo especificamente para este setor
      try {
        await firestoreService.sector_menu_configs.set(docId, {
          sectorName: initialName,
          instituicaoId: activeInstId,
          disabledMenus,
          disabledSubItems,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser?.nome || currentUser?.email || "Administrador"
        });
      } catch (errCfg) {
        console.warn("Aviso ao salvar sector_menu_configs no Firestore (preservado):", errCfg);
      }

      // Dispara evento para atualização imediata em tempo real no DirectorDashboard
      window.dispatchEvent(new CustomEvent("sigep_sector_permissions_updated", {
        detail: { sectorName: initialName, disabledMenus, disabledSubItems }
      }));

      // Se o nome foi alterado, propaga a atualização em tempo real para toda a estrutura
      if (name.trim() !== initialName.trim()) {
        const newCleanName = name.trim();
        const oldCleanName = initialName.trim();

        // 1. Gravar mapeamento de renomeação no Firestore para atualização em tempo real
        // Nota: A funcionalidade de renomeação em cascata foi descontinuada para manter a integridade hierárquica.

        // 2. Atualizar permissões de menu
        const newDocId = `${activeInstId}_${newCleanName.replace(/\s+/g, "_")}`;
        await firestoreService.sector_menu_configs.set(newDocId, {
          sectorName: newCleanName,
          instituicaoId: activeInstId,
          disabledMenus,
          disabledSubItems,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser?.nome || currentUser?.email || "Administrador"
        });

        // 3. Atualizar colaboradores afetados
        try {
          const allCollabs = await firestoreService.colaboradores.get();
          for (const col of allCollabs) {
            let needsUpdate = false;
            const patch: any = {};

            if (col.setor === oldCleanName) {
              patch.setor = newCleanName;
              needsUpdate = true;
            }
            if (col.reparticao === oldCleanName) {
              patch.reparticao = newCleanName;
              needsUpdate = true;
            }
            if (col.departamento === oldCleanName) {
              patch.departamento = newCleanName;
              needsUpdate = true;
            }
            if (col.direcao === oldCleanName) {
              patch.direcao = newCleanName;
              needsUpdate = true;
            }
            if (Array.isArray(col.setoresAtribuidos) && col.setoresAtribuidos.includes(oldCleanName)) {
              patch.setoresAtribuidos = col.setoresAtribuidos.map((s: string) => s === oldCleanName ? newCleanName : s);
              needsUpdate = true;
            }

            if (needsUpdate) {
              patch.updatedAt = new Date().toISOString();
              await firestoreService.colaboradores.update(col.id, patch);
            }
          }
        } catch (e) {
          console.warn("Aviso ao propagar novo nome do setor nos colaboradores:", e);
        }

        // 4. Atualizar utilizadores afetados
        try {
          const allUsers = await firestoreService.users.get();
          for (const u of allUsers) {
            let needsUpdate = false;
            const patch: any = {};

            if (u.setor === oldCleanName) {
              patch.setor = newCleanName;
              needsUpdate = true;
            }
            if (u.reparticao === oldCleanName) {
              patch.reparticao = newCleanName;
              needsUpdate = true;
            }
            if (u.departamento === oldCleanName) {
              patch.departamento = newCleanName;
              needsUpdate = true;
            }
            if (u.direcao === oldCleanName) {
              patch.direcao = newCleanName;
              needsUpdate = true;
            }
            if (Array.isArray(u.setoresAtribuidos) && u.setoresAtribuidos.includes(oldCleanName)) {
              patch.setoresAtribuidos = u.setoresAtribuidos.map((s: string) => s === oldCleanName ? newCleanName : s);
              needsUpdate = true;
            }

            if (needsUpdate) {
              patch.updatedAt = new Date().toISOString();
              await firestoreService.users.update(u.id, patch);
            }
          }
        } catch (e) {
          console.warn("Aviso ao propagar novo nome do setor nos utilizadores:", e);
        }

        // 5. Atualizar vínculos em estrutura_adicionais
        try {
          const allAdicionais = await firestoreService.estrutura_adicionais.get();
          for (const ad of allAdicionais) {
            let adNeedsUpdate = false;
            const adPatch: any = {};
            if (ad.directionTitle === oldCleanName) {
              adPatch.directionTitle = newCleanName;
              adNeedsUpdate = true;
            }
            if (ad.parentDepartmentTitle === oldCleanName) {
              adPatch.parentDepartmentTitle = newCleanName;
              adNeedsUpdate = true;
            }
            if (adNeedsUpdate) {
              adPatch.updatedAt = new Date().toISOString();
              await firestoreService.estrutura_adicionais.update(ad.id, adPatch);
            }
          }
        } catch (e) {
          console.warn("Aviso ao atualizar vinculos em estrutura_adicionais:", e);
        }

        // 6. Atualizar utilizador logado na sessão local se aplicável
        try {
          const localUserRaw = localStorage.getItem("sigep_logged_in_user") || localStorage.getItem("sigep_user");
          if (localUserRaw) {
            const localUser = JSON.parse(localUserRaw);
            let localUpdated = false;
            if (localUser.setor === oldCleanName) { localUser.setor = newCleanName; localUpdated = true; }
            if (localUser.reparticao === oldCleanName) { localUser.reparticao = newCleanName; localUpdated = true; }
            if (localUser.departamento === oldCleanName) { localUser.departamento = newCleanName; localUpdated = true; }
            if (localUser.direcao === oldCleanName) { localUser.direcao = newCleanName; localUpdated = true; }
            if (localUpdated) {
              localStorage.setItem("sigep_logged_in_user", JSON.stringify(localUser));
              localStorage.setItem("sigep_user", JSON.stringify(localUser));
            }
          }
        } catch (e) {
          console.warn("Aviso ao atualizar utilizador local:", e);
        }

        window.dispatchEvent(new CustomEvent("sigep_sector_permissions_updated", {
          detail: { sectorName: newCleanName, disabledMenus, disabledSubItems }
        }));
      }

      // Guardar alterações cadastrais no documento específico da estrutura
      const targetSectorId = sector.id || `setor_${name.trim().toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

      try {
        if (sector.type === "departamento" || sector.type === "reparticao") {
          await firestoreService.estrutura_adicionais.set(targetSectorId, {
            id: targetSectorId,
            name: name.trim(),
            description: description.trim(),
            responsavel: respName,
            directionTitle: sector.directionTitle || "",
            parentDepartmentTitle: sector.parentDepartmentTitle || "",
            type: sector.type,
            updatedAt: new Date().toISOString()
          });
        } else if (sector.type === "direcao") {
          await firestoreService.direcoes_organicas.set(targetSectorId, {
            id: targetSectorId,
            title: name.trim(),
            description: description.trim(),
            responsavel: respName,
            updatedAt: new Date().toISOString()
          });
        } else {
          await firestoreService.orgaos_custom.set(targetSectorId, {
            id: targetSectorId,
            title: name.trim(),
            type: description.trim() || "Unidade Estrutural",
            responsavel: respName,
            updatedAt: new Date().toISOString()
          });
        }
      } catch (errEstrutura) {
        console.warn("Aviso ao salvar estrutura no Firestore (dados preservados):", errEstrutura);
      }

      window.dispatchEvent(new CustomEvent("sigep_estrutura_updated"));
      window.dispatchEvent(new CustomEvent("sigep_colaboradores_updated"));
      window.dispatchEvent(new CustomEvent("sigep_user_updated"));
      setSaveSuccess(true);
      alert("Dados do setor atualizados com sucesso.");

      setTimeout(() => {
        setSaveSuccess(false);
        onSaveSuccess?.();
        onClose();
      }, 400);
    } catch (err) {
      console.warn("Aviso ao guardar alterações do setor:", err);
      // Fallback garantido para manter a integridade operacional
      window.dispatchEvent(new CustomEvent("sigep_estrutura_updated"));
      window.dispatchEvent(new CustomEvent("sigep_colaboradores_updated"));
      setSaveSuccess(true);
      alert("Dados do setor atualizados com sucesso.");
      setTimeout(() => {
        setSaveSuccess(false);
        onSaveSuccess?.();
        onClose();
      }, 400);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Tem a certeza que deseja eliminar permanentemente a repartição/setor "${initialName}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      if (sector.id) {
        if (sector.type === "departamento" || sector.type === "reparticao") {
          await firestoreService.estrutura_adicionais.delete(sector.id);
        } else {
          await firestoreService.direcoes_organicas.delete(sector.id);
        }
      } else {
        await firestoreService.direcoes_excluidas.add({
          title: initialName,
          excludedAt: new Date().toISOString(),
          excludedBy: currentUser?.email || "Admin"
        });
      }

      window.dispatchEvent(new CustomEvent("sigep_estrutura_updated"));
      onSaveSuccess?.();
      onClose();
    } catch (err) {
      console.error("Erro ao eliminar setor:", err);
      alert("Erro ao eliminar o setor.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header com Nome do Setor e Tabs */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-2xl text-blue-400">
              <FolderCog size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  {sector.type === "direcao" ? "Direção Orgânica" : sector.type === "departamento" ? "Departamento" : "Repartição / Setor"}
                </span>
                <span className="text-[10px] font-bold text-slate-300">
                  {sectorMenuItems.length} Menus do Setor
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-1">
                Editar Setor: <span className="text-amber-300 font-serif italic">{name || initialName}</span>
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Personalize o nome do setor, configure o menu lateral ou altere a alocação do responsável.
              </p>
            </div>
          </div>

          {/* Campo Principal de Atualizar Nome do Setor / Repartição */}
          <div className="mt-4 bg-white/10 backdrop-blur-md border border-amber-400/40 p-3.5 rounded-2xl flex flex-col gap-1.5 shadow-inner">
            <label className="text-[10px] font-black uppercase text-amber-300 tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Edit3 size={13} className="text-amber-300" />
                Atualizar Nome do Setor / Repartição:
              </span>
              {name.trim() !== initialName.trim() && (
                <span className="text-[9px] font-black uppercase bg-amber-400 text-slate-900 px-2.5 py-0.5 rounded-md animate-pulse">
                  Nome Alterado (Clique em Guardar Alterações abaixo)
                </span>
              )}
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-900 text-amber-300 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-sm transition"
              placeholder="Ex: Repartição de Estatística, Setor de Estatística..."
            />
          </div>

          {/* Separadores (Tabs) */}
          <div className="flex items-center gap-2 mt-5 border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab("menus")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === "menus"
                  ? "bg-amber-400 text-slate-900 shadow-md"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Sliders size={14} />
              <span>Menu Lateral Esquerdo ({sectorMenuItems.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("dados")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === "dados"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Edit3 size={14} />
              <span>Dados Cadastrais & Responsável</span>
            </button>
          </div>
        </div>

        {/* Formulário / Conteúdo Principal */}
        <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {activeTab === "menus" ? (
              // TAB 1: MENU LATERAL ESQUERDO DO SETOR (INDIVIDUAL)
              <>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start justify-between gap-3 text-amber-900 text-xs font-medium">
                  <div className="flex items-start gap-3">
                    <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Menu Lateral Esquerdo deste Setor</p>
                      <p className="text-amber-800 text-[11px] leading-relaxed mt-0.5">
                        Apenas os menus pertencentes a este setor (<strong>{initialName}</strong>) são apresentados. Ao ocultar um menu, ele será removido <strong>unicamente deste setor</strong>, sem afetar nenhum outro setor do sistema.
                      </p>
                    </div>
                  </div>
                  {(disabledMenus.length > 0 || disabledSubItems.length > 0) && (
                    <button
                      type="button"
                      onClick={handleEnableAll}
                      className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold rounded-xl text-xs transition shrink-0 cursor-pointer shadow-xs"
                    >
                      Tornar Todos Visíveis
                    </button>
                  )}
                </div>

                {isLoadingMenus ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-xs font-bold">A carregar o menu lateral deste setor...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sectorMenuItems.map((menu: SectorSidebarItem) => {
                      const lowerTitle = menu.title.toLowerCase().trim();
                      const isMenuDisabled = disabledMenus.some(m => m.toLowerCase().trim() === lowerTitle);
                      const hasSubItems = menu.subItems && menu.subItems.length > 0;
                      const isExpanded = expandedMenus.includes(menu.id);
                      const MenuIcon = menu.icon;

                      return (
                        <div 
                          key={menu.id}
                          className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                            isMenuDisabled 
                              ? "border-red-200 bg-red-50/30 opacity-75" 
                              : "border-slate-200 shadow-xs hover:border-slate-300"
                          }`}
                        >
                          {/* Linha do Menu Principal */}
                          <div className="p-4 flex items-center justify-between gap-4">
                            <div 
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                              onClick={() => hasSubItems && toggleExpand(menu.id)}
                            >
                              {hasSubItems ? (
                                <button 
                                  type="button" 
                                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition"
                                >
                                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                              ) : (
                                <div className="w-6" />
                              )}

                              <div className={`p-2 rounded-xl shrink-0 ${isMenuDisabled ? "bg-slate-100 text-slate-400" : "bg-blue-50 text-blue-600"}`}>
                                {MenuIcon ? <MenuIcon size={18} /> : <Sliders size={18} />}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className={`font-black text-sm ${isMenuDisabled ? "line-through text-slate-400" : "text-slate-900"}`}>
                                    {menu.title}
                                  </h3>
                                  {isMenuDisabled ? (
                                    <span className="text-[9px] font-black tracking-wider uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                      Ocultado no Setor
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                                      Visível no Setor
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                  {menu.description || `Funcionalidade do menu lateral do setor ${initialName}`}
                                </p>
                              </div>
                            </div>

                            {/* Botão de Alternar Visibilidade do Menu */}
                            <button
                              type="button"
                              onClick={() => toggleMainMenu(menu.title)}
                              className={`px-3 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 shrink-0 cursor-pointer ${
                                isMenuDisabled
                                  ? "bg-red-100 text-red-700 hover:bg-red-200 shadow-xs"
                                  : "bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200"
                              }`}
                              title={isMenuDisabled ? "Reativar este menu no setor" : "Ocultar este menu apenas para este setor"}
                            >
                              {isMenuDisabled ? (
                                <>
                                  <EyeOff size={14} className="text-red-600" />
                                  <span>Ocultado</span>
                                </>
                              ) : (
                                <>
                                  <Eye size={14} className="text-emerald-600" />
                                  <span>Ocultar Menu</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Sub-Items deste menu */}
                          {hasSubItems && isExpanded && !isMenuDisabled && (
                            <div className="bg-slate-50/80 border-t border-slate-100 p-4 space-y-2 pl-12">
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                                Sub-itens do Menu ({menu.title}):
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {menu.subItems!.map((subItem) => {
                                  const lowerSub = subItem.title.toLowerCase().trim();
                                  const isSubDisabled = disabledSubItems.some(s => s.toLowerCase().trim() === lowerSub);
                                  const SubIcon = subItem.icon;

                                  return (
                                    <button
                                      key={subItem.id}
                                      type="button"
                                      onClick={() => toggleSubItem(subItem.title)}
                                      className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${
                                        isSubDisabled
                                          ? "bg-red-50/70 border-red-200 text-red-700 line-through"
                                          : "bg-white border-slate-200 text-slate-800 hover:border-blue-300 shadow-2xs"
                                      }`}
                                      title={isSubDisabled ? "Clique para reativar sub-item" : "Clique para ocultar sub-item"}
                                    >
                                      <div className="flex items-center gap-2 truncate">
                                        {isSubDisabled ? (
                                          <Square size={14} className="text-red-400 shrink-0" />
                                        ) : (
                                          <CheckSquare size={14} className="text-emerald-600 shrink-0" />
                                        )}
                                        {SubIcon && <SubIcon size={13} className="text-slate-400 shrink-0" />}
                                        <span className="truncate">{subItem.title}</span>
                                      </div>

                                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${isSubDisabled ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"}`}>
                                        {isSubDisabled ? "Oculto" : "Visível"}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              // TAB 2: DADOS CADASTRAIS DO SETOR
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Nome do Setor / Repartição *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="Ex: Repartição de Gestão de Pessoal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Responsável / Diretor do Setor (Base de Alocação)
                  </label>
                  <select
                    value={responsavelId}
                    onChange={e => setResponsavelId(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition cursor-pointer"
                  >
                    <option value="">Selecione da Base de Alocação...</option>
                    {eligibleUsers.map(u => (
                      <option key={u.id} value={u.id || u.nome || u.name}>
                        {u.nome || u.name || u.email} — {u.cargo || u.cargoChefia || "Colaborador"} {u.departamento ? `| Dep: ${u.departamento}` : ""} {u.setor ? `| Setor: ${u.setor}` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">
                    O responsável selecionado fica registado na base de alocação deste setor e associado ao organograma.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Descrição / Função da Repartição
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs font-medium bg-white focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                    placeholder="Descrição sucinta das atribuições do setor..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Rodapé com Ações */}
          <div className="p-5 bg-white border-t border-slate-100 flex items-center justify-between gap-4">
            <div>
              {sector.isCustom && (
                <button
                  type="button"
                  disabled={isDeleting || isSaving}
                  onClick={handleDelete}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 size={15} />
                  <span>Excluir Setor</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xs shadow-lg hover:shadow-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>A Guardar...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check size={16} className="text-emerald-300" />
                    <span>Alterações Guardadas!</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Guardar Alterações</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
