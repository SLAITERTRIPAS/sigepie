import React, { useState, useEffect, useMemo } from "react";
import { 
  X, 
  Check, 
  Sliders, 
  ShieldAlert, 
  Save, 
  Square,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff
} from "lucide-react";
import { firestoreService } from "../lib/firestoreService";
import { getSectorSidebarItems, SectorSidebarItem } from "../lib/sectorMenuUtils";

export interface SectorMenuConfigModalProps {
  sectorName: string;
  instituicaoId?: string;
  currentUser?: any;
  onClose: () => void;
}

export default function SectorMenuConfigModal({
  sectorName,
  instituicaoId,
  currentUser,
  onClose
}: SectorMenuConfigModalProps) {
  const [disabledMenus, setDisabledMenus] = useState<string[]>([]);
  const [disabledSubItems, setDisabledSubItems] = useState<string[]>([]);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Obtém ESTRITAMENTE e INDIVIDUALMENTE os menus do menu lateral esquerdo deste setor
  const sectorMenuItems = useMemo(() => {
    return getSectorSidebarItems(sectorName, currentUser);
  }, [sectorName, currentUser]);

  // Inicializa os menus expandidos com base nos itens que têm sub-itens
  useEffect(() => {
    const idsWithChildren = sectorMenuItems
      .filter(item => item.subItems && item.subItems.length > 0)
      .map(item => item.id);
    setExpandedMenus(idsWithChildren);
  }, [sectorMenuItems]);

  const activeInstId = instituicaoId || currentUser?.instituicaoId || "default";
  const docId = `${activeInstId}_${sectorName.trim().replace(/\s+/g, "_")}`;

  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      setIsLoading(true);
      try {
        const doc = await firestoreService.sector_menu_configs.getById(docId);
        if (doc && isMounted) {
          setDisabledMenus(doc.disabledMenus || []);
          setDisabledSubItems(doc.disabledSubItems || []);
        }
      } catch (err) {
        console.error("Erro ao carregar configurações de menu do setor:", err);
      } finally {
        if (isMounted) setIsLoading(false);
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

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await firestoreService.sector_menu_configs.set(docId, {
        sectorName,
        instituicaoId: activeInstId,
        disabledMenus,
        disabledSubItems,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.nome || currentUser?.email || "Administrador"
      });

      // Dispara evento para atualização imediata em tempo real no DirectorDashboard
      window.dispatchEvent(new CustomEvent("sigep_sector_permissions_updated", {
        detail: { sectorName, disabledMenus, disabledSubItems }
      }));

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Erro ao guardar permissões do setor:", err);
      alert("Ocorreu um erro ao guardar as configurações de menu do setor.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-400">
              <Sliders size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  Menu Lateral Esquerdo Individual
                </span>
                <span className="text-[10px] font-bold text-slate-300">
                  {sectorMenuItems.length} Menus do Setor
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-1">
                Menus do Setor: <span className="text-amber-300 font-serif italic">{sectorName}</span>
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Configuração individual e exclusiva para este setor. Apenas os menus do menu lateral esquerdo deste setor são listados.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-bold">A carregar o menu lateral deste setor...</p>
            </div>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start justify-between gap-3 text-amber-900 text-xs font-medium">
                <div className="flex items-start gap-3">
                  <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Ocultar ou Exibir Menus deste Setor</p>
                    <p className="text-amber-800 text-[11px] leading-relaxed mt-0.5">
                      Ao clicar em ocultar um menu, ele será removido <strong>exclusivamente da barra lateral deste setor</strong> ({sectorName}). Os outros setores mantêm os seus respetivos menus inalterados.
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
                      {/* Menu Row */}
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
                              {menu.description || `Item do menu lateral esquerdo do setor ${sectorName}`}
                            </p>
                          </div>
                        </div>

                        {/* Toggle entire menu */}
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

                      {/* Sub-Items específicos deste menu */}
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
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-white border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            {disabledMenus.length + disabledSubItems.length > 0 ? (
              <span className="text-red-600 font-bold">
                {disabledMenus.length} menu(s) e {disabledSubItems.length} sub-item(ns) ocultado(s) neste setor
              </span>
            ) : (
              <span className="text-emerald-600 font-bold">
                Todos os menus do setor estão visíveis
              </span>
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
              type="button"
              disabled={isSaving}
              onClick={handleSave}
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
                  <span>Configuração Guardada!</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Guardar Menus do Setor</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
