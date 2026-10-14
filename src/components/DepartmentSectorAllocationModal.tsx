import React, { useState, useEffect, useMemo } from "react";
import { 
  X, 
  Users, 
  Check, 
  Save, 
  Plus, 
  ShieldCheck, 
  Wrench, 
  Briefcase, 
  UserCheck, 
  Layers, 
  Info,
  CheckSquare,
  Square,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { firestoreService } from "../lib/firestoreService";
import { getSetoresByDepartamento } from "../constants/formOptions";
import { isTechnicianUser, isSuperBossUser } from "../lib/auth";

export interface DepartmentSectorAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  departmentName: string;
  directionName?: string;
  instituicaoId?: string;
  onAllocationUpdated?: () => void;
}

export default function DepartmentSectorAllocationModal({
  isOpen,
  onClose,
  currentUser,
  departmentName,
  directionName,
  instituicaoId,
  onAllocationUpdated,
}: DepartmentSectorAllocationModalProps) {
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [newSectorInput, setNewSectorInput] = useState("");
  
  // Mapa de setores atribuídos por colaborador (id -> string[])
  const [assignedMap, setAssignedMap] = useState<Record<string, string[]>>({});
  const [selectedColabToAdd, setSelectedColabToAdd] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Normaliza o nome do departamento
  const cleanDeptName = (departmentName || currentUser?.departamento || "Departamento").trim();

  // Carrega colaboradores e utilizadores da base de dados Firestore
  useEffect(() => {
    if (!isOpen) return;

    const unsubColab = firestoreService.colaboradores.subscribe((data) => {
      setColaboradores(data || []);
    });

    const unsubUsers = firestoreService.users.subscribe((data) => {
      setUsersList(data || []);
    });

    return () => {
      unsubColab();
      unsubUsers();
    };
  }, [isOpen]);

  // Inicializa a lista de setores do departamento
  useEffect(() => {
    if (!cleanDeptName) return;

    const defaultSectors = getSetoresByDepartamento(cleanDeptName);
    const setSet = new Set<string>(defaultSectors);

    // Também inclui setores já existentes em colaboradores deste departamento
    colaboradores.forEach((c) => {
      const cDept = (c.departamento || "").toLowerCase().trim();
      if (cDept === cleanDeptName.toLowerCase() || cDept.includes(cleanDeptName.toLowerCase())) {
        if (c.setor && typeof c.setor === "string") setSet.add(c.setor.trim());
        if (Array.isArray(c.setoresAtribuidos)) {
          c.setoresAtribuidos.forEach((s: string) => {
            if (s && typeof s === "string") setSet.add(s.trim());
          });
        }
      }
    });

    // Se nenhum setor foi encontrado, coloca o próprio nome do departamento como base
    if (setSet.size === 0) {
      setSet.add(`Setor Técnico de ${cleanDeptName}`);
      setSet.add(`Setor Administrativo de ${cleanDeptName}`);
    }

    setAvailableSectors(Array.from(setSet).sort());
  }, [cleanDeptName, colaboradores]);

  // Mapeia os colaboradores pertencentes a este departamento ou que devem ser geridos
  const departmentTeam = useMemo(() => {
    const normDept = cleanDeptName.toLowerCase().trim();
    const teamMap = new Map<string, any>();

    // 1. Sempre incluir o próprio chefe logado se ele pertencer a este departamento ou for chefe geral
    if (currentUser) {
      const myKey = (currentUser.id || currentUser.email || "me").toLowerCase();
      teamMap.set(myKey, {
        id: currentUser.id || "current_user",
        collabId: currentUser.collabId || currentUser.id,
        nome: currentUser.nome || currentUser.name || "Chefe do Departamento",
        cargo: currentUser.cargo || currentUser.cargoChefia || "Chefe do Departamento",
        cargoChefia: currentUser.cargoChefia || currentUser.cargo || "Chefe do Departamento",
        email: currentUser.email || "",
        departamento: currentUser.departamento || cleanDeptName,
        setor: currentUser.setor || "",
        setoresAtribuidos: currentUser.setoresAtribuidos || (currentUser.setor ? [currentUser.setor] : []),
        isMe: true,
      });
    }

    // 2. Procurar na coleção de colaboradores
    colaboradores.forEach((c) => {
      const cDept = (c.departamento || "").toLowerCase().trim();
      const cDir = (c.direcao || "").toLowerCase().trim();
      const isMatch = cDept === normDept || 
                      (cDept.length > 2 && normDept.includes(cDept)) || 
                      (normDept.length > 2 && cDept.includes(normDept));

      if (isMatch) {
        const key = (c.id || c.email || c.nome).toLowerCase();
        teamMap.set(key, {
          id: c.id,
          collabId: c.id,
          nome: c.nome || c.name || "Colaborador",
          cargo: c.cargo || "Colaborador",
          cargoChefia: c.cargoChefia || "",
          email: c.email || "",
          departamento: c.departamento || cleanDeptName,
          setor: c.setor || "",
          setoresAtribuidos: Array.isArray(c.setoresAtribuidos) 
            ? c.setoresAtribuidos 
            : (c.setor ? [c.setor] : []),
          isMe: currentUser && (c.id === currentUser.id || c.id === currentUser.collabId || (c.email && c.email.toLowerCase() === (currentUser.email || "").toLowerCase())),
        });
      }
    });

    // 3. Procurar também nos utilizadores autenticados que pertencem a este departamento
    usersList.forEach((u) => {
      const uDept = (u.departamento || "").toLowerCase().trim();
      if (uDept === normDept || (uDept.length > 2 && normDept.includes(uDept))) {
        const key = (u.collabId || u.id || u.email || u.name).toLowerCase();
        if (teamMap.has(key)) {
          const existing = teamMap.get(key);
          teamMap.set(key, {
            ...existing,
            userId: u.id,
            setoresAtribuidos: (existing.setoresAtribuidos && existing.setoresAtribuidos.length > 0)
              ? existing.setoresAtribuidos
              : (u.setoresAtribuidos || []),
          });
        } else {
          teamMap.set(key, {
            id: u.id,
            userId: u.id,
            collabId: u.collabId || u.id,
            nome: u.nome || u.name || "Colaborador",
            cargo: u.cargo || "Colaborador",
            cargoChefia: u.cargoChefia || "",
            email: u.email || "",
            departamento: u.departamento || cleanDeptName,
            setor: u.setor || "",
            setoresAtribuidos: Array.isArray(u.setoresAtribuidos) 
              ? u.setoresAtribuidos 
              : (u.setor ? [u.setor] : []),
            isMe: currentUser && (u.id === currentUser.id || (u.email && u.email.toLowerCase() === (currentUser.email || "").toLowerCase())),
          });
        }
      }
    });

    const list = Array.from(teamMap.values());

    // Ordenar: Chefe em primeiro lugar, Técnicos em segundo, e os demais a seguir
    return list.sort((a, b) => {
      const aIsBoss = a.isMe || (a.cargoChefia && a.cargoChefia !== "Nenhum" && a.cargoChefia !== "-") || (a.cargo || "").toLowerCase().includes("chefe");
      const bIsBoss = b.isMe || (b.cargoChefia && b.cargoChefia !== "Nenhum" && b.cargoChefia !== "-") || (b.cargo || "").toLowerCase().includes("chefe");
      if (aIsBoss && !bIsBoss) return -1;
      if (!aIsBoss && bIsBoss) return 1;

      const aIsTec = isTechnicianUser(a);
      const bIsTec = isTechnicianUser(b);
      if (aIsTec && !bIsTec) return -1;
      if (!aIsTec && bIsTec) return 1;

      return (a.nome || "").localeCompare(b.nome || "");
    });
  }, [cleanDeptName, colaboradores, usersList, currentUser]);

  // Preenche o estado inicial de setores atribuídos para cada colaborador
  useEffect(() => {
    const initialMap: Record<string, string[]> = {};
    departmentTeam.forEach((member) => {
      const assigned = Array.isArray(member.setoresAtribuidos) && member.setoresAtribuidos.length > 0
        ? [...member.setoresAtribuidos]
        : member.setor ? [member.setor] : [];
      initialMap[member.id] = assigned;
    });
    setAssignedMap(initialMap);
  }, [departmentTeam]);

  // Alterna a atribuição de um setor para um membro
  const toggleSectorForMember = (memberId: string, sectorName: string) => {
    setAssignedMap((prev) => {
      const currentList = prev[memberId] || [];
      const exists = currentList.includes(sectorName);
      const updated = exists
        ? currentList.filter((s) => s !== sectorName)
        : [...currentList, sectorName];
      return { ...prev, [memberId]: updated };
    });
  };

  // Adicionar um novo setor criado pelo chefe
  const handleAddNewSector = () => {
    const trimmed = newSectorInput.trim();
    if (!trimmed) return;
    if (!availableSectors.includes(trimmed)) {
      setAvailableSectors((prev) => [...prev, trimmed]);
    }
    setNewSectorInput("");
  };

  // Adicionar um colaborador externo da instituição para este departamento
  const handleAddColabToDepartment = (colabId: string) => {
    if (!colabId) return;
    const colab = colaboradores.find((c) => c.id === colabId);
    if (!colab) return;

    setAssignedMap((prev) => ({
      ...prev,
      [colab.id]: colab.setoresAtribuidos || (colab.setor ? [colab.setor] : []),
    }));
    setSelectedColabToAdd("");
  };

  // Guardar as novas alocações no Firestore
  const handleSaveAllocations = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      for (const member of departmentTeam) {
        const assigned = assignedMap[member.id] || [];
        const primarySector = assigned[0] || member.setor || "";

        const payload: any = {
          departamento: cleanDeptName,
          setoresAtribuidos: assigned,
          setor: primarySector,
          updatedAt: new Date().toISOString(),
        };

        if (directionName) {
          payload.direcao = directionName;
        }

        // 1. Atualizar na coleção de colaboradores
        if (member.collabId) {
          try {
            await firestoreService.colaboradores.update(member.collabId, payload);
          } catch (e) {
            console.warn(`Erro ao atualizar colaborador ${member.collabId}:`, e);
          }
        }

        // 2. Atualizar na coleção de utilizadores autenticados caso exista conta
        const targetUserId = member.userId || (usersList.find((u) => 
          u.id === member.id || 
          u.collabId === member.id || 
          (u.email && member.email && u.email.toLowerCase() === member.email.toLowerCase())
        )?.id);

        if (targetUserId) {
          try {
            await firestoreService.users.update(targetUserId, payload);
          } catch (e) {
            console.warn(`Erro ao atualizar utilizador ${targetUserId}:`, e);
          }
        }

        // 3. Se for o próprio utilizador logado (Chefe), atualizar no localStorage e disparar evento
        if (member.isMe || (currentUser && (member.id === currentUser.id || member.id === currentUser.collabId))) {
          const updatedCurrentUser = {
            ...currentUser,
            departamento: cleanDeptName,
            setoresAtribuidos: assigned,
            setor: primarySector,
          };
          try {
            localStorage.setItem("sigep_user", JSON.stringify(updatedCurrentUser));
            localStorage.setItem("sigep_logged_in_user", JSON.stringify(updatedCurrentUser));
          } catch (_) {}
        }
      }

      // Notificar os componentes da aplicação
      window.dispatchEvent(new CustomEvent("sigep_colaboradores_updated"));
      window.dispatchEvent(new CustomEvent("sigep_user_updated"));
      window.dispatchEvent(new CustomEvent("sigep_estrutura_updated"));

      setSaveSuccess(true);
      onAllocationUpdated?.();

      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Erro ao guardar alocações setoriais:", err);
      alert("Erro ao guardar as atribuições de setores.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Cabeçalho */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md">
              <Users size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white">
                  Atribuição e Alocação Setorial da Equipa
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Chefia & Técnicos
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Layers size={13} className="text-blue-400" />
                <span>Departamento: <strong className="text-white">{cleanDeptName}</strong></span>
                {directionName && <span className="opacity-70">({directionName})</span>}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Banner Informativo sobre a Regra de Negócio solicitada */}
        <div className="px-6 py-3.5 bg-blue-50 border-b border-blue-100 flex items-start gap-3 shrink-0">
          <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 leading-relaxed">
            <strong className="font-bold">Regra de Alocação Institucional:</strong> O responsável de cada setor está registado na base de alocação. Cada chefe é locado ao seu setor e pode operar em vários setores. Havendo técnico e chefe no departamento, o chefe atribui os setores de operação do técnico e também os seus próprios setores de atuação.
          </div>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Seção 1: Setores Disponíveis no Departamento */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Briefcase size={15} className="text-blue-600" />
                  Setores Disponíveis no Departamento ({availableSectors.length})
                </h4>
                <p className="text-[11px] text-slate-500">
                  Setores que os membros desta equipa (chefe e técnicos) podem operar
                </p>
              </div>

              {/* Adicionar novo setor na hora */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Novo setor..."
                  value={newSectorInput}
                  onChange={(e) => setNewSectorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddNewSector();
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-44 sm:w-56"
                />
                <button
                  type="button"
                  onClick={handleAddNewSector}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Adicionar</span>
                </button>
              </div>
            </div>

            {/* Chips de setores */}
            <div className="flex flex-wrap gap-2 pt-1">
              {availableSectors.map((sectorName) => (
                <span
                  key={sectorName}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  {sectorName}
                </span>
              ))}
            </div>
          </div>

          {/* Seção 2: Equipa e Atribuição de Setores */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <UserCheck size={16} className="text-blue-600" />
                Membros da Equipa e Atribuição de Setores ({departmentTeam.length})
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                Clique nos setores para atribuir ou remover
              </span>
            </div>

            {departmentTeam.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <Users size={32} className="mx-auto text-slate-400 mb-2 opacity-50" />
                <p className="text-sm font-bold text-slate-600">Nenhum membro encontrado neste departamento.</p>
                <p className="text-xs text-slate-400 mt-1">Utilize o seletor abaixo para associar colaboradores da instituição a este departamento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {departmentTeam.map((member) => {
                  const assigned = assignedMap[member.id] || [];
                  const isBoss = member.isMe || (member.cargoChefia && member.cargoChefia !== "Nenhum" && member.cargoChefia !== "-") || (member.cargo || "").toLowerCase().includes("chefe");
                  const isTec = isTechnicianUser(member);

                  return (
                    <div
                      key={member.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isBoss
                          ? "bg-amber-50/40 border-amber-200/90 shadow-2xs"
                          : isTec
                            ? "bg-blue-50/40 border-blue-200/90 shadow-2xs"
                            : "bg-white border-slate-200"
                      }`}
                    >
                      {/* Top Info */}
                      <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-200/60">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                            isBoss
                              ? "bg-amber-500 text-white"
                              : isTec
                                ? "bg-blue-600 text-white"
                                : "bg-slate-200 text-slate-700"
                          }`}>
                            {isBoss ? <ShieldCheck size={20} /> : isTec ? <Wrench size={20} /> : <Users size={20} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-black text-sm text-slate-900 leading-snug">
                                {member.nome}
                              </h5>
                              {member.isMe && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-200 text-amber-950 border border-amber-300">
                                  Você (Chefe)
                                </span>
                              )}
                              {isBoss && !member.isMe && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                                  Chefia
                                </span>
                              )}
                              {isTec && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-100 text-blue-900 border border-blue-300">
                                  Técnico
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 font-medium mt-0.5">
                              {member.cargo || member.cargoChefia || "Colaborador"}
                              {member.email && <span className="text-slate-400 ml-1.5">• {member.email}</span>}
                            </p>
                          </div>
                        </div>

                        {/* Contador de Setores */}
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black ${
                            assigned.length > 0
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {assigned.length > 0 ? <Check size={12} strokeWidth={3} /> : null}
                            {assigned.length === 1 ? "1 setor atribuído" : `${assigned.length} setores atribuídos`}
                          </span>
                        </div>
                      </div>

                      {/* Grade de Setores para Seleção */}
                      <div className="pt-3">
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                          {isBoss 
                            ? "Setores em que o Chefe opera (Multi-setores):" 
                            : isTec 
                              ? "Setores que o Técnico opera (Atribuídos pelo Chefe):" 
                              : "Setores de Atuação:"}
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {availableSectors.map((sec) => {
                            const isAssigned = assigned.includes(sec);
                            return (
                              <button
                                key={sec}
                                type="button"
                                onClick={() => toggleSectorForMember(member.id, sec)}
                                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
                                  isAssigned
                                    ? isBoss
                                      ? "bg-amber-100/90 border-amber-400 text-amber-950 shadow-xs"
                                      : "bg-blue-100/90 border-blue-400 text-blue-950 shadow-xs"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                                }`}
                              >
                                <span className={`shrink-0 transition-colors ${
                                  isAssigned
                                    ? isBoss ? "text-amber-700" : "text-blue-700"
                                    : "text-slate-300"
                                }`}>
                                  {isAssigned ? <CheckSquare size={16} /> : <Square size={16} />}
                                </span>
                                <span className="truncate leading-tight">{sec}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seção 3: Associar outro colaborador da instituição ao departamento */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800">Associar Colaborador da Base de Alocação a este Departamento:</span>
              <p className="text-[11px] text-slate-500">Selecione outro colaborador caso ainda não esteja alocado a este departamento</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedColabToAdd}
                onChange={(e) => {
                  setSelectedColabToAdd(e.target.value);
                  handleAddColabToDepartment(e.target.value);
                }}
                className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">Selecione um colaborador...</option>
                {colaboradores
                  .filter((c) => !departmentTeam.some((m) => m.id === c.id || m.collabId === c.id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.cargo || "Colaborador"})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-300 animate-fade-in">
                <Check size={15} /> Atribuições guardadas com sucesso!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAllocations}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              <Save size={16} />
              <span>{isSaving ? "A guardar atribuições..." : "Guardar Atribuições de Setores"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
