import React, { useEffect, useState } from "react";
import { planningService } from "../services/planningService";
import { MatrixActivity, PeriodoPlanificacao } from "../types";
import { usePlanoPermissions } from "../hooks/usePlanoPermissions";
import { ActivityTableHeader } from "../components/ActivityTableHeader";

export function PlanningManagementPage({ currentUser }: { currentUser: any }) {
  const [activities, setActivities] = useState<MatrixActivity[]>([]);
  const [periodo, setPeriodo] = useState<PeriodoPlanificacao | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { isDPEP, isAllocated } = usePlanoPermissions(currentUser, "Planificação");

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const acts = await planningService.getActivities(currentUser?.institutionId);
        const per = await planningService.getPlanningPeriod();
        if (mounted) {
          setActivities(acts);
          setPeriodo(per);
        }
      } catch (e) {
        console.error("Erro ao carregar dados de planificação:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [currentUser]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gestão de Planos e Atividades (SIGEP)</h1>
            <p className="text-sm text-slate-600 mt-1">
              Módulo de Planeamento Institucional — Organização por Domínios com Acesso Desacoplado
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isDPEP ? "bg-indigo-100 text-indigo-800" : "bg-emerald-100 text-emerald-800"}`}>
              {isDPEP ? "Perfil DPEP / Gestão Global" : "Perfil Setorial"}
            </span>
            {periodo && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                Ano: {periodo.ano} ({periodo.status})
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="font-semibold text-slate-700">Matriz de Atividades Registadas ({activities.length})</h2>
            <button
              onClick={async () => {
                const acts = await planningService.getActivities(currentUser?.institutionId);
                setActivities(acts);
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Atualizar Dados
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">A carregar atividades do plano...</div>
          ) : activities.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Nenhuma atividade registada no plano atual.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <ActivityTableHeader isDPEP={isDPEP} />
                <tbody>
                  {activities.map((act, idx) => (
                    <tr key={act.id || idx} className="hover:bg-slate-50 text-xs">
                      <td className="p-2 border border-slate-200 text-center no-print">
                        <input type="checkbox" className="rounded border-slate-300" />
                      </td>
                      <td className="p-2 border border-slate-200 text-center font-medium">{idx + 1}</td>
                      <td className="p-2 border border-slate-200 text-center font-mono">{act.numeroDirecao || "-"}</td>
                      <td className="p-2 border border-slate-200">{act.orgao || act.direcao || "-"}</td>
                      <td className="p-2 border border-slate-200">{act.direcao || "-"}</td>
                      <td className="p-2 border border-slate-200">{act.departamento || "-"}</td>
                      {isDPEP && (
                        <>
                          <td className="p-2 border border-slate-200">{act.fonteReceita || "-"}</td>
                          <td className="p-2 border border-slate-200 text-center">{act.prioridade || "-"}</td>
                        </>
                      )}
                      <td className="p-2 border border-slate-200 font-mono text-[11px]">{act.codigoActividade || "-"}</td>
                      <td className="p-2 border border-slate-200 font-medium text-slate-900">{act.titulo || act.nomeActividade || "-"}</td>
                      <td className="p-2 border border-slate-200 text-slate-600">{act.objetivoActividade || act.objetivo || "-"}</td>
                      <td className="p-2 border border-slate-200 text-center">{act.trimestre || act.trimestres?.join(", ") || "-"}</td>
                      <td className="p-2 border border-slate-200 text-center">{act.mesRealizacao || act.mes || "-"}</td>
                      <td className="p-2 border border-slate-200 text-center">{act.trans || "-"}</td>
                      <td className="p-2 border border-slate-200">{act.rubrica || "-"}</td>
                      <td className="p-2 border border-slate-200">{act.necessidade || "-"}</td>
                      <td className="p-2 border border-slate-200 text-right">{act.quantidade || act.qtd || 1}</td>
                      <td className="p-2 border border-slate-200 text-right">{Number(act.precoUnitario || 0).toLocaleString()}</td>
                      <td className="p-2 border border-slate-200 text-right font-semibold">{Number(act.total || act.custoTotal || 0).toLocaleString()}</td>
                      <td className="p-2 border border-slate-200">{act.observacoes || "-"}</td>
                      <td className="p-2 border border-slate-200 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-medium">
                          {act.status || "Pendente"}
                        </span>
                      </td>
                      <td className="p-2 border border-slate-200 text-center no-print">
                        <span className="text-indigo-600 hover:underline cursor-pointer">Ver</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
