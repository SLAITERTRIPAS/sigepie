import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";

interface WorkflowStep {
  id: string;
  title: string;
  role: string;
  description: string;
  status: "pendente" | "em_analise" | "validado" | "aprovado" | "devolvido";
  responsavel?: string;
  observacoes?: string;
  updatedAt?: string;
}

export const ApprovalWorkflowManager: React.FC = () => {
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: "departamento",
      title: "1. Departamento",
      role: "Chefe de Departamento / Setor",
      description: "Elaboração autónoma do plano de atividades, rubricas e submissão à respetiva Direção.",
      status: "validado",
      responsavel: "Setores e Departamentos Operacionais",
      observacoes: "Planificação departamental inicial submetida com sucesso."
    },
    {
      id: "direcao",
      title: "2. Direção",
      role: "Diretor de Área / Unidade",
      description: "Supervisão, análise de coerência e validação dos planos dos departamentos sob sua alçada.",
      status: "validado",
      responsavel: "Direções Operacionais",
      observacoes: "Planos validados e encaminhados para consolidação."
    },
    {
      id: "planificacao",
      title: "3. Setor da Planificação",
      role: "Repartição / Setor de Planificação",
      description: "Consolidação de todos os planos das direções num único Plano Institucional coerente.",
      status: "validado",
      responsavel: "Setor de Planificação",
      observacoes: "Plano Institucional consolidado sem duplicações."
    },
    {
      id: "dpep",
      title: "4. Chefe DPEP (Transformação em PESOE)",
      role: "Chefe do DPEP",
      description: "Recebe o Plano Institucional consolidado e procede à transformação e organização no formato PESOE.",
      status: "em_analise",
      responsavel: "Chefe do DPEP",
      observacoes: "Em processamento e alinhamento orçamental para PESOE."
    },
    {
      id: "entidade",
      title: "5. Entidade Competente",
      role: "Conselho / Entidade de Aprovação Superior",
      description: "Apreciação final, decisão e aprovação oficial do PESOE do SIGEP.",
      status: "pendente",
      responsavel: "Entidade de Gestão Superior",
      observacoes: "Aguardando subvenção do Chefe DPEP."
    }
  ]);

  const [loading, setLoading] = useState<boolean>(false);
  const [transforming, setTransforming] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [transformSuccess, setTransformSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dpep");
  const [pesoeRecordId, setPesoeRecordId] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkflowState() {
      try {
        const querySnapshot = await getDocs(collection(db, "approval_workflow_state"));
        if (!querySnapshot.empty) {
          const remoteData = querySnapshot.docs[0].data();
          if (remoteData && Array.isArray(remoteData.steps)) {
            setSteps(remoteData.steps);
          }
        }
        const pesoeSnap = await getDocs(collection(db, "pesoe_documents"));
        if (!pesoeSnap.empty) {
          setPesoeRecordId(pesoeSnap.docs[0].id);
        }
      } catch (err) {
        console.warn("Aviso ao carregar estado do workflow:", err);
      }
    }
    loadWorkflowState();
  }, []);

  const handleStatusChange = async (id: string, newStatus: "pendente" | "em_analise" | "validado" | "aprovado" | "devolvido", obs: string) => {
    const updated = steps.map(s => s.id === id ? { ...s, status: newStatus, observacoes: obs, updatedAt: new Date().toISOString() } : s);
    setSteps(updated);

    if (newStatus === "aprovado") {
      try {
        const acquisitionRecord = {
          originStageId: id,
          stageTitle: steps.find(s => s.id === id)?.title || id,
          approvedAt: new Date().toISOString(),
          status: "Aprovado - UGEA Centralizado",
          rastreabilidadeRef: `workflow_stage_${id}_approved`,
          observacoes: obs || "Transferido automaticamente para UGEA_Data após aprovação oficial.",
          items: [
            { tipo: "Bens e Serviços", descricao: "Aquisições e contratações institucionais aprovadas", quantidade: 1 }
          ],
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, "UGEA_Data"), acquisitionRecord);
        console.log("Itens de aquisição transferidos com sucesso para UGEA_Data com rastreabilidade!");
      } catch (err) {
        console.error("Erro ao transferir para UGEA_Data:", err);
      }
    }
  };

  const handleSaveToFirestore = async () => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      await setDoc(doc(db, "approval_workflow_state", "current_workflow"), {
        steps,
        updatedAt: serverTimestamp(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Erro ao salvar workflow no Firestore:", err);
      alert("Erro ao salvar o estado do workflow no Firestore.");
    } finally {
      setLoading(false);
    }
  };

  const handleExecutePesoTransformation = async () => {
    setTransforming(true);
    setTransformSuccess(false);
    try {
      // 1. Criar registo PESOE com rastreabilidade ao Plano Institucional no Firestore
      const pesoeDocRef = await addDoc(collection(db, "pesoe_documents"), {
        titulo: "Plano Económico e Financeiro (PESOE) - SIGEP",
        origem: "Plano Institucional Consolidado",
        convertidoPor: "Chefe do DPEP",
        dataConversao: serverTimestamp(),
        estado: "Elaborado e Vinculado",
        rastreabilidadeRef: "institutional_plan_master_v1",
        observacoes: "Transformação de dados executada com sucesso com rastreabilidade integral.",
      });

      setPesoeRecordId(pesoeDocRef.id);

      // 2. Atualizar estado do passo DPEP
      const updated = steps.map(s => s.id === "dpep" ? { 
        ...s, 
        status: "validado" as const, 
        observacoes: `PESOE gerado com sucesso. ID de Rastreabilidade Firestore: ${pesoeDocRef.id}`,
        updatedAt: new Date().toISOString() 
      } : s);
      setSteps(updated);

      await setDoc(doc(db, "approval_workflow_state", "current_workflow"), {
        steps: updated,
        updatedAt: serverTimestamp(),
      });

      setTransformSuccess(true);
      setTimeout(() => setTransformSuccess(false), 5000);
    } catch (err) {
      console.error("Erro ao executar transformação PESOE:", err);
      alert("Erro ao processar a transformação para PESOE.");
    } finally {
      setTransforming(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050b38] text-white p-6 md:p-10 overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#FFB800_1px,transparent_1px)] [background-size:24px_24px]"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FFB800] rounded-full blur-3xl opacity-5 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-[#FFB800]/20 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-[#FFB800]/20 text-[#FFB800] text-xs font-bold rounded-full uppercase tracking-wider border border-[#FFB800]/30">
                SIGEP Workflow Rigoroso
              </span>
              <span className="text-xs text-slate-400">Transformação PESOE & Rastreabilidade</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Approval Workflow Manager
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Gestão ascendente: Departamento &gt; Direção &gt; Setor da Planificação &gt; Chefe DPEP (Transformação em PESOE com rastreabilidade) &gt; Entidade Competente.
            </p>
          </div>

          <button
            onClick={handleSaveToFirestore}
            disabled={loading}
            className="px-6 py-3 bg-[#FFB800] hover:bg-[#e0a200] text-[#050b38] font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? "A gravar..." : "Salvar Configuração no Firestore"}
          </button>
        </div>

        {saveSuccess && (
          <div className="mb-6 p-4 bg-emerald-900/60 border border-emerald-500/50 rounded-xl text-emerald-200 text-sm flex items-center gap-2">
            <span>✅ Estado do fluxo de aprovação guardado com sucesso no Firestore.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {steps.map((step, idx) => {
            const isSelected = activeTab === step.id;
            let badgeColor = "bg-slate-700 text-slate-300 border-slate-600";
            if (step.status === "validado" || step.status === "aprovado") badgeColor = "bg-emerald-900/80 text-emerald-300 border-emerald-500/50";
            if (step.status === "em_analise") badgeColor = "bg-amber-900/80 text-[#FFB800] border-[#FFB800]/50";
            if (step.status === "devolvido") badgeColor = "bg-rose-900/80 text-rose-300 border-rose-500/50";

            return (
              <div
                key={step.id}
                onClick={() => setActiveTab(step.id)}
                className={`cursor-pointer rounded-2xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#0b144d] border-[#FFB800] shadow-xl shadow-[#FFB800]/10 ring-1 ring-[#FFB800]"
                    : "bg-[#080f3e]/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#FFB800]/5 to-transparent rounded-bl-full pointer-events-none"></div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-mono text-[#FFB800] opacity-80">Passo 0{idx + 1}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${badgeColor}`}>
                      {step.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white mb-1 line-clamp-1">{step.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{step.role}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#FFB800]">
                  <span>Gerir estágio</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>

        {steps.map((step) => {
          if (step.id !== activeTab) return null;
          return (
            <div key={step.id} className="bg-[#080f3e] border border-[#FFB800]/30 rounded-3xl p-6 md:p-8 shadow-2xl relative">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-white/10">
                <div>
                  <span className="text-xs font-bold text-[#FFB800] uppercase tracking-wider">Gestão do Estágio Hierárquico</span>
                  <h2 className="text-2xl font-bold text-white mt-1">{step.title}</h2>
                  <p className="text-slate-300 text-sm mt-1">{step.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Estado Atual:</span>
                  <select
                    value={step.status}
                    onChange={(e) => handleStatusChange(step.id, e.target.value as any, step.observacoes || "")}
                    className="bg-[#050b38] border border-[#FFB800]/50 text-white text-sm font-semibold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#FFB800]"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_analise">Em Análise / Processamento</option>
                    <option value="validado">Validado</option>
                    <option value="aprovado">Aprovado Oficialmente</option>
                    <option value="devolvido">Devolvido para Correção</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-[#FFB800] uppercase mb-2">Responsável Designado</label>
                  <input
                    type="text"
                    value={step.responsavel || ""}
                    onChange={(e) => {
                      const updated = steps.map(s => s.id === step.id ? { ...s, responsavel: e.target.value } : s);
                      setSteps(updated);
                    }}
                    className="w-full bg-[#050b38] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB800]"
                    placeholder="Ex: Chefe do DPEP"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#FFB800] uppercase mb-2">Última Atualização</label>
                  <div className="w-full bg-[#050b38]/60 border border-slate-800 rounded-xl px-4 py-3 text-slate-400 text-sm flex items-center">
                    {step.updatedAt ? new Date(step.updatedAt).toLocaleString() : "Modificação local pendente de gravação"}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-[#FFB800] uppercase mb-2">Parecer Técnico / Observações</label>
                <textarea
                  rows={3}
                  value={step.observacoes || ""}
                  onChange={(e) => {
                    const updated = steps.map(s => s.id === step.id ? { ...s, observacoes: e.target.value } : s);
                    setSteps(updated);
                  }}
                  className="w-full bg-[#050b38] border border-slate-700 rounded-xl p-4 text-white text-sm outline-none focus:border-[#FFB800] resize-none"
                  placeholder="Insira as observações detalhadas..."
                />
              </div>

              {step.id === "dpep" && (
                <div className="p-6 bg-[#FFB800]/10 border border-[#FFB800]/40 rounded-2xl">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                      <h4 className="font-bold text-[#FFB800] text-base flex items-center gap-2">
                        ⚡ Conversão e Transformação em PESOE
                      </h4>
                      <p className="text-xs text-slate-300 mt-1">
                        O Chefe do DPEP converte o Plano Institucional consolidado na estrutura oficial do PESOE (Plano Económico e Financeiro), gravando o documento com rastreabilidade integral no Firestore.
                      </p>
                    </div>

                    <button
                      onClick={handleExecutePesoTransformation}
                      disabled={transforming}
                      className="px-5 py-2.5 bg-[#FFB800] hover:bg-[#e0a200] text-[#050b38] font-bold rounded-xl shadow-md transition-all text-sm flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                    >
                      {transforming ? "A Converter..." : "Executar Transformação PESOE"}
                    </button>
                  </div>

                  {transformSuccess && (
                    <div className="p-3 bg-emerald-900/80 border border-emerald-500 rounded-xl text-emerald-200 text-xs mb-3">
                      ✨ Transformação em PESOE executada com sucesso! Rastreabilidade vinculada no Firestore.
                    </div>
                  )}

                  {pesoeRecordId && (
                    <div className="text-xs text-slate-400 font-mono bg-[#050b38] p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                      <span>🔗 Link de Rastreabilidade Firestore (ID PESOE): <strong className="text-[#FFB800]">{pesoeRecordId}</strong></span>
                      <span className="text-emerald-400 font-sans font-bold">Ativo & Vinculado</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
