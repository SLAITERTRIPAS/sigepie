import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { Calendar, Users, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { EFETIVO_GERAL_DATA } from "../constants/colaboradoresList";

const MESES = [
  { id: 1, nome: "Janeiro" },
  { id: 2, nome: "Fevereiro" },
  { id: 3, nome: "Março" },
  { id: 4, nome: "Abril" },
  { id: 5, nome: "Maio" },
  { id: 6, nome: "Junho" },
  { id: 7, nome: "Julho" },
  { id: 8, nome: "Agosto" },
  { id: 9, nome: "Setembro" },
  { id: 10, nome: "Outubro" },
  { id: 11, nome: "Novembro" },
  { id: 12, nome: "Dezembro" },
];

export const PlanoFeriasRHView: React.FC<{ currentUser?: any; activeInst?: any }> = ({ currentUser, activeInst }) => {
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [planoFeriasMap, setPlanoFeriasMap] = useState<Record<string, number>>({});
  const [dispensas, setDispensas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const currentMonthNum = new Date().getMonth() + 1;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const colabSnap = await getDocs(collection(db, "colaboradores"));
      let list: any[] = [];
      colabSnap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      if (list.length === 0) {
        list = EFETIVO_GERAL_DATA.map((c, idx) => ({ id: `colab_${idx}`, ...c }));
      }
      setColaboradores(list);

      const savedPlano = localStorage.getItem("sigep_plano_ferias_map");
      if (savedPlano) {
        setPlanoFeriasMap(JSON.parse(savedPlano));
      }

      const dispSnap = await getDocs(collection(db, "dispensas"));
      let dispList: any[] = [];
      dispSnap.forEach((doc) => {
        dispList.push({ id: doc.id, ...doc.data() });
      });
      setDispensas(dispList);
    } catch (err) {
      console.error("Erro ao carregar dados do plano de férias:", err);
      setColaboradores(EFETIVO_GERAL_DATA.map((c, idx) => ({ id: `colab_${idx}`, ...c })));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMes = (colabId: string, mesId: number) => {
    const updated = { ...planoFeriasMap, [colabId]: mesId };
    setPlanoFeriasMap(updated);
    localStorage.setItem("sigep_plano_ferias_map", JSON.stringify(updated));
    setSuccessMsg("Mês de férias atualizado com sucesso no plano institucional!");
    setTimeout(() => setSuccessMsg(""), 4000);

    if (mesId === currentMonthNum) {
      triggerAutomaticHolidayRequest(colabId, mesId);
    }
  };

  const triggerAutomaticHolidayRequest = async (colabId: string, mesId: number) => {
    try {
      const colab = colaboradores.find((c) => c.id === colabId);
      if (!colab) return;

      const payload = {
        requerenteNome: colab.nome || colab.name || "Colaborador",
        afectacao: colab.departamento || colab.setor || "Repartição de Pessoal",
        carreiraCategoria: colab.carreira || colab.cargo || "Técnico Superior",
        anoFerias: new Date().getFullYear().toString(),
        totalDias: "30",
        mesPlaneado: mesId,
        autoGeradoPorPlano: true,
        status: "Submetido Automaticamente por Atingir o Mês do Plano",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "vacation_requests"), payload);
    } catch (e) {
      console.error("Erro ao gerar pedido automático de férias:", e);
    }
  };

  const calcularDescontoDispensas = (colabNome: string) => {
    const colabDispensas = dispensas.filter((d) => d.requerente === colabNome || d.nome === colabNome);
    let diasInjustificadosTotal = 0;
    let diasJustificadosTotal = 0;

    colabDispensas.forEach((d) => {
      const dias = Number(d.dias || d.numeroDias || 1);
      if (d.justificada || d.temJustificacao) {
        diasJustificadosTotal += dias;
      } else {
        diasInjustificadosTotal += dias;
      }
    });

    return {
      diasJustificadosTotal,
      diasInjustificadosTotal,
      descontoFérias: diasInjustificadosTotal,
    };
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" /> Repartição de Pessoal — SIGEP
            </div>
            <h1 className="text-2xl font-black text-slate-900">Plano Anual de Férias e Gestão de Dispensas</h1>
            <p className="text-sm text-slate-600 mt-1">
              Matriz oficial de marcação de férias (marcado a vermelho no mês pretendido) e controlo de dispensas (máx. 3 dias/mês; sem justificação desconta nas férias).
            </p>
          </div>
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> {successMsg}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Limite de Dispensas</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cada colaborador tem direito a um <strong>máximo de 3 dias de dispensas por mês</strong>, sujeitos a validação prévia pelo superior hierárquico e Recursos Humanos.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Dispensas Justificadas</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Todas as dispensas com <strong>justificação válida</strong> (médica, oficial ou institucional) <strong>não são descontadas nas férias</strong> anuais do colaborador.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Dispensas Não Justificadas</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              As dispensas <strong>sem justificação</strong> são obrigatoriamente <strong>descontadas no saldo de férias</strong> anuais do funcionário no momento da submissão do requerimento.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Plano de Férias Institucional — Matriz Anual (Cor Vermelha para Mês Selecionado)</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Total de Colaboradores: {colaboradores.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-xs uppercase font-extrabold border-b border-slate-200">
                  <th className="p-4">Colaborador / Categoria</th>
                  <th className="p-4">Setor / Afetação</th>
                  {MESES.map((m) => (
                    <th key={m.id} className="p-3 text-center w-20">{m.nome}</th>
                  ))}
                  <th className="p-4 text-center">Desconto Dispensas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {colaboradores.slice(0, 25).map((colab, idx) => {
                  const nome = colab.nome || colab.name || `Funcionário ${idx + 1}`;
                  const cargo = colab.cargo || colab.carreira || "Técnico";
                  const setor = colab.departamento || colab.setor || "Geral";
                  const selectedMes = planoFeriasMap[colab.id || colab.email];
                  const { diasInjustificadosTotal } = calcularDescontoDispensas(nome);

                  return (
                    <tr key={colab.id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{nome}</div>
                        <div className="text-[10px] text-slate-500">{cargo}</div>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{setor}</td>
                      {MESES.map((m) => {
                        const isSelected = selectedMes === m.id;
                        return (
                          <td key={m.id} className="p-2 text-center">
                            <button
                              onClick={() => handleSelectMes(colab.id || colab.email, m.id)}
                              title={`Selecionar ${m.nome} para férias de ${nome}`}
                              className={`w-9 h-9 rounded-xl font-bold transition-all flex items-center justify-center mx-auto text-xs ${
                                isSelected
                                  ? "bg-red-600 text-white shadow-md scale-105 ring-2 ring-red-300"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {isSelected ? "✓" : m.id}
                            </button>
                          </td>
                        );
                      })}
                      <td className="p-4 text-center font-bold">
                        {diasInjustificadosTotal > 0 ? (
                          <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-lg border border-red-200">
                            -{diasInjustificadosTotal} dias
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">0 dias</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Nota: Os meses selecionados ficam marcados a vermelho. Quando o mês atual coincidir com o mês selecionado, o sistema gera automaticamente o pedido de férias do colaborador.</span>
            <span className="font-semibold text-slate-700">SIGEP — Módulo de Recursos Humanos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanoFeriasRHView;
