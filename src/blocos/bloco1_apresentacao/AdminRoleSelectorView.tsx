import React, { useState } from "react";
import { UserCheck, Building2, ChevronRight, UserCog, Briefcase } from "lucide-react";
import { isChefeUser } from "../../lib/auth";

interface AdminRoleSelectorViewProps {
  user: any;
  onSelectMode: (mode: "admin" | "chefe" | "user") => void;
  onBack?: () => void;
}

export const AdminRoleSelectorView: React.FC<AdminRoleSelectorViewProps> = ({
  user,
  onSelectMode,
  onBack,
}) => {
  const userName = user?.name || user?.nome || "Administrador";
  const instName = user?.instituicaoNome || user?.instituicao || "Sua Instituição";
  const isChefe = isChefeUser(user);

  // Extract clean chefia title
  const getCleanChefiaTitle = () => {
    const cargoChefia = String(user?.cargoChefia || "");
    const clean = cargoChefia
      .split(",")
      .map((s) => s.trim())
      .filter(
        (s) =>
          s &&
          !s.toLowerCase().includes("administrador da instituição") &&
          !s.toLowerCase().includes("administrador de instituição") &&
          !s.toLowerCase().includes("admin da instituição")
      )
      .join(", ");

    if (clean) return clean;
    if (user?.cargo && !user.cargo.toLowerCase().includes("administrador")) return user.cargo;
    return "Chefe de Setor / Repartição";
  };

  const chefiaTitle = getCleanChefiaTitle();
  const [selectedProfile, setSelectedProfile] = useState<"admin" | "chefe" | "user">(isChefe ? "chefe" : "admin");

  return (
    <div className="w-full h-full min-h-[600px] flex-grow flex items-center justify-center p-4 sm:p-8 bg-[#f8fafc]">
      <div className="relative bg-white rounded-[32px] shadow-2xl border border-slate-100 max-w-2xl w-full p-6 sm:p-10 text-center animate-fade-in">
        {/* Top Pill Header */}
        <div className="absolute -top-4.5 left-1/2 -translate-x-1/2 bg-[#222a3d] text-[#FFB800] text-[11px] sm:text-xs font-black tracking-widest px-7 py-2 rounded-full shadow-md border border-[#3b4760] whitespace-nowrap flex items-center gap-2">
          <UserCog size={15} className="text-[#FFB800]" />
          PAINEL DE SELEÇÃO DE ACESSO MULTI-PERFIL
        </div>

        {/* User Welcome Header */}
        <div className="mt-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Olá, <span className="text-blue-900">{userName}</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5 max-w-md mx-auto leading-relaxed">
            Foram detetados múltiplos perfis associados à sua credencial (<strong className="text-slate-800 font-bold">Administrador da Instituição</strong>
            {isChefe ? " e Cargo de Chefia" : ""}).
          </p>
        </div>

        {/* Dropdown Selector for Profiles */}
        <div className="mb-8 bg-blue-50/60 border border-blue-200/80 rounded-3xl p-6 text-left space-y-3">
          <label className="text-xs font-black text-blue-900 uppercase tracking-widest block">
            Selecione o perfil a entrar (Cada perfil corresponde a uma área de atribuição):
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value as any)}
              className="flex-1 bg-white border border-slate-300 text-slate-900 font-bold text-sm rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none shadow-sm cursor-pointer"
            >
              <option value="admin">Administrador da Instituição (Área: Gestão Geral de {instName})</option>
              {isChefe ? (
                <option value="chefe">{chefiaTitle} (Área: Gestão do Setor/Repartição)</option>
              ) : (
                <option value="user">Usuário Normal (Área: Área Alocada de Trabalho)</option>
              )}
            </select>
            <button
              type="button"
              onClick={() => onSelectMode(selectedProfile)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Entrar</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Grid of Choices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 text-left">
          {/* Card 1: Administrador */}
          <div
            onClick={() => onSelectMode("admin")}
            className="group relative bg-gradient-to-b from-blue-50/70 to-indigo-50/40 hover:from-blue-600 hover:to-indigo-700 border-2 border-blue-200 hover:border-blue-600 rounded-3xl p-6 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:scale-[1.02] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 group-hover:bg-white/20 flex items-center justify-center text-white transition-colors shadow-md">
                  <Building2 size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 group-hover:bg-white/20 text-blue-900 group-hover:text-white px-3 py-1 rounded-full transition-colors">
                  Acesso Total
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 group-hover:text-white transition-colors">
                Administrador da Instituição
              </h3>
              <p className="text-xs text-slate-600 group-hover:text-blue-100 mt-2 leading-relaxed transition-colors">
                Navegue e gira o <strong className="group-hover:text-white">{instName}</strong>. Aceda ao painel da instituição, organograma, parametrizações e gestão geral.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-blue-100 group-hover:border-white/20 flex items-center justify-between font-bold text-xs text-blue-700 group-hover:text-white transition-colors">
              <span>Explorar como Administrador</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Chefe or Usuário Normal */}
          {isChefe ? (
            <div
              onClick={() => onSelectMode("chefe")}
              className="group relative bg-gradient-to-b from-amber-50/80 to-amber-100/40 hover:from-amber-600 hover:to-amber-700 border-2 border-amber-300 hover:border-amber-600 rounded-3xl p-6 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:scale-[1.02] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600 group-hover:bg-white/20 flex items-center justify-center text-white transition-colors shadow-md">
                    <Briefcase size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 group-hover:bg-white/20 text-amber-900 group-hover:text-white px-3 py-1 rounded-full transition-colors">
                    Cargo de Chefia
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 group-hover:text-white transition-colors">
                  {chefiaTitle}
                </h3>
                <p className="text-xs text-slate-600 group-hover:text-amber-100 mt-2 leading-relaxed transition-colors">
                  Aceda diretamente à sua área de chefia para gerir o seu setor/repartição, equipa alocada e processos em curso.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-200 group-hover:border-white/20 flex items-center justify-between font-bold text-xs text-amber-900 group-hover:text-white transition-colors">
                <span>Explorar como Chefe</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ) : (
            <div
              onClick={() => onSelectMode("user")}
              className="group relative bg-gradient-to-b from-slate-50 to-gray-50/80 hover:from-slate-800 hover:to-slate-900 border-2 border-slate-200 hover:border-slate-800 rounded-3xl p-6 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:scale-[1.02] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-700 group-hover:bg-white/20 flex items-center justify-center text-white transition-colors shadow-md">
                    <UserCheck size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-200 group-hover:bg-white/20 text-slate-700 group-hover:text-white px-3 py-1 rounded-full transition-colors">
                    Área Alocada
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 group-hover:text-white transition-colors">
                  Usuário Normal
                </h3>
                <p className="text-xs text-slate-600 group-hover:text-slate-300 mt-2 leading-relaxed transition-colors">
                  Aceda diretamente à sua área de trabalho operacional onde foi alocado como colaborador.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 group-hover:border-white/20 flex items-center justify-between font-bold text-xs text-slate-700 group-hover:text-white transition-colors">
                <span>Explorar como Usuário Normal</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors py-1 px-3"
          >
            Voltar
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminRoleSelectorView;
