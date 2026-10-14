import React, { useState, useEffect } from "react";
import { Building2, ChevronRight, CheckCircle2, ShieldAlert, Layers } from "lucide-react";
import { buildEstruturaInstituicao, getActiveInstituicaoId } from "../lib/instituicaoEstruturaService";

interface HierarchicalSelectorProps {
  user: any;
  onSelectionChange: (selection: {
    orgao: string;
    direcao: string;
    departamento: string;
    reparticao: string;
    setor: string;
  }) => void;
  className?: string;
}

export const HierarchicalSelector: React.FC<HierarchicalSelectorProps> = ({
  user,
  onSelectionChange,
  className = "",
}) => {
  const instId = user?.instituicaoId || getActiveInstituicaoId();
  const estrutura = buildEstruturaInstituicao(instId);

  const isGlobalAdmin =
    user?.isOwner === true ||
    user?.role === "Administrador" ||
    String(user?.email || "").toLowerCase() === "slaitertripas@gmail.com";

  const defaultOrg = estrutura[0]?.nome || "Órgão de Direção e Gestão";
  const defaultDir = estrutura[0]?.direcoes[0]?.rawTitle || estrutura[0]?.direcoes[0]?.nome || "";
  const defaultDept = estrutura[0]?.direcoes[0]?.departamentos[0]?.nome || "";
  const defaultRep = estrutura[0]?.direcoes[0]?.departamentos[0]?.reparticoes[0] || "";

  const [selectedOrgao, setSelectedOrgao] = useState<string>(
    user?.orgao || defaultOrg
  );
  const [selectedDirecao, setSelectedDirecao] = useState<string>(
    user?.direcao || defaultDir
  );
  const [selectedDepartamento, setSelectedDepartamento] = useState<string>(
    user?.departamento || defaultDept
  );
  const [selectedReparticao, setSelectedReparticao] = useState<string>(
    user?.reparticao || defaultRep
  );
  const [selectedSetor, setSelectedSetor] = useState<string>(
    user?.setor || user?.reparticao || defaultRep
  );

  // Encontrar o órgão selecionado na árvore
  const currentOrgObj = estrutura.find((o) => o.nome === selectedOrgao) || estrutura[0];
  const direcoesList = currentOrgObj?.direcoes || [];

  // Encontrar a direção selecionada
  const currentDirObj = direcoesList.find(
    (d) => (d.rawTitle || d.nome) === selectedDirecao || d.nome === selectedDirecao
  ) || direcoesList[0];
  const departamentosList = currentDirObj?.departamentos || [];

  // Encontrar o departamento selecionado
  const currentDeptObj = departamentosList.find(
    (dep) => dep.nome === selectedDepartamento
  ) || departamentosList[0];
  const reparticoesList = currentDeptObj?.reparticoes || [];

  useEffect(() => {
    if (!isGlobalAdmin && user) {
      if (user.orgao) setSelectedOrgao(user.orgao);
      if (user.direcao) setSelectedDirecao(user.direcao);
      if (user.departamento) setSelectedDepartamento(user.departamento);
      if (user.reparticao || user.setor) {
        setSelectedReparticao(user.reparticao || user.setor);
        setSelectedSetor(user.setor || user.reparticao);
      }
    }
  }, [user, isGlobalAdmin]);

  useEffect(() => {
    onSelectionChange({
      orgao: selectedOrgao,
      direcao: selectedDirecao,
      departamento: selectedDepartamento,
      reparticao: selectedReparticao,
      setor: selectedSetor,
    });
  }, [selectedOrgao, selectedDirecao, selectedDepartamento, selectedReparticao, selectedSetor, onSelectionChange]);

  return (
    <div className={`bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-900 rounded-2xl">
            <Layers size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-blue-900 text-sm tracking-wide">
              Seletor Hierárquico Institucional
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">
              Validação estrutural: Órgão → Direção → Departamento → Repartição → Setor
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 flex items-center gap-1.5">
          <CheckCircle2 size={12} /> Hierarquia Validada
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Órgão */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
            1. Órgão
          </label>
          <select
            value={selectedOrgao}
            disabled={!isGlobalAdmin && Boolean(user?.orgao)}
            onChange={(e) => {
              setSelectedOrgao(e.target.value);
              const firstDir = estrutura.find(o => o.nome === e.target.value)?.direcoes[0];
              if (firstDir) {
                const dName = firstDir.rawTitle || firstDir.nome;
                setSelectedDirecao(dName);
                const firstDept = firstDir.departamentos[0];
                if (firstDept) {
                  setSelectedDepartamento(firstDept.nome);
                  const firstRep: any = firstDept.reparticoes[0] || "";
                  const repName = typeof firstRep === "string" ? firstRep : (firstRep?.name || "");
                  setSelectedReparticao(repName);
                  setSelectedSetor(repName);
                }
              }
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 disabled:opacity-60 cursor-pointer"
          >
            {estrutura.map((org) => (
              <option key={org.nome} value={org.nome}>
                {org.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Direção */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
            2. Direção / Unidade
          </label>
          <select
            value={selectedDirecao}
            disabled={!isGlobalAdmin && Boolean(user?.direcao)}
            onChange={(e) => {
              setSelectedDirecao(e.target.value);
              const dObj = direcoesList.find(d => (d.rawTitle || d.nome) === e.target.value || d.nome === e.target.value);
              const firstDept = dObj?.departamentos[0];
              if (firstDept) {
                setSelectedDepartamento(firstDept.nome);
                const firstRep: any = firstDept.reparticoes[0] || "";
                const repName = typeof firstRep === "string" ? firstRep : (firstRep?.name || "");
                setSelectedReparticao(repName);
                setSelectedSetor(repName);
              } else {
                setSelectedDepartamento("");
                setSelectedReparticao("");
                setSelectedSetor("");
              }
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 disabled:opacity-60 cursor-pointer"
          >
            {direcoesList.map((dir) => {
              const dName = dir.rawTitle || dir.nome;
              return (
                <option key={dName} value={dName}>
                  {dName}
                </option>
              );
            })}
          </select>
        </div>

        {/* Departamento */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
            3. Departamento
          </label>
          <select
            value={selectedDepartamento}
            disabled={!isGlobalAdmin && Boolean(user?.departamento)}
            onChange={(e) => {
              setSelectedDepartamento(e.target.value);
              const depObj = departamentosList.find(d => d.nome === e.target.value);
              const firstRep: any = depObj?.reparticoes[0] || "";
              const repName = typeof firstRep === "string" ? firstRep : (firstRep?.name || "");
              setSelectedReparticao(repName);
              setSelectedSetor(repName);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 disabled:opacity-60 cursor-pointer"
          >
            {departamentosList.length === 0 ? (
              <option value="">Sem departamentos</option>
            ) : (
              departamentosList.map((dep) => (
                <option key={dep.nome} value={dep.nome}>
                  {dep.nome}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Repartição */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
            4. Repartição
          </label>
          <select
            value={selectedReparticao}
            onChange={(e) => {
              setSelectedReparticao(e.target.value);
              setSelectedSetor(e.target.value);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            {reparticoesList.length === 0 ? (
              <option value="">Sem repartições</option>
            ) : (
              reparticoesList.map((rep, idx) => {
                const rName = typeof rep === "string" ? rep : (rep as any).name || "";
                return (
                  <option key={idx} value={rName}>
                    {rName}
                  </option>
                );
              })
            )}
          </select>
        </div>

        {/* Setor */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
            5. Setor Logado
          </label>
          <div className="w-full bg-blue-50/70 border border-blue-200 rounded-xl px-3 py-2 text-xs font-black text-blue-900 truncate">
            {selectedSetor || selectedReparticao || selectedDepartamento || "Geral"}
          </div>
        </div>
      </div>
    </div>
  );
};
