import React, { useMemo, useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Building2,
  Briefcase,
  Settings,
  LayoutGrid,
  Pen,
  MessageSquare,
  FileText,
  ChevronRight,
  Bell,
  AlertTriangle,
} from "lucide-react";
import { normalize as n, isMatch, toTitleCase as tc } from "../../lib/utils";
import { isBossUser, isSuperBossUser, getRoles } from "../../lib/auth";
import { firestoreService } from "../../lib/firestoreService";
import { baseMenuItems } from "../../constants/menuHierarchy";
import {
  buildMenuItemsForInstituicao,
  getActiveInstituicao,
  getActiveInstituicaoId,
} from "../../lib/instituicaoEstruturaService";

export default function MainMenu({
  user,
  onNavigate,
  onShowAlert,
  onBack,
  onLogout,
  onGestaoDocumentos,
}: {
  user?: any;
  onNavigate: (
    title: string,
    items: {
      title: string;
      subItems?: { title: string; accessible?: boolean }[];
      accessible?: boolean;
    }[],
  ) => void;
  onShowAlert: (msg: string) => void;
  onBack: () => void;
  onLogout: () => void;
  onGestaoDocumentos?: () => void;
}) {
  const [pendingCount, setPendingCount] = useState(0);
  const [requisicoes, setRequisicoes] = useState<any[]>([]);
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [resetRequests, setResetRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubReq = firestoreService.requisicoes_internas.subscribe(setRequisicoes);
    const unsubExp = firestoreService.expedientes.subscribe(setExpedientes);
    const unsubReset = firestoreService.password_reset_requests.subscribe(setResetRequests);
    return () => {
      unsubReq();
      unsubExp();
      unsubReset();
    };
  }, [user]);

  const pendingForMe = useMemo(() => {
    if (!user) return [];
    return [
      ...requisicoes.filter((req) => {
        const step = req.etapaAtual;
        const status = req.status;
        if (step === 0 && req.userId === user.id) return false;
        if (step === 1 && (user.departamento?.toLowerCase().includes("secretaria") || user.direcao?.toLowerCase().includes("secretaria"))) return true;
        if (step === 2 && (user.departamento?.toLowerCase().includes("economato") || user.direcao?.toLowerCase().includes("economato"))) return true;
        if (step === 3 && (user.cargo?.toLowerCase().includes("chefe") || user.role?.toLowerCase().includes("chefe"))) return true;
        if (step === 4 && status === "Favorável" && (user.departamento?.toLowerCase().includes("economato") || user.direcao?.toLowerCase().includes("economato"))) return true;
        if (step === 4 && status === "Desfavorável" && (user.departamento?.toLowerCase().includes("secretaria") || user.direcao?.toLowerCase().includes("secretaria"))) return true;
        if (step === 5 && req.userId === user.id) return true;
        return false;
      }),
      ...expedientes.filter((exp) => {
        if (exp.status === "Pendente" && (exp.destino?.toLowerCase() === user.departamento?.toLowerCase() || exp.destino?.toLowerCase() === user.direcao?.toLowerCase())) return true;
        return false;
      }),
      ...resetRequests.filter((req) => {
        return req.status === "Pendente" && (user.isOwner || user.role === "Administrador do Sistema");
      }),
    ];
  }, [requisicoes, expedientes, resetRequests, user]);

  const isAdmin = isSuperBossUser(user);

  const [activeInstId, setActiveInstId] = useState<string>(() => {
    return user?.instituicaoId || getActiveInstituicaoId();
  });
  const [activeInst, setActiveInst] = useState<any>(() => getActiveInstituicao());
  const [estruturaVersion, setEstruturaVersion] = useState(0);
  const [disabledMenus, setDisabledMenus] = useState<string[]>([]);
  const [disabledSubItems, setDisabledSubItems] = useState<string[]>([]);

  const userSector = user?.departamento || user?.reparticao || user?.setor || user?.direcao || "";

  useEffect(() => {
    if (!userSector) return;
    const instId = user?.instituicaoId || activeInstId || "default";
    const docId = `${instId}_${userSector.trim().replace(/\s+/g, "_")}`;

    const loadSectorConfig = async () => {
      try {
        const config = await firestoreService.sector_menu_configs.getById(docId);
        if (config) {
          setDisabledMenus(config.disabledMenus || []);
          setDisabledSubItems(config.disabledSubItems || []);
        } else {
          setDisabledMenus([]);
          setDisabledSubItems([]);
        }
      } catch (_) {}
    };

    loadSectorConfig();

    const handlePermissionsUpdated = (e: any) => {
      if (e.detail?.sectorName?.toLowerCase() === userSector.toLowerCase()) {
        setDisabledMenus(e.detail.disabledMenus || []);
        setDisabledSubItems(e.detail.disabledSubItems || []);
      }
    };

    window.addEventListener("sigep_sector_permissions_updated", handlePermissionsUpdated);
    return () => {
      window.removeEventListener("sigep_sector_permissions_updated", handlePermissionsUpdated);
    };
  }, [userSector, user?.instituicaoId, activeInstId]);

  useEffect(() => {
    const handleInstChange = (e: any) => {
      if (e.detail?.instituicaoId) {
        setActiveInstId(e.detail.instituicaoId);
      } else {
        setActiveInstId(getActiveInstituicaoId());
      }
      setActiveInst(getActiveInstituicao());
      setEstruturaVersion((v) => v + 1);
    };

    const handleEstruturaUpdate = () => {
      setActiveInst(getActiveInstituicao());
      setEstruturaVersion((v) => v + 1);
    };

    window.addEventListener("instituicao_changed", handleInstChange);
    window.addEventListener("instituicao_updated", handleEstruturaUpdate);
    window.addEventListener("sigep_estrutura_updated", handleEstruturaUpdate);

    return () => {
      window.removeEventListener("instituicao_changed", handleInstChange);
      window.removeEventListener("instituicao_updated", handleEstruturaUpdate);
      window.removeEventListener("sigep_estrutura_updated", handleEstruturaUpdate);
    };
  }, []);

  const menuItems = useMemo(() => {
    const filterAndSetAccessible = (node: any): any => {
      if (disabledMenus.includes(node.title)) {
        return null;
      }

      const filteredItems = node.items
        ?.map(filterAndSetAccessible)
        .filter(Boolean);

      const filteredSubItems = node.subItems
        ?.filter((sub: any) => !disabledSubItems.includes(sub.title))
        .map(filterAndSetAccessible)
        .filter(Boolean);

      return {
        ...node,
        accessible: true,
        visible: true,
        items: filteredItems,
        subItems: filteredSubItems,
      };
    };

    const isGlobalAdmin = 
      isSuperBossUser(user) || 
      user?.isOwner || 
      user?.role === "Administrador do Sistema" || 
      user?.role === "Administrador" ||
      (typeof user?.role === "string" && user.role.toLowerCase().includes("admin") && !user?.instituicaoId && !user?.setor);

    const dynamicBlocks = buildMenuItemsForInstituicao(user?.instituicaoId || activeInstId);
    
    // Se for o Administrador Geral do Sistema, os órgãos operacionais internos da instituição
    // ("Órgão de Direção e Gestão", "Unidade orgânica", "Serviços Centrais") não são exibidos no menu principal,
    // ficando acessível apenas o módulo "Sistema" para gestão global.
    const accessibleBlocks = isGlobalAdmin
      ? dynamicBlocks.filter((block) => {
          const t = block.title.toLowerCase().trim();
          return (
            t !== "órgão de direção e gestão" &&
            t !== "orgao de direcao e gestao" &&
            t !== "unidade orgânica" &&
            t !== "unidade organica" &&
            t !== "serviços centrais" &&
            t !== "servicos centrais"
          );
        })
      : dynamicBlocks;

    return accessibleBlocks.map(filterAndSetAccessible).filter(Boolean);
  }, [user, activeInstId, estruturaVersion, disabledMenus, disabledSubItems]);

  const sidebarColor = activeInst?.sidebarColor || activeInst?.secondaryColor;

  return (
    <div 
      className="flex-1 min-h-0 w-full flex flex-col overflow-y-auto p-0 transition-colors duration-500"
      style={{ backgroundColor: sidebarColor ? `${sidebarColor}08` : "white" }}
    >
      <main className="flex-1 min-h-0 w-full flex flex-col items-center p-0 overflow-y-auto mt-0">
        <div className="text-center mb-2 flex flex-col items-center shrink-0 mt-10">
          {pendingForMe.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border-2 border-red-500/20 p-4 rounded-3xl flex items-center gap-4 shadow-xl max-w-md animate-pulse"
            >
              <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <Bell size={24} />
              </div>
              <div className="text-left">
                <h4 className="text-red-900 font-black text-sm tracking-tight">Processos Pendentes</h4>
                <p className="text-red-700 text-xs font-bold leading-tight">
                  Existem {pendingForMe.length} notificações que requerem a sua atenção imediata no sistema.
                </p>
              </div>
            </motion.div>
          )}
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-500 mb-1 lg:mb-2 mt-[1px] tracking-tighter font-serif bg-transparent"
            style={{
              textShadow:
                "1px 1px 0 #000, 2px 2px 0 #000, 3px 3px 0 #000, 4px 4px 0 #000",
            }}
          >
            Menu Principal
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-500 font-medium font-serif italic">
            Selecione a área a que deseja aceder
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 w-[90%] mx-auto py-2 sm:py-6">
          {menuItems
            .filter((item: any) => item && (item.visible !== false))
            .map((item: any, index: number) => {
              const IconComp = item.icon || LayoutGrid;
              const bgColor = item.color || "bg-blue-900";
              return (
                <button
                  key={index}
                  onClick={() => {
                    onNavigate(item.title, item.items || []);
                  }}
                  className={`${bgColor} w-full text-white p-3 sm:p-4 rounded-xl sm:rounded-[1.5rem] flex sm:flex-col items-center justify-between sm:justify-center gap-2 sm:gap-4 min-h-[3.2rem] sm:min-h-[8.4rem] lg:min-h-[12.6rem] shadow-lg hover:shadow-xl active:scale-[0.98] touch-manipulation transition-all duration-200 cursor-pointer text-left sm:text-center group`}
                >
                  <div className="p-1.5 sm:p-3 bg-white/10 rounded-lg sm:rounded-xl group-hover:bg-white/20 transition-colors shrink-0">
                    <IconComp
                      className="w-5 h-5 sm:w-10 sm:h-10 lg:w-12 lg:h-12"
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="text-sm sm:text-base lg:text-lg font-black font-serif tracking-tight leading-tight flex-1 text-center">
                    {item.title}
                  </span>
                  <ChevronRight
                    size={16}
                    className="sm:hidden text-white/70 shrink-0"
                  />
                </button>
              );
            })}
        </div>
      </main>
    </div>
  );
}
