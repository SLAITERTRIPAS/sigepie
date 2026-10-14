import React, { useState, useEffect, useMemo } from "react";
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  Building2, 
  Users, 
  ShieldCheck, 
  Award, 
  BarChart3, 
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";
import { firestoreService } from "../lib/firestoreService";
import { countInstitutionalAdmins } from "../lib/auth";

export interface RelatorioTecnicoModalProps {
  currentUser?: any;
  onClose: () => void;
}

export default function RelatorioTecnicoModal({
  currentUser,
  onClose
}: RelatorioTecnicoModalProps) {
  const [instituicoes, setInstituicoes] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [direcoes, setDirecoes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const unsubInst = firestoreService.instituicoes.subscribe((data) => {
          if (isMounted) setInstituicoes(data || []);
        });
        const unsubUsers = firestoreService.users.subscribe((data) => {
          if (isMounted) setUsersList(data || []);
        });
        const unsubDir = firestoreService.direcoes_organicas.subscribe((data) => {
          if (isMounted) setDirecoes(data || []);
        });

        return () => {
          unsubInst();
          unsubUsers();
          unsubDir();
        };
      } catch (err) {
        console.error("Erro ao carregar dados do relatório técnico:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Compute metrics
  const totalInstituicoes = instituicoes.length;
  const totalUsers = usersList.length;

  const instBreakdown = useMemo(() => {
    return instituicoes.map((inst) => {
      const colaboradores = usersList.filter((u) => u.instituicaoId === inst.id);
      const adminsCount = countInstitutionalAdmins(usersList, inst.id);
      const adminsList = usersList.filter(
        (u) => u.instituicaoId === inst.id && u.activeRoleMode === "admin"
      );

      return {
        ...inst,
        totalColaboradores: colaboradores.length,
        totalAdmins: adminsCount,
        admins: adminsList,
      };
    });
  }, [instituicoes, usersList]);

  // Breakdown by Cargo
  const usersByCargo = useMemo(() => {
    const map: Record<string, number> = {};
    usersList.forEach((u) => {
      const cargo = u.cargo || u.cargoChefia || u.role || "Técnico / Funcionário";
      map[cargo] = (map[cargo] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [usersList]);

  // Breakdown by Função
  const usersByFuncao = useMemo(() => {
    const map: Record<string, number> = {};
    usersList.forEach((u) => {
      const func = u.funcao || u.funcaoPrincipal || "Geral";
      map[func] = (map[func] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [usersList]);

  const handlePrint = () => {
    window.print();
  };

  const currentDateFormatted = new Date().toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 print:max-w-none print:w-full print:h-full print:rounded-none print:shadow-none print:border-none print:static"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between gap-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
              <FileText size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase">
                Administração do Sistema
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                Relatório Técnico do Sistema SIGEP
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Printer size={16} />
              <span>Imprimir Relatório</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50 print:bg-white print:p-0 print:overflow-visible">
          {/* Official Document Letterhead */}
          <div className="text-center space-y-2 border-b-2 border-slate-900 pb-6 flex flex-col items-center">
            {/* SIGEP Logo Badge */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-black tracking-tighter shadow-sm">
                <span className="text-emerald-400 font-extrabold text-base">S</span>
                <span className="text-red-400 font-extrabold text-base">I</span>
                <span className="text-white font-extrabold text-base">G</span>
                <span className="text-amber-400 font-extrabold text-base">E</span>
                <span className="text-blue-300 font-extrabold text-base">P</span>
              </div>
              <span className="text-xs font-black text-slate-900 tracking-widest uppercase">SIGEP 2026</span>
            </div>
            <h1 className="text-xl font-black uppercase text-slate-900 tracking-tight font-serif">
              SISTEMA INTEGRADO DE GESTÃO E ADMINISTRAÇÃO PÚBLICA (SIGEP)
            </h1>
            <h2 className="text-base font-bold uppercase text-blue-900 tracking-widest">
              RELATÓRIO TÉCNICO GLOBAL DE INSTITUIÇÕES E RECURSOS HUMANOS
            </h2>
            <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-blue-600" /> Emissão: {currentDateFormatted}
              </span>
              <span>•</span>
              <span>Emitido por: {currentUser?.nome || currentUser?.email || "Administrador Geral"}</span>
            </div>
          </div>

          {/* KPI Cards Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Building2 size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Instituições Registadas</p>
                <p className="text-2xl font-black text-slate-900">{totalInstituicoes}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total de Colaboradores</p>
                <p className="text-2xl font-black text-slate-900">{totalUsers}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Admins de Instituição</p>
                <p className="text-2xl font-black text-slate-900">
                  {instBreakdown.reduce((acc, curr) => acc + curr.totalAdmins, 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Table: Quantidade de Instituições e Distribuição de Recursos */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-sm tracking-tight flex items-center gap-2">
                <Building2 size={16} className="text-blue-400" />
                1. Mapa de Instituições Registadas e Administradores
              </h3>
              <span className="text-xs font-bold text-slate-400">Total: {totalInstituicoes} Instituição(ões)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider border-b border-slate-200">
                    <th className="p-3 pl-4">Instituição / Sigla</th>
                    <th className="p-3">Província / Província Sede</th>
                    <th className="p-3 text-center">Colaboradores</th>
                    <th className="p-3 text-center">Admins Registados</th>
                    <th className="p-3">Estado / Limite Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {instBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                        Nenhuma instituição cadastrada até ao momento.
                      </td>
                    </tr>
                  ) : (
                    instBreakdown.map((inst, idx) => (
                      <tr key={inst.id || idx} className="hover:bg-slate-50 transition">
                        <td className="p-3 pl-4">
                          <p className="font-black text-slate-900 text-sm">{inst.nome}</p>
                          <p className="text-[10px] text-slate-500 font-bold">Código: {inst.codigo || inst.sigla || "N/A"}</p>
                        </td>
                        <td className="p-3 text-slate-700 font-bold">{inst.provincia || "Geral"}</td>
                        <td className="p-3 text-center font-black text-blue-700 text-sm">{inst.totalColaboradores}</td>
                        <td className="p-3 text-center font-black text-emerald-700 text-sm">{inst.totalAdmins} / 2 (Máx)</td>
                        <td className="p-3">
                          {inst.totalAdmins >= 2 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                              Limite Máximo (2/2)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Vaga Disponível ({inst.totalAdmins}/2)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Breakdown by Cargo and Função */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cargo Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-100 border-b border-slate-200">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Award size={16} className="text-blue-600" />
                  2. Distribuição por Cargo
                </h3>
              </div>
              <div className="p-4 space-y-2">
                {usersByCargo.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Sem utilizadores registados.</p>
                ) : (
                  usersByCargo.map(([cargo, count]) => (
                    <div key={cargo} className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                      <span className="text-xs font-bold text-slate-800">{cargo}</span>
                      <span className="text-xs font-black bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                        {count} utilizador(es)
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Função Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-100 border-b border-slate-200">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <BarChart3 size={16} className="text-emerald-600" />
                  3. Distribuição por Função
                </h3>
              </div>
              <div className="p-4 space-y-2">
                {usersByFuncao.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Sem utilizadores registados.</p>
                ) : (
                  usersByFuncao.map(([funcao, count]) => (
                    <div key={funcao} className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                      <span className="text-xs font-bold text-slate-800">{funcao}</span>
                      <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                        {count} utilizador(es)
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Signatures & Certification */}
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8 text-center text-xs font-bold text-slate-500">
            <div>
              <p className="mb-8">A Administração Geral do Sistema (SIGEP)</p>
              <div className="w-48 border-b border-slate-400 mx-auto"></div>
              <p className="text-[10px] text-slate-400 mt-1 uppercase">Assinatura / Carimbo</p>
            </div>

            <div>
              <p className="mb-8">Controlo de Qualidade & Auditoria Tecnológica</p>
              <div className="w-48 border-b border-slate-400 mx-auto"></div>
              <p className="text-[10px] text-slate-400 mt-1 uppercase">Assinatura / Carimbo</p>
            </div>
          </div>

          {/* Standard Document Footer */}
          <div className="pt-6 border-t-2 border-slate-900 flex justify-between items-center text-[10px] font-bold text-slate-500">
            <div>
              {(() => {
                const now = new Date();
                const hh = String(now.getHours()).padStart(2, "0");
                const mm = String(now.getMinutes()).padStart(2, "0");
                const ss = String(now.getSeconds()).padStart(2, "0");
                const dd = String(now.getDate()).padStart(2, "0");
                const mo = String(now.getMonth() + 1).padStart(2, "0");
                const yy = now.getFullYear();
                return `(${hh}:${mm}:${ss} ${dd}/${mo}/${yy}) RELATÓRIO TÉCNICO GLOBAL DE INSTITUIÇÕES E RECURSOS HUMANOS - (SIGEP/ISPS)`;
              })()}
            </div>
            <div className="uppercase tracking-widest text-[9px] bg-slate-100 px-2 py-0.5 rounded">
              Documento Oficial Certificado
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-white border-t border-slate-100 flex justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition cursor-pointer"
          >
            Fechar Relatório
          </button>
        </div>
      </div>
    </div>
  );
}
